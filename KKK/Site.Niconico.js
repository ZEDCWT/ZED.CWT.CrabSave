'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('./Util'),
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('./Lang'),
L = Lang.L,
Cookie = require('./Cookie'),

Name = '\u30CB\u30B3\u30CB\u30B3',
PageSize = 30,

URLLogin = 'https://secure.nicovideo.jp/secure/login',
URLLoginCheck = 'http://seiga.nicovideo.jp/',
URLUser = ZED.URLBuild('http://www.nicovideo.jp/user/',Util.U,'/video?page=',Util.U),

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.nico(?:nico|video)\.|^sm\d+$/i,
	KeySite.Login,function(ID,PW)
	{
		return Util.RequestHead(
		{
			url : URLLogin,
			method : 'post',
			form :
			{
				mail : ID,
				password : PW
			},
			followRedirect : Util.F
		}).map(function(H)
		{
			Cookie.Set(Name,Util.MU(/user_session=user_[^;]+/,H.rawHeaders.join('\n')))
		})
	},
	KeySite.Check,function()
	{
		return Util.RequestBody(Cookie.URL(Name,URLLoginCheck)).map(function(Q)
		{
			return Util.MF(/data-nickname="([^"]+)/,Q)
		})
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
	KeySite.Pack,function(S)
	{
		return Cookie.URL(Name,S)
	}
);

module.exports = R