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
	bili : Bilibili,
	ytb : YouTube,
	ニコニコ : Niconico,
	ニコ : Niconico,
	nico : Niconico
};

ZED.each(function(V){Map[V[KeySiteName]] = Map[V[KeySiteName].toLowerCase()] = V},All)

module.exports =
{
	All : All,
	Map : Map
}