'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,

Name = 'M3U',

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.m3u8?(\?.*)?$/i,
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.URL),
		KeySite.Judge,[/(.*)/],
		KeySite.Page,URL => Util.RequestBody(URL)
			.map((Q,R) =>
			{
				Q = ZED.Code.M3U(Q)
				if (Q.INF)
				{
					R = [ZED.ReduceToObject
					(
						KeySite.ID,URL
					)].concat(Q.INF.map(V => ZED.ReduceToObject
					(
						KeySite.ID,Util.URLJoin(URL,V[1]),
						KeySite.Title,ZED.OTJ(V[0])
					)))
				}
				else if (Q['STREAM-INF'])
				{
					R = Q['STREAM-INF'].map(V => ZED.ReduceToObject
					(
						KeySite.ID,Util.URLJoin(URL,V[1]),
						KeySite.Title,ZED.OTJ(V[0])
					))
				}
				else ZED.Throw(L(Lang.BadM3U))
				return ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,R
				)
			})
	)],
	KeySite.URL,URL => /\.m3u8?/.test(URL) ?
		Util.RequestBody(URL).map(Q =>
		{
			Q = ZED.Code.M3U(Q)
			if (!Q.INF) ZED.Throw(L(Lang.BadM3U))
			return ZED.ReduceToObject
			(
				KeyQueue.Author,L(Lang.NoAuthor),
				KeyQueue.Date,ZED.now(),
				KeyQueue.Title,Util.URLFileName(URL),
				KeyQueue.Part,[ZED.ReduceToObject
				(
					KeyQueue.URL,Q.INF.map(V => Util.URLJoin(URL,V[1])),
					KeyQueue.Suffix,Util.URLExt(Q.INF[0][1]) || '.ts'
				)]
				// KeyQueue.Sizes,Q.INF.map(V => 1)
			)
		}) :
		ZED.Observable.just(ZED.ReduceToObject
		(
			KeyQueue.Author,L(Lang.NoAuthor),
			KeyQueue.Date,ZED.now(),
			KeyQueue.Title,Util.URLFileName(URL),
			KeyQueue.Part,[ZED.ReduceToObject
			(
				KeyQueue.URL,[URL],
				KeyQueue.Suffix,Util.URLExt(URL) || '.ts'
			)]
		)),
	KeySite.IDView,ZED.identity,
	KeySite.IDLink,ZED.identity,
	KeySite.Pack,Q => ({url : Q,ForceRange : Util.F})
);

module.exports = R