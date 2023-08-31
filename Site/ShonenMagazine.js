'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	ShonenMagazinePocket = 'https://pocket.shonenmagazine.com/',
	ShonenMagazinePocketEpisode = WW.Tmpl(ShonenMagazinePocket,'episode/',undefined),
	ShonenMagazinePocketEpisodeJSON = WW.Tmpl(ShonenMagazinePocket,'episode/',undefined,'.json'),
	// ShonenMagazinePocketAPIProduct = WW.Tmpl(ShonenMagazinePocket,'api/viewer/readable_products?aggregate_id=',undefined,'&number_since=',undefined,'&number_until=',undefined,'&read_more_num=150&type=episode'),
	// ShonenMagazinePocketSeriesAtom = WW.Tmpl(ShonenMagazinePocket,'atom/series/',undefined),
	ShonenMagazinePocketSeriesRSS = WW.Tmpl(ShonenMagazinePocket,'rss/series/',undefined),

	SolveSeriesList = function(ID)
	{
		return O.API(ShonenMagazinePocketSeriesRSS(ID)).Map(function(B)
		{
			return WW.MR(function(D,V)
			{
				D.push(
				{
					ID : WW.MF(/episode\/(\d+)/,V),
					Title : WC.HED(WW.MF(/title>([^<]+)/,V)),
					Img : WC.HED(WW.MF(/ url="([^"]+)/,V)),
					Date : WW.MF(/pubDate>([^<]+)/,V),
					UP : WC.HED(WW.MF(/author>([^<]+)/,V)),
					More : O.Ah(WC.HED(WW.MF(/description>([^<]+)/,V)),ShonenMagazinePocketSeriesRSS(ID))
				})
				return D
			},[],/<item>[^]+?<\/item>/g,B)
		})
	};

	return {
		ID : 'ShonenMagazine',
		Name : '\u30DE\u30AC\u30DD\u30B1',
		Alias : 'SM',
		Judge : /\bShonenMagazine\b/i,
		Map : [
		{
			Name : 'Series',
			Judge : O.Num('Series'),
			JudgeVal : O.ValNum,
			View : O.Less(SolveSeriesList)
		},{
			Name : 'Episode',
			Judge : O.Num('Episode'),
			JudgeVal : O.ValNum,
			View : function(ID)
			{
				return O.API(ShonenMagazinePocketEpisodeJSON(ID)).FMap(function(Episode)
				{
					Episode = WC.JTO(Episode).readableProduct
					return SolveSeriesList(Episode.series.id).Map(function(Series)
					{
						Series = WR.Find(WR.PropEq('ID',ID),Series)
						return {
							Item : [
							{
								NonAV : !Episode.isPublic,
								ID : ID,
								Title : Episode.title,
								Img : Series && Series.Img,
								UP : Series && Series.UP,
								Date : Episode.publishedAt,
								More :
								[
									O.Ah(Episode.series.title,ShonenMagazinePocketSeriesRSS(Episode.series.id)),
									Episode.isPublic ? 'Public' : 'NonPublic'
								]
							}]
						}
					})
				})
			}
		}],
		IDURL : ShonenMagazinePocketEpisode
	}
})