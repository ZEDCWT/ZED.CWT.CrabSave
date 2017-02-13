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
		Newed : EventKey(),
		Played : EventKey(),
		Paused : EventKey(),
		Removed : EventKey(),
		HRemoved : EventKey(),

		Change : EventKey(),
		FakeRun : EventKey(),
		Play : EventKey(),
		Pause : EventKey(),
		Remove : EventKey(),
		Info : EventKey(),
		InfoGot : EventKey(),
		SizeGot : EventKey(),
		Finish : EventKey(),

		HRemove : EventKey()
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