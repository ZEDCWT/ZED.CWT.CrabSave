'use strict'
var
WW = require('@zed.cwt/wish'),
{X : WX,C : WC,N : WN} = WW,

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
	Common = V =>
	(
		V = WC.JTO(V),
		V.error && O.Bad(V.error),
		V
	);
	return {
		URL : (ID,Ext) =>
		{
			var
			SolveConfig = () => Ext.ReqB(O.Coke(Vimeo))
				.Map(B => O.JOM(/vimeo\.config.*?(?={")/,B)),
			MakeAPI = (Q,T = O.CokeRaw()) => (LastAPICoke !== T || 6E5 + LastAPIAt < WW.Now() ?
				SolveConfig().Map(B =>
				(
					LastAPIAt = WW.Now(),
					LastAPICoke = T,
					LastAPIKey = B.api.jwt
				)) :
				WX.Just(LastAPIKey))
				.FMap(Key => Ext.ReqB(O.Req(WN.ReqOH(Q,'Authorization','Jwt ' + Key))));
			return MakeAPI(VimeoAPIVideo(ID)).Map(B =>
			{
				var
				Best;
				B = Common(B)
				Best = O.Best('size',B.download)
				return {
					Title : B.name,
					UP : B.user.name,
					Date : B.created_time,
					Part : [
					{
						URL : [Best.link],
						Size : [Best.size]
					}]
				}
			})
		},
	}
}