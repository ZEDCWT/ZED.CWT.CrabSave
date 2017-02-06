'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Config = require('./Config'),

FS = require('fs'),
Path = require('path'),

Read = function(Name,R)
{
	try{R = ZED.JTO(FS.readFileSync(Name))}
	catch(e){}
	return ZED.isObject(R) ? R : {}
};

module.exports = function(Name)
{
	var
	File = Path.join(Config.Root,Name + '.json'),
	Default = {},
	Latest = Read(File),
	Data = function(Q)
	{
		return ZED.isNull(Q) ?
			Latest :
			'' === Latest[Q] || ZED.isNull(Latest[Q]) ?
				Default[Q] :
				Latest[Q]
	};

	return {
		Data : Data,
		Default : function(Q){Default = Q},
		Replace : function(Q){Latest = Q},
		Save : ZED.throttle(Config.Throttle,function(Q)
		{
			Q && ZED.Merge(true,Latest,Q)
			FS.writeFile(File,ZED.OTJ(Latest,'\t',{Line : '\r\n'}),ZED.noop)
		}),
		Read : function(Q)
		{
			Latest = Read(File)
			return Data(Q)
		}
	}
}