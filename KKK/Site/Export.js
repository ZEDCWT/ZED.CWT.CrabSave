'use strict'
var
ZED = require('@zed.cwt/zedquery'),

KeySiteName = require('../Key').Site.Name,

Bilibili = require('./Site.Bilibili'),
YouTube = require('./Site.YouTube'),
Niconico = require('./Site.NicoNico'),

M3U = require('./General.M3U'),

Iwara = require('./Site.Iwara.Main'),
IwaraEcchi = require('./Site.Iwara.Ecchi'),
LeTV = require('./Site.LeTV'),
QQ = require('./Site.QQ'),
Sina = require('./Site.Sina'),
ToonsTV = require('./Site.ToonsTV'),
Twitter = require('./Site.Twitter'),

All =
[
	Bilibili,
	YouTube,
	Niconico,

	M3U,

	Iwara,
	IwaraEcchi,
	LeTV,
	QQ,
	Sina,
	ToonsTV,
	Twitter
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

	mu : M3U,
	m3u : M3U,
	m3u8 : M3U,

	i : Iwara,
	ie : IwaraEcchi,
	ei : IwaraEcchi,

	le : LeTV,

	toons : ToonsTV,
	t : ToonsTV,

	twitter : Twitter,
	tw : Twitter
};

ZED.each(V => Map[V[KeySiteName]] = Map[V[KeySiteName].toLowerCase()] = V,All)

module.exports =
{
	All : All,
	Map : Map
}