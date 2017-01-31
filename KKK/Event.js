'use strict'
var
ZED = require('@zed.cwt/zedquery'),

EventKey = ZED.StableKeyGen(0x8086);

module.exports =
{
	Cold :
	{
		Change : EventKey()
	},
	Queue :
	{
		ChangeOnline : EventKey(),
		ChangeOffline : EventKey(),
		Play : EventKey(),
		Pause : EventKey(),
		Remove : EventKey()
	},
	Download :
	{
		InfoGot : EventKey(),
		Played : EventKey(),
		Paused : EventKey(),
		Finish : EventKey()
	}
}