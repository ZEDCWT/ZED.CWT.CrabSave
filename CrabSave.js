'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
Site = require('./Site/_'),
HTTP = require('http'),
Request = require('request'),

ActionWebTaskNew = 'TaskN',
ActionWebTaskOverview = 'TaskO',
ActionWebTaskPlay = 'TaskP',
ActionWebTaskPause = 'TaskU',
ActionWebTaskRemove = 'TaskD',
ActionWebTaskHist = 'TaskH',
ActionWebShortCut = 'SC',
ActionWebError = 'Err',
ActionAuthHello = 'Hell',
ActionAuthToken = 'Toke',
ActionAuthCookie = 'Coke',
ActionAuthShortCut = 'SC',
ActionAuthSetting = 'Set',
ActionAuthApi = 'Api',
ActionAuthTaskNew = 'TaskN',
ActionAuthTaskInfo = 'TaskI',
ActionAuthTaskPlay = 'TaskP',
ActionAuthTaskPause = 'TaskU',
ActionAuthTaskRemove = 'TaskD';

module.exports = Option =>
{
	var
	PortWeb = Option.PortWeb,
	PathData = Option.Data || WN.JoinP(WN.Data,'ZED/CrabSave'),

	PathWeb = WN.JoinP(__dirname,'Web'),
	FileToken = WN.JoinP(PathData,'Key'),
	DataCookie = WN.JSON(WN.JoinP(PathData,'Cookie')),
	CookieMap,
	DataSetting = WN.JSON(WN.JoinP(PathData,'Setting')),
	DataShortCut = WN.JSON(WN.JoinP(PathData,'ShortCut')),

	ErrorS = E => WW.IsObj(E) && E.stack || E,
	NumberZip = WC.Rad(WR.Map(WR.CHR,WR.Range(33,127))),

	DB = require('./DB.SQLite')(
	{
		PathData
	}),
	DBVersion = 114514,

	WebToken,
	TokenStepA = Q => WC.HSHA512(Q,'j!ui+Ju8?j'),
	TokenStepB = Q => WC.HSHA512('!(|[.:O9;~',Q),
	CookieE = Q => WC.B91S(WC.AESE(WebToken.slice(0,32),WebToken.slice(-16),Q)),
	CookieD = Q => WC.U16S(WC.AESD(WebToken.slice(0,32),WebToken.slice(-16),WC.B91P(Q))),

	RequestDefault =
	{
		headers : {Accept : '*/*'},
		timeout : 1E4,
		forever : true,
		gzip : true,
		rejectUnauthorized : false
	},
	RequestMake = (Q,S) =>
	{
		Q = WW.Merge(false,true,WW.IsObj(Q) ? Q : {url : Q},RequestDefault)
		WR.Has(WW.UA,Q.headers) || (Q.headers[WW.UA] = WW.Key())
		DataSetting.D('Proxy') && WW.IsStr(DataSetting.D('ProxyURL')) &&
			(Q.proxy = DataSetting.D('ProxyURL').replace(/^(?!\w+:\/\/)/,'http://'))
		return Request(Q,S)
	},

	WebServerMap =
	{
		'/' : WN.JoinP(PathWeb,'Entry.htm'),
		'/W' : require.resolve('@zed.cwt/wish'),
		'/M' : WN.JoinP(PathWeb,'Entry.js')
	},
	WebServer = HTTP.createServer((Q,S) =>
	{
		var U = Q.url.replace(/\?.*/,'');
		WebServerProxy(Q.url,S,Q.headers) &&
			WebServerDataBase(Q.url,S) &&
			(WR.Has(U,WebServerMap) ? WN.UR(U = WebServerMap[U]) :
				/^\/Site\/\w+\.js$/.test(U) ? WN.UR(WN.JoinP(__dirname,U)) :
				WX.Throw())
				.Now(V =>
				{
					/\.js$/.test(U) && S.setHeader('Content-Type','application/javascript; charset=UTF-8')
					S.end(V)
				},() =>
				{
					S.writeHead(404)
					S.end(`Unable to resolve //${Q.headers.host || ''}${Q.url}`)
				})
	}),
	WebServerProxyOmit = new Set(
	[
		'host',
		'cookie',
		'set-cookie',
		'referer',
		'user-agent'
	]),
	WebServerProxy = (Q,S,H) =>
	{
		if (!WR.StartW('/Api/',Q)) return 9
		try
		{
			Q = decodeURIComponent(Q.slice(5))
			WR.StartW('~',Q) ?
				Q = Q.slice(1) :
				H = false
			WR.StartW('{',Q) && (Q = WC.JTOO(Q))
			RequestMake(Q)
				.on('request',O =>
				{
					H && WR.EachU(function(V,F)
					{
						WebServerProxyOmit.has(WR.Low(F)) ||
							O.setHeader(F,V)
					},H)
				})
				.on('response',O =>
				{
					H && WR.EachU(function(V,F)
					{
						WebServerProxyOmit.has(WR.Low(F)) ||
							S.setHeader(F,V)
					},O.headers)
				})
				.on('data',D => S.write(D))
				.on('complete',() => S.end())
				.on('error',() => S.destroy())
		}
		catch(_){S.destroy()}
	},
	WebServerDataBase = (Q,S) =>
	{
		var
		Each = WR.StartW('/Hot',Q) ? DB.Hot :
			WR.StartW('/Hist',Q) ? DB.Hist :
			null;
		if (!Each) return 9
		if (String(DBVersion) === Q.replace(/\D/g,'')) return S.end()
		S.write(DBVersion + '\n')
		Each(V =>
		{
			S.write
			(
				NumberZip.S(V.Row) + '\n' +
				V.Site + '\n' +
				V.ID + '\n' +
				(null == V.Size ? '' : NumberZip.S(V.Size)) + '\n' +
				(null == V.Done ? '' : NumberZip.S(V.Done) + '\n')
			)
		},E => E ? S.destroy() : S.end('~'))
	},
	WebSocketPool = new Set,
	WebSocketLast = {},
	WebSocketSend = (Q,S) =>
	{
		if (!S) WebSocketLast[Q[0]] = Q
		WebSocketPool.forEach(V => V(Q))
	},
	WebSocketPoolAuth = new Set,
	WebSocketPoolAuthSuicide = new Set,
	WebSocketLastAuth = {},
	WebSocketSendAuth = (Q,S) =>
	{
		if (!S) WebSocketLastAuth[Q[0]] = Q
		WebSocketPoolAuth.forEach(V => V(Q))
	},
	OnSocket = S =>
	{
		var
		Cipher = WC.AESES(WebToken,WebToken,WC.CFB),
		Decipher = WC.AESDS(WebToken,WebToken,WC.CFB),
		Send = D =>
		{
			try{S.send(WC.OTJ(D))}catch(_){}
		},
		SendAuth = D =>
		{
			D = Cipher.D(WC.OTJ([WW.Key(WW.Rnd(20,40)),D,WW.Key(WW.Rnd(20,40))]))
			try{S.send('\0' + WC.B91S(D))}catch(_){}
		},
		Suicide = () => S.terminate(),
		ApiPool = new Map;

		S.on('message',Q =>
		{
			var
			Err = S => Send([ActionWebError,Q[0],S]),
			DBMulti = (Q,S) => WW.IsArr(Q) ?
				WX.From(Q)
					.FMapO(1,V => S(V).FinErr())
					.Reduce(WR.Or)
					.Now(B => B && Err(ErrorS(B[0]))) :
				Err('Bad request data'),
			K,O;
			if (!WW.IsStr(Q)) return Suicide()
			if (!Q.charCodeAt())
			{
				Q = WC.JTOO(WC.U16S(Decipher.D(WC.B91P(Q))))
				if (!WW.IsArr(Q) || !WW.IsArr(Q = Q[1]))
				{
					Send([ActionWebError,'Auth','Authorization Failed'])
					return Suicide()
				}
				K = Q[1]
				O = Q[2]
				switch (Q[0])
				{
					case ActionAuthHello :
						SendAuth([ActionAuthHello])
						WR.Each(SendAuth,WebSocketLastAuth)
						WebSocketPoolAuth.add(SendAuth)
						WebSocketPoolAuthSuicide.add(Suicide)
						break

					case ActionAuthToken :
						if (WC.HEXS(TokenStepB(WC.B91P(K))) === WC.HEXS(WebToken))
							WN.UW(FileToken,WC.B91S(TokenStepB(WC.B91P(O))))
								.FMap(() => WN.UR(FileToken))
								.Now(Q =>
								{
									WebToken = WC.B91P(Q)
									DataCookie.O(WR.Map(CookieE,CookieMap))
									SendAuth([ActionAuthToken,'New token saved! Connect again'])
									WebSocketPoolAuthSuicide.forEach(V => V())
								},() => Err(ActionAuthToken,'Failed to save the new token'))
						else Err('Original token is incorrect')
						break
					case ActionAuthCookie :
						if (Site.H(K))
						{
							O = String(O || '')
							DataCookie.D(K,CookieE(CookieMap[K] = O))
							WebSocketSendAuth([ActionAuthCookie,K,O],true)
						}
						else Err('Unknown site ' + K)
						break

					case ActionAuthShortCut :
						WebSocketSend([ActionWebShortCut,DataShortCut.O(WR.Where(WR.Id,K))])
						break
					case ActionAuthSetting :
						WebSocketSendAuth([ActionAuthSetting,DataSetting.O(WR.Where(WR.Id,K))])
						break

					case ActionAuthApi :
						if (false === O)
						{
							if (ApiPool.has(K))
							{
								ApiPool.get(K).abort()
								ApiPool.delete(K)
							}
						}
						else if (!K || !WW.IsStr(K) || ApiPool.has(K))
							Err('Bad token ' + K)
						else if (!WW.IsObj(O))
							Err('Bad request ' + WC.OTJ(O))
						else
						{
							if (!/^\w+:\/\//.test(O.url)) O.url = 'http://' + O.url
							if (O.Cookie)
								(O.headers || (O.headers = {})).Cookie = CookieMap[O.Cookie]
							ApiPool.set(K,RequestMake(O,(E,I,R) =>
							{
								ApiPool.delete(K)
								SendAuth(
								[
									ActionAuthApi,K,
									!E && I.statusCode,
									E ? ErrorS(E) : R,
									I && I.headers
								])
							}))
						}
						break

					case ActionAuthTaskNew :
						DBMulti(K,V =>
							DB.New(
							{
								Birth : WW.Now(),
								Site : V.S,
								ID : V.I,
								Title : V.T,
								UP : V.U
							}).Map(B =>
								WebSocketSend([ActionWebTaskNew,++DBVersion,B],true)))
						break
					case ActionAuthTaskInfo :
						DB.Full(K).Now
						(
							V => Send([Q[0],K,V]),
							E => Send([Q[0],K,ErrorS(E)]),
						)
						break
					case ActionAuthTaskPlay :
						DBMulti(K,V =>
							DB.Play(V).Map(() =>
								WebSocketSend([ActionWebTaskPlay,++DBVersion,V],true)))
						break
					case ActionAuthTaskPause :
						DBMulti(K,V =>
							DB.Pause(V).Map(() =>
								WebSocketSend([ActionWebTaskPause,++DBVersion,V],true)))
						break
				}
				return
			}
			Q = WC.JTOO(Q)
			K = Q[1]
			O = Q[2]
			switch (Q[0])
			{
				case ActionWebTaskOverview :
					DB.Over(K).Now
					(
						V => Send([Q[0],K,V]),
						E => Send([Q[0],K,ErrorS(E)])
					)
					break
			}
		}).on('close',() =>
		{
			WebSocketPool.delete(Send)
			WebSocketPoolAuth.delete(SendAuth)
			WebSocketPoolAuthSuicide.delete(Suicide)
			ApiPool.forEach(V => V.abort())
		})

		WR.Each(Send,WebSocketLast)
		WebSocketPool.add(Send)
	};

	return {
		Save : WN.MakeDir(PathData)
			.FMap(() => WN.UR(FileToken)
				.ErrAs(K =>
				(
					K = WW.Key(20),
					WN.UW(FileToken,WC.B91S(TokenStepB(TokenStepA(K))) + WN.EOL + `Initial Token : ${K + WN.EOL}CHANGE IT !!!`)
						.FMap(() => WN.UR(FileToken))
				)))
			.Map(Q => WebToken = WC.B91P(Q.split(/\s/)[0]))
			.FMap(() => DB.Init)
			.Now(() =>
			{
				CookieMap = WR.Map(CookieD,DataCookie.O())
				WebSocketSendAuth([ActionAuthCookie,CookieMap])
				WebSocketSend([ActionWebShortCut,DataShortCut.O()])
				WebSocketSendAuth([ActionAuthSetting,DataSetting.O()])
				WW.IsNum(PortWeb) && new (require('ws')).Server({server : WebServer.listen(PortWeb)}).on('connection',OnSocket)
			}),
		Exp : X => (X = X || require('express').Router())
			.use((Q,S,N) => '/' === Q.path && !/\/(\?.*)?$/.test(Q.originalUrl) ? S.redirect(302,Q.baseUrl + Q.url) : N())
			.use((Q,S,N) => WebServerProxy(Q.path,S,Q.headers) &&
				WebServerDataBase(Q.originalUrl,S) &&
				((Q = WebServerMap[Q.path]) ? S.sendFile(Q) :
					/^\/Site\/\w+\.js$/.test(Q.path) ? S.sendFile(WN.JoinP(__dirname,Q.path)) :
					N())),
		Soc : OnSocket
	}
}