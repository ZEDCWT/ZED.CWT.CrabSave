(() =>
{
	'use strict'
	var
	Started = new Date,
	ZED = require('@zed.cwt/zedquery'),
	Observable = ZED.Observable,

	Config = require('../Config'),
	Util = require('./Util'),
	ReplaceLang = Util.ReplaceLang,
	Bus = Util.Bus,
	Key = require('./Key'),
	KeySite = Key.Site,
	KeyQueue = Key.Queue,
	KeySetting = Key.Setting,
	Event = require('./Event'),
	EventQueue = Event.Queue,
	EventDownload = Event.Download,
	Lang = require('./Lang'),
	L = Lang.L,
	DOM = require('./DOM'),
	DOMCard = DOM.Card,
	ShortCut = require('./ShortCut'),
	ShortCutCommand = ShortCut.Command,
	Site = require('./Site'),
	SiteAll = Site.All,
	SiteMap = Site.Map,
	Cold = require('./Cold'),
	Queue = require('./Queue'),
	QueueHInfo = ZED.unary(Observable.wrapNode(Queue.HInfo)),
	Download = require('./Download'),
	Cookie = require('./Cookie'),
	Setting = require('./Setting'),

	$ = ZED.jQuery,

	global = ZED.global,
	setTimeout = global.setTimeout,

	Path = require('path'),
	Windows = /win/.test(process.platform),

	Electron = require('electron'),
	IPCRenderer = Electron.ipcRenderer,
	Remote = Electron.remote,
	WebContent = Remote.getCurrentWebContents(),
	Dialog = Remote.dialog,
	ViewReload = () => WebContent.reload(),
	ViewDevIsOpen = () => WebContent.isDevToolsOpened(),
	ViewDevToggle = () => WebContent.toggleDevTools(),



	DateToStringFormatFile = '%YYYY%.%MM%.%DD%.%HH%.%NN%.%SS%',
	DateToStringFormatDisplay = '%YYYY%.%MM%.%DD% %HH%:%NN%:%SS%.%MS%',
	ReKeyGenStore = [],
	ReKeyGen = Q => Q ?
		ReKeyGenStore.shift() :
		(
			ReKeyGenStore.push(Q = ZED.KeyGen()),
			Q
		),
	MakeSiteDate = Q =>
	(
		Q = Q[KeySite.Date],
		ZED.isDate(Q) || ZED.now(new Date(Q)) ?
			ZED.DateToString(DateToStringFormatFile,Q) :
			Q
	),
	MakeEnter = (Q,S) => ZED.ShortCut({Target : Q}).on('enter',S),
	MakeShape = (S,Q,C,T) => ShowByClassX(ClassShape + (C ? ' ' + C : ''),T || DOM.span)
		.attr(DOM.title,L(S))
		.append(ZED.Shape(Q)),

	MakeS = Q => 1 === Q ? '' : 's',
	ShowByRock = Q => $(DOM.div).attr(DOM.id,Q),
	ShowByClass = Q => $(DOM.div).attr(DOM.cls,Q),
	ShowByClassX = (Q,S) => $(S).attr(DOM.cls,Q),
	ShowByText = (Q,S) => $(S || DOM.div).text(Q),
	ShowByInput = (Q,S) => ShowByClassX(ClassUnderlineInput,S || DOM.input)
		.attr(DOM.placeholder,L(Q)),
	ShowByCheckBox = (S,J,C,I,T) => ShowByClass(ClassCheckBox).append
	(
		I = $(DOM.input).attr(DOM.type,DOM.checkbox).attr(DOM.checked,!!J)
			.attr(DOM.id,T = ZED.KeyGen())
			.on(DOM.change,() => C(I[0][DOM.checked])),
		ShowByClassX(DOM.NoSelect,DOM.label).attr(DOM.for,T).text(L(S))
	),
	MakeAt = (Q,S) => Q && S ?
		ShowByClass(ClassSingleLine).attr(DOM.title,Q + '@' + S).append
		(
			ShowByText(Q),
			ShowByText('@',DOM.span),
			ShowByText(S)
		) :
		ShowByClass(ClassSingleLine).attr(DOM.title,Q).text(Q),
	MakeSizePercentage = (S,D) => ZED.isNull(S) ?
		L(Lang.Calculating) :
		S ?
			S === D ?
				ReplaceLang(Lang.Completed,ZED.FormatSize(S)) :
				ReplaceLang(Lang.SizeP,ZED.FormatSize(D),ZED.FormatSize(S),ZED.Format(100 * D / S)) :
			ReplaceLang(Lang.SizeNP,ZED.FormatSize(D)),



	//Config
	//	Misc
	YTabCount = 8,
	//	Global
	YPadding = 10,
	YPaddingHalf = 5,
	YScrollWidth = 16,
	YShadowSize = 10,
	YShadowColor = 'rgba(0,0,0,.4)',
	//		ToolBar
	YToolBarHeight = 40,
	//		Navi
	YNaviWidth = 150,
	//		Stage
	YStageHeight,
	YStageWidth,
	YStageWidthWithoutScroll,
	YListSVG = 20,
	YCardWidthMin = 160,
	YCardWidthMax = 200,
	//		StatusBar
	YStatusBarHeight = 40,
	//		Tab
	//			Hot
	YHotTitlePercentage = .8,
	YHotControlSize = 16,
	YHotControlPadding = 6,
	YHotControlMoreWidth = YHotControlSize + YHotControlPadding + YHotControlSize,
	YHotControlWidth = YHotControlPadding + YHotControlSize + YHotControlPadding + YHotControlMoreWidth,
	//			History
	YHistoryTitlePercentage = YHotTitlePercentage,
	YHistoryControlPadding = YHotControlPadding,
	YHistoryControlMoreWidth = YHotControlMoreWidth,
	YHistoryControlWidth = YHotControlWidth,
	//			Sign in
	YSignInSiteWidth = 100,
	//			Setting
	YSettingOpenSize = 30,

	//ID & Class
	//	Global
	IDRainbow = ZED.KeyGen(),
	//		Toolbar
	IDToolBar = ZED.KeyGen(),
	IDToolBarIcon = ZED.KeyGen(),
	IDToolBarItem = ZED.KeyGen(),
	ClassToolBarDisabled = ZED.KeyGen(),
	//		Navi Stage
	IDNaviStage = ZED.KeyGen(),
	IDNavi = ZED.KeyGen(),
	ClassCount = ZED.KeyGen(),
	IDStage = ZED.KeyGen(),
	ClassListSelected = ZED.KeyGen(),
	ClassScrollable = ZED.KeyGen(),
	//		Cover
	ClassCover = ZED.KeyGen(),
	IDDetail = ZED.KeyGen(),
	IDDetailHead = ZED.KeyGen(),
	IDDetailInfo = ZED.KeyGen(),
	ClassDetailLabel = ZED.KeyGen(),
	IDDetailPart = ZED.KeyGen(),
	IDMerge = ZED.KeyGen(),
	//		StatusBar
	IDStatusBar = ZED.KeyGen(),
	IDStatusBarWrap = ZED.KeyGen(),
	IDStatusBarRight = ZED.KeyGen(),
	IDStatus = ZED.KeyGen(),
	IDStatusIcon = ZED.KeyGen(),
	ClassStatusIconAnimation = ZED.KeyGen(),
	ClassStatusInfo = ZED.KeyGen(),
	ClassStatusLoading = ZED.KeyGen(),
	ClassStatusError = ZED.KeyGen(),
	IDSpeed = ZED.KeyGen(),
	ClassShadowBar = ZED.KeyGen(),
	ClassError = ZED.KeyGen(),
	//	Util
	ClassUnderlineInput = ZED.KeyGen(),
	ClassShape = ZED.KeyGen(),
	ClassSingleLine = ZED.KeyGen(),
	ClassCheckBox = ZED.KeyGen(),
	//	Browser
	IDBrowserInput = ZED.KeyGen(),
	IDBrowserHint = ZED.KeyGen(),
	ClassBrowserHintOn = ZED.KeyGen(),
	IDBrowserInfo = ZED.KeyGen(),
	IDBrowserPref = ZED.KeyGen(),
	ClassBrowserHover = ZED.KeyGen(),
	//	Cold
	ClassColdCommitAll = ZED.KeyGen(),
	//	Hot
	ClassHotTitleInfo = ZED.KeyGen(),
	ClassHotTitle = ZED.KeyGen(),
	ClassHotInfo = ZED.KeyGen(),
	ClassHotStatus = ZED.KeyGen(),
	ClassHotControl = ZED.KeyGen(),
	ClassHotControlRemove = ZED.KeyGen(),
	ClassHotControlPP = ZED.KeyGen(),
	ClassHotControlMore = ZED.KeyGen(),
	ClassHotPercentage = ZED.KeyGen(),
	ClassHotPercentageTransition = ZED.KeyGen(),
	ClassHotPercentageActive = ZED.KeyGen(),
	ClassHotPercentageAlways = ZED.KeyGen(),
	ClassHotSizeUnknown = ZED.KeyGen(),
	//	History
	ClassHistoryToolMerge = ZED.KeyGen(),
	ClassHistoryTitleInfo = ZED.KeyGen(),
	ClassHistoryTitle = ClassHotTitle,
	ClassHistoryInfo = ClassHotInfo,
	ClassHistoryStatus = ClassHotStatus,
	ClassHistoryControlRemove = ClassHotControlRemove,
	ClassHistoryControlMore = ClassHotControlMore,
	//	Component
	ClassComponentSite = ZED.KeyGen(),
	ClassComponentSiteActive = ZED.KeyGen(),
	ClassComponentView = ZED.KeyGen(),
	IDComponentInfo = ZED.KeyGen(),
	//	Sign in
	ClassSignInSite = ClassComponentSite,
	ClassSignInSiteActive = ClassComponentSiteActive,
	ClassSignInView = ClassComponentView,
	IDSignInInputVCode = ZED.KeyGen(),
	//	ShortCut
	ClassShortCutTitle = ZED.KeyGen(),
	ClassShortCutButton = ZED.KeyGen(),
	//	Setting
	ClassSettingDir = ZED.KeyGen(),
	ClassSettingDirOpen = ZED.KeyGen(),

	//Element
	Rainbow = ShowByRock(IDRainbow),
	RToolBar = ShowByRock(IDToolBar),
	RToolBarIcon = ShowByRock(IDToolBarIcon),
	RToolBarItem = ShowByRock(IDToolBarItem),
	RNavi = $(DOM.div),
	RStage = ShowByRock(IDStage),
	//	Cover
	RDetail = ShowByRock(IDDetail).attr(DOM.cls,ClassCover),
	RDetailHead = ShowByRock(IDDetailHead),
	RDetailInfo = ShowByRock(IDDetailInfo),
	RDetailPart = ShowByRock(IDDetailPart),
	RDetailChildren = $(ZED.flatten([RDetailHead,RDetailInfo,RDetailPart])),
	RMerge = ShowByRock(IDMerge).attr(DOM.cls,ClassCover),
	RMergeProgress = $(DOM.div),
	RMergeText = ShowByClassX(DOM.Input,DOM.textarea),
	RMergeChildren = $(ZED.flatten([RMergeProgress])),
	//	StatusBar
	RStatusBar = ShowByRock(IDStatusBar),
	RStatus = ShowByRock(IDStatus),
	RStatusIcon = ShowByRock(IDStatusIcon)
		.on(DOM.aniend,() => RStatusIcon.removeClass(ClassStatusIconAnimation)),
	RStatusText = ShowByClass(ClassSingleLine),
	RSpeed = ShowByRock(IDSpeed),
	RHidden = ShowByRock().hide(),



	//
	ShapeConfigColorDisabled = '#D1D1D1',
	ShapeConfigColorEnabled = '#7D7D7D',
	ShapeConfigColorHover = '#852ED9',
	ShapeConfigColorBackground = '#A9A9A9',
	ShapeConfigColdToolCommit =
	{
		Type : 'Tick',
		Fill : Util.F,
		Stroke : ShapeConfigColorEnabled,
		Line : '12%'
	},
	ShapeConfigColdToolRemove =
	{
		Fill : Util.F,
		Stroke : ShapeConfigColorEnabled,
		Line : '12%',
		Padding : '10%'
	},
	ShapeConfigColdToolCommitAll =
	{
		Type : 'Tick',
		Fill : Util.F,
		Stroke : ShapeConfigColorEnabled,
		Line : '5%'
	},
	ShapeConfigColdListCommit =
	{
		Type : 'Tick',
		Fill : ShapeConfigColorBackground,
		Line : '20%'
	},
	ShapeConfigHotToolPlay =
	{
		Type : 'Play',
		Fill : Util.F,
		Stroke : ShapeConfigColorEnabled,
		Line : '80%'
	},
	ShapeConfigHotToolPause =
	{
		Type : 'Pause',
		Padding : '10%',
		Line : '12%',
		Fill : Util.F,
		Stroke : ShapeConfigColorEnabled,
		Pause : 3 / 10
	},
	ShapeConfigHotToolRemove = ShapeConfigColdToolRemove,
	ShapeConfigHotListRemove = ShapeConfigColdToolRemove,
	ShapeConfigHotListPlay =
	{
		Type : 'Play',
		Line : '60%',
		Fill : ShapeConfigColorBackground,
		Stroke : '#F7F7F7'
	},
	ShapeConfigHotListPause =
	{
		Type : 'Pause',
		Padding : '25%',
		Fill : ShapeConfigColorBackground,
		Line : '37.5%'
	},
	ShapeConfigHotListMore =
	{
		Type : 'More',
		Fill : Util.F,
		Stroke : ShapeConfigColorBackground
	},
	ShapeConfigHistoryToolRemove = ShapeConfigHotToolRemove,
	ShapeConfigHistoryToolMerge =
	{
		Type : 'Merge',
		Fill : Util.F,
		Stroke : ShapeConfigColorEnabled
	},
	ShapeConfigHistoryListRemove = ShapeConfigHotListRemove,
	ShapeConfigHistoryListMore = ShapeConfigHotListMore,
	ShapeConfigShortCutAdd =
	{
		Type : 'Plus',
		Fill : Util.F,
		Stroke : ShapeConfigColorBackground,
		Line : '20%'
	},
	ShapeConfigShortCutRemove =
	{
		Type : 'Minus',
		Fill : Util.F,
		Stroke : ShapeConfigColorBackground,
		Line : '20%'
	},
	ShapeConfigSettingDir =
	{
		Type : 'More',
		Fill : Util.F,
		Stroke : ShapeConfigColorBackground,
		Rotate : 90
	},

	//Component
	//	ToolBar
	MakeToolBarStorage = Array(YTabCount),
	MakeToolBarLast,
	MakeToolBarChange = () =>
	{
		MakeToolBarLast && MakeToolBarLast.detach()
		if (MakeToolBarLast = MakeToolBarStorage[UTab.Index()])
			RToolBarItem.append(MakeToolBarLast)
	},
	MakeToolBar = (X,Q) => MakeToolBarStorage[X] = Q,
	MakeToolBarActive = (S,Q) => Q ?
		S.removeClass(ClassToolBarDisabled) :
		S.addClass(ClassToolBarDisabled),

	//	Count
	MakeCount = (Q,S,R) =>
	(
		S = ShowByClassX(ClassCount,DOM.span),
		R = $(DOM.div).append(L(Q),S),
		Q => ZED.isNull(Q) ? R : S.text(Q ? '[' + Q + ']' : '')
	),
	RColdCount = MakeCount(Lang.Cold),
	RHotCount = MakeCount(Lang.Hot),

	//	Selectable list
	MakeSelectableList =
	(
		Scroll,Index,
		Data,Map,Key,
		Measure,Make,Destroy,
		SelectChange,
		OnSelect,OnUnselect,OnClear
	) => {
		var
		LastScroll = 0,

		LastIndex = 0,
		LastID,
		Selecting = {},
		Count = 0,
		Active = {},

		Clear = () =>
		{
			ZED.EachKey(Selecting,(V) =>
			{
				V = Active[V],
				V && V.removeClass(ClassListSelected)
			})
			Selecting = {}
			LastIndex = 0
			LastID = Util.F
			Count = 0
			OnClear()
		},
		Change = () => SelectChange(Count),
		ClearChange = ZED.pipe(Clear,Change),
		List = ZED.ListView(
		{
			Scroll : Scroll,
			Data : Data,
			Measure : Measure,
			Make : (Q,X) =>
			{
				var
				ID = Key ? Q[Key] : Q,
				On = Selecting[ID],
				R = Active[ID] = Make(Q,X);

				R.on(DOM.click,E =>
				{
					var
					Shift = E.shiftKey,
					Ctrl = E.ctrlKey,
					J = Util.T,
					S,L,T,F;

					On = Selecting[ID]
					if (Shift)
					{
						S = Selecting
						Selecting = {}
						LastIndex < X ?
						(
							F = LastIndex,
							L = X
						) : (
							L = LastIndex,
							F = X
						)
						Count = L - F + 1
						for (;F <= L;++F)
						{
							T = Key ? Data[F][Key] : Data[F]
							Selecting[T] = Data[F]
							if (!S[T])
							{
								J = Active[T]
								J && J.addClass(ClassListSelected)
								OnSelect(Data[F])
							}
						}
						ZED.Each(S,(F,V) =>
						{
							Selecting[F] ||
							(
								F = Active[F],
								F && F.removeClass(ClassListSelected),
								OnUnselect(V)
							)
						})
						J = Util.F
					}
					else if (Ctrl)
					{
						J = Util.F
						LastIndex = X
						LastID = ID
						On = !On
						On ?
						(
							++Count,
							R.addClass(ClassListSelected),
							Selecting[ID] = Q,
							OnSelect(Q)
						) : (
							--Count,
							R.removeClass(ClassListSelected),
							ZED.delete_(ID,Selecting),
							OnUnselect(Q)
						)
					}
					if (J)
					{
						Clear()
						LastIndex = X
						LastID = ID
						Selecting[ID] = Q
						Count = 1
						R.addClass(ClassListSelected)
						OnSelect(Q)
					}
					Change()
					Util.StopProp(E)
				})
				On && R.addClass(ClassListSelected)
				return R
			},
			Destroy : (Q,V) =>
			{
				Q.off(DOM.click)
				Active[Key ? V[Key] : V] = Util.F
				Destroy(V,Q)
			},
			Later : Util.T
		}),

		Redraw = () =>
		{
			Active = {}
			if (Count)
			{
				ZED.Each(Selecting,(F,V) => ZED.has(F,Map) ||
				(
					--Count,
					ZED.delete_(F,Selecting),
					OnUnselect(V)
				))
				LastIndex = LastID ? ZED.max(0,Data.indexOf(Map[LastID])) : 0
			}
			List.recalc().redraw().scroll(LastScroll)
			Change()
		},

		PrevDefKey = ZED.KeyGen();

		Scroll.addClass(DOM.NoSelect).on(DOM.click,ClearChange)
		UShortCut.cmd(ShortCutCommand.ListClear,MakeIndex(Index,ClearChange))
			.cmd(ShortCutCommand.ListAll,MakeIndex(Index,() =>
			{
				ZED.each((V,ID) =>
				{
					ID = Key ? V[Key] : V
					if (!Selecting[ID])
					{
						Selecting[ID] = V
						ID = Active[ID]
						ID && ID.addClass(ClassListSelected)
						OnSelect(V)
					}
				},Data)
				LastIndex = 0
				LastID = Util.F
				Count = Data.length
				Change()
			}))
			.on('pgup',PrevDefKey,PrevDefKey,Util.T)
			.on('pgdn',PrevDefKey,PrevDefKey,Util.T)
			.on('home',PrevDefKey,PrevDefKey,Util.T)
			.on('end',PrevDefKey,PrevDefKey,Util.T)
			.cmd(PrevDefKey,MakeIndex(Index,Util.PrevDef))
			.cmd(ShortCutCommand.ListPgUp,MakeIndex(Index,() => List.scroll(List.scroll() - Scroll.height() + 50)))
			.cmd(ShortCutCommand.ListPgDn,MakeIndex(Index,() => List.scroll(List.scroll() + Scroll.height() - 50)))
			.cmd(ShortCutCommand.ListPgTp,MakeIndex(Index,() => List.scroll(0)))
			.cmd(ShortCutCommand.ListPgBt,MakeIndex(Index,() => List.scroll(List.range())))

		return {
			Count : () => Count,
			Selecting : () => Selecting,
			Show : Redraw,
			Hide : () => LastScroll = List.scroll(),
			Redraw : () =>
			{
				if (Index === UTab.Index())
				{
					LastScroll = List.scroll()
					Redraw()
				}
			}
		}
	},
	MakeSelecting = (X,R) =>
	{
		R = R.Count()
		MakeStatus(X,R ? ReplaceLang(Lang.SelectingN,R,MakeS(R)) : '')
	},
	MakeSelSize = (X,R,S,P) =>
	{
		R = R.Count()
		MakeStatus(X,R ? ReplaceLang
		(
			Lang.SelSizeN,
			R,MakeS(R),
			ZED.FormatSize(S),
			P ? '+' : ''
		) : '')
	},
	MakeSelectableListShow = ZED.flip(ZED.invokeProp('Show')),
	MakeSelectableListHide = ZED.flip(ZED.invokeProp('Hide')),

	//	Cover
	MakeCoverActive,
	MakeCoverAt,
	MakeCoverOn = () =>
	{
		MakeCoverActive = Util.T
		MakeCoverAt = UTab.Index()
		MakeToolBarLast && MakeToolBarLast.detach()
		RStatusText.text('')
		RStatusIcon.removeAttr(DOM.cls)
	},
	MakeCoverOff = () =>
	{
		MakeCoverActive = Util.F
		MakeCoverAt === UTab.Index() && MakeToolBarChange()
		MakeStatusChange()
	},

	//		Detail
	MakeDetailActive,
	MakeDetailTitle,
	MakeDetailInfoProgress,
	MakeDetailInfoDir,
	MakeDetailInfoTTS,
	MakeDetailInfoDownloaded,
	MakeDetailFile,
	MakeDetailURL,
	MakeDetailSetupSingle = (S,Q) => ShowByClass(ClassSingleLine).append
	(
		ShowByClassX(ClassDetailLabel,DOM.span).text(L(S)),
		' ',
		ZED.isObject(Q) ? Q : ShowByText(Q,DOM.span)
	),
	MakeDetailProgress = Q => Q[KeyQueue.Finished] ?
		ReplaceLang(Lang.FinishedAt,ZED.DateToString(DateToStringFormatDisplay,Q[KeyQueue.Finished])) :
		Q[KeyQueue.Done] ?
			0 < Q[KeyQueue.Size] ?
				ZED.Format(100 * Q[KeyQueue.DoneSum] / Q[KeyQueue.Size]) + '%' :
				L(Lang.Unfinished) :
			'0%',
	MakeDetailSize = Q => Q[KeyQueue.Size] < 0 ?
		L(Lang.Calculating) :
		Q[KeyQueue.Size] ?
			ZED.FormatSize(Q[KeyQueue.Size]) :
			L(Lang.SizeUn),
	MakeDetailSetupURL = (V,Q) =>
	{
		ZED.each(V =>
		{
			var I = MakeDetailURL.length,File,Size;

			RDetailPart.append($(DOM.div).append
			(
				ShowByClass(ClassSingleLine).attr(DOM.title,V).text(V),
				File = ShowByText(Q[KeyQueue.File][I] || ''),
				Size = ShowByText
				(
					Q[KeyQueue.Sizes] ?
						MakeSizePercentage(Q[KeyQueue.Sizes][I],Q[KeyQueue.Done][I]) :
						L(Lang.GetSize),
					DOM.span
				)
			))
			MakeDetailFile.push(File)
			MakeDetailURL.push(Size)
		},V)
	},
	MakeDetailSetupInfo = Q =>
	{
		var
		Part = Q[KeyQueue.Part];

		Q[KeyQueue.Title] && MakeDetailTitle.text(Q[KeyQueue.Title])
		RDetailInfo.empty().append
		(
			MakeDetailSetupSingle(Lang.Created,ZED.DateToString(DateToStringFormatDisplay,Q[KeyQueue.Created])),
			MakeDetailSetupSingle(Lang.Progress,MakeDetailInfoProgress = ShowByText(MakeDetailProgress(Q),DOM.span)),
			MakeDetailSetupSingle(Lang.Author,Q[KeyQueue.Author]),
			MakeDetailSetupSingle(Lang.UpDate,ZED.DateToString(DateToStringFormatFile,Q[KeyQueue.Date])),
			MakeDetailSetupSingle(Lang.Parts,Part.length),
			MakeDetailSetupSingle(Lang.Files,Q[KeyQueue.File].length),
			MakeDetailSetupSingle(Lang.Directory,MakeDetailInfoDir = ShowByText(Q[KeyQueue.Dir] || L(Lang.NoDir),DOM.span)),
			MakeDetailSetupSingle(Lang.TTS,MakeDetailInfoTTS = ShowByText(MakeDetailSize(Q),DOM.span)),
			MakeDetailSetupSingle
			(
				Lang.Downloaded,
				MakeDetailInfoDownloaded = ShowByText(ZED.FormatSize(Q[KeyQueue.DoneSum]),DOM.span)
			)
		)

		MakeDetailFile = []
		MakeDetailURL = []
		RDetailPart.empty()
		if (Part.length) ZED.Each(Part,(F,V) =>
		{
			RDetailPart.append
			(
				ShowByText(ReplaceLang(Lang.PartN,F,Part.length),DOM.span)
					.attr(DOM.cls,ClassDetailLabel),
				V[KeyQueue.Title] ? ' ' + V[KeyQueue.Title] : ''
			)
			MakeDetailSetupURL(V[KeyQueue.URL],Q)
		})
		else MakeDetailSetupURL(Part[0][KeyQueue.URL],Q)
	},
	MakeDetailRefresh = Q =>
	{
		var
		Size = Q[KeyQueue.Sizes],
		Done = Q[KeyQueue.Done];

		MakeDetailInfoProgress && MakeDetailInfoProgress.text(MakeDetailProgress(Q))
		Done && MakeDetailInfoDownloaded.text(ZED.FormatSize(Q[KeyQueue.DoneSum]))
		Size && ZED.Each(MakeDetailURL,(F,V) => V.text(MakeSizePercentage(Size[F],Done[F])))
	},
	MakeDetailSetup = (ID,Q) =>
	{
		MakeCoverOn()
		if (MakeDetailActive) RDetailChildren.empty()
		else RStage.append(RDetail)
		MakeDetailActive = ID

		RDetailHead.append
		(
			MakeDetailTitle = ShowByText(Q[KeyQueue.Title]),
			ShowByText(Q[KeyQueue.Name] + ' ' + SiteMap[Q[KeyQueue.Name]][KeySite.IDView](Q[KeyQueue.ID]),DOM.span)
		)
		if (Q[KeyQueue.Part]) MakeDetailSetupInfo(Q)
		else RDetailInfo.text(L(Queue.IsInfo(Q[KeyQueue.Unique]) ? Lang.GetInfo : Lang.ReadyInfo))
	},
	MakeDetailQuerying,
	MakeDetail = (Q,J) =>
	{
		J = ZED.isArray(Q)
		J && (Q = Q[0])
		if (MakeDetailQuerying !== Q)
		{
			MakeDetailQuerying = Q
			if (!J && Download.Active[Q])
			{
				MakeDetailQuerying = Util.F
				MakeDetailSetup(Q,Download.Active[Q].Q)
			}
			else (J ? Queue.HInfo : Queue.Info)(Q,(E,R) =>
			{
				if (!E && MakeDetailQuerying === Q)
				{
					MakeDetailQuerying = Util.F
					MakeDetailSetup(Q,R)
				}
			})
		}
	},
	MakeDetailClose = () =>
	{
		if (MakeDetailActive)
		{
			RDetailChildren.empty()
			RDetail.detach()
			MakeCoverOff()
			MakeDetailActive =
			MakeDetailInfoDir =
			MakeDetailInfoTTS =
			MakeDetailInfoDownloaded =
			MakeDetailFile =
			MakeDetailURL = Util.F
		}
	},
	MakeDetailMake = H => (Q,S,R) => MakeDetailActive === Q[KeyQueue.Unique] && H(Q,S,R),

	//		Merge
	MakeMergeEnd,
	MakeMergeAble,
	MakeMergeStore,
	MakeMergeProcess = (L,S) => RMergeProgress.text(ReplaceLang(Lang.ProcessingN,S,L)),
	MakeMergeEscapeWin = [ZED.ShellWinProgram,ZED.ShellWinArgument],
	MakeMergeEscapeUnix = [ZED.ShellUnix,ZED.ShellUnix],
	MakeMergeCompose = H =>
	{
		var
		Make = Setting.Data(KeySetting.Merge),
		Len,
		MakeIsString,
		MakeIsTail,

		File,O = {},
		R = [],S,
		In = Q => S.push(H[1](ZED.Replace(Q,'|',O))),
		F,Fa,Fb,Fc;

		/^\s*\[/.test(Make) || (Make = '[' + Make + ']')
		Make = ZED.JTO(Make)

		if (!ZED.isArray(Make))
		{
			return RMergeText.val(L(Lang.BadCmd))
		}
		Len = Make.length
		MakeIsString = Array(Len)
		MakeIsTail = Array(Len)

		for (F = 0;++F < Len;)
		{
			File = Make[F]
			if (F && ZED.isArray(File))
			{
				MakeIsTail[F] = /_/.test(ZED.Replace
				(
					('' + File).replace(/_/g,''),
					'|',
					{Tail : '_'}
				))
			}
			else
			{
				MakeIsString[F] = Util.T
				if (!ZED.isString(File)) Make[F] = String(File)
			}
		}

		for (F = 0;F < MakeMergeStore.length;++F)
		{
			File = MakeMergeStore[F]
			O.Output = File[0]
			File = File[1]
			O.Head = File[0]
			S = [H[0](Make[0])]
			for (Fa = 0;++Fa < Len;)
			{
				if (MakeIsString[Fa]) In(Make[Fa])
				else if (MakeIsTail[Fa]) for (Fb = 0;++Fb < File.length;)
				{
					O.Tail = File[Fb]
					for (Fc = 0;Fc < Make[Fa].length;++Fc) In(Make[Fa][Fc])
				}
				else for (Fb = 0;Fb < File.length;++Fb)
				{
					O.List = File[Fb]
					for (Fc = 0;Fc < Make[Fa].length;++Fc) In(Make[Fa][Fc])
				}
			}
			R.push(S.join(' '))
		}
		RMergeText.val(R.join('\n') + '\n')
	},
	MakeMerge = (Q,L) =>
	{
		Q = ZED.keys(Q)
		if (L = Q.length)
		{
			MakeCoverOn()
			if (MakeMergeEnd)
			{
				MakeMergeEnd.end()
				RMergeChildren.empty()
				RMergeText.val('')
			}
			else RStage.append(RMerge)

			MakeMergeProcess(L,0)
			MakeMergeStore = []
			MakeMergeAble = Util.F
			MakeMergeEnd = Util.from(Q)
				.flatMapOnline(1,QueueHInfo)
				.map((Q,F) =>
				{
					var
					Parts,
					Part,
					I = 0,T;

					MakeMergeProcess(L,1 + F)
					if (1 < Q[KeyQueue.File].length)
					{
						Parts = Q[KeyQueue.Part]
						for (F = 0;F < Parts.length;++F)
						{
							Part = Parts[F]
							T = Part[KeyQueue.URL].length
							Part[KeyQueue.Suffix] = '.' + Setting.Data(KeySetting.Suffix)
							if (1 < T)
							{
								MakeMergeStore.push(
								[
									Download.FileName(Q,Parts.length,0,Part,F,0,0),
									ZED.map
									(
										V => Path.join(Q[KeyQueue.Dir],V),
										Q[KeyQueue.File].slice(I,I + T)
									)
								])
							}
							I += T
						}
					}
				}).start(Util.N,E =>
				{
					Util.Debug(__filename,E)
					RMergeProgress.text(L(Lang.Errored))
				},() =>
				{
					MakeMergeAble = Util.T
					MakeMergeCompose(Windows ? MakeMergeEscapeWin : MakeMergeEscapeUnix)
				})
		}
	},
	MakeMergeClose = () =>
	{
		if (MakeMergeEnd)
		{
			RMergeChildren.empty()
			RMerge.detach()
			RMergeText.val('')
			MakeMergeEnd.end()
			MakeCoverOff()
			MakeMergeEnd =
			MakeMergeStore =
			MakeMergeAble = Util.F
		}
	},
	MakeCoverClose = () =>
	{
		MakeDetailClose()
		MakeMergeClose()
	},

	//	Noti
	MakeNoti = ZED.Noti({Parent : RStage,Close : L(Lang.Close)}),
	//		DB Load
	MakeDBLoadKey = ZED.KeyGen(),
	MakeDBLoadState = 0,

	//	StatusBar
	MakeStatusText = Array(YTabCount),
	MakeStatusClass = Array(YTabCount),
	MakeStatusChange = (X,Q,S) =>
	{
		X = UTab.Index()
		Q = MakeStatusText[X]
		S = MakeStatusClass[X]
		if (Q)
		{
			RStatusText.text(Q).attr(DOM.title,Q)
			S && RStatusIcon.attr(DOM.cls,S + ' ' + ClassStatusIconAnimation)
		}
		else RStatusText.text('')
		S || RStatusIcon.removeAttr(DOM.cls)
	},
	MakeStatus = (X,Q,S) =>
	{
		MakeStatusText[X] = Q
		MakeStatusClass[X] = Q && (S || ClassStatusInfo)
		!MakeCoverActive && X === UTab.Index() && MakeStatusChange()
	},
	MakeStatusX = (X,L,T,J) => 0 < T && MakeNoti(X,ReplaceLang(L,T,MakeS(T)),J),
	MakeToolBarClickKeyCall = ZED.KeyGen(),
	MakeToolBarClick = (R,Q,L,H,N) => Q.on(DOM.click,Q[MakeToolBarClickKeyCall] = (T,X) =>
	{
		T && Util.StopProp(T)
		T = R.Count()
		X = ZED.KeyGen()
		T = N ? H(X) : (T && H(R.Selecting(),X))
		0 < T && MakeStatusX(X,L,T)
	}),
	MakeDBError = (X,G,E) =>
	{
		Util.Debug(__filename,E)
		MakeStatus(X,ReplaceLang(Lang.ErrWhile,L(G)),ClassStatusError)
	},



	//Util
	UShortCut = ZED.ShortCut(),
	MakeIndex = ZED.curry((X,Q,S) => !MakeCoverActive && X === UTab.Index() && Q(S),3),
	UTab = ZED.Tab(
	{
		Tab : RNavi,
		Content : RStage,
		Default : 0,
		Show : () =>
		{
			MakeToolBarChange()
			MakeStatusChange()
		}
	});

	ZED.onError = E => Util.Debug(__filename,E)

	ZED.CSS(ZED.KeyGen(),(W,H) =>
	(
		YStageWidth = ZED.max(2 * YNaviWidth,W - YNaviWidth),
		YStageWidthWithoutScroll = YStageWidth - YScrollWidth,
		YStageHeight = ZED.max(YToolBarHeight + YStatusBarHeight,H - YToolBarHeight - YStatusBarHeight),
		ZED.Replace
		(
			'html,body{margin:0;padding:0;background:#F7F7F7;color:#6C6C6C;overflow:hidden}' +
			'input,textarea{background:transparent;color:#6C6C6C;outline:0}' +
			'::placeholder{color:#999}' +

			//Rainbow
			'#/R/{height:/r/px;background:inherit;word-break:break-word}' +
			'#/R/>div{background:inherit}' +
			'#/R/ *{box-sizing:border-box}' +

			//Animation keyframe
			'/e/' +

			//ToolBar
			'#/T/{height:/t/px}' +
			'#/M/,#/P/{display:inline-block;height:30px;vertical-align:middle}' +
			//	Icon
			'#/M/{width:/n/px;border-right:solid 1px #BBB}' +
			//	Control
			'#/P/{border-left:solid 1px #BBB}' +
			'#/P/>div{line-height:0}' +
			//		Default
			'#/P/ ./HP/{margin-left:/p/px;line-height:0;cursor:pointer}' +
			'#/P/ ./HP/ svg{width:30px;height:30px}' +
			'#/P/ ./HP/:hover defs>*,#/P/ ./HP/:hover g>*{fill:/v/!important}' +
			//		Disabled
			'#/P/ ./PD/{cursor:auto}' +
			'#/P/ ./PD/ defs>*,#/P/ ./PD/ g>*,#/P/ ./PD/:hover defs>*,#/P/ ./PD/:hover g>*{fill:/x/!important}' +

			//Navi, Stage
			//	Navi
			'#/NG/{background:inherit;width:/ng/px}' +
			'#/N/,#/G/{display:inline-block;height:/h/px;vertical-align:top}' +
			'#/N/{width:/n/px;background:#F3F3F3!important;font-size:1.15rem;font-weight:bold;overflow:auto}' +
			'#/N/::-webkit-scrollbar{width:0;height:0}' +
			'#/N/>div{position:relative;min-height:100%;overflow:hidden}' +
			//		Tab
			'#/N/ ./I/{position:relative;margin:/b/px 0;padding:12px 0 12px 16px}' +
			'#/N/ ./I/,#/N/ ./I/ ./B/{transition:box-shadow .2s linear}' +
			'#/N/ ./I/:hover,#/N/ ./O/{box-shadow:0 0 /b/px /a/}' +
			//			TabOn
			'#/N/ ./O/{background:#F7F7F7}' +
			//			ShadowBar
			'#/N/ ./I/ ./B/{background:#F3F3F3}' +
			'#/N/ ./O/ ./B/{background:#F7F7F7;box-shadow:none}' +
			//		Count
			'./V/{margin-right:20px;float:right}' +
			//	Stage
			'#/G/{position:relative;width:/g/px;background:inherit;overflow:hidden}' +
			//		Scroll
			'./Y/,./CR/{height:100%;background:inherit;overflow-x:hidden;overflow-y:scroll}' +
			//			ListViewItem
			'#/G/ ./Z/{cursor:default}' +
			'#/G/ ./Z/:hover{background:#EFE5F9}' +
			//			Selected item
			'#/G/ ./F/{background:#E6D5F5!important}' +
			//			Item Control
			'#/G/ ./HP/{cursor:pointer}' +
			'#/G/ ./HP/:hover svg>rect,#/G/ ./HP/:hover circle{fill:#0065CB!important}' +
			//		Cover
			'./CR/{position:absolute;left:0;top:0;width:100%;height:100%;text-align:center}' +
			//			Detail
			'#/DT/>div{text-align:left}' +
			//				Info
			'#/DI/{display:inline-block;padding:/p/px}' +
			//				Head
			'#/DH/{padding:/p/px;background:#F3EBFA}' +
			'#/DH/ div{font-size:1.1rem}' +
			//				Label
			'./DL/{font-weight:bold;opacity:.7}' +
			//				Part
			'#/DP/{padding-left:/p/px}' +
			'#/DP/>div{padding-bottom:/p/px}' +
			//				URL
			'#/DP/ ./SL/{color:blue}' +
			//				URL status
			'#/DP/ div *{padding-left:/p/px}' +
			//			Merge
			'#/MG/{padding:/p/px}' +
			'#/MG/>div{margin-bottom:/p/px;font-size:1.2rem}' +
			'#/MG/ ./BT/{display:inline-block;margin:0 /p/px;padding:1px 3px;font-size:1rem}' +
			'#/MG/ textarea{min-width:100%;max-width:100%;min-height:80%}' +

			//StatusBar
			'#/S/{padding:0 /p/px;height:/s/px}' +
			//	Wrapper
			'#/L/{display:inline-block;position:relative;width:100%}' +
			'#/L/ div{display:inline-block;vertical-align:middle}' +
			'#/H/{position:absolute;right:0;top:0}' +
			//	Text
			'#/L/ ./SL/{width:/u/px}' +
			//	Icon
			'#/C/{position:relative;width:20px;height:20px}' +
			'#/C/[class]{margin-right:8px}' +
			'#/C/>div{position:absolute}' +
			//		Info
			'./CI/>div{left:8px;width:4px;background:#2672EC}' +
			'./CI/ #/C/A{top:0;height:12px}' +
			'./CI/./Q/ #/C/A{animation:/ci/ .25s linear}' +
			'./CI/ #/C/B{top:16px;height:4px}' +
			//		Loading
			'./J/>div{border:solid 2px transparent;border-radius:50%}' +
			'./J/ #/C/A,./J/ #/C/B{border-color:transparent blue blue}' +
			'./J/ #/C/A{left:0;top:0;width:100%;height:100%;animation:/j/ 2s linear infinite}' +
			'./J/ #/C/B{left:25%;top:25%;width:50%;height:50%;animation:/j/ 1s infinite}' +
			//		Error
			'./K/>div{background:red;transform:rotate(45deg)}' +
			'./K/./Q/>div{animation:/k/ .7s}' +
			'./K/ #/C/A{left:0;top:8px;width:100%;height:4px}' +
			'./K/ #/C/B{left:8px;top:0;width:4px;height:100%}' +

			//ShadowBar
			'#/T/,#/N/,#/S/{position:relative}' +
			'./B/{position:absolute;pointer-events:none}' +
			//	ToolBar
			'#/T/ ./B/{left:0;bottom:-/b/px;width:100%;height:/b/px;box-shadow:inset 0 /b/px /b/px -/b/px /a/;z-index:8000}' +
			//	Navi
			'#/N/ ./B/{right:0;top:0;width:/b/px;height:100%;box-shadow:inset -/b/px 0 /b/px -/b/px /a/}' +
			//	StatusBar
			'#/S/ ./B/{left:0;top:-/b/px;width:100%;height:/b/px;box-shadow:inset 0 -/b/px /b/px -/b/px /a/}' +

			//Error
			'./E/{color:red;font-size:1.1em;font-weight:bold}' +

			//Util
			//	Input
			'./UI/{width:100%;border:0;border-bottom:solid 2px #DCDCDC}' +
			'./UI/:hover{border-bottom-color:#CCCEDB}' +
			'./UI/:focus{border-bottom-color:#3399FF}' +
			//	Shape
			'./HP/{display:inline-block;line-height:0}' +
			//	Single line
			'./SL/{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
			//	CheckBox
			'./CB/{display:inline-block}' +

			//Index
			//	Toolbar shadow should be higher than NaviStage
			'#/T/ ./B/,#/S/ ./B/{z-index:8000}' +
			//	Navi .TabTab should be lower than Toolbar shadow but higher than Navi shadow
			'#/N/ ./I/{z-index:6000}',
			'/',
			{
				BT : DOM.Button,
				I : DOM.Tab,
				O : DOM.TabOn,
				W : DOM.ListView,
				X : DOM.ListViewParent,
				Z : DOM.ListViewItem,

				R : IDRainbow,
				r : H,

				T : IDToolBar,
				t : YToolBarHeight,
				M : IDToolBarIcon,
				P : IDToolBarItem,
				PD : ClassToolBarDisabled,
				x : ShapeConfigColorDisabled,
				v : ShapeConfigColorHover,

				NG : IDNaviStage,
				ng : YNaviWidth + YStageWidth,
				N : IDNavi,
				n : YNaviWidth,
				V : ClassCount,
				G : IDStage,
				g : YStageWidth,
				h : YStageHeight,
				Y : ClassScrollable,
				F : ClassListSelected,
				CR : ClassCover,
				DT : IDDetail,
				DH : IDDetailHead,
				DI : IDDetailInfo,
				DL : ClassDetailLabel,
				DP : IDDetailPart,
				MG : IDMerge,

				S : IDStatusBar,
				s : YStatusBarHeight,
				L : IDStatusBarWrap,
				u : W - 128,
				H : IDStatusBarRight,
				U : IDStatus,
				C : IDStatusIcon,
				Q : ClassStatusIconAnimation,
				CI : ClassStatusInfo,
				ci : ReKeyGen(),
				J : ClassStatusLoading,
				j : ReKeyGen(),
				K : ClassStatusError,
				k : ReKeyGen(),
				D : IDSpeed,

				B : ClassShadowBar,
				b : YShadowSize,
				a : YShadowColor,

				E : ClassError,

				UI : ClassUnderlineInput,
				HP : ClassShape,
				SL : ClassSingleLine,
				CB : ClassCheckBox,

				p : YPadding,

				e : ZED.CSSKeyframe(ReKeyGen(Util.T),{'50%' : {transform : 'translateY(-4px)'}}) +
					ZED.CSSKeyframe(ReKeyGen(Util.T),{to : {transform : 'rotate(360deg)'}}) +
					ZED.CSSKeyframe(ReKeyGen(Util.T),{to : {transform : 'rotate(405deg)'}})
			}
		)
	))

	UTab.Add(
	{
		Tab : L(Lang.Browser),
		CSS : (ID,W) =>
		(
			W = ZED.FlexibleFit
			(
				YStageWidthWithoutScroll - YPadding - YPadding,
				YCardWidthMin,
				YCardWidthMax,
				YPadding
			),
			ZED.Replace
			(
				'#/R/{text-align:center}' +
				'#/R/>div{margin-bottom:/p/px!important}' +

				//URL input
				'#/I/' +
				'{' +
					'position:relative;' +
					'display:inline-block;' +
					'margin-top:/p/px;' +
					'padding:0 /p/px;' +
					'width:100%;' +
					'background:inherit' +
				'}' +
				//	Input
				'#/I/ input{padding:12px 60px 4px 20px;font-size:1.2rem}' +
				//	Enter button
				'#/I/>div:not([id])' +
				'{' +
					'position:absolute;' +
					'right:/p/px;' +
					'top:0;' +
					'bottom:2px;' +
					'padding:8px 0 0;' +
					'width:60px;' +
					'color:#3399FF;' +
					'font-size:1.6rem;' +
					'font-weight:bold;' +
					'text-align:center;' +
					'cursor:pointer' +
				'}' +
				'#/I/>div:not([id]):hover{background:#F3F3F3}' +
				//	Hint
				'#/T/' +
				'{' +
					'display:none;' +
					'position:absolute;' +
					'left:/p/px;' +
					'right:/p/px;' +
					'top:100%;' +
					'background:inherit;' +
					'text-align:left;' +
					'box-shadow:0 3px 8px 0 rgba(0,0,0,.2),0 0 0 1px rgba(0,0,0,.08)' +
				'}' +
				'#/T/>*{padding:4px 6px}' +
				//		Brief
				'#/T/ span{color:#D1D1D1}' +
				//		Item
				'#/T/ div div{cursor:pointer}' +
				//			Hover
				'#/T/ div div:hover{background:#F0F0F0}' +
				//			Active
				'./V/{background:#DCEBFC!important}' +

				//Info panel
				'#/O/{margin:0 /p/px;padding:/p/px;border:solid #66AFE0;border-width:2px 0;font-size:1.1rem}' +

				//Preference
				'#/P/{margin:0 /p/px}' +
				'#/P/ table{width:100%}' +
				'#/P/ th{width:15%}' +

				//List
				'#/R/ fieldset' +
				'{' +
					'display:inline-block;' +
					'margin:/h/px;' +
					'padding:/p/px;' +
					'width:/c/px;' +
					'border:0;' +
					'text-align:left;' +
					'vertical-align:top;' +
					'box-shadow:0 5px /p/px /a/;' +
				'}' +
				'#/R/ legend{word-break:break-all}' +
				//	Card
				'./J/{color:#F7F7F7;font-weight:bold;text-align:center;cursor:pointer}' +
				//		Select bar
				'./H/ ./K/,./N/{background:rgba(102,175,224,.7)}' +
				'./L/,./M/{background:#66AFE0}' +
				//		Image
				'#/R/ img{width:/i/px;cursor:pointer}',
				'/',
				{
					R : ID,
					I : IDBrowserInput,
					T : IDBrowserHint,
					V : ClassBrowserHintOn,
					O : IDBrowserInfo,
					P : IDBrowserPref,
					H : ClassBrowserHover,
					J : DOMCard.R,
					K : DOMCard.Init,
					L : DOMCard.Cold,
					M : DOMCard.Hot,
					N : DOMCard.History,

					p : YPadding,
					h : YPaddingHalf,
					c : W,
					i : W - YPadding - YPadding,
					a : YShadowColor
				}
			)
		),
		Content : (M,X) =>
		{
			var
			RInput = ShowByRock(IDBrowserInput),
			RURL = ShowByInput(Lang.URL),
			RGo = ShowByClass(DOM.NoSelect).text('\u2192'),
			RHint = ShowByRock(IDBrowserHint).attr(DOM.cls,DOM.NoSelect),
			RHintTitle = $(DOM.span),
			RHintList = $(DOM.div),
			RInfo = ShowByRock(IDBrowserInfo),
			RPref = ShowByRock(IDBrowserPref),
			RList = $(DOM.div),

			PagerUp,
			PagerBotton,

			InfoKeyFrom = ZED.KeyGen(),
			InfoKeyTo = ZED.KeyGen(),
			InfoKeyCount = ZED.KeyGen(),
			InfoKeyTotal = ZED.KeyGen(),
			InfoKeyTotalS = ZED.KeyGen(),
			InfoKeyAt = ZED.KeyGen(),
			InfoKeyPages = ZED.KeyGen(),
			InfoKeyPagesS = ZED.KeyGen(),
			InfoLog = ReplaceLang(Lang.PageInfo,
			[
				InfoKeyFrom,InfoKeyTo,
				InfoKeyCount,InfoKeyTotal,InfoKeyTotalS,
				InfoKeyAt,InfoKeyPages,InfoKeyPagesS
			]),

			GoError = function(Q)
			{
				Q = ZED.isNumber(Q) ? ReplaceLang(Q,ZED.tail(arguments)) : Q
				RInfo.append(ShowByClass(ClassError).text(Q))
				MakeStatus(X,Q,ClassStatusError)
			},
			GoLast,
			GoInfo,
			GoTarget,
			GoDetail,
			GoID,
			GoPages,
			GoPref,
			GoMatch = (URL,J,Target,Detail,ID,T) =>
			{
				if (T = URL.match(/^([A-Z\u2E80-\u33FF\u3400-\u9FFF\uAC00-\uD7FF\uF900-\uFAFF]+)(?:\s+([^]*))?$/i))
				{
					Target = ZED.toLower(T[1])
					Detail = T[2] || ''
					if (!ZED.has(Target,SiteMap)) return J && GoError(Lang.UknSite,Target)
					Target = SiteMap[Target]
				}
				else
				{
					Target = ZED.find(V => V[KeySite.Judge].test(URL),SiteAll)
					Detail = URL
					if (!Target) return J && GoError(Lang.UknURL,URL)
				}
				Detail = ZED.find
				(
					V => ZED.find(V => ID = Detail.match(V),V[KeySite.Judge]),
					Target[KeySite.Map]
				)

				return Detail ?
					[Target,Detail,ID[1]] :
					J && GoError(Lang.UknURL,URL)
			},
			Go = () =>
			{
				var URL = RURL.val().trim(),L,T;

				GoHintLeave()
				GoLast && GoLast.end()

				L = GoDetail
				RInfo.empty().append(ShowByText(ReplaceLang(Lang.ProcURL,URL)))

				if (T = GoMatch(URL,Util.T))
				{
					GoTarget = T[0]
					GoDetail = T[1]
					GoID = T[2]

					if (GoDetail)
					{
						T = [GoTarget[KeySite.Name],GoDetail[KeySite.Name]]
						GoID && T.push(GoID)
						RInfo.append(ShowByText(T.join(' ')))

						GoInfo = Util.F
						L === GoDetail || (GoPref = {})
						GoPages = 1
						Jump(1)
						RURL.blur()
					}
				}
			},
			Hover = (C,I,Q) => Q.on(DOM.click,() => Cold.Click(I))
				.on(DOM.mouseover,() => C.attr(DOM.cls,ClassBrowserHover))
				.on(DOM.mouseout,() => C.removeAttr(DOM.cls)),
			Render = (Q,S) =>
			{
				var Item = Q[KeySite.Item];

				ZED.Each(Item,(F,V) => Util.U === V[KeySite.Index] &&
				(
					V[KeySite.Index] = Q[KeySite.PageSize] ?
						Q[KeySite.PageSize] * (S - 1) + F :
						F
				))

				RPref.empty()
				Q[KeySite.Pref] && ZED.Preference(
				{
					Parent : RPref,
					Set : Q[KeySite.Pref],
					Data : ZED.Merge(GoPref,Q[KeySite.PrefDef]),
					Table : Util.T,
					Change : () => Jump(S)
				})

				GoPages = Number(Q[KeySite.Pages])
				if (Item.length)
				{
					GoInfo[InfoKeyFrom](Item[0][KeySite.Index])
					GoInfo[InfoKeyTo](ZED.last(Item)[KeySite.Index])
				}
				else
				{
					GoInfo[InfoKeyFrom]('-')
					GoInfo[InfoKeyTo]('-')
				}
				GoInfo[InfoKeyCount](Item.length)
				Q[KeySite.Total] || (Q[KeySite.Total] = Item.length)
				GoInfo[InfoKeyTotal](Q[KeySite.Total])
				GoInfo[InfoKeyTotalS](MakeS(Q[KeySite.Total]))
				GoInfo[InfoKeyAt](S)
				GoInfo[InfoKeyPages](GoPages)
				GoInfo[InfoKeyPagesS](MakeS(GoPages))

				PagerUp(S,GoPages)
				PagerBotton(S,GoPages)
				RList.empty()
				Cold.Reset()
				ZED.each((V,D) =>
				{
					D = $(DOM.fieldset)
					V[KeySite.ID] ? D.append
					(
						ShowByText(V[KeySite.Index] + ' | ',DOM.legend).append
						(
							ShowByText(SiteMap[V[KeySite.Name]][KeySite.IDView](V[KeySite.ID]),DOM.a)
								.attr(DOM.href,SiteMap[V[KeySite.Name]][KeySite.IDLink](V[KeySite.ID]))
						),
						Hover(D,V[KeySite.Unique],Cold.New(GoTarget,V)),
						V[KeySite.Img] && Hover
						(
							D,V[KeySite.Unique],
							ShowByClassX(DOM.NoSelect,DOM.img)
								.attr(DOM.src,V[KeySite.Img])
								.attr(DOM.title,V[KeySite.Title])
						)
					) : D.append
					(
						ShowByText(V[KeySite.Index],DOM.legend),
						V[KeySite.Img] && $(DOM.a).attr(DOM.href,V[KeySite.AuthorLink])
							.append(ShowByClassX(DOM.NoSelect,DOM.img)
								.attr(DOM.src,V[KeySite.Img])
								.attr(DOM.title,V[KeySite.Title]))
					)
					D.append
					(
						V[KeySite.Length] && ShowByText(V[KeySite.Length]),
						V[KeySite.Title] && ShowByText(V[KeySite.Title]),
						V[KeySite.Author] && (V[KeySite.AuthorLink] ?
							$(DOM.div).append(ShowByText(V[KeySite.Author],DOM.a)
								.attr(DOM.href,V[KeySite.AuthorLink])) :
							ShowByText(V[KeySite.Author])),
						MakeSiteDate(V)
					)
					RList.append(D)
				},Item)
			},
			GoHintCount = 0,
			GoHintCacheKey = ZED.KeyGen(),
			GoHintRaw,
			GoHint = () =>
			{
				var
				URL,
				Target,Detail,ID,
				At = ++GoHintCount,
				T;

				GoHintRaw = RURL.val()
				URL = GoHintRaw.trim()
				if (T = GoMatch(URL))
				{
					Target = T[0]
					Detail = T[1]
					ID = T[2] || ''
					ID = ID.trim()

					if (ID && Detail[KeySite.Hint])
					{
						RHintTitle.text(ReplaceLang(Lang.HintFor,Target[KeySite.Name],ID))
						RHintList.text(L(Lang.Loading))
						GoHintLeave()
						RHint.show()
						URL = URL.substr(0,URL.length - ID.length)
						T = Detail[GoHintCacheKey]
						if (!T) Detail[GoHintCacheKey] = T = {}
						if (T[ID]) GoHintRender(Target,ID,URL,T[ID])
						else Detail[KeySite.Hint](ID).start(Q =>
						{
							T[ID] = Q
							GoHintCount === At && GoHintRender(Target,ID,URL,Q)
						},() => GoHintCount === At && RHintList.text(L(Lang.Errored)))
					}
					else GoHintLeave()
				}
				else GoHintLeave()
			},
			GoHintActive,
			GoHintAt,
			GoHintData,
			GoHintView,
			GoHintRender = (Target,ID,Prefix,Q) =>
			{
				if (Q.length)
				{
					RHintList.empty()
					GoHintActive = Util.T
					GoHintAt = 0
					GoHintData = []
					GoHintView = []
					ZED.each((Q,I,R) =>
					{
						I = 1 + GoHintData.length
						R = $(DOM.div).text(Q).on(DOM.click,() =>
						{
							RURL.val(Q)
							Go()
						})
						R.prepend(ShowByText(Prefix,DOM.span))
						Q = Prefix + Q
						GoHintData.push(Q)
						GoHintView.push(R)
						RHintList.append(R)
					},Q)
				}
				else RHintList.text(L(Lang.HintEmpty))
			},
			GoHintSwitch = Q =>
			{
				if (GoHintAt) GoHintView[GoHintAt - 1].removeAttr(DOM.cls)
				GoHintAt = Q
				if (Q)
				{
					GoHintView[--Q].attr(DOM.cls,ClassBrowserHintOn)
					Q = GoHintData[Q]
				}
				else Q = GoHintRaw
				RURL.val(Q)
			},
			GoHintLeave = () =>
			{
				GoHintActive =
				GoHintData =
				GoHintView = Util.F
				RHint.removeAttr(DOM.style)
			},
			Jump = S =>
			{
				if (GoDetail)
				{
					S = ZED.min(ZED.max(1,S || 0),GoPages)
					MakeStatus(X,L(Lang.Loading),ClassStatusLoading)
					GoLast = GoDetail[KeySite.Page](GoID,S,GoPref).start(Q =>
					{
						GoLast = Util.F
						MakeStatus(X)
						GoInfo = GoInfo || ZED.EazyLog(InfoLog,$(DOM.div).appendTo(RInfo),Util.T)
						ZED.each
						(
							V => V[KeySite.Unique] = Util.MakeUnique
							(
								V[KeySite.Name] = GoTarget[KeySite.Name],
								V[KeySite.ID]
							),
							Q[KeySite.Item]
						)
						Render(Q,S)
					},E =>
					{
						Util.Debug(__filename,E)
						E && MakeStatus(X,E,ClassStatusError)
					})
				}
			},

			MakeClick = Q => () => Q.click(),

			T;

			M.addClass(ClassScrollable)
			MakeEnter(RURL,Go).on('up',Util.N,E =>
			{
				if (GoHintActive)
				{
					GoHintSwitch(GoHintAt ? GoHintAt - 1 : GoHintData.length)
					Util.PrevDef(E)
				}
			},Util.T).on('down',Util.N,E =>
			{
				if (GoHintActive)
				{
					GoHintSwitch(GoHintAt < GoHintData.length ? 1 + GoHintAt : 0)
					Util.PrevDef(E)
				}
			},Util.T).on('esc',Util.N,GoHintLeave)
			RURL.on(DOM.einput + ' ' + DOM.focus,GoHint)
				.on(DOM.blur,GoHintLeave)
			RHint.on(DOM.mousedown,Util.PrevDef)
			RGo.on(DOM.click,Go)
			M.append
			(
				RInput.append
				(
					RURL,RGo,
					RHint.append(RHintTitle,RHintList)
				),
				RInfo,
				RPref
			)
			PagerUp = ZED.Pager({Parent : M,Offset : 1},Jump)
			T = M.find('.' + DOM.Pager).children()
			RList.on(DOM.click,DOM.A,E =>
			(
				Util.PrevDef(E),
				Util.StopProp(E),
				E = E.currentTarget.getAttribute(DOM.href),
				E && RURL.val(E),
				Go(),
				Util.F
			))
			M.append(RList)
			PagerBotton = ZED.Pager({Parent : M,Offset : 1},Jump)
			UShortCut.cmd(ShortCutCommand.FocusURL,() => RURL.focus())
				.cmd(ShortCutCommand.SelAll,MakeIndex(X,Cold.SelAll))
				.cmd(ShortCutCommand.UnAll,MakeIndex(X,Cold.UnAll))
				.cmd(ShortCutCommand.PageHead,MakeIndex(X,MakeClick(T[0])))
				.cmd(ShortCutCommand.PagePrev,MakeIndex(X,MakeClick(T[1])))
				.cmd(ShortCutCommand.PageNext,MakeIndex(X,MakeClick(T[T.length - 2])))
				.cmd(ShortCutCommand.PageTail,MakeIndex(X,MakeClick(ZED.last(T))))
		}
	},{
		Tab : RColdCount(),
		CSS : ID => ZED.Replace
		(
			//Commit all
			'./A/{position:relative}' +
			'./A/A,./A/B{position:absolute;top:0}' +
			'./A/A{left:20%}' +
			'./A/B{left:40%}' +
			//Info block
			'#/R/ ./M/>div{margin-right:/m/px;padding:/p/px}' +
			//@ mark
			'#/R/ ./L/ div{display:inline-block}' +
			'#/R/ ./L/ span{margin:0 4px;color:#00F;font-weight:bold}' +
			//Commit wrap
			'#/R/ ./M/>span{position:absolute;right:/p/px;top:50%;transform:translateY(-/l/px)}' +
			//Commit
			'#/R/ svg{width:/v/px;height:/v/px}',
			'/',
			{
				M : DOM.ListViewItem,

				L : ClassSingleLine,
				A : ClassColdCommitAll,

				R : ID,
				m : YPadding + YListSVG + YPadding,
				v : YListSVG,
				l : YListSVG / 2,
				p : YPadding
			}
		),
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : (M,X) =>
		{
			var
			ToolCommit = MakeShape(Lang.Commit,ShapeConfigColdToolCommit),
			ToolRemove = MakeShape(Lang.Remove,ShapeConfigColdToolRemove),
			ToolCommitAll = MakeShape(Lang.CommitAll,ShapeConfigColdToolCommitAll,ClassColdCommitAll).append
			(
				ZED.Shape(ShapeConfigColdToolCommitAll).attr(DOM.cls,ClassColdCommitAll + 'A'),
				ZED.Shape(ShapeConfigColdToolCommitAll).attr(DOM.cls,ClassColdCommitAll + 'B')
			),

			R = MakeSelectableList
			(
				M,X,
				Cold.Cold,Cold.Map,KeySite.Unique,
				Util.F,
				Q => $(DOM.div).append
				(
					$(DOM.div).append
					(
						MakeAt(SiteMap[Q[KeySite.Name]][KeySite.IDView](Q[KeySite.ID]),Q[KeySite.Name]),
						MakeAt(Q[KeySite.Title],Q[KeySite.Author]),
						$(DOM.div).text(MakeSiteDate(Q))
					),
					MakeToolBarClick
					(
						R,
						MakeShape(Lang.Commit,ShapeConfigColdListCommit),
						Lang.CommittingN,
						X => Cold.Commit([Q],X),
						Util.T
					)
				),ZED.noop,Q =>
				{
					MakeToolBarActive(ToolCommit,Q)
					MakeToolBarActive(ToolRemove,Q)
					MakeSelecting(X,R)
				},
				ZED.noop,ZED.noop,ZED.noop
			);

			M.addClass(ClassScrollable)
			MakeToolBarActive(ToolCommit)
			MakeToolBarActive(ToolRemove)
			MakeToolBar(X,$(DOM.div).append
			(
				MakeToolBarClick(R,ToolCommit,Lang.CommittingN,Cold.CommitMany),
				MakeToolBarClick(R,ToolRemove,Util.U,(S,X) =>
				{
					MakeStatusX(X,Lang.RemovedN,Cold.Remove(S),Util.T)
					R.Redraw()
				}),
				MakeToolBarClick(R,ToolCommitAll,Lang.CommittingN,Cold.CommitAll,Util.T)
			))
			Bus.on(Event.Cold.Change,RColdCount)
				.on(EventQueue.Newed,(Q,S) =>
				{
					MakeStatusX(S,Lang.CommittedN,Q.length,Util.T)
					R.Redraw()
					Cold.Cold.length || UTab.Index(1 + X)
				})
				.on(EventQueue.ENew,E => MakeDBError(X,Lang.Commit,E))
			UShortCut
				.cmd(ShortCutCommand.CommitSel,MakeIndex(X,ToolCommit[MakeToolBarClickKeyCall]))
				.cmd(ShortCutCommand.CommitAll,MakeIndex(X,ToolCommitAll[MakeToolBarClickKeyCall]))

			return R
		}
	},{
		Tab : RHotCount(),
		CSS : (ID,W,T) =>
		(
			W = YStageWidthWithoutScroll - YHotControlWidth,
			T = YHotTitlePercentage * W,
			ZED.Replace
			(
				'./H/,./S/,./C/,./O/{display:inline-block;vertical-align:middle}' +
				//Title
				'./H/{padding:/p/px;width:/t/px}' +
				'./T/{font-size:1.1rem}' +
				'./N/{color:#979797}' +
				//Status
				'./S/{margin:/p/px 0;width:/s/px}' +
				'./S/>*{display:inline-block;max-width:100%;vertical-align:bottom}' +
				//Control
				'./C/{margin:0 /_/px;line-height:0}' +
				'./M/ svg,./P/ svg{width:/c/px;height:/c/px}' +
				'./M/:hover{background:#EF3000}' +
				'./M/:hover path{fill:#F7F7F7!important}' +
				'./P/{margin-top:/_/px}' +
				//	More
				'./O/ svg{width:/o/px;height:/o/px}' +
				//Percentage
				'./G/{position:absolute;left:0;bottom:0;height:3px;width:0;background:#979797}' +
				'./K/{transition:width .2s linear}' +
				'./A/{background:#69A0D7}' +
				'./U/{width:100%}',
				'/',
				{
					I : DOM.ListViewItem,

					R : ID,
					H : ClassHotTitleInfo,
					T : ClassHotTitle,
					N : ClassHotInfo,
					t : T,
					S : ClassHotStatus,
					s : W - T,
					C : ClassHotControl,
					c : YHotControlSize,
					_ : YHotControlPadding,
					M : ClassHotControlRemove,
					P : ClassHotControlPP,
					O : ClassHotControlMore,
					o : YHotControlMoreWidth,
					G : ClassHotPercentage,
					K : ClassHotPercentageTransition,
					A : ClassHotPercentageActive,
					W : ClassHotPercentageAlways,
					U : ClassHotSizeUnknown,

					p : YPadding
				}
			)
		),
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : (M,X) =>
		{
			var
			ToolPlay = MakeShape(Lang.Restart,ShapeConfigHotToolPlay),
			ToolPause = MakeShape(Lang.Pause,ShapeConfigHotToolPause),
			ToolRemove = MakeShape(Lang.Remove,ShapeConfigHotToolRemove),

			ActiveKeyID = 0,
			ActiveKeyTitle = 1 + ActiveKeyID,
			ActiveKeyInfo = 1 + ActiveKeyTitle,
			ActiveKeySpeed = 1 + ActiveKeyInfo,
			ActiveKeyRemain = 1 + ActiveKeySpeed,
			ActiveKeyPercentage = 1 + ActiveKeyRemain,
			ActiveKeyTransition = 1 + ActiveKeyPercentage,
			ActiveKeyPP = 1 + ActiveKeyTransition,
			ActiveKeyPPS = 1 + ActiveKeyPP,
			Active = {},
			CountActive = 0,
			CountPaused = 0,
			CountSize = 0,
			CountSizePlus = 0,

			UpdateToolBar = () =>
			{
				MakeToolBarActive(ToolPlay,CountPaused)
				MakeToolBarActive(ToolPause,CountActive)
				MakeToolBarActive(ToolRemove,R.Count())
				MakeSelSize(X,R,CountSize,CountSizePlus)
			},

			MakeSpeed = (ID,Q,A,S) =>
			{
				A[ActiveKeySpeed].text
				(
					(0 <= S || (Download.Active[ID] && (S = 1000 * Download.Active[ID].Speed()))) ?
						ZED.FormatSize(S) + '/s' :
						L(Lang.Processing)
				)
				A[ActiveKeyRemain].text
				(
					0 <= S && 0 <= Q[KeyQueue.DoneSum] && Q[KeyQueue.Size] ?
						'-' + ZED.SecondsToString(ZED.min((Q[KeyQueue.Size] - Q[KeyQueue.DoneSum]) / S,359999)) :
						''
				)
			},
			MakePercentage = (Q,A) =>
			{
				Q[KeyQueue.Size] ?
					Q[KeyQueue.DoneSum] && 0 < Q[KeyQueue.Size] &&
						A[ActiveKeyPercentage].css(DOM.width,ZED.Format(100 * Q[KeyQueue.DoneSum] / Q[KeyQueue.Size]) + '%') :
					A[ActiveKeyPercentage].addClass(ClassHotPercentageAlways)
				A[ActiveKeyTransition] < 2 &&
					1 < ++A[ActiveKeyTransition] &&
						A[ActiveKeyPercentage].addClass(ClassHotPercentageTransition)
			},

			ClickRemove = (ID,X) => MakeStatusX(X,Lang.RemovingN,Queue.Remove(ZED.objOf(ID,ID),X)),
			ClickPP = (A,X,ID) => Queue.ActiveMap[ID = A[ActiveKeyID]] ?
				MakeStatusX(X,Lang.PausingN,Queue.Pause(ZED.objOf(ID,ID),X)) :
				MakeStatusX(X,Lang.RestartingN,Queue.Play(ZED.objOf(ID,ID),X)),
			MakeAction = (R,H,Q) => R.on(DOM.click,E =>
			{
				Util.StopProp(E)
				H(Q,ZED.KeyGen())
			}),

			R = MakeSelectableList
			(
				M,X,
				Queue.Online,Queue.OnlineMap,Util.F,
				$(DOM.div).append
				(
					ShowByClass(ClassHotTitleInfo).append
					(
						ShowByClass(ClassSingleLine + ' ' + ClassHotTitle).text(DOM.nbsp),
						ShowByClass(ClassSingleLine + ' ' + ClassHotInfo).text(DOM.nbsp)
					)
				),
				ID =>
				{
					var
					Title = ShowByClass(ClassSingleLine + ' ' + ClassHotTitle).text(DOM.nbsp),
					Info = ShowByClass(ClassSingleLine + ' ' + ClassHotInfo).text(DOM.nbsp),
					Speed = ShowByClass(ClassSingleLine),
					Remain = ShowByClass(ClassSingleLine),
					Percentage = ShowByClass(ClassHotPercentage),
					PP = Queue.ActiveMap[ID] ?
						MakeShape(Lang.Pause,ShapeConfigHotListPause,ClassHotControlPP) :
						MakeShape(Lang.Restart,ShapeConfigHotListPlay,ClassHotControlPP),
					PPS = PP.children(),
					ActiveObj = [ID,Title,Info,Speed,Remain,Percentage,0,PP,PPS],

					Make = (E,Q) =>
					{
						if (!E)
						{
							Title.text(Q[KeyQueue.Title])
							Info.text
							(
								Queue.IsInfo(Q[KeyQueue.Unique]) ?
									L(Queue.IsSize(Q[KeyQueue.Unique]) ? Lang.GetSize : Lang.GetInfo) :
									Q[KeyQueue.Part] ?
										Util.U === Q[KeyQueue.Size] ?
											L(Lang.ReadySize) :
											MakeSizePercentage(Q[KeyQueue.Size],Q[KeyQueue.DoneSum]) :
										L(Lang.ReadyInfo)
							)
							if (Queue.ReinfoMap[ID])
							{
								Speed.text(L(Lang.EURL))
								Remain.text('-' + ZED.SecondsToString((Queue.ReinfoMap[ID] + Queue.Wait() - ZED.now()) / 1000))
							}
							else if (Queue.IsReadyRefresh(ID))
								Speed.text(L(Lang.RRefresh))
							else if (Queue.ErrorMap[ID])
							{
								Speed.text(L(Lang.EConn))
								Remain.text('-' + ZED.SecondsToString((Queue.ErrorMap[ID] + Queue.Wait() - ZED.now()) / 1000))
							}
							else Queue.IsRunning(ID) ?
								MakeSpeed(ID,Q,ActiveObj) :
								Speed.text(L(Queue.ActiveMap[ID] ? Lang.Queuing : Lang.Paused))
							Download.Active[ID] ?
								Percentage.addClass(ClassHotPercentageActive) :
								Percentage.removeClass(ClassHotPercentageActive)
							MakePercentage(Q,ActiveObj)
						}
					};

					Active[ID] = ActiveObj
					Download.Active[ID] ?
						Make(Util.N,Download.Active[ID].Q) :
						Queue.Info(ID,Make)

					return $(DOM.div).append
					(
						$(DOM.div).append
						(
							ShowByClass(ClassHotTitleInfo).append(Title,Info),
							ShowByClass(ClassHotStatus).append(Speed,' ',Remain),
							ShowByClass(ClassHotControl).append
							(
								MakeAction
								(
									MakeShape(Lang.Remove,ShapeConfigHotListRemove,ClassHotControlRemove),
									ClickRemove,ID
								),
								DOM.br,
								MakeAction(PP,ClickPP,ActiveObj)
							),
							MakeAction
							(
								MakeShape(Lang.More,ShapeConfigHotListMore,ClassHotControlMore),
								MakeDetail,ID
							)
						),
						Percentage
					)
				},Q => ZED.delete_(Q,Active),
				UpdateToolBar,
				Q =>
				{
					Queue.ActiveMap[Q] ? ++CountActive : ++CountPaused
					Q = Queue.OnSizeMap[Q]
					ZED.isNull(Q) ?
						++CountSizePlus :
						(CountSize += Q)
				},
				Q =>
				{
					Queue.ActiveMap[Q] ? --CountActive : --CountPaused
					Q = Queue.OnSizeMap[Q]
					ZED.isNull(Q) ?
						--CountSizePlus :
						(CountSize -= Q)
				},
				() =>
				{
					CountActive = CountPaused =
					CountSize = CountSizePlus = 0
				}
			);

			M.addClass(ClassScrollable)
			RHotCount(Queue.Online.length)
			MakeToolBarActive(ToolPlay)
			MakeToolBarActive(ToolPause)
			MakeToolBarActive(ToolRemove)
			MakeToolBar(X,$(DOM.div).append
			(
				MakeToolBarClick(R,ToolPlay,Lang.RestartingN,Queue.Play),
				MakeToolBarClick(R,ToolPause,Lang.PausingN,Queue.Pause),
				MakeToolBarClick(R,ToolRemove,Lang.RemovingN,Queue.Remove)
			))

			Bus.on(EventQueue.Change,RHotCount)
			.on(EventQueue.First,Q => Q &&
			(
				RHotCount(Q),
				R.Redraw()
			)).on(EventQueue.Played,(Q,X,S,T,F) =>
			{
				MakeStatusX(X,Lang.RestartedN,F = Q.length,Util.T)
				S = R.Selecting()
				for (;F;)
				{
					T = Q[--F]
					S[T] && (--CountPaused,++CountActive)
					if (T = Active[T])
					{
						T[ActiveKeyPP].attr(DOM.title,L(Lang.Pause))
						ZED.Shape(ShapeConfigHotListPause,{Target : T[ActiveKeyPPS]})
						T[ActiveKeySpeed].text(L(Lang.Queuing))
					}
				}
				UpdateToolBar()
			}).on(EventQueue.PauseShow,(Q,T) =>
				(T = Active[Q[KeyQueue.Unique]]) && MakePercentage(Q,T))
			.on(EventQueue.Paused,(Q,X,S,T,F) =>
			{
				MakeStatusX(X,Lang.PausedN,F = Q.length,Util.T)
				S = R.Selecting()
				for (;F;)
				{
					T = Q[--F]
					S[T] && (--CountActive,++CountPaused)
					if (T = Active[T])
					{
						T[ActiveKeyPP].attr(DOM.title,L(Lang.Restart))
						ZED.Shape(ShapeConfigHotListPlay,{Target : T[ActiveKeyPPS]})
						T[ActiveKeySpeed].text(L(Lang.Paused))
						T[ActiveKeyRemain].text('')
						T[ActiveKeyPercentage].removeClass(ClassHotPercentageActive)
					}
				}
				UpdateToolBar()
			}).on(EventQueue.Removed,(Q,X) =>
			{
				MakeStatusX(X,Lang.RemovedN,Q.length,Util.T)
				R.Redraw()
			}).on(EventQueue.EAction,(L,E) => MakeDBError(X,L,E))
			.on(EventQueue.Processing,A =>
			{
				if (A = Active[A[KeyQueue.Unique]])
				{
					A[ActiveKeySpeed].text(L(Lang.Processing))
					A[ActiveKeyRemain].text('')
					A[ActiveKeyPercentage].addClass(ClassHotPercentageActive)
				}
			}).on(EventQueue.Queuing,A =>
			{
				if (A = Active[A])
				{
					A[ActiveKeySpeed].text(L(Lang.Queuing))
					A[ActiveKeyRemain].text('')
					A[ActiveKeyPercentage].removeClass(ClassHotPercentageActive)
				}
			}).on(EventQueue.Info,A =>
			{
				if (A = Active[A[KeyQueue.Unique]])
					A[ActiveKeyInfo].text(L(Lang.GetInfo))
			}).on(EventQueue.InfoGot,(Q,A) =>
			{
				if (A = Active[Q[KeyQueue.Unique]])
				{
					A[ActiveKeyInfo].text(L(Lang.GetSize))
					Q[KeyQueue.Title] && A[ActiveKeyTitle].text(Q[KeyQueue.Title])
				}
			}).on(EventQueue.SizeGot,(Q,A) =>
			{
				if (A = Active[Q[KeyQueue.Unique]])
					A[ActiveKeyInfo].text(MakeSizePercentage(Q[KeyQueue.Size],Q[KeyQueue.DoneSum] || 0))
				if (R.Selecting()[Q[KeyQueue.Unique]])
				{
					--CountSizePlus
					CountSize += Q[KeyQueue.Size]
					MakeSelSize(X,R,CountSize,CountSizePlus)
				}
			}).on(EventQueue.Reinfo,(A,S) =>
			{
				if (A = Active[A])
				{
					A[ActiveKeySpeed].text(L(Lang.EURL))
					A[ActiveKeyRemain].text('-' + ZED.SecondsToString(S))
					A[ActiveKeyPercentage].removeClass(ClassHotPercentageActive)
				}
			}).on(EventQueue.ReinfoLook,(A,S) =>
			{
				if (A = Active[A])
					A[ActiveKeyRemain].text('-' + ZED.SecondsToString(S))
			}).on(EventQueue.RRefresh,A =>
			{
				if (A = Active[A])
				{
					A[ActiveKeySpeed].text(L(Lang.RRefresh))
					A[ActiveKeyRemain].text('')
				}
			}).on(EventQueue.Refresh,A =>
			{
				if (A = Active[A[KeyQueue.Unique]])
				{
					A[ActiveKeySpeed].text(L(Lang.Refreshing))
					A[ActiveKeyRemain].text('')
				}
			}).on(EventQueue.Error,(A,S,J) =>
			{
				if (A = Active[A])
				{
					A[ActiveKeySpeed].text(L(Lang.EConn))
					A[ActiveKeyRemain].text('-' + ZED.SecondsToString(S))
					A[ActiveKeyPercentage].removeClass(ClassHotPercentageActive)
					J && A[ActiveKeyInfo].text(L(Lang.ReadyInfo))
				}
			}).on(EventQueue.ErrorLook,(A,S) =>
			{
				if (A = Active[A])
					A[ActiveKeyRemain].text('-' + ZED.SecondsToString(S))
			}).on(EventQueue.ErrorEnd,(Q,A) =>
			{
				if (A = Active[Q])
				{
					A[ActiveKeySpeed].text(L(Queue.ActiveMap[Q] ?
						Queue.IsRunning(Q) ?
						Lang.Processing : Lang.Queuing : Lang.Paused))
					A[ActiveKeyRemain].text('')
				}
			}).on(EventQueue.EFinish,E => MakeDBError(X,Lang.Finish,E))
			.on(EventQueue.FHot,R.Redraw)
			.on(EventDownload.Speed,(S,Q,A) =>
			{
				if (A = Active[Q[KeyQueue.Unique]])
				{
					A[ActiveKeyInfo].text(MakeSizePercentage(Q[KeyQueue.Size],Q[KeyQueue.DoneSum]))
					MakeSpeed(Q[KeyQueue.Unique],Q,A,S)
					MakePercentage(Q,A)
				}
			})

			return R
		}
	},{
		Tab : L(Lang.History),
		CSS : (ID,W,T) =>
		(
			W = YStageWidthWithoutScroll - YHistoryControlWidth,
			T = YHistoryTitlePercentage * W,
			ZED.Replace
			(
				//Merge
				'./E/ svg{transform:translateY(-3px)}' +
				//Panel
				'#/R/ ./I/>*{display:inline-block;vertical-align:middle}' +
				//Title
				'./H/{padding:/p/px;width:/t/px}' +
				//Date
				//'#/R/ ./D/' +
				//'{' +
				//'display:-webkit-inline-box;' +
				//'-webkit-box-orient:vertical;' +
				//'-webkit-line-clamp:2;' +
				//'margin:/p/px 0;' +
				//'width:/d/px;' +
				//'overflow:hidden;' +
				//'word-break:break-all' +
				//'}' +
				//Remove
				'#/R/ ./M/{margin:0 /_/px;line-height:0}',
				'/',
				{
					I : DOM.ListViewItem,

					E : ClassHistoryToolMerge,

					R : ID,
					H : ClassHistoryTitleInfo,
					t : T,
					M : ClassHistoryControlRemove,
					_ : YHistoryControlPadding,
					O : ClassHistoryControlMore,
					o : YHistoryControlMoreWidth,

					p : YPadding
				}
			)
		),
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : (M,X) =>
		{
			var
			ToolRemove = MakeShape(Lang.Remove,ShapeConfigHistoryToolRemove),
			ToolMerge = MakeShape(Lang.Merge,ShapeConfigHistoryToolMerge).addClass(ClassHistoryToolMerge),

			CountSize = 0,

			ClickRemove = (ID,X) => MakeStatusX(X,Lang.RemovingN,Queue.HRemove(ZED.objOf(ID,ID),X)),
			MakeAction = (R,H,Q) => R.on(DOM.click,E =>
			{
				Util.StopProp(E)
				H(Q,ZED.KeyGen())
			}),

			R = MakeSelectableList
			(
				M,X,
				Queue.Offline,Queue.OfflineMap,Util.F,
				$(DOM.div).append
				(
					ShowByClass(ClassHistoryTitleInfo).append
					(
						ShowByClass(ClassSingleLine + ' ' + ClassHistoryTitle).text(DOM.nbsp),
						ShowByClass(ClassSingleLine + ' ' + ClassHistoryInfo).text(DOM.nbsp)
					)
				),
				ID =>
				{
					var
					Title = ShowByClass(ClassSingleLine + ' ' + ClassHistoryTitle).text(DOM.nbsp),
					Info = ShowByClass(ClassSingleLine + ' ' + ClassHistoryInfo).text(DOM.nbsp),
					DateYMD = ShowByClass(ClassSingleLine),
					DateHNS = ShowByClass(ClassSingleLine);

					Queue.HInfo(ID,(E,Q) =>
					{
						if (!E)
						{
							Title.text(Q[KeyQueue.Title]),
							Info.text(ReplaceLang
							(
								Lang.HiInfo,
								ZED.FormatSize(Q[KeyQueue.Size]),Q[KeyQueue.File].length,MakeS(Q[KeyQueue.File].length)
							))
							E = ZED.DateToString(DateToStringFormatDisplay,Q[KeyQueue.Finished]).split(' ')
							DateYMD.text(E[0])
							DateHNS.text(E[1])
						}
					})

					return $(DOM.div).append
					(
						ShowByClass(ClassHistoryTitleInfo).append(Title,Info),
						ShowByClass(ClassHistoryStatus).append(DateYMD,' ',DateHNS),
						MakeAction
						(
							MakeShape(Lang.Remove,ShapeConfigHistoryListRemove,ClassHistoryControlRemove),
							ClickRemove,ID
						),
						MakeAction
						(
							MakeShape(Lang.More,ShapeConfigHistoryListMore,ClassHistoryControlMore),
							MakeDetail,[ID]
						)
					)
				},ZED.noop,Q =>
				{
					MakeToolBarActive(ToolRemove,Q)
					MakeToolBarActive(ToolMerge,Q)
					MakeSelSize(X,R,CountSize)
				},
				Q => CountSize += Queue.OffSizeMap[Q],
				Q => CountSize -= Queue.OffSizeMap[Q],
				() => CountSize = 0
			);

			M.addClass(ClassScrollable)
			MakeToolBarActive(ToolRemove)
			MakeToolBarActive(ToolMerge)
			MakeToolBar(X,$(DOM.div).append
			(
				MakeToolBarClick(R,ToolRemove,Lang.RemovingN,Queue.HRemove),
				MakeToolBarClick(R,ToolMerge,Util.U,MakeMerge)
			))
			Bus.on(EventQueue.First,Q => Util.U === Q && R.Redraw())
				.on(EventQueue.FHis,R.Redraw)
				.on(EventQueue.HRemoved,(Q,X) =>
				{
					R.Redraw()
					MakeStatusX(X,Lang.RemovedN,Q.length,Util.T)
				})
				.on(EventQueue.EHRemove,E => MakeDBError(X,Lang.Remove,E))

			return R
		}
	},{
		Tab : L(Lang.Component),
		CSS : ID => ZED.Replace
		(
			'#/R/ ./B/{margin-bottom:/p/px}' +
			'#/I/{border:solid #66AFE0;border-width:2px 0}' +
			'#/I/ div{margin:4px 2px}',
			'/',
			{
				B : DOM.Button,

				R : ID,
				I : IDComponentInfo,

				p : YPadding
			}
		),
		Content : (M,X) =>
		{
			var
			RSite = ShowByClass(ClassComponentSite),
			RView = ShowByClass(ClassComponentView),
			RExe = ShowByClass(DOM.Button).text(L(Lang.ComLoad)),
			RCheck = ShowByClass(DOM.Button).text(L(Lang.ComCheck)),
			RInfo = ShowByRock(IDComponentInfo),

			Target,
			Active,

			Switch = (R,V) =>
			{
				Active && Active.removeAttr(DOM.cls)
				Active = R
				R.attr(DOM.cls,ClassSignInSiteActive)
				Target = V
			},

			SayFrom,
			Say = Q => RInfo.prepend($(DOM.div).append
			(
				ShowByText(ZED.MSToString(ZED.now() - SayFrom).replace(/^00:/,''),DOM.span)
					.attr(DOM.title,ZED.DateToString(DateToStringFormatDisplay)),
				' | ',
				ShowByText(Q,DOM.span)
			)),

			LoadLast,
			Load = () =>
			{
				MakeStatus(X,L(Lang.Loading),ClassStatusLoading)
				LoadLast && LoadLast.end()
				RInfo.empty()
				SayFrom = ZED.now()
				LoadLast = Target[KeySite.Component](Say).start(ZED.noop,E =>
				{
					Util.Debug(__filename,E)
					MakeStatus(X,E,ClassStatusError)
				},() => MakeStatus(X,L(Lang.ComLoaded)))
			},

			CheckLast,
			Check = () =>
			{
				MakeStatus(X,L(Lang.Loading),ClassStatusLoading)
				CheckLast && CheckLast.end()
				CheckLast = Target[KeySite.ComCheck]().start(ZED.noop,E =>
				{
					Util.Debug(__filename,E)
					MakeStatus(X,E,ClassStatusError)
				},() => MakeStatus(X,L(Lang.ComLoaded)))
			},

			SafeMap = {},
			SafeScript = ZED.KeyGen();

			M.addClass(ClassScrollable)
			global[SafeScript] = (Q,W) => {try{SafeMap[Q](W)}catch(e){}}
			ZED.each((V,R) =>
			{
				if (V[KeySite.Component])
				{
					V[KeySite.Frame] && V[KeySite.Frame]((Safe,Load,J) =>
					{
						var
						Frame = $(DOM.iframe),
						Element = Frame[0],
						JSPath = Path.join(Config.Root,'Site.' + V[KeySite.Name] + '.js'),
						URL = 'data:text/html;base64,' + ZED.Code.btoa(ZED.Replace
						(
							'<!DOCTYPE html>' +
							'<html>' +
							'<head>' +
							'<meta charset="utf-8">' +
							'<title>$0$</title>' +
							'<script>' +
							"top.$1$('$0$',window)" +
							'</script>' +
							'<script src="file:///$2$"></script>' +
							'</head>' +
							'<body>',
							[V[KeySite.Name],SafeScript,JSPath.replace(/\\/g,'/')]
						)),
						Refresh = () => Frame.attr(DOM.src,URL);

						SafeMap[V[KeySite.Name]] = Safe
						Frame.on(DOM.load,() => Load(Element.contentWindow))
						J && Refresh()

						RHidden.append(Frame)

						return [JSPath,Refresh]
					})
					R = $(DOM.div).text(V[KeySite.Name])
						.on(DOM.click,() => Switch(R,V))
					Target || Switch(R,V)
					RSite.append(R)
				}
			},SiteAll)
			RExe.on(DOM.click,Load)
			RCheck.on(DOM.click,Check)
			M.append
			(
				RSite,
				RView.append
				(
					RExe,
					RCheck,
					RInfo
				)
			)
		}
	},{
		Tab : L(Lang.SignIn),
		CSS : () => ZED.Replace
		(
			'./S/,./I/{display:inline-block;vertical-align:top}' +
			//Site
			'./S/{width:/s/px}' +
			'./S/>div{margin:/p/px 0;padding:/p/px;cursor:pointer}' +
			'./S/>div:hover,./A/{color:#2672EC}' +
			'./S/>div:hover{opacity:.5}' +
			'./S/>div./A/{opacity:1}' +
			//View
			'./I/{padding:/p/px;width:/i/px}' +
			'./I/ ./U/{margin:/p/px 0;padding:4px /p/px;font-size:1.2rem}' +
			//	Button
			'./I/ ./B/{text-align:center}' +
			//	VCode
			'#/V/{position:relative}' +
			'#/V/ ./U/{width:50%}' +
			'#/V/ img' +
			'{' +
				'position:absolute;' +
				'left:50%;' +
				'bottom:0;' +
				'padding:/p/px;' +
				'max-width:50%;' +
				'max-height:100%;' +
				'overflow:hidden;' +
				'cursor:pointer' +
			'}' +
			//	Cookie
			'./I/ textarea{max-width:100%;font-size:.9rem!important}',
			'/',
			{
				B : DOM.Button,

				U : ClassUnderlineInput,

				S : ClassSignInSite,
				s : YSignInSiteWidth,
				A : ClassSignInSiteActive,
				I : ClassSignInView,
				i : YStageWidthWithoutScroll - YSignInSiteWidth,
				V : IDSignInInputVCode,

				p : YPadding
			}
		),
		Content : (M,X) =>
		{
			var
			RSite = ShowByClass(ClassSignInSite),
			RView = ShowByClass(ClassSignInView),
			RInfo = $(DOM.div),
			RVCode = ShowByRock(IDSignInInputVCode),
			RVCodeInput = ShowByInput(Lang.VCode),
			RVCodeImg = $(DOM.img),
			RExe = ShowByClass(DOM.Button).text(L(Lang.SignIn)),
			RCookie = ShowByInput(Lang.Cookie,DOM.textarea).attr(DOM.rows,6),
			RCheck = ShowByClass(DOM.Button).text(L(Lang.Check)),

			DefaultRequire = [Lang.ID,[Lang.Password]],

			Target,
			Active,
			VCodeTarget,
			VCodeEnd,

			SwitchOn,
			Switch = (R,V) =>
			{
				Active && Active.removeAttr(DOM.cls)
				Active = R
				R.attr(DOM.cls,ClassSignInSiteActive)
				Target = V
				RInfo.empty()
				RefreshVCode(Util.F)
				RefreshCookie()
				SwitchOn = []
				ZED.each((V,P) =>
				{
					ZED.isArray(V) && (V = V[0],P = Util.T)
					V = ShowByInput(V)
					P && V.attr(DOM.type,DOM.password)
					MakeEnter(V,SignIn)
					SwitchOn.push(V)
					RInfo.append(V)
				},Target[KeySite.Require] || DefaultRequire)
				RVCodeInput.val('')
			},
			RefreshVCode = J =>
			{
				if (J || VCodeTarget !== Target)
				{
					VCodeEnd && VCodeEnd.end()
					RVCodeImg.removeAttr(DOM.src).attr(DOM.title,L(Util.F === J ? Lang.ClkLoad : Lang.Loading))
					if (Target[KeySite.VCode])
					{
						RVCode.removeAttr(DOM.style)
						if (Util.F !== J)
						{
							VCodeTarget = Target
							VCodeEnd = Target[KeySite.VCode]().start(Q => ZED.isArrayLike(Q) &&
							(
								Q = ZED.Code.Base64Encode(ZED.Code.UTF8ToBinB(ZED.map(ZED.chr,Q).join(''))),
								RVCodeImg.removeAttr(DOM.title).attr(DOM.src,'data:image/jpg;base64,' + Q)
							),E =>
							{
								Util.Debug(__filename,E)
								RVCodeImg.attr(DOM.title,L(Lang.VCFail))
							})
						}
					}
					else
					{
						VCodeTarget =
						VCodeEnd = Util.F
						RVCode.hide()
					}
				}
			},
			RefreshCookie = () => RCookie.val(Cookie.Read(Target[KeySite.Name])),

			SignInEnd,
			SignIn = () =>
			{
				MakeStatus(X,L(Lang.Signing),ClassStatusLoading)
				SignInEnd && SignInEnd.end()
				SignInEnd = Target[KeySite.Login].apply
				(
					Target,
					ZED.map(ZED.invokeProp('val'),SwitchOn).concat(RVCodeInput.val())
				).start(Q => MakeStatus(X,Q),E =>
				{
					Util.Debug(__filename,E)
					MakeStatus(X,L(Lang.SIError),ClassStatusError)
				})
			},

			CheckEnd,
			Check = () =>
			{
				Cookie.Set(Target[KeySite.Name],RCookie.val())
				MakeStatus(X,L(Lang.Checking),ClassStatusLoading)
				CheckEnd && CheckEnd.end()
				CheckEnd = Target[KeySite.Check]().start
				(
					Q => MakeStatus(X,Q ? ReplaceLang(Lang.Checked,Q) : L(Lang.NotSigned)),
					E =>
					{
						Util.Debug(__filename,E)
						MakeStatus(X,L(Lang.CheckError),ClassStatusError)
					}
				)
			};

			M.addClass(ClassScrollable)
			ZED.each((V,R) =>
			{
				if (V[KeySite.Login])
				{
					R = $(DOM.div).text(V[KeySite.Name])
						.on(DOM.click,() => Switch(R,V))
					Target || Switch(R,V)
					RSite.append(R)
				}
			},SiteAll)
			RVCodeInput.on(DOM.focus,ZED.nAry(0,RefreshVCode))
			RVCodeImg.on(DOM.click,RefreshVCode)
			MakeEnter(RVCodeInput,SignIn)
			RExe.on(DOM.click,SignIn)
			RCheck.on(DOM.click,Check)
			M.append
			(
				RSite,
				RView.append
				(
					RInfo,
					RVCode.append(RVCodeInput,RVCodeImg),
					RExe,
					RCookie,
					RCheck
				)
			)

			Bus.on(Event.Cookie.Change,RefreshCookie)
		}
	},{
		Tab : L(Lang.Shortcut),
		CSS : ID => ZED.Replace
		(
			//Control and input
			'#/R/ span,#/R/ input{vertical-align:middle}' +
			//Control
			'#/R/ ./S/{margin-right:/p/px;width:20px;height:20px}' +
			//Title
			'./T/{padding:/p/px;background:#EBEBEB}' +
			//Detail
			'./T/~div{margin:/p/px}' +
			//Button
			'./B/{padding:0 6px;color:#2672EC;border-bottom:1px solid;cursor:pointer}' +
			//Input
			'#/R/ ./U/{padding:4px 6px 0;width:30%;cursor:text}' +
			//CheckBox
			'#/R/ ./U/+div{display:inline-block;margin-left:20px}' +
			'#/R/ input[type="checkbox"]{margin-left:/p/px}',
			'/',
			{
				S : ClassShape,
				U : ClassUnderlineInput,

				R : ID,
				T : ClassShortCutTitle,
				B : ClassShortCutButton,

				p : YPadding
			}
		),
		Content : M =>
		{
			var
			Active,
			ListKeyWrap = 0,
			ListKeySwitch = 1,
			ListKeySwitchKey = 0,
			ListKeySwitchWhen = 1,
			SC = ZED.ShortCut(
			{
				Target : M,
				IgnoreInput : Util.F
			});

			M.addClass(ClassScrollable)
			ZED.Each(ShortCut.DefaultMap,(Command,Default) =>
			{
				var
				R = $(DOM.div),

				List = [],

				Save = () =>
				{
					ShortCut.Save(Command,ZED.filter
					(
						ZED.nth(ListKeySwitchKey),
						ZED.map(ZED.nth(ListKeySwitch),List)
					))
				},
				On = Q =>
				{
					UShortCut.on
					(
						Q[ListKeySwitchKey],
						ShortCut.Up & Q[ListKeySwitchWhen] ? Command : Util.N,
						ShortCut.Down & Q[ListKeySwitchWhen] ? Command : Util.N,
						!(ShortCut.SwitchOnce & Q[ListKeySwitchWhen])
					)
				},
				Off = Q => UShortCut.off(Q[ListKeySwitchKey],Command,Command),
				ReBind = () =>
				{
					//It does not check if a shortcut is unique, so this must be handled
					ZED.each(Q => Off(Q[ListKeySwitch]),List)
					ZED.each(Q => On(Q[ListKeySwitch]),List)
					Save()
				},
				Add = (Q,S,W,I) =>
				{
					if (ZED.isArray(Q))
					{
						S = Q[ListKeySwitchWhen]
						Q = Q[ListKeySwitchKey]
					}
					Q = ZED.isString(Q) ? Q : ''
					ZED.isNumber(S) || (S = ShortCut.Up)
					R.append(W = $(DOM.div).append
					(
						MakeShape(Lang.Remove,ShapeConfigShortCutRemove).on(DOM.click,() =>
						{
							Remove(W)
							ReBind()
						}),
						I = ShowByClassX(ClassUnderlineInput + ' ' + DOM.NoSelect,DOM.input)
							.attr(DOM.readonly,'')
							.val(Q)
							.on(DOM.focus,() => Active = I)
							.on(DOM.blur,() =>
							{
								I === Active && (Active = Util.F)
								Off(S)
								S[0] = I.val()
								ReBind()
							}),
						ZED.reduce((D,V) =>
						{
							D.append(ShowByCheckBox(V[0],V[1] & S,Q =>
							{
								Q ? S[1] |= V : S[1] &= ~V
								Off(S)
								ReBind()
							}))
							V = V[1]
						},$(DOM.div),
						[
							[Lang.SCUp,ShortCut.Up],
							[Lang.SCDown,ShortCut.Down],
							[Lang.SCOnce,ShortCut.Once]
						])
					))
					List.push(W = [W,S = [Q,S]])
					On(S)
				},
				Remove = (Q,F) =>
				{
					Off(Q[ListKeySwitch])
					Q[ListKeyWrap].detach()
					for (F = List.length;F;) if (Q === List[--F])
					{
						List.splice(F,1)
						break
					}
				},
				Build = ZED.each(Add);

				Default = ZED.isArray(Default) ? Default : [Default]

				R.append
				(
					ShowByText(ZED.map
					(
						V => Lang[V] ? L(Lang[V]) : V,
						Command.split('.')
					).join(' | ')).addClass(ClassShortCutTitle),
					$(DOM.div).append
					(
						MakeShape(Lang.AddSC,ShapeConfigShortCutAdd).on(DOM.click,Add),
						ShowByClassX(ClassShortCutButton + ' ' + DOM.NoSelect,DOM.span)
							.text(L(Lang.DefSC))
							.on(DOM.click,F =>
							{
								for (F = List.length;F;) Remove(List[--F])
								Build(Default)
								ShortCut.Remove(Command)
							})
					)
				)
				Build(ShortCut.Data(Command) || Default)

				M.append(R)
			})

			SC.on('*',Util.F,E => Active &&
			(
				Active.val(SC.keyNames()[0]),
				Util.PrevDef(E)
			))

			UShortCut
				.cmd(ShortCutCommand.PrevTab,X =>
				{
					MakeCoverClose()
					X = UTab.Index() - 1
					UTab.Index(X < 0 ? YTabCount + X : X)
				})
				.cmd(ShortCutCommand.NextTab,X =>
				{
					MakeCoverClose()
					X = UTab.Index() + 1
					UTab.Index(X < YTabCount ? X : X - YTabCount)
				})
				.cmd(ShortCutCommand.Reload,ViewReload)
				.cmd(ShortCutCommand.ToggleDev,() =>
				{
					MakeNoti(Util.U,L(ViewDevIsOpen() ? Lang.DevClose : Lang.DevOpen),Util.T)
					ViewDevToggle()
				})
				.on('ctrl+a',Util.N,Util.PrevDef,Util.T)
		}
	},{
		Tab : L(Lang.Setting),
		CSS : ID => ZED.Replace
		(
			'#/R/{padding:/p/px}' +
			'#/R/ ./I/{width:100%}' +
			'./O/,./D/{vertical-align:top}' +
			'./O/{width:/o/px;height:/o/px}' +
			'#/R/ ./D/{margin-left:4px;width:/d/px}',
			'/',
			{
				I : DOM.Input,

				R : ID,
				O : ClassSettingDirOpen,
				o : YSettingOpenSize,
				D : ClassSettingDir,
				d : YStageWidthWithoutScroll - 2 * YPadding - YSettingOpenSize - 4,

				p : YPadding
			}
		),
		Content : M =>
		{
			var
			DefaultName = '|Author|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?',
			DefaultNameFull = '|Author|/|YYYY|/' + DefaultName,
			Default = ZED.ReduceToObject
			(
				KeySetting.Dir,Path.join(Config.Root,'Download'),
				KeySetting.Name,DefaultNameFull,
				KeySetting.Max,5,
				KeySetting.Font,'Microsoft Yahei',
				KeySetting.Size,12,
				KeySetting.Weight,'normal',
				KeySetting.Restart,20,
				KeySetting.Merge,'"mkvmerge",\n' +
					'"--output",\n' +
					'"|Output|",\n' +
					'"|Head|",\n' +
					'["+|Tail|"]',
				KeySetting.Suffix,'mkv'
			),
			Data,

			KeyFont = ZED.KeyGen(),

			MakeInput = (Q,S) => ZED.Merge({T : 'I',E : {placeholder : Default[Q]}},S),

			NotiTray = () => IPCRenderer.send('Tray',Data[KeySetting.Tray]),
			RefreshStyle = S =>
			(
				S = ('' + Setting.Data(KeySetting.Size)).trim(),
				ZED.Replace
				(
					'html,input,textarea{font-family:"/F/";font-size:/S/;font-weight:/W/}',
					'/',
					{
						F : Setting.Data(KeySetting.Font),
						S : /^\d+(?:\.\d*)?$/.test(S) ? ZED.min(ZED.max(8,Number(S) || 0),30) + 'px' : S,
						W : Setting.Data(KeySetting.Weight)
					}
				)
			),
			RefreshFont = () => ZED.CSS(KeyFont,RefreshStyle),

			DirInput,
			Opening,
			OpenDir = () =>
			{
				if (!Opening)
				{
					Opening = Util.T
					Dialog.showOpenDialog({properties : ['openDirectory']},Q =>
					{
						Opening = Util.F
						Q && Q[0] && DirInput.val(Q[0]).trigger(DOM.einput)
					})
				}
			},

			T;

			M.addClass(ClassScrollable)
			Data = Setting.Data()
			Setting.Default(Default)
			Data[KeySetting.Tray] = !!Data[KeySetting.Tray]
			T = Number(Data[KeySetting.Max])
			;(0 < T && T < 11) || (T = Default[KeySetting.Max])
			Queue.Max(Data[KeySetting.Max] = T)
			T = Number(Data[KeySetting.Restart])
			0 < T || (T = Default[KeySetting.Restart])
			Queue.Wait(Data[KeySetting.Restart] = T)
			Download.Alias(Data[KeySetting.Alias])
			NotiTray()
			RefreshFont()

			ZED.Preference(
			{
				Parent : M,
				Data : Data,
				Set :
				[
					[L(Lang.Directory),[MakeInput(KeySetting.Dir)],KeySetting.Dir],
					[L(Lang.FName),[DefaultName,DefaultNameFull,MakeInput(KeySetting.Name)],KeySetting.Name],
					[L(Lang.MaxDown),ZED.range(1,11),KeySetting.Max,() =>
					{
						Queue.Max(Data[KeySetting.Max])
						Queue.Dispatch()
					}],
					[L(Lang.TTray),[[L(Lang.Yes),Util.F],[L(Lang.No),Util.T]],KeySetting.Tray,NotiTray],
					[L(Lang.Font),[MakeInput(KeySetting.Font)],KeySetting.Font,RefreshFont],
					[L(Lang.Size),[MakeInput(KeySetting.Size)],KeySetting.Size,RefreshFont],
					[
						L(Lang.Weight),
						['normal','lighter','bold','bolder',MakeInput(KeySetting.Weight)],
						KeySetting.Weight,
						RefreshFont
					],
					[L(Lang.RestartT),[MakeInput(KeySetting.Restart,{N : Util.T})],KeySetting.Restart,() =>
					{
						Queue.Wait(Data[KeySetting.Restart] || Default[KeySetting.Restart])
					}],
					[L(Lang.MergeCmd),[{T : 'T',E : {placeholder : Default[KeySetting.Merge],rows : 8}}],KeySetting.Merge],
					[L(Lang.MergeSuf),[MakeInput(KeySetting.Suffix)],KeySetting.Suffix],
					[L(Lang.Alias),[
					{
						T : 'T',
						E :
						{
							placeholder : 'Original Name 0\n' +
								'Final Name 0\n' +
								'Original Name 1\n' +
								'Final Name 2\n' +
								'...',
							rows : 8
						}
					}],KeySetting.Alias,() => Download.Alias(Data[KeySetting.Alias])]
				],
				Change : () => Setting.Save(Data)
			})
			DirInput = M.find('.' + DOM.Input).eq(0).addClass(ClassSettingDir)
			DirInput.before(MakeShape(Lang.DirSel,ShapeConfigSettingDir,ClassSettingDirOpen,DOM.div).on(DOM.click,OpenDir))
		}
	})

	//ShadowBar
	RNavi.find('.' + DOM.Tab).append(ShowByClass(ClassShadowBar))
	//Close Cover
	RNavi.on(DOM.click,'.' + DOM.Tab,MakeCoverClose)
	UShortCut.cmd(ShortCutCommand.CloseCover,MakeCoverClose)
	//Detail
	RDetail.append(RDetailHead,RDetailInfo,RDetailPart)
	Bus
		//Noti
		.on(EventQueue.First,() => ++MakeDBLoadState < 2 || MakeNoti
		(
			MakeDBLoadKey,
			ReplaceLang(Lang.DBDone,ZED.now() - Started.getTime()),
			Util.T
		))
		//Queue
		.on(EventQueue.Info,MakeDetailMake(() => RDetailInfo.text(L(Lang.GetInfo))))
		.on(EventQueue.InfoGot,MakeDetailMake(MakeDetailSetupInfo))
		.on(EventQueue.SizeGot,MakeDetailMake(Q => MakeDetailInfoTTS.text(ZED.FormatSize(Q[KeyQueue.Size]))))
		.on(EventQueue.Finish,MakeDetailMake(MakeDetailRefresh))
		//Download
		.on(EventDownload.File,MakeDetailMake((Q,S,I) => MakeDetailFile[I].text(S)))
		.on(EventDownload.Size,MakeDetailMake((Q,S,F) => MakeDetailURL[F].text(MakeSizePercentage(S,0))))
		.on(EventDownload.Dir,MakeDetailMake(Q => MakeDetailInfoDir.text(Q[KeyQueue.Dir])))
		.on(EventDownload.Speed,(S,Q) => MakeDetailActive === Q[KeyQueue.Unique] && MakeDetailRefresh(Q))
	//Merge
	RMerge.append
	(
		RMergeProgress,
		ZED.reduce((D,V) =>
		{
			D.append(ShowByClass(DOM.Button)
				.text(L(V[1]))
				.on(DOM.click,() => MakeMergeAble && MakeMergeCompose(V)))
			V = V[0]
		},$(DOM.div),
		[
			[MakeMergeEscapeWin,'Windows cmd.exe'],
			[MakeMergeEscapeUnix,'Unix bash'],
			[[ZED.identity,ZED.identity],Lang.NoEscape]
		]),
		RMergeText
	)
	//StatusBar Icon
	ZED.each(V => RStatusIcon.append(ShowByRock(IDStatusIcon + ZED.chr(65 + V))),ZED.range(0,2))
	//Speed & Ping
	Bus.on(EventDownload.SpeedTotal,Q =>
	{
		Q = ZED.FormatSize(Q) + '/s'
		RSpeed.text(Q)
		IPCRenderer.send('Ping',`[${Queue.Online.length}] ${Q}`)
	})

	Rainbow.append
	(
		RToolBar.append
		(
			ShowByClass(ClassShadowBar),
			ShowByClass(DOM.VerticalMiddle),
			RToolBarIcon,RToolBarItem
		),
		ShowByRock(IDNaviStage).append
		(
			ShowByRock(IDNavi).append
			(
				RNavi.append(ShowByClass(ClassShadowBar))
			),
			RStage
		),
		RStatusBar.append
		(
			ShowByClass(ClassShadowBar),
			ShowByClass(DOM.VerticalMiddle),
			ShowByRock(IDStatusBarWrap).append
			(
				RStatus.append(RStatusIcon,RStatusText),
				ShowByRock(IDStatusBarRight).append(RSpeed)
			)
		),
		RHidden
	)

	global.Debug =
	{
		RequestPool : Util.RequestPool,
		DebugPool : Util.DebugPool
	}

	$(() =>
	{
		Rainbow.appendTo('body')
		setTimeout(() => MakeNoti(MakeDBLoadKey,L(Lang.DB)),50)
		Queue.Dispatch()
	})
})()