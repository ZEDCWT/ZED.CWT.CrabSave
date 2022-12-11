'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW;

/**@type {CrabSaveNS.SiteAll}*/
module.exports = Option =>
{
	var
	All = [],
	Map = {},

	Best = (S,Q) => WR.Reduce(
		(D,V) => !D || (WW.IsArr(S) ? +WR.Path(S,D) < +WR.Path(S,V) : +D[S] < +V[S]) ? V : D,
		null,Q) || {},
	Bad = Q => WW.Throw(['ErrBadRes',WW.IsStr(Q) ? Q : WC.OTJ(Q)]),
	M3U = (Q,Ext = WN) => WX.TCO((Q,I) => I < 10 ? Ext.ReqB(Option.Req(Q)).Map(V =>
	{
		var B = WC.M3U(V);
		if (WW.IsArr(B['STREAM-INF']))
		{
			B = Best([0,'BANDWIDTH'],B['STREAM-INF'])
			B || Bad(V)
			return [true,WN.JoinU(Q,B[1])]
		}
		if (WW.IsArr(B.INF))
		{
			B = B.INF.map(V => WN.JoinU(Q,V[1]))
			B = B.length < 16 ? {URL : B} : {URL : B,Size : WR.RepA(1,B.length)}
			return [false,B]
		}
		Bad(V)
	}) : Bad('Too many M3U | ' + Q),Q);

	WR.Each((V,S) =>
	{
		S = require(`./${V}=`)(
		{
			Cmp : D => Option.Cmp.D(V,D),
			Head : (Q,K,V) => Option.Head(Q,K,V),
			Req : Q => Option.Req(Q),
			Coke : Q => Option.Coke(Option.Req(Q),V),
			CokeRaw : () => Option.CokeRaw(V),
			Best,
			Bad,
			JOM : (S,Q) =>
			(
				S = S.exec(Q),
				WC.JTO(Q.slice(S.index + S[0].length),{More : true})[0]
			),
			Text : Q => WC.HED(Q
				.split(/<br\b[^>]*>|<\/(?:figure|h\d+|p)\b>/)
				.map(V => V.replace(/\s*(\r?\n|\r)\s*/g,' '))
				.join`\n`
				.replace(/<.*?>/g,''))
				.replace(/.+/g,WR.Trim),
			M3U,
			Part : (Q,Ext = WN) => WX.From(Q)
				.FMapE(V => WX.Any(V).FMap(V =>
				{
					if (/\.m3u8?(\?.*)?$/i.test(V.URL[0]))
					{
						1 < V.length && Bad('Unexpected content following M3U')
						return M3U(V.URL[0],Ext)
					}
					return WX.Just(V)
				}))
				.Reduce((D,V) => D.push(V) && D,[]),
		})
		All.push(S)
		Map[S.ID = V] = S
	},[
		'BiliBili',
		'YouTube',
		'NicoNico',

		'AcFun',
		'Facebook',
		'FanBox',
		'Fantia',
		'Instagram',
		'IXiGua',
		'KakuYomu',
		'Pixiv',
		'ShenHaiJiaoYu',
		'ShonenMagazine',
		'TikTok',
		'Twitter',
		'Vimeo',
		'WeiBo',

		'Manual',
	])
	return {
		A : All,
		M : Map,
		H : Q => WR.Has(Q,Map),
		D : Q => Map[Q],
		P : Q => WR.Has(Q,Map) ? WX.Just(Map[Q]) : WX.Throw(['ErrUnkSite',Q]),
		F : () =>
		{
			WR.EachU((_,F) => WR.Del(require.resolve(`./${F}=`),require.cache),Map)
			WR.Del(__filename,require.cache)
		}
	}
}