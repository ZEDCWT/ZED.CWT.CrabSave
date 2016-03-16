var
Root = __dirname,

ZED = require('@zed.cwt/zedquery'),

FS = require('fs'),

Setting = require('./Setting'),

Electron = require('electron'),
App = Electron.app,
BrowserWindow = Electron.BrowserWindow,

StoredWindow,

Create = function()
{
	var
	Window = new BrowserWindow(
	{
		width : 800,
		height : 600
	});

	Setting.Save()

	Window
		.on('resize',function()
		{
			Window.getSize()
		})
		.on('closed',function()
		{
			StoredWindow = undefined
		})
		.loadURL('file://' + Root + '/Outer/Rainbow.html',
		{
			userAgent : Setting.Config.UA
		})
};

App.on('ready',Create)
	.on('activate',function()
	{
		StoredWindow || Create()
	})
	.on('window-all-closed',function()
	{
		'darwin' === process.platform || App.quit()
	})

ZED.Merge(global,
{
	Setting : Setting,
	Config : Setting.Config
})