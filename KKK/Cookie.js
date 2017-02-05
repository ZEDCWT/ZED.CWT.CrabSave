'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('./Util'),
EventCookieChange = require('./Event').Cookie.Change,
Save = require('../JSONFile')('Cookie'),

Read = function(Q)
{
	Q = Save.Data(Q)
	return Q ? String(Q) : ''
};

module.exports =
{
	Read : Read,
	Head : function(Q){return {Cookie : Read(Q)}},
	URL : function(Q,S){return {url : S,headers : {Cookie : Read(Q)}}},
	Set : function(Q,S){Save.Save(ZED.objOf(Q,S))},
	Save : function(Q,S)
	{
		S = ZED.Merge(Util.CookieSolve(S),Util.CookieTo(Read(Q)))
		Save.Save(ZED.objOf(Q,Util.CookieMake(S)))
		Util.Bus.emit(EventCookieChange)
	}
}