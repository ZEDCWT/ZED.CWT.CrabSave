'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Data = require('../JSONFile')('ShortCut'),

Command =
{
	PrevTab : 'Global.PrevTab',
	NextTab : 'Global.NextTab',
	ToggleDev : 'Global.ToggleDev',

	SelAll : 'Browser.SelAll',
	UnAll : 'Browser.SelClear',
	PageHead : 'Browser.PageHead',
	PagePrev : 'Browser.PagePrev',
	PageNext : 'Browser.PageNext',
	PageTail : 'Browser.PageTail',

	ListAll : 'List.SelAll',
	ListClear : 'List.SelClear'
},
DefaultMap = ZED.ReduceToObject
(
	Command.PrevTab,'[',
	Command.NextTab,']',
	Command.ToggleDev,['shift+alt+d','f12'],

	Command.SelAll,'ctrl+a',
	Command.UnAll,'shift+ctrl+a',
	Command.PageHead,'h',
	Command.PagePrev,'j',
	Command.PageNext,'k',
	Command.PageTail,'l',

	Command.ListAll,'ctrl+a',
	Command.ListClear,'esc'
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