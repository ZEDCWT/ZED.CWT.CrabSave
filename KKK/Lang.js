'use strict'
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
	SelectingN : Lang('Selecting /0/ item/1/'),
	CommittedN : Lang('Committed /0/ item/1/'),
	RemovedN : Lang('Removed /0/ item/1/'),
	RestartedN : Lang('Restarted /0/ item/1/'),
	PausedN : Lang('Paused /0/ item/1/'),

	//Shape
	SelAll : Lang('Select all'),
	UnAll : Lang('Unselect all'),
	Commit : Lang('Commit'),
	CommitAll : Lang('Commit all'),
	Remove : Lang('Remove'),



	//Browser
	ProcURL : Lang('Processing `/0/`'),
	PageInfo : Lang('/0/,~,/1/,. ,/2/,//,/3/, item,/4/,. ,/5/,//,/6/, page,/7/,.'),
	User : Lang('User'),
	UexRtn : Lang('Unexpected return from the server'),
	UknSite : Lang('Unknown site id `/0/`'),
	UknURL : Lang('Unknown URL format `/0/`'),

	//Cold
	Select : Lang('Select'),
	//[Cold]
	//[Hot]
	//[History]
	AddCold : Lang('Append to cold list'),
	RmCold : Lang('Remove from cold list'),

	//Hot
	//[Remove]
	Restart : Lang('Restart'),
	Pause : Lang('Pause'),
	More : Lang('View detail'),
	ReadyInfo : Lang('Ready to get infomation'),
	GetInfo : Lang('Getting infomation...'),
	GetSize : Lang('Getting size...'),
	SizeUn : Lang('Unknow size'),
	Queuing : Lang('Queuing'),
	Processing : Lang('Processing'),
	Paused : Lang('Paused'),

	//Detail
	Created : Lang('Created'),
	Progress : Lang('Progress'),
	Unfinished : Lang('Unfinished'),
	FinishedAt : Lang('Finished at /0/'),
	Author : Lang('Author'),
	UpDate : Lang('Uploaded date'),
	Parts : Lang('Parts'),
	Files : Lang('Files'),
	Directory : Lang('Directory'),
	Downloaded : Lang('Downloaded'),
	TTS : Lang('Total size'),
	Calculating : Lang('Calculating'),
	PartN : Lang('Part /0/ // /1/'),
	SizeP : Lang('/0/ // /1/, /2/%'),
	SizeNP : Lang('/0/ // Unknown'),
	Completed : Lang('Completed')
}