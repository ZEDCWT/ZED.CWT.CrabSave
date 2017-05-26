'use strict'
var
ZED = require('@zed.cwt/zedquery'),

KeySiteName = require('../Key').Site.Name,

Bilibili = require('./Site.Bilibili'),
YouTube = require('./Site.YouTube'),
Niconico = require('./Site.NicoNico'),
ToonsTV = require('./Site.ToonsTV'),
Iwara = require('./Site.Iwara.Main'),
IwaraEcchi = require('./Site.Iwara.Ecchi'),

All =
[
	Bilibili,
	YouTube,
	Niconico,
	ToonsTV,
	Iwara,
	IwaraEcchi
],
Map =
{
	bili : Bilibili,
	b : Bilibili,
	ytb : YouTube,
	y : YouTube,
	ニコニコ : Niconico,
	ニコ : Niconico,
	nico : Niconico,
	n : Niconico,
	toons : ToonsTV,
	t : ToonsTV,
	i : Iwara,
	ie : IwaraEcchi,
	ei : IwaraEcchi
};

ZED.each(function(V){Map[V[KeySiteName]] = Map[V[KeySiteName].toLowerCase()] = V},All)

module.exports =
{
	All : All,
	Map : Map
}