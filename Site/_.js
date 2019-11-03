'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR} = WW,

SiteAll = [],
SiteMap = {};

WR.Each((V,S) =>
{
	S = require(`./${V}=`)
	SiteAll.push(S)
	SiteMap[S.ID = V] = S
},[
	'BiliBili',
	'YouTube',
	'NicoNico',
])

module.exports =
{
	/**@type {CrabSaveNS.SiteO[]}*/
	A : SiteAll,
	/**@type {{[K : string] : CrabSaveNS.SiteO[]}}*/
	M : SiteMap,
	/**@type {(Q : string) => boolean}*/
	H : Q => WR.Has(Q,SiteMap),
	/**@type {(Q : string) => CrabSaveNS.SiteO}*/
	D : Q => SiteMap[Q]
}