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
	checkbox : 'checkbox',
	checked : 'checked',
	src : 'src',
	title : 'title',
	href : 'href',
	width : 'width',
	placeholder : 'placeholder',
	readonly : 'readonly',
	rows : 'rows',
	for : 'for',

	br : '<br>',
	div : '<div>',
	span : '<span>',
	input : '<input>',
	textarea : '<textarea>',
	img : '<img>',
	a : '<a>',
	fieldset : '<fieldset>',
	legend : '<legend>',
	iframe : '<iframe>',
	label : '<label>',

	Div : 'div',
	Img : 'img',
	A : 'a',

	load : 'load',
	error : 'error',
	mouseover : 'mouseover',
	mouseout : 'mouseout',
	mousedown : 'mousedown',
	mouseup : 'mouseup',
	click : 'click',
	focus : 'focus',
	blur : 'blur',
	einput : 'input',
	change : 'change',
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