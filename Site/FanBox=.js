'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC} = WW,

FanBox = 'https://www.fanbox.cc/',
FanBoxUserPost = WW.Tmpl(FanBox,'@',undefined,'/posts/',undefined),
FanBoxAPI = 'https://api.fanbox.cc/',
FanBoxAPIPostInfo = WW.Tmpl(FanBoxAPI,'post.info?postId=',undefined);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	API = (Ext,Q) => Ext.ReqB(O.Coke(
	{
		URL : Q,
		Head : {Origin : FanBoxAPI.slice(0,-1)}
	})).Map(B => WC.JTO(B).body)
	return {
		URL : (ID,Ext) => API(Ext,FanBoxAPIPostInfo(ID)).Map(B =>
		{
			var
			Meta = [],
			Part = [],
			URL = [],Ext = [],
			Content = B.body;

			if (Content) switch (B.type)
			{
				case 'article' :
					Content.blocks.forEach(V =>
					{
						switch (V.type)
						{
							case 'embed' :
								V = Content.embedMap[V.embedId]
								Meta.push('<Link> ' + V.serviceProvider + ' ' + V.contentId)
								break
							case 'file' :
								V = Content.fileMap[V.fileId]
								Meta.push('<File> ' + V.name)
								Part.push(
								{
									Title : V.name,
									URL : [V.url],
									Ext : '.' + V.extension,
								})
								break
							case 'header' :
								Meta.push(`#### ${V.text} ####`)
								break
							case 'image' :
								V = Content.imageMap[V.imageId]
								Meta.push('<Img> ' + V.originalUrl)
								URL.push(V.originalUrl)
								Ext.push('.' + V.extension)
								break
							case 'p' :
								Meta.push(V.text)
								break
							case 'url_embed' :
								V = Content.urlEmbedMap[V.urlEmbedId]
								switch (V.type)
								{
									case 'fanbox.post' :
										V = WW.Quo(V.postInfo.title) +
											FanBoxUserPost('owo',V.postInfo.id)
										break
									default :
										V = V.html
								}
								Meta.push('<URL> ' + V)
								break
							default :
								WW.Throw('Unknown Article Block Type #' + V.type)
						}
					})
					break
				case 'file' :
					Meta.push(Content.text)
					Content.files.forEach(V => Part.push(
					{
						Title : V.name,
						URL : [V.url],
						Ext : '.' + V.extension,
					}))
					break
				case 'image' :
					Meta.push(Content.text)
					Content.images.forEach(V =>
					{
						URL.push(V.originalUrl)
						Ext.push('.' + V.extension)
					})
					break
				case 'text' :
					Meta.push(Content.text)
					break
				case 'video' :
					Meta.push(
						Content.text,
						'<Video> ' + WR.Pascal(Content.video.serviceProvider) + ' ' + Content.video.videoId)
					break
				default :
					WW.Throw('Unknown Post Type #' + B.type)
			}
			URL.length && Part.push({URL,Ext})

			return {
				Title : B.title,
				UP : B.user.name,
				Date : +new Date(B.publishedDatetime),
				Meta,
				Cover : B.coverImageUrl,
				Part,
			}
		}),
		Range : false,
		Pack : O.Coke,
	}
}