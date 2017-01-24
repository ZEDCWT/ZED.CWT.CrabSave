var
ZED = require('@zed.cwt/zedquery'),

EventKey = ZED.StableKeyGen(0x8086);

module.exports =
{
	Queue :
	{
		Refresh : EventKey(),
		Play : EventKey(),
		Pause : EventKey(),
		Stop : EventKey()
	}
}