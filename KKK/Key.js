'use strict'
var
ZED = require('@zed.cwt/zedquery'),

KeyKey = ZED.StableKeyGen(20170122),
QueueKey = ZED.StableKeyGen(17022026);

module.exports =
{
	Setting :
	{
		Dir : KeyKey(),
		Name : KeyKey(),
		Max : KeyKey(),
		Font : KeyKey(),
		Size : KeyKey(),
		Weight : KeyKey(),
		Retry : KeyKey(),
		Restart : KeyKey(),
		Merge : KeyKey(),
		Suffix : KeyKey(),
		Tray : KeyKey()
	},
	Site :
	{
		Name : KeyKey(),
		Judge : KeyKey(),
		//Component
		Frame : KeyKey(),
		Component : KeyKey(),
		ComCheck : KeyKey(),
		//Login
		Require : KeyKey(),
		VCode : KeyKey(),
		Login : KeyKey(),
		Check : KeyKey(),
		//Map
		Map : KeyKey(),
		//[Name] reuse
		//[Judge] reuse
		Page : KeyKey(),
		//Page returns an object
		Pages : KeyKey(),//number | false for
		Total : KeyKey(),
		Item : KeyKey(),//array
		//	Item
		Unique : KeyKey(),
		Index : KeyKey(),
		ID : KeyKey(),
		Img : KeyKey(),
		Title : KeyKey(),
		Author : KeyKey(),
		Date : KeyKey(),
		Length : KeyKey(),
		//		URL
		URL : KeyKey(),
		//	Preference
		Pref : KeyKey(),
		PrefDef : KeyKey(),
		//IDView
		IDView : KeyKey(),
		//Pack
		Pack : KeyKey()
	},
	Queue :
	{
		Unique : QueueKey(),
		Name : QueueKey(),
		ID : QueueKey(),
		IDHis : QueueKey(),

		Title : QueueKey(),

		Created : QueueKey(),
		Finished : QueueKey(),

		Active : QueueKey(),

		Author : QueueKey(),
		Date : QueueKey(),

		Part : QueueKey(),
		//[Title] reuse, optional part title
		URL : QueueKey(),
		Suffix : QueueKey(),

		Size : QueueKey(),
		Sizes : QueueKey(),

		Done : QueueKey(),
		DoneSum : QueueKey(),
		Format : QueueKey(),
		Root : QueueKey(),
		Dir : QueueKey(),
		File : QueueKey()
	}
}