'use strict'
var
ZED = require('@zed.cwt/zedquery'),

KeySiteName = require('./Key').Site.Name,

Bilibili = require('./Site.Bilibili'),
Youtube = require('./Site.Youtube'),
Niconico = require('./Site.Niconico'),

All =
[
	Bilibili
	//Youtube,
	//Niconico
],
Map =
{
	bilibili : Bilibili,
	bili : Bilibili,
	youtube : Youtube,
	ytb : Youtube,
	niconico : Niconico,
	nico : Niconico
};

ZED.each(function(V){Map[V[KeySiteName]] = V},All)

module.exports =
{
	All : All,
	Map : Map
}