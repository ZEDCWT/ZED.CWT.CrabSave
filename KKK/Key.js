'use strict'
var
ZED = require('@zed.cwt/zedquery'),

KeyKey = ZED.StableKeyGen(20170122);

module.exports =
{
	Site :
	{
		Name : KeyKey(),
		Judge : KeyKey(),
		//Login
		Login : KeyKey(),
		Check : KeyKey(),
		Require : KeyKey(),
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
		Created : KeyKey(),
		Finished : KeyKey(),
		Name : KeyKey(),
		Unique : KeyKey(),
		ID : KeyKey(),
		IDHis : KeyKey(),
		Title : KeyKey(),

		Active : KeyKey(),
		Running : KeyKey(),

		Author : KeyKey(),
		Date : KeyKey(),
		Size : KeyKey(),
		Sizes : KeyKey(),
		Done : KeyKey(),

		Part : KeyKey(),
		//[Title] reuse, optional part title
		URL : KeyKey(),
		Suffix : KeyKey(),

		File : KeyKey(),

		Format : KeyKey(),
		Root : KeyKey(),
		Dir : KeyKey()
	},
	Setting :
	{
		Dir : KeyKey(),
		Name : KeyKey(),
		Max : KeyKey(),
		Font : KeyKey(),
		Size : KeyKey(),
		Weight : KeyKey()
	}
}