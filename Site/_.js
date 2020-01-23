'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC} = WW;

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
			Text : Q => WC.HED(Q
				.replace(/<br\b[^>]*>/g,'\n')
				.replace(/<.*?>/g,''))
				.replace(/.+/g,WR.Trim)
				.replace(/\r?\n/g,' '),
		})
		All.push(S)
		Map[S.ID = V] = S
	},[
		'BiliBili',
		'YouTube',
		'NicoNico',
		'Facebook',
		'Instagram',
		'Twitter',
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