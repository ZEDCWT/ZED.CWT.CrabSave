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
			return Req({URL : BSkyMethodPost,QS : {uri : MakePostURI(ID)}}).FMap(B =>
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
					PartAddImage = Q =>
					{
						var URL = [],Ext = [];
						WR.Each(V =>
						{
							URL.push(V = V.fullsize)
							Ext.push(WN.ExtN(V.replace(/@(?=\w+$)/,'.')))
						},Q)
						WR.Any(V => V.alt,Q) ?
							WR.EachU((V,F) =>
							{
								Part.push(
								{
									Title : V.alt,
									URL : [URL[F]],
									Ext : Ext[F],
								})
							},Q) :
							Part.push({URL,Ext})
					},
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
									PartAddImage(Embed.images)
									break
								case 'app.bsky.embed.record#view' :
								case 'app.bsky.embed.recordWithMedia#view' :
									Embed.media && PartAddImage(Embed.media.images)
									Record = Embed.record
									Record = Record.$type ? Record : Record.record
									switch (Record.$type)
									{
										case 'app.bsky.embed.record#viewNotFound' :
										case 'app.bsky.embed.record#viewRecord' :
											SolvePost(
											{
												$type : 'app.bsky.feed.defs#threadViewPost',
												post : Record,
											},Info ? Prelude : Meta,Prefix)
											break
										case 'app.bsky.feed.defs#generatorView' :
											break
										default :
											WW.Throw('Unknown Record Type ' + Record.$type)
									}
									break
								case 'app.bsky.embed.video#view' :
									Info.Cover = Embed.thumbnail
									Part.push({URL : [Embed.playlist]})
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
				return O.Part(Info.Part,Ext).Map(Part => (
				{
					...Info,
					Part,
				}))
			})
		},
		Range : false,
	}
}