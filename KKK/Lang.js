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
	Video : Lang('Video'),
	User : Lang('User'),
	Channel : Lang('Channel'),
	Mylist : Lang('Mylist'),
	UknSite : Lang('Unknown site id `/0/`'),
	UknURL : Lang('Unknown URL format `/0/`'),
	Bad : Lang('Bad response'),
	BadCE : Lang('Bad response, code : /0/, message : /1/'),

	//Cold
	Select : Lang('Select'),
	AddCold : Lang('Append to cold list'),
	RmCold : Lang('Remove from cold list'),

	//Hot
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
	NoDir : Lang('Not determined'),
	Downloaded : Lang('Downloaded'),
	TTS : Lang('Total size'),
	Calculating : Lang('Calculating'),
	PartN : Lang('Part /0/ // /1/'),
	SizeP : Lang('/0/ // /1/, /2/%'),
	SizeNP : Lang('/0/ // Unknown'),
	Completed : Lang('Completed'),

	//History
	HiInfo : Lang('/0/, /1/ file/2/'),

	//Setting
	MaxDown : Lang('Maximum number of active downloads'),
	FName : Lang('File name format'),
	Font : Lang('Font'),
	Size : Lang('Font size'),
	Weight : Lang('Font weight')
}