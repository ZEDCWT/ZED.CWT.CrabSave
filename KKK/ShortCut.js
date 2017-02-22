'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Data = require('../JSONFile')('ShortCut'),

Command =
{
	ToggleDev : 'Global.ToggleDev',

	SelAll : 'Browser.SelectAll',
	UnAll : 'Browser.Clear',
	PageHead : 'Browser.PageHead',
	PagePrev : 'Browser.PagePrev',
	PageNext : 'Browser.PageNext',
	PageTail : 'Browser.PageTail',

	ListAll : 'List.SelectAll',
	ListClear : 'List.Clear'
},
DefaultMap = ZED.ReduceToObject
(
	Command.ToggleDev,['alt+shift+d','f12'],

	Command.SelAll,'ctrl+a',
	Command.UnAll,'ctrl+shift+a',
	Command.PageHead,'h',
	Command.PagePrev,'j',
	Command.PageNext,'k',
	Command.PageTail,'l',

	Command.ListAll,'ctrl+a',
	Command.ListClear,'esc'
);

module.exports =
{
	Command : Command,
	DefaultMap : DefaultMap
}