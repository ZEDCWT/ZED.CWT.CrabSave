var
ZED = require('@zed.cwt/zedquery'),

Package = require('./package.json'),

Path = require('path'),

Root = process.env.CRABSAVEPATH || Path.join(ZED.HOME,'ZED','CrabSave');

ZED.mkdirpSync(Root)

module.exports =
{
	Version : Package.version,
	Root : Root,
	UA : 'ZED.CWT/255.255.255.0(Unix) CrabSave/' + Package.version,

	Throttle : 300,
	Speed : 500
}