var
ZED = require('@zed.cwt/zedquery'),
_Lang = ZED.Lang(),
Lang = function(Q){return _Lang(Q,'')};

module.exports =
{
	L : _Lang,

	Browser : Lang('Browser'),
	Uncommitted : Lang('Uncommitted'),
	Processing : Lang('Processing'),
	History : Lang('History'),
	SignIn : Lang('Sign in'),
	Setting : Lang('Setting')
}