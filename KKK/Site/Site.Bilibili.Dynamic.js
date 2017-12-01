'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,

Name = 'BilibiliDynamic',

DomainSpace = 'http://space.bilibili.com/',
URLDynamic = ZED.URLBuild('https://t.bilibili.com/',Util.U),
URLDynamicDetail = ZED.URLBuild('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/get_dynamic_detail?dynamic_id=',Util.U),

SolveDetail = ID => Util.RequestBody(URLDynamicDetail(ID))
	.map(Q => ZED.JTO(ZED.JTO(Q).data.card.card)),

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\/t\.bilibili\./i,
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^(\d+)$/,/\/(\d+)/],
		KeySite.Page,ID => SolveDetail(ID).map(Q => ZED.ReduceToObject
		(
			KeySite.Pages,1,
			KeySite.Total,1,
			KeySite.Item,[ZED.ReduceToObject
			(
				KeySite.ID,ID,
				KeySite.Img,Q.item.cover.default,
				KeySite.Title,Q.item.description,
				KeySite.Author,Q.user.name,
				KeySite.AuthorLink,DomainSpace + Q.user.uid,
				KeySite.Date,Q.item.upload_time.replace(/ /,'T') + '+0800'
			)]
		))
	)],
	KeySite.URL,ID => SolveDetail(ID).pluck('item').map(Q => ZED.ReduceToObject
	(
		KeyQueue.Date,new Date(Q.upload_time.replace(/ /,'T') + '+0800'),
		KeyQueue.Part,[ZED.ReduceToObject
		(
			KeyQueue.URL,[Q.video_playurl + '&rand=' + ZED.Rnd(1E6,2E6)],
			KeyQueue.Suffix,Util.MF(/(\.\w+)(\?|$)/,Q.video_playurl)
		)]
		//KeyQueue.Sizes,[Number(Q.video_size)]
	)),
	KeySite.IDView,ZED.identity,
	KeySite.IDLink,URLDynamic,
	KeySite.Pack,ZED.identity
);

module.exports = R