'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX} = WW;

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
			Head : (Q,K,V) => Option.Head(Q,K,V),
			Req : Q => Option.Req(Q),
			Coke : Q => Option.Coke(Option.Req(Q),V),
			Best : (S,Q) => WR.Reduce(WR.MaxBy(V => +V[S]),{[S] : -Infinity},Q),
		})
		All.push(S)
		Map[S.ID = V] = S
	},[
		'BiliBili',
		'YouTube',
		'NicoNico',
	])
	return {
		A : All,
		M : Map,
		H : Q => WR.Has(Q,Map),
		D : Q => Map[Q],
		P : Q => WR.Has(Q,Map) ? WX.Just(Map[Q]) : WX.Throw('Unknown site ' + Q),
	}
}