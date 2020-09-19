'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW;

/**@type {CrabSaveNS.SiteAll}*/
module.exports = Option =>
{
	var
	All = [],
	Map = {};
	WR.Each((V,S) =>
	{
		S = require(`./${V}=`)(
		{
			Cmp : D => Option.Cmp.D(V,D),
			Head : (Q,K,V) => Option.Head(Q,K,V),
			Req : Q => Option.Req(Q),
			Coke : Q => Option.Coke(Option.Req(Q),V),
			CokeRaw : () => Option.CokeRaw(V),
			Best : (S,Q) => WR.Reduce(WR.MaxBy(V => WW.IsArr(S) ? +WR.Path(S,V) : +V[S]),
				{[S] : -Infinity},Q),
			Bad : Q => WW.Throw(['ErrBadRes',WW.IsStr(Q) ? Q : WC.OTJ(Q)]),
			JOM : (S,Q) =>
			(
				S = S.exec(Q),
				WC.JTO(Q.slice(S.index + S[0].length),{More : true})[0]
			),
			Text : Q => WC.HED(Q
				.replace(/<br\b[^>]*>/g,'\n')
				.replace(/<.*?>/g,''))
				.replace(/.+/g,WR.Trim)
				.replace(/\r?\n/g,' '),
			M3U : Q => WN.ReqB(Q).FMap(B =>
			{
				B = WC.M3U(B)
				if (WW.IsArr(B.INF))
				{
					B = B.INF.map(V => WN.JoinU(Q,V[1]))
					B = B.length < 16 ? {URL : B} : {URL : B,Size : WR.RepA(1,B.length)}
					return WX.Just(B)
				}
				WX.Throw(['ErrBadRes',B])
			})
		})
		All.push(S)
		Map[S.ID = V] = S
	},[
		'BiliBili',
		'YouTube',
		'NicoNico',
		'AcFun',
		'Facebook',
		'Instagram',
		'IXiGua',
		'TikTok',
		'Twitter',
		'Vimeo',
		'WeiBo',
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