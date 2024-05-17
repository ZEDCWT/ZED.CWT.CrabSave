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
	},
	SolveRichText = (RawText,Facet) =>
	{
		var
		Text = '',
		Pos = 0;

		if (!Facet?.length)
			return RawText

		RawText = WC.U16P(RawText)
		Facet.sort((Q,S) => Q.index.byteStart - S.index.byteStart)
		WR.Each(V =>
		{
			var
			IndexStart = V.index.byteStart,
			IndexEnd = V.index.byteEnd,
			SingleText;
			V = V.features[0]
			if (Pos < IndexStart)
			{
				Text += WC.U16S(WC.Slice(RawText,Pos,IndexStart))
				Pos = IndexStart
			}
			if (Pos === IndexStart)
			{
				SingleText = WC.U16S(WC.Slice(RawText,IndexStart,IndexEnd))
				switch (V.$type)
				{
					case 'app.bsky.richtext.facet#link' :
						SingleText = V.uri
						break
					// case 'app.bsky.richtext.facet#mention' :
					// case 'app.bsky.richtext.facet#tag' :
				}
				if (SingleText)
					Text += SingleText
				Pos = IndexEnd
			}
		},Facet)
		if (Pos < RawText.length)
			Text += WC.U16S(WC.Slice(RawText,Pos))
		return Text
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

					if (TopPost.notFound)
					{
						Meta.length && Meta.push('')
						Meta.push(Prefix + '{NotFound} ' + TopPost.uri)
						return
					}

					PostRecord = TopPost.record || TopPost.value
					PostEmbed = TopPost.embed ?
						[TopPost.embed] :
						TopPost.embeds
					Title = SolveRichText(PostRecord.text,PostRecord.facets)
					PostID = WW.MF(/\/([^/]+)$/,TopPost.uri)

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
						WR.Each(Embed =>
						{
							var Record;
							switch (Embed.$type)
							{
								case 'app.bsky.embed.external#view' :
									T = Embed.external
									Meta.push
									(
										'',
										T.uri,
										T.title,
										T.description
									)
									T.thumb && Part.push({URL : [T.thumb],Ext : '.jpg'})
									break
								case 'app.bsky.embed.images#view' :
									PartURL = []
									PartExt = []
									WR.Each(V =>
									{
										PartURL.push(V = V.fullsize)
										PartExt.push(WN.ExtN(V.replace(/@(?=\w+$)/,'.')))
									},Embed.images)

									WR.Any(V => V.alt,Embed.images) ?
										WR.EachU((V,F) =>
										{
											Part.push(
											{
												Title : V.alt,
												URL : [PartURL[F]],
												Ext : PartExt[F],
											})
										},Embed.images) :
										Part.push(
										{
											URL : PartURL,
											Ext : PartExt,
										})
									break
								case 'app.bsky.embed.record#view' :
									Record = Embed.record
									switch (Record.$type)
									{
										case 'app.bsky.embed.record#viewNotFound' :
										case 'app.bsky.embed.record#viewRecord' :
											SolvePost(
											{
												$type : 'app.bsky.feed.defs#threadViewPost',
												post : Embed.record,
											},Info ? Prelude : Meta,Prefix)
											break
										case 'app.bsky.feed.defs#generatorView' :
											break
										default :
											WW.Throw('Unknown Record Type ' + Record.$type)
									}
									break
								default :
									WW.Throw('Unknown Embed ' + Embed.$type)
							}
						},PostEmbed)
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