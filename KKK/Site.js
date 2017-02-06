'use strict'
var
ZED = require('@zed.cwt/zedquery'),

KeySiteName = require('./Key').Site.Name,

Bilibili = require('./Site.Bilibili'),
YouTube = require('./Site.YouTube'),
Niconico = require('./Site.Niconico'),

All =
[
	Bilibili,
	YouTube,
	Niconico
],
Map =
{
	bilibili : Bilibili,
	bili : Bilibili,
	youtube : YouTube,
	ytb : YouTube,
	niconico : Niconico,
	nico : Niconico
};

ZED.each(function(V){Map[V[KeySiteName]] = V},All)

module.exports =
{
	All : All,
	Map : Map
}