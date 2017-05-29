'use strict'
var
ZED = require('@zed.cwt/zedquery'),

KeySiteName = require('../Key').Site.Name,

Bilibili = require('./Site.Bilibili'),
YouTube = require('./Site.YouTube'),
Niconico = require('./Site.NicoNico'),

Iwara = require('./Site.Iwara.Main'),
IwaraEcchi = require('./Site.Iwara.Ecchi'),
LeTV = require('./Site.LeTV'),
QQ = require('./Site.QQ'),
Sina = require('./Site.Sina'),
ToonsTV = require('./Site.ToonsTV'),

All =
[
	Bilibili,
	YouTube,
	Niconico,

	Iwara,
	IwaraEcchi,
	LeTV,
	QQ,
	Sina,
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

	i : Iwara,
	ie : IwaraEcchi,
	ei : IwaraEcchi,

	le : LeTV,

	toons : ToonsTV,
	t : ToonsTV
};

ZED.each(V => Map[V[KeySiteName]] = Map[V[KeySiteName].toLowerCase()] = V,All)

module.exports =
{
	All : All,
	Map : Map
}