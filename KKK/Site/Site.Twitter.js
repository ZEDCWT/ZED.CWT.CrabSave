'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,
Component = require('../Component'),

Name = 'Twitter',
MapCanonicalURL = {},
MapDate = {},

URLTweet = ZED.URLBuild('https://twitter.com/statuses/',Util.U),
URLVideoDownloader = 'http://www.downloadtwittervideo.com/',
URLVideo = ZED.URLBuild('http://server',Util.U,'.downloadtwittervideo.com/online/PreDownload.php?url=',Util.U,'&format=MP4&quality=hd&speed=',Util.U),

FrameTool,
FrameRepeater = ZED.Repeater(),
SHA = ZED.noop,

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/[/.]twitter\./i,
	KeySite.Frame,Reg =>
	{
		FrameTool = Reg(W =>
		{
			W.IsSearchable = 0
			W.addEventListener = ZED.noop
		},W =>
		{
			SHA = ZED.noop
			if (W = W.SHA)
			{
				SHA = W
				FrameRepeater.finish()
			}
			else FrameRepeater.error('Failed to load SHA function')
		},Component.Data(Name))
	},
	KeySite.Component,Say =>
	(
		Say(Util.ReplaceLang(Lang.LoadScr,L(Lang.HP))),
		Util.ajax(URLVideoDownloader).flatMap(Q =>
		(
			Q = Util.MF(/"([^"]+Logic\.min\.js[^"]+)/,Q),
			Say(Q),
			Util.ajax(Q)
		)).flatMap(Q =>
		(
			Say(L(Lang.FileWrite)),
			Util.writeFile(FrameTool[0],Q)
		)).flatMap(() =>
		(
			Component.Save(ZED.objOf(Name,9)),
			FrameRepeater = ZED.Repeater(),
			FrameTool[1](),
			FrameRepeater
		))
	),
	KeySite.ComCheck,() => SHA('') ?
		ZED.Observable.empty() :
		ZED.Observable.throw(L(Lang.ComNot)),
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,'Tweet',
		KeySite.Judge,[/status(?:es)?\/(\d+)/,Util.MakeLabelNumber('tweet')],
		KeySite.Page,ID => Util.RequestBody(URLTweet(ID))
			.map(Q =>
			(
				MapCanonicalURL[ID] = Util.MF(/canonical" href="([^"]+)/,Q),
				ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.ID,ID,
						KeySite.Title,Util.DecodeHTML(Util.MF(/tweet-text[^-\w][^>]+>([^]+?)<\/p/,Q)),
						KeySite.Img,Util.MF(/og:image" content="([^"]+)/,Q),
						KeySite.Author,Util.MF(/erCard-nameL[^>]+>([^<]+)/,Q),
						KeySite.Date,MapDate[ID] = Number(Util.MF(/data-time-ms="(\d+)/,Q))
					)]
				)
			))
	)],
	KeySite.URL,ID => Util.RequestBody(
	{
		url : URLVideo(ZED.Rnd(1,23),encodeURIComponent(MapCanonicalURL[ID]),SHA(MapCanonicalURL[ID])),
		headers : {Origin : URLVideoDownloader}
	}).map(Q => ZED.ReduceToObject
	(
		KeyQueue.Date,MapDate[ID],
		KeyQueue.Part,[ZED.ReduceToObject
		(
			KeyQueue.URL,[ZED.JTO(Q).FlvUrl],
			KeyQueue.Suffix,'.mp4'
		)]
	)),
	KeySite.IDView,ZED.identity,
	KeySite.IDLink,ID => MapCanonicalURL[ID] || URLTweet(ID),
	KeySite.Pack,ZED.identity
);

module.exports = R