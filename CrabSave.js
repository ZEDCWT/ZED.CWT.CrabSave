'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
HTTP = require('http'),
Request = require('request'),

ActionWebError = 'Err',
ActionAuthHello = 'Hell',
ActionAuthToken = 'Toke',
ActionAuthApi = 'Api';

module.exports = Option =>
{
	var
	PortWeb = Option.PortWeb,
	PathData = Option.Data || WN.JoinP(WN.Data,'ZED/CrabSave'),

	PathWeb = WN.JoinP(__dirname,'Web'),
	FileToken = WN.JoinP(PathData,'Key'),
	FileCookie = WN.JSON(WN.JoinP(PathData,'Cookie')),

	WebToken,
	TokenStepA = Q => WC.HSHA512(Q,'j!ui+Ju8?j'),
	TokenStepB = Q => WC.HSHA512('!(|[.:O9;~',Q),

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
		WR.Has('User-Agent',Q.headers) || (Q.headers['User-Agent'] = WW.Key())
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
		if (WebServerProxy(Q.url,S))
			(WR.Has(U,WebServerMap) ? WN.UR(WebServerMap[U]) :
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
	WebServerProxy = (Q,S) =>
	{
		if (!WR.StartW('/Api/',Q)) return 9
		RequestMake(decodeURIComponent(Q.slice(5)))
			.on('data',D => S.write(D))
			.on('complete',() => S.end())
			.on('error',() => S.destory())
	},
	WebSocketPool = new Set,
	WebSocketLast = {},
	WebSocketSend = (Q,S) =>
	{
		if (!S) WebSocketLast[Q[0]] = Q
		WebSocketPool.forEach(V => V(Q))
	},
	WebSocketPoolAuth = new Set,
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
			Err = S => Send([ActionWebError,Q[0],S]);
			if (!WW.IsStr(Q)) return Suicide()
			if (!Q.charCodeAt())
			{
				Q = WC.JTOO(WC.U16S(Decipher.D(WC.B91P(Q))))
				if (!WW.IsArr(Q) || !WW.IsArr(Q = Q[1]))
				{
					Send([ActionWebError,'Auth','Authorization Failed'])
					return Suicide()
				}
				switch (Q[0])
				{
					case ActionAuthHello :
						SendAuth([ActionAuthHello])
						WR.Each(SendAuth,WebSocketLastAuth)
						WebSocketPoolAuth.add(SendAuth)
						break

					case ActionAuthToken :
						if (WC.HEXS(TokenStepB(WC.B91P(Q[1]))) === WC.HEXS(WebToken))
							WN.UW(FileToken,WC.B91S(TokenStepB(WC.B91P(Q[2]))))
								.FMap(() => WN.UR(FileToken))
								.Now(Q =>
								{
									WebToken = WC.B91P(Q)
									SendAuth([ActionAuthToken,'New token saved! Connect again'])
									Suicide()
								},() => Err(ActionAuthToken,'Failed to save the new token'))
						else Err('Original token is incorrect')
						break

					case ActionAuthApi :
						if (false === Q[2] && ApiPool.has(Q[1]))
						{
							ApiPool.get(Q[1]).abort()
							ApiPool.delete(Q[1])
						}
						else if (!Q[1] || !WW.IsStr(Q[1]) || ApiPool.has(Q[1]))
							Err('Bad token ' + Q[1])
						else if (!WW.IsObj(Q[2]))
							Err('Bad request ' + WC.OTJ(Q[2]))
						else
						{
							if (!/^\w+:\/\//.test(Q[2].url)) Q[2].url = 'http://' + Q[2].url
							if (Q[2].Cookie)
							{

							}
							ApiPool.set(Q[1],RequestMake(Q[2],(E,I,R) =>
							{
								ApiPool.delete(Q[1])
								SendAuth([ActionAuthApi,Q[1],!E && I.statusCode,R,I && I.headers])
							}))
						}
						break
				}
				return
			}
			Q = WC.JTOO(Q)
			switch (Q[0])
			{
			}
		}).on('close',() =>
		{
			WebSocketPool.delete(Send)
			WebSocketPoolAuth.delete(SendAuth)
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
			.Now(() =>
			{
				WW.IsNum(PortWeb) && new (require('ws')).Server({server : WebServer.listen(PortWeb)}).on('connection',OnSocket)
			}),
		Exp : X => (X = X || require('express').Router())
			.use((Q,S,N) => '/' === Q.path && !/\/(\?.*)?$/.test(Q.originalUrl) ? S.redirect(302,Q.baseUrl + Q.url) : N())
			.use(X.json())
			.use((Q,S,N) => WebServerProxy(Q.path,S) &&
				((Q = WebServerMap[Q.path]) ? S.sendFile(Q) :
					/^\/Site\/\w+\.js$/.test(Q.path) ? S.sendFile(WN.JoinP(__dirname,Q.path)) :
					N())),
		Soc : OnSocket
	}
}