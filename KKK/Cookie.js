'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('./Util'),
EventCookieChange = require('./Event').Cookie.Change,
Save = require('../JSONFile')('Cookie'),

Read = Q =>
(
	Q = Save.Data(Q),
	Q ? String(Q) : ''
);

module.exports =
{
	Read,
	Head : Q => ({Cookie : Read(Q)}),
	URL : (Q,S,H) => ({url : S,headers : ZED.Merge({Cookie : Read(Q)},H)}),
	Set : (Q,S) =>
	{
		Save.Save(ZED.objOf(Q,S))
		Util.Bus.emit(EventCookieChange)
	},
	Save : (Q,S) =>
	(
		S = ZED.Merge(Util.CookieSolve(S),Util.CookieTo(Read(Q))),
		Save.Save(ZED.objOf(Q,Util.CookieMake(S))),
		Util.Bus.emit(EventCookieChange),
		S
	)
}