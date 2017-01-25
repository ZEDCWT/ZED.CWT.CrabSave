var
ZED = require('@zed.cwt/zedquery'),
splitSpace = ZED.split(' '),

Config = require('./Config'),
Setting = require('./Setting'),

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
	Window = new Electron.BrowserWindow(ZED.pick(splitSpace('width height x y'),Setting.Data()));

	Setting.Data('Max') && Window.maximize()
	Created = true
Window.webContents.toggleDevTools()
	ONS(Window.webContents,'new-window will-navigate',ZED.invokeProp('preventDefault'))
	ONS(Window,'resize move maximize minimize',function(M,R)
	{
		R = {Max : M = Window.isMaximized()}
		M || ZED.Merge(R,Window.getBounds())
		Setting.Save(R)
	})
	Window.on('closed',function()
	{
		Action.off(false)
		Created = undefined
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
	App
		.on('ready',Create)
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
			//W.setMenu(null)
		})

	Electron.ipcMain
		.on('CMD',ZED.flip(ZED.bind_(Action.emit,Action)))

	Roll(process.argv)
}