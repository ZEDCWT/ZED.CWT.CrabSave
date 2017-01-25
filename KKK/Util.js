var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Request = require('request').defaults({timeout : 20E3});

module.exports =
{
	RequestHead : Observable.wrapNode(Request,null,ZED.identity),
	RequestBody : Observable.wrapNode(Request,null,ZED.nthArg(1)),
	RequestFull : Observable.wrapNode(Request)
}