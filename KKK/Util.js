'use strict'
var
undefined,

ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Request = require('request').defaults({timeout : 20E3}),
RequestBase = function(H)
{
	return function(Q)
	{
		return Observable.create(function(O)
		{
			Q = Request(Q,function(E,I,R)
			{
				E ? O.error(E) : O.data(H(I,R)).finish()
			})
			return function()
			{
				Q.abort()
			}
		})
	}
};

module.exports =
{
	U : undefined,
	N : null,
	T : !undefined,
	F : !!undefined,

	Bus : ZED.Emitter(),

	RequestHead : RequestBase(ZED.identity),
	RequestBody : RequestBase(ZED.nthArg(1)),
	RequestFull : RequestBase(function(I,R){return [I,R]}),

	MakeUnique : function(Q,S){return Q + '.' + S},

	CalcSize : ZED.pipe(ZED.sum,ZED.FormatSize),

	StopProp : function(E){E.stopPropagation()}
}