var
ZED = require('@zed.cwt/zedquery'),

EventKey = ZED.StableKeyGen(0x8086);

module.exports =
{
	Queue :
	{
		ChangeOnline : EventKey(),
		ChangeOffline : EventKey(),
		Play : EventKey(),
		Pause : EventKey(),
		Stop : EventKey()
	},
	Cold :
	{
		Change : EventKey()
	}
}