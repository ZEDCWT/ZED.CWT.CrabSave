'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('./Util'),
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('./Lang'),
L = Lang.L,

Name = 'Bilibili',
PageSize = 30,
URLSpace = ZED.URLBuild('http://space.bilibili.com/ajax/member/getSubmitVideos?mid=',undefined,'&pagesize=',PageSize,'&page=',undefined),

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.bilibili\./i,
	KeySite.Login,function()
	{

	},
	KeySite.Check,function()
	{

	},
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[/(?:^|.*[^a-z])space(?:[^a-z]\D*)??(\d+)/i],
		KeySite.Page,function(ID,X)
		{
			return Util.RequestBody(URLSpace(ID,X))
				.map(function(Q)
				{
					Q = ZED.JTO(Q)
					Q.status || ZED.throw(L(Lang.UexRtn))
					Q = Q.data

					return ZED.ReduceToObject
					(
						KeySite.Pages,Q.pages,
						KeySite.Total,Q.count,
						KeySite.Item,ZED.Map(Q.vlist || [],function(F,V)
						{
							return ZED.ReduceToObject
							(
								KeySite.Name,Name,
								KeySite.Unique,Util.MakeUnique(Name,V.aid),
								KeySite.Index,PageSize * (X - 1) + F,
								KeySite.ID,'av' + V.aid,
								KeySite.Img,V.pic,
								KeySite.Title,V.title,
								KeySite.Author,V.author,
								KeySite.Date,new Date(1000 * V.created)
							)
						})
					)
				})
		}
	)],
	KeySite.URL,function(ID,R)
	{
		return ZED.Observable.create(function(O)
		{
			var S = setTimeout(function()
			{
				ZED.Merge(true,R,ZED.ReduceToObject
				(
					KeyQueue.Author,'AUTHOR',
					KeyQueue.Date,new Date,
					KeyQueue.Part,[ZED.ReduceToObject
					(
						KeyQueue.Title,'PARTA',
						KeyQueue.URL,['http://WWW.WWW.WWW/WWW'],
						KeyQueue.Suffix,'.flv'
					)],
					KeyQueue.File,1
				))
				O.data().finish()
			},1000)

			return function()
			{
				console.log('suspend','URL')

			}
		})
	}
);

module.exports = R