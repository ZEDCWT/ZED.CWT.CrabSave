'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
XML2JS = require('xml2js'),
XMLParse = WX.WrapNode(XML2JS.parseString),

Facebook = 'https://www.facebook.com/',
FacebookVideoTahoeAsync = WW.Tmpl(Facebook,'video/tahoe/async/',undefined,'?payloadtype=primary'),
IDURL = Q => Facebook + Q.replace('/','/posts/'),

SolveDash = Q => XMLParse(Q).Map(V =>
{
	var URL = [],Ext = [];
	WR.EachU((B,F) =>
	{
		B = B.Representation.sort((Q,S) => S.$.bandwidth - Q.$.bandwidth)[0]
		URL.push(B.BaseURL[0])
		Ext.push('.' + B.$.mimeType.replace(/.*\//,'') + (F ? '.mp3' : ''))
	},V.MPD.Period[0].AdaptationSet)
	return {URL,Ext}
});

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	return {
		URL : Q => WN.ReqB(O.Coke(IDURL(Q))).FMap(B =>
		{
			var
			// It seems that DTS token is ONLY avaliable when logged in
			DTSToken = WW.MF(/"DTSGInitialData"[^}]*?"token":"([^"]+)/,B),
			PageData = WW.MF(/(\[{[^{}]+dash_manifest[^]+?}]),minQuality:/,B),
			VideoTitle;
			return (DTSToken ? WN.ReqB(O.Coke(
			{
				url : FacebookVideoTahoeAsync(Q.replace(/.*\//,'')),
				method : 'post',
				headers :
				{
					[WW.UA] : `Chrome/${WW.Rnd(3E3,9E9)} Safari/${WW.Rnd(3E3,9E9)}`
				},
				form :
				{
					__a : 1,
					fb_dtsg : DTSToken
				}
			})).Map((N,T) =>
			{
				N = WC.JTO(N.replace(/^[^{]+/,''))
				VideoTitle = WR.Path(['payload','video','markup','__html'],N)
				T = /<a[^>]+"\/watch[^"]+v=\d/.exec(VideoTitle)
				VideoTitle = O.Text(WC.TagM('a',T ? T.index : 0,VideoTitle))
				WR.Each(V => N = N || WR.Path([2,0,'videoData'],V),
					WR.Path(['jsmods','instances'],N),N = null)
				return N
			}) : WX.Just(WN.Evil(PageData)))
				.FMap(Video => WW.IsArr(Video) ? WX.From(Video) : O.Bad('Contains no videos'))
				.FMapO(1,V => V.dash_manifest ?
					SolveDash(V.dash_manifest) :
					WX.Just({URL : [V.hd_src || V.sd_src]}))
				.Reduce((D,V) => D.push({...V,Title : VideoTitle}) && D,[])
				.Map(Part =>
				{
					var
					T = WC.TagM('div',/<div[^>]+userContentWrapper/.exec(B).index,B)
					return {
						Title : O.Text(WC.TagM('p',0,T)),
						Up : WC.HED(WW.MF(/>([^<]+)<\/a><\/span/,T)),
						Date : 1E3 * WW.MF(/-utime="(\d+)/,T),
						Part
					}
				})
		})
	}
}

module.exports.Dash = SolveDash