'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
Crypto = require('crypto'),
FS = require('fs'),
HTTP = require('http'),
Inspector = require('inspector'),
Path = require('path'),
ZLib = require('zlib'),

Proto =
{
	TaskNew : 0x4000,
	TaskPlay : 0x4002,
	TaskPause : 0x4004,
	TaskRemove : 0x4006,
	TaskHist : 0x4008,
	TaskOverview : 0x400A,
	TaskRenew : 0x400C,
	TaskTitle : 0x400E,
	TaskSize : 0x4020,
	TaskErr : 0x4022,

	ShortCut : 0x4200,

	Tick : 0x4400,
	Error : 0x4402,

	DBBrief : 0x4600,
	DBSite : 0x4602,



	AuthHello : 0x8000,
	AuthToken : 0x8002,
	AuthCookie : 0x8004,
	AuthReq : 0x8006,

	AuthShortCut : 0x8200,
	AuthSetting : 0x8202,
	AuthSettingProxy : 0x8204,

	AuthTaskNew : 0x8400,
	AuthTaskInfo : 0x8402,
	AuthTaskPlay : 0x8404,
	AuthTaskPause : 0x8606,
	AuthTaskRemove : 0x8608,

	AuthDownFile : 0x8800,
	AuthDownPlay : 0x8802,
	AuthDownConn : 0x8804,
	AuthDownPath : 0x8806,
	AuthDownHas : 0x8808,
	AuthDownTake : 0x880A,
	AuthDownDone : 0x880C,

	AuthInspect : 0x8A00,
	AuthReload : 0x8A02,
	AuthVacuum : 0x8A04,
	AuthDebug : 0x8A06,

	AuthErr : 0xCC00,
	AuthErrFile : 0xCC02,
},
ProtoJSON = WC.OTJ(Proto,{Apos : true}),
ProtoInv = WR.Inv(Proto),
ProtoPB = FS.readFileSync(WN.JoinP(__dirname,'Proto.pb')),
ProtoPBJSON = WC.OTJ(WC.B91S(ProtoPB),{Apos : true}),
ProtoJar = WC.PBJ().S(ProtoPB),
ProtoEnc = (ProtoID,Data) => Data ? WC.Buff(ProtoJar.E(ProtoInv[ProtoID],Data)) : WC.Buff(),
ProtoDec = (ProtoID,Data) => ProtoJar.D(ProtoInv[ProtoID],Data),
ProtoIsAuth = WR.ReduceU((D,V,F) => /^Auth/.test(F) ? D.add(V) : D,new Set,Proto),
ProtoIsAuthDetail = WR.ReduceU((D,V,F) => /^AuthDown/.test(F) ? D.add(V) : D,new Set([Proto.AuthTaskInfo]),Proto),
ProtoMsgTypePlain = 0,
ProtoMsgTypeAuth = 1,
ProtoMsgTypeBrief = 2,
ProtoMsgTypeAuthBuff = WC.Buff([ProtoMsgTypeAuth]),
ProtoMsgHeadBuf = WC.Buff(1024),
ProtoMsgCache,ProtoMsgCacheID,ProtoMsgCacheData,
ProtoMsgMake = (ProtoID,Data) =>
{
	var T,F;
	if (ProtoMsgCacheID !== ProtoID || ProtoMsgCacheData !== Data)
	{
		ProtoMsgCacheID = ProtoID
		ProtoMsgCacheData = Data
		Data = ProtoEnc(ProtoID,Data)
		F = 0
		ProtoMsgHeadBuf[F++] = ProtoMsgTypePlain
		for (T = ProtoID;T = (T - (ProtoMsgHeadBuf[F++] = T % 128)) / 128;)
			ProtoMsgHeadBuf[F - 1] |= 128
		for (T = ProtoID + Data.length;T = (T - (ProtoMsgHeadBuf[F++] = T % 128)) / 128;)
			ProtoMsgHeadBuf[F - 1] |= 128
		ProtoMsgCache = Buffer.concat([ProtoMsgHeadBuf.subarray(0,F),Data])
	}
	return ProtoMsgCache
};

module.exports = Option =>
{
	var
	PortWeb = Option.PortWeb,
	PathData = Option.Data || WN.JoinP(WN.Data,'ZED/CrabSave'),

	FileToken = WN.JoinP(PathData,'Key'),
	PathSave = WN.JoinP(PathData,'Save'),
	DataCookie = WN.JSON(WN.JoinP(PathData,'Cookie')),
	CookieMap,
	DataSetting = WN.JSON(WN.JoinP(PathData,'Setting')),
	DataShortCut = WN.JSON(WN.JoinP(PathData,'ShortCut')),
	DataComponent = WN.JSON(WN.JoinP(PathData,'Component')),

	ConfCryptoMethod = 'AES-256-OFB',
	ConfDebugLimit = 20,
	ConfReqLife = 15E3,

	OnTickBuff = WC.Buff(4096),
	OnTick = Force =>
	{
		var
		L = 0,
		R = Q =>
		{
			for (;Q = (Q - (OnTickBuff[L++] = Q % 128)) / 128;)
				OnTickBuff[L - 1] |= 128
		};
		if (Force || Loop.Downloading.size) WebSocketBroadcastBrief(() =>
		{
			if (!L)
			{
				OnTickBuff[L++] = ProtoMsgTypeBrief
				Loop.Downloading.forEach((V,F) =>
				{
					R(F)
					V(R)
				})
				R = WC.Slice(OnTickBuff,0,L)
			}
			return R
		})
	},

	RegExpDir = RegExp(WR.SafeRX(__dirname.replace(/[\\/][^\\/]*_modules[\\/].*/,'')),'ig'),
	ErrorS = E => WW.IsObj(E) && E.stack && WW.IsStr(E.stack) ?
		E.stack.replace(RegExpDir,'{[RootDir]}') :
		E,
	RecErrList = [],
	RecErrGeneral = (File,Err) =>
	{
		ConfDebugLimit <= RecErrList.length &&
			RecErrList.shift()
		File = WN.RelP(__dirname,File)
		Err = ErrorS(Err)
		RecErrList.push([File,Err])
		WebSocketBroadcast(Proto.AuthErrFile,{File,Err})
	},
	RecErrTaskMap = {},
	RecErrTaskList = [],
	RecErrTask = (Row,Err,State,At) =>
	{
		var
		ClearErr = Row =>
		{
			WR.Del(Row,RecErrTaskMap)
			Err = RecErrTaskList.indexOf(Row)
			~Err && RecErrTaskList.splice(Err,1)
			WebSocketBroadcast(Proto.TaskErr,{Row})
			WebSocketBroadcast(Proto.AuthErr,{Row})
		},
		F;
		Err = ErrorS(Err)
		if (null == Err)
		{
			if (WW.IsArr(Row)) WR.EachU((_,F) =>
			{
				Row[0] <= F && F < Row[1] && ClearErr(F)
			},RecErrTaskMap)
			else WR.Has(Row,RecErrTaskMap) && ClearErr(Row)
		}
		else
		{
			if (!WR.Has(Row,RecErrTaskMap))
			{
				if (ConfDebugLimit <= RecErrTaskList.length)
				{
					WR.Del(RecErrTaskList[0],RecErrTaskMap)
					RecErrTaskList.shift()
				}
				RecErrTaskList.push(Row)
			}
			RecErrTaskMap[Row] = Err
			WebSocketBroadcast(Proto.TaskErr,{Row,State,At})
			WebSocketBroadcast(Proto.AuthErr,{Row,Err : WC.OTJ(Err)})
		}
	},

	SettingMake = (K,H,D) => R => null != (R = DataSetting.D(K)) && H(R) ? R : D,
	Setting =
	{
		Lang : SettingMake('Lang',WW.IsStr,0),
		Unload : SettingMake('Unload',WR.T,false),
		Dir : SettingMake('Dir',WW.IsStr,PathSave),
		Fmt : SettingMake('Fmt',WW.IsStr,'|Up|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?'),
		Max : SettingMake('Max',Q => WW.IsIn(Q,1,65),4),
		Proxy : SettingMake('Proxy',WR.T,false),
		ProxyURL : SettingMake('ProxyURL',WW.IsStr,undefined),
		ProxyURLUpdate : Q =>
		{
			DataSetting.D('ProxyURL',Q)
			WebSocketBroadcast(Proto.AuthSettingProxy,{URL : Q})
		},
		ProxyCand : SettingMake('ProxyCand',WW.IsStr,''),
		Delay : SettingMake('Delay',WW.IsNum,20),
		Size : SettingMake('Size',WR.T,true),
		Meta : SettingMake('Meta',WR.T,true),
		Cover : SettingMake('Cover',WR.T,true),
		HTTP429 : SettingMake('HTTP429',WW.IsNum,60),
		HTTP429Auto : SettingMake('HTTP429Auto',WR.T,false),
	},
	SiteO =
	{
		Cmp : DataComponent,
		CokeRaw : Q => CookieMap[Q]
	},
	Site = require('./Site/_')(SiteO),
	DBOpt =
	{
		PathData,
		Debug : false,
	},
	DB = require('./DB.SQLite')(DBOpt),
	DBVersion = WW.Now(),

	LoopO =
	{
		Setting,
		Site,
		DB,
		Err : RecErrGeneral,
		ErrT : RecErrTask,
		OnRenew : Row => WebSocketBroadcast(Proto.TaskRenew,{Row,On : true}),
		OnRenewDone : Row => WebSocketBroadcast(Proto.TaskRenew,{Row}),
		OnInfo : (Row,Info,To = WebSocketBroadcast) =>
		{
			var
			Meta,MetaURL;
			Info.Down.forEach(V =>
			{
				if (-8000 === V.Part)
				{
					Meta = V
					MetaURL = V.URL
					V.URL = ''
				}
			})
			To(Proto.AuthTaskInfo,{Row,Task : Info})
			if (Meta)
				Meta.URL = MetaURL
		},
		OnTitle : (Row,Title) => WebSocketBroadcast(Proto.TaskTitle,{Row,Title}),
		OnFile : (Row,Part,File,Size) => WebSocketBroadcast(Proto.AuthDownFile,{Row,Part,File,Size}),
		OnSize : (Row,File,Size) => WebSocketBroadcast(Proto.TaskSize,{Row,File,Size}),

		OnPlay : (Row,Part,File,Play) => WebSocketBroadcast(Proto.AuthDownPlay,{Row,Part,File,Play}),
		OnConn : (Row,Part,File,First) => WebSocketBroadcast(Proto.AuthDownConn,{Row,Part,File,First}),
		OnPath : (Row,Part,File,Path) => WebSocketBroadcast(Proto.AuthDownPath,{Row,Part,File,Path}),
		OnHas : (Row,Part,File,Has,Take) => WebSocketBroadcast(Proto.AuthDownHas,{Row,Part,File,Has,Take}),
		OnTake : (Row,Part,File,Take) => WebSocketBroadcast(Proto.AuthDownTake,{Row,Part,File,Take}),
		OnDone : (Row,Part,File,Done) => WebSocketBroadcast(Proto.AuthDownDone,{Row,Part,File,Done}),

		OnFinal : (Row,Done) => WebSocketBroadcast(Proto.TaskHist,{Ver : ++DBVersion,Row,Done}),

		OnEnd : WR.ThrottleDelay(10,() => OnTick(true)),
	},
	Loop = require('./Loop')(LoopO),

	WebToken,
	TokenStepA = Q => WC.HSHA512(Q,'j!ui+Ju8?j'),
	TokenStepB = Q => WC.HSHA512('!(|[.:O9;~',Q),
	CookieE = Q => WC.B91S(WC.AESE(WebToken.slice(0,32),WebToken.slice(-16),Q)),
	CookieD = Q => WC.U16S(WC.AESD(WebToken.slice(0,32),WebToken.slice(-16),WC.B91P(Q))),

	RequestComm = SiteO.Req = LoopO.Req = Q =>
	{
		Q = WW.IsObj(Q) ? {...Q} : {URL : Q}
		;/^\w+:\/\//.test(Q.URL) || (Q.URL = Q.URL.replace(/^\/*/,'https://'))
		if (WW.IsStr(Q.URL) && WR.StartW('https://www.googleapis.com/',Q.URL))
			Q.URL = Q.URL.replace(/~GoogleAPIKey~/,Option.GoogleAPIKey || WC.B91S('DaXh66^N/%57mxMn{1D.V0}uQVa!PO~XvMDFm4<68%w7_Pck'))
		Q.AC = false
		Setting.Proxy() && Setting.ProxyURL() &&
			(Q.Pro = Setting.ProxyURL())
		return Q
	},
	RequestCoke = SiteO.Coke = (Q,V) => WN.ReqOH(Q,'Cookie',CookieMap[V]),

	WebServerEntryMtx = WX.Mtx(),
	WebServerEntryKey,
	WebServerEntryPath = WN.JoinP(PathData,'Web.js'),
	WebServerProxyOmit = new Set(
	[
		'cookie',
		'host',
		'referer',
		'set-cookie',
		'user-agent',
	]),
	/**@type {Map<string,
	{
		ID : number
		Key : Buffer
		IV : Buffer
		Req : WishNS.ReqAccept
		To : WishNS.ToU
	}>}*/
	WebServerProxyReq = new Map,
	WebServerProxyBuff = WC.Buff(1024),
	WebServerFileRead = (Path,Transform = WR.Id) =>
	{
		var Mtx = WX.Mtx(),At,R;
		return Mtx(() => WN.Stat(Path)
			.FMap(S => At === S.mtimeMs ?
				WX.Just([At,R]) :
				WN.UR(Path).Map(B => [At = S.mtimeMs,R = Transform(B)])))
	},
	WebServer404 = (Req,Res,Next) =>
	{
		if (Next) Next()
		else
		{
			Res.writeHead(404)
			Res.end(`Unable to resolve //${Req.headers.host || ''}${Req.url}`)
		}
	},
	WebServerFileSend = H => (Req,Res,Next,Param) =>
	{
		WX.Any(WW.IsFunc(H) ? H(Param) : H)
			.FMap(B =>
			{
				if (Next)
				{
					Res.sendFile(B)
					return WX.Empty
				}
				/\.js$/.test(B) && Res.setHeader('Content-Type','application/javascript; charset=UTF-8')
				return WN.UR(B).Map(R => Res.end(R))
			})
			.Now(null,() => WebServer404(Req,Res,Next))
	},
	WebServerEndpoint =
	{
		'' : WebServerFileSend(WN.JoinP(__dirname,'Web.htm')),
		W : WebServerFileSend(require.resolve('@zed.cwt/wish')),
		M : WebServerFileSend(WX.From(
		[
			WebServerFileRead(WN.JoinP(__dirname,'Web.js')),
			WebServerFileRead(WN.JoinP(__dirname,'Lang.js'),B => B.replace(/^[^{]+/,'')),
		]).Online(1).Reduce((D,V) => D ? D.push(V) && D : [V],null).FMap(B => WebServerEntryMtx(() =>
		{
			var
			Key = B.reduce((D,V) => D + '.' + V[0],''),
			M;
			if (Key === WebServerEntryKey)
				return WX.Just(WebServerEntryPath)
			M =
			{
				Conf : WC.OTJ(
				{
					Lang : Setting.Lang(),
					Unsafe : +!!Option.UnsafeExport,
				},{Apos : true}),
				Lang : B[1][1],
				Proto : ProtoJSON,
				ProtoPB : ProtoPBJSON,
			}
			return WN.UW(WebServerEntryPath,B[0][1].replace(/{\/\*{(\w+)}\*\/}/g,(_,V) => M[V])).Map(() =>
			{
				WebServerEntryKey = Key
				return WebServerEntryPath
			})
		}))),
		S : WebServerFileSend(Param => /^(?!_)\w+$/.test(Param) ?
			WN.JoinP(__dirname,'Site',Param + '.js') :
			WX.Throw()),
		R : (Req,Res,Next,Param) =>
		{
			var
			WithHead = true,
			HeadWrite = (Q,S) =>
			{
				var F = 0;
				Q = Q.rawHeaders
				for (;F < Q.length;F += 2)
					WebServerProxyOmit.has(WR.Low(Q[F])) || S.setHeader(Q[F],Q[-~F])
			},
			Q,
			ReqO,ReqU,
			OnReq;
			try
			{
				if (WR.StartW('~',Param))
				{
					Param = Param.slice(1)
					WithHead = false
				}
				if (Q = /^=([^=]+)=([^]+)$/.exec(Param))
				{
					Param = WC.JTO(WC.B64U(Q[1]))
					Param.URL = Q[2]
					Q = Param
				}
				else Q = Param
				ReqO = RequestComm(Q)
				ReqO.GZ = false
				ReqO.Enc = false
				ReqO.AC = true
				OnReq = Site.OnReq(Q)
				ReqO.OnD = D =>
				{
					Res.write(D)
					OnReq?.D(D)
				}
				ReqO.OnE = () =>
				{
					Res.end()
					OnReq?.E()
				}
				ReqU = WN.Req(ReqO)
					.On('Req',O => WithHead && HeadWrite(Req,O))
					.On('Res',O =>
					{
						WithHead && HeadWrite(O,Res)
						Res.writeHead(O.statusCode,O.statusMessage)
						OnReq?.H(O)
					})
					.On('Err',() => Res.destroy())
				Res
					.once('error',ReqU.End)
					.once('close',ReqU.End)
			}
			catch(_)
			{
				WebServer404(Req,Res,Next)
			}
		},
		U : (Req,Res,Next,Param) =>
		{
			var
			Opt = WebServerProxyReq.get(Param),
			Cipher,
			ReqO,ReqU,
			OnReq;
			if (!Opt)
				return WebServer404(Req,Res,Next)
			try
			{
				Opt.To.F().C()
				Cipher = Crypto.createCipheriv(ConfCryptoMethod,Opt.Key,Opt.IV)
				ReqO = RequestComm(Opt.Req)
				ReqO.Enc = false
				ReqO.AC = true
				ReqO.TO = 3E4
				OnReq = Site.OnReq(Opt.Req)
				ReqO.OnD = D =>
				{
					Cipher.write(D)
					OnReq?.D(D)
				}
				ReqO.OnE = () =>
				{
					Cipher.end()
					OnReq?.E()
				}
				ReqU = WN.Req(ReqO)
					.On('Res',O => OnReq?.H(O))
					.On('Head',O =>
					{
						var
						R = Buffer.from(
						[
							O.Code,
							O.Msg,
							...O.W,
						].join`\n`,'UTF8'),
						T,F = 0;
						for (T = Opt.ID;T = (T - (WebServerProxyBuff[F++] = T % 128)) / 128;)
							WebServerProxyBuff[F - 1] |= 128
						for (T = R.length;T = (T - (WebServerProxyBuff[F++] = T % 128)) / 128;)
							WebServerProxyBuff[F - 1] |= 128
						Cipher.write(WebServerProxyBuff.subarray(0,F))
						Cipher.write(R)
					})
					.On('Err',() => Res.destroy())
				Cipher
					.once('error',ReqU.End)
					.pipe(Res)
					.once('error',ReqU.End)
					.once('close',ReqU.End)
			}
			catch(_)
			{
				WebServer404(Req,Res,Next)
			}
		},
	},
	WebServerRun = (Req,Res,Next) =>
	{
		var
		Q = /^\/?(\w*)(?:\W([^]*))?$/.exec(Req.url),
		Act = Q && WR.Has(Q[1],WebServerEndpoint) && WebServerEndpoint[Q[1]];
		Act ?
			Act(Req,Res,Next,Q[2] || '') :
			WebServer404(Req,Res,Next)
	},
	WebServer = HTTP.createServer(WebServerRun),
	WebSocketPoolSend = new Set,
	WebSocketPoolBrief = new Set,
	WebSocketPoolAuthSuicide = new Set,
	WebSocketBroadcast = (Q,S) => WebSocketPoolSend.forEach(V => V(Q,S)),
	WebSocketBroadcastBrief = H => WebSocketPoolBrief.forEach(V => V(H)),
	OnSocket = S =>
	{
		var
		Cipher = Crypto.createCipheriv(ConfCryptoMethod,WC.Slice(WebToken,-32),WC.Slice(WebToken,16,32)),
		Decipher = Crypto.createDecipheriv(ConfCryptoMethod,WC.Slice(WebToken,0,32),WC.Slice(WebToken,-16)),
		Suicide = () => S.terminate(),

		ProtoCurrent,
		DetailRow,
		DBLoadingVer,DBLoadingRow,
		DBSite = WX.EndL(),
		ReqQueue = new Map,
		Send = (ID,Data) =>
		{
			if (S.readyState === S.OPEN)
			{
				if (ProtoIsAuthDetail.has(ID) && DetailRow !== Data.Row) return
				if (ProtoIsAuth.has(ID))
				{
					if (!AuthInited) return
					Data = ProtoMsgMake(ID,Data)
					Data = Buffer.concat([ProtoMsgTypeAuthBuff,Cipher.update(Data.subarray(1))])
				}
				else Data = ProtoMsgMake(ID,Data)
				S.send(Data)
			}
		},
		BriefOn = true,
		Brief = Data =>
		{
			if (BriefOn && S.readyState === S.OPEN)
			{
				BriefOn = false
				S.send(Data())
			}
		},
		/**@type {<U extends keyof Proto,N extends keyof _$_Lang['EN']>(Src : U,Msg : N,...S? : string[]) => void}*/
		Err = (Src,Msg,...Arg) => Send(Proto.Error,{Src,Msg,Arg}),
		// Fatal is not meant to occur involving properly functional C/S, thus it is not necessary to localization fatal messages.
		Fatal = S =>
		{
			Err(ProtoCurrent,S)
			Suicide()
		},
		SolveJSON = Q =>
		{
			var R = WW.Try(WC.JTO,[Q]);
			return WW.TryE === R ?
				Err(ProtoCurrent,'Bad JSON',ErrorS(R[0])) :
				R
		},
		DBMulti = (Q,S,E) =>
		{
			var H = ProtoCurrent;
			WW.IsArr(Q) ?
				WX.From(Q)
					.FMapE(V => S(V).FinErr())
					.Reduce(WR.Or)
					.Now(B =>
					{
						if (B) WW.IsArr(B = B[0]) ?
							Err(H,...B) :
							Err(H,ErrorS(B))
						E && E()
					}) :
				Err(H,'ErrBadReq')
		},
		DBMultiSeg = (Q,S,E) =>
		{
			var
			Seg = [],
			SegCurr;

			if (!WW.IsArr(Q))
				return Err(H,'ErrBadReq')

			Q.sort((Q,S) => Q - S).forEach(V =>
			{
				SegCurr && V === SegCurr[1] ?
					++SegCurr[1] :
					Seg.push(SegCurr = [V,1 + V])
			})
			DBMulti(Seg,S,E)
		},

		TickLastResponse = 0,

		ActPlain =
		{
			[Proto.TaskOverview] : Data =>
			{
				DB.Over(Data.Row).Now
				(
					B => Send(Proto.TaskOverview,
					{
						Row : Data.Row,
						Task : B,
					}),
					E => Send(Proto.TaskOverview,
					{
						Row : Data.Row,
						Err : ErrorS(E),
					}),
				)
			},

			[Proto.Tick] : Data =>
			{
				BriefOn = true
				TickLastResponse + 3E5 < WW.Now() && Send(Proto.Tick,
				{
					...Data,
					TimeServer : TickLastResponse = WW.Now(),
				})
			},

			[Proto.DBBrief] : Data =>
			{
				if (!Data.Cont && Data.Ver === DBVersion)
				{
					Send(Proto.DBBrief,{Ver : DBVersion})
					return
				}
				if (!Data.Cont)
				{
					DBLoadingVer = DBVersion
					DBLoadingRow = 0
				}
				(Data.Cont ? WX.Just(null) : DB.Count())
					.FMap(Count => DB.Brief(DBLoadingRow,WR.Fit(1024,Data.Limit,8192)).Tap(B =>
					{
						var R;
						if (B.length)
							DBLoadingRow = WR.Last(B).Row
						R =
						{
							Part : B,
							Count : Count,
						}
						Send(Proto.DBBrief,B.length ?
							Data.GZ ? {Bin : ZLib.deflateRawSync(ProtoEnc(Proto.DBBrief,R))} : R :
							{Ver : DBLoadingVer})
					}))
					.Now(null,E => Err('DBBrief','ErrDBLoad',ErrorS(E)))
			},
			[Proto.DBSite] : Data =>
			{
				DBSite(WX.Just()
					.FMap(() =>
					{
						var P;
						if (!WR.Has(Data.Med,DB.Site))
							WW.Throw('Bad Method')
						P = SolveJSON(Data.JSON)
						return P ? DB.Site[Data.Med](...P) : WW.Throw('Bad Param')
					})
					.Now
					(
						B => Send(Proto.DBSite,
						{
							ID : Data.ID,
							JSON : WC.OTJ(B),
						}),
						E => Send(Proto.DBSite,
						{
							ID : Data.ID,
							Err : ErrorS(E),
						}),
					))
			},
		},
		AuthInited,AuthPreparing,AuthSeed,
		WithAuth = H => Data => AuthInited ? H(Data) : Fatal('Who are you'),
		ActAuth =
		{
			[Proto.AuthHello] : Data =>
			{
				if (AuthInited) return Fatal('Talked too much')
				if (AuthPreparing)
				{
					if (Data.Ack !== AuthSeed)
						return Fatal(`Ack failure ${AuthSeed} ${Data.Ack}`)
					AuthInited = true
					AuthPreparing = false
					Send(Proto.AuthCookie,{JSON : WC.OTJ(CookieMap)})
					Send(Proto.AuthSetting,{JSON : WC.OTJ(DataSetting.O())})
					Send(Proto.AuthErr,{JSON : WC.OTJ(RecErrTaskMap)})
					Send(Proto.AuthErrFile,{JSON : WC.OTJ(RecErrList)})
					return
				}
				AuthPreparing = true
				WebSocketPoolAuthSuicide.add(Suicide)
				AuthInited = true
				Send(Proto.AuthHello,
				{
					Syn : AuthSeed = WW.Rnd(0x4000000000000),
					Ack : Data.Syn,
				})
				AuthInited = false
			},
			[Proto.AuthToken] : WithAuth(Data =>
			{
				if (WC.HEXS(TokenStepB(WC.B91P(Data.Old))) === WC.HEXS(WebToken))
					WN.UW(FileToken,WC.B91S(TokenStepB(WC.B91P(Data.New))))
						.FP(WN.UR(FileToken))
						.Now(B =>
						{
							WebToken = WC.Buff(WC.B91P(B))
							DataCookie.O(WR.Map(CookieE,CookieMap))
							Send(Proto.AuthToken)
							WebSocketPoolAuthSuicide.forEach(V => V())
						},E => Err('AuthToken','ErrAuthSave',ErrorS(E)))
				else Err('AuthToken','ErrAuthInc')
			}),
			[Proto.AuthCookie] : WithAuth(Data =>
			{
				if (Site.H(Data.Site))
				{
					DataCookie.D(Data.Site,CookieE(CookieMap[Data.Site] = Data.Coke))
					WebSocketBroadcast(Proto.AuthCookie,{Site : Data.Site,Coke : Data.Coke})
				}
				else Err('AuthCookie','ErrUnkSite',Data.Site)
			}),
			[Proto.AuthReq] : WithAuth(Data =>
			{
				var
				Rnd = Q =>
				{
					var R = WW.Try(Crypto.randomBytes,[Q]);
					return WW.TryE === R ?
						WC.Buff(WR.Times(() => WW.Rnd(256),Q)) :
						R
				},
				Token = WC.B64S(Rnd(30)),
				Key = Rnd(32),
				IV = Rnd(16),
				Req,
				To;
				if (Req = SolveJSON(Data.JSON))
				{
					if (WW.IsObj(Req) && Req.Cookie)
						Req = RequestCoke(Req,Req.Cookie)
					To = WW.To(ConfReqLife,() =>
					{
						WebServerProxyReq.delete(Token)
						ReqQueue.delete(Token)
					})
					WebServerProxyReq.set(Token,{ID : Data.ID,Key,IV,Req,To})
					ReqQueue.set(Token,To)
					Send(Proto.AuthReq,
					{
						ID : Data.ID,
						Token,
						Key,
						IV,
					})
				}
			}),

			[Proto.AuthShortCut] : WithAuth(Data =>
			{
				if (Data = SolveJSON(Data.JSON))
				{
					DataShortCut.O(WR.Where(WR.Id,Data))
					WebSocketBroadcast(Proto.ShortCut,{JSON : WC.OTJ(DataShortCut.O())})
				}
			}),
			[Proto.AuthSetting] : WithAuth(Data =>
			{
				var L;
				if (Data = SolveJSON(Data.JSON))
				{
					Data = WR.Where(V => null != V,Data)
					if (WR.Has('Dir',Data) && !Path.isAbsolute(Data.Dir))
						Err('AuthSetting','ErrSetDir')
					else
					{
						L = Setting.Lang()
						WebSocketBroadcast(Proto.AuthSetting,{JSON : WC.OTJ(DataSetting.O(Data))})
						if (L !== Setting.Lang())
							WebServerEntryKey = null
						Loop.OnSet()
					}
				}
			}),

			[Proto.AuthTaskNew] : WithAuth(Data =>
			{
				DBMulti(Data.Task,V => Site.H(V.Site) ?
					DB.New(
					{
						...V,
						Birth : WW.Now(),
						Root : Setting.Dir(),
						Format : Setting.Fmt(),
					}).Map(B => WebSocketBroadcast(Proto.TaskNew,
					{
						Ver : ++DBVersion,
						Task : B,
					})) :
					WX.Throw(['ErrUnkSite',V.Site]),Loop.Info)
			}),
			[Proto.AuthTaskInfo] : WithAuth(Data =>
			{
				if (DetailRow = Data.Row)
					DB.Full(DetailRow).Now
					(
						B => LoopO.OnInfo(Data.Row,B,Send),
						E => Send(Proto.AuthTaskInfo,
						{
							Row : Data.Row,
							Err : ErrorS(E),
						})
					)
			}),
			[Proto.AuthTaskPlay] : WithAuth(Data =>
			{
				DBMultiSeg(Data.Row,V =>
					DB.PlayRange(...V).Map(() => WebSocketBroadcast(Proto.TaskPlay,
					{
						Ver : ++DBVersion,
						RowRange : V,
					})),() =>
					{
						Loop.Info()
						Loop.Down()
					})
			}),
			[Proto.AuthTaskPause] : WithAuth(Data =>
			{
				DBMultiSeg(Data.Row,V =>
					DB.PauseRange(...V).Map(() =>
					{
						WebSocketBroadcast(Proto.TaskPause,
						{
							Ver : ++DBVersion,
							RowRange : V,
						})
						RecErrTask(V)
						Loop.Stop(V,true)
					}),() =>
					{
						Loop.Info()
						Loop.Down()
					})
			}),
			[Proto.AuthTaskRemove] : WithAuth(Data =>
			{
				DBMulti(Data.Row,V =>
					DB.Del(V).Map(Done =>
					{
						WebSocketBroadcast(Proto.TaskRemove,
						{
							Ver : ++DBVersion,
							Row : V,
							Done,
						})
						Loop.Del(V)
					}))
			}),

			[Proto.AuthInspect] : WithAuth(Data =>
			{
				if (Data = SolveJSON(Data.JSON))
					if (false === Data[0])
					{
						Inspector.close()
						Send(Proto.AuthInspect)
					}
					else
					{
						Inspector.url() || Inspector.open(...Data)
						Send(Proto.AuthInspect,{URL : Inspector.url()})
					}
			}),
			[Proto.AuthReload] : WithAuth(() =>
			{
				Site.F()
				LoopO.Site =
				Site = require('./Site/_')(SiteO)
			}),
			[Proto.AuthVacuum] : WithAuth(() =>
			{
				var
				Begin = WW.Now();
				DB.Stat().FMap(From => DB.Vacuum()
					.FMap(DB.Stat)
					.Tap(To => Send(Proto.AuthVacuum,
					{
						Take : WW.Now() - Begin,
						From : From?.size,
						To : To?.size,
					}),E => Send(Proto.AuthVacuum,
					{
						Take : WW.Now() - Begin,
						From : From?.size,
						Err : ErrorS(E),
					})))
					.Now(null,WW.O)
			}),
			[Proto.AuthDebug] : WithAuth(() =>
			{
				DBOpt.Debug = !DBOpt.Debug
			}),
		};

		S.on('message',(Q,IsBuf) =>
		{
			var
			Type = 0,
			ID = 0,Check = 0,
			UVM = 1,
			F = 1;

			if (WW.IsStr(Q) || false === IsBuf)
				return Suicide()
			ProtoCurrent = '<Null>'
			Type = Q[0]
			if (ProtoMsgTypeAuth === Type)
			{
				Q = Decipher.update(Q.subarray(1))
				F = 0
			}
			else if (ProtoMsgTypePlain !== Type)
				return Suicide()
			for (;
				ID += UVM * (127 & Q[F]),
				127 < Q[F++]
			;) UVM *= 128
			ProtoCurrent = ProtoInv[ID]
			for (UVM = 1;
				Check += UVM * (127 & Q[F]),
				127 < Q[F++]
			;) UVM *= 128
			if (ID + Q.length - F - Check)
			{
				Err('AuthToken','ErrAuthFail')
				Suicide()
			}
			else if (Type = (ProtoMsgTypeAuth === Type ? ActAuth : ActPlain)[ID])
				try{Type(ProtoDec(ID,Q.subarray(F)))}
				catch(E){Err(ProtoCurrent,ErrorS(E))}
		}).on('close',() =>
		{
			ReqQueue.forEach(V => V.F().C())
			WebSocketPoolSend.delete(Send)
			WebSocketPoolBrief.delete(Brief)
			WebSocketPoolAuthSuicide.delete(Suicide)
		})

		WebSocketPoolSend.add(Send)
		WebSocketPoolBrief.add(Brief)
		Send(Proto.ShortCut,{JSON : WC.OTJ(DataShortCut.O())})
		Send(Proto.TaskRenew,{All : Loop.Renewing()})
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
			.Map(Q => WebToken = WC.Buff(WC.B91P(Q.split(/\s/)[0])))
			.FMap(() => DB.Init)
			.Now(null,null,() =>
			{
				CookieMap = WR.Map(CookieD,DataCookie.O())
				DataSetting.D('Dir') ||
					DataSetting.D('Dir',PathSave)
				WW.IsNum(PortWeb) && new (require('ws')).Server({server : WebServer.listen(PortWeb)}).on('connection',OnSocket)
				Loop.Info()
				Loop.Down()
				WW.To(5E2,OnTick,true)
			}),
		Exp : X => (X = X || require('express').Router())
			.use((Q,S,N) => '/' === Q.path && !/\/(\?.*)?$/.test(Q.originalUrl) ? S.redirect(302,Q.baseUrl + Q.url) : N())
			.use(WebServerRun),
		Soc : OnSocket
	}
}