'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Data = require('../JSONFile')('ShortCut'),

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
	Command.PrevTab,'[',
	Command.NextTab,']',
	Command.CloseCover,'esc',
	Command.Reload,'ctrl+r',
	Command.ToggleDev,['shift+alt+d','f12'],

	Command.FocusURL,'f1',
	Command.SelAll,'ctrl+a',
	Command.UnAll,'shift+ctrl+a',
	Command.PageHead,'h',
	Command.PagePrev,'j',
	Command.PageNext,'k',
	Command.PageTail,'l',

	Command.ListAll,'ctrl+a',
	Command.ListClear,'esc',
	Command.ListPgUp,'pgup',
	Command.ListPgDn,'pgdn',
	Command.ListPgTp,'home',
	Command.ListPgBt,'end'
);

module.exports =
{
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