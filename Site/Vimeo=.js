'use strict'
var
WW = require('@zed.cwt/wish'),
{C : WC,N : WN,X : WX} = WW,

Vimeo = 'https://vimeo.com/',
VimeoAPI = 'https://api.vimeo.com/',
VimeoAPIVideo = WW.Tmpl(VimeoAPI,'videos/',undefined,'?fields=name,created_time,user.name,download');

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	LastAPIAt,
	LastAPICoke,
	LastAPIKey,
	SolveConfig = () => WN.ReqB(O.Coke(Vimeo))
		.Map(B => O.JOM(/vimeo\.config.*?(?={")/,B)),
	MakeAPI = (Q,T = O.Coke()) => (LastAPICoke !== T || 6E5 + LastAPIAt < WW.Now() ?
		SolveConfig().Map(B =>
		(
			LastAPIAt = WW.Now(),
			LastAPICoke = T,
			LastAPIKey = B.api.jwt
		)) :
		WX.Just(LastAPIKey))
		.FMap(Key => WN.ReqB(O.Req(O.Head(Q,'Authorization','Jwt ' + Key)))),
	Common = V =>
	(
		V = WC.JTO(V),
		V.error && O.Bad(V.error),
		V
	);
	return {
		URL : Q => MakeAPI(VimeoAPIVideo(Q)).Map(B =>
		{
			var
			Best;
			B = Common(B)
			Best = O.Best('size',B.download)
			return {
				Title : B.name,
				UP : B.user.name,
				Date : +new Date(B.created_time),
				Part : [
				{
					URL : [Best.link],
					Size : [Best.size]
				}]
			}
		})
	}
}