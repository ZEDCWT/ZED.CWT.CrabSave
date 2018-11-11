'use strict'
var
undefined,
True = !undefined,
False = !True,

ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,
Scheduler = ZED.Scheduler,
$ = ZED.jQuery,

Config = require('../Config'),
Lang = require('./Lang'),
L = Lang.L,

Path = require('path'),
URL = require('url'),

FS = require('graceful-fs'),
Request = require('request').defaults({timeout : 10E3}),



Look = [],



PoolSize = 20,
Pool = () =>
{
	var
	Data = Array(PoolSize),
	P = -1;

	return {
		Push : Q =>
		{
			++P < PoolSize || (P = 0)
			Data[P] = Q
		},
		Peek : N =>
		(
			N = P - Math.abs(N || 0),
			N < 0 && (N += PoolSize),
			N < PoolSize || (N -= PoolSize),
			Data[N]
		)
	}
},



RequestPool = Pool(),
Proxy = '',
RequestWrap = (Q,H) =>
(
	ZED.isObject(Q) || (Q = {url : Q}),
	Q.forever = True,
	Q.gzip = True,
	Q.rejectUnauthorized = False,
	Proxy && (Q.proxy = Proxy),
	H = Q.headers || (Q.headers = {}),
	H.Accept = '*/*',
	H['User-Agent'] = H['User-Agent'] || Config.UA,
	Q
),
RequestHead = Q =>
(
	RequestPool.Push(Q),
	Q = RequestWrap(Q),
	Observable.create((O,X) =>
	(
		X = Request(Q).on('error',E => O.error(E))
			.on('response',H =>
			{
				X.abort()
				O.data(H).finish()
			}),
		() => X.abort()
	)).retryWhen(E => E.tap(E =>
		Q.forever ?
			Q.forever = False :
			ZED.Throw(E)))
),
RequestBase = H => Q =>
(
	RequestPool.Push(Q),
	Q = RequestWrap(Q),
	Observable.create((O,X) =>
	(
		X = Request(Q,(E,I,R) => E ?
			O.error(E) :
			O.data(H ? [I,R] : R).finish()),
		() => X.abort()
	)).retryWhen(E => E.tap(E =>
		Q.forever ?
			Q.forever = False :
			ZED.Throw(E)))
),

DebugFilter = /getaddrinfo|hang up|ECONN|EHOST|ESOCKET|ETIMEDOUT/,
DebugPool = Pool(),

ML = (Q,S,C,J,T) =>
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

HTMLVirtualDoc = document.implementation.createHTMLDocument(),
HTMLDiv = $('<div>');

setInterval(F =>
{
	for (F = Look.length;F;) Look[--F]()
},Config.Speed)

module.exports =
{
	U : undefined,
	N : null,
	T : True,
	F : False,

	RFollow : [/^(?:fav|fo(?:llow(?:ing)?)?|up(?:loader)?)?$/i],
	RSearch : [/^(?:find|search)\s+(.*)$/i],
	OReinfo : {},

	Bus : ZED.Emitter(),
	Look : Q => Look.push(Q),

	//Observable
	from : Q => Observable.from(Q,Scheduler.async),

	Proxy : Q => (Proxy = Q && 'http://' + Q,Q),
	ProxyPack : Q => (Proxy && (Q.proxy = Proxy),Q),
	RequestPool : RequestPool,
	RequestHead : RequestHead,
	RequestBody : RequestBase(False),
	RequestFull : RequestBase(True),
	ajax : Q =>
	(
		ZED.isObject(Q) || (Q = {url : Q}),
		Observable.create((O,X) =>
		(
			X = $.ajax(ZED.Merge(
			{
				dataType : 'text',
				success : Q => O.data(Q).finish(),
				error : E => O.error(E)
			},Q)),
			() => X.abort()
		))
	),
	mkdirp : Observable.wrapNode(ZED.mkdirp),
	readFile : Observable.wrapNode(FS.readFile),
	writeFile : Observable.wrapNode(FS.writeFile),

	//No dependencies
	Debug : (...A) =>
	{
		A[0] = Path.basename(A[0]).replace(/\.js$/,'')
		if (2 < A.length || !A[1] || !DebugFilter.test(A[1].message))
		{
			ZED.isObject(A[1]) && DebugPool.Push(A[1])
			A.unshift('DEBUG')
			console.error.apply(console,A)
		}
	},
	DebugPool : DebugPool,
	Fatal : Q =>
	{
		alert(ZED.Replace(L(Lang.Fatal),'/',[Q]))
		process.exit(1)
	},
	MakeUnique : (Q,S) => Q + '.' + S,
	MakeLabelNumber : Q => RegExp('(?:^|[^a-z])' + Q + '(?:[^a-z]\\D*)??(\\d+)','i'),
	MakeLabelWord : (Q,R,S) => RegExp('(?:^|[^a-z])' + Q + '(?:' + (S || '[\\s/]+') + ')??(' + (R || '[_\\dA-Z-]+') + ')','i'),
	MakeSearch : (URL,Q,X,O) => URL
	(
		encodeURIComponent(Q),X,
		ZED.Reduce(O || {},(D,F,V) => V ? `${D}&${F}=${V}` : D,'')
	),
	PrevDef : E => E.preventDefault(),
	StopProp : E => E.stopPropagation(),
	Prop : (O,K,V) => Object.defineProperty(O,K,{value : V}),

	//Global dependencies
	MU : (S,Q) => ZED.match(S,Q)[0] || '',
	MF : (S,Q,X) => ZED.match(S,Q)[X || 1] || '',
	ML : ML,
	MA : (S,Q,C,J,R) =>
	(
		R = [],
		ML(S,Q,Q => (Q = C(Q)) && R.push(Q),J),
		R
	),
	DateDirect : Q => new Date
	(
		Q[0] && Q[0].length < 3 ? '20' + Q[0] : Q[0],
		Q[1] - 1,
		Q[2],
		Q[3],Q[4],Q[5] || 0
	),
	PadTo : (S,Q) => ZED.FillLeft(Q,0,(S - 1 + '').length),
	ReplaceLang : (Q,...S) => ZED.Replace(L(Q),'/',ZED.isArray(S[0]) ? S[0] : S),
	URLExt : Q => Path.extname(Q.replace(/\?.*$/,'')),
	URLFileName : Q => Path.basename(Q.replace(/\?.*$/,'')),
	URLJoin : (Q,S) => URL.resolve(Q,S).replace(/^\/\//,'http://'),
	HeaderJoin : Q => ZED.map(ZED.join(': '),ZED.splitEvery(2,Q.rawHeaders)).join('\n'),
	CookieSolve : Q => ZED.reduce((D,V) =>
	{
		V = V.split('; ')[0].match(/^([^=]+)=([^]*)/)
		D[V[1]] = V[2]
	},{},ZED.isObject(Q) ? Q.headers['set-cookie'] : Q),
	CookieMake : Q => ZED.Reduce(Q,(D,F,V) =>
	{
		D.push(F + '=' + V)
	},[]).sort().join('; '),
	CookieTo : Q => ZED.reduce((D,V) =>
	{
		V = V.match(/^([^=]+)=([^]*)/)
		V && (D[V[1]] = V[2])
	},{},Q.split('; ')),
	Best : Q => ZED.reduce(ZED.maxBy(V => parseFloat(V[Q])),ZED.objOf(Q,-Infinity)),

	//Misc
	DecodeHTML : Q =>
	(
		HTMLDiv.html(Q),
		Q = HTMLDiv.text(),
		HTMLDiv.text(''),
		Q
	),
	ParseHTML : Q => $('<div>').append($(Q,HTMLVirtualDoc))
}