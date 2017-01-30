var
ZED = require('@zed.cwt/zedquery'),
Prefix = 'ZED';

module.exports =
{
	id : 'id',
	cls : 'class',
	src : 'src',
	title : 'title',
	placeholder : 'placeholder',

	br : '<br>',
	div : '<div>',
	span : '<span>',
	input : '<input>',
	img : '<img>',
	fieldset : '<fieldset>',
	legend : '<legend>',

	Div : 'div',
	Img : 'img',

	mouseover : 'mouseover',
	mouseout : 'mouseout',
	mouseup : 'mouseup',
	click : 'click',
	aniend : 'animationend',

	Input : Prefix + 'Input',
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