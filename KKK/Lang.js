'use strict'
var
ZED = require('@zed.cwt/zedquery'),
_Lang = ZED.Lang(),
Lang = function(Q){return _Lang(Q,'')};

module.exports =
{
	L : _Lang,

	//Fatal
	Fatal : Lang('Fatal : /0/'),
	FData : Lang('Database failed to open'),

	//Tab
	Browser : Lang('Browser'),
	Cold : Lang('Cold'),
	Hot : Lang('Hot'),
	History : Lang('History'),
	Component : Lang('Component'),
	SignIn : Lang('Sign in'),
	Shortcut : Lang('Shortcut'),
	Setting : Lang('Setting'),

	//StatucBar
	Loading : Lang('Loading...'),
	SelectingN : Lang('Selecting /0/ item/1/'),
	CommittingN : Lang('Committing /0/ item/1/'),
	CommittedN : Lang('Committed /0/ item/1/'),
	RemovingN : Lang('Removing /0/ item/1/'),
	RemovedN : Lang('Removed /0/ item/1/'),
	RestartingN : Lang('Restarting /0/ item/1/'),
	RestartedN : Lang('Restarted /0/ item/1/'),
	PausingN : Lang('Pausing /0/ item/1/'),
	PausedN : Lang('Paused /0/ item/1/'),
	ErrWhile : Lang('Failed to /0/ because of a databse error'),

	//Shape
	SelAll : Lang('Select all'),
	UnAll : Lang('Unselect all'),
	Commit : Lang('Commit'),
	CommitAll : Lang('Commit all'),
	Remove : Lang('Remove'),



	//Browser
	URL : Lang('URL'),
	ProcURL : Lang('Processing `/0/`'),
	PageInfo : Lang('/0/,~,/1/,. ,/2/,//,/3/, item,/4/,. ,/5/,//,/6/, page,/7/,.'),
	Video : Lang('Video'),
	User : Lang('User'),
	Channel : Lang('Channel'),
	Playlist : Lang('Playlist'),
	Mylist : Lang('Mylist'),
	Dynamic : Lang('Dynamic'),
	Subs : Lang('Subscription'),
	UknSite : Lang('Unknown site id `/0/`'),
	UknURL : Lang('Unknown URL format `/0/`'),
	Bad : Lang('Bad response'),
	BadC : Lang('Bad response, code : /0/'),
	BadE : Lang('Bad response, message : /0/'),
	BadCE : Lang('Bad response, code : /0/, message : /1/'),
	EmptyList : Lang('No content'),

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
	RRefresh : Lang('Ready to refresh URL'),
	Refreshing : Lang('Refreshing URL'),
	Queuing : Lang('Queuing'),
	Processing : Lang('Processing'),
	Error : Lang('Error'),
	EInfo : Lang('Failed to load infomation'),
	EURL : Lang('URL expired'),
	EConn : Lang('Connection error'),
	Paused : Lang('Paused'),
	Finish : Lang('Finish'),

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

	//Component
	ComLoad : Lang('Load component'),
	ComLoaded : Lang('Component is loaded'),
	ComCheck : Lang('Check if loaded'),
	ComNot : Lang('Component is not loaded'),

	//Sign in
	ID : Lang('Sign in ID'),
	Password : Lang('Password'),
	ClkLoad : Lang('Click to load'),
	VCode : Lang('Verify code'),
	VCNone : Lang('Not required'),
	VCFail : Lang('Failed to load'),
	Cookie : Lang('Cookie'),
	CookieSaved : Lang('Saved infomation into cookie'),
	Check : Lang('Check'),
	Signing : Lang('Signing in...'),
	Signed : Lang('Signed in'),
	SIError : Lang('Error occured while signing in'),
	Checking : Lang('Checking if signed in'),
	NotSigned : Lang('Not signed in'),
	Checked : Lang('Signed in as /0/'),
	CheckError : Lang('Error occured while checking if signed in'),

	//Setting
	DirSel : Lang('Select a directory'),
	MaxDown : Lang('Maximum number of active downloads'),
	FName : Lang('File name format'),
	Font : Lang('Font'),
	Size : Lang('Font size'),
	Weight : Lang('Font weight'),
	RetryT : Lang('Times to retry before moving a task with no response to the end of the queue'),
	RestartT : Lang('Time(seconds) to wait before restarting a task after error occured or URL expired')
}