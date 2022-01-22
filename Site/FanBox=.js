'use strict'
var
WW = require('@zed.cwt/wish'),
{C : WC} = WW,

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

			switch (B.type)
			{
				case 'article' :
					Content.blocks.forEach(V =>
					{
						switch (V.type)
						{
							case 'p' :
								Meta.push(V.text)
								break
							case 'image' :
								V = Content.imageMap[V.imageId]
								Meta.push('<img> ' + V.originalUrl)
								URL.push(V.originalUrl)
								Ext.push('.' + V.extension)
								break
							case 'file' :
								V = Content.fileMap[V.fileId]
								Meta.push('<file> ' + V.name)
								Part.push(
								{
									Title : V.name,
									URL : [V.url],
									Ext : '.' + V.extension,
								})
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
				default :
					WW.Throw('Unknown Post Type #' + B.type)
			}
			URL.length && Part.push({URL,Ext})

			return {
				Title : B.title,
				Up : B.user.name,
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