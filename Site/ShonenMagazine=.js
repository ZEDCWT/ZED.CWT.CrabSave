'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC} = WW,

ShonenMagazinePocket = 'https://pocket.shonenmagazine.com/',
ShonenMagazinePocketEpisodeJSON = WW.Tmpl(ShonenMagazinePocket,'episode/',undefined,'.json'),
ShonenMagazinePocketSeriesRSS = WW.Tmpl(ShonenMagazinePocket,'rss/series/',undefined);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	return {
		URL : (ID,Ext) => Ext.ReqB(O.Coke(ShonenMagazinePocketEpisodeJSON(ID))).FMap(Episode =>
			Ext.ReqB(O.Coke(ShonenMagazinePocketSeriesRSS((Episode = WC.JTO(Episode).readableProduct).series.id)))
			.Map(Series =>
			{
				var
				R;
				WW.MR(function(_,V)
				{
					if (WW.MF(/episode\/(\d+)/,V) === ID) R =
					{
						UP : WC.HED(WW.MF(/author>([^<]+)/,V)),
						Cover : WC.HED(WW.MF(/ url="([^"]+)/,V)),
					}
				},null,/<item>[^]+?<\/item>/g,Series)
				R || WW.Throw('Unable to obtain series infomation')
				return {
					Title : Episode.series.title + `.${Episode.number}.` + Episode.title,
					Date : +new Date(Episode.publishedAt),
					...R,
					Part : [
					{
						URL : WR.MapW(V => V.src,Episode.pageStructure?.pages || []),
						Ext : '.jpg'
					}]
				}
			}))
	}
}