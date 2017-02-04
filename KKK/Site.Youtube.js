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

R = ZED.ReduceToObject
(
	KeySite.Name,'Youtube',
	KeySite.Judge,/\.you\.?tu\.?be\./i,
	KeySite.Login,function()
	{

	},
	KeySite.Check,function()
	{

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