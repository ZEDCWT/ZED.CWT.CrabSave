'use strict'
var
undefined,
True = !undefined,
False = !True,

ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,
$ = ZED.jQuery,

Config = require('../Config'),
Lang = require('./Lang'),
L = Lang.L,

Path = require('path'),

FS = require('graceful-fs'),
Request = require('request').defaults({timeout : 10E3}),



PoolSize = 20,
Pool = function()
{
	var
	Data = Array(PoolSize),
	P = -1;

	return {
		Push : function(Q)
		{
			++P < PoolSize || (P = 0)
			Data[P] = Q
		},
		Peek : function(N)
		{
			N = P - Math.abs(N || 0)
			N < 0 && (N += PoolSize)
			N < PoolSize || (N -= PoolSize)
			return Data[N]
		}
	}
},



RequestPool = Pool(),
RequestWrap = function(Q,H)
{
	ZED.isObject(Q) || (Q = {url : Q})
	Q.gzip = True
	H = Q.headers || (Q.headers = {})
	H.Accept = '*/*'
	H['User-Agent'] = H['User-Agent'] || Config.UA
	return Q
},
RequestHead = function(Q)
{
	RequestPool.Push(Q)
	return Observable.create(function(O,X)
	{
		X = Request(RequestWrap(Q)).on('error',function(E){O.error(E)})
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
		RequestPool.Push(Q)
		return Observable.create(function(O,X)
		{
			X = Request(RequestWrap(Q),function(E,I,R)
			{
				E ? O.error(E) : O.data(H ? [I,R] : R).finish()
			})
			return function(){X.abort()}
		})
	}
},

DebugPool = Pool(),
Look = [],
DecodeHTML = $('<div>');

setInterval(function(F)
{
	for (F = Look.length;F;) Look[--F]()
},Config.Speed)

module.exports =
{
	U : undefined,
	N : null,
	T : True,
	F : False,

	RSearch : [/^(?:find|search)\s+(.*)$/i],

	Bus : ZED.Emitter(),
	Look : function(Q){Look.push(Q)},

	//Observable
	RequestPool : RequestPool,
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
	Debug : function(A)
	{
		A = ZED.Arrayify(arguments)
		A[0] = Path.basename(A[0]).replace(/\.js$/,'')
		ZED.isObject(A[1]) && DebugPool.Push(A[1])
		A.unshift('DEBUG')
		console.error.apply(console,A)
	},
	DebugPool : DebugPool,
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
	MakeLabelWord : function(Q,R,S)
	{
		return RegExp('(?:^|[^a-z])' + Q + '(?:' + (S || '[\\s/]+') + ')??(' + (R || '[_\\dA-Z-]+') + ')','i')
	},
	MakeSearch : function(URL,Q,X,O)
	{
		return URL(encodeURIComponent(Q),X,ZED.Reduce(O || {},function(D,F,V)
		{
			return V ? D + '&' + F + '=' + V : D
		},''))
	},
	PrevDef : function(E){E.preventDefault()},
	StopProp : function(E){E.stopPropagation()},

	//Global dependencies
	MU : function(Q,S){return ZED.match(Q,S)[0] || ''},
	MF : function(Q,S,X){return ZED.match(Q,S)[X || 1] || ''},
	ML : function(Q,S,C,J,T)
	{
		Q.lastIndex = 0
		T = Q.exec(S)
		T && C(J ? T : T[0])
		for (;Q.lastIndex;)
		{
			T = Q.exec(S)
			T && C(J ? T : T[0])
		}
	},
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
			V = V.split('; ')[0].match(/^([^=]+)=([^]*)/)
			D[V[1]] = V[2]
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
			V = V.match(/^([^=]+)=([^]*)/)
			V && (D[V[1]] = V[2])
		},{},Q.split('; '))
	},
	Best : function(Q)
	{
		return ZED.reduce(ZED.maxBy(ZED.prop(Q)),ZED.objOf(Q,-Infinity))
	},

	//Misc
	DecodeHTML : function(Q)
	{
		DecodeHTML.html(Q)
		Q = DecodeHTML.text()
		DecodeHTML.text('')
		return Q
	}
}