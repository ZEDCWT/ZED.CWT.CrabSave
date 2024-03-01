'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC,N : WN} = WW,

DIDPrefix = 'did:plc:',

BSkyApp = 'https://bsky.app/',
BSkyAppProfile = BSkyApp + 'profile/',
BSkyAppProfilePost = WW.Tmpl(BSkyAppProfile,undefined,'/post/',undefined),
BSkySocial = 'https://bsky.social/',
BSkySocialRPC = BSkySocial + 'xrpc/',
BSkyMethodPost = 'app.bsky.feed.getPostThread';

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	PadDID = Q => Q.replace(/^(?!did:)/,DIDPrefix),
	MakePostURI = Q =>
	(
		Q = WW.IsArr(Q) ? Q : Q.split('/'),
		'at://' + PadDID(Q[0]) + '/app.bsky.feed.post/' + Q[1]
	),
	Common = B =>
	{
		B = WC.JTO(B)
		B.error && O.Bad(B)
		return B
	};

	return {
		URL : (ID,Ext) =>
		{
			var
			Req = Q =>
			{
				var
				Coke = O.CokeRaw().split`\n`,
				PadAuth = (Q,S) =>
				{
					Q = WW.N.ReqOH(Q,'Authorization',S.replace(/^(?!\w+ )/,'Bearer '),true)
					Q.URL = Q.URL.replace(/^(?!\w+:\/\/)/,BSkySocialRPC)
					return O.Req(Q)
				};
				return Ext.ReqB(PadAuth(Q,Coke[1])).Map(Common)
			};
			return Req({URL : BSkyMethodPost,QS : {uri : MakePostURI(ID)}}).Map(B =>
			{
				var
				Prelude = [],
				Info = {},Meta = [],
				Reply = [],
				SolvePost = (B,Meta,Prefix,Info) =>
				{
					var
					TopPost = B.post,
					TopParent = B.parent,
					PostRecord,
					PostEmbed,
					Title,
					PostID,
					Part = [],
					PartURL,PartExt,
					T;

					switch (B.$type)
					{
						case 'app.bsky.feed.defs#threadViewPost' : break
						case 'app.bsky.feed.defs#notFoundPost' :
							Meta.length && Meta.push('')
							Meta.push(Prefix + '{NotFound} ' + B.uri)
							return
						default : O.Bad(B)
					}

					PostRecord = TopPost.record,
					PostEmbed = TopPost.embed,
					Title = PostRecord.text,
					PostID = WW.MF(/\/([^/]+)$/,TopPost.uri),

					TopParent && SolvePost(TopParent,Info ? Prelude : Meta,Prefix)

					Meta.length && Meta.push('')
					Meta.push
					(
						Prefix + BSkyAppProfilePost(TopPost.author.handle,PostID),
						Prefix + WW.StrDate(PostRecord.createdAt) + ' ' + TopPost.author.displayName,
						Title.replace(/^(?![\r\n])/mg,Prefix)
					)
					if (Info)
					{
						if (PostEmbed) switch (PostEmbed.$type)
						{
							case 'app.bsky.embed.images#view' :
								PartURL = []
								PartExt = []
								WR.Each(V =>
								{
									PartURL.push(V = V.fullsize)
									PartExt.push(WN.ExtN(V.replace(/@(?=\w+$)/,'.')))
								},PostEmbed.images)

								WR.Any(V => V.alt,PostEmbed.images) ?
									WR.EachU((V,F) =>
									{
										Part.push(
										{
											Title : V.alt,
											URL : [PartURL[F]],
											Ext : PartExt[F],
										})
									},PostEmbed.images) :
									Part.push(
									{
										URL : PartURL,
										Ext : PartExt,
									})
								break
							case 'app.bsky.embed.external#view' :
								T = PostEmbed.external
								Meta.push
								(
									'',
									T.uri,
									T.title,
									T.description
								)
								Part.push({URL : [T.thumb],Ext : '.jpg'})
								break
							default :
								WW.Throw('Unknown Embed ' + PostEmbed.$type)
						}
						Info.Title = Title
						Info.UP = TopPost.author.displayName,
						Info.Date = PostRecord.createdAt
						Info.Part = Part
					}

					WR.Each(V => SolvePost(V,Info ? Reply : Meta,Info ? Prefix : Prefix + '	'),B.replies)
				};
				SolvePost(B.thread,Meta,'',Info)
				Info.Meta = O.MetaJoin
				(
					Prelude,
					Meta,
					Reply,
				)
				return Info
			})
		},
		Range : false,
	}
}