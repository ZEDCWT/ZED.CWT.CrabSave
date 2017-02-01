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
		Remove : EventKey(),
		Info : EventKey(),
		InfoGot : EventKey(),
		SizeGot : EventKey()
	},
	Download :
	{
		Size : EventKey(),
		Played : EventKey(),
		Paused : EventKey(),
		Finish : EventKey()
	}
}