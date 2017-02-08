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
		FakeRun : EventKey(),
		Play : EventKey(),
		Pause : EventKey(),
		Remove : EventKey(),
		Info : EventKey(),
		InfoGot : EventKey(),
		SizeGot : EventKey(),
		Finish : EventKey(),

		Bye : EventKey()
	},
	Download :
	{
		Size : EventKey(),
		Dir : EventKey(),
		Reinfo : EventKey(),
		Error : EventKey(),
		Finish : EventKey(),
		Speed : EventKey(),
		SpeedTotal : EventKey()
	},
	Cookie :
	{
		Change : EventKey()
	}
}