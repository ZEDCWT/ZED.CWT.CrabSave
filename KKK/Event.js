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
		First : EventKey(),

		Change : EventKey(),

		Newed : EventKey(),
		ENew : EventKey(),
		Played : EventKey(),
		PauseShow : EventKey(),
		Paused : EventKey(),
		Removed : EventKey(),
		EAction : EventKey(),

		Processing : EventKey(),
		Queuing : EventKey(),

		Info : EventKey(),
		InfoGot : EventKey(),
		SizeGot : EventKey(),

		Reinfo : EventKey(),
		ReinfoLook : EventKey(),
		RRefresh : EventKey(),
		Refresh : EventKey(),

		Error : EventKey(),
		ErrorLook : EventKey(),
		ErrorEnd : EventKey(),

		Finish : EventKey(),
		EFinish : EventKey(),
		FHot : EventKey(),
		FHis : EventKey(),

		HRemoved : EventKey(),
		EHRemove : EventKey()
	},
	Download :
	{
		File : EventKey(),
		Size : EventKey(),
		Dir : EventKey(),
		Reinfo : EventKey(),
		Error : EventKey(),
		Speed : EventKey(),
		SpeedTotal : EventKey(),
		Save : EventKey(),
		Finish : EventKey()
	},
	Cookie :
	{
		Change : EventKey()
	}
}