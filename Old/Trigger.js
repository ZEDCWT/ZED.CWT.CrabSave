var
Root = __dirname,

ZED = require('@zed.cwt/zedquery'),

Deploy = require('./Deploy'),
Setting = require('./Setting'),

Path = require('path'),

Electron = require('electron'),

splitSpace = ZED.split(' '),

ONS = function(Q,O,E)
{
	ZED.each(function(V){Q.on(V,E)},splitSpace(O))
},

Created,
Create = function()
{
	var
	Window = new Electron.BrowserWindow(ZED.pick(splitSpace('width height x y'),Setting.Data()));

	Setting.Data('Max') && Window.maximize()
	Created = true

	ONS(Window.webContents,'new-window will-navigate',ZED.invokeProp('preventDefault'))
	ONS(Window,'resize move maximize minimize',function(M,R)
	{
		R = {Max : M = Window.isMaximized()}
		M || ZED.Merge(R,Window.getBounds())
		Setting.Save(R)
	})
	Window
		.on('closed',function()
		{
			Action.off(false)
			Created = undefined
		})
		.loadURL('file://' + Path.join(Root,'Pot/IO.html'),
		{
			userAgent : Deploy.UA
		})
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



Roll = function(Q)
{
	if (2 < Q.length)
	{

	}
};

if (Electron.app.makeSingleInstance(Roll)) Electron.app.quit()
else
{
	Electron.app
		.on('ready',Create)
		.on('activate',function()
		{
			Created || Create()
		})
		.on('window-all-closed',function()
		{
			'darwin' === process.platform || Electron.app.quit()
		})
		.on('browser-window-created',function(E,W)
		{
			W.setMenu(null)
		})

	Electron.ipcMain
		.on('CMD',ZED.flip(ZED.bind_(Action.emit,Action)))
		.on('Mirror',function(E,R)
		{
			if (R) Setting.Save({Mirror : R})
			else
			{
				R = Setting.Read('Mirror')
				ZED.isObject(R) || (R = {})
				E.returnValue = R
			}
		})

	Roll(process.argv)
}