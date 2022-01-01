'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

WeiBo = 'https://weibo.com/';

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	return {
		URL : ID => WN.ReqB(O.Coke(WeiBo + ID)).FMap(B =>
		{
			var
			RegExpIsM3U = /\.m3u8?(\?.*)?$/,
			URL,
			T;
			B = WC.JTO(WW.MU(/{"ns":"pl.content.weiboDetail.*}/,B)).html
			B || O.Bad('Unable to resolve infomation')
			B = B.replace(/"WB_feed_expand">[^]+/,'')
			if (T = WW.MF(/WB_video_mini.*sources="([^"]+)/,B))
			{
				URL = WR.Ent(WC.QSP(T)).filter(V => !/\D/.test(V[0]) && V[1]).sort((Q,S) => S[0] - Q[0])
				URL[0] && URL[0][1] || O.Bad(URL)
				URL = URL[0][1]
			}
			else if (T = WW.MF(/WB_video_mini.*action-data="([^"]+)/,B))
			{
				URL = WC.QSP(T).live_src
				URL || O.Bad(T)
				URL = O.M3U(URL)
			}
			else if (T = WW.MF(/WB_video .*action-data="([^"]+)/,B))
			{
				URL = WC.QSP(T).url
				URL || O.Bad(T)
				URL = WN.ReqB(O.Coke(URL))
					.FMap(B => WN.ReqB(O.Coke(WN.JoinU(WeiBo,WW.MF(/<iframe[^>]+src="([^"]+)/,B)))))
					.FMap(B => O.M3U(WC.JTO(WW.MF(/play_url:(".*")/,B))))
			}
			else if (T = WW.MF(/li_story.*?action-data="([^"]+)/,B))
				URL = WC.QSP(T).gif_ourl
			else O.Bad('Contains no media')
			return (WW.IsStr(URL) ?
				RegExpIsM3U.test(URL) ? O.M3U(URL) : WX.Just([URL]) :
				URL).Map(URL => (
			{
				Title : WR.Trim(WC.HED(WW.MU(/<[^>]+WB_text[^]+?<\/div>/,B)
					.replace(/<a[^>]+ignore=.*?<\/a>/g,'')
					.replace(/<br>/g,'\n')
					.replace(/<.*?>/g,''))),
				Up : WC.HED(WW.MF(/face".*title="([^"]+)/,B)),
				Date : +WW.MF(/date="(\d+)/,B),
				Part : [WW.IsArr(URL) ? {URL} : URL]
			}))
		})
	}
}