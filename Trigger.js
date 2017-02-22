'use strict'
var
ZED = require('@zed.cwt/zedquery'),
splitSpace = ZED.split(' '),

Config = require('./Config'),
Position = require('./Window'),

Path = require('path'),

Electron = require('electron'),
App = Electron.app,



ONS = function(Q,O,E)
{
	ZED.each(function(V){Q.on(V,E)},splitSpace(O))
},



ActionWindow = ZED.curry(function(Q,W)
{
	try
	{
		Q(W.sender)
	}
	catch(e)
	{
		console.log('Unexpected error : ' + e)
		console.log(e.stack)
	}
}),
Action = ZED.Emitter()
	.on('dev',ActionWindow(function(Window)
	{
		Window.toggleDevTools()
	}))
	.on('reload',ActionWindow(function(Window)
	{
		Window.reload()
	})),



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
		Action.off(false)
		Created = false
	})
	.loadURL('file://' + Path.join(__dirname,'KKK/Base.htm'),
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

	Electron.ipcMain
		.on('CMD',ZED.flip(ZED.bind_(Action.emit,Action)))

	Roll(process.argv)
}