'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Config = require('./Config'),
Position = require('./Window'),
Lang = require('./Lang'),
L = Lang.L,

Path = require('path'),

Electron = require('electron'),
App = Electron.app,

ONS = function(Q,O,E)
{
	ZED.each(function(V){Q.on(V,E)},O.split(' '))
},



DontCloseToTray,
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
	}),

	Quiting,

	TrayIcon,
	TrayRestore = function()
	{
		Window.show()
	},
	TrayExit = function()
	{
		Quiting = true
		App.quit()
	},
	TrayMake = function()
	{
		TrayIcon = new Electron.Tray('./TrayIcon.ico')
		TrayIcon.setToolTip('CrabSave')
		TrayIcon.setContextMenu(Electron.Menu.buildFromTemplate([
		{
			label : L(Lang.Restore),
			click : TrayRestore
		},{
			label : L(Lang.Exit),
			click : TrayExit
		}]))
		ONS(TrayIcon,'click double-click',TrayRestore)
	},
	TrayDestory = function()
	{
		TrayIcon && TrayIcon.destroy()
		TrayIcon = false
	};

	Created = true
	Data.Max && Window.maximize()
	ONS(Window.webContents,'new-window will-navigate',ZED.invokeProp('preventDefault'))
	ONS(Window,'resize move maximize minimize',function()
	{
		(Data.Max = Window.isMaximized()) || ZED.Merge(true,Data,Window.getBounds())
		Position.Save()
	})
	Electron.ipcMain.on('Tray',function(E,Q)
	{
		DontCloseToTray = Q
		Q ? TrayDestory() : TrayMake()
	})
	Window.on('close',function(E)
	{
		if (!DontCloseToTray && !Quiting)
		{
			E.preventDefault()
			Window.hide()
		}
	}).on('closed',function()
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