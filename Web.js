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
	TopSet = Top.Set,
	CrabSave = Top.CrabSave,
	ConsoleLog = WR.Bind(Top.console.log,Top.console),
	Unsafe = {},

	Conf = {/*{Conf}*/},
	ConfRetry = 1E4,
	ConfPadding = 20,
	ConfPaddingHalf = ConfPadding / 2,
	ConfPaddingQuarter = ConfPaddingHalf / 2,
	ConfSizeHeader = 40,
	ConfSizeFooter = 40,
	ConfSizeCardWidth = 200,
	ConfPageSize = 30,
	ConfTaskButtonSize = 80,
	ConfDBPageSize = 4096,
	ConfCacheLimit = 128,
	ConfTickInterval = 500,
	ConfDebugClick = 10,
	ConfDebugInterval = 2000,
	ConfDebugLimit = 2048,
	ConfDebugLimitObj = 128,
	ConfPartSpecialType =
	{
		'-8000' : 'Meta',
		'-7999' : 'Cover'
	},
	ConfPartSpecialTypeLang =
	{
		Meta : 'GenMeta',
		Cover : 'GenCover'
	},
	ConfURLSite = 'S/',
	ConfURLAPI = 'R/',
	ConfURLReq = 'U?',

	Proto = {/*{Proto}*/},
	ProtoInv = WR.Inv(Proto),
	ProtoJar = WC.PBJ().S(WC.B91P({/*{ProtoPB}*/})),
	ProtoEnc = function(ProtoID,Data){return Data ? ProtoJar.E(ProtoInv[ProtoID],Data) : []},
	ProtoDec = function(ProtoID,Data){return ProtoJar.D(ProtoInv[ProtoID],Data)},
	ProtoIsAuth = WR.Where(WR.Test(/^Auth/),ProtoInv),
	ProtoMsgTypePlain = 0,
	ProtoMsgTypeAuth = 1,
	ProtoMsgTypeBrief = 2,
	ProtoMsgHeadBuf = WC.Buff(1024),
	ProtoMsgCache,ProtoMsgCacheID,ProtoMsgCacheData,
	ProtoMsgMake = function(ProtoID,Data)
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
			ProtoMsgCache = WC.Con([ProtoMsgHeadBuf.subarray(0,F),Data])
		}
		return ProtoMsgCache
	},

	Lang = {/*{Lang}*/},
	LangDefault = Lang.EN,
	LangNow = LangDefault,
	LangTo = function(Q)
	{
		LangNow = WR.Has(Q,Lang) ? Lang[Q] : LangNow
	},
	LangSolve = /**@type {<U extends keyof _$_Lang['EN']>(Q : U,S? : any[]) => string}*/ function(Q,S)
	{
		var
		Solve = function(O)
		{
			return O[Q].replace(/~([^~]*)~/g,function(_,V)
			{
				return !V ? '~' :
					S && WR.Has(V,S) ? S[V] :
					WR.Has(V,O) ? O[V] : // It is not currently reasonable to support recursive here
					'${' + V + '}'
			})
		};
		WW.IsArr(Q) && (S = Q.slice(1),Q = Q[0])
		WW.IsArr(S) && !S.length && (S = null)
		return WR.Has(Q,LangNow) ? Solve(LangNow) :
			WR.Has(Q,LangDefault) ? Solve(LangDefault) :
			'${' + Q + (S ? '|' + S.join(':') : '') + '}'
	},
	ErrorS = function(E)
	{
		if (WW.IsObj(E) && WW.IsStr(E.stack))
			E = WR.StartW(E.name,E.stack) ?
				E.stack :
				'<' + E.name + '> ' + E.message + '\n' +
					E.stack.replace(/^(?=\S)/mg,'    ')
		WW.IsObj(E) && (E = WC.OTJ(E))
		return '{ERR} ' + E
	},
	DTS = function(Q){return WW.StrDate(Q).replace(/\.000$/,'')},
	SolveURL = function(Q,S)
	{
		if (WR.StartW('//',Q))
			Q = (WW.MU(/^\w+:(?=\/\/)/,S) || 'http:') + Q
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
	ClassBriefSite = WW.Key(),
	ClassBriefUP = WW.Key(),
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
	MakeSingleBrief = function()
	{
		var
		R = MakeSingle(),
		Site = WV.Rock(ClassBriefSite,'span'),
		UP = WV.Rock(ClassBriefUP,'span'),
		Title = WV.E();
		WV.ClsA(R,WV.Alt)
		WV.Con(R,[Site,UP,Title])
		return {
			R : R,
			U : function(Task,Loading)
			{
				if (Loading)
				{
					WV.T(Site,Task.Site + ' ')
					WV.Clr(UP)
					WV.T(Title,'#' + Task.Row + ' ' + Task.ID)
				}
				else
				{
					WV.T(UP,Task.UP + ' ')
					WV.T(Title,Task.Title || LangSolve('GenUntitle'))
				}
			}
		}
	},
	SingleFill = function(Q,W,A)
	{
		WV.Con(Q,A ?
			[W,MakeHigh(' ● '),A] :
			W)
		WV.Ti(Q,A ?
			W + ' ● ' + A :
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
		return [LangSolve('GenNoRel'),WV.X(Q,'span')]
	},
	MakeAPI = function(V)
	{
		var Param = '';
		if (WW.IsObj(V))
		{
			Param = '=' + WC.B64S(WC.OTJ(WR.Omit(['URL'],V))).replace(/=*$/,'=')
			V = V.URL
		}
		return ConfURLAPI + Param + V.replace(/^(?:https:)?\/\//,'')
	},
	MakeImgURL = function(V)
	{
		return WW.IsObj(V) || Setting.ProxyView ? MakeAPI(V) : SolveURL(V)
	},

	Rainbow = WV.Div(2,1,null,[0,ConfSizeFooter]),
	RMain = WV.Div(2,2,['10%'],[ConfSizeHeader,'100%'],true),
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
	ShortCutGeneralProxyNext = 'GenProxyNext',
	ShortCutGeneralNonAV = 'GenNonAV',
	ShortCutGeneralFocus = 'GenFocusKeywordInput',
	ShortCutGeneralFocusAuth = 'GenFocusAuth',
	ShortCutBrowseSelAll = 'BroSelAll',
	ShortCutBrowseSelAllHis = 'BroSelAllHis',
	ShortCutBrowseSelAllFocus = 'BroSelAllFoc',
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
	SettingIsSPUPLast,SettingIsSPUPSet,
	SettingIsSPUPNormalize = function(V)
	{
		return WR.Up(WR.Trim(V).replace(/^\w+:\/\//,''))
	},
	SettingIsSPUP = function(V)
	{
		if (!V || !WW.IsStr(V)) return
		if (SettingIsSPUPLast !== (SettingIsSPUPLast = Setting.SPUP))
		{
			SettingIsSPUPSet = TopSet ? WW.Set() : {}
			WR.Each(function(V)
			{
				V = SettingIsSPUPNormalize(V)
				TopSet ? WW.SetAdd(SettingIsSPUPSet,V) : SettingIsSPUPSet[V] = 9
			},SettingIsSPUPLast.split('\n'))
		}
		V = SettingIsSPUPNormalize(V)
		return TopSet ? WW.SetHas(SettingIsSPUPSet,V) : WR.Has(V,SettingIsSPUPSet)
	},
	SettingProxyCandLast,SettingProxyCandCache = [],
	SettingProxyCand = function()
	{
		if (SettingProxyCandLast !== (SettingProxyCandLast = Setting.ProxyCand))
		{
			SettingProxyCandCache = WR.Match(/^.+:\d+$/mg,SettingProxyCandLast)
		}
		return SettingProxyCandCache
	},
	BrowserOnProgress,
	TickQueue = [],
	Tick = function(Q){TickQueue.push(Q)},
	RStatusBar = WV.Div(2,[0,'10%'],true),
	RStatus = WV.Rock(),
	RSpeed = WV.Rock(),

	DBBriefKeyCache,DBBriefKeyCacheTask,
	DBBriefKey = function(Task)
	{
		return DBBriefKeyCacheTask === (DBBriefKeyCacheTask = Task) ?
			DBBriefKeyCache :
			DBBriefKeyCache = Task.Site + '|' + Task.ID
	},
	DBBriefInitNoti = Noti.O(),
	DBBriefInitSpeed,
	DBBriefInitTimer,
	DBBriefVer = 0,
	DBBriefHot = [],
	DBBriefHist = [],
	DBBriefDiff = WW.Bus(),
	DBBriefDiffQueue = [],
	DBBriefDiffState,
	DBBriefDiffForward = function(Data)
	{
		if (DBBriefDiffState)
			if (DBBriefDiffState < Data.Ver)
			{
				DBBriefDiffState = DBBriefVer = Data.Ver
				DBBriefDiff.Emit(WSProtoCurrentID,Data)
			}
		else DBBriefDiffQueue.push(Data,WSProtoCurrentID)
	},
	DBBriefDiffRelease = function(F)
	{
		DBBriefDiffState = F
		for (F = 0;F < DBBriefDiffQueue.length;F += 2)
			if (DBBriefDiffState < DBBriefDiffQueue[F].Ver)
			{
				DBBriefDiffState = DBBriefVer = DBBriefDiffQueue[F].Ver
				DBBriefDiff.Emit(DBBriefDiffQueue[1 + F],DBBriefDiffQueue[F])
			}
		DBBriefDiffQueue.length = 0
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

	WSSolveJSON = function(Q)
	{
		var R = WW.Try(WC.JTO,[Q]);
		return WW.TryE === R ?
			DebugLog('JSON',Q) :
			R
	},
	WSActPlain,
	WSActAuth,
	WSOnline,WSOnlineAt,
	WSAuthInited,WSAuthSeed,
	WSCipher,WSDecipher,
	WSProtoCurrentID,
	WSRetry = 0,
	WSEndSince = 0,
	WSProxyMap = {},
	WSNotConnectedNoti = Noti.O(),
	WSNotConnected = function(){WSNotConnectedNoti(LangSolve('ErrOff'))},
	WSNotAuthedNoti = Noti.O(),
	WSNotAuthed,
	WSSend = WSNotConnected,
	WSAuthPrecheck = function(){return WSCipher || WSNotAuthed()},
	WSNoti = Noti.O(),
	WSTick = WW.To(3E5,function(){WSSend(Proto.Tick)},true).F(),
	TokenStepA = function(Q){return WC.HSHA512(Q,'j!ui+Ju8?j')},
	TokenStepB = function(Q){return WC.HSHA512('!(|[.:O9;~',Q)},
	WS = WB.WS(
	{
		Rect : false,
		Beg : function()
		{
			WSRetry && WSNoti(LangSolve('SocConn') + ' ' + LangSolve('SocRetry') + ' : ' + WSRetry)
		},
		Hsk : function()
		{
			WSOnline = true
			WSOnlineAt = WW.Now()
			DebugLog('Online')
			WSRetry && WSNoti(LangSolve('SocOn'))
			WSNoti(false)
			WSRetry = 0
			WSSend = function(ID,Data)
			{
				var R;
				if (WR.Has(ID,ProtoIsAuth))
				{
					if (!WSCipher)
						return WSNotAuthed()
					R = ProtoMsgMake(ID,Data)
					R = WC.Con([[ProtoMsgTypeAuth],WSCipher.D(WC.Slice(R,1))])
				}
				else R = ProtoMsgMake(ID,Data)
				WS.D(R)
				if (Proto.DBBrief !== ID &&
					Proto.Tick !== ID)
					DebugProto.unshift([true,ProtoInv[ID],Data]) < ConfDebugLimitObj || DebugProto.pop()
				return true
			}
			WSNotConnectedNoti(false)
			WSTick.D()
			WSSend(Proto.DBBrief,{Ver : DBBriefVer,Limit : ConfDBPageSize,GZ : true})
		},
		Bin : function(Q)
		{
			var
			Type = Q[0],
			Check = 0,
			UVM = 1,
			T,F = 1;

			if (ProtoMsgTypeBrief === Type)
			{
				ProgressMap = {}
				for (;F < Q.length;)
				{
					for (UVM = 1,Type = 0;
						Type += UVM * (127 & Q[F]),
						127 < Q[F++]
					;) UVM *= 128
					for (UVM = 1,Check = 0;
						Check += UVM * (127 & Q[F]),
						127 < Q[F++]
					;) UVM *= 128
					for (UVM = 1,T = 0;
						T += UVM * (127 & Q[F]),
						127 < Q[F++]
					;) UVM *= 128
					ProgressMap[Type] = [Check,T]
				}
				WSOnProgress()
				WSSend(Proto.Tick)
				return
			}

			if (ProtoMsgTypeAuth === Type)
			{
				Q = WSDecipher.D(WC.Slice(Q,1))
				F = 0
			}
			else if (ProtoMsgTypePlain !== Type)
			{
				DebugLog('Proto','Bad Message Type ' + Type)
				return WS.F()
			}
			for (WSProtoCurrentID = 0;
				WSProtoCurrentID += UVM * (127 & Q[F]),
				127 < Q[F++]
			;) UVM *= 128
			for (UVM = 1;
				Check += UVM * (127 & Q[F]),
				127 < Q[F++]
			;) UVM *= 128
			if (WSProtoCurrentID + Q.length - F - Check)
			{
				DebugLog('Proto','Bad Check ' + WC.OTJ([WSProtoCurrentID,Q.length,F,Check]))
				WS.F()
			}
			else if (Type = (ProtoMsgTypeAuth === Type ? WSActAuth : WSActPlain)[WSProtoCurrentID])
				try
				{
					Q = ProtoDec(WSProtoCurrentID,WC.Slice(Q,F))
					if (Proto.DBBrief !== WSProtoCurrentID &&
						Proto.AuthCookie !== WSProtoCurrentID)
					{
						DebugLog('Proto.' + ProtoInv[WSProtoCurrentID],Q)
						DebugProto.unshift([false,ProtoInv[WSProtoCurrentID],Q]) < ConfDebugLimitObj || DebugProto.pop()
					}
					Type(Q)
				}
				catch(E){DebugLog('Proto.' + ProtoInv[WSProtoCurrentID],ErrorS(E))}
		},
		End : function()
		{
			if (DBBriefInitTimer)
			{
				DBBriefInitNoti(false)
				DBBriefInitTimer.F()
			}
			DBBriefInitSpeed =
			DBBriefInitTimer = null
			DBBriefDiffQueue.length = 0
			DBBriefHot = []
			DBBriefHist = []
			WSSend = WSNotConnected
			WSAuthInited =
			WSCipher = WSDecipher = false
			CookieMap = {}
			WR.Each(function(V)
			{
				V.E(LangSolve('ErrOff'))
			},WSProxyMap)
			WSProxyMap = {}
			DebugLog('Offline',WSRetry)
			if (WSOnline)
				WSEndSince = WW.Now()
			else
				WSNoti(LangSolve('SocOff',[WW.StrDate(WSEndSince),WSRetry++]))
			NotiAuth(false)
			WSOnOffline.D()
			WSTick.F()
			WW.To(WSOnline ? 0 : ConfRetry,WS.C,WSOnline = false)
		}
	}),
	WSOnProgress,
	WSOnDBKey,
	WSOnDB,
	WSOnAuthing = WW.BusS(),
	WSOnOffline = WW.BusS(),
	WSOnDBBriefHot,
	WSOnDBBriefHist,
	WSOnHist,
	WSOnRenew,
	WSOnTitle,
	WSOnSize,
	WSOnTaskErr,
	WSOnErr,
	WSOnCookie,
	WSOnSC,
	WSOnSetting,
	WSOnSettingProxy,

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
	SiteKeyMapTree = WW.Key(),
	SiteOnNoti = function()
	{
		WW.Now() - SiteBegin < 1000 ||
			SiteNoti([LangSolve('SocSite') + ' ',SiteCount,' / ',SiteTotal,' ',(WW.Now() - SiteBegin),'ms'])
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
		return S ? S.Name || S.ID : LangSolve('GenUnknown',[Q])
	},
	SiteInitMTSortJumpInner = 1,
	SiteInitMTSortJumpSeg = 2,
	SiteInitMT = function(AC,Word,V,Sort,IsTop)
	{
		var
		IsLow,
		SegStart = 0,
		S,
		T,F = 0;
		for (;F < Word.length;++F)
		{
			T = Word.charCodeAt(F)
			IsLow = 96 < T && T < 123
			IsLow ?
				T -= 32 :
				SegStart = F
			S = Sort | (SegStart < F && SiteInitMTSortJumpInner) | (SegStart && SiteInitMTSortJumpSeg)
			if (!IsTop || !IsLow)
			{
				T = AC[T] || (AC[T] = WW.MakeO(SiteKeyMapTree,[]))
				WR.Has(V.Name[0],T[SiteKeyMapTree]) ||
					(T[SiteKeyMapTree][V.Name[0]] = T[SiteKeyMapTree].push([S,V]))
				SiteInitMT(T,Word.slice(-~F),V,S,false)
			}
		}
	},
	SiteInit = function(/**@type {CrabSaveNS.SiteView}*/ Site)
	{
		Site.Judge || (Site.Judge = /(?!)/)
		Site.Cookie || Site.Sign && (Site.Cookie = Site.ID)
		Site.Min && WW.IsStr(Site.Min) && (Site.Min = Site.Min.split(' '))
		Site[SiteKeyMapTree] = {}
		WR.Each(function(B)
		{
			WW.IsArr(B.Name) || (B.Name = [B.Name])
			WR.Each(function(N)
			{
				SiteInitMT(Site[SiteKeyMapTree],N,B,0,true)
			},B.Name)
			WR.EachU(function(V,F)
			{
				WW.IsStr(V) && (B.Example[F] =
				{
					As : 'Val',
					Val : V
				})
			},B.Example)
			WW.IsRExp(B.Judge) && (B.Judge = [B.Judge])
		},Site.Map)
		Site.IDView || (Site.IDView = WR.Id)
		WR.Each(function(B){SiteMap[WR.Up(B)] = SiteMap[B] = Site},
			[Site.ID].concat(Site.Name || [],Site.Alias = Site.Alias ? Site.Alias.split(' ') : []))
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
					TaskOverviewRequiring[Row].E(LangSolve('LstTwice',[Row]))
				if (WSSend(Proto.TaskOverview,{Row : Row}))
				{
					TaskOverviewRequiring[Row] = O
				}
				else O.E(LangSolve('ErrOff'))
				return function()
				{
					WR.Del(Row,TaskOverviewRequiring)
				}
			})
	},
	TaskOverviewUpdate = function(Data)
	{
		if (Data.Task)
		{
			TaskOverviewList.push(Data.Row)
			if (ConfCacheLimit < TaskOverviewList.length)
				WR.Del(TaskOverviewList.shift(),TaskOverviewCache)
			TaskOverviewCache[Data.Row] = Data
			if (WR.Has(Data.Row,TaskOverviewRequiring))
				TaskOverviewRequiring[Data.Row].D(Data.Task).F()
		}
		else
			if (WR.Has(Data.Row,TaskOverviewRequiring))
				TaskOverviewRequiring[Data.Row].E(Data.Err)
	},
	TaskRenewing = {},
	TaskFullInfoRow,
	TaskFullInfoO,
	TaskFullInfoLoad = function(Row)
	{
		return WX.Provider(function(O)
		{
			TaskFullInfoO && TaskFullInfoO.E(LangSolve('DetCancel'))
			TaskFullInfoO = false
			if (WSSend(Proto.AuthTaskInfo,{Row : Row}))
			{
				TaskFullInfoRow = Row
				TaskFullInfoO = O
			}
			else O.E(LangSolve(WSOnline ? 'ErrNoAuth' : 'ErrOff'))
		})
	},
	TaskFullInfoUpdate = function(Data)
	{
		if (TaskFullInfoRow === Data.Row && TaskFullInfoO)
		{
			if (Data.Task)
				TaskFullInfoO.D(Data.Task)
			else
			{
				TaskFullInfoO.E(Data.Err)
				TaskFullInfoO = false
			}
		}
	},

	RecordErrList = [],
	WSOnErrFile = function(Data)
	{
		if (Data.JSON)
		{
			if (Data = WSSolveJSON(Data.JSON))
				CrabSave.Err = RecordErrList = Data
		}
		else RecordErrList.push(Data)
	},

	OverlayOn,
	OverlayEnd = WX.EndL(),
	OverlayMake = function(H)
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
			false === Size ?
				'-' :
				Has < Size ?
					WR.ToFix(2,100 * Has / Size) :
					100,
			false === Size ?
				'-' :
				WR.ToSize(Has),
			false === Size ?
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
	DetailUpdateForward = function(Data)
	{
		DetailIs(Data.Row) && DetailUpdate.U(Data)
	},
	DetailMake = function(/**@type {CrabSaveNS.TaskBriefHist}*/ Q,S,E)
	{
		OverlayMake(function(Y)
		{
			var
			Site = SiteMap[Q.Site],
			PartMap = {},
			Header = WV.Rock(ClassHeader),
			Title = WV.Rock(),
			SiteID = WV.X(
			[
				SiteSolveName(Q.Site),' ',
				Site && Site.IDView ?
					Site.IDView(Q.ID) :
					Q.ID
			]),
			Detail = WV.Rock(),
			Part = WV.Rock(),
			ErrReq = WV.Rock(WV.FmtW + ' ' + WV.None),
			Err = WV.Rock(WV.FmtW + ' ' + WV.None),
			TaskKeyFileDone = WW.Key(),
			LineKeyEle = 0,
			LineKeySolve = 1,
			LineKeyTextNode = 2,
			LineFileCount,
			LineDone,
			Line =
			[
				[LangSolve('DetRow'),WR.Const(Q.Row)],
				[LangSolve('DetBirth'),function(S)
				{
					return WR.Has('Birth',S) &&
						WW.StrDate(S.Birth)
				}],
				[LangSolve('DetUp'),function(S)
				{
					return S.UP
				}],
				[LangSolve('DetDate'),function(S)
				{
					return WR.Has('UPAt',S) &&
						WW.StrDate(S.UPAt)
				}],
				[LangSolve('DetPartC'),function(S)
				{
					return S.Part && S.Part.length
				}],
				LineFileCount = [LangSolve('DetFileC'),function(S)
				{
					return WR.Has('File',S) && S[TaskKeyFileDone] + ' / ' + S.File
				}],
				[LangSolve('DetRoot'),function(S)
				{
					return S.Root
				}],
				LineDone = [LangSolve('DetDone'),function(S)
				{
					return S.Done &&
						WW.StrDate(S.Done) +
							(!Birth ? '' :
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
				S[TaskKeyFileDone] = WR.Reduce(function(D,V)
				{
					return D + !!V.Done
				},0,S.Down)
				WR.Each(function(V,T)
				{
					if (!V[LineKeyTextNode])
					{
						V[LineKeyEle] = WV.Con(WV.Rock(),
						[
							MakeHigh(V[LineKeyEle] + ' '),
							V[LineKeyTextNode] = WV.E()
						])
					}
					T = V[LineKeySolve](S)
					if (null == T || false == T)
						WV.Del(V[LineKeyEle])
					else
					{
						WV.T(V[LineKeyTextNode],T)
						WV.Ap(V[LineKeyEle],Detail)
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
							'. ' + LangSolve('DetRun') + ' ','P',
							'. ' + LangSolve('DetFirst') + ' ','C',
							'\n' + LangSolve('DetTake') + ' ','T',
							'. ' + LangSolve('DetAvg') + ' ','V',
							'\n' + LangSolve('DetDone') + ' ','D',
						]);
						if (!PartList[V.Part])
							PartList[V.Part] = []
						if (!F || V.Part !== S.Down[~-F].Part)
						{
							WV.Ap(WV.Con(WV.Rock(),
							[
								MakeHigh(LangSolve('DetPart') + ' '),
								WR.Has(V.Part,ConfPartSpecialType) ?
									LangSolve(ConfPartSpecialTypeLang[ConfPartSpecialType[V.Part]]) :
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
						WV.T(Name,V.Path || '\xA0')
						Prog
							.P(V.Play || '-')
							.G(MakeProgress(WR.Has('Size',V) && V.Size,V.Has))
							.C(V.First ? WW.StrDate(V.First) : '-')
							.T(V.Take ? WW.StrMS(V.Take) : '-')
							.V(V.Take ? MakeSpeed(V.Has / V.Take) : '-')
							.D(V.Done ? WW.StrDate(V.Done) : '-')
						WV.ApR([URL,Name,Prog],U)
						WV.Ap(U,Part)
						PartList[V.Part][V.File] = WW.MakeO
						(
							Proto.AuthDownFile,function(Data)
							{
								Prog.G(MakeProgress(V.Size = Data.Size,V.Has))
							},
							Proto.AuthDownPlay,function(Data)
							{
								V.Play = Data.Play
								Prog.P(Data.Play)
							},
							Proto.AuthDownConn,function(Data)
							{
								V.First = Data.First
								Prog.C(WW.StrDate(Data.First))
							},
							Proto.AuthDownPath,function(Data)
							{
								V.Path = Data.Path
								WV.T(Name,Data.Path)
							},
							Proto.AuthDownHas,function(Data)
							{
								Prog.G(MakeProgress(V.Size,V.Has = Data.Has))
								V.Task = Data.Take
								Prog.T(WW.StrMS(Data.Take))
									.V(MakeSpeed(V.Has / (Data.Take || 1)))
							},
							Proto.AuthDownTake,function(Data)
							{
								Prog.T(WW.StrMS(V.Take = Data.Take))
									.V(MakeSpeed(V.Has / (Data.Take || 1)))
							},
							Proto.AuthDownDone,function(Data)
							{
								if (!V.Done)
								{
									V.Done = Data.Done
									++S[TaskKeyFileDone]
									WV.T(LineFileCount[LineKeyTextNode],LineFileCount[LineKeySolve](S))
								}
								Prog.D(WW.StrDate(Data.Done))
							}
						)
					},S.Down)
				}
			},
			OnError = function(E)
			{
				WW.IsArr(E) && (E = LangSolve(E))
				WV.T(Err,null == E ? '' : ErrorS(E))
				;(null == E ? WV.ClsA : WV.ClsR)(Err,WV.None)
			};
			WV.ApA([Title,SiteID],Header)
			Site && Site.IDURL &&
				WV.Ap(WV.X(Site.IDURL(Q.ID)),Header)
			Update(S)
			WV.ApA([Header,Detail,ErrReq,Err,Part],Y)
			WV.ClsA(Y,ClassDetail)
			E && OnError(E)
			DetailUpdate =
			{
				O : Q.Row,
				S : Update,
				E : OnError,
				U : function(Data)
				{
					var P;
					P = PartList[Data.Part]
					P = P && P[Data.File]
					P && P[WSProtoCurrentID](Data)
				},
				F : function(Done)
				{
					WV.T(LineDone[LineKeyTextNode],LineDone[LineKeySolve](Done))
					WV.Ap(LineDone[LineKeyEle],Detail)
				}
			}
			return WX.EndI(
			[
				TaskFullInfoLoad(Q.Row).Now(Update,function(E)
				{
					WV.T(ErrReq,LangSolve('LstFail') + '\n' + ErrorS(E))
					WV.ClsR(ErrReq,WV.None)
				}),
				function()
				{
					WSSend(Proto.AuthTaskInfo)
				}
			])
		})
	},

	MakeConfirm = function(Title,Body,No,Yes,H)
	{
		OverlayMake(function(Y)
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
		MakeConfirm(LangSolve('LstDelConfirm'),LangSolve('LstDelCount',[Q.length]),
			LangSolve('GenCancel'),LangSolve('LstRemove'),
			function(){WSSend(Proto.AuthTaskRemove,{Row : Q})})
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
				WW.Quo(WR.ToSize(Size) + (Plus ? '+' : '')) +
				LangSolve('StsSelect',[Count]) +
				(Plus ? LangSolve('StsPlus',[Plus]) : '') :
				null)
			return Count
		};
		return {
			C : Update,
			A : function(Q)
			{
				++Count
				WR.Has('Size',Q) ?
					Size += Q.Size :
					++Plus
			},
			D : function(Q)
			{
				--Count
				WR.Has('Size',Q) ?
					Size -= Q.Size :
					--Plus
			},
			I : function(Q,S)
			{
				WR.Has('Size',Q) ?
					Size -= Q.Size :
					--Plus
				WR.Has('Size',S) ?
					Size += S.Size :
					++Plus
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
		WV.T(RSpeed,WW.Quo(Active) + MakeSpeed(Speed))
	},



	DebugProto = [],
	DebugCount = 0,
	DebugView = WV.Rock(),
	DebugCurrent = [],
	DebugLog = function(Q)
	{
		var T,F = 0;
		Q = WW.StrDate() +
			' | ' +
			WW.Tick() +
			' #' + DebugCount++ +
			' [' + Q + ']'
		for (;++F < arguments.length;)
			if (null != (T = arguments[F]))
			{
				T = WW.IsObj(T) ? WC.OTJ(T) : String(T)
				T.length < 512 || (T = T.slice(0,512) + '...')
				Q += ' ' + T
			}
		DebugCurrent.push(WV.Pre(WV.X(Q),DebugView))
		DebugCurrent.length < ConfDebugLimit ||
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
			ConfDebugClick < Last.length && Last.shift()
			Last.length < ConfDebugClick ||
				WR.Last(Last) - Last[0] < ConfDebugInterval &&
				DebugMake(Last)
		},Target)
	},
	DebugMake = function(Last)
	{
		DebugIn || OverlayMake(function(Y)
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

	LangTo(Conf.Lang)

	WV.ClsA(RMain[1],WV.NoSel)
	WV.Text(WV.VM(RMain[1]),LangSolve('Title'))
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
		'.`U`{float:right;pointer-events:none}' +
		'.`G`{margin:`p`px 0}' +
		'.`P`{padding:`p`px}' +
		'.`H`{color:#2672EC}' +
		'.`F`>.`H`{color:inherit}' +
		'.`I`{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
		'.`BS`,.`BU`{font-weight:bold}' +
		'.`BU`{color:#ECA100}' +

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
			BS : ClassBriefSite,
			BU : ClassBriefUP,
			K : ClassTask,
			Y : ClassOverlay,
			R : ClassHeader,
			E : ClassDetail,
			ET : ClassDetailPart,
			Q : ClassConfirm,
			V : WV.ID(RStatusBar[1]),
			X : WV.ID(RStatusBar[2]),

			p : ConfPadding,
			h : ConfPaddingHalf,
			q : ConfPaddingQuarter
		}
	))

	RTab.Add(
	[
		[LangSolve('Bro'),function(V,_,K)
		{
			var
			ClassHintSite = WW.Key(),
			ClassHintAct = WW.Key(),
			ClassHintID = WW.Key(),
			ClassHintFuzzy = WW.Key(),
			ClassBrief = WW.Key(),
			ClassList = WW.Key(),
			ClassCard = WW.Key(),
			ClassCardGroup = WW.Key(),
			ClassCardContent = WW.Key(),
			ClassCardUP = WW.Key(),
			ClassCardClick = WW.Key(),
			ClassCardBar = WW.Key(),
			ClassImgMulti = WW.Key(),
			ClassImgMultiLR = WW.Key(),

			GoKeyWord,
			GoSite,GoAction,GoID,
			GoPref,GoPrefAction,
			Go = function()
			{
				var
				Q = Keyword.V(),
				T;
				if (WW.IsStr(Q))
				{
					T = SolveInput(Q)
					if (WW.IsStr(T))
						return Noti.S(T)
					Q = T[0]
				}
				if (Q.Fuzzy && false !== Q.Act.JudgeVal)
				{
					return false
				}
				else
				{
					Jump(0,Q.Site,Q.Act,Q.ID,Q.Inp)
					Keyword.Foc()
				}
			},
			SolveID = function(S,Q)
			{
				return false === S.JudgeVal ? '' :
					S.JudgeMap ? S.JudgeMap(Q) :
					2 < Q.length ? Q.slice(1).join(WR.Default('#',S.Join)) :
					Q[~-Q.length]
			},
			/*
			GoSolve = Unsafe.GoSolve = function(Q)
			{
				var Site,Action,ID,T;
				Q = Q.replace(/\s+$/,'')
				if (T = Q.match(/^\s*([A-Z\u2E80-\u9FFF\uAC00-\uD7FF\uF900-\uFAFF]+|\?)(?:\s+([^]*))?$/i))
				{
					if (!WR.Has(Site = WR.Up(T[1]),SiteMap)) return LangSolve('BroUnSite',[T[1]])
					Site = SiteMap[Site]
					T = T[2] || ''
				}
				else
				{
					T = Q
					Site = WR.Find(function(V){return V.Judge.test(Q)},SiteAll)
					if (!Site) return LangSolve('BroUnParse',[Q])
				}
				Action = WR.Find(function(V)
				{
					return WR.Any(function(B)
					{
						B = B.exec(T)
						ID = B && SolveID(V,B)
						return B
					},V.Judge)
				},Site.Map)
				return Action ?
					[Site,Action,WR.Trim(ID),Q.slice(0,-ID.length)] :
					LangSolve('BroUnSol',[T,SiteSolveName(Site)])
			},
			*/
			/*
				Overall there are three types of input
				URL | Special Formatted Phrase
					Site.Judge Map.Judge
				<Site> <SiteSub>
					Map.Judge
				<Site> <Action> <Value>
					Map.JudgeVal
			*/
			SolveInput = Unsafe.SolveInput = function(Q,Fuzzy)
			{
				var
				/**@type {
				{
					Site : CrabSaveNS.SiteView
					Act : CrabSaveNS.SiteMap
					Fuzzy : boolean
					Inp : string
					InpSite : string
					InpAct : string
					ID? : string
				}[]}*/
				Cand = [],
				SolveKey = function(Q)
				{
					var T = /^\s*([A-Z\u2E80-\u9FFF\uAC00-\uD7FF\uF900-\uFAFF]+|\?)(\s+|$)/i.exec(Q);
					return T &&
					[
						T[0],
						T[1],
						T[2],
						Q.slice(T[0].length)
					]
				},
				SolveInTree = function(Site,K)
				{
					var R,F;
					R = Site[SiteKeyMapTree]
					K = WR.Up(K)
					for (F = 0;R && F < K.length;++F)
						R = R[K.charCodeAt(F)]
					return R && R[SiteKeyMapTree]
				},
				SolveInSite = function(/**@type {CrabSaveNS.SiteView}*/ Site,Prefix,Inp)
				{
					var
					ActCand,
					ActMatch = [],
					ActHit = {},
					K,T;
					if (Prefix && (K = SolveKey(Inp)))
					{
						WR.Each(function(V)
						{
							var
							ID = K[3],
							Valid = ID,
							T = V[1].JudgeVal;
							if (false === T)
							{
								Valid = !ID
								ID = ''
							}
							else if (T && (Valid = T.exec(ID)))
								ID = SolveID(V[1],Valid)
							if (Valid)
							{
								ActMatch.push([V[0],
								{
									Site : Site,
									Act : V[1],
									Fuzzy : false,
									Inp : Q,
									InpSite : Prefix,
									InpAct : Prefix + K[0],
									ID : ID
								}])
								ActHit[V[1].Name[0]] = true
							}
						},ActCand = SolveInTree(Site,K[1]))
					}
					if (ActMatch.length)
					{
						ActMatch.sort(function(Q,S)
						{
							return Q[0] - S[0] ||
								Q[1].Act.Name[0].localeCompare(S[1].Act.Name[0])
						})
						WR.Each(function(V){Cand.push(V[1])},ActMatch)
					}
					else if (Site)
					{
						WR.Each(function(V)
						{
							if (WR.Any(function(B)
							{
								return (B = B.exec(Inp)) && (T = SolveID(V,B),9)
							},V.Judge))
							{
								Cand.push(
								{
									Site : Site,
									Act : V,
									Fuzzy : false,
									Inp : Q,
									InpSite : Prefix,
									InpAct : Prefix,
									ID : T
								})
								ActHit[V.Name[0]] = true
							}
						},Site.Map)
					}
					if (Fuzzy && Prefix)
					{
						if (!Inp && /\s$/.test(Prefix))
							ActCand = Site.Map
						else if (!K || K[3])
							ActCand = null
						ActCand && WR.Each(function(V)
						{
							WW.IsArr(V) && (V = V[1])
							WR.Has(V.Name[0],ActHit) || Cand.push(
							{
								Site : Site,
								Act : V,
								Fuzzy : true,
								Inp : Q,
								InpSite : Prefix,
								InpAct : Prefix + V.Name[0] + (false === V.JudgeVal ? '' : ' ')
							})
						},ActCand)
					}
				},
				TopKey,
				TopSite;

				TopKey = SolveKey(Q)
				TopKey && (TopSite = SiteMap[WR.Up(TopKey[1])]) ?
					SolveInSite(TopSite,TopKey[0],TopKey[3]) :
					WR.Each(function(V)
					{
						V.Judge && V.Judge.test(Q) && SolveInSite(V,'',Q)
					},SiteAll)

				return Cand.length ? Cand :
					TopKey ?
						WR.Has(WR.Up(TopKey[1]),SiteMap) ?
							LangSolve('BroUnSol',[TopKey[3],SiteSolveName(TopSite)]) :
							LangSolve('BroUnSite',[TopKey[1]]) :
						LangSolve('BroUnParse',[Q])
			},

			Bar = [],
			BarMap = MultiMap(),
			BarNone = 0,
			BarCold = 1,
			BarHot = 2,
			BarHistory = 3,
			BarAddOptHis = 1,
			BarAddOptFocus = 2,
			MakeBar = function(Site,Q,V)
			{
				var
				ID = DBBriefKey({Site : Site.ID,ID : Q.ID}),
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
							WV.T(B,LangSolve('BroAdd'))
						}
						else if (BarCold === State)
						{
							WV.T(B,LangSolve('BroCold'))
							WV.ClsA(V,WV.Foc)
						}
						else if (BarHot === State)
						{
							WV.T(B,LangSolve('BroHot'))
							WV.ClsA(V,WV.Foc)
						}
						else if (BarHistory === State)
						{
							WV.T(B,LangSolve('BroHist'))
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
					A : function(Opt)
					{
						(BarNone === State || BarHistory === State && BarAddOptHis & Opt) &&
							(!(BarAddOptFocus & Opt) || SettingIsSPUP(Q.UP) || SettingIsSPUP(Q.UPURL)) &&
							Add()
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
					StatusSet(K,LangSolve('GenLoading'))
					BriefKeyword.K(Key)
						.S(SiteSolveName(Site))
						.A(Action.Name[0])
						.I(ID)
						.U(LangSolve('GenLoading'))
					JumpEnd(Action.View(ID,Q,Action === GoPrefAction ? GoPref : undefined).Now(function(/**@type {CrabSaveNS.SitePage}*/S)
					{
						var
						// stackoverflow.com/a/5008241
						// martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically
						HSVToRGB = function(H,S,V)
						{
							var
							I = 0 | 6 * H,
							T = 6 * H - I,
							A = (1 - S) * (V *= 256),
							B = (1 - T * S) * V,
							C = (1 - (1 - T) * S) * V;
							return '#' + WC.HEXS(
							[
								[V,C,A],
								[B,V,A],
								[A,V,C],
								[A,B,V],
								[C,A,V],
								[V,A,B]
							][I])
						},
						RndColorParam,
						RndColorKey,
						RndColorCurrent,
						RndColorGet = function(Key)
						{
							if (Key !== RndColorKey)
							{
								RndColorKey = Key
								RndColorParam = null == RndColorParam ?
									Math.random() :
									(RndColorParam + (Math.sqrt(5) - 1) / 2) % 1
								RndColorCurrent = HSVToRGB(RndColorParam,.99,.99)
							}
							return RndColorCurrent
						};
						StatusSet(K)
						WV.Clear(List)
						Bar.length = 0
						BarMap.C()
						S.Size = S.Size || ConfPageSize
						WR.EachU(function(V,F)
						{
							var
							NonDownload = V.Non || V.NonAV && !Setting.NonAV,
							IDView = V.View || (V.Non ? V.ID : Site.IDView(V.ID)),
							URL = V.URL || false !== V.URL && Site.IDURL,
							Click = WV.Rock(ClassCardClick),
							Img = WV.A('img'),
							ImgMulti = WV.Rock(ClassImgMulti),
							ImgMultiShow = WV.Rock(),
							ImgMultiL = WV.But(
							{
								The : WV.TheP,
								C : function(){ImgTo(~-ImgCurrent)}
							}),
							ImgMultiR = WV.But(
							{
								The : WV.TheP,
								C : function(){ImgTo(-~ImgCurrent)}
							}),
							ImgCurrent,
							ImgTo = function(Q)
							{
								ImgCurrent = V.Img.length
								ImgCurrent = (ImgCurrent + Q % ImgCurrent) % ImgCurrent
								WV.Attr(Img,'src',MakeImgURL(V.Img[ImgCurrent]))
								WV.T(ImgMultiShow,WW.ShowLI(V.Img.length,ImgCurrent))
							};
							if (WW.IsFunc(URL))
								URL = URL(V.ID)
							if (WW.IsArr(V.Img) && V.Img.length < 2)
								V.Img = V.Img[0]
							if (V.Img)
							{
								if (WW.IsArr(V.Img))
								{
									ImgTo(0)
									WV.CSS(ImgMultiL.R,'left',0)
									WV.ClsA(ImgMultiL.R,ClassImgMultiLR)
									WV.CSS(ImgMultiR.R,'right',0)
									WV.ClsA(ImgMultiR.R,ClassImgMultiLR)
								}
								else
									WV.Attr(Img,'src',MakeImgURL(V.Img))
							}
							WV.Ap(WV.Con(WV.Rock(ClassCard + ' ' + WV.S4,'fieldset'),
							[
								WV.Con(WV.A('legend'),
								[
									V.Index = WR.Default(S.Size * Q + F,V.Index),
									' | ',
									URL ? WV.Ah(IDView,URL,V.Title) : IDView,
								]),
								!!V.Group && WV.CSS(WV.Rock(ClassCardGroup),'background',RndColorGet(V.Group)),
								WV.Con(WV.Rock(ClassCardContent),
								[
									WV.Con(Click,
									[
										V.Img && Img
									]),
									WW.IsArr(V.Img) && WV.ApR(
									[
										ImgMultiShow,
										ImgMultiL,
										ImgMultiR
									],ImgMulti),
									!!V.Len && WW.IsNum(V.Len) ?
										WV.X(WW.StrS(V.Len)) :
										WW.IsStr(V.Len) &&
											WV.X(/^\d+(:\d+){1,2}$/.test(V.Len) ?
												WW.StrS(WR.Reduce(function(D,V){return 60 * D - -V},0,V.Len.split(':'))) :
												V.Len),
									V.TitleView ?
										WV.Con(WV.Rock(WV.FmtW),V.TitleView) :
										!!V.Title && WV.T(WV.Rock(WV.FmtW),V.Title),
									WV.ClsA
									(
										WV.X(V.UPURL ?
											WV.Ah(V.UP,V.UPURL) :
											V.UP),
										ClassCardUP
									),
									!!V.Date && WV.X(function(Q)
									{
										var R;
										if (WW.IsStr(Q))
										{
											R = new Date(Q)
											R = WW.IsNaN(+R) ? Q : DTS(R)
										}
										else R = DTS(Q)
										return R
									}(V.Date)),
									!!V.Desc && WV.But(
									{
										X : LangSolve('BroDesc'),
										The : WV.TheP,
										C : function()
										{
											OverlayMake(function(Y)
											{
												WV.Con(Y,
												[
													WV.T(WV.Rock(ClassHeader),SiteSolveName(Site) + ' ' + IDView),
													WV.T(WV.Rock(WV.FmtW),V.Desc)
												])
											})
										}
									}).R,
									!!V.More && WV.Con
									(
										WV.Rock(WV.FmtW),
										WW.IsArr(V.More) ?
											WR.MapU(function(B,F)
											{
												return B && -~F < V.More.length && WW.IsStr(B) ?
													B + '\n' :
													B
											},V.More) :
											V.More
									)
								])
							]),List)
							NonDownload || MakeBar(Site,V,Click)
							NonDownload && Img && URL && WV.On('click',function()
							{
								Keyword.V(URL)
								Go()
							},Img)
						},S.Item)
						S.At = WR.Default(Q,S.At)
						S.Max = WR.Default(
							S.Item.length - S.Len ?
								Math.ceil(S.Len / S.Size) || 1 :
								1,
							S.Max)
						BriefKeyword.U(WW.Fmt
						(
							'`F`~`T`. `I` `L`/`U`. `G` `A`/`P`. `M`s (`D`)',
							{
								F : S.Item.length && S.Item[0].Index,
								T : S.Item.length && WR.Last(S.Item).Index,
								I : LangSolve('BroItem'),
								L : S.Item.length,
								U : S.Len = WR.Default(WR.Max(0,~-S.Max) * S.Size + S.Item.length,S.Len),
								G : LangSolve('BroPage'),
								A : S.At,
								P : S.Max,
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
			KeywordHintLoad = WV.Fmt(LangSolve('BroSugLoad',['`K`']) + '\n`E`'),
			KeywordHint = WV.Fmt(LangSolve('BroSugDone',['`K`']) + '\n[`M`ms `T`] `D`'),
			HintErr,HintCurrent,
			Hint = function(Q)
			{
				var
				S = WW.IsStr(Q) ? SolveInput(Q,true) : [Q],
				S0,
				K,B,C;
				HintErr = false
				if (WW.IsArr(S) && !(S0 = S[0]).Fuzzy && S0.Act.Hint)
				{
					C = HintCurrent = WW.Key()
					K = SiteSolveName(S0.Site) + ' ' + S0.Act.Name[0] + ' ' + S0.ID
					B = WW.Now()
					KeywordHintLoad.K(K).E('')
					Keyword.Hint(undefined,KeywordHintLoad.R)
						.Drop()
					;(S0.Act[KeywordCache] || (S0.Act[KeywordCache] = WX.CacheM(S0.Act.Hint)))
						(S0.ID)
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
											[(V.Jump ? '' : S0.InpAct) + B[0],B[1],0] :
											[S0.InpAct + B,B,0]
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
				else if (WW.IsArr(S))
				{
					HintCurrent = false
					Keyword
						.Drop(WR.Map(function(B)
						{
							return [
								B,
								[
									WV.T(WV.Rock(ClassHintSite,'span'),SiteSolveName(B.Site)),
									WV.T(WV.Rock(ClassHintAct,'span'),' ' + B.Act.Name[0]),
									B.Fuzzy ?
										false !== B.Act.JudgeVal && WV.T(WV.Rock(ClassHintFuzzy,'span'),' ...') :
										B.ID && WV.T(WV.Rock(ClassHintID,'span'),' ' + B.ID)
								],
								B.InpAct + (B.ID || '')
							]
						},S),false)
						// Put Hint after Drop so that it does not cost an unnecessary hide & show
						.Hint(undefined,null)
				}
				else
				{
					HintCurrent = false
					Keyword.Hint(undefined,WW.IsStr(Q) && !Q.trim() ? null : S)
						.Drop()
				}
			},
			Keyword = WV.Inp(
			{
				Hint : LangSolve('BroKeyword'),
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
			ShortCutOnPage(K,ShortCutBrowseSelAllHis,function()
			{
				WR.Each(function(V){V.A(BarAddOptHis)},Bar)
			})
			ShortCutOnPage(K,ShortCutBrowseSelAllFocus,function()
			{
				WR.Each(function(V){V.A(BarAddOptFocus)},Bar)
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
				BriefKeyword.U(LangSolve('GenLoading') + ' ' + Q)
			}

			Unsafe.Test = function(/**@type {CrabSaveNS.SiteView}*/ Site)
			{
				var
				All = [];
				WW.IsStr(Site) && (Site = SiteMap[WR.Up(Site)])
				Site || WW.Throw('Bad Site')
				WR.Each(function(Act)
				{
					var
					Seen = {};
					WR.EachU(function(B,F)
					{
						var I,T;
						switch (B.As)
						{
							case 'Inp' :
								I = B.Val
								break
							case 'Sub' :
								I = Site.ID + (B.Val && ' ' + B.Val)
								break
							case 'Val' :
								I = Site.ID + ' ' + Act.Name[0] + (B.Val && ' ' + B.Val)
								break
							default :
								WW.Throw(['Bad Example',F,B,Act])
						}
						T = SolveInput(I)
						WW.IsArr(T) || WW.Throw(['Bad Input',I,T,F,B,Act])
						T = T[0]
						T.Act === Act || WW.Throw(['Bad Act',I,T,F,B,Act])
						B.ID && B.ID !== T.ID && WW.Throw(['Bad ID',I,T,F,B,Act])
						WR.Has(T.ID,Seen) ||
							(Seen[T.ID] = All.push(T))
					},Act.Example)
				},Site.Map)
				return WX.From(All)
					.FMapE(function(V,F)
					{
						ConsoleLog(WW.ShowLI(All.length,F),V)
						return V.Act.View(V.ID,0)
					})
					.Map(function(B)
					{
						ConsoleLog(B)
					})
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
						'.`HS`{color:#AA30AA}' +
						'.`HA`{color:#4080F0}' +
						'.`HI`{color:#55AA55}' +
						'.`HF`{color:#A0A0A0}' +
						'.`O`>.`HS`,.`O`>.`HA`,.`O`>.`HI`,.`O`>.`HF`{color:inherit}' +
						'.`E`{padding:`h`px;`e`}' +
						'.`L`{margin-left:-`l`px;margin-right:-`l`px;text-align:center}' +
						'.`C`' +
						'{' +
							'display:inline-block;' +
							'margin:`l`px;' +
							'width:`c`px;' +
							'text-align:left;' +
							'text-align:start;' +
							'word-break:break-all' +
						'}' +
						'.`C` legend{padding:0 `l`px `l`px;font-weight:bold}' +
						'.`N`' +
						'{' +
							'padding:0 `h`px `h`px `h`px;' +
							/*
								This is required so that sub content like `、`.repeat(100) would not expand the container,
								even though we already have word-break set.
								Well, there may be a more elegant way...
							*/
							'width:`c`px' +
						'}' +
						'.`U`,.`U`>.`B`{color:#ECA100}' +
						'.`K`{cursor:pointer}' +
						'.`S`{color:#F7F7F7;font-weight:bold;text-align:center}' +
						'.`K`:hover .`S`,.`K`.`A` .`S`{background:rgba(102,175,224,.7)}' +
						'.`K`.`O` .`S`{background:#66AFE0}' +
						'.`C` img{width:100%;max-height:`m`px}' +
						'.`C` .`B`{padding:0;min-width:0}' +
						'.`G`{width:100%;height:`h`px}' +

						'.`M`{position:relative;text-align:center}' +
						'.`LR`{position:absolute;top:0;width:50%;height:100%}',
						{
							R : ID,
							I : WV.InpW,
							D : WV.InpD,
							B : WV.ButW,
							A : WV.Alt,
							O : WV.Foc,

							p : ConfPadding,
							h : ConfPaddingHalf,
							l : ConfPaddingHalf / 2,

							HS : ClassHintSite,
							HA : ClassHintAct,
							HI : ClassHintID,
							HF : ClassHintFuzzy,
							E : ClassBrief,
							e : WV.Exp('box-shadow','inset 0 0 3px 2px rgba(0,0,0,.2)'),
							L : ClassList,
							C : ClassCard,
							G : ClassCardGroup,
							N : ClassCardContent,
							U : ClassCardUP,
							K : ClassCardClick,
							S : ClassCardBar,
							c : ConfSizeCardWidth,
							m : 2 * ConfSizeCardWidth,
							M : ClassImgMulti,
							LR : ClassImgMultiLR
						}
					)
				}
			}
		}],
		[[LangSolve('Col'),ColdCount.R],function(V,_,K)
		{
			var
			/**@type {
			{
				Key : string
				Site : string
				ID : string
				Title : string
				UP : string
			}[]}*/
			Cold = [],
			/**@type {Record<any,Cold[0]>}*/
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
				X : LangSolve('ColCommit'),
				The : WV.TheP,
				C : function()
				{
					WSAuthPrecheck() && WSSend(Proto.AuthTaskNew,
					{
						Task : WR.Map(function(V)
						{
							return Cold[V]
						},List.SelL())
					})
				}
			}).Off(),
			JustRemove = WV.But(
			{
				X : LangSolve('LstRemove'),
				The : WV.TheP,
				C : function(L,F)
				{
					L = List.SelL()
					for (F = L.length;F;)
						OnDel(Cold[L[--F]].Key,L[F])
				}
			}).Off(),
			JustCommitAll = WV.But(
			{
				X : LangSolve('ColCommitAll'),
				The : WV.TheP,
				C : function()
				{
					if (Cold.length && WSAuthPrecheck())
					{
						WSSend(Proto.AuthTaskNew,{Task : Cold})
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
						LangSolve('StsSelect',[Selected]) :
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
					R = WV.Div(2,['',ConfTaskButtonSize]),
					ID = MakeSingle(),
					Title = MakeSingle(),
					Commit = WV.But(
					{
						X : LangSolve('ColCommit'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && WSSend(Proto.AuthTaskNew,{Task : S})
						}
					}),
					Remove = WV.But(
					{
						X : LangSolve('LstRemove'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && ColdDel(S[0].Key)
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
							SingleFill(ID,V.Site,V.ID)
							SingleFill(Title,V.UP,V.Title)
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
			ColdAdd = function(ID,Site,Q)
			{
				if (!IsCold(ID) && !IsHot(ID))
				{
					List.Push(ColdMap[ID] =
					{
						Key : ID,
						Site : Site.ID,
						ID : Q.ID,
						Title : Q.Title || '',
						UP : Q.UP
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
		[[LangSolve('Hot'),HotCount.R],function(V,_,K)
		{
			var
			ClassStatus = WW.Key(),
			ClassBar = WW.Key(),

			/**@type {CrabSaveNS.TaskBriefHot[]}*/
			Hot = [],
			HotMap = MultiMap(),
			/**@type {Record<any,CrabSaveNS.TaskBriefHot>}*/
			HotRowMap = {},
			HotShown = {},
			TaskErr = {},
			Selected = MakeSelectSize(K),
			MakeJust = function(H,Action,Confirm)
			{
				return WV.But(
				{
					X : LangSolve(H),
					The : WV.TheP,
					C : function(L)
					{
						if (WSAuthPrecheck() && (L = List.SelL()).length)
						{
							L = WR.Map(function(V){return Hot[V].Row},L)
							Confirm ?
								Confirm(L) :
								WSSend(Action,{Row : L})
						}
					}
				}).Off()
			},
			JustPlay = MakeJust('HotPlay',Proto.AuthTaskPlay),
			JustPause = MakeJust('HotPause',Proto.AuthTaskPause),
			JustRemove = MakeJust('LstRemove',Proto.AuthTaskRemove,ConfirmRemove),
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
					R = WV.Div(2,['',ConfTaskButtonSize]),
					Title = MakeSingleBrief(),
					Status = MakeSingle(ClassStatus),
					PlayCurrent = 9,
					Play = WV.But(
					{
						The : WV.TheP,
						C : function()
						{
							S[0] && WSSend(PlayCurrent ? Proto.AuthTaskPause : Proto.AuthTaskPlay,{Row : [S[0].Row]})
						}
					}),
					OnState = function(V,Init)
					{
						WV.WC(Bar) // Force to reset transition state
						if (PlayCurrent = V)
						{
							Play.X(LangSolve('HotPause'))
							WV.ClsA(Bar,WV.Foc)
						}
						else
						{
							if (!Init)
								HasError = false
							Play.X(LangSolve('HotPlay'))
							WV.ClsR(Bar,WV.Foc)
						}
					},
					Running = WV.Fmt('[`F`] `P` ',null,WV.A('span')),
					Renew = WV.E(),
					More = WV.But(
					{
						X : LangSolve('LstDetail'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && DetailMake(S[0],Task,TaskErr[S[0].Row])
						}
					}),
					Remove = WV.But(
					{
						X : LangSolve('LstRemove'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && ConfirmRemove([S[0].Row])
						}
					}),
					Bar = WV.Rock(ClassBar),
					LoadO = WX.EndL(),
					HasError,ErrorToRenew,ErrorAt,
					LoadErr,RenewLast,
					OnTick = function(T)
					{
						if (S[0] && !WR.Has(S[0].Row,ProgressMap))
						{
							T = null == Task ? LangSolve('LstLoad') :
								null != LoadErr ? LoadErr :
								TaskRenewing[S[0].Row] ? LangSolve(WR.Has('Size',Task) ? 'HotRenew' : 'HotSolve') :
								HasError && WW.Now() <= 1E3 * Setting.Delay + ErrorAt && (Task.State || !WR.Has('Size',Task)) ?
									LangSolve('Err') + ' ' + RemainS(1E3 * Setting.Delay + ErrorAt - WW.Now()) :
								HasError && ErrorToRenew ? LangSolve('HotReady') :
								!WR.Has('Size',Task) ? LangSolve('HotReady') :
								Task.State ? LangSolve('HotQueue') :
								LangSolve('HotPaused')
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
					},
					HotShownCurrent,
					HotShownRelease = function()
					{
						if (Row)
						{
							if (HotShown[Row] === HotShownCurrent)
								WR.Del(Row,HotShown)
							Row = HotShownCurrent = false
						}
					};
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
							Title.U(V,true)
							WV.ClsA(Running.R,WV.None)
							OnTick()
							OnState(false)
							WV.CSS(Bar,'width',0)
							LoadO(TaskOverviewLoad(V.Row).Now(function(B)
							{
								Task = B
								Title.U(Task)
								WR.Has('Size',B) && WV.ClsR(Running.R,WV.None)
								if (B.Error)
								{
									HasError = true
									ErrorToRenew = 2 === B.State
									ErrorAt = B.Error
								}
								OnTick()
								if (WR.Has('Size',B))
								{
									Running.F(B.File)
									OnSizeHas(B.Size,B.Has)
								}
								WR.Has(V.Row,ProgressMap) && OnProgress(ProgressMap[V.Row])
								Play.On()
								OnState(B.State,true)
							},function(E)
							{
								LoadErr = LangSolve('LstFail') + ' ' + ErrorS(E)
								OnTick()
							}))
							HotShownRelease()
							HotShown[Row = V.Row] = HotShownCurrent =
							{
								S : function(Q)
								{
									if (null == Task) return
									return undefined === Q ?
										PlayCurrent :
										Task.State - Q &&
									(
										OnState(Task.State = Q),
										WR.Del(V.Row,ProgressMap),
										OverallUpdate(),
										OnTick()
									)
								},
								W : OnTick,
								P : OnProgress,
								R : function()
								{
									HasError = false
									OnTick()
								},
								E : function(Data)
								{
									if (Data.At)
									{
										HasError = true
										ErrorToRenew = 2 === Data.State
										ErrorAt = Data.At
									}
									else HasError = false
									OnTick()
								},
								T : function(Q)
								{
									if (null == Task) return
									Task.Title = Q
									Title.U(Task)
								},
								Z : function(Data)
								{
									if (null == Task) return
									WV.ClsR(Running.R,WV.None)
									WR.Has('File',Data) && Running.F(Data.File)
									OnSizeHas(Task.Size = Data.Size,Task.Has)
									OnTick()
								}
							}
						},
						E : function()
						{
							LoadO()
							HotShownRelease()
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
			DBBriefDiff
				.On(Proto.TaskNew,function(Data)
				{
					Data = Data.Task
					if (!WR.Has(Data.Row,HotRowMap))
					{
						List.Push(HotRowMap[Data.Row] = HotMap.D(DBBriefKey(Data),Data))
						HotCount.D(Hot)
						BrowserUpdate([DBBriefKey(Data)])
					}
				})
				.On(Proto.TaskPlay,function(Data)
				{
					WR.Has(Data.Row,HotShown) &&
						HotShown[Data.Row].S(true)
				})
				.On(Proto.TaskPause,function(Data)
				{
					WR.Has(Data.Row,HotShown) &&
						HotShown[Data.Row].S(false)
				})
				.On(Proto.TaskHist,function(Data)
				{
					var T;
					if (WR.Has(Data.Row,HotRowMap))
					{
						T = WW.BSL(Hot,Data.Row,function(Q,S){return Q.Row < S})
						Hot[T] && Hot[T].Row === Data.Row &&
							List.Splice(T,1)
						T = HotRowMap[Data.Row]
						WR.Del(Data.Row,HotRowMap)
						HotMap.E(DBBriefKey(T),T)
						T.Done = Data.Done
						HotCount.D(Hot)
						WSOnHist(T)
					}
				})
				.On(Proto.TaskRemove,function(Data)
				{
					var T;
					if (WR.Has(Data.Row,HotRowMap))
					{
						T = WW.BSL(Hot,Data.Row,function(Q,S){return Q.Row < S})
						Hot[T] && Hot[T].Row === Data.Row &&
							List.Splice(T,1)
						T = HotRowMap[Data.Row]
						WR.Del(Data.Row,HotRowMap)
						HotMap.E(DBBriefKey(T),T)
						HotCount.D(Hot)
						BrowserUpdate([DBBriefKey(T)])
					}
				})

			WSOnDBBriefHot = function(B)
			{
				HotMap.C()
				HotRowMap = {}
				WR.Each(function(V)
				{
					HotRowMap[V.Row] = V
					HotMap.D(DBBriefKey(V),V)
				},Hot = B)
				HotCount.D(Hot)
				List.D(Hot)
			}

			WSOnProgress = function()
			{
				WR.EachU(function(V,F)
				{
					WR.Has(F,HotShown) &&
						HotShown[F].P(V)
				},ProgressMap)
				OverallUpdate()
			}
			WSOnRenew = function(Data)
			{
				var T;
				if (WR.Has('All',Data))
				{
					T = TaskRenewing
					TaskRenewing = {}
					WR.Each(function(V)
					{
						TaskRenewing[V] = 9
						WR.Del(V,TaskErr)
						WR.Has(V,HotShown) && HotShown[V].R()
					},Data.All)
					WR.EachU(function(_,F)
					{
						TaskRenewing[F] ||
							WR.Has(F,HotShown) && HotShown[F].R()
					},T)
				}
				else
				{
					T = Data.Row
					if (Data.On)
					{
						TaskRenewing[T] = 9
						WR.Del(T,TaskErr)
						WR.Has(T,HotShown) && HotShown[T].R()
					}
					else
					{
						WR.Del(T,TaskRenewing)
						WR.Has(T,HotShown) && HotShown[T].W()
					}
				}
			}
			WSOnTitle = function(Data)
			{
				WR.Has(Data.Row,HotShown) &&
					HotShown[Data.Row].T(Data.Title)
			}
			WSOnSize = function(Data)
			{
				var T;
				WR.Has(Data.Row,HotShown) &&
					HotShown[Data.Row].Z(Data)
				T = WW.BSL(Hot,Data.Row,function(Q,S){return Q.Row < S})
				if (Hot[T] && Hot[T].Row === Data.Row)
				{
					List.SelHas(T) &&
						Selected.I(Hot[T],Data)
					Hot[T].Size = Data.Size
				}
			}
			WSOnErr = function(Data)
			{
				var E;
				if (Data.JSON)
				{
					if (Data = WSSolveJSON(Data.JSON))
					{
						TaskErr = Data
						DetailUpdate && WR.Has(DetailUpdate.O,Data) &&
							DetailUpdate.E(Data[DetailUpdate.O])
					}
				}
				else
				{
					E = Data.Err ? WSSolveJSON(Data.Err) : null
					E ? TaskErr[Data.Row] = E : WR.Del(Data.Row,TaskErr)
					DetailIs(Data.Row) && DetailUpdate.E(E)
				}
			}
			WSOnTaskErr = function(Data)
			{
				WR.Has(Data.Row,HotShown) &&
					HotShown[Data.Row].E(Data)
				WR.Del(Data.Row,ProgressMap)
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

							q : ConfPaddingQuarter
						}
					)
				},
				Show : List.In,
				HideP : List.Out
			}
		}],
		[LangSolve('His'),function(V,_,K)
		{
			var
			/**@type {CrabSaveNS.TaskBriefHist[]}*/
			Hist = [],
			HistMap = MultiMap(),
			/**@type {Record<any,CrabSaveNS.TaskBriefHist>}*/
			HistRowMap = {},
			Selected = MakeSelectSize(K),
			MakeJust = function(H,Action,Confirm)
			{
				return WV.But(
				{
					X : LangSolve(H),
					The : WV.TheP,
					C : function(L)
					{
						if (WSAuthPrecheck() && (L = List.SelL()).length)
						{
							L = WR.Map(function(V){return Hist[V].Row},L)
							Confirm ?
								Confirm(L) :
								WSSend(Action,{Row : L})
						}
					}
				}).Off()
			},
			JustRemove = MakeJust('LstRemove',Proto.AuthTaskRemove,ConfirmRemove),
			List = WV.List(
			{
				Data : Hist,
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
					R = WV.Div(2,['',ConfTaskButtonSize]),
					Title = MakeSingleBrief(),
					Status = MakeSingle(),
					Done = WV.E(),
					Pending = WV.A('span'),
					Size = WV.Fmt('[`F`] `S`',null,WV.A('span')),
					More = WV.But(
					{
						X : LangSolve('LstDetail'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && DetailMake(S[0],Task)
						}
					}),
					Remove = WV.But(
					{
						X : LangSolve('LstRemove'),
						The : WV.TheP,
						Blk : true,
						C : function()
						{
							S[0] && ConfirmRemove([S[0].Row])
						}
					}),
					LoadO = WX.EndL();
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
							Title.U(V,true)
							WV.T(Done,WW.StrDate(V.Done) + ' ')
							WV.T(Pending,LangSolve('LstLoad'))
							LoadO(TaskOverviewLoad(V.Row).Now(function(B)
							{
								Task = B
								Title.U(Task)
								WV.Con(Pending,Size.R)
								Size
									.F(B.File)
									.S(WR.ToSize(B.Size))
							},function(E)
							{
								SingleFill(Pending,LangSolve('LstFail') + ' ' + ErrorS(E))
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

			IsHistory = HistMap.H
			WSOnHist = function(Data)
			{
				if (!WR.Has(Data.Row,HistRowMap))
				{
					Data = HistRowMap[Data.Row] = HistMap.D(DBBriefKey(Data),Data)
					!Hist.length || Hist[0].Done < Data.Done || Hist[0].Done === Data.Done && Hist[0].Row < Data.Row ?
						List.Unshift(Data) :
						List.Splice(WW.BSL(Hist,Data,function(Q,S){return Q.Done - S.Done ? S.Done < Q.Done : S.Row < Q.Row}),0,Data)
					BrowserUpdate([DBBriefKey(Data)])
				}
			}
			DBBriefDiff.On(Proto.TaskRemove,function(Data)
			{
				var H,T;
				if (Data.Done && WR.Has(Data.Row,HistRowMap))
				{
					H = HistRowMap[Data.Row]
					T = WW.BSL(Hist,Data,function(Q,S){return Q.Done - S.Done ? S.Done < Q.Done : S.Row < Q.Row})
					Hist[T] && Hist[T].Row === Data.Row &&
						List.Splice(T,1)
					WR.Del(Data.Row,HistRowMap)
					HistMap.E(DBBriefKey(H),H)
					BrowserUpdate([DBBriefKey(H)])
				}
			})

			WSOnDBBriefHist = function(B)
			{
				HistMap.C()
				HistRowMap = {}
				WR.Each(function(V)
				{
					HistRowMap[V.Row] = V
					HistMap.D(DBBriefKey(V),V)
				},Hist = B)
				List.D(Hist)
			}

			return {
				Show : List.In,
				HideP : List.Out
			}
		}],/*
		[SA('Cmp'),function()
		{

		}],*/
		[LangSolve('Aut'),function(V,_,TabKey)
		{
			var
			RToken = WV.Rock(WV.S6),
			Token = WV.Inp(
			{
				Hint : LangSolve('AutToken'),
				Pass : true,
				Ent : function(T)
				{
					if (!WSOnline) WSNotConnected()
					else if (WSCipher) Noti.S(LangSolve('AutAlready'))
					else
					{
						T = TokenStepB(TokenStepA(Token.V()))
						WSCipher = WC.AESES(WC.Slice(T,0,32),WC.Slice(T,-16),WC.OFB)
						WSDecipher = WC.AESDS(WC.Slice(T,-32),WC.Slice(T,16,32),WC.OFB)
						Token.V('').Fresh().Foc()
						WSSend(Proto.AuthHello,
						{
							Syn : WSAuthSeed = WW.Rnd(0x4000000000000)
						})
						WSOnAuthing.D()
						NotiAuth(LangSolve('AutAuthing'))
						TokenEnt.Off()
						TokenNew.On()
						TokenNewEnt.On()
					}
				}
			}),
			TokenEnt = WV.But(
			{
				X : LangSolve('AutAut'),
				The : WV.TheO,
				Blk : true,
				C : Token.Ent
			}),
			TokenNew = WV.Inp(
			{
				Hint : LangSolve('AutNew'),
				Pass : true,
				Ent : function()
				{
					if (WSSend(Proto.AuthToken,
					{
						Old : WC.B91S(TokenStepA(Token.V())),
						New : WC.B91S(TokenStepA(TokenNew.V()))
					}))
					{
						Token.V('').Fresh()
						TokenNew.V('').Fresh().Foc()
						Noti.S(LangSolve('AutSaving'))
					}
				}
			}).Off(),
			TokenNewEnt = WV.But(
			{
				X : LangSolve('AutSave'),
				The : WV.TheO,
				Blk : true,
				C : TokenNew.Ent
			}).Off(),
			Site = WV.Inp(
			{
				Hint : '<' + LangSolve('AutSite') + '>',
				Stat : true,
				Inp : function(V)
				{
					Site.Stat(SiteMap[V] && WW.IsArr(SiteMap[V].Min) ? SiteMap[V].Min.join(', ') : SiteMap[V].SignHint || '')
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
				Set : [['Y',LangSolve('AutMin')]]
			}).V(['Y']).Off(),
			Cookie = WV.Inp(
			{
				Hint : LangSolve('AutCoke'),
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
				X : LangSolve('AutCokeSave'),
				Blk : true,
				C : function(T)
				{
					CookieSaving = Site.V()
					T = WR.Trim(Cookie.V())
					if (CookieMin.V().length && SiteMap[CookieSaving].Min)
					{
						T = WW.IsFunc(SiteMap[CookieSaving].Min) ?
							SiteMap[CookieSaving].Min(T) :
							WC.CokeS(WR.Pick(SiteMap[CookieSaving].Min,WC.CokeP(T,WR.Id)),WR.Id)
					}
					WSSend(Proto.AuthCookie,{Site : CookieSaving,Coke : T})
				}
			}).Off();
			WSNotAuthed = function()
			{
				WSNotAuthedNoti([LangSolve('ErrNoAuth'),WV.But(
				{
					X : LangSolve('AutEnt'),
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
			WSOnCookie = function(Data)
			{
				var S = Data.Site,C = Data.Coke;
				if (Data.JSON)
				{
					if (Data = WSSolveJSON(Data.JSON))
						C = (CookieMap = Data)[S = Site.V()]
				}
				else if (WR.Has(S,SiteMap))
				{
					CookieMap[S] = C
					if (CookieSaving && CookieSaving === S)
					{
						CookieSaving = false
						CookieCheckNoti(LangSolve('AutCheck') + ' @' + SiteSolveName(S))
						CookieEnd(SiteMap[S].Sign().Now(function(Q)
						{
							if (Q && WW.IsStr(Q))
								CookieCheckNoti(LangSolve('AutSigned') + ' ' + Q + '@' + SiteSolveName(S))
							else CookieCheckNoti(LangSolve('AutNoSign') + ' @' + SiteSolveName(S))
							CookieCheckNoti(false)
						},function(E)
						{
							CookieCheckNoti(LangSolve('AutNoSign') + ' @' + SiteSolveName(S) + '\n' + ErrorS(E))
							CookieCheckNoti(false)
						}))
					}
				}
				Site.V() && S === Site.V() && Cookie.V(C || '')
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

							p : ConfPadding
						}
					)
				},
				Hide : function(){Token.V('').Fresh(),TokenNew.V('').Fresh()}
			}
		}],
		[LangSolve('Sot'),function(V)
		{
			var
			ClassTitle = WW.Key(),
			ClassAction = WW.Key(),
			SC = WB.SC(),
			SCC = {},
			SCM = {},
			Mask = [[WB.SCD,LangSolve('SotDown')],[WB.SCU,LangSolve('SotUp')],[WB.SCI,LangSolve('SotInp')]];
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
						Hint : LangSolve('SotSet'),
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
							X : LangSolve('SotRemove'),
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
					WSSend(Proto.AuthShortCut,{JSON : WC.OTJ(WR.Where(WR.Id,SCM))})
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
					WV.T(WV.Rock(ClassTitle),LangSolve('Sot' + Key)),
					WV.But(
					{
						X : LangSolve('SotAdd'),
						The : WV.TheP,
						C : function(){Make('',WB.SCD)}
					}),
					WV.But(
					{
						X : LangSolve('SotRestore'),
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
				ShortCutGeneralProxyNext,
				'Alt+]',WB.SCD | WB.SCI
			],[
				ShortCutGeneralNonAV,
				'Alt+o',WB.SCD | WB.SCI
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
				ShortCutBrowseSelAllHis,
				'Ctrl+Alt+a',WB.SCD
			],[
				ShortCutBrowseSelAllFocus,
				'Ctrl+s',WB.SCD
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
			WSOnSC = function(Data)
			{
				if (Data = WSSolveJSON(Data.JSON))
					WR.EachU(function(V,F){V(Data[F])},SCC)
			}
			SC.On('Shift+Ctrl+Alt+Space+p+-+]',function()
			{
				DebugMake()
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
							p : ConfPadding
						}
					)
				}
			}
		}],
		[LangSolve('Set'),function(V)
		{
			var
			SetD = {},SetC = {},
			PC,
			Key = function(/**@type {keyof CrabSaveNS.Setting}*/ Q){return PC = Pref.C(Q),Q},
			ChoOF = [[false,LangSolve('GenDisabled')],[true,LangSolve('GenEnabled')]],
			UnstableZone,
			Pref = WV.Pref(
			{
				O : Setting,
				C : function()
				{
					UnstableZone ||
					WSSend(Proto.AuthSetting,{JSON : WC.OTJ(WR.WhereU(function(V,F){return V !== SetD[F]},Setting))})
				}
			}),
			OptionProxy,
			OptionProxyURL,
			OptionProxyURLPC,
			OptionNonAV,
			OptionSPUP,
			OptionSPUPUpdateStat = function(V)
			{
				OptionSPUP.Stat(WW.MR(WR.Inc,0,/.+/g,V),V ? V.length : 0)
			},
			MakeShortCutToggle = function(SCKey,Opt,Key)
			{
				ShortCut.On(SCKey,function(V)
				{
					Opt.V(V = !Opt.V())
					Noti.S([LangSolve('Set'),LangSolve('Set' + Key),LangSolve(V ? 'GenEnabled' : 'GenDisabled')].join(' | '))
				})
			};
			WR.Each(function(V)
			{
				var
				Key = V[1],
				Inp = V[2],
				Default = WR.Default('',V[3]);
				Pref.S([[V[0],Inp]])
				'' === Default || Inp.V(Setting[Key] = SetD[Key] = Default,true)
				SetC[Key] = function(Q)
				{
					if (Setting[Key] !== (Q = undefined === Q ? Default : Q))
					{
						Inp.V(Setting[Key] = Q,true)

						if (Inp === OptionSPUP)
							OptionSPUPUpdateStat(Q)
					}
				}
			},[
			[
				LangSolve('SetLang'),
				Key('Lang'),
				WV.Inp(
				{
					InpU : PC,
					Inp : function(Q)
					{
						LangNow === (LangTo(Q),LangNow) ||
							Noti.S(LangSolve('SetLangH'))
					},
					NoRel : InpNoRel
				}).Drop(WR.Map(function(V)
				{
					return [V[0],V[1].Name]
				},WR.Ent(Lang))),
				'EN'
			],[
				LangSolve('SetDir'),
				Key('Dir'),
				WV.Inp(
				{
					Hint : LangSolve('SetDirH'),
					InpU : PC
				})
			],[
				LangSolve('SetFmt'),
				Key('Fmt'),
				WV.Inp(
				{
					Hint : LangSolve('SetFmtH'),
					Any : true,
					InpU : PC,
					NoRel : InpNoRel
				}).Drop(
				[
					'|Up|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?',
					'|Up|/|Y|/|Up|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?',
					'|Up|.|Date|.|ID|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?',
					'|Up|/|Y|/|Up|.|Date|.|ID|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?',
					'|Site|/|Up|.|Date|.|ID|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?',
					'|Site|/|Up|/|Y|/|Up|.|Date|.|ID|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?'
				]),
				'|Up|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?'
			],[
				LangSolve('SetMax'),
				Key('Max'),
				WV.Inp(
				{
					InpU : PC,
					NoRel : InpNoRel
				}).Drop(WR.Range(1,25)),
				4
			],[
				LangSolve('SetProxy'),
				Key('Proxy'),
				OptionProxy = WV.Cho(
				{
					Set : ChoOF,
					Inp : PC
				}),
				false
			],[
				LangSolve('SetURL'),
				Key('ProxyURL'),
				OptionProxyURL = WV.Inp(
				{
					Hint : LangSolve('SetURLH'),
					InpU : OptionProxyURLPC = PC
				})
			],[
				LangSolve('SetURLCand'),
				Key('ProxyCand'),
				WV.Inp(
				{
					Row : 3,
					Hint : LangSolve('SetURLCandH'),
					InpU : PC,
				}),
				''
			],[
				LangSolve('SetImg'),
				Key('ProxyView'),
				WV.Cho(
				{
					Set : [[false,LangSolve('SetImgNo')],[true,LangSolve('SetImgDown')]],
					Inp : PC
				}),
				false
			],[
				LangSolve('SetDelay'),
				Key('Delay'),
				WV.Inp(
				{
					Yep : WV.InpYZ,
					InpU : PC,
					Map : Number
				}),
				20
			],[
				LangSolve('SetHTTP429'),
				Key('HTTP429'),
				WV.Inp(
				{
					Yep : WV.InpYZ,
					InpU : PC,
					Map : Number
				}),
				60
			],[
				LangSolve('SetHTTP429Auto'),
				Key('HTTP429Auto'),
				WV.Cho(
				{
					Set : ChoOF,
					Inp : PC
				}),
				false
			],[
				LangSolve('SetSize'),
				Key('Size'),
				WV.Cho(
				{
					Set : ChoOF,
					Inp : PC
				}),
				true
			],[
				LangSolve('SetMeta'),
				Key('Meta'),
				WV.Cho(
				{
					Set : ChoOF,
					Inp : PC
				}),
				true
			],[
				LangSolve('SetCover'),
				Key('Cover'),
				WV.Cho(
				{
					Set : ChoOF,
					Inp : PC
				}),
				true
			],[
				LangSolve('SetNonAV'),
				Key('NonAV'),
				OptionNonAV = WV.Cho(
				{
					Set : ChoOF,
					Inp : PC
				}),
				false
			],[
				LangSolve('SetSPUP'),
				Key('SPUP'),
				OptionSPUP = WV.Inp(
				{
					Row : 16,
					InpU : PC,
					Stat : true,
					Inp : WR.Throttle(2E2,OptionSPUPUpdateStat)
				}),
				''
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
			WSOnAuthing.R(function()
			{
				UnstableZone = true
			})
			WSOnSetting = function(Data)
			{
				if (Data = WSSolveJSON(Data.JSON))
				{
					WR.EachU(function(V,F){V(Data[F])},SetC)
					LangTo(Data.Lang)
					UnstableZone = false
				}
			}
			WSOnSettingProxy = function(Data)
			{
				Data = Data.URL
				SetC.ProxyURL(Data)
				Noti.S(LangSolve('SetURLChanged',[Data]))
			}
			WR.Has(Conf.Lang,Lang) && SetC.Lang(Conf.Lang)
			MakeShortCutToggle(ShortCutGeneralProxy,OptionProxy,'Proxy')
			ShortCut.On(ShortCutGeneralProxyNext,function()
			{
				var T;
				if (WSAuthPrecheck() && (T = SettingProxyCand()).length)
				{
					WV.Inp().V()
					T = T[-~T.indexOf(Setting.ProxyURL) % T.length]
					OptionProxyURL.V(T,true)
					OptionProxyURLPC(T)
					Noti.S(LangSolve('SetURLChanged',[T]))
				}
			})
			MakeShortCutToggle(ShortCutGeneralNonAV,OptionNonAV,'NonAV')
			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`{padding:0 `p`px}',
						{
							R : ID,
							p : ConfPadding
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

	WSActPlain = WW.MakeO
	(
		Proto.TaskNew,function(Data)
		{
			ColdDel(DBBriefKey(Data.Task))
			DBBriefDiffForward(Data)
		},
		Proto.TaskPlay,DBBriefDiffForward,
		Proto.TaskPause,DBBriefDiffForward,
		Proto.TaskRemove,DBBriefDiffForward,
		Proto.TaskHist,function(Data)
		{
			DBBriefDiffForward(Data)
			DetailIs(Data.Row) && DetailUpdate.F(Data)
		},
		Proto.TaskOverview,TaskOverviewUpdate,
		Proto.TaskRenew,WSOnRenew,
		Proto.TaskTitle,WSOnTitle,
		Proto.TaskSize,WSOnSize,
		Proto.TaskErr,WSOnTaskErr,

		Proto.ShortCut,WSOnSC,

		Proto.Error,function(Data)
		{
			Noti.S(
			[
				LangSolve('Err'),
				' | ',
				Data.Src,
				' | ',
				LangSolve(Data.Msg,Data.Arg)
			])
		},

		Proto.DBBrief,function(Data)
		{
			if (WR.Has('Bin',Data))
				Data = ProtoDec(Proto.DBBrief,WC.InfR(Data.Bin))

			if (WR.Has('Count',Data))
			{
				DBBriefInitSpeed = WW.Speed(
				{
					Total : Data.Count,
					Start : WSOnlineAt,
					Show : function(V)
					{
						return +WR.ToFix(2,V)
					}
				})
				DBBriefInitTimer = WW.To(5E2,function()
				{
					DBBriefInitNoti(LangSolve('LstBriefLoad') + ' ' + DBBriefInitSpeed.I().S(false,false))
				},true).C()
			}

			if (WR.Has('Part',Data))
			{
				DBBriefInitSpeed && DBBriefInitSpeed.D(Data.Part.length)
				WR.Each(function(V)
				{
					V.Done ?
						DBBriefHist.push(V) :
						DBBriefHot.push(V)
				},Data.Part)
				WSSend(Proto.DBBrief,{Cont : 9,Limit : ConfDBPageSize,GZ : true})
			}
			else
			{
				if (DBBriefInitTimer)
				{
					DBBriefInitTimer.F()
					DBBriefInitNoti(LangSolve('LstBriefLoaded') + ' ' + DBBriefInitSpeed.I().S(false,false))
					DBBriefInitNoti(false)
				}
				if (DBBriefVer === Data.Ver)
				{
					DebugLog('DBBrief',DBBriefVer)
				}
				else
				{
					DBBriefVer = Data.Ver
					Data = WW.Now()
					DebugLog('DBBrief',DBBriefVer + ' ' + WW.StrMS(Data - WSOnlineAt))
					DBBriefHist.sort(function(Q,S)
					{
						return S.Done - Q.Done ||
							S.Row - Q.Row
					})
					DebugLog('DBBrief','Sort ' + WW.StrMS(WW.Now() - Data))
					Data = WW.Now()
					WSOnDBBriefHot(DBBriefHot)
					WSOnDBBriefHist(DBBriefHist)
					DebugLog('DBBrief','Build ' + WW.StrMS(WW.Now() - Data))
				}
				DBBriefDiffRelease(DBBriefVer)
				DBBriefHot = []
				DBBriefHist = []
				BrowserUpdate()
			}
		},
		Proto.DBSite,function(Data)
		{
			if (WSOnDBKey === Data.ID)
				Data.Err ? WSOnDB.E(Data.Err) :
				(Data = WSSolveJSON(Data.JSON)) ? WSOnDB.U(Data) :
				WSOnDB.E('Bad JSON')
		}
	)
	WSActAuth = WW.MakeO
	(
		Proto.AuthHello,function(Data)
		{
			if (!WSAuthInited)
			{
				WSAuthInited = true
				NotiAuth(LangSolve('AutAuthed'))
				NotiAuth(false)
				WSNotAuthedNoti(false)
				if (Data.Ack !== WSAuthSeed)
				{
					DebugLog('Hello','Bad Ack ' + WC.OTJ([WSAuthSeed,Data.Ack]))
					WS.F()
					return
				}
				WSSend(Proto.AuthHello,
				{
					Ack : Data.Syn
				})
			}
		},
		Proto.AuthToken,function()
		{
			Noti.S(LangSolve('AutSaved'))
		},
		Proto.AuthCookie,WSOnCookie,
		Proto.AuthReq,function(Data)
		{
			var R = WSProxyMap[Data.ID];
			if (R)
			{
				WR.Del(Data.ID,WSProxyMap)
				WB.ReqB(
				{
					URL : ConfURLReq + Data.Token,
					Bin : true,
					TO : 3E4
				}).Map(function(B)
				{
					var
					Head = {},R,
					UVM = 1,
					T,F = 0;
					B = WC.AESD(Data.Key,Data.IV,WC.OFB,B)
					for (T = 0;
						T += UVM * (127 & B[F]),
						127 < B[F++]
					;) UVM *= 128
					if (T !== Data.ID)
						WW.Throw(LangSolve('ErrReqID',[Data.ID,T]))
					for (UVM = 1,T = 0;
						T += UVM * (127 & B[F]),
						127 < B[F++]
					;) UVM *= 128
					T = WC.U16S(B.slice(F,F += T)).split('\n')
					R =
					{
						ID : Data.ID,
						Token : Data.Token,
						Code : +T[0],
						Msg : T[1],
						W : T = T.slice(2),
						H : Head,
						B : WC.U16S(B.slice(F))
					}
					for (F = 0;F < T.length;F += 2)
					{
						UVM = WR.Pascal(T[F])
						if ('Set-Cookie' === UVM)
							Head[UVM] ?
								Head[UVM].push(T[1 + F]) :
								Head[UVM] = [T[1 + F]]
						else Head[UVM] = T[1 + F]
					}
					return R
				}).Now(R)
			}
		},

		Proto.AuthSetting,WSOnSetting,
		Proto.AuthSettingProxy,WSOnSettingProxy,

		Proto.AuthTaskInfo,TaskFullInfoUpdate,

		Proto.AuthDownFile,DetailUpdateForward,
		Proto.AuthDownPlay,DetailUpdateForward,
		Proto.AuthDownConn,DetailUpdateForward,
		Proto.AuthDownPath,DetailUpdateForward,
		Proto.AuthDownHas,DetailUpdateForward,
		Proto.AuthDownTake,DetailUpdateForward,
		Proto.AuthDownDone,DetailUpdateForward,

		Proto.AuthInspect,function(Data)
		{
			ConsoleLog('Inspector',Data.URL)
		},
		Proto.AuthVacuum,function(Data)
		{
			Data.Err ?
				ConsoleLog('Vacuum',WW.StrMS(Data.Take),WR.ToSize(Data.From),Data.Err) :
				ConsoleLog('Vacuum',WW.StrMS(Data.Take),WR.ToSize(Data.From),WR.ToSize(Data.To),WR.ToSize(Data.To - Data.From))
		},
		Proto.AuthErr,WSOnErr,
		Proto.AuthErrFile,WSOnErrFile
	)

	WV.Ready(function()
	{
		var
		Req = [],
		ReqFeed = function(Q,S)
		{
			Req.unshift([Q,S]) < ConfDebugLimitObj || Req.pop()
		};
		WV.Ap(Rainbow[0],WV.Body)
		WS.H || WSNoti(LangSolve('GenNoSock'))
		WS.C()

		Top.CrabSave = CrabSave = {}
		CrabSave.Site = function(Q)
		{
			var
			WebToolReq = function(Q,H)
			{
				var
				Count = 0,
				Param;
				Q = WW.IsObj(Q) ? Q : {URL : Q}
				if (!WR.Has('Cookie',Q))
					Q.Cookie = V.Cookie
				Param = WC.OTJ(Q)
				return WX.Just().FMap(function()
				{
					var
					Current = Count++,
					ID,
					R = WX.R();
					for (;WR.Has(ID = WW.Rnd(0xFFFFFFFF),WSProxyMap););
					return WSSend(Proto.AuthReq,{ID : ID,JSON : Param}) ?
						(WSProxyMap[ID] = R).Map(function(B)
						{
							B.Retry = Current
							ReqFeed(Q,B)
							Q.AC || /^2/.test(B.Code) || WW.Throw(WW.Err.NetBadStatus(B.Code))
							return H ? B : B.B
						}) :
						WX.Throw(LangSolve('ErrOff'))
				})
			},
			WebToolAPI = function(Q,H)
			{
				return (H ? WB.ReqU({URL : MakeAPI(Q),AC : true}) : WB.ReqB(MakeAPI(Q)))
					.Tap(function(B)
					{
						ReqFeed(Q,B)
					})
			},
			V = Q(
			{
				SA : LangSolve,
				Req : WebToolReq,
				API : WebToolAPI,
				ReqAPI : function(Q,ForceReq,ForceAPI)
				{
					return (!ForceAPI && (ForceReq || WSAuthInited && CookieMap[V.Cookie]) ? WebToolReq : WebToolAPI)(Q)
				},
				Auth : function()
				{
					return !!WSCipher
				},
				Coke : function()
				{
					return CookieMap[V.Cookie] || ''
				},
				CokeU : function(Q)
				{
					WSSend(Proto.AuthCookie,{Site : V.ID,Coke : Q})
				},
				CokeC : function(Q)
				{
					Q = WX.CacheL(Q)
					return function()
					{
						return Q(CookieMap[V.Cookie] || '')
					}
				},
				DB : function(Med,Inp)
				{
					WSOnDBKey = WW.Rnd(0x4000000000000)
					Med = V.ID + Med
					WSSend(Proto.DBSite,{ID : WSOnDBKey,Med : Med,JSON : WC.OTJ([Inp])})
					return WSOnDB = WX.R()
				},
				Bad : function(Q,S)
				{
					WW.Throw(null == S ?
						Q :
						WW.IsArr(S) ?
							LangSolve(Q,S) :
							WW.Quo(Q) + S)
				},
				BadR : function(Q)
				{
					WW.Throw(LangSolve('ErrBadRes',[WW.IsObj(Q) ? WC.OTJ(Q) : Q]))
				},
				Num : function(Q)
				{
					return RegExp('\\b(?:' + Q + ')(?![A-Z])(?:\\D*\\b)?(\\d+)\\b','i')
				},
				NumR : function(Q)
				{
					return RegExp('\\b(\\d+)\\b[^\\dA-Z]*(?:' + Q + ')\\b','i')
				},
				Word : function(Q)
				{
					return RegExp('\\b(?:' + Q + ')(?:[\\s/=]+|\\b)([^&?#\\s/]+)','i')
				},
				/*
				NameTL :
				[
					'Dynamic',
					'Bookmark',
					'Feed',
					'Home',
					'Repo',
					'Subscribe',
					'Subscription',
					'Timeline',
					'Top'
				],
				*/
				NameUP :
				[
					'Following',
					'Uploader'
				],
				NameFind :
				[
					'Search',
					'Find',
					'?'
				],
				ValNum : /\d+/,
				Size : ConfPageSize,
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
				Less : function(H,ItemMap)
				{
					/**@type {CrabSaveNS.SiteItem[]}*/
					var Cache;
					return function(ID,Page)
					{
						return (Page && Cache ? WX.Just(Cache) : H(ID)).FMap(function(V)
						{
							var C = Math.ceil(V.length / ConfPageSize);
							Cache = V
							V = V.slice(Page * ConfPageSize,-~Page * ConfPageSize)
							return (ItemMap ? ItemMap(V,ID) : WX.Just(V)).Map(function(V)
							{
								return {
									At : Page < C ? Page : Page = C && ~-C,
									Max : C,
									Len : Cache.length,
									Size : ConfPageSize,
									Item : V
								}
							})
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
								var Index;
								R = M(R,Cache,Page)
								if (R[0]) Cache[-~Page] = R[0]
								R = R[1]
								Len -= (Count[Page] || 0) - (Count[Page] = R.Item.length)
								if (null == R.Len) R.Len = Len
								if (null == R.Max) R.Max = Cache.length
								Index = WR.Sum(Count.slice(0,Page))
								WR.Each(function(V)
								{
									if (null == V.Index) V.Index = Index++
								},R.Item)
								return R
							})
					}
				},
				Walk : function(Q,S)
				{
					var
					H = function(V,F)
					{
						if (WW.IsObj(V))
							S(V,F) || WR.EachU(H,V)
					};
					H(Q)
				},
				SolU : SolveURL,
				DTS : DTS,
				High : MakeHigh,
				RepCon : function(Q,S,K)
				{
					K = WR.Key(S)
					return K.length ?
						WR.MapU(function(V,F)
						{
							return 1 & F ? S[V](V) : V
						},Q.split(RegExp(WW.QuoP(WR.Map(WR.SafeRX,K).join('|'),true)))) :
						Q
				},
				Ah : function(Title,URL)
				{
					return WV.X(WV.Ah(Title,URL))
				},
				Img : function(URL,Title)
				{
					return URL && WV.Ti(WV.Attr(WV.A('img'),'src',MakeImgURL(URL)),Title || '')
				},
				Text : function(Q)
				{
					return Q && WC.HED(Q
						.split(/<br\b[^>]*>|<\/(?:figure|h\d+|p)\b>/)
						.map(WR.Rep(/\s*(\r?\n|\r)\s*/g,' '))
						.join('\n')
						.replace(/<.*?>/g,''))
						.replace(/.+/g,WR.Trim)
				},
				Progress : BrowserOnProgress
			},WW,WC,WR,WX,WV);
			if (!WW.IsNum(SiteMap[V.ID])) return
			SiteAll[SiteMap[V.ID]] = V
			SiteInit(V)
			SiteOnNoti(++SiteCount)
		}
		CrabSave.Err = RecordErrList
		CrabSave.Req = Req
		CrabSave.Proto = DebugProto
		CrabSave.Inspect = function()
		{
			WSSend(Proto.AuthInspect,{JSON : WC.OTJ(WW.Arr(arguments))})
		}
		CrabSave.Reload = function()
		{
			WSSend(Proto.AuthReload)
		}
		CrabSave.Vacuum = function()
		{
			WSSend(Proto.AuthVacuum)
		}
		CrabSave.Debug = function()
		{
			WSSend(Proto.AuthDebug)
		}
		CrabSave.Cut = function()
		{
			WS.F()
		}
		Conf.Unsafe && WW.Merge(CrabSave.Unsafe = Unsafe,
		{
			Proto : Proto,
			SiteMap : SiteMap,
			SiteAll : SiteAll,
			Key : DBBriefKey,
			IsCold : IsCold,
			IsHot : IsHot,
			IsHistory : IsHistory,
			ColdAdd : ColdAdd,
			ColdDel : ColdDel,
			Setting : Setting,
			IsSPUP : SettingIsSPUP,
			WSSend : WSSend
		})
		SiteBegin = WW.Now()
		WW.To(1E3,function(){SiteCount < SiteTotal && SiteOnNoti()})
		SiteTotal = WR.EachU(function(V,F)
		{
			WV.Ap(WV.Attr(WV.A('script'),'src',ConfURLSite + V),WV.Head)
			SiteMap[V] = F
		},[
			'BiliBili',
			'YouTube',
			'NicoNico',

			'AcFun',
			'BSky',
			'DouYin',
			'Facebook',
			'FanBox',
			'Fantia',
			'HicceArs',
			'Instagram',
			'IXiGua',
			'KakuYomu',
			'NicoChannel',
			'Pixiv',
			'ShenHaiJiaoYu',
			'ShonenMagazine',
			'TikTok',
			'Twitter',
			'Vimeo',
			'WeiBo',

			'Manual'
		]).length
		SiteOnNoti()
		WW.To(ConfTickInterval,function(F)
		{
			for (F = 0;F < TickQueue.length;++F)
				TickQueue[F]()
		},true)
		OverallUpdate()

		SiteInit(
		{
			ID : '?',
			Map : [
			{
				Name : 'Site',
				View : function()
				{
					return WX.Just(
					{
						Item : WR.Map(function(V)
						{
							return {
								Non : true,
								ID : V.ID,
								Title : V.Name || V.ID,
								More : WR.Map(function(B)
								{
									return B
								},V.Alias)
							}
						},SiteAll)
					})
				}
			}]
		})
	})
}()