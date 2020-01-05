'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
HTTP = require('http'),
Inspector = require('inspector'),
Path = require('path'),
Request = require('request'),

ActionWebTaskNew = 'TaskN',
ActionWebTaskOverview = 'TaskO',
ActionWebTaskPlay = 'TaskP',
ActionWebTaskPause = 'TaskU',
ActionWebTaskRemove = 'TaskD',
ActionWebTaskRenew = 'TaskW',
ActionWebTaskTitle = 'TaskT',
ActionWebTaskSize = 'TaskS',
ActionWebTaskErr = 'TaskE',
ActionWebTaskHist = 'TaskH',
ActionWebShortCut = 'SC',
ActionWebTick = 'Tick',
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
ActionAuthTaskRemove = 'TaskD',
ActionAuthDownFile = 'DownF',
ActionAuthDownPlay = 'DownP',
ActionAuthDownConn = 'DownC',
ActionAuthDownPath = 'DownA',
ActionAuthDownHas = 'DownH',
ActionAuthDownTake = 'DownT',
ActionAuthDownDone = 'DownD',
ActionAuthInspect = 'Ins',
ActionAuthErr = 'RErr',
ActionAuthErrT = 'RErrT';

module.exports = Option =>
{
	var
	PortWeb = Option.PortWeb,
	PathData = Option.Data || WN.JoinP(WN.Data,'ZED/CrabSave'),

	PathWeb = WN.JoinP(__dirname,'Web'),
	FileToken = WN.JoinP(PathData,'Key'),
	PathSave = WN.JoinP(PathData,'Save'),
	DataCookie = WN.JSON(WN.JoinP(PathData,'Cookie')),
	CookieMap,
	DataSetting = WN.JSON(WN.JoinP(PathData,'Setting')),
	DataShortCut = WN.JSON(WN.JoinP(PathData,'ShortCut')),
	DataComponent = WN.JSON(WN.JoinP(PathData,'Component')),

	ConfigDebugLimit = 20,

	OnTick = Force =>
	{
		var R = '';
		if (WebSocketPool.size && (Force || Loop.Downloading.size))
		{
			Loop.Downloading.forEach((V,F) =>
				R += '\n' + NumberZip.S(F) + V(NumberZip.S))
			R = R || '\n'
			WebSocketPool.forEach(V => V[1] && V[0](R))
		}
	},

	ErrorS = E => WW.IsObj(E) && E.stack || E,
	RecErrList = [],
	RecErr = (File,Err) =>
	{
		ConfigDebugLimit <= RecErrList.length &&
			RecErrList.shift()
		File = WN.RelP(__dirname,File)
		Err = ErrorS(Err)
		RecErrList.push([File,Err])
		WebSocketSendAuth([ActionAuthErr,File,Err],true)
	},
	RecErrTE = {},
	RecErrTList = [],
	RecErrT = (Task,Err,State,At) =>
	{
		Err = ErrorS(Err)
		if (null == Err)
		{
			WR.Del(Task,RecErrTE)
			Err = RecErrTList.indexOf(Task)
			~Err && RecErrTList.splice(Err,1)
			WebSocketSend([ActionWebTaskErr,Task],true)
			WebSocketSendAuth([ActionAuthErrT,Task],true)
		}
		else
		{
			if (!WR.Has(Task,RecErrTE))
			{
				if (ConfigDebugLimit <= RecErrTList.length)
				{
					WR.Del(RecErrTList[0],RecErrTE)
					RecErrTList.shift()
				}
				RecErrTList.push(Task)
			}
			RecErrTE[Task] = Err
			WebSocketSend([ActionWebTaskErr,Task,[State,At]],true)
			WebSocketSendAuth([ActionAuthErrT,Task,Err],true)
		}
	},
	NumberZip = WC.Rad(WR.Map(WR.CHR,WR.Range(33,127))),

	SettingMake = (K,H,D) => R => H(R = DataSetting.D(K)) ? R : D,
	Setting =
	{
		Lang : SettingMake('Lang',WW.IsStr,0),
		Dir : SettingMake('Dir',WW.IsStr,PathSave),
		Fmt : SettingMake('Fmt',WW.IsStr,'|Up|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?'),
		Max : SettingMake('Max',Q => WW.IsIn(Q,1,25),4),
		Proxy : SettingMake('Proxy',WR.Id,false),
		ProxyURL : SettingMake('ProxyURL',WW.IsStr,undefined),
		Delay : SettingMake('Delay',WW.IsNum,20),
	},
	SiteO =
	{
		Cmp : DataComponent,
		CokeRaw : Q => CookieMap[Q]
	},
	Site = require('./Site/_')(SiteO),
	DB = require('./DB.SQLite')(
	{
		PathData
	}),
	DBVersion = WW.Now(),
	LoopO =
	{
		Setting,
		Site,
		DB,
		Err : RecErr,
		ErrT : RecErrT,
		OnRenew : Task => WebSocketSend([ActionWebTaskRenew,Task,true],true),
		OnRenewDone : Task => WebSocketSend([ActionWebTaskRenew,Task,false],true),
		OnInfo : (Task,Q) => WebSocketSendAuth([ActionAuthTaskInfo,Task,Q],true),
		OnTitle : (Task,Title) => WebSocketSend([ActionWebTaskTitle,Task,Title],true),
		OnFile : (Task,Part,File,Size) => WebSocketSendAuth([ActionAuthDownFile,[Task,Part,File],Size],true),
		OnSize : (Task,Q,N) => WebSocketSend([ActionWebTaskSize,Task,[Q,N]],true),

		OnPlay : (Task,Part,File,Play) => WebSocketSendAuth([ActionAuthDownPlay,[Task,Part,File],Play],true),
		OnConn : (Task,Part,File,Conn) => WebSocketSendAuth([ActionAuthDownConn,[Task,Part,File],Conn],true),
		OnPath : (Task,Part,File,Path) => WebSocketSendAuth([ActionAuthDownPath,[Task,Part,File],Path],true),
		OnHas : (Task,Part,File,Has) => WebSocketSendAuth([ActionAuthDownHas,[Task,Part,File],Has],true),
		OnTake : (Task,Part,File,Take) => WebSocketSendAuth([ActionAuthDownTake,[Task,Part,File],Take],true),
		OnDone : (Task,Part,File,Done) => WebSocketSendAuth([ActionAuthDownDone,[Task,Part,File],Done],true),

		OnFinal : (Task,Done) => WebSocketSend([ActionWebTaskHist,++DBVersion,[Task,Done]],true),

		OnEnd : () => OnTick(true)
	},
	Loop = require('./Loop')(LoopO),

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
	RequestHead = SiteO.Head = (Q,K,V,Force) =>
	{
		Q = WW.IsObj(Q) ? Q : {url : Q}
		WR.Has(K,Q.headers || (Q.headers = {})) && !Force ||
			(Q.headers[K] = V)
		return Q
	},
	RequestComm = SiteO.Req = LoopO.Req = Q =>
	{
		Q = WW.Merge(false,true,WW.IsObj(Q) ? Q : {url : Q},RequestDefault)
		if (WW.IsStr(Q.url) && WR.StartW('https://www.googleapis.com/',Q.url))
			Q.url = Q.url.replace(/#GoogleAPIKey#/,Option.GoogleAPIKey || 'AIzaSyA_ltEFFYL4E_rOBYkQtA8aKHnL5QR_uMA')
		RequestHead(Q,WW.UA,WW.Key())
		Setting.Proxy() && Setting.ProxyURL() &&
			(Q.proxy = Setting.ProxyURL().replace(/^(?!\w+:\/\/)/,'http://'))
		return Q
	},
	RequestCoke = SiteO.Coke = (Q,V) => RequestHead(Q,'Cookie',CookieMap[V]),

	WebServerMap =
	{
		'/' : WN.JoinP(PathWeb,'Entry.htm'),
		'/W' : require.resolve('@zed.cwt/wish'),
		'/L' : WN.JoinP(PathWeb,'Lang.js'),
		'/M' : WN.JoinP(PathWeb,'Entry.js')
	},
	WebServer = HTTP.createServer((Q,S) =>
	{
		var U = Q.url.replace(/\?.*/,'');
		WebServerSetting(U,S) &&
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
	WebServerSetting = (Q,S) =>
	{
		return '/S' !== Q ||
			(S.end(`LangS=${WC.OTJ(Setting.Lang())}`),0)
	},
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
			Q = RequestComm(Q)
			WR.Del('gzip',Q)
			Q.encoding = null
			Request(Q)
				.on('request',O =>
				{
					H && WR.EachU((V,F) =>
					{
						WebServerProxyOmit.has(WR.Low(F)) ||
							O.setHeader(F,V)
					},H)
				})
				.on('response',O =>
				{
					H && WR.EachU((V,F) =>
					{
						WebServerProxyOmit.has(WR.Low(F)) ||
							S.setHeader(F,V)
					},O.headers)
					S.writeHead(O.statusCode,O.statusMessage)
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
			null,
		SiteCount = 0,
		SiteMap = {};
		if (!Each) return 9
		if (String(DBVersion) === Q.replace(/\D/g,'')) return S.end()
		S.write(DBVersion + '\n')
		Each(V =>
		{
			S.write
			(
				NumberZip.S(V.Row) + '\n' +
				(SiteMap[V.Site] ? SiteMap[V.Site] : (SiteMap[V.Site] = ++SiteCount) + ' ' + V.Site) + '\n' +
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
		WebSocketPool.forEach(V => V[0](Q))
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
			try{S.send(WW.IsObj(D) ? WC.OTJ(D) : D)}catch(_){}
		},
		Feed = [Send,9],
		FullTrackingRow,
		SendAuth = D =>
		{
			if (ActionAuthTaskInfo === D[0] && FullTrackingRow !== D[1]) return
			if (WR.StartW('Down',D[0]) && FullTrackingRow !== D[1][0]) return
			D = Cipher.D(WC.OTJ([WW.Key(WW.Rnd(20,40)),D,WW.Key(WW.Rnd(20,40))]))
			try{S.send('\0' + WC.B91S(D))}catch(_){}
		},
		Suicide = () => S.terminate(),
		ApiPool = new Map;

		S.on('message',Q =>
		{
			var
			Err = S => Send([ActionWebError,Q[0],S]),
			DBMulti = (Q,S,E) => WW.IsArr(Q) ?
				WX.From(Q)
					.FMapO(1,V => S(V).FinErr())
					.Reduce(WR.Or)
					.Now(B =>
					{
						B && Err(ErrorS(B[0]))
						E && E()
					}) :
				Err('ErrBadReq'),
			K,O;
			if (!WW.IsStr(Q)) return Suicide()
			if (!Q.charCodeAt())
			{
				Q = WC.JTOO(WC.U16S(Decipher.D(WC.B91P(Q))))
				if (!WW.IsArr(Q) || !WW.IsArr(Q = Q[1]))
				{
					Send([ActionWebError,'Auth','ErrAuthFail'])
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
									SendAuth([ActionAuthToken,'AutSaved'])
									WebSocketPoolAuthSuicide.forEach(V => V())
								},E => Err(['ErrAuthSave',ErrorS(E)]))
						else Err('ErrAuthInc')
						break
					case ActionAuthCookie :
						if (Site.H(K))
						{
							O = String(O || '')
							DataCookie.D(K,CookieE(CookieMap[K] = O))
							WebSocketSendAuth([ActionAuthCookie,K,O],true)
						}
						else Err(['ErrUnkSite',K])
						break

					case ActionAuthShortCut :
						WebSocketSend([ActionWebShortCut,DataShortCut.O(WR.Where(WR.Id,K))])
						break
					case ActionAuthSetting :
						K = WR.Where(WR.Id,K)
						if ('Dir' in K && !Path.isAbsolute(K.Dir))
							Err('ErrSetDir')
						else
						{
							WebSocketSendAuth([ActionAuthSetting,DataSetting.O(K)])
							Loop.OnSet()
						}
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
							Err('ErrBadReq')
						else if (!WW.IsObj(O))
							Err('ErrBadReq')
						else
						{
							if (!/^\w+:\/\//.test(O.url)) O.url = 'http://' + O.url
							if (O.Cookie)
								RequestCoke(O,O.Cookie)
							ApiPool.set(K,Request(RequestComm(O),(E,I,R) =>
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
						DBMulti(K,V => Site.H(V.S) ?
							DB.New(
							{
								Birth : WW.Now(),
								Site : V.S,
								ID : V.I,
								Title : V.T,
								UP : V.U,
								Root : Setting.Dir(),
								Format : Setting.Fmt()
							}).Map(B =>
								WebSocketSend([ActionWebTaskNew,++DBVersion,B],true)) :
							WX.Throw(['ErrUnkSite',V.S]),Loop.Info)
						break
					case ActionAuthTaskInfo :
						false === K ?
							FullTrackingRow = false :
							DB.Full(FullTrackingRow = K).Now
							(
								V => SendAuth([Q[0],K,V]),
								E => SendAuth([Q[0],K,ErrorS(E)]),
							)
						break
					case ActionAuthTaskPlay :
						DBMulti(K,V =>
							DB.Play(V).Map(() =>
							{
								WebSocketSend([ActionWebTaskPlay,++DBVersion,V],true)
							}),Loop.Down)
						break
					case ActionAuthTaskPause :
						DBMulti(K,V =>
							DB.Pause(V).Map(() =>
							{
								WebSocketSend([ActionWebTaskPause,++DBVersion,V],true)
								Loop.Stop(V)
							}))
						break
					case ActionAuthTaskRemove :
						DBMulti(K,V =>
							DB.Del(V).Map(Done =>
							{
								WebSocketSend([ActionWebTaskRemove,++DBVersion,[V,Done]],true)
								Loop.Del(V)
							}))
						break

					case ActionAuthInspect :
						if (WW.IsArr(K))
						{
							Inspector.open(...K)
							SendAuth([Q[0],Inspector.url()])
						}
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

				case ActionWebTick :
					Feed[1] = 9
					break
			}
		}).on('close',() =>
		{
			WebSocketPool.delete(Feed)
			WebSocketPoolAuth.delete(SendAuth)
			WebSocketPoolAuthSuicide.delete(Suicide)
			ApiPool.forEach(V => V.abort())
		})

		WR.Each(Send,WebSocketLast)
		Send([ActionWebTaskRenew,Loop.Renewing(),true])
		WebSocketPool.add(Feed)
	};

	return {
		Save : WN.MakeDir(PathData)
			.FMap(() => WN.UR(FileToken)
				.ErrAs(K =>
				(
					K = WW.Key(20),
					WN.UW(FileToken,WC.B91S(TokenStepB(TokenStepA(K))) + WN.EOL +
						'Initial Token : ' + K)
						.FMap(() => WN.UR(FileToken))
				)))
			.Map(Q => WebToken = WC.B91P(Q.split(/\s/)[0]))
			.FMap(() => DB.Init)
			.Now(null,null,() =>
			{
				CookieMap = WR.Map(CookieD,DataCookie.O())
				DataSetting.D('Dir') ||
					DataSetting.D('Dir',PathSave)
				WebSocketSendAuth([ActionAuthCookie,CookieMap])
				WebSocketSend([ActionWebShortCut,DataShortCut.O()])
				WebSocketSendAuth([ActionAuthSetting,DataSetting.O()])
				WebSocketSendAuth([ActionAuthErr,RecErrList])
				WebSocketSendAuth([ActionAuthErrT,RecErrTE])
				WW.IsNum(PortWeb) && new (require('ws')).Server({server : WebServer.listen(PortWeb)}).on('connection',OnSocket)
				Loop.Info()
				Loop.Down()
				WW.To(5E2,OnTick,true)
			}),
		Exp : X => (X = X || require('express').Router())
			.use((Q,S,N) => '/' === Q.path && !/\/(\?.*)?$/.test(Q.originalUrl) ? S.redirect(302,Q.baseUrl + Q.url) : N())
			.use((Q,S,N) => WebServerSetting(Q.path,S) &&
				WebServerProxy(Q.path,S,Q.headers) &&
				WebServerDataBase(Q.url,S) &&
				(WebServerMap[Q.path] ? S.sendFile(WebServerMap[Q.path]) :
					/^\/Site\/\w+\.js$/.test(Q.path) ? S.sendFile(WN.JoinP(__dirname,Q.path)) :
					N())),
		Soc : OnSocket
	}
}