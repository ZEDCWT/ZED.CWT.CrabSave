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
	RegExp = Top.RegExp,

	ActionWebTaskNew = 'TaskN',
	ActionWebTaskOverview = 'TaskO',
	ActionWebTaskPlay = 'TaskP',
	ActionWebTaskPause = 'TaskU',
	ActionWebTaskRemove = 'TaskD',
	ActionWebTaskSize = 'TaskS',
	ActionWebTaskRenew = 'TaskW',
	ActionWebTaskTitle = 'TaskT',
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
	ActionAuthReload = 'Red',
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
	DebugClick = 10,
	DebugInterval = 2000,
	DebugLimit = 2048,

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
	RemainS = function(V){return '-' + WW.StrS(WR.Max(0,V / 1E3))},

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
	ClassConfirm = WW.Key(),
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

	OnUpdateBar = function()
	{
		WV.Con(RToolbar,RTab.Key()[ToolbarKey])
		WV.Con(RStatus,RTab.Key()[StatusKey])
	},
	Rainbow = WV.Div(2,1,null,[0,SizeFooter]),
	RMain = WV.Div(2,2,['10%'],[SizeHeader,'100%'],true),
	RToolbar = WV.VM(RMain[2]),
	OnUpdateBar = function()
	{
		if (OverlayOn)
		{
			WV.Clr(RToolbar)
			WV.Clr(RStatus)
		}
		else
		{
			WV.Con(RToolbar,RTab.Key()[ToolbarKey])
			WV.Con(RStatus,RTab.Key()[StatusKey])
		}
	},
	RTab = WV.Split(
	{
		Pan : [null,RMain[3],RMain[4]],
		Main : true,
		S : OnUpdateBar
	}),
	RTabTo = function(Q)
	{
		OverlayRelease()
		RTab.At(Q)
	},
	ROverlay = WV.Rock(ClassOverlay),
	Noti = WV.Noti({Top : RMain[0]}),
	NotiAuth = Noti.O(),
	CookieMap = {},
	ShortCut = WW.Bus(),
	ShortCutGeneralTabPrev = 'GenTabPrev',
	ShortCutGeneralTabNext = 'GenTabNext',
	ShortCutGeneralProxy = 'GenProxy',
	ShortCutGeneralFocus = 'GenFocusKeywordInput',
	ShortCutGeneralFocusAuth = 'GenFocusAuth',
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
	WebSocketTick = WW.To(3E5,function()
	{
		WebSocketSend([ActionWebTick])
	},true).F(),
	WS = WB.WS(
	{
		Rect : false,
		Beg : function()
		{
			WebSocketSince = WebSocketRetry ? WebSocketSince : WW.Now()
			WebSocketRetry && WebSocketNoti(SA('SocConn') + ' ' + SA('SocRetry') + ' : ' + WebSocketRetry)
		},
		Hsk : function()
		{
			Online = true
			DebugLog('Online')
			WebSocketRetry && WebSocketNoti(SA('SocOn'))
			WebSocketNoti(false)
			WebSocketRetry = 0
			WebSocketSend = function(Q)
			{
				WS.D(WC.OTJ(Q))
				return true
			}
			WebSocketSendAuth = function(Q)
			{
				if (Cipher)
				{
					Q = Cipher.D(WC.OTJ([WW.Key(WW.Rnd(20,40)),Q,WW.Key(WW.Rnd(20,40))]))
					WS.D(Q)
					return true
				}
				WebSocketNotAuthed()
			}
			WSOnOnline.D()
			WebSocketNotConnectedNoti(false)
			WebSocketTick.D()
		},
		Str : function(Q,K,O)
		{
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
				return
			}
			DebugLog('Web',Q)
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
					DetailIs(O[0]) && DetailUpdate.F(O[1])
					break
				case ActionWebTaskOverview :
					TaskOverviewUpdate(K,O)
					break
				case ActionWebTaskRenew :
					WSOnRenew(K,O)
					break
				case ActionWebTaskTitle :
					WSOnTitle(K,O)
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
		},
		Bin : function(Q,K,O)
		{
			Q = WC.JTOO(WC.U16S(Decipher.D(Q)))
			if (!WW.IsArr(Q) || !WW.IsArr(Q = Q[1])) return WS.F()
			DebugLog('Auth',Q)
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
					Noti.S(SA(K))
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
		},
		End : function()
		{
			WebSocketSend = WebSocketNotConnected
			WebSocketSendAuth = WebSocketNotConnected
			Cipher = Decipher = false
			DebugLog('Offline',WebSocketRetry)
			WebSocketNoti(SA('SocOff',[WW.StrDate(WebSocketSince),WebSocketRetry++]))
			NotiAuth(false)
			WSOnOffline.D()
			WebSocketTick.F()
			WW.To(Online ? 0 : Retry,WS.C,Online = false)
		}
	}),
	WSOnProgress,
	WSOnApi = {},
	WSOnOnline = WW.BusS(),
	WSOnOffline = WW.BusS(),
	WSOnDiffHot,
	WSOnDiffHist,
	WSOnRenew,
	WSOnTitle,
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
	SiteSolveName = function(Q,S)
	{
		S = WW.IsObj(Q) ? Q : SiteMap[Q]
		return S ? S.Name || S.ID : SA('GenUnknown',[Q])
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
		var
		V = [],F = 0,G,
		SiteMap = {};
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
				if (~V[1].indexOf(' '))
				{
					G = V[1].split(' ')
					SiteMap[G[0]] = G[1]
					V[1] = G[1]
				}
				else V[1] = SiteMap[V[1]]
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
	OverlayEnd = WX.EndL(),
	MakeOverlay = function(H)
	{
		var T = WV.VM(WV.Clr(ROverlay));
		OverlayOn = true
		OnUpdateBar()
		WV.TI(T)
		WV.On('click',WV.StopProp,T)
		OverlayEnd()
		OverlayEnd(WX.EndI(
		[
			H(T),
			WV.On('click',OverlayRelease,RMain[3])
		]))
		WV.Ap(ROverlay,RMain[4])
		T.focus()
	},
	OverlayRelease = function()
	{
		if (OverlayOn)
		{
			OverlayOn = false
			OnUpdateBar()
			WV.Del(ROverlay)
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
			RemainS(Rest / Speed)
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
				SiteSolveName(Q.S),' ',
				Site && Site.IDView ?
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
						WW.StrDate(S.Done) +
							(null == Birth ? '' :
								' (' +
								WW.StrMS(S.Done - Birth) +
								(Down ?
									' ' + WW.StrMS(S = WR.Reduce(function(D,V){return D + V.Take},0,Down)) +
									' ' + MakeSpeed(WR.Reduce(function(D,V){return D + V.Has},0,Down) / S) :
									'') +
								')')
				}]
			],
			PartList = [],
			Birth,
			Down,
			Update = function(S)
			{
				S = S || {}
				Birth = S.Birth
				Down = S.Down
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
					PartMap[V.Part] = V
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
									PartMap[V.Part] ? PartMap[V.Part].Total : S.Part.length,
									PartMap[V.Part] ? PartMap[V.Part].Title : ''
								])
							]),Part)
						}
						WV.T(URL,V.URL)
						WV.Ti(URL,V.URL)
						WV.T(Name,V.Path)
						Prog
							.P(V.Play || '-')
							.G(MakeProgress(V.Size,V.Has))
							.C(null == V.First ? '-' : WW.StrDate(V.First))
							.T(V.Take ? WW.StrMS(V.Take) : '-')
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
								T = Has[1]
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
			Site && Site.IDURL &&
				WV.Ap(WV.X(Site.IDURL(Q.I)),Header)
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
				},
				F : function(Done,T)
				{
					T = WR.Last(Line)
					WV.T(T[2],T[1]({Done : Done}))
					WV.Ap(T[0],Detail)
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

	MakeConfirm = function(Title,Body,No,Yes,H)
	{
		MakeOverlay(function(Y)
		{
			var
			Header = WV.T(WV.Rock(ClassHeader),Title),
			Content = WV.X(Body),
			ButNo = WV.But(
			{
				X : No,
				Blk : true,
				The : WV.TheP,
				C : OverlayRelease
			}),
			ButYes = WV.But(
			{
				X : Yes,
				Blk : true,
				The : WV.TheP,
				C : function()
				{
					OverlayRelease()
					H()
				}
			});
			WV.ClsA(Y,ClassConfirm)
			WV.ApR([Header,Content,ButNo,ButYes],Y)
		})
	},
	ConfirmRemove = function(Q)
	{
		MakeConfirm(SA('LstDelConfirm'),SA('LstDelCount',[Q.length]),
			SA('GenCancel'),SA('LstRemove'),
			function(){WebSocketSendAuth([ActionAuthTaskRemove,Q])})
	},



	ToolbarKey = 6,
	ToolbarSet = function(K,Q)
	{
		K[ToolbarKey] = Q
		OverlayOn ||
			RTab.Is(K) && WV.Con(RToolbar,Q)
	},
	StatusKey = 7,
	StatusSet = function(K,Q)
	{
		K[StatusKey] = Q
		OverlayOn ||
			RTab.Is(K) && WV.Con(RStatus,Q)
	},
	MakeSelectSize = function(K)
	{
		var
		Count = 0,Plus = 0,
		Size = 0,
		Update = function()
		{
			StatusSet(K,Count ?
				'[' + WR.ToSize(Size) + (Plus ? '+' : '') + '] ' +
					SA('StsSelect',[Count]) +
					(Plus ? SA('StsPlus',[Plus]) : '') :
				null)
			return Count
		};
		return {
			C : Update,
			A : function(Q)
			{
				++Count
				null == Q.Z ?
					++Plus :
					Size += Q.Z
			},
			D : function(Q)
			{
				--Count
				null == Q.Z ?
					--Plus :
					Size -= Q.Z
			},
			I : function(Q,S)
			{
				null == Q ?
					--Plus :
					Size -= Q
				null == S ?
					++Plus :
					Size += S
				Update()
			}
		}
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
	},



	DebugCount = 0,
	DebugView = WV.Rock(),
	DebugCurrent = [],
	DebugLog = function(Q,S)
	{
		Q = '{' + WW.StrDate() + ' | ' + WW.Tick() + ' #' + DebugCount++ + '} ' + WR.Map(function(V)
		{
			V = null == V ?
				'' :
				WW.IsObj(V) ? WC.OTJ(V) : String(V)
			return V.length < 512 ? V : V.slice(0,512) + '...'
		},[Q,S]).join(' ')
		DebugCurrent.push(WV.Pre(WV.X(Q),DebugView))
		DebugCurrent.length < DebugLimit ||
			WV.Del(DebugCurrent.shift())
	},
	DebugIn,
	DebugReg = function(Target,Event)
	{
		var
		Last = [];
		WV.On(Event,function()
		{
			Last.push(WW.Now())
			DebugClick < Last.length && Last.shift()
			Last.length < DebugClick ||
				WR.Last(Last) - Last[0] < DebugInterval &&
				MakeDebug(Last)
		},Target)
	},
	MakeDebug = function(Last)
	{
		DebugIn || MakeOverlay(function(Y)
		{
			var
			Header = WV.Rock(ClassHeader);
			DebugIn = true
			WV.T(Header,'Debug' + (Last ? ' ' + (WR.Last(Last) - Last[0]) + 'ms' : ''))
			WV.ApA([Header,DebugView],Y)
			return function()
			{
				DebugIn = false
				if (Last) Last.length = 0
			}
		})
	};

	LangTo(Top.LangS)

	WV.ClsA(RMain[1],WV.NoSel)
	WV.Text(WV.VM(RMain[1]),SA('Title'))
	DebugReg(RMain[1],'mousedown')
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
		'.`J`{overflow:hidden}' +

		'#`M`{position:relative;overflow:hidden}' +
		'#`T`{min-width:110px;text-align:center;font-weight:bold}' +
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
			'text-align:center;' +
			'word-wrap:break-word' +
		'}' +
		'.`Y`>div' +
		'{' +
			'width:100%;' +
			'height:100%;' +
			'max-width:100%;' +
			'max-height:100%;' +
			'background:#F7F7F7;' +
			'text-align:left;text-align:initial;' +
			'overflow:auto' +
		'}' +
		'.`Y`>div>div{padding:`h`px `p`px}' +

		'.`R`{background:#F3EBFA}' +

		'.`E` .`H`{margin-right:`h`px}' +
		'.`ET`{padding-left:`p`px}' +

		'.`Y`>.`Q`{height:auto;text-align:center}' +

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
			J : WV.ListI,

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
			Q : ClassConfirm,
			V : WV.ID(RStatusBar[1]),
			X : WV.ID(RStatusBar[2]),

			p : Padding,
			h : PaddingHalf,
			q : PaddingQuarter
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
				Q = Q.replace(/\s+$/,'')
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
						ID = B && (2 in B ?
							B.slice(1).join(WR.Default('#',V.Join)) :
							B[1 in B ? 1 : 0])
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
					StatusSet(K,SA('GenLoading'))
					BriefKeyword.K(Key)
						.S(SiteSolveName(Site))
						.A(Action.Name)
						.I(ID)
						.U(SA('GenLoading'))
					JumpEnd(Action.View(ID,Q,Action === GoPrefAction ? GoPref : undefined).Now(function(/**@type {CrabSaveNS.SitePage}*/S)
					{
						StatusSet(K)
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
							'`F`~`T`. `I` `L`/`U`. `G` `A`/`P`. `M`s (`D`)',
							{
								F : S.Item.length && S.Item[0].Index,
								T : S.Item.length && WR.Last(S.Item).Index,
								I : SA('BroItem'),
								L : S.Item.length,
								U : S.Len = WR.Default(S.Item.length,S.Len),
								G : SA('BroPage'),
								A : S.At = WR.Default(Q,S.At),
								P : S.Max = WR.Default(Math.ceil(S.Len / (S.Size || PageSize)) || 1,S.Max),
								D : WW.StrDate(),
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
						StatusSet(K)
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
									.Drop(WR.Map(function(B)
									{
										return WW.IsArr(B) ?
											[(V.Jump ? '' : S[3]) + B[0],B[1],0] :
											[S[3] + B,B,0]
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
				RTabTo(K)
				Keyword.I.select()
				Keyword.Foc(true)
				V.scrollTop = 0
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
						'#`R`>.`I` input{padding-left:6px;height:34px}' +
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
			Selected = 0,
			OnDel = function(ID,Index)
			{
				WR.Del(ID,ColdMap)
				~Index && List.Splice(Index,1)
				BrowserUpdate([ID])
				ColdCount.D(Cold)
				Cold.length || JustCommitAll.Off()
			},
			JustCommit = WV.But(
			{
				X : SA('ColCommit'),
				The : WV.TheP,
				C : function()
				{
					WebSocketSendAuthPrecheck() && WebSocketSendAuth(
					[
						ActionAuthTaskNew,
						WR.Map(function(V)
						{
							return Cold[V]
						},List.SelL())
					])
				}
			}).Off(),
			JustRemove = WV.But(
			{
				X : SA('LstRemove'),
				The : WV.TheP,
				C : function(L,F)
				{
					L = List.SelL()
					for (F = L.length;F;)
						OnDel(Cold[L[--F]].O,L[F])
				}
			}).Off(),
			JustCommitAll = WV.But(
			{
				X : SA('ColCommitAll'),
				The : WV.TheP,
				C : function()
				{
					if (Cold.length && WebSocketSendAuthPrecheck())
					{
						WebSocketSendAuth([ActionAuthTaskNew,Cold])
						RTab.Next()
					}
				}
			}).Off(),
			List = WV.List(
			{
				Data : Cold,
				Pan : V,
				Sel : true,
				SelC : function()
				{
					StatusSet(K,Selected ?
						SA('StsSelect',[Selected]) :
						null)
					if (Selected)
					{
						JustCommit.On()
						JustRemove.On()
					}
					else
					{
						JustCommit.Off()
						JustRemove.Off()
					}
				},
				SelA : function()
				{
					++Selected
				},
				SelD : function()
				{
					--Selected
				},
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

			ToolbarSet(K,
			[
				JustCommit.R,
				JustRemove.R,
				JustCommitAll.R
			])

			ShortCutOnPage(K,ShortCutListSelAll,List.SelAll)
			ShortCutOnPage(K,ShortCutListSelClear,List.SelClr)
			ShortCutOnPage(K,ShortCutColdCommit,JustCommit.C)
			ShortCutOnPage(K,ShortCutColdCommitAll,JustCommitAll.C)

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
						T : Q.Title || '',
						U : Q.UP
					})
					BrowserUpdate([ID])
					ColdCount.D(Cold)
					JustCommitAll.On()
				}
			}
			ColdDel = function(ID)
			{
				if (IsCold(ID))
					OnDel(ID,Cold.indexOf(ColdMap[ID]))
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
			Selected = MakeSelectSize(K),
			MakeJust = function(H,Action,Confirm)
			{
				return WV.But(
				{
					X : SA(H),
					The : WV.TheP,
					C : function(L)
					{
						if (WebSocketSendAuthPrecheck() && (L = List.SelL()).length)
						{
							L = WR.Map(function(V){return Hot[V].O},L)
							Confirm ?
								Confirm(L) :
								WebSocketSendAuth([Action,L])
						}
					}
				}).Off()
			},
			JustPlay = MakeJust('HotPlay',ActionAuthTaskPlay),
			JustPause = MakeJust('HotPause',ActionAuthTaskPause),
			JustRemove = MakeJust('LstRemove',ActionAuthTaskRemove,ConfirmRemove),
			List = WV.List(
			{
				Data : Hot,
				Pan : V,
				Sel : true,
				SelC : function()
				{
					if (Selected.C())
					{
						JustPlay.On()
						JustPause.On()
						JustRemove.On()
					}
					else
					{
						JustPlay.Off()
						JustPause.Off()
						JustRemove.Off()
					}
				},
				SelA : Selected.A,
				SelD : Selected.D,
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
							S[0] && ConfirmRemove([S[0].O])
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
						if (null == Task) return
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
								SingleFill(Title,B.Title || SA('GenUntitle'))
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
									if (null == Task) return
									return undefined === Q ?
										PlayCurrent :
										Task.State - Q &&
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
								T : function(Q)
								{
									if (null == Task) return
									SingleFill(Title,Q || SA('GenUntitle'))
								},
								Z : function(Q)
								{
									if (null == Task) return
									WV.ClsR(Running.R,WV.None)
									null == Q[1] || Running.F(Q[1])
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

			ToolbarSet(K,
			[
				JustPlay.R,
				JustPause.R,
				JustRemove.R
			])

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
						if (WR.Has(S[0],HotRowMap))
						{
							T = WW.BSL(Hot,S[0],function(Q,S){return Q.O < S})
							Hot[T] && Hot[T].O === S[0] &&
								List.Splice(T,1)
							T = HotRowMap[S[0]]
							WR.Del(S[0],HotRowMap)
							HotMap.E(IDCombine(T.S,T.I),T)
							HotCount.D(Hot)
							BrowserUpdate([IDCombine(T.S,T.I)])
						}
						break
				}
			})

			WSOnOnline.R(function()
			{
				DebugLog('HotBegin',HotVersion)
				HotRead(WB.ReqB({URL : 'Hot' + (HotVersion ? '?' + HotVersion : ''),TO : false})
					.RetryWhen(TaskBriefRetry(SA('Hot')))
					.Now(function(B)
					{
						List.SelClr()
						TaskBriefSolve(4,B,function(V)
						{
							Hot.length = 0
							HotMap.C()
							HotRowMap = {}
							HotVersion = V
							DebugLog('HotEnd',HotVersion)
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
							BrowserUpdate()
						})
						WSOnDiffHot.S(HotVersion)
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
			WSOnTitle = function(Row,Q)
			{
				WR.Has(Row,HotShown) &&
					HotShown[Row].T(Q)
			}
			WSOnSize = function(Row,Q,T)
			{
				WR.Has(Row,HotShown) &&
					HotShown[Row].Z(Q)
				T = WW.BSL(Hot,Row,function(Q,S){return Q.O < S})
				if (Hot[T] && Hot[T].O === Row)
				{
					List.SelHas(T) &&
						Selected.I(Hot[T].Z,Q[0])
					Hot[T].Z = Q[0]
				}
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
				WR.Del(Row,ProgressMap)
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
			Selected = MakeSelectSize(K),
			MakeJust = function(H,Action,Confirm)
			{
				return WV.But(
				{
					X : SA(H),
					The : WV.TheP,
					C : function(L)
					{
						if (WebSocketSendAuthPrecheck() && (L = List.SelL()).length)
						{
							L = WR.Map(function(V){return History[V].O},L)
							Confirm ?
								Confirm(L) :
								WebSocketSendAuth([Action,L])
						}
					}
				}).Off()
			},
			JustRemove = MakeJust('LstRemove',ActionAuthTaskRemove,ConfirmRemove),
			List = WV.List(
			{
				Data : History,
				Pan : V,
				Sel : true,
				SelC : function()
				{
					if (Selected.C())
					{
						JustRemove.On()
					}
					else
					{
						JustRemove.Off()
					}
				},
				SelA : Selected.A,
				SelD : Selected.D,
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
							S[0] && ConfirmRemove([S[0].O])
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
								SingleFill(Title,B.Title || SA('GenUntitle'))
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

			ToolbarSet(K,
			[
				JustRemove.R
			])

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
							S = HistoryRowMap[S.O] = HistoryMap.D(T = IDCombine(S.S,S.I),S)
							!History.length || History[0].E < S.E || History[0].E === S.E && S.O < History[0].O ?
								List.Unshift(S) :
								List.Splice(WW.BSL(History,S,function(Q,S){return Q.E - S.E ? S.E < Q.E : Q.O < S.O}),0,S)
							BrowserUpdate([T])
						}
						break
					case ActionWebTaskRemove :
						if (S[1] && WR.Has(S[0],HistoryRowMap))
						{
							H = HistoryRowMap[S[0]]
							T = WW.BSL(History,S,function(Q,S){return Q.E - S[1] ? S[1] < Q.E : Q.O < S[0]})
							History[T] && History[T].O === S[0] &&
								List.Splice(T,1)
							WR.Del(S[0],HistoryRowMap)
							HistoryMap.E(T = IDCombine(H,S,H.I),H)
							BrowserUpdate([T])
						}
						break
				}
			})

			WSOnOnline.R(function()
			{
				DebugLog('HistBegin',HistoryVersion)
				HistoryRead(WB.ReqB({URL : 'Hist' + (HistoryVersion ? '?' + HistoryVersion : ''),TO : false})
					.RetryWhen(TaskBriefRetry(SA('His')))
					.Now(function(B)
					{
						List.SelClr()
						TaskBriefSolve(5,B,function(V)
						{
							History.length = 0
							HistoryMap.C()
							HistoryRowMap = {}
							HistoryVersion = V
							DebugLog('HistEnd',HistoryVersion)
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
							BrowserUpdate()
						})
						WSOnDiffHist.S(HistoryVersion)
						List.Re()
					}))
			})

			return {
				Show : List.In,
				HideP : List.Out
			}
		}],/*
		[SA('Cmp'),function()
		{

		}],*/
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
						TokenEnt.Off()
						TokenNew.On()
						TokenNewEnt.On()
					}
				}
			}),
			TokenEnt = WV.But(
			{
				X : SA('AutAut'),
				The : WV.TheO,
				Blk : true,
				C : Token.Ent
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
						Noti.S(SA('AutSaving'))
					}
				}
			}).Off(),
			TokenNewEnt = WV.But(
			{
				X : SA('AutSave'),
				The : WV.TheO,
				Blk : true,
				C : TokenNew.Ent
			}).Off(),
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
						RTabTo(TabKey)
						Token.Foc(true)
					}
				}).R])
			}
			WV.ApR(
			[
				Token,TokenEnt,
				TokenNew,TokenNewEnt
			],RToken)
			SiteOnLoad.R(function()
			{
				Site.On().Drop(WR.Map(function(V)
				{
					return [V.ID,V.ID + (V.Name ? ' ' + V.Name : '')]
				},WR.Where(function(V){return V.Sign},SiteAll)))
			})
			WSOnOffline.R(function()
			{
				TokenEnt.On()
				TokenNew.Off()
				TokenNewEnt.Off()
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
				else CookieMap[K] = O
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
			ShortCut.On(ShortCutGeneralFocusAuth,function()
			{
				RTabTo(TabKey)
				Token.Foc(true)
			})
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
				ShortCutGeneralFocusAuth,
				'Alt+u',WB.SCD | WB.SCI
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
			SC.On('Shift+Ctrl+Alt+Space+p+-+]',function()
			{
				MakeDebug()
			},WB.SCD | WB.SCI)
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
				SA('SetSize'),
				Key('Size'),
				WV.Cho(
				{
					Set : [[false,SA('GenDisabled')],[true,SA('GenEnabled')]],
					Inp : PC
				}),
				true
			]/*,[
				SA('SetMerge'),
				Key('Merge'),
				WV.Inp(
				{
					Row : 6,
					InpU : PC
				}),
				''
			]*/])
			WV.Ap(Pref.R,V)
			WSOnSetting = function(Q)
			{
				WR.EachU(function(V,F){V(Q[F])},SetC)
				LangTo(Q.Lang)
			}
			WR.Has(Top.LangS,Lang) && SetC.Lang(Top.LangS)
			Top.Lang = null
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
		WS.H || WebSocketNoti(SA('GenNoSock'))
		WS.C()

		Top.CrabSave = CrabSave = {}
		CrabSave.Site = function(Q)
		{
			var V = Q(
			{
				Req : function(Q,H)
				{
					Q = WW.IsObj(Q) ? Q : {URL : Q}
					if (!WR.Has('Cookie',Q))
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
					return WB.ReqB(URLApi + '~' + WC.UE(WW.IsObj(Q) ? WC.OTJ(Q) : Q))
				},
				Head : function(Q,K,V)
				{
					return WW.N.ReqOH(Q,K,V)
				},
				Auth : function()
				{
					return !!Cipher
				},
				Coke : function()
				{
					return CookieMap[V.Cookie] || ''
				},
				CokeU : function(Q)
				{
					WebSocketSendAuth([ActionAuthCookie,V.ID,Q])
				},
				CokeC : function(Q)
				{
					Q = WX.CacheL(Q)
					return function()
					{
						return Q(CookieMap[V.Cookie] || '')
					}
				},
				Bad : function(Q,S)
				{
					WW.Throw(null == S ?
						Q :
						WW.IsArr(S) ?
							SA(Q,S) :
							'[' + Q + '] ' + S)
				},
				BadR : function(Q)
				{
					WW.Throw(SA('ErrBadRes',[WW.IsObj(Q) ? WC.OTJ(Q) : Q]))
				},
				Num : function(Q)
				{
					return RegExp('\\b(?:' + Q + ')(?![A-Z])(?:\\D*\\b)?(\\d+)\\b','i')
				},
				Word : function(Q)
				{
					return RegExp('\\b(?:' + Q + ')[\\s/=]+([^&?#\\s/]+)','i')
				},
				TL :
				[
					/^$/,
					/\b(?:Dynamic|Sub|Subscri(?:be|ption)|Timeline|TL)\b/i,
					/\b(?:Home)\b/i,
					/\b(?:Feed)\b/i,
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
				JOM : function(S,Q)
				{
					S = S.exec(Q)
					return S ?
						WC.JTO(Q.slice(S.index + S[0].length),{More : true})[0] :
						{}
				},
				NoRel : InpNoRel,
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
					var Cache,Count,Len;
					return function(ID,Page)
					{
						return (Cache && Page ?
							S(Cache,Page,ID) :
							Q(ID,Cache = [],Count = [],Len = 0))
							.Map(function(R)
							{
								R = M(R,Cache,Page)
								if (R[0]) Cache[-~Page] = R[0]
								R = R[1]
								Len -= (Count[Page] || 0) - (Count[Page] = R.Item.length)
								if (null == R.Len) R.Len = Len
								if (null == R.Max) R.Max = Cache.length
								Page = WR.Sum(Count.slice(0,Page))
								WR.Each(function(V)
								{
									if (null == V.Index) V.Index = Page++
								},R.Item)
								return R
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
				Text : function(Q,S)
				{
					Q = WC.HED(Q
						.replace(/<br(\s[^>]+)?>/g,'\n')
						.replace(/<.*?>/g,''))
					return S ?
						Q.replace(/.+/g,WR.Trim) :
						WR.Trim(Q)
				},
				Progress : BrowserOnProgress
			},WW,WC,WR,WX,WV);
			if (!WW.IsNum(SiteMap[V.ID])) return
			V.Judge || (V.Judge = /(?!)/)
			V.Cookie || V.Sign && (V.Cookie = V.ID)
			V.Min && WW.IsStr(V.Min) && (V.Min = V.Min.split(' '))
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
		CrabSave.Reload = function()
		{
			WebSocketSendAuth([ActionAuthReload])
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
			'NicoNico',
			'AcFun',
			'Facebook',
			'Instagram',
			'IXiGua',
			'TikTok',
			'Twitter',
			'Vimeo',
			'WeiBo'
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