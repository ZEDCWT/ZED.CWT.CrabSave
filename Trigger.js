'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Config = require('./Config'),
Position = require('./Window'),

Path = require('path'),

Electron = require('electron'),
App = Electron.app,



ONS = function(Q,O,E)
{
	ZED.each(function(V){Q.on(V,E)},O.split(' '))
},

Created,
Create = function()
{
	var
	Data = Position.Data(),
	Window = new Electron.BrowserWindow(
	{
		width : Data.width,
		height : Data.height,
		x : Data.x,
		y : Data.y,
		webPreferences :
		{
			webSecurity : false
		}
	});

	Data.Max && Window.maximize()
	Created = true
	ONS(Window.webContents,'new-window will-navigate',ZED.invokeProp('preventDefault'))
	ONS(Window,'resize move maximize minimize',function()
	{
		(Data.Max = Window.isMaximized()) || ZED.Merge(true,Data,Window.getBounds())
		Position.Save()
	})
	Window.on('closed',function()
	{
		Created = false
	}).loadURL('file://' + Path.join(__dirname,'KKK/Base.htm'),
	{
		userAgent : Config.UA
	})
},



Roll = function(Q)
{
	if (2 < Q.length)
	{

	}
};

if (App.makeSingleInstance(Roll)) App.quit()
else
{
	App.on('ready',Create)
		.on('activate',function()
		{
			Created || Create()
		})
		.on('window-all-closed',function()
		{
			'darwin' === process.platform || App.quit()
		})
		.on('browser-window-created',function(E,W)
		{
			W.setMenu(null)
		})

	Roll(process.argv)
}