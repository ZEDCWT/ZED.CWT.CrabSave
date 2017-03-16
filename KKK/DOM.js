'use strict'
var
ZED = require('@zed.cwt/zedquery'),
Prefix = 'ZED';

module.exports =
{
	id : 'id',
	cls : 'class',
	style : 'style',
	bottom : 'bottom',
	type : 'type',
	password : 'password',
	src : 'src',
	title : 'title',
	width : 'width',
	placeholder : 'placeholder',
	readonly : 'readonly',
	rows : 'rows',

	br : '<br>',
	div : '<div>',
	span : '<span>',
	input : '<input>',
	textarea : '<textarea>',
	img : '<img>',
	fieldset : '<fieldset>',
	legend : '<legend>',
	iframe : '<iframe>',

	Div : 'div',
	Img : 'img',

	load : 'load',
	error : 'error',
	mouseover : 'mouseover',
	mouseout : 'mouseout',
	mouseup : 'mouseup',
	click : 'click',
	focus : 'focus',
	blur : 'blur',
	einput : 'input',
	aniend : 'animationend',
	trsend : 'transitionend',

	nbsp : '\xa0',

	Input : Prefix + 'Input',
	Button : Prefix + 'Button',
	NoSelect : Prefix + 'NoSelect',
	Tab : Prefix + 'TabTab',
	TabOn : Prefix + 'TabOn',
	Pager : Prefix + 'Pager',
	ListView : Prefix + 'ListView',
	ListViewParent : Prefix + 'ListViewParent',
	ListViewItem : Prefix + 'ListViewItem',
	VerticalMiddle : Prefix + 'VerticalMiddle',

	Card :
	{
		R : ZED.KeyGen(),
		Init : ZED.KeyGen(),
		Cold : ZED.KeyGen(),
		Hot : ZED.KeyGen(),
		History : ZED.KeyGen()
	}
}