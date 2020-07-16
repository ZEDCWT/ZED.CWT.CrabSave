'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC,N : WN} = WW,

IXiGua = 'https://www.ixigua.com/';

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	return {
		URL : Q => WN.ReqB(O.Coke(IXiGua + Q)).Map(B =>
		{
			var
			U = {URL : [],Ext : []},
			Add = (Q,S = '.mp4') =>
			{
				U.URL.push(WC.B64U(Q.main_url))
				U.Ext.push(S)
			};
			B = O.JOM(/SSR_HYDRATED_DATA=/,B).anyVideo.gidInformation.packerData.video
			WR.Any(function(V)
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