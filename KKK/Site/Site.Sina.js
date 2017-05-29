'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,

Name = 'Sina',

URLVideo = ZED.URLBuild('http://video.sina.com.cn/view/',Util.U,'.html'),
URLVideoInfo = ZED.URLBuild('http://s.video.sina.com.cn/video/play?video_id=',Util.U,'&player=flash'),
URLPlay = ZED.URLBuild('http://ask.ivideo.sina.com.cn/v_play.php?vid=',Util.U),

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/sina\./i,
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^(\d+)$/,/view\/(\d+)/i],
		KeySite.Page,ID => Util.RequestBody(URLVideoInfo(ID))
			.map(Q =>
			(
				Q = ZED.JTO(Q),
				1 === Q.code || ZED.Throw(Util.ReplaceLang(Lang.BadCE,Q.code,Q.message)),
				Q = Q.data,
				ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.Index,0,
						KeySite.ID,ID,
						KeySite.Img,Q.image,
						KeySite.Title,Q.title,
						KeySite.Date,1E3 * Q.create_time
					)]
				)
			))
	)],
	KeySite.URL,ID => Util.RequestBody(URLVideoInfo(ID))
		.flatMap(V =>
		(
			V = ZED.JTO(V).data,
			Util.RequestBody(URLPlay(V.videos[0].file_id))
				.map(Q =>
				(
					/result>error/.test(Q) && ZED.Throw(Util.MF(/CDATA\[([^\]]+)/,Q)),
					Q = Util.MA(/<durl[^]+?<\/durl/g,Q,Q =>
					[
						Util.MF(/CDATA\[([^\]]+)/,Q),
						+Util.MF(/gth>(\d+)/,Q)
					]),
					ZED.ReduceToObject
					(
						KeyQueue.Date,1E3 * V.create_time,
						KeyQueue.Part,[ZED.ReduceToObject
						(
							KeyQueue.URL,ZED.map(ZED.head,Q),
							KeyQueue.Suffix,Q.length ? Util.MF(/(\.[a-z]+)(?:\?.*)?$/,Q[0][0]) : '.mp4',
							KeyQueue.Sizes,ZED.map(ZED.last,Q)
						)]
					)
				))
		)),
	KeySite.IDView,ZED.identity,
	KeySite.IDLink,URLVideo,
	KeySite.Pack,ZED.identity
);

module.exports = R