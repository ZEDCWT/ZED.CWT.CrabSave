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

	//StatucBar
	Loading : Lang('Loading...'),

	//Browser
	Processing : Lang('Processing `/0/`'),
	Info : Lang('/0/,~,/1/,. ,/2/,//,/3/, item,/4/,. ,/5/,//,/6/, page,/7/,.'),
	User : Lang('User'),
	UexRtn : Lang('Unexpected return from the server'),
	UknSite : Lang('Unknown site id `/0/`'),
	UknURL : Lang('Unknown URL format `/0/`'),

	//Cold
	Select : Lang('Select'),
	//Cold : Lang('Cold'),
	//Hot : Lang('Hot'),
	//History : Lang('History'),
	AddCold : Lang('Append to cold list'),
	RmCold : Lang('Remove from cold list')
}