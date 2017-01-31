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
		//URL returns an array
		Word : KeyKey(),
		//[URL] reuse, a request object
		Suffix : KeyKey()
		//[Index] reuse
	},
	Queue :
	{
		Name : KeyKey(),
		Unique : KeyKey(),
		ID : KeyKey(),
		Title : KeyKey(),

		Info : KeyKey(),//false : not got, 1 : getting, true : got
		Active : KeyKey(),
		Running : KeyKey(),

		Author : KeyKey(),
		Date : KeyKey(),
		Suffix : KeyKey(),
		Size : KeyKey(),

		Part : KeyKey(),
		//[Title] reuse, optional part title
		//[URL] reuse, URL list
		//	URL
		//[URL] reuse, a request object
		//[Size] reuse
	}
}