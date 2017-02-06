'use strict'
var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Util = require('./Util'),
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('./Lang'),
L = Lang.L,
Cookie = require('./Cookie'),

Name = 'YouTube',
PageSize = 30,

URLLoginCheck = 'https://www.youtube.com/account',

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.you\.?tu\.?be\./i,
	KeySite.Require,['Cookie SID','Cookie SSID'],
	KeySite.Login,function(SID,SSID)
	{
		Cookie.Set(Name,Util.CookieMake(
		{
			SID : SID,
			SSID : SSID
		}))
		return Observable.just(L(Lang.CookieSaved))
	},
	KeySite.Check,function()
	{
		return Util.RequestBody(Cookie.URL(Name,URLLoginCheck)).map(function(Q)
		{
			return Util.MF(/display-name">[^>]+>([^<]+)/,Q)
		})
	},
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[Util.MakeLabelID('user')],
		KeySite.Page,function(ID,X)
		{
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Channel),
		KeySite.Judge,[Util.MakeLabelID('Channel')],
		KeySite.Page,function(ID,X)
		{
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^/],
		KeySite.Page,function(ID)
		{
		}
	)],
	KeySite.URL,function(ID,R)
	{
	},
	KeySite.IDView,ZED.identity,
	KeySite.Pack,function(S,Q)
	{
		return S
	}
);

module.exports = R