'use strict'
var
undefined,
True = !undefined,
False = !True,

ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,
$ = require('@zed.cwt/jquery'),

Lang = require('./Lang'),
L = Lang.L,

FS = require('graceful-fs'),
Request = require('request').defaults({timeout : 10E3}),
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

	//Observable
	RequestHead : RequestHead,
	RequestBody : RequestBase(False),
	RequestFull : RequestBase(True),
	ajax : function(Q)
	{
		ZED.isObject(Q) || (Q = {url : Q})

		return Observable.create(function(O,X)
		{
			X = $.ajax(ZED.Merge(
			{
				dataType : 'text',
				success : function(Q){O.data(Q).finish()},
				error : function(E){O.error(E)}
			},Q))
			return function(){X.abort()}
		})
	},
	mkdirp : Observable.wrapNode(ZED.mkdirp),
	readFile : Observable.wrapNode(FS.readFile),
	writeFile : Observable.wrapNode(FS.writeFile),

	//No dependencies
	Debug : function()
	{
		console.error.apply(console,ZED.prepend('DEBUG',arguments))
	},
	Fatal : function(Q)
	{
		alert(ZED.Replace(L(Lang.Fatal),'/',[Q]))
		process.exit(1)
	},
	MakeUnique : function(Q,S){return Q + '.' + S},
	MakeLabelNumber : function(Q)
	{
		return RegExp('(?:^|[^a-z])' + Q + '(?:[^a-z]\\D*)??(\\d+)','i')
	},
	MakeLabelWord : function(Q,S,R)
	{
		return RegExp('(?:^|[^a-z])' + Q + '(?:' + S + ')??(' + R + ')','i')
	},
	StopProp : function(E){E.stopPropagation()},

	//Global dependencies
	MU : function(Q,S){return ZED.match(Q,S)[0] || ''},
	MF : function(Q,S,X){return ZED.match(Q,S)[X || 1] || ''},
	DateDirect : function(Q)
	{
		return new Date
		(
			Q[0] && Q[0].length < 3 ? '20' + Q[0] : Q[0],
			Q[1] - 1,
			Q[2],
			Q[3],Q[4],Q[5] || 0
		)
	},
	PadTo : function(S,Q)
	{
		return ZED.FillLeft(Q,(S - 1 + '').length)
	},
	ReplaceLang : function(Q,S)
	{
		return ZED.Replace(L(Q),'/',ZED.isArray(S) ? S : ZED.tail(arguments))
	},
	CookieSolve : function(Q)
	{
		return ZED.reduce(function(D,V)
		{
			V = V.split('; ')[0].split('=')
			D[V[0]] = V[1]
		},{},ZED.isObject(Q) ? Q.headers['set-cookie'] : Q)
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
	Best : function(Q)
	{
		return ZED.reduce(ZED.maxBy(ZED.prop(Q)),ZED.objOf(Q,-Infinity))
	},
}