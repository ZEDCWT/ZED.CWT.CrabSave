var
ZED = require('@zed.cwt/zedquery'),

Package = require('./package.json'),

env = process.env,
Path = require('path'),

Root = Path.join
(
	env.HOME ||
	env.HOMEDRIVE && env.HOMEPATH && (env.HOMEDRIVE + env.HOMEPATH) ||
	env.USERPROFILE,
	'ZED',
	'CrabSave'
);

ZED.mkdirpSync(Root)

module.exports =
{
	Version : Package.version,
	Root : Root,
	UA : 'ZED.CWT/255.255.255.0(Unix) CrabSave/' + Package.version
}