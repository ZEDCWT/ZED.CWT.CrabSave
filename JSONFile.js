'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Config = require('./Config'),

FS = require('fs'),
Path = require('path'),

Read = (Name,R) =>
{
	try{R = ZED.JTO(FS.readFileSync(Name))}
	catch(e){}
	return ZED.isObject(R) ? R : {}
};

module.exports = Name =>
{
	var
	File = Path.join(Config.Root,Name + '.json'),
	Default = {},
	Latest = Read(File),
	Data = Q => ZED.isNull(Q) ?
		Latest :
		'' === Latest[Q] || ZED.isNull(Latest[Q]) ?
			Default[Q] :
			Latest[Q];

	return {
		Data : Data,
		Default : Q => Default = Q,
		Replace : Q => Latest = Q,
		Save : ZED.throttle(Config.Throttle,Q =>
		{
			Q && ZED.Merge(true,Latest,Q)
			FS.writeFile(File,ZED.OTJ(Latest,'\t',{Line : '\r\n',UTF : true}),ZED.noop)
		}),
		Read : Q =>
		(
			Latest = Read(File),
			Data(Q)
		)
	}
}