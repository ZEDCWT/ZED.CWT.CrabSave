'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC,N : WN} = WW,

WeiBo = 'https://weibo.com/';

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	return {
		URL : ID => WN.ReqB(O.Coke(WeiBo + ID)).Map(B =>
		{
			var T;
			B = WC.JTO(WW.MU(/{"ns":"pl.content.weiboDetail.*}/,B)).html
			B || O.Bad('Unable to resolve infomation')
			B = B.replace(/"WB_feed_expand">[^]+/,'')
			if (T = WW.MF(/WB_video_mini.*sources="([^"]+)/,B))
			{
				URL = WR.Ent(WC.QSP(T)).filter(V => !/\D/.test(V[0]) && V[1]).sort((Q,S) => S[0] - Q[0])
				URL[0] && URL[0][1] || O.Bad(URL)
				URL = URL[0][1]
			}
			else if (T = WW.MF(/li_story.*?action-data="([^"]+)/,B))
				URL = WC.QSP(T).gif_ourl
			else O.Bad('Contains no media')
			return {
				Title : WR.Trim(WC.HED(WW.MU(/<[^>]+WB_text[^]+?<\/div>/,B)
					.replace(/<a[^>]+ignore=.*?<\/a>/g,'')
					.replace(/<br>/g,'\n')
					.replace(/<.*?>/g,''))),
				Up : WC.HED(WW.MF(/face".*title="([^"]+)/,B)),
				Date : +WW.MF(/date="(\d+)/,B),
				Part : [
				{
					URL : [URL],
					Ext : '.mp4' // Pretty lazy here...
				}]
			}
		})
	}
}