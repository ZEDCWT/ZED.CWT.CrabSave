'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

PrefixSketch = 'S',

Pixiv = 'https://www.pixiv.net/',
PixivAJAX = Pixiv + 'ajax/',
PixivAJAXIllust = WW.Tmpl(PixivAJAX,'illust/',undefined),
PixivAJAXUgoiraMeta = WW.Tmpl(PixivAJAX,'illust/',undefined,'/ugoira_meta'),
PixivAJAXUserIllust = WW.Tmpl(PixivAJAX,'user/',undefined,'/profile/illusts?work_category=illustManga&is_first_page=0'),
PixivSketch = 'https://sketch.pixiv.net/',
PixivSketchAPI = PixivSketch + 'api/',
PixivSketchAPIReply = WW.Tmpl(PixivSketchAPI,'replies/',undefined,'.json');

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	Common = B =>
	{
		B = WC.JTO(B)
		B.error && O.Bad(B.message)
		return B.body
	},
	CommonSketch = function(B)
	{
		B = WC.JTO(B)
		B.error && B.error.length && O.Bad(B.error)
		return B.data
	};

	return {
		URL : (Q,Ext) =>
		{
			var
			Prefix,ID;
			ID = /^([A-Z]+)(\d+)$/i.exec(Q)
			if (ID)
			{
				Prefix = ID[1]
				ID = ID[2]
			}
			else ID = Q

			if (PrefixSketch === Prefix) return Ext.ReqB(O.Coke(PixivSketchAPIReply(ID))).Map(B =>
			{
				var
				U = [],E = [];
				B = CommonSketch(B).item
				B.media.forEach(V =>
				{
					var R;
					switch (V.type)
					{
						case 'photo' :
							U.push(V.photo.original.url2x)
							E.push(null)
							break
						default :
							WW.Throw('Unknown Sketch Media Type #' + V.type)
					}
					return R
				})
				return {
					Title : B.text,
					UP : B.user.name,
					Date : +new Date(B.published_at),
					Meta : B.text_fragments.map(V =>
					{
						var R;
						switch (V.type)
						{
							case 'plain' :
								R = V.body
								break
							case 'tag' :
								R = '	<Tag> ' + V.body
								break
							default :
								WW.Throw('Unknown Sketch Text Type #' + V.type)
						}
						return R
					}),
					Part : [{URL : U,Ext : E}]
				}
			})

			if (Prefix) return WX.Throw('Unexpected Prefix ' + Prefix)

			return Ext.ReqB(O.Coke(PixivAJAXIllust(ID))).FMap(Illust =>
			{
				var
				R;
				Illust = Common(Illust)
				switch (Illust.illustType)
				{
					case 0 :
					case 1 : // 59408913
						R = WX.Just(
						{
							Part : [
							{
								URL : WR.Times(P => Illust.urls.original.replace(/(?<=_p)0(?=\.\w+$)/,P),
									Illust.pageCount)
							}],
						})
						break
					case 2 :
						R = Ext.ReqB(O.Coke(PixivAJAXUgoiraMeta(ID))).Map(B => (
						{
							Cover : Illust.urls.original,
							Part : [{URL : [Common(B).originalSrc]}],
						}))
						break
					default :
						WW.Throw('Unknown Illust Type #' + Illust.illustType)
				}
				// Weird that Illust.createDate has no seconds infomation...
				return Ext.ReqB(O.Coke(
				{
					URL : PixivAJAXUserIllust(Illust.userId),
					QS : {ids : [ID]}
				})).FMap(Brief => R.Map(R => (
				{
					Title : Illust.title,
					UP : Illust.userName,
					Date : +new Date(+WW.MF(/\d\d:\d\d:(\d\d)/,Illust.createDate) ?
						Illust.createDate :
						Common(Brief).works[ID].createDate),
					Meta : O.Text(Illust.description),
					...R
				})))
			})
		},
		Pack : Q => WN.ReqOH(Q,'Referer',Pixiv),
		Range : false,
	}
}