'use strict'
var
ZED = require('@zed.cwt/zedquery'),

SettingKey = ZED.StableKeyGen(20170122),
QueueKey = ZED.StableKeyGen(17022026),
KeyKey = ZED.StableKeyGen(20170331);

module.exports =
{
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
		//	Page
		Page : KeyKey(),
		//	Page returns an object
		Pages : KeyKey(),//number | false for
		Total : KeyKey(),
		Item : KeyKey(),//array
		//		Item
		Unique : KeyKey(),
		Index : KeyKey(),
		ID : KeyKey(),
		Img : KeyKey(),
		Title : KeyKey(),
		Author : KeyKey(),
		AuthorLink : KeyKey(),
		Date : KeyKey(),
		Length : KeyKey(),
		//	Hint
		Hint : KeyKey(),
		//		URL
		URL : KeyKey(),
		//	Preference
		Pref : KeyKey(),
		PrefDef : KeyKey(),
		//IDView
		IDView : KeyKey(),
		//IDLink
		IDLink : KeyKey(),
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
	},
	Setting :
	{
		Dir : SettingKey(),
		Name : SettingKey(),
		Max : SettingKey(),
		Font : SettingKey(),
		Size : SettingKey(),
		Weight : SettingKey(),
		Retry : SettingKey(),
		Restart : SettingKey(),
		Merge : SettingKey(),
		Suffix : SettingKey(),
		Tray : SettingKey()
	}
}