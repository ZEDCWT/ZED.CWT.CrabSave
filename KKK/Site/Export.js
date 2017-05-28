'use strict'
var
ZED = require('@zed.cwt/zedquery'),

KeySiteName = require('../Key').Site.Name,

Bilibili = require('./Site.Bilibili'),
YouTube = require('./Site.YouTube'),
Niconico = require('./Site.NicoNico'),

Iwara = require('./Site.Iwara.Main'),
IwaraEcchi = require('./Site.Iwara.Ecchi'),
QQ = require('./Site.QQ'),
ToonsTV = require('./Site.ToonsTV'),

All =
[
	Bilibili,
	YouTube,
	Niconico,
	Iwara,
	IwaraEcchi,
	QQ,
	ToonsTV
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

ZED.each(V => Map[V[KeySiteName]] = Map[V[KeySiteName].toLowerCase()] = V,All)

module.exports =
{
	All : All,
	Map : Map
}