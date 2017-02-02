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
		Change : EventKey(),
		Play : EventKey(),
		Pause : EventKey(),
		Remove : EventKey(),
		Info : EventKey(),
		InfoGot : EventKey(),
		SizeGot : EventKey(),
		Finish : EventKey()
	},
	Download :
	{
		Size : EventKey(),
		Played : EventKey(),
		Paused : EventKey(),
		Finish : EventKey(),
		Speed : EventKey(),
		SpeedTotal : EventKey()
	}
}