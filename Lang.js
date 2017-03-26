'use strict'
var
ZED = require('@zed.cwt/zedquery'),
_Lang = ZED.Lang(),
Lang = function(Q){return _Lang(Q,'')};

module.exports =
{
	L : _Lang,

	DevTool : Lang('Toggle Dev Tools'),
	Restore : Lang('Restore'),
	Exit : Lang('Exit')
}