'use strict'
~function()
{
	var
	WW = Wish,
	WR = WW.R,
	WC = WW.C,
	WB = WW.B,
	WV = WW.V,
	WX = WW.X,
	Top = Wish.Top,
	WebSocket = Top.WebSocket,
	RegExp = Top.RegExp,

	ActionWebTaskNew = 'TaskN',
	ActionWebTaskOverview = 'TaskO',
	ActionWebTaskPlay = 'TaskP',
	ActionWebTaskPause = 'TaskU',
	ActionWebTaskRemove = 'TaskD',
	ActionWebTaskSize = 'TaskS',
	ActionWebTaskRenew = 'TaskW',
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
	ActionAuthErrT = 'RErrT',

	Retry = 1E4,
	Padding = 20,
	PaddingHalf = Padding / 2,
	PaddingQuarter = PaddingHalf / 2,
	SizeHeader = 40,
	SizeFooter = 40,
	SizeCardWidth = 200,
	PageSize = 30,
	TaskButtonSize = 80,
	CacheLimit = 128,
	TickInterval = 500,

	Href = location.href.replace(/[?#].*/,'').replace(/^http/,'ws'),
	URLSite = 'Site/',
	URLApi = 'Api/',

	Lang = Top.Lang,
	LangDefault = Lang.EN,
	LangNow = LangDefault,
	LangTo = function(Q)
	{
		LangNow = WR.Has(Q,Lang) ? Lang[Q] : LangNow
	},
	SA = function(/**@type {keyof Lang['EN']}*/Q,S)
	{
		WW.IsArr(Q) && (S = Q.slice(1),Q = Q[0])
		return WR.Has(Q,LangNow) ? S ? WW.Fmt(LangNow[Q],S,'~') : LangNow[Q] :
			WR.Has(Q,LangDefault) ? S ? WW.Fmt(LangDefault[Q],S,'~') : LangDefault[Q] :
			'{' + Q + (S ? '|' + S.join(':') : '') + '}'
	},
	ErrorS = function(E)
	{
		WW.IsObj(E) && (E = E.stack || E)
		WW.IsObj(E) && (E = WC.OTJ(E))
		return '{ERR} ' + E
	},
	DTS = function(Q){return WW.StrDate(Q,WW.DateColS)},
	NumberZip = WC.Rad(WR.Map(WR.CHR,WR.Range(33,127))),
	SolveURL = function(Q,S)
	{
		if (WR.StartW('//',Q))
			Q = 'http:' + Q
		if (S && WR.StartW('/',Q))
			Q = WW.MU(/^[^/]+\/\/[^/]+/,S) + Q
		return Q
	},
	RemainS = function(V){return '-' + WW.StrS(V / 1000)},

	ClassTitleSplit = WW.Key(),
	ClassCount = WW.Key(),
	ClassMargin = WW.Key(),
	ClassPadding = WW.Key(),
	ClassHighLight = WW.Key(),
	ClassSingle = WW.Key(),
	ClassTask = WW.Key(),
	ClassOverlay = WW.Key(),
	ClassHeader = WW.Key(),
	ClassDetail = WW.Key(),
	ClassDetailPart = WW.Key(),
	MakeHigh = function(V)
	{
		return WV.T(WV.Rock(ClassHighLight,'span'),V)
	},
	MakeSingle = function(Q)
	{
		return WV.T(WV.Rock(ClassSingle + (Q ? ' ' + Q : '')),'\xA0')
	},
	SingleFill = function(Q,W,A)
	{
		WV.Con(Q,A ?
			[W,MakeHigh(' @ '),A] :
			W)
		WV.Ti(Q,A ?
			W + ' @ ' + A :
			WW.IsObj(W) ? '' : W)
	},
	MakeCount = function()
	{
		var R = WV.Rock(ClassCount,'span');
		return {
			R : R,
			D : function(Q)
			{
				WV.T(R,Q.length ? '[' + Q.length + ']' : '')
			}
		}
	},
	InpNoRel = function(Q)
	{
		return [SA('GenNoRel'),WV.X(Q,'span')]
	},

	CrabSave = Top.CrabSave,

	Rainbow = WV.Div(2,1,null,[0,SizeFooter]),
	RMain = WV.Div(2,2,['10%'],[SizeHeader,'100%'],true),
	RTab = WV.Split({Pan : [null,RMain[3],RMain[4]],Main : true}),
	ROverlay = WV.Rock(ClassOverlay),
	Noti = WV.Noti({Top : RMain[0]}),
	NotiAuth = Noti.O(),
	NotiNewToken = Noti.O(),
	CookieMap = {},
	ShortCut = WW.Bus(),
	ShortCutGeneralTabPrev = 'GenTabPrev',
	ShortCutGeneralTabNext = 'GenTabNext',
	ShortCutGeneralProxy = 'GenProxy',
	ShortCutGeneralFocus = 'GenFocusKeywordInput',
	ShortCutBrowseSelAll = 'BroSelAll',
	ShortCutBrowseSelClear = 'BroSelClear',
	ShortCutBrowseHead = 'BroHead',
	ShortCutBrowsePrev = 'BroPrev',
	ShortCutBrowseNext = 'BroNext',
	ShortCutBrowseLast = 'BroLast',
	ShortCutColdCommit = 'ColCommit',
	ShortCutColdCommitAll = 'ColCommitAll',
	ShortCutListSelAll = 'LstSelAll',
	ShortCutListSelClear = 'LstSelClear',
	ShortCutOverlayClose = 'OlyClose',
	ShortCutOnPage = function(K,Q,S)
	{
		ShortCut.On(Q,function()
		{
			OverlayOn ||
				RTab.Is(K) && S()
		})
	},
	ShortCutOnOverlay = function(Q,S)
	{
		ShortCut.On(Q,function()
		{
			OverlayOn && S()
		})
	},
	Setting = {},
	BrowserOnProgress,
	TickQueue = [],
	Tick = function(Q){TickQueue.push(Q)},
	RStatusBar = WV.Div(2,[0,'10%'],true),
	RStatus = WV.Rock(),
	RSpeed = WV.Rock(),

	IDCombine = function(Site,ID)
	{
		return (WW.IsObj(Site) ? Site.ID : Site) + '|' + ID
	},
	BrowserUpdate,
	ColdCount = MakeCount(),
	IsCold,
	ColdAdd,
	ColdDel,
	ProgressMap = {},
	HotCount = MakeCount(),
	IsHot,
	IsHistory,

	Online,
	WebSocketRetry = 0,
	WebSocketSince = 0,
	WebSocketNotConnectedNoti = Noti.O(),
	WebSocketNotConnected = function(){WebSocketNotConnectedNoti(SA('ErrOff'))},
	WebSocketNotAuthed,WebSocketNotAuthedNoti = Noti.O(),
	WebSocketSend = WebSocketNotConnected,
	WebSocketSendAuth = WebSocketNotConnected,
	WebSocketSendAuthPrecheck = function()
	{
		return Cipher || WebSocketNotAuthed()
	},
	WebSocketNoti = Noti.O(),
	TokenStepA = function(Q){return WC.HSHA512(Q,'j!ui+Ju8?j')},
	TokenStepB = function(Q){return WC.HSHA512('!(|[.:O9;~',Q)},
	Cipher,Decipher,
	MakeWebSocket = function()
	{
		var
		First = !WebSocketRetry,
		Client = new WebSocket(Href),
		Suicide = function(){Client.close()};
		Client.onmessage = function(Q)
		{
			var
			K,O;
			Q = Q.data
			if (10 === Q.charCodeAt(0))
			{
				ProgressMap = {}
				WR.Each(function(V)
				{
					if (V)
					{
						V = V.split(' ')
						ProgressMap[NumberZip.P(V[0])] = [NumberZip.P(V[1]),NumberZip.P(V[2])]
					}
				},Q.split('\n'))
				WSOnProgress()
				WebSocketSend([ActionWebTick])
			}
			else if (!Q.charCodeAt(0))
			{
				Q = WC.JTOO(WC.U16S(Decipher.D(WC.B91P(Q))))
				if (!WW.IsArr(Q) || !WW.IsArr(Q = Q[1])) return Suicide()
				K = Q[1]
				O = Q[2]
				switch (Q[0])
				{
					case ActionAuthHello :
						NotiAuth(SA('AutAuthed'))
						NotiAuth(false)
						WebSocketNotAuthedNoti(false)
						break

					case ActionAuthToken :
						NotiNewToken(SA(K))
						NotiNewToken(false)
						break
					case ActionAuthCookie :
						WSOnCookie(K,O)
						break

					case ActionAuthSetting :
						WSOnSetting(K)
						break

					case ActionAuthApi :
						WR.Has(K,WSOnApi) && WSOnApi[K](Q)
						break

					case ActionAuthTaskInfo :
						TaskFullInfoUpdate(K,O)
						break

					case ActionAuthDownFile :
					case ActionAuthDownPlay :
					case ActionAuthDownConn :
					case ActionAuthDownPath :
					case ActionAuthDownHas :
					case ActionAuthDownTake :
					case ActionAuthDownDone :
						DetailIs(K[0]) && DetailUpdate.U(Q[0].slice(-1),K[1],K[2],O)
						break

					case ActionAuthInspect :
						console.log('Inspecting on',K)
						break

					case ActionAuthErr :
						WSOnErr(K,O)
						break
					case ActionAuthErrT :
						WSOnErrT(K,O)
						break
				}
				return
			}
			Q = WC.JTOO(Q)
			K = Q[1]
			O = Q[2]
			switch (Q[0])
			{
				case ActionWebShortCut :
					WSOnSC(K)
					break

				case ActionWebTaskNew :
				case ActionWebTaskPlay :
				case ActionWebTaskPause :
				case ActionWebTaskRemove :
					WSOnDiffHot.D(Q)
					WSOnDiffHist.D(Q)
					break
				case ActionWebTaskHist :
					WSOnDiffHot.D(Q)
					break
				case ActionWebTaskOverview :
					TaskOverviewUpdate(K,O)
					break
				case ActionWebTaskRenew :
					WSOnRenew(K,O)
					break
				case ActionWebTaskSize :
					WSOnSize(K,O)
					break
				case ActionWebTaskErr :
					WSOnTaskErr(K,O)
					break

				case ActionWebError :
					Noti.S([SA('Err'),' | ',K,' | ',SA(O)])
			}
		}
		Client.onopen = function()
		{
			Online = true
			First || WebSocketNoti(SA('SocOn'))
			WebSocketNoti(false)
			WebSocketRetry = 0
			WebSocketSend = function(Q)
			{
				if (1 === Client.readyState)
				{
					Client.send(WC.OTJ(Q))
					return true
				}
			}
			WebSocketSendAuth = function(Q)
			{
				if (1 === Client.readyState && Cipher)
				{
					Q = Cipher.D(WC.OTJ([WW.Key(WW.Rnd(20,40)),Q,WW.Key(WW.Rnd(20,40))]))
					Client.send('\0' + WC.B91S(Q))
					return true
				}
				WebSocketNotAuthed()
			}
			WSOnOnline.D()
			WebSocketNotConnectedNoti(false)
		}
		Client.onclose = function()
		{
			WebSocketSend = WebSocketNotConnected
			WebSocketSendAuth = WebSocketNotConnected
			Cipher = Decipher = false
			WebSocketNoti(SA('SocOff',[WW.StrDate(WebSocketSince),WebSocketRetry++]))
			Online ?
				MakeWebSocket(Online = false) :
				WW.To(Retry,MakeWebSocket)
			WSOnOffline.D()
		}
		WebSocketSince = WebSocketRetry ? WebSocketSince : WW.Now()
		First || WebSocketNoti([SA('SocConn'),WebSocketRetry ? ' ' + SA('SocRetry') + ' : ' + WebSocketRetry : ''])
	},
	WSOnProgress,
	WSOnApi = {},
	WSOnOnline = WW.BusS(),
	WSOnOffline = WW.BusS(),
	WSOnDiffHot,
	WSOnDiffHist,
	WSOnRenew,
	WSOnSize,
	WSOnTaskErr,
	WSOnErrT,
	WSOnCookie,
	WSOnSC,
	WSOnSetting,

	MultiMap = function()
	{
		var
		D = {};
		return {
			H : function(Q){return WR.Has(Q,D)},
			G : function(Q){return D[Q]},
			C : function(){D = {}},
			D : function(S,Q)
			{
				WW.SetAdd(D[S] || (D[S] = WW.Set()),Q)
				return Q
			},
			E : function(S,Q,T)
			{
				if (T = D[S])
				{
					WW.SetDel(T,Q)
					WW.Size(T) || WR.Del(S,D)
				}
			}
		}
	},

	SiteAll = [],
	SiteMap = {},
	SiteBegin,SiteCount = 0,SiteTotal,
	SiteNoti = Noti.O(),
	SiteOnLoad = WW.BusS(),
	SiteOnNoti = function()
	{
		WW.Now() - SiteBegin < 1000 ||
			SiteNoti([SA('SocSite') + ' ',SiteCount,' / ',SiteTotal,' ',(WW.Now() - SiteBegin),'ms'])
		SiteCount < SiteTotal ||
		(
			WR.Del('Site',CrabSave),
			SiteOnLoad.D(),
			SiteNoti(false)
		)
	},
	SiteSolveName = function(Q)
	{
		Q = WW.IsObj(Q) ? Q : SiteMap[Q]
		return Q ? Q.Name || Q.ID : SA('GenUnknown')
	},

	TaskBriefRetry = function(H)
	{
		return function(E)
		{
			return Online ?
				E.Map(function(E,F)
				{
					Noti.S([SA('LstBriefErr',[H,++F]),' ',ErrorS(E)])
				}).Delay(Retry).Map(function()
				{
					Noti.S(SA('LstBriefRead',[H]))
				}) :
				WX.Empty
		}
	},
	TaskBriefSolve = function(S,Q,P,H,N)
	{
		var V = [],F = 0,G;
		F = Q.indexOf('\n')
		if (!Q) return
		G = +Q.slice(0,F)
		if (G !== G) return
		P(G)
		for (G = 0;++F < Q.length;)
		{
			V[G] = Q.slice(F,~(F = Q.indexOf('\n',F)) ? F : F = Q.length)
			if (++G === S)
			{
				H(V)
				G = 0
			}
		}
		N()
	},
	TaskDiff = function(H)
	{
		var
		State,
		Queue = [];
		WSOnOffline.R(function()
		{
			State =
			Queue.length = 0
		})
		return {
			S : function(V)
			{
				State = V
				for (V = 0;V < Queue.length;V += 3)
					State < Queue[V] && H(State = Queue[V],Queue[-~V],Queue[2 + V])
				Queue.length = 0
			},
			D : function(Q)
			{
				State ?
					State < Q[1] && H(State = Q[1],Q[0],Q[2]) :
					Queue.push(Q[1],Q[0],Q[2])
			}
		}
	},
	TaskOverviewCache = {},
	TaskOverviewList = [],
	TaskOverviewRequiring = {},
	TaskOverviewLoad = function(Row)
	{
		// Optimize : Cache is disabled until we are able to track updates
		return 0 && WR.Has(Row,TaskOverviewCache) ?
			WX.Just(TaskOverviewCache[Row],WX.Sync) :
			WX.Provider(function(O)
			{
				WR.Has(Row,TaskOverviewRequiring) &&
					TaskOverviewRequiring[Row].E(SA('LstTwice',[Row]))
				if (WebSocketSend([ActionWebTaskOverview,Row]))
				{
					TaskOverviewRequiring[Row] = O
				}
				else O.E(SA('ErrOff'))
				return function()
				{
					WR.Del(Row,TaskOverviewRequiring)
				}
			})
	},
	TaskOverviewUpdate = function(Row,Q)
	{
		if (WW.IsObj(Q))
		{
			TaskOverviewList.push(Row)
			if (CacheLimit < TaskOverviewList.length)
				WR.Del(TaskOverviewList.shift(),TaskOverviewCache)
			TaskOverviewCache[Row] = Q
			if (WR.Has(Row,TaskOverviewRequiring))
				TaskOverviewRequiring[Row].D(Q).F()
		}
		else
			if (WR.Has(Row,TaskOverviewRequiring))
				TaskOverviewRequiring[Row].E(Q)
	},
	TaskRenewing = {},
	TaskFullInfoRow,
	TaskFullInfoO,
	TaskFullInfoLoad = function(Row)
	{
		return WX.Provider(function(O)
		{
			TaskFullInfoO && TaskFullInfoO.E(SA('DetCancel'))
			TaskFullInfoO = false
			if (WebSocketSendAuth([ActionAuthTaskInfo,Row]))
			{
				TaskFullInfoRow = Row
				TaskFullInfoO = O
			}
			else O.E(SA(Online ? 'ErrNoAuth' : 'ErrOff'))
		})
	},
	TaskFullInfoUpdate = function(Row,Q)
	{
		if (TaskFullInfoRow === Row && TaskFullInfoO)
		{
			if (WW.IsObj(Q))
				TaskFullInfoO.D(Q)
			else
			{
				TaskFullInfoO.E(Q)
				TaskFullInfoO = false
			}
		}
	},

	RecordErrList = [],
	WSOnErr = function(Q,S)
	{
		WW.IsArr(Q) ?
			WR.Each(function(V)
			{
				RecordErrList.push(V)
			},Q,RecordErrList.length = 0) :
			RecordErrList.push([Q,S])
	},

	OverlayOn,
	OverlayEvent = WX.EndL(),
	OverlayEnd = WX.EndL(),
	MakeOverlay = function(H)
	{
		var T = WV.Rock();
		OverlayOn = true
		WV.TI(T)
		WV.On('click',WV.StopProp,T)
		OverlayEnd(H(T))
		OverlayEvent(WV.On('click',OverlayRelease,RMain[3]))
		WV.Con(ROverlay,T)
		WV.Ap(ROverlay,RMain[4])
		T.focus()
	},
	OverlayRelease = function()
	{
		if (OverlayOn)
		{
			OverlayOn = false
			WV.Del(ROverlay)
			OverlayEvent()
			OverlayEnd()
			WV.Clr(ROverlay)
		}
	},

	MakeProgress = function(Size,Has)
	{
		Has = Has || 0
		return WW.Fmt('[`0`%] `1` / `2`',
		[
			null == Size ?
				'-' :
				Has < Size ?
					WR.ToFix(2,100 * Has / Size) :
					100,
			null == Size ?
				'-' :
				WR.ToSize(Has),
			null == Size ?
				'-' :
				WR.ToSize(Size)
		])
	},
	MakeSpeed = function(BytePerMS)
	{
		return WR.ToSize(1E3 * BytePerMS) + '/s'
	},
	MakeRemain = function(Rest,Speed)
	{
		return Rest && !Speed ?
			'-99:59:59' :
			'-' + WW.StrS(Rest / Speed / 1E3)
	},
	DetailIs = function(Row){return DetailUpdate && Row === DetailUpdate.O},
	DetailUpdate,
	MakeDetail = function(Q,S,E)
	{
		MakeOverlay(function(Y)
		{
			var
			Site = SiteMap[Q.S],
			PartMap = {},
			Header = WV.Rock(ClassHeader),
			Title = WV.Rock(),
			SiteID = WV.X(
			[
				SiteSolveName(Site),' ',
				Site.IDView ?
					Site.IDView(Q.I) :
					Q.I
			]),
			Detail = WV.Rock(),
			Part = WV.Rock(),
			ErrReq = WV.Rock(WV.FmtW + ' ' + WV.None),
			Err = WV.Rock(WV.FmtW + ' ' + WV.None),
			Line =
			[
				[SA('DetRow'),WR.Const(Q.O)],
				[SA('DetBirth'),function(S)
				{
					return null != S.Birth &&
						WW.StrDate(S.Birth)
				}],
				[SA('DetUp'),function(S)
				{
					return S.UP
				}],
				[SA('DetDate'),function(S)
				{
					return null != S.UPAt &&
						WW.StrDate(S.UPAt)
				}],
				[SA('DetPartC'),function(S)
				{
					return S.Part && S.Part.length
				}],
				[SA('DetFileC'),function(S)
				{
					return S.File
				}],
				[SA('DetRoot'),function(S)
				{
					return S.Root
				}],
				[SA('DetDone'),function(S)
				{
					return null != S.Done &&
						WW.StrDate(S.Done)
				}]
			],
			PartList = [],
			Update = function(S)
			{
				S = S || {}
				WR.Has('Title',S) &&
					WV.T(Title,S.Title)
				WR.Each(function(V,T)
				{
					if (!V[2])
					{
						V[0] = WV.Con(WV.Rock(),
						[
							MakeHigh(V[0] + ' '),
							V[2] = WV.E()
						])
					}
					T = V[1](S)
					if (null == T || false == T)
						WV.Del(V[0])
					else
					{
						WV.T(V[2],T)
						WV.Ap(V[0],Detail)
					}
				},Line)
				WR.Each(function(V)
				{
					PartMap[V.Part] = V.Title
				},S.Part)
				if (S.Down)
				{
					WV.Clr(Part)
					PartList.length = 0
					WR.EachU(function(/**@type {CrabSaveNS.Down}*/V,F)
					{
						var
						U = WV.Rock(ClassDetailPart),
						URL = WV.Rock(ClassSingle + ' ' + ClassHighLight),
						Name = WV.Rock(),
						Prog = WV.Fmt(
						[
							'','G',
							'. ' + SA('DetRun') + ' ','P',
							'. ' + SA('DetFirst') + ' ','C',
							'\n' + SA('DetTake') + ' ','T',
							'. ' + SA('DetAvg') + ' ','V',
							'\n' + SA('DetDone') + ' ','D',
						]);
						if (!PartList[V.Part])
							PartList[V.Part] = []
						if (!F || V.Part !== S.Down[~-F].Part)
						{
							WV.Ap(WV.Con(WV.Rock(),
							[
								MakeHigh(SA('DetPart') + ' '),
								WW.Fmt('`0` / `1` `2`',
								[
									V.Part,
									S.Part.length,
									PartMap[V.Part] || ''
								])
							]),Part)
						}
						WV.T(URL,V.URL)
						WV.Ti(URL,V.URL)
						WV.T(Name,V.Path)
						Prog
							.P(V.Play)
							.G(MakeProgress(V.Size,V.Has))
							.C(null == V.First ? '-' : WW.StrDate(V.First))
							.T(WW.StrMS(V.Take))
							.V(V.Take ? MakeSpeed(V.Has / V.Take) : '-')
							.D(null == V.Done ? '-' : WW.StrDate(V.Done))
						WV.ApR([URL,Name,Prog],U)
						WV.Ap(U,Part)
						PartList[V.Part][V.File] =
						{
							F : function(Size)
							{
								if (null == V.Size || V.Has < V.Size)
									Prog.G(MakeProgress(V.Size = Size,V.Has))
							},
							P : function(Play)
							{
								Prog.P(Play)
							},
							C : function(Conn)
							{
								Prog.C(WW.StrDate(Conn))
							},
							A : function(Path)
							{
								WV.T(Name,Path)
							},
							H : function(Has,T)
							{
								Prog.G(MakeProgress(V.Size,V.Has = Has[0]))
								T = V.Take + Has[1]
								Prog.T(WW.StrMS(T))
									.V(MakeSpeed(V.Has / (T || 1)))
							},
							T : function(Take)
							{
								Prog.T(WW.StrMS(V.Take = Take))
									.V(MakeSpeed(V.Has / (Take || 1)))
							},
							D : function(Done)
							{
								Prog.D(WW.StrDate(Done))
							}
						}
					},S.Down)
				}
			},
			OnError = function(E)
			{
				WW.IsArr(E) && (E = SA(E))
				WV.T(Err,null == E ? '' : ErrorS(E))
				;(null == E ? WV.ClsA : WV.ClsR)(Err,WV.None)
			};
			WV.ApA([Title,SiteID],Header)
			Update(S)
			WV.ApA([Header,Detail,ErrReq,Err,Part],Y)
			WV.ClsA(Y,ClassDetail)
			E && OnError(E)
			DetailUpdate =
			{
				O : Q.O,
				S : Update,
				E : OnError,
				U : function(H,Part,File,Val)
				{
					PartList[Part] && PartList[Part][File] &&
						PartList[Part][File][H](Val)
				}
			}
			return WX.EndI(
			[
				TaskFullInfoLoad(Q.O).Now(Update,function(E)
				{
					WV.T(ErrReq,SA('LstFail') + '\n' + ErrorS(E))
					WV.ClsR(ErrReq,WV.None)
				}),
				function()
				{
					WebSocketSendAuth([ActionAuthTaskInfo,false])
				}
			])
		})
	},



	OverallUpdate = function()
	{
		var
		Active = 0,
		Speed = 0;
		WR.Each(function(V)
		{
			++Active
			Speed += V[1]
		},ProgressMap)
		WV.T(RSpeed,'[' + Active + '] ' + MakeSpeed(Speed))
	};

	LangTo(Top.LangS)

	WV.ClsA(RMain[1],WV.NoSel)
	WV.Text(RMain[1],SA('Title'))
	WV.Ap(WV.Rock(ClassTitleSplit),RMain[2])
	WV.Ap(WV.Rock(WV.ST),RMain[3])
	WV.Ap(WV.Rock(WV.SB),RMain[3])
	WV.Ap(WV.Rock(WV.ST),RMain[4])
	WV.Ap(WV.Rock(WV.SB),RMain[4])
	WV.Ap(RMain[0],Rainbow[1])
	WV.Ap(RStatus,WV.VM(RStatusBar[1]))
	WV.Ap(RSpeed,WV.VM(RStatusBar[2]))
	WV.Ap(RStatusBar[0],Rainbow[2])

	WV.Style(WW.Fmt
	(
		'body{height:100%;font-size:14px;overflow:hidden}' +
		'.`N` .`B`{padding-top:0;padding-bottom:0}' +

		'#`M`{position:relative;overflow:hidden}' +
		'#`T`{min-width:110px;text-align:center;line-height:`e`px;font-weight:bold}' +
		'#`C`{position:relative}' +
		'#`O` .`W`{padding:`q`px 0}' +
		'#`O` .`A`{display:inline-block;margin:`q`px 0;width:100%}' +
		'.`S`{position:absolute;left:-2px;top:10%;width:2px;height:80%;background:#BBB}' +
		'.`U`{float:right}' +
		'.`G`{margin:`p`px 0}' +
		'.`P`{padding:`p`px}' +
		'.`H`{color:#2672EC}' +
		'.`F`>.`H`{color:inherit}' +
		'.`I`{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +

		'.`K`{line-height:1.4}' +
		'.`K` .`I`.`L`{margin:`h`px 0 0 `h`px}' +
		'.`K` .`I`{margin:0 0 `h`px `h`px}' +
		'.`K` .`B`{padding:`q`px}' +

		'.`Y`' +
		'{' +
			'position:absolute;' +
			'left:0;right:0;top:0;bottom:0;' +
			'padding:`p`px;' +
			'background:rgba(0,0,0,.45);' +
			'word-wrap:break-word' +
		'}' +
		'.`Y`>div{width:100%;height:100%;background:#F7F7F7;overflow:auto}' +
		'.`Y`>div>div{padding:`h`px `p`px}' +

		'.`R`{background:#F3EBFA}' +

		'.`E` .`H`{margin-right:`h`px}' +
		'.`ET`{padding-left:`p`px}' +

		'#`V`,#`X`{padding:`h`px;line-height:1}' +
		'#`X`{text-align:center;white-space:nowrap}' +
		'',
		{
			F : WV.Foc,
			L : WV.Alt,
			N : WV.NotiW,
			D : WV.DivC,
			W : WV.TabT,
			A : WV.TabB,
			B : WV.ButW,

			M : WV.ID(RMain[0]),
			T : WV.ID(RMain[1]),
			C : WV.ID(RMain[2]),
			O : WV.ID(RMain[3]),
			S : ClassTitleSplit,
			U : ClassCount,
			G : ClassMargin,
			P : ClassPadding,
			H : ClassHighLight,
			I : ClassSingle,
			K : ClassTask,
			Y : ClassOverlay,
			R : ClassHeader,
			E : ClassDetail,
			ET : ClassDetailPart,
			V : WV.ID(RStatusBar[1]),
			X : WV.ID(RStatusBar[2]),

			p : Padding,
			h : PaddingHalf,
			q : PaddingQuarter,
			e : SizeHeader
		}
	))

	RTab.Add(
	[
		[SA('Bro'),function(V,_,K)
		{
			var
			ClassBrief = WW.Key(),
			ClassList = WW.Key(),
			ClassCard = WW.Key(),
			ClassCardClick = WW.Key(),
			ClassCardBar = WW.Key(),

			GoKeyWord,
			GoSite,GoAction,GoID,
			GoPref,GoPrefAction,
			Go = function()
			{
				var
				Q = Keyword.V(),
				S = GoSolve(Q);
				if (WW.IsArr(S))
				{
					Jump(0,S[0],S[1],S[2],Q)
					Keyword.Foc()
				}
				else Noti.S(S)
			},
			GoSolve = function(Q)
			{
				var Site,Action,ID,T;
				if (T = Q.match(/^\s*([A-Z\u2E80-\u9FFF\uAC00-\uD7FF\uF900-\uFAFF]+)(?:\s+([^]*))?$/i))
				{
					if (!WR.Has(Site = WR.Up(T[1]),SiteMap)) return SA('BroUnSite',[T[1]])
					Site = SiteMap[Site]
					T = T[2] || ''
				}
				else
				{
					T = Q
					Site = WR.Find(function(V){return V.Judge.test(Q)},SiteAll)
					if (!Site) return SA('BroUnParse',[Q])
				}
				Action = WR.Find(function(V)
				{
					return WR.Any(function(B)
					{
						B = B.exec(T)
						ID = B && (2 in B ? B.slice(1).join('#') : B[1 in B ? 1 : 0])
						return B
					},V.Judge)
				},Site.Map)
				return Action ?
					[Site,Action,WR.Trim(ID),Q.slice(0,-ID.length)] :
					SA('BroUnSol',[T,SiteSolveName(Site)])
			},

			Bar = [],
			BarMap = MultiMap(),
			BarNone = 0,
			BarCold = 1,
			BarHot = 2,
			BarHistory = 3,
			MakeBar = function(Site,Q,V)
			{
				var
				ID = IDCombine(Site,Q.ID),
				B = WV.Rock(ClassCardBar),
				State,
				Reload = function()
				{
					var
					Next = IsHot(ID) ? BarHot :
						IsCold(ID) ? BarCold :
						IsHistory(ID) ? BarHistory :
						BarNone;
					if (Next !== State)
					{
						WV.ClsR(V,WV.Foc)
						WV.ClsR(V,WV.Alt)
						State = Next
						if (BarNone === State)
						{
							WV.T(B,SA('BroAdd'))
						}
						else if (BarCold === State)
						{
							WV.T(B,SA('BroCold'))
							WV.ClsA(V,WV.Foc)
						}
						else if (BarHot === State)
						{
							WV.T(B,SA('BroHot'))
							WV.ClsA(V,WV.Foc)
						}
						else if (BarHistory === State)
						{
							WV.T(B,SA('BroHist'))
							WV.ClsA(V,WV.Alt)
						}
					}
				},
				Add = function()
				{
					ColdAdd(ID,Site,Q)
				},
				Del = function()
				{
					ColdDel(ID)
				};
				WV.Pre(B,V)
				WV.On('click',function()
				{
					if (BarNone === State || BarHistory === State)
						Add()
					else if (BarCold === State)
						Del()
				},V)
				Reload()
				Bar.push(BarMap.D(ID,
				{
					R : Reload,
					A : function()
					{
						BarNone === State && Add()
					},
					D : function()
					{
						BarCold === State && Del()
					}
				}))
			},

			JumpEnd = WX.EndL(),
			Jump = function(Q,Site,Action,ID,Key)
			{
				var N = WW.Now();
				if (!Key)
				{
					Site = GoSite
					Action = GoAction
					ID = GoID
					Key = GoKeyWord
				}
				if (Action)
				{
					if (!BriefKeywordOn) BriefKeywordOn = WV.Con(Brief,BriefKeyword.R)
					BriefKeyword.K(Key)
						.S(SiteSolveName(Site))
						.A(Action.Name)
						.I(ID)
						.U(SA('GenLoading'))
					JumpEnd(Action.View(ID,Q,Action === GoPrefAction ? GoPref : undefined).Now(function(/**@type {CrabSaveNS.SitePage}*/S)
					{
						WV.Clear(List)
						Bar.length = 0
						BarMap.C()
						S.Size = S.Size || PageSize
						WR.EachU(function(V,F)
						{
							var
							IDView = V.View || (V.Non ? V.ID : Site.IDView(V.ID)),
							URL = V.URL || false !== V.URL && Site.IDURL && Site.IDURL(V.ID),
							Click = WV.Rock(ClassCardClick),
							Img;
							WV.Ap(WV.Con(WV.Rock(ClassCard + ' ' + WV.S4,'fieldset'),
							[
								WV.Con(WV.A('legend'),
								[
									V.Index = WR.Default(S.Size * Q + F,V.Index),
									' | ',
									URL ? WV.Ah(IDView,URL,V.Title) : IDView
								]),
								WV.Con(Click,
								[
									V.Img && WV.Attr
									(
										Img = WV.A('img'),
										'src',
										Setting.ProxyView ?
											URLApi + '~' + SolveURL(V.Img)
												.replace(/\/\/+/g,WC.UE) :
											SolveURL(V.Img)
									)
								]),
								WW.IsNum(V.Len) ?
									WV.X(WW.StrS(V.Len)) :
									WW.IsStr(V.Len) &&
										WV.X(/^\d+(:\d+){1,2}$/.test(V.Len) ?
											WW.StrS(WR.Reduce(function(D,V){return 60 * D - -V},0,V.Len.split(':'))) :
											V.Len),
								V.TitleView ?
									WV.Con(WV.Rock(WV.FmtW),V.TitleView) :
									!!V.Title && WV.T(WV.Rock(WV.FmtW),V.Title),
								WV.X(V.UPURL ?
									WV.Ah(V.UP,V.UPURL) :
									V.UP),
								!!V.Date && WV.X(WW.IsStr(V.Date) ? V.Date : DTS(V.Date)),
								!!V.Desc && WV.But(
								{
									X : SA('BroDesc'),
									The : WV.TheP,
									C : function()
									{
										MakeOverlay(function(Y)
										{
											WV.Con(Y,
											[
												WV.T(WV.Rock(ClassHeader),SiteSolveName(Site) + ' ' + IDView),
												WV.T(WV.Rock(WV.FmtW),V.Desc)
											])
										})
									}
								}).R,
								!!V.More && WV.Con(WV.Rock(WV.FmtW),V.More)
							]),List)
							V.Non || MakeBar(Site,V,Click)
							V.Non && Img && URL && WV.On('click',function()
							{
								Keyword.V(URL)
								Go()
							},Img)
						},S.Item)
						BriefKeyword.U(WW.Fmt
						(
							'`F`~`T`. `I` `L`/`U`. `G` `A`/`P`. `M`s',
							{
								F : S.Item.length && S.Item[0].Index,
								T : S.Item.length && WR.Last(S.Item).Index,
								I : SA('BroItem'),
								L : S.Item.length,
								U : S.Len = WR.Default(S.Item.length,S.Len),
								G : SA('BroPage'),
								A : S.At = WR.Default(Q,S.At),
								P : S.Max = WR.Default(Math.ceil(S.Len / (S.Size || PageSize)) || 1,S.Max),
								M : WR.ToFix(3,(WW.Now() - N) / 1E3)
							}
						))
						PagerT.At(S.At,S.Max)
						PagerB.At(S.At,S.Max)
						GoSite = Site
						GoAction = Action
						GoID = ID
						GoKeyWord = Key
						if (S.Pref)
						{
							if (GoPrefAction !== Action)
							{
								GoPrefAction = Action
								N = S.Pref(function()
								{
									Jump(PagerT.At())
								})
								WV.Con(Pref,N.R)
								GoPref = N.O
							}
						}
						else
						{
							GoPrefAction = null
							GoPref = null
							WV.Clear(Pref)
						}
					},function(E)
					{
						BriefKeyword.U(ErrorS(E))
					}))
				}
				return false
			},

			KeywordCache = WW.Key(),
			KeywordHintLoad = WV.Fmt(SA('BroSugLoad',['`K`']) + '\n`E`'),
			KeywordHint = WV.Fmt(SA('BroSugDone',['`K`']) + '\n[`M`ms `T`] `D`'),
			HintErr,HintCurrent,
			Hint = function(S)
			{
				var K,B,C;
				HintErr = false
				if (WW.IsArr(S = GoSolve(S)) && S[1].Hint)
				{
					C = HintCurrent = WW.Key()
					K = SiteSolveName(S[0]) + ' ' + S[1].Name + ' ' + S[2]
					B = WW.Now()
					KeywordHintLoad.K(K).E('')
					Keyword.Hint(undefined,KeywordHintLoad.R)
						.Drop()
					;(S[1][KeywordCache] || (S[1][KeywordCache] = WX.CacheM(S[1].Hint)))
						(S[2])
						.Now(function(V)
						{
							if (HintCurrent === C)
							{
								KeywordHint.K(K).T(V.Item.length)
									.M(WW.Now() - B)
									.D(V.Desc || '')
								Keyword.Hint(undefined,KeywordHint.R)
									.Drop(WR.Map(function(V)
									{
										return WW.IsArr(V) ?
											[S[3] + V[0],V[1],0] :
											[S[3] + V,V,0]
									},V.Item),false)
							}
						},function(E)
						{
							if (HintCurrent === C)
							{
								HintErr = true
								KeywordHintLoad.E(ErrorS(E))
							}
						})
				}
				else
				{
					HintCurrent = false
					Keyword.Hint(undefined,null)
						.Drop()
				}
			},
			Keyword = WV.Inp(
			{
				Hint : SA('BroKeyword'),
				Right : WV.But({X : '\u2192',The : WV.TheP,U : WV.StopProp,C : Go}).R,
				Any : true,
				Non : true,
				Ent : Go,
				EntD : Go,
				Inp : Hint,
				Foc : function()
				{
					HintErr && Hint(Keyword.V())
				}
			}),
			Brief = WV.Rock(ClassBrief + ' ' + ClassMargin),
			BriefKeywordOn,
			BriefKeyword = WV.Fmt
			(
				'`|K|`\n' +
				'|S| |A| |I|\n' +
				'|U|',
				null,null,'|'
			),
			Pref = WV.Rock(),
			List = WV.Rock(ClassList + ' ' + ClassMargin),
			PagerT = WV.Page({Inp : Jump}),
			PagerB = WV.Page({Inp : Jump});

			WV.On('click',function(E,T)
			{
				if (T = WV.Attr(E.target,'href'))
				{
					WV.PrevDef(E)
					Keyword.V(T)
					Go()
				}
			},List)

			WV.ApR([Keyword,Brief,PagerT,Pref,List,PagerB],WV.ClsA(V,ClassPadding))

			ShortCut.On(ShortCutGeneralFocus,function()
			{
				OverlayRelease()
				RTab.At(K)
				Keyword.I.select()
				Keyword.Foc(true)
			})
			ShortCutOnPage(K,ShortCutBrowseSelAll,function()
			{
				WR.Each(function(V){V.A()},Bar)
			})
			ShortCutOnPage(K,ShortCutBrowseSelClear,function()
			{
				WR.Each(function(V){V.D()},Bar)
			})
			ShortCutOnPage(K,ShortCutBrowseHead,PagerT.Head)
			ShortCutOnPage(K,ShortCutBrowsePrev,PagerT.Prev)
			ShortCutOnPage(K,ShortCutBrowseNext,PagerT.Next)
			ShortCutOnPage(K,ShortCutBrowseLast,PagerT.Last)

			BrowserUpdate = function(Q)
			{
				Q ?
					WR.Each(function(V)
					{
						BarMap.H(V) &&
							WR.Each(function(B){B.R()},BarMap.G(V))
					},Q) :
					WR.Each(function(B){B.R()},Bar)
			}
			BrowserOnProgress = function(Q)
			{
				BriefKeyword.U(SA('GenLoading') + ' ' + Q)
			}

			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`>.`I`{line-height:34px;font-weight:bold}' +
						'#`R`>.`I` .`D`{line-height:normal}' +
						'#`R`>.`I` input{padding-left:6px}' +
						'#`R`>.`I` .`B`{padding:0;min-width:60px}' +
						'.`E`{padding:`h`px;`e`}' +
						'.`L`{margin-left:-`l`px;margin-right:-`l`px;text-align:center}' +
						'.`C`' +
						'{' +
							'display:inline-block;' +
							'margin:`l`px;' +
							'padding:`h`px;' +
							'width:`c`px;' +
							'text-align:left;' +
							'text-align:start;' +
							'word-break:break-all' +
						'}' +
						'.`C` legend{font-weight:bold}' +
						'.`K`{cursor:pointer}' +
						'.`S`{color:#F7F7F7;font-weight:bold;text-align:center}' +
						'.`K`:hover .`S`,.`K`.`A` .`S`{background:rgba(102,175,224,.7)}' +
						'.`K`.`O` .`S`{background:#66AFE0}' +
						'.`C` img{width:100%;max-height:`m`px}' +
						'.`C` .`B`{padding:0;min-width:0}',
						{
							R : ID,
							I : WV.InpW,
							D : WV.InpD,
							B : WV.ButW,
							A : WV.Alt,
							O : WV.Foc,

							p : Padding,
							h : PaddingHalf,
							l : PaddingHalf / 2,

							E : ClassBrief,
							e : WV.Exp('box-shadow','inset 0 0 3px 2px rgba(0,0,0,.2)'),
							L : ClassList,
							C : ClassCard,
							K : ClassCardClick,
							S : ClassCardBar,
							c : SizeCardWidth,
							m : 2 * SizeCardWidth
						}
					)
				}
			}
		}],
		[[SA('Col'),ColdCount.R],function(V,_,K)
		{
			var
			Cold = [],
			ColdMap = {},
			List = WV.List(
			{
				Data : Cold,
				Pan : V,
				Sel : true,
				Make : function(V,S)
				{
					var
					R = WV.Div(2,['',TaskButtonSize]),
					ID = MakeSingle(),
					Title = MakeSingle(),
					Commit = WV.But(
					{
						X : SA('ColCommit'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && WebSocketSendAuth([ActionAuthTaskNew,S])
						}
					}),
					Remove = WV.But(
					{
						X : SA('LstRemove'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && ColdDel(S[0].O)
						}
					});
					WV.ClsA(ID,WV.Alt)
					WV.ApA([ID,Title],R[1])
					WV.On('click',WV.StopProp,Commit.R)
					WV.On('click',WV.StopProp,Remove.R)
					WV.ApR([Commit,Remove],R[2])
					WV.Ap(R[0],V)
					WV.ClsA(V,ClassTask)
					return {
						U : function(V)
						{
							SingleFill(ID,V.I,V.S)
							SingleFill(Title,V.T,V.U)
						}
					}
				}
			});

			ShortCutOnPage(K,ShortCutListSelAll,List.SelAll)
			ShortCutOnPage(K,ShortCutListSelClear,List.SelClr)
			ShortCutOnPage(K,ShortCutColdCommit,function()
			{
				WebSocketSendAuthPrecheck() && WebSocketSendAuth(
				[
					ActionAuthTaskNew,
					WR.Map(function(V)
					{
						return Cold[V]
					},List.SelL())
				])
			})
			ShortCutOnPage(K,ShortCutColdCommitAll,function()
			{
				if (Cold.length && WebSocketSendAuthPrecheck())
				{
					WebSocketSendAuth([ActionAuthTaskNew,Cold])
					RTab.Next()
				}
			})

			IsCold = function(ID){return WR.Has(ID,ColdMap)}
			ColdAdd = function(ID,Site,/**@type {CrabSaveNS.SiteItem}*/Q)
			{
				if (!IsCold(ID) && !IsHot(ID))
				{
					List.Push(ColdMap[ID] =
					{
						O : ID,
						S : Site.ID,
						I : Q.ID,
						T : Q.Title,
						U : Q.UP
					})
					BrowserUpdate([ID])
					ColdCount.D(Cold)
				}
			}
			ColdDel = function(ID,T)
			{
				if (IsCold(ID))
				{
					T = Cold.indexOf(ColdMap[ID])
					WR.Del(ID,ColdMap)
					~T && List.Splice(T,1)
					BrowserUpdate([ID])
					ColdCount.D(Cold)
				}
			}
			return {
				Show : List.In,
				HideP : List.Out
			}
		}],
		[[SA('Hot'),HotCount.R],function(V,_,K)
		{
			var
			ClassStatus = WW.Key(),
			ClassBar = WW.Key(),

			Hot = [],
			HotMap = MultiMap(),
			HotRowMap = {},
			HotVersion = '',
			HotRead = WX.EndL(),
			HotShown = {},
			TaskErr = {},
			List = WV.List(
			{
				Data : Hot,
				Pan : V,
				Sel : true,
				Make : function(V,S)
				{
					var
					Row,
					Task,
					R = WV.Div(2,['',TaskButtonSize]),
					Title = MakeSingle(),
					Status = MakeSingle(ClassStatus),
					PlayCurrent = 9,
					Play = WV.But(
					{
						The : WV.TheP,
						C : function()
						{
							S[0] && WebSocketSendAuth(
							[
								PlayCurrent ? ActionAuthTaskPause : ActionAuthTaskPlay,
								[S[0].O]
							])
						}
					}),
					OnState = function(V)
					{
						WV.WC(Bar) // Force to reset transition state
						if (PlayCurrent = V)
						{
							Play.X(SA('HotPause'))
							WV.ClsA(Bar,WV.Foc)
						}
						else
						{
							HasError = false
							Play.X(SA('HotPlay'))
							WV.ClsR(Bar,WV.Foc)
						}
					},
					Running = WV.Fmt('[`F`] `P` ',null,WV.A('span')),
					Renew = WV.E(),
					More = WV.But(
					{
						X : SA('LstDetail'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && MakeDetail(S[0],Task,TaskErr[S[0].O])
						}
					}),
					Remove = WV.But(
					{
						X : SA('LstRemove'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && WebSocketSendAuth(
							[
								ActionAuthTaskRemove,
								[S[0].O]
							])
						}
					}),
					Bar = WV.Rock(ClassBar),
					LoadO = WX.EndL(),
					HasError,ErrorToRenew,ErrorAt,
					LoadErr,RenewLast,
					OnTick = function(T)
					{
						if (S[0] && !WR.Has(S[0].O,ProgressMap))
						{
							T = null == Task ? SA('LstLoad') :
								null != LoadErr ? LoadErr :
								TaskRenewing[S[0].O] ? SA(null == Task.Size ? 'HotSolve' : 'HotRenew') :
								HasError && WW.Now() <= 1E3 * Setting.Delay + ErrorAt ? SA('Err') + ' ' + RemainS(1E3 * Setting.Delay + ErrorAt - WW.Now()) :
								HasError && ErrorToRenew ? SA('HotReady') :
								null == Task.Size ? SA('HotReady') :
								Task.State ? SA('HotQueue') :
								SA('HotPaused')
							T === RenewLast || WV.T(Renew,RenewLast = T)
						}
					},
					OnSizeHas = function(Size,Has)
					{
						Running.P(MakeProgress(Size,Has))
						WV.CSS(Bar,'width',100 * Has / Size + '%')
					},
					OnProgress = function(Q)
					{
						OnSizeHas(Task.Size,Task.Has = Q[0])
						WV.T(Renew,RenewLast = MakeSpeed(Q[1]) +
							' ' + MakeRemain(Task.Size - Q[0],Q[1]))
					};
					WV.ClsA(Title,WV.Alt)
					WV.On('click',WV.StopProp,Play.R)
					WV.Con(Status,[Play.R,Running.R,Renew])
					WV.ApR([Title,Status],R[1])
					WV.On('click',WV.StopProp,More.R)
					WV.On('click',WV.StopProp,Remove.R)
					WV.ApR([More,Remove],WV.VM(R[2]))
					WV.ApR([R[0],Bar],V)
					WV.ClsA(V,ClassTask)
					return {
						U : function(V)
						{
							Task = null
							LoadErr = null
							HasError = false
							Play.X('').Off()
							SingleFill(Title,'#' + V.O + ' ' + V.S + ' ' + V.I)
							WV.ClsA(Running.R,WV.None)
							OnTick()
							OnState(false)
							WV.CSS(Bar,'width',0)
							LoadO(TaskOverviewLoad(V.O).Now(function(B)
							{
								Task = B
								SingleFill(Title,B.Title)
								null == B.Size || WV.ClsR(Running.R,WV.None)
								if (B.Error)
								{
									HasError = true
									ErrorToRenew = 2 === B.State
									ErrorAt = B.Error
								}
								OnTick()
								if (null != B.Size)
								{
									Running.F(B.File)
									OnSizeHas(B.Size,B.Has)
								}
								WR.Has(V.O,ProgressMap) && OnProgress(ProgressMap[V.O])
								Play.On()
								OnState(B.State)
							},function(E)
							{
								LoadErr = SA('LstFail') + ' ' + ErrorS(E)
								OnTick()
							}))
							if (Row)
							{
								WR.Del(Row,HotShown)
								Row = false
							}
							HotShown[Row = V.O] =
							{
								S : function(Q)
								{
									return undefined === Q ?
										PlayCurrent :
									(
										OnState(Task.State = Q),
										WR.Del(V.O,ProgressMap),
										OverallUpdate(),
										OnTick()
									)
								},
								W : OnTick,
								P : OnProgress,
								E : function(Q)
								{
									if (Q)
									{
										HasError = true
										ErrorToRenew = 2 === Q[0]
										ErrorAt = Q[1]
									}
									else HasError = false
									OnTick()
								},
								Z : function(Q)
								{
									WV.ClsR(Running.R,WV.None)
									Running.F(Task.File = Q[1])
									OnSizeHas(Task.Size = Q[0],Task.Has)
									OnTick()
								}
							}
						},
						E : function()
						{
							LoadO()
							if (Row)
							{
								WR.Del(Row,HotShown)
								Row = false
							}
						}
					}
				}
			});

			ShortCutOnPage(K,ShortCutListSelAll,List.SelAll)
			ShortCutOnPage(K,ShortCutListSelClear,List.SelClr)

			IsHot = HotMap.H
			WSOnDiffHot = TaskDiff(function(H,Q,S)
			{
				var T;
				HotVersion = H
				switch (Q)
				{
					case ActionWebTaskNew :
						if (!WR.Has(S.Row,HotRowMap))
						{
							List.Push(HotRowMap[S.Row] = HotMap.D(T = IDCombine(S.Site,S.ID),
							{
								O : S.Row,
								S : S.Site,
								I : S.ID,
								Z : S.Size
							}))
							ColdDel(T)
							HotCount.D(Hot)
							BrowserUpdate([T])
						}
						break
					case ActionWebTaskPlay :
						WR.Has(S,HotShown) &&
							HotShown[S].S(true)
						break
					case ActionWebTaskPause :
						WR.Has(S,HotShown) &&
							HotShown[S].S(false)
						break
					case ActionWebTaskHist :
						if (WR.Has(S[0],HotRowMap))
						{
							T = WW.BSL(Hot,S[0],function(Q,S){return Q.O < S})
							Hot[T] && Hot[T].O === S[0] &&
								List.Splice(T,1)
							T = HotRowMap[S[0]]
							WR.Del(S[0],HotRowMap)
							HotMap.E(IDCombine(T.S,T.I),T)
							T.E = S[1]
							HotCount.D(Hot)
							WSOnDiffHist.D([Q,H,T])
						}
						break
					case ActionWebTaskRemove :
						if (WR.Has(S,HotRowMap))
						{
							T = WW.BSL(Hot,S,function(Q,S){return Q.O < S})
							Hot[T] && Hot[T].O === S &&
								List.Splice(T,1)
							T = HotRowMap[S]
							WR.Del(S,HotRowMap)
							HotMap.E(IDCombine(T.S,T.I),T)
							BrowserUpdate([IDCombine(T.S,T.I)])
						}
						break
				}
			})

			WSOnOnline.R(function()
			{
				HotRead(WB.ReqB('Hot' + (HotVersion ? '?' + HotVersion : ''))
					.RetryWhen(TaskBriefRetry(SA('Hot')))
					.Now(function(B)
					{
						TaskBriefSolve(4,B,function(V)
						{
							Hot.length = 0
							HotMap.C()
							HotRowMap = {}
							HotVersion = V
						},function(V)
						{
							V[0] = NumberZip.P(V[0])
							Hot.push(HotRowMap[V[0]] = HotMap.D(IDCombine(V[1],V[2]),
							{
								O : V[0],
								S : V[1],
								I : V[2],
								Z : V[3] ? NumberZip.P(V[3]) : null
							}))
						},function()
						{
							HotCount.D(Hot)
							WSOnDiffHot.S(HotVersion)
							BrowserUpdate()
						})
						List.Re()
					},WW.O,WW.O))
			})

			WSOnProgress = function()
			{
				WR.EachU(function(V,F)
				{
					WR.Has(F,HotShown) &&
						HotShown[F].P(V)
				},ProgressMap)
				OverallUpdate()
			}
			WSOnRenew = function(Row,Q)
			{
				if (Q)
				{
					WR.Each(function(Row)
					{
						TaskRenewing[Row] = 9
						WR.Del(Row,TaskErr)
						WR.Has(Row,HotShown) &&
							HotShown[Row].W()
					},WW.IsArr(Row) ? Row : [Row])
				}
				else
				{
					WR.Del(Row,TaskRenewing)
					WR.Has(Row,HotShown) &&
						HotShown[Row].W()
				}
			}
			WSOnSize = function(Row,Q)
			{
				WR.Has(Row,HotShown) &&
					HotShown[Row].Z(Q)
			}
			WSOnErrT = function(Q,S)
			{
				if (WW.IsObj(Q))
				{
					TaskErr = Q
					DetailUpdate && WR.Has(DetailUpdate.O,Q) &&
						DetailUpdate.E(Q[DetailUpdate.O])
				}
				else
				{
					S ? TaskErr[Q] = S : WR.Del(Q,TaskErr)
					DetailIs(Q) && DetailUpdate.E(S)
				}
			}
			WSOnTaskErr = function(Row,Q)
			{
				WR.Has(Row,HotShown) &&
					HotShown[Row].E(Q)
			}

			Tick(function()
			{
				WR.Each(function(V){V.W()},HotShown)
			})

			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R` .`L` .`B`{margin-right:`q`px;padding:0;min-width:0}' +
						'.`P`{position:absolute;left:0;bottom:0;width:0;height:3px;background:#979797}' +
						'.`P`.`O`{background:#69A0D7;`t`}' +
						'@media(max-width:600px)' +
						'{' +
							'.`S`{line-height:1.4em;height:2.8em;white-space:normal}' +
						'}',
						{
							R : ID,
							B : WV.ButW,
							L : ClassSingle,
							S : ClassStatus,
							P : ClassBar,
							O : WV.Foc,

							t : WV.Exp('transition','.2s linear'),

							q : PaddingQuarter
						}
					)
				},
				Show : List.In,
				HideP : List.Out
			}
		}],
		[SA('His'),function(V,_,K)
		{
			var
			History = [],
			HistoryMap = MultiMap(),
			HistoryRowMap = {},
			HistoryVersion = '',
			HistoryRead = WX.EndL(),
			List = WV.List(
			{
				Data : History,
				Pan : V,
				Sel : true,
				Make : function(V,S)
				{
					var
					Task,
					R = WV.Div(2,['',TaskButtonSize]),
					Title = MakeSingle(),
					Status = MakeSingle(),
					Done = WV.E(),
					Pending = WV.A('span'),
					Size = WV.Fmt('[`F`] `S`',null,WV.A('span')),
					More = WV.But(
					{
						X : SA('LstDetail'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && MakeDetail(S[0],Task)
						}
					}),
					Remove = WV.But(
					{
						X : SA('LstRemove'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && WebSocketSendAuth(
							[
								ActionAuthTaskRemove,
								[S[0].O]
							])
						}
					}),
					LoadO = WX.EndL();
					WV.ClsA(Title,WV.Alt)
					WV.Con(Status,[Done,Pending])
					WV.ApR([Title,Status],R[1])
					WV.On('click',WV.StopProp,More.R)
					WV.On('click',WV.StopProp,Remove.R)
					WV.ApR([More,Remove],R[2])
					WV.Ap(R[0],V)
					WV.ClsA(V,ClassTask)
					return {
						U : function(V)
						{
							Task = null
							SingleFill(Title,'#' + V.O + ' ' + V.S + ' ' + V.I)
							WV.T(Done,WW.StrDate(V.E) + ' ')
							WV.T(Pending,SA('LstLoad'))
							LoadO(TaskOverviewLoad(V.O).Now(function(B)
							{
								Task = B
								SingleFill(Title,B.Title)
								WV.Con(Pending,Size.R)
								Size
									.F(B.File)
									.S(WR.ToSize(B.Size))
							},function(E)
							{
								SingleFill(Pending,SA('LstFail') + ' ' + ErrorS(E))
							}))
						}
					}
				}
			});

			ShortCutOnPage(K,ShortCutListSelAll,List.SelAll)
			ShortCutOnPage(K,ShortCutListSelClear,List.SelClr)

			IsHistory = HistoryMap.H
			WSOnDiffHist = TaskDiff(function(H,Q,S)
			{
				var T;
				HistoryVersion = H
				switch (Q)
				{
					case ActionWebTaskHist :
						if (!WR.Has(S.O,HistoryRowMap))
						{
							List.Unshift(HistoryRowMap[S.O] = HistoryMap.D(T = IDCombine(S.S,S.I),S))
							BrowserUpdate([T])
						}
						break
					case ActionWebTaskRemove :
						if (WR.Has(S,HistoryRowMap))
						{
							H = HistoryRowMap[S]
							T = WW.BSL(History,S.Done,function(Q,S){return Q.E > S})
							History[T] && History[T].O === S &&
								List.Splice(T,1)
							WR.Del(S,HistoryRowMap)
							HistoryMap.E(T = IDCombine(H,S,H.I),H)
							BrowserUpdate([T])
						}
						break
				}
			})

			WSOnOnline.R(function()
			{
				HistoryRead(WB.ReqB('Hist' + (HistoryVersion ? '?' + HistoryVersion : ''))
					.RetryWhen(TaskBriefRetry(SA('His')))
					.Now(function(B)
					{
						TaskBriefSolve(5,B,function(V)
						{
							History.length = 0
							HistoryMap.C()
							HistoryRowMap = {}
							HistoryVersion = V
						},function(V)
						{
							V[0] = NumberZip.P(V[0])
							History.push(HistoryRowMap[V[0]] = HistoryMap.D(IDCombine(V[1],V[2]),
							{
								O : V[0],
								S : V[1],
								I : V[2],
								Z : NumberZip.P(V[3]),
								E : NumberZip.P(V[4])
							}))
						},function()
						{
							WSOnDiffHist.S(HistoryVersion)
							BrowserUpdate()
						})
						List.Re()
					}))
			})

			return {
				Show : List.In,
				HideP : List.Out
			}
		}],
		[SA('Cmp'),function()
		{

		}],
		[SA('Aut'),function(V,_,TabKey)
		{
			var
			RToken = WV.Rock(WV.S6),
			Token = WV.Inp(
			{
				Hint : SA('AutToken'),
				Pass : true,
				Ent : function(T)
				{
					if (!Online) WebSocketNotConnected()
					else if (Cipher) Noti.S(SA('AutAlready'))
					else
					{
						T = TokenStepB(TokenStepA(Token.V()))
						Cipher = WC.AESES(T,T,WC.CFB)
						Decipher = WC.AESDS(T,T,WC.CFB)
						Token.V('').Fresh().Foc()
						WebSocketSendAuth([ActionAuthHello])
						NotiAuth(SA('AutAuthing'))
					}
				}
			}),
			TokenNew = WV.Inp(
			{
				Hint : SA('AutNew'),
				Pass : true,
				Ent : function()
				{
					if (WebSocketSendAuth([ActionAuthToken,WC.B91S(TokenStepA(Token.V())),WC.B91S(TokenStepA(TokenNew.V()))]))
					{
						Token.V('').Fresh()
						TokenNew.V('').Fresh().Foc()
						NotiNewToken(SA('AutSaving'))
					}
				}
			}),
			Site = WV.Inp(
			{
				Hint : '<' + SA('AutSite') + '>',
				Stat : true,
				Inp : function(V)
				{
					Site.Stat(SiteMap[V] && WW.IsArr(SiteMap[V].Min) ? SiteMap[V].Min.join(', ') : '')
					CookieMin.On()
					Cookie.On()
						.V(CookieMap[V] || '')
						.Fresh()
					CookieSave.On()
				},
				NoRel : InpNoRel
			}).Off(),
			CookieMin = WV.Cho(
			{
				Mul : true,
				Blk : true,
				Set : [['Y',SA('AutMin')]]
			}).V(['Y']).Off(),
			Cookie = WV.Inp(
			{
				Hint : SA('AutCoke'),
				Row : 8,
				The : WV.TheS,
				Stat : true,
				Inp : function(){Cookie.Stat(undefined,Cookie.V().length)},
				Ent : function(_,K){K.ctrlKey && CookieSave.C()}
			}).Off().Stat('',0),
			CookieSaving,
			CookieEnd = WX.EndL(),
			CookieCheckNoti = Noti.O(),
			CookieSave = WV.But(
			{
				X : SA('AutCokeSave'),
				Blk : true,
				C : function(T)
				{
					CookieSaving = Site.V()
					T = Cookie.V()
					if (CookieMin.V().length && SiteMap[CookieSaving].Min)
					{
						T = WW.IsFunc(SiteMap[CookieSaving].Min) ?
							SiteMap[CookieSaving].Min(T) :
							WC.CokeS(WR.Pick(SiteMap[CookieSaving].Min,WC.CokeP(T,WR.Id)),WR.Id)
					}
					WebSocketSendAuth([ActionAuthCookie,CookieSaving,T])
				}
			}).Off();
			WebSocketNotAuthed = function()
			{
				WebSocketNotAuthedNoti([SA('ErrNoAuth'),WV.But(
				{
					X : SA('AutEnt'),
					The : WV.TheP,
					C : function()
					{
						OverlayRelease()
						RTab.At(TabKey)
						Token.Foc(true)
					}
				}).R])
			}
			WV.ApR(
			[
				Token,WV.But(
				{
					X : SA('AutAut'),
					The : WV.TheO,
					Blk : true,
					C : Token.Ent
				}),
				TokenNew,WV.But(
				{
					X : SA('AutSave'),
					The : WV.TheO,
					Blk : true,
					C : TokenNew.Ent
				})
			],RToken)
			SiteOnLoad.R(function()
			{
				Site.On().Drop(WR.Map(function(V)
				{
					return [V.ID,V.ID + (V.Name ? ' ' + V.Name : '')]
				},WR.Where(function(V){return V.Sign},SiteAll)))
			})
			WSOnCookie = function(K,O)
			{
				if (CookieSaving && CookieSaving === K && SiteMap[K])
				{
					CookieSaving = false
					CookieCheckNoti(SA('AutCheck') + ' @' + SiteSolveName(K))
					CookieEnd(SiteMap[K].Sign().Now(function(Q)
					{
						if (Q && WW.IsStr(Q))
							CookieCheckNoti(SA('AutSigned') + ' ' + Q + '@' + SiteSolveName(K))
						else CookieCheckNoti(SA('AutNoSign') + ' @' + SiteSolveName(K))
						CookieCheckNoti(false)
					},function(E)
					{
						CookieCheckNoti(SA('AutNoSign') + ' @' + SiteSolveName(K) + '\n' + ErrorS(E))
						CookieCheckNoti(false)
					}))
				}
				if (WW.IsObj(K))
				{
					CookieMap = K
					O = CookieMap[K = Site.V()]
				}
				Site.V() && K === Site.V() && Cookie.V(O || '')
			}
			WV.ApR(
			[
				RToken,
				Site,
				CookieMin,
				Cookie,
				CookieSave
			],WV.ClsA(V,ClassPadding))
			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`>.`S`{margin:auto;padding:`p`px;max-width:26em}' +
						'#`R` .`I`{margin:`p`px 0}',
						{
							R : ID,
							S : WV.S6,
							I : WV.InpW,

							p : Padding
						}
					)
				},
				Hide : function(){Token.V('').Fresh(),TokenNew.V('').Fresh()}
			}
		}],
		[SA('Sot'),function(V)
		{
			var
			ClassTitle = WW.Key(),
			ClassAction = WW.Key(),
			SC = WB.SC(),
			SCC = {},
			SCM = {},
			Mask = [[WB.SCD,SA('SotDown')],[WB.SCU,SA('SotUp')],[WB.SCI,SA('SotInp')]];
			WR.EachU(function(B)
			{
				var
				Key = B[0],
				On = function(E)
				{
					WV.PrevDef(E)
					ShortCut.Emit(Key)
				},
				Current = [],
				List = WV.Rock(),
				Make = function(K,M)
				{
					var
					U = WV.Rock(ClassAction),
					Set = function(Q,S)
					{
						I.V(Q || '',true)
						N.V(WR.Map(WR.Head,WR.Where(function(V){return V[0] === (V[0] & S)},Mask)),true)
						K = Q
						M = S
					},
					Update = function()
					{
						K && SC.Off(K,On)
						K = I.V()
						M = WR.Reduce(WR.BOr,0,N.V())
						K && SC.On(K,On,M)
						Refresh()
					},
					Remove = function(T)
					{
						K && SC.Off(K,On)
						T = WR.Index(R,Current)
						~T && Current.splice(T,1)
						WV.Del(U)
						Refresh()
					},
					I = WV.Inp(
					{
						Hint : SA('SotSet'),
						Blk : false,
						RO : true,
						InpU : Update,
						Esc : false
					}),
					N = WV.Cho(
					{
						Mul : true,
						Set : Mask,
						Blk : false,
						Inp : Update
					}),
					S = WB.SC(
					{
						Win : I.I,
						Top : I.I
					}),
					R =
					{
						R : U,
						S : Set,
						G : function(Q){K && Q.push([K,M])},
						D : Remove
					};
					Current.push(R)
					WV.ApR(
					[
						WV.But(
						{
							X : SA('SotRemove'),
							The : WV.TheP,
							C : Remove
						}),
						I,N
					],U)
					WV.Ap(U,List)
					Set(K,M)
					S.On('',function(E)
					{
						WV.PrevDef(E)
						WV.StopProp(E)
					},WB.SCY).On('',function()
					{
						I.In() && I.V(S.Name().join('+'))
					},WB.SCH | WB.SCI)
					return R
				},
				Refresh = function()
				{
					if (WR.Eq(SCM[Key] = WR.Reduce(function(D,V){V.G(D)},[],Current),B))
						SCM[Key] = undefined
					WebSocketSendAuth([ActionAuthShortCut,WR.Where(WR.Id,SCM)])
				};
				B = [B.slice(1)]
				SCM[Key] = false
				;(SCC[Key] = function(Q)
				{
					if (!WR.Eq(SCM[Key],Q))
					{
						WR.Each(function(V){SC.Off(V[0],On)},SCM[Key] || B)
						SCM[Key] = Q
						WR.EachU(function(V,F)
						{
							SC.On(V[0],On,V[1])
							Current[F] ?
								Current[F].S(V[0],V[1]) :
								Make(V[0],V[1])
						},Q = Q || B)
						for (;Q.length < Current.length;) WV.Del(Current.pop().R)
					}
				})()
				WV.ApR(
				[
					WV.T(WV.Rock(ClassTitle),SA('Sot' + Key)),
					WV.But(
					{
						X : SA('SotAdd'),
						The : WV.TheP,
						C : function(){Make('',WB.SCD)}
					}),
					WV.But(
					{
						X : SA('SotRestore'),
						The : WV.TheP,
						C : function()
						{
							SCC[Key]()
							Refresh()
						}
					}),
					List
				],V)
			},[
			[
				ShortCutGeneralTabPrev,
				'[',WB.SCD
			],[
				ShortCutGeneralTabNext,
				']',WB.SCD
			],[
				ShortCutGeneralProxy,
				'Alt+p',WB.SCD | WB.SCI
			],[
				ShortCutGeneralFocus,
				'`',WB.SCD
			],[
				ShortCutBrowseSelAll,
				'Ctrl+a',WB.SCD
			],[
				ShortCutBrowseSelClear,
				'Ctrl+Shift+a',WB.SCD
			],[
				ShortCutBrowseHead,
				'h',WB.SCD
			],[
				ShortCutBrowsePrev,
				'j',WB.SCD
			],[
				ShortCutBrowseNext,
				'k',WB.SCD
			],[
				ShortCutBrowseLast,
				'l',WB.SCD
			],[
				ShortCutColdCommit,
				'Enter',WB.SCD
			],[
				ShortCutColdCommitAll,
				'Enter+Ctrl',WB.SCD
			],[
				ShortCutListSelAll,
				'Ctrl+a',WB.SCD
			],[
				ShortCutListSelClear,
				'Esc',WB.SCD
			],[
				ShortCutOverlayClose,
				'Esc',WB.SCD
			]])
			WSOnSC = function(Q)
			{
				WR.EachU(function(V,F){V(Q[F])},SCC)
			}
			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R` .`A`>*{vertical-align:middle}' +
						'#`R` .`I`{width:10em}' +
						'#`R` .`H`{margin-left:`p`px}' +
						'.`T`{padding:4px `p`px;background:#EBEBEB;font-weight:bold}',
						{
							R : ID,
							I : WV.InpW,
							H : WV.ChoW,
							T : ClassTitle,
							A : ClassAction,
							p : Padding
						}
					)
				}
			}
		}],
		[SA('Set'),function(V)
		{
			var
			SetD = {},SetC = {},
			PC,
			Key = function(Q){return PC = Pref.C(Q),Q},
			Pref = WV.Pref(
			{
				O : Setting,
				C : function()
				{
					WebSocketSendAuth([ActionAuthSetting,WR.WhereU(function(V,F){return V !== SetD[F]},Setting)])
				}
			}),
			OptionProxy;
			WR.Each(function(V)
			{
				var
				Key = V[1],
				Default = WR.Default('',V[3]);
				Pref.S([[V[0],V[2]]])
				'' === Default || V[2].V(Setting[Key] = SetD[Key] = Default,true)
				SetC[Key] = function(Q)
				{
					if (Setting[Key] !== (Q = undefined === Q ? Default : Q))
					{
						V[2].V(Setting[Key] = Q,true)
					}
				}
			},[
			[
				SA('SetLang'),
				Key('Lang'),
				WV.Inp(
				{
					InpU : PC,
					Inp : function(Q)
					{
						LangNow === (LangTo(Q),LangNow) ||
							Noti.S(SA('SetLangH'))
					},
					NoRel : InpNoRel
				}).Drop(WR.Map(function(V)
				{
					return [V[0],V[1].Name]
				},WR.Ent(Lang))),
				'EN'
			],[
				SA('SetDir'),
				Key('Dir'),
				WV.Inp(
				{
					Hint : SA('SetDirH'),
					InpU : PC
				})
			],[
				SA('SetFmt'),
				Key('Fmt'),
				WV.Inp(
				{
					Hint : SA('SetFmtH'),
					Any : true,
					InpU : PC,
					NoRel : InpNoRel
				}).Drop(
				[
					'|Up|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?',
					'|Up|/|Y|/|Up|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?'
				]),
				'|Up|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?'
			],[
				SA('SetMax'),
				Key('Max'),
				WV.Inp(
				{
					InpU : PC,
					NoRel : InpNoRel
				}).Drop(WR.Range(1,25)),
				4
			],[
				SA('SetProxy'),
				Key('Proxy'),
				OptionProxy = WV.Cho(
				{
					Set : [[false,SA('GenDisabled')],[true,SA('GenEnabled')]],
					Inp : PC
				}),
				false
			],[
				SA('SetURL'),
				Key('ProxyURL'),
				WV.Inp(
				{
					Hint : SA('SetURLH'),
					InpU : PC
				})
			],[
				SA('SetImg'),
				Key('ProxyView'),
				WV.Cho(
				{
					Set : [[false,SA('SetImgNo')],[true,SA('SetImgDown')]],
					Inp : PC
				}),
				false
			],[
				SA('SetDelay'),
				Key('Delay'),
				WV.Inp(
				{
					Yep : WV.InpYZ,
					InpU : PC,
					Map : Number
				}),
				20
			],[
				SA('SetMerge'),
				Key('Merge'),
				WV.Inp(
				{
					Row : 6,
					InpU : PC
				}),
				''
			]])
			WV.Ap(Pref.R,V)
			WSOnSetting = function(Q)
			{
				WR.EachU(function(V,F){V(Q[F])},SetC)
				LangTo(Q.Lang)
			}
			WR.Has(Top.LangS,Lang) && SetC.Lang(Top.LangS)
			WR.Del('Lang',Top)
			WR.Del('LangS',Top)
			ShortCut.On(ShortCutGeneralProxy,function(V)
			{
				OptionProxy.V(V = !OptionProxy.V())
				Noti.S(V ? SA('SetProxyE') : SA('SetProxyD'))
			})
			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`{padding:0 `p`px}',
						{
							R : ID,
							p : Padding
						}
					)
				}
			}
		}]
	])
	RTab.At(0)
	ShortCut.On(ShortCutGeneralTabPrev,function()
	{
		OverlayRelease()
		RTab.Prev()
	}).On(ShortCutGeneralTabNext,function()
	{
		OverlayRelease()
		RTab.Next()
	})

	WV.On('click',OverlayRelease,ROverlay)
	ShortCutOnOverlay(ShortCutOverlayClose,OverlayRelease)

	WV.Ready(function()
	{
		WV.Ap(Rainbow[0],WV.Body)
		WebSocket ? MakeWebSocket(true) : WebSocketNoti(SA('GenNoSock'))

		Top.CrabSave = CrabSave = {}
		CrabSave.Site = function(Q)
		{
			var V = Q(
			{
				Req : function(Q,H)
				{
					Q = WW.IsObj(Q) ? Q : {url : Q}
					Q.Cookie = V.Cookie
					return WX.Provider(function(O)
					{
						var T = WW.Key();
						if (WebSocketSendAuth([ActionAuthApi,T,Q]))
						{
							WSOnApi[T] = function(B)
							{
								WR.Del(T,WSOnApi)
								T = false
								if (B[2] && H) O.D(B.slice(2)).F()
								else if (B[2] && /^2/.test(B[2])) O.D(B[3]).F()
								else O.E(B[2] ?
									SA('ErrBadRes',['#' + B[2] + ' ' + B[3]]) :
									B[3])
							}
						}
						else T = WW.Throw(SA(Online ? 'ErrNoAuth' : 'ErrOff'))
						return function()
						{
							T && WebSocketSendAuth([ActionAuthApi,T,false])
						}
					})
				},
				Api : function(Q)
				{
					return WB.ReqB(URLApi + WC.UE(WW.IsObj(Q) ? WC.OTJ(Q) : Q))
				},
				Head : function(Q,K,V)
				{
					Q = WW.IsObj(Q) ? Q : {url : Q}
					;(Q.headers || (Q.headers = {}))[K] = V
					return Q
				},
				Auth : function()
				{
					return !!Cipher
				},
				Coke : function()
				{
					return CookieMap[V.Cookie] || ''
				},
				Bad : function(Q,S)
				{
					WW.Throw(null == S ? Q : '[' + Q + '] ' + S)
				},
				BadR : function(Q)
				{
					WW.Throw(SA('ErrBadRes',[WW.IsObj(Q) ? WC.OTJ(Q) : Q]))
				},
				Num : function(Q)
				{
					return RegExp('\\b(?:' + Q + ')(?![A-Z])\\D*(\\d+)','i')
				},
				Word : function(Q)
				{
					return RegExp('\\b(?:' + Q + ')[\\s/=]+([^&?#\\s]+)','i')
				},
				TL :
				[
					/^$/,
					/\b(?:Dynamic|Sub|Subscri(?:be|ption)|Timeline|TL)\b/i,
					/\b(?:Top|Repo)\b/i
				],
				UP : /\b(?:Up|Uploader|Fo|Follow|Following)\b/i,
				Find : /^(?:\?|Find|Search)\s+(?!\s)(.+)$/i,
				Size : PageSize,
				Pascal : function(Q)
				{
					return Q.replace(/[A-Z]?[a-z]+/g,function(V)
					{
						return V.charAt(0).toUpperCase() + V.slice(1)
					})
				},
				Less : function(Q)
				{
					/**@type {CrabSaveNS.SiteItem[]}*/
					var Cache;
					return function(ID,Page)
					{
						return (Page && Cache ? WX.Just(Cache) : Q(ID)).Map(function(V)
						{
							var C = Math.ceil(V.length / PageSize);
							Cache = V
							return {
								At : Page < C ? Page : Page = C && ~-C,
								Max : C,
								Len : V.length,
								Size : PageSize,
								Item : V.slice(Page * PageSize,-~Page * PageSize)
							}
						})
					}
				},
				More : function(Q,S,M)
				{
					var
					Cache,Count,Len,
					Finalize = function(V,P)
					{
						if (!WR.Has('Len',V)) V.Len = Len
						if (!WR.Has('Max',V)) V.Max = Cache.length
						P = WR.Sum(Count.slice(0,P))
						WR.Each(function(B)
						{
							if (!WR.Has('Index',B)) B.Index = P++
						},V.Item)
					};
					M = M || WR.Id
					return function(ID,Page)
					{
						return Cache && Page ?
							S(Cache,Page,ID).Map(function(V)
							{
								V = M(V)
								Len += V.Item.length - (0 | Count[Page])
								Count[Page] = V.Item.length
								Finalize(V,Page)
								return V
							}) :
							Q(ID).Map(function(V)
							{
								Cache = V[0]
								V = M(V[1])
								Count = [Len = V.Item.length]
								Finalize(V,Page)
								return V
							})
					}
				},
				SolU : SolveURL,
				DTS : DTS,
				High : MakeHigh,
				Ah : function(Q,S)
				{
					return WV.X(WV.Ah(Q,S))
				},
				Progress : BrowserOnProgress
			},WW,WC,WR,WX,WV);
			if (!WW.IsNum(SiteMap[V.ID])) return
			V.Judge || (V.Judge = /(?!)/)
			V.Cookie || V.Sign && (V.Cookie = V.ID)
			WW.IsStr(V.Min) && (V.Min = V.Min.split(' '))
			WR.Each(function(B){B.Judge = WW.IsArr(B.Judge) ? B.Judge : B.Judge ? [B.Judge] : []},V.Map)
			V.IDView || (V.IDView = WR.Id)
			SiteAll[SiteMap[V.ID]] = V
			WR.Each(function(B){SiteMap[WR.Up(B)] = SiteMap[B] = V},
				[V.ID].concat(V.Name || [],V.Alias ? V.Alias.split(' ') : []))
			SiteOnNoti(++SiteCount)
		}
		CrabSave.Err = RecordErrList
		CrabSave.Inspect = function()
		{
			WebSocketSendAuth([ActionAuthInspect,WW.Arr(arguments)])
		}
		SiteBegin = WW.Now()
		WW.To(1E3,function(){SiteCount < SiteTotal && SiteOnNoti()})
		SiteTotal = WR.EachU(function(V,F)
		{
			WV.Ap(WV.Attr(WV.A('script'),'src',URLSite + V + '.js'),WV.Head)
			SiteMap[V] = F
		},[
			'BiliBili',
			'YouTube',
			'NicoNico'
		]).length
		SiteOnNoti()
		WW.To(TickInterval,function(F)
		{
			for (F = 0;F < TickQueue.length;++F)
				TickQueue[F]()
		},true)
		OverallUpdate()
	})
}()