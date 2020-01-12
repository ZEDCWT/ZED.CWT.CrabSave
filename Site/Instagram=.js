'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
XML2JS = require('xml2js'),
XMLParse = WX.WrapNode(XML2JS.parseString),

Instagram = 'https://www.instagram.com/',
InstagramQueryTmpl = WW.Tmpl(Instagram,'graphql/query/?query_hash=',undefined,'&variables=',undefined),
InstagramHashPost = '3b38775b9f92c2c0b13e0303ca55d34e';

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	InstagramQuery = (Q,S) => WN.ReqB(O.Coke(InstagramQueryTmpl(Q,WC.UE(WC.OTJ(S))))).Map(B =>
	{
		B = WC.JTO(B)
		'ok' === B.status || O.Bad(B.message)
		return B.data
	});
	return {
		URL : ID => InstagramQuery(InstagramHashPost,{shortcode : ID}).FMap(B =>
		{
			B = B.shortcode_media
			B.is_video || O.Bad('Not a video')
			return (B.dash_info && B.dash_info.is_dash_eligible ?
				XMLParse(B.dash_info.video_dash_manifest).Map(V =>
				{
					var URL = [],Ext = [];
					WR.EachU((B,F) =>
					{
						B = B.Representation.sort((Q,S) => S.$.bandwidth - Q.$.bandwidth)[0]
						URL.push(B.BaseURL[0])
						Ext.push('.' + B.$.mimeType.replace(/.*\//,'') + (F ? '.mp3' : ''))
					},V.MPD.Period[0].AdaptationSet)
					return [URL,Ext]
				}) :
				WX.Just([[B.video_url],'.mp4']))
				.Map(([URL,Ext]) => (
				{
					Title : B.title || WR.Path(['edge_media_to_caption','edges',0,'node','text'],B),
					Up : B.owner.full_name,
					Date : 1E3 * B.taken_at_timestamp,
					Part : [{URL,Ext}]
				}))
		})
	}
}