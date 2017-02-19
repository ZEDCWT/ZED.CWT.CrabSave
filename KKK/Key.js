'use strict'
var
ZED = require('@zed.cwt/zedquery'),

KeyKey = ZED.StableKeyGen(20170122);

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
		Restart : KeyKey()
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
		//Item
		Unique : KeyKey(),
		Index : KeyKey(),
		ID : KeyKey(),
		Img : KeyKey(),
		Title : KeyKey(),
		Author : KeyKey(),
		Date : KeyKey(),
		//URL
		URL : KeyKey(),
		//IDView
		IDView : KeyKey(),
		//Pack
		Pack : KeyKey()
	},
	Queue :
	{
		Unique : KeyKey(),
		Name : KeyKey(),
		ID : KeyKey(),
		IDHis : KeyKey(),

		Title : KeyKey(),

		Created : KeyKey(),
		Finished : KeyKey(),

		Active : KeyKey(),

		Author : KeyKey(),
		Date : KeyKey(),

		Part : KeyKey(),
		//[Title] reuse, optional part title
		URL : KeyKey(),
		Suffix : KeyKey(),

		Size : KeyKey(),
		Sizes : KeyKey(),

		Done : KeyKey(),
		DoneSum : KeyKey(),
		Format : KeyKey(),
		Root : KeyKey(),
		Dir : KeyKey(),
		File : KeyKey()
	}
}