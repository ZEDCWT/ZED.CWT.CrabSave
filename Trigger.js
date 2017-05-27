'use strict'
var
undefined,
True = !undefined,
False = !True,

ZED = require('@zed.cwt/zedquery'),

Config = require('./Config'),
Position = require('./Window'),
Lang = require('./Lang'),
L = Lang.L,

Path = require('path'),

Electron = require('electron'),
App = Electron.app,

ONS = (Q,O,E) => ZED.each(V => Q.on(V,E),O.split(' ')),



DontCloseToTray,
Created,
Create = () =>
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
			webSecurity : False
		}
	}),

	Quiting,

	TrayIcon,
	TrayRestore = () => Window.show(),
	TrayExit = () =>
	{
		Quiting = True
		App.quit()
	},
	TrayMake = () =>
	{
		if (!TrayIcon)
		{
			TrayIcon = new Electron.Tray(Path.join(__dirname,'TrayIcon.ico'))
			TrayIcon.setToolTip('CrabSave')
			TrayIcon.setContextMenu(Electron.Menu.buildFromTemplate([
			{
				label : L(Lang.DevTool),
				click : () => Window.webContents.toggleDevTools()
			},{
				label : L(Lang.Restore),
				click : TrayRestore
			},{
				label : L(Lang.Exit),
				click : TrayExit
			}]))
			ONS(TrayIcon,'click double-click',TrayRestore)
		}
	},
	TrayDestory = () =>
	{
		TrayIcon && TrayIcon.destroy()
		TrayIcon = False
	};

	Created = True
	Data.Max && Window.maximize()
	ONS(Window.webContents,'new-window will-navigate',ZED.invokeProp('preventDefault'))
	ONS(Window,'resize move maximize minimize',() =>
	{
		(Data.Max = Window.isMaximized()) || ZED.Merge(True,Data,Window.getBounds())
		Position.Save()
	})
	Electron.ipcMain.on('Tray',(E,Q) =>
	{
		DontCloseToTray = Q
		Q ? TrayDestory() : TrayMake()
	}).on('Ping',(E,Q) => TrayIcon && TrayIcon.setToolTip(Q))
	Window.on('close',E =>
	{
		if (!DontCloseToTray && !Quiting)
		{
			E.preventDefault()
			Window.hide()
		}
	}).on('closed',() => Created = False).loadURL
	(
		'file://' + Path.join(__dirname,'KKK/Base.htm'),
		{userAgent : Config.UA}
	)
},



Roll = Q =>
{
	if (2 < Q.length)
	{

	}
};

if (App.makeSingleInstance(Roll)) App.quit()
else
{
	App.setPath('userData',Path.join(Config.Root,'UserData'))
	App.on('ready',Create)
		.on('activate',() => Created || Create())
		.on('window-all-closed',() => 'darwin' === process.platform || App.quit())
		//.on('browser-window-created',(E,W) => W.setMenu(null))

	Roll(process.argv)
}