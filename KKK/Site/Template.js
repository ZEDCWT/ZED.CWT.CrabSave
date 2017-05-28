'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,
Cookie = require('../Cookie'),

Name = '',
PageSize,

URLVideo = ZED.URLBuild(),

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/_/i,
	KeySite.Login,(ID,PW) =>
	{
	},
	KeySite.Check,() =>
	{
	},
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(),
		KeySite.Judge,[],
		KeySite.Page,(ID,X) => Util.RequestBody()
			.map(() =>
			{
				return ZED.ReduceToObject
				(
					KeySite.Pages,
					KeySite.Total,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.Index,
						KeySite.ID,
						KeySite.Img,
						KeySite.Title,
						KeySite.Author,
						KeySite.AuthorLink,
						KeySite.Date
					)]
				)
			})
	)],
	KeySite.URL,ID => Util.RequestBody()
		.map(() =>
		{
			return ZED.ReduceToObject
			(
				KeyQueue.Author,
				KeyQueue.Date,
				KeyQueue.Part,[ZED.ReduceToObject
				(
					KeyQueue.URL,[],
					KeyQueue.Suffix,'.'
				)]
			)
		}),
	KeySite.IDView,ZED.identity,
	KeySite.IDLink,URLVideo,
	KeySite.Pack,ZED.identity
);

module.exports = R