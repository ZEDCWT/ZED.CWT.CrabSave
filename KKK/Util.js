'use strict'
var
undefined,
True = !undefined,
False = !True,

ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

KeyQueue = require('./Key').Queue,
L = require('./Lang').L,

Request = require('request').defaults({timeout : 20E3}),
RequestHead = function(Q)
{
	return Observable.create(function(O,X)
	{
		X = Request(Q).on('error',function(E){O.error(E)})
			.on('response',function(H)
			{
				X.abort()
				O.data(H).finish()
			})
		return function(){X.abort()}
	})
},
RequestBase = function(H)
{
	return function(Q)
	{
		return Observable.create(function(O,X)
		{
			X = Request(Q,function(E,I,R)
			{
				E ? O.error(E) : O.data(H ? [I,R] : R).finish()
			})
			return function(){X.abort()}
		})
	}
};

module.exports =
{
	U : undefined,
	N : null,
	T : True,
	F : False,

	Bus : ZED.Emitter(),

	RequestHead : RequestHead,
	RequestBody : RequestBase(False),
	RequestFull : RequestBase(True),

	//No dependencies
	MakeUnique : function(Q,S){return Q + '.' + S},
	MakeLabelID : function(Q)
	{
		return RegExp('(?:^|[^a-z])' + Q + '(?:[^a-z]\\D*)??(\\d+)','i')
	},
	StopProp : function(E){E.stopPropagation()},

	//Global dependencies
	MF : function(Q,S){return ZED.match(Q,S)[1] || ''},
	PadTo : function(S,Q)
	{
		return ZED.FillLeft(Q,(S - 1 + '').length)
	},
	ReplaceLang : function(Q,S)
	{
		return ZED.Replace(L(Q),'/',ZED.isArray(S) ? S : ZED.tail(arguments))
	},
	CalcSize : ZED.pipe(ZED.sum,ZED.FormatSize),
	CookieSolve : function(Q)
	{
		return ZED.reduce(function(D,V)
		{
			V = V.split('; ')[0].split('=')
			D[V[0]] = V[1]
		},{},Q.headers['set-cookie'])
	},
	CookieMake : function(Q)
	{
		return ZED.Reduce(Q,function(D,F,V)
		{
			D.push(F + '=' + V)
		},[]).sort().join('; ')
	},
	CookieTo : function(Q)
	{
		return ZED.reduce(function(D,V)
		{
			V = V.split('=')
			V[0] && V[1] && (D[V[0]] = V[1])
		},{},Q.split('; '))
	},

	//Local dependencies
	SetSize : function(Q,S)
	{
		Q[KeyQueue.Size] = ZED.sum(S)
		Q[KeyQueue.Sizes] = S
		Q[KeyQueue.Done] = ZED.repeat(0,S.length)
	}
}