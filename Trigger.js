var
Root = __dirname,

ZED = require('@zed.cwt/zedquery'),

Path = require('path'),

Setting = require('./Setting'),

Electron = require('electron'),
App = Electron.app,
BrowserWindow = Electron.BrowserWindow,

StoredWindow,

Common = function(Q,W,P)
{
	P = ZED.invokeProp('preventDefault')
	Q.webContents.on('new-window',P)
		.on('will-navigate',P)
},

Create = function()
{
	var
	Window = new BrowserWindow(
	{
		width : 800,
		height : 600
	});

	StoredWindow = Window

	Common(Window)

	Window
		.on('resize',function()
		{
			Window.getSize()
			Setting.Save()
		})
		.on('closed',function()
		{
			StoredWindow = undefined
		})
		.loadURL('file://' + Path.join(Root,'Outer/Rainbow.html'),
		{
			userAgent : Setting.Config.UA
		})
};

App.on('ready',Create)
	.on('activate',function()
	{
		StoredWindow || Create('Main')
	})
	.on('window-all-closed',function()
	{
		'darwin' === process.platform || App.quit()
	})

ZED.Merge(global,
{
	Pegasus :
	{
		Setting : Setting,
		Config : Setting.Config
	}
})