var
ZED = require('@zed.cwt/zedquery'),
_Lang = ZED.Lang(),
Lang = function(Q){return _Lang(Q,'')};

module.exports =
{
	L : _Lang,

	//Tab
	Browser : Lang('Browser'),
	Cold : Lang('Cold'),
	Hot : Lang('Hot'),
	History : Lang('History'),
	SignIn : Lang('Sign in'),
	Setting : Lang('Setting'),

	//Browser
	User : Lang('User'),
	UexRtn : Lang('Unexpected return from the server'),
	UknSite : Lang('Unknown site id $0$'),
	UknURL : Lang('Unknown URL format $0$')
}