'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Command =
{
	SelAll : 'Browser.SelectAll',
	UnAll : 'Browser.UnselectAll',
	PageHead : 'Browser.PageHead',
	PagePrev : 'Browser.PagePrev',
	PageNext : 'Browser.PageNext',
	PageTail : 'Browser.PageTail'
},
DefaultMap = ZED.ReduceToObject
(
	Command.SelAll,'ctrl+a',
	Command.UnAll,'ctrl+shift+a',
	Command.PageHead,'h',
	Command.PagePrev,'j',
	Command.PageNext,'k',
	Command.PageTail,'l'
);

module.exports =
{
	Command : Command,
	DefaultMap : DefaultMap
}