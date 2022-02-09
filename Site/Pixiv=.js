'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

Pixiv = 'https://www.pixiv.net/',
PixivAJAX = Pixiv + 'ajax/',
PixivAJAXIllust = WW.Tmpl(PixivAJAX,'illust/',undefined),
PixivAJAXUgoiraMeta = WW.Tmpl(PixivAJAX,'illust/',undefined,'/ugoira_meta');

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	Common = B =>
	{
		B = WC.JTO(B)
		B.error && O.Bad(B.message)
		return B.body
	};

	return {
		URL : (ID,Ext) => Ext.ReqB(O.Coke(PixivAJAXIllust(ID))).FMap(Illust =>
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
			return R.Map(R => (
			{
				Title : Illust.title,
				Up : Illust.userName,
				Date : +new Date(Illust.createDate),
				Meta : WC.HED(Illust.description
					.replace(/<br[^>]*>/g,'\n')),
				...R
			}))
		}),
		Pack : Q => WN.ReqOH(Q,'Referer',Pixiv),
		Range : false,
	}
}