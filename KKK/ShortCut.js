'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Data = require('../JSONFile')('ShortCut'),

SwitchUp = 1,
SwitchDown = SwitchUp << 1,
SwitchOnce = SwitchDown << 1,

Command =
{
	PrevTab : 'Global.PrevTab',
	NextTab : 'Global.NextTab',
	CloseCover : 'Global.CloseCover',
	ToggleDev : 'Global.ToggleDev',
	Reload : 'Global.Reload',

	FocusURL : 'Browser.FocusURL',
	SelAll : 'Browser.SelAll',
	UnAll : 'Browser.SelClear',
	PageHead : 'Browser.PageHead',
	PagePrev : 'Browser.PagePrev',
	PageNext : 'Browser.PageNext',
	PageTail : 'Browser.PageTail',

	ListAll : 'List.SelAll',
	ListClear : 'List.SelClear',
	ListPgUp : 'List.PgUp',
	ListPgDn : 'List.PgDn',
	ListPgTp : 'List.PgTp',
	ListPgBt : 'List.PgBt'
},
DefaultMap = ZED.ReduceToObject
(
	Command.PrevTab,[['[',SwitchDown]],
	Command.NextTab,[[']',SwitchDown]],
	Command.CloseCover,'esc',
	Command.Reload,'ctrl+r',
	Command.ToggleDev,['shift+alt+d','f12'],

	Command.FocusURL,[['f1',SwitchDown]],
	Command.SelAll,'ctrl+a',
	Command.UnAll,'shift+ctrl+a',
	Command.PageHead,'h',
	Command.PagePrev,'j',
	Command.PageNext,'k',
	Command.PageTail,'l',

	Command.ListAll,'ctrl+a',
	Command.ListClear,'esc',
	Command.ListPgUp,[['pgup',SwitchDown]],
	Command.ListPgDn,[['pgdn',SwitchDown]],
	Command.ListPgTp,[['home',SwitchDown]],
	Command.ListPgBt,[['end',SwitchDown]]
);

module.exports =
{
	Up : SwitchUp,
	Down : SwitchDown,
	Once : SwitchOnce,
	Data : Data.Data,
	Save : function(Q,S)
	{
		Data.Data()[Q] = S
		Data.Save()
	},
	Remove : function(Q)
	{
		ZED.delete_(Q,Data.Data())
		Data.Save()
	},
	Command : Command,
	DefaultMap : DefaultMap
}