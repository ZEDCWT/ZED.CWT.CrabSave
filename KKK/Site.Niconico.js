'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('./Util'),
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('./Lang'),
L = Lang.L,

PageSize = 30,

URLUser = ZED.URLBuild('http://www.nicovideo.jp/user/',Util.U,'/video?page=',Util.U),

R = ZED.ReduceToObject
(
	KeySite.Name,'\u30CB\u30B3\u30CB\u30B3',
	KeySite.Judge,/\.nico(?:nico|video)\.|^sm\d+$/i,
	KeySite.Login,function()
	{

	},
	KeySite.Check,function()
	{

	},
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^(\d+)$/,Util.MakeLabelID('sm')],
		KeySite.Page,function(ID)
		{
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[Util.MakeLabelID('user')],
		KeySite.Page,function(ID,X)
		{
			return Util.RequestBody(URLUser(ID,X)).map(function(Q,T,A)
			{
				T = Number(Util.MF(/id="video[^]+?(\d+)/,Q))
				A = Util.MF(/profile[^]+?<h2>([^<]+)/,Q)

				return ZED.ReduceToObject
				(
					KeySite.Pages,Math.ceil(T / PageSize) || 0,
					KeySite.Total,T,
					KeySite.Item,ZED.Map(ZED.match(/outer"(?![^<]+<form)[^]+?<\/p/g,Q),function(F,V)
					{
						return ZED.ReduceToObject
						(
							KeySite.Index,PageSize * (X - 1) + F,
							KeySite.ID,Util.MF(/sm(\d+)/,V),
							KeySite.Img,Util.MF(/src="([^"]+)/,V),
							KeySite.Title,Util.MF(/h5>[^>]+>([^<]+)/,V),
							KeySite.Author,A,
							KeySite.Date,ZED.trim(Util.MF(/posttime">([^<]+)/,V) || '')
						)
					})
				)
			})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Mylist),
		KeySite.Judge,[Util.MakeLabelID('Mylist')],
		KeySite.Page,function(ID,X)
		{
		}
	)],
	KeySite.URL,function(ID,R)
	{
	},
	KeySite.IDView,ZED.add('sm'),
	KeySite.Pack,function(S,Q)
	{
		return S
	}
);

module.exports = R