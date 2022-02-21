'use strict'
var
WW = require('@zed.cwt/wish'),
{C : WC} = WW,

JoinID = '+',

KakuYomu = 'https://kakuyomu.jp/',
KakuYomuAPI = KakuYomu + 'api/',
KakuYomuAPIWork = WW.Tmpl(KakuYomuAPI,'app/works/',undefined),
KakuYomuAPIEpisode = WW.Tmpl(KakuYomuAPI,'app/works/',undefined,'/episodes/',undefined,'.html');

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	SolveID = ID =>
	{
		ID = ID.split(/(\D)/)
		return [ID[0],JoinID === ID[1] ? WW.Nat(ID[0]).Add(ID[2]).DEC() : ID[2]]
	};
	return {
		URL : (ID,Ext) =>
		{
			ID = SolveID(ID)
			return Ext.ReqB(O.Req(KakuYomuAPIEpisode(...ID))).FMap(Episode =>
				Ext.ReqB(O.Req(KakuYomuAPIWork(ID[0]))).Map(Work =>
				{
					var
					EpisodeMeta = (Work = WC.JTO(Work))
						.episodes.find(V => V.id === ID[1]);
					return {
						Title : Work.title + '.' + EpisodeMeta.title,
						Up : Work.author.activity_name,
						Date : 1E3 * EpisodeMeta.published_at,
						Meta : WW.MR((D,V) => D.push(O.Text(V[1])) && D,
							[],/id="p\d+"[^>]*>([^]+?)<\/p>/g,Episode),
						Cover : Work.cover_image_url,
						Part : [],
					}
				}))
		},
	}
}