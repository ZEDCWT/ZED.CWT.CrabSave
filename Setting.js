var
ZED = require('@zed.cwt/zedquery'),
Path = require('path'),
FS = require('fs'),
Config = require('./Config'),
SettingFile = Config.PathStore('Setting.json'),
Setting = {},

Folder = function(Q)
{
	if (!FS.existsSync(Q))
	{
		Folder(Path.join(Q,'..'))
		FS.mkdirSync(Q)
	}
};

try
{
	ZED.Merge(true,Setting,JSON.parse(FS.readFileSync(SettingFile).toString()))
}
catch(e){}

module.exports =
{
	Setting : Setting,
	Config : Config,
	Save : function()
	{
		Folder(Config.Store)
		FS.writeFileSync(SettingFile,ZED.OTJ(Setting,'\t',{Wrapper : '"',Zip : false}))
	}
}