var
ZED = require('@zed.cwt/zedquery'),

Bilibili = require('./Site.Bilibili'),
Youtube = require('./Site.Youtube'),
Niconico = require('./Site.Niconico');

module.exports =
{
	All :
	[
		Bilibili
		//Youtube,
		//Niconico
	],
	Map :
	{
		bilibili : Bilibili,
		bili : Bilibili,
		youtube : Youtube,
		ytb : Youtube,
		niconico : Niconico,
		nico : Niconico
	}
}