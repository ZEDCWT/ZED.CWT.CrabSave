var
ZED = require('@zed.cwt/zedquery'),

Deploy = require('./Deploy'),

FS = require('fs'),
Path = require('path'),

Read = function(Name,R)
{
	try
	{
		R = ZED.JTO(FS.readFileSync(Name))
	}
	catch(e){}
	return ZED.isObject(R) ? R : {}
},
Save = ZED.Emitter(),

Reuse = {};

module.exports = function(Name)
{
	var
	Data,
	File = Path.join(Deploy.Root,Name + '.json');

	if (!Reuse[Name])
	{
		Save.on(Name,function(Q)
		{
			ZED.Merge(true,Data,Q)
			FS.writeFile(File,ZED.OTJ(Data,'\t'))
		},300)

		Data = Read(File)

		Reuse[Name] =
		{
			Data : function(Q)
			{
				return ZED.isNull(Q) ? Data : Data[Q]
			},
			Save : function(Q)
			{
				Save.emit(Name,Q)
			},
			Read : function(Q)
			{
				Data = Read(File)
				return ZED.isNull(Q) ? Data : Data[Q]
			}
		}
	}

	return Reuse[Name]
}