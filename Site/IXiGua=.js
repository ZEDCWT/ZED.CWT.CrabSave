'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC,N : WN,X : WX} = WW,

IXiGua = 'https://www.ixigua.com/',
Happy = WN.Evil(
`
	[
		'Object',
		'Function',
		'Array',
		'String',
		'Date',
		'RegExp',
		'JSON',
		'parseInt',
	].reduce((D,V) => (D[V] = this[V],D),
	{
		document : {},
		location : {href : '',protocol : ''},
		navigator : {userAgent : ''}
	})
`,WN.VMO());
Happy.window = Happy

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	Sign,SignAt,
	SolveSign = URL => WN.ReqB(O.Req(URL)).Map(B =>
	{
		try
		{
			WN.Evil(`'use strict';` + B,Happy)
			B = Happy.byted_acrawler
		}
		catch(_){}
		SignAt = WW.Now()
		return Sign = B && B.sign
	}),
	ReqSign = () => (Sign && WW.Now() < SignAt + 36E5 ? WX.Just(Sign) : WN.ReqB(O.Req(IXiGua)))
		.FMap(B => SolveSign(WW.MF(/="([^"]+acrawler.js)"/,B))),
	ReqCokeAC = {},
	Req = Q =>
	{
		var U = () => O.Req(
		{
			URL : Q,
			Head :
			{
				Cookie : WR.Where(WR.Id,[O.CokeRaw(),WC.CokeS(ReqCokeAC)]).join('; ')
			}
		});
		return ReqSign().FMap(S =>
			WN.ReqU(U()).FMap(B =>
			{
				WR.Each(V =>
				{
					if (WR.StartW('__ac_nonce=',V))
					{
						ReqCokeAC.__ac_signature = S('',ReqCokeAC.__ac_nonce = WC.CokeP(V).__ac_nonce)
						B = 0
					}
				},B[0].H['set-cookie'])
				return B ?
					WX.Just(B[1]) :
					WN.ReqB(U())
			}))
	};
	return {
		URL : Q => Req(IXiGua + Q).Map(B =>
		{
			var
			U = {URL : [],Ext : []},
			Add = (Q,S = '.mp4') =>
			{
				U.URL.push(WC.B64U(Q.main_url))
				U.Ext.push(S)
			};
			B = B.replace(/([^\\]":)undefined/g,'$1null')
			B = O.JOM(/SSR_HYDRATED_DATA=/,B).anyVideo.gidInformation.packerData.video
			WR.Any(V =>
			{
				V = B.videoResource[V]
				if (V && V.dynamic_video)
				{
					Add(O.Best('bitrate',V.dynamic_video.dynamic_video_list))
					Add(O.Best('bitrate',V.dynamic_video.dynamic_audio_list),'.mp3')
				}
				else if (V = V && V.video_list)
				{
					Add(O.Best('bitrate',WR.Val(V)))
				}
				return V
			},['dash_120fps','dash','normal']) ||
				O.Bad(B.videoResource)
			return {
				Title : B.title,
				Up : B.user_info.name,
				Date : 1E3 * B.video_publish_time,
				Part : [U]
			}
		})
	}
}