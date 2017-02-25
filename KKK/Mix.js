~function()
{
	'use strict'
	var
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
	FnClick = $.fn.click,

	global = ZED.global,

	Path = require('path'),

	Electron = require('electron'),
	Remote = Electron.remote,
	Dialog = Remote.dialog,
	ToggleDev = function()
	{
		Remote.getCurrentWebContents().toggleDevTools()
	},



	DateToStringFormatFile = '%YYYY%.%MM%.%DD%.%HH%.%NN%.%SS%',
	DateToStringFormatDisplay = '%YYYY%.%MM%.%DD% %HH%:%NN%:%SS%.%MS%',
	ReKeyGenStore = [],
	ReKeyGen = function(Q)
	{
		return Q ? ReKeyGenStore.shift() :
		(
			ReKeyGenStore.push(Q = ZED.KeyGen()),
			Q
		)
	},
	MakeSiteDate = function(Q)
	{
		Q = Q[KeySite.Date]
		return ZED.isDate(Q) || ZED.now(new Date(Q)) ?
			ZED.DateToString(DateToStringFormatFile,Q) :
			Q
	},
	MakeEnter = function(Q,S)
	{
		ZED.ShortCut({Target : Q}).on('enter',S)
	},
	MakeShape = function(S,Q,C,T)
	{
		return ShowByClassX(ClassShape + (C ? ' ' + C : ''),T || DOM.span).attr(DOM.title,L(S)).append(ZED.Shape(Q))
	},

	MakeS = function(Q){return 1 === Q ? '' : 's'},
	ShowByRock = function(Q)
	{
		return $(DOM.div).attr(DOM.id,Q)
	},
	ShowByClass = function(Q)
	{
		return $(DOM.div).attr(DOM.cls,Q)
	},
	ShowByClassX = function(Q,S)
	{
		return $(S).attr(DOM.cls,Q)
	},
	ShowByText = function(Q,S)
	{
		return $(S || DOM.div).text(Q)
	},
	ShowByInput = function(Q,S)
	{
		return ShowByClassX(ClassUnderlineInput,S || DOM.input).attr(DOM.placeholder,L(Q))
	},
	MakeAt = function(Q,S)
	{
		return ShowByClass(ClassSingleLine).attr(DOM.title,Q + '@' + S)
			.append(Q,ShowByText('@',DOM.span),S)
	},
	MakeSizePercentage = function(S,D)
	{
		return ZED.isNull(S) ?
			L(Lang.Calculating) :
			S ?
				S === D ?
					ReplaceLang(Lang.Completed,ZED.FormatSize(S)) :
					ReplaceLang(Lang.SizeP,ZED.FormatSize(D),ZED.FormatSize(S),ZED.Format(100 * D / S)) :
				ReplaceLang(Lang.SizeNP,ZED.FormatSize(D))
	},



	//Config
	//	Misc
	YTabCount = 7,
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
	YHistoryTitlePercentage = .75,
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
	ClassScrollable = ZED.KeyGen(),
	ClassUnderlineInput = ZED.KeyGen(),
	ClassShape = ZED.KeyGen(),
	ClassSingleLine = ZED.KeyGen(),
	//	Browser
	IDBrowserInput = ZED.KeyGen(),
	IDBrowserInfo = ZED.KeyGen(),
	IDBrowserList = ZED.KeyGen(),
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
	ClassHistoryDate = ZED.KeyGen(),
	ClassHistoryControlRemove = ClassHotControlRemove,
	ClassHistoryControlMore = ClassHotControlMore,
	//	Component
	ClassComponentSite = ZED.KeyGen(),
	ClassComponentSiteActive = ZED.KeyGen(),
	ClassComponentView = ZED.KeyGen(),
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
	RStage = ShowByRock(IDStage).attr(DOM.cls,ClassScrollable),
	//	Cover
	RDetail = ShowByRock(IDDetail).attr(DOM.cls,ClassCover),
	RDetailHead = ShowByRock(IDDetailHead),
	RDetailInfo = ShowByRock(IDDetailInfo),
	RDetailPart = ShowByRock(IDDetailPart),
	RDetailChildren = $(ZED.flatten([RDetailHead,RDetailInfo,RDetailPart])),
	RMerge = ShowByRock(IDMerge).attr(DOM.cls,ClassCover),
	RMergeProgress = $(DOM.div),
	RMergeText = $(DOM.textarea),
	RMergeChildren = $(ZED.flatten([RMergeProgress])),
	//	StatusBar
	RStatusBar = ShowByRock(IDStatusBar),
	RStatus = ShowByRock(IDStatus),
	RStatusIcon = ShowByRock(IDStatusIcon)
		.on(DOM.aniend,function(){RStatusIcon.removeClass(ClassStatusIconAnimation)}),
	RStatusText = ShowByClass(ClassSingleLine),
	RSpeed = ShowByRock(IDSpeed),
	RHidden = ShowByRock().hide(),



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

	MakeToolBarStorage = Array(YTabCount),
	MakeToolBarLast,
	MakeToolBarChange = function()
	{
		MakeToolBarLast && MakeToolBarLast.detach()
		if (MakeToolBarLast = MakeToolBarStorage[UTab.Index()])
			RToolBarItem.append(MakeToolBarLast)
	},
	MakeToolBar = function(X,Q)
	{
		MakeToolBarStorage[X] = Q
	},
	MakeToolBarActive = function(S,Q)
	{
		Q ?
			S.removeClass(ClassToolBarDisabled) :
			S.addClass(ClassToolBarDisabled)
	},


	MakeCount = function(Q)
	{
		var
		S = ShowByClassX(ClassCount,DOM.span),
		R = $(DOM.div).append(L(Q),S);

		return function(Q)
		{
			return ZED.isNull(Q) ? R : S.text(Q ? '[' + Q + ']' : '')
		}
	},
	RColdCount = MakeCount(Lang.Cold),
	RHotCount = MakeCount(Lang.Hot),

	MakeScroll = function(W,H,S)
	{
		S = 0
		return {
			Show : function()
			{
				RStage.scrollTop(S)
				W && W()
			},
			Hide : function()
			{
				S = RStage.scrollTop()
				H && H()
			}
		}
	},
	MakeSelectableList = function
	(
		Scroll,Index,
		Data,Map,Key,
		Measure,Make,Destroy,
		SelectChange,
		OnSelect,OnUnselect,OnClear
	){
		var
		LastScroll = 0,

		LastIndex = 0,
		LastID,
		Selecting = {},
		Count = 0,
		Active = {},

		Clear = function()
		{
			ZED.EachKey(Selecting,function(V)
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
		Change = function()
		{
			SelectChange(Count)
		},
		ClearChange = ZED.pipe(Clear,Change),
		List = ZED.ListView(
		{
			Scroll : Scroll,
			Data : Data,
			Measure : Measure,
			Make : function(Q,X)
			{
				var
				ID = Key ? Q[Key] : Q,
				On = Selecting[ID],
				R = Active[ID] = Make(Q,X);

				R.on(DOM.click,function(E)
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
						ZED.Each(S,function(F,V)
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
			Destroy : function(Q,V)
			{
				Q.off(DOM.click)
				Active[Key ? V[Key] : V] = Util.F
				Destroy(V,Q)
			},
			Later : Util.T
		}),

		Redraw = function()
		{
			Active = {}
			if (Count)
			{
				ZED.Each(Selecting,function(F,V)
				{
					ZED.has(F,Map) ||
					(
						--Count,
						ZED.delete_(F,Selecting),
						OnUnselect(V)
					)
				})
				LastIndex = LastID ? ZED.max(0,Data.indexOf(Map[LastID])) : 0
			}
			List.recalc().redraw().scroll(LastScroll)
			Change()
		};

		Scroll.addClass(DOM.NoSelect).on(DOM.click,ClearChange)
		UShortCut.cmd(ShortCutCommand.ListClear,MakeIndex(Index,ClearChange))
			.cmd(ShortCutCommand.ListAll,MakeIndex(Index,function()
			{
				ZED.each(function(V,ID)
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

		return {
			Count : function(){return Count},
			Selecting : function(){return Selecting},
			Show : function()
			{
				RStage.removeAttr(DOM.cls)
				Redraw()
			},
			Hide : function()
			{
				RStage.attr(DOM.cls,ClassScrollable)
				LastScroll = List.scroll()
			},
			Redraw : function()
			{
				if (Index === UTab.Index())
				{
					LastScroll = List.scroll()
					Redraw()
				}
			}
		}
	},
	MakeSelecting = function(X,R)
	{
		R = R.Count()
		MakeStatus(X,R ? ReplaceLang(Lang.SelectingN,R,MakeS(R)) : '')
	},
	MakeSelSize = function(X,R,S,P)
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

	MakeCoverActive,
	MakeCoverAt,
	MakeCoverOn = function()
	{
		MakeCoverActive = Util.T
		MakeCoverAt = UTab.Index()
		MakeToolBarLast && MakeToolBarLast.detach()
		RStatusText.text('')
		RStatusIcon.removeAttr(DOM.cls)
	},
	MakeCoverOff = function()
	{
		MakeCoverActive = Util.F
		MakeCoverAt === UTab.Index() && MakeToolBarChange()
		MakeStatusChange()
	},

	MakeDetailActive,
	MakeDetailInfoProgress,
	MakeDetailInfoDir,
	MakeDetailInfoTTS,
	MakeDetailInfoDownloaded,
	MakeDetailURL,
	MakeDetailSetupSingle = function(S,Q)
	{
		return ShowByClass(ClassSingleLine).append
		(
			ShowByClassX(ClassDetailLabel,DOM.span).text(L(S)),
			' ',
			ZED.isObject(Q) ? Q : ShowByText(Q,DOM.span)
		)
	},
	MakeDetailProgress = function(Q)
	{
		return Q[KeyQueue.Finished] ?
			ReplaceLang(Lang.FinishedAt,ZED.DateToString(DateToStringFormatDisplay,Q[KeyQueue.Finished])) :
			Q[KeyQueue.Done] ?
				0 < Q[KeyQueue.Size] ?
					ZED.Format(100 * Q[KeyQueue.DoneSum] / Q[KeyQueue.Size]) + '%' :
					L(Lang.Unfinished) :
				'0%'
	},
	MakeDetailSize = function(Q)
	{
		return Q[KeyQueue.Size] < 0 ?
			L(Lang.Calculating) :
			Q[KeyQueue.Size] ?
				ZED.FormatSize(Q[KeyQueue.Size]) :
				L(Lang.SizeUn)
	},
	MakeDetailSetupURL = function(V,Q)
	{
		ZED.each(function(V)
		{
			var I = MakeDetailURL.length,R;

			RDetailPart.append($(DOM.div).append
			(
				ShowByClass(ClassSingleLine).attr(DOM.title,V).text(V),
				R = ShowByText
				(
					Q[KeyQueue.Sizes] ?
						MakeSizePercentage(Q[KeyQueue.Sizes][I],Q[KeyQueue.Done][I]) :
						L(Lang.GetSize),
					DOM.span
				)
			))
			MakeDetailURL.push(R)
		},V)
	},
	MakeDetailSetupInfo = function(Q)
	{
		var
		Part = Q[KeyQueue.Part];

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

		MakeDetailURL = []
		if (Part.length) ZED.Each(Part,function(F,V)
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
	MakeDetailRefresh = function(Q)
	{
		var
		Size = Q[KeyQueue.Sizes],
		Done = Q[KeyQueue.Done];

		MakeDetailInfoProgress && MakeDetailInfoProgress.text(MakeDetailProgress(Q))
		Done && MakeDetailInfoDownloaded.text(ZED.FormatSize(Q[KeyQueue.DoneSum]))
		Size && ZED.Each(MakeDetailURL,function(F,V){V.text(MakeSizePercentage(Size[F],Done[F]))})
	},
	MakeDetailSetup = function(ID,Q)
	{
		MakeCoverOn()
		if (MakeDetailActive) RDetailChildren.empty()
		else RStage.append(RDetail)
		MakeDetailActive = ID

		RDetailHead.append
		(
			ShowByText(Q[KeyQueue.Title]),
			ShowByText(Q[KeyQueue.Name] + ' ' + SiteMap[Q[KeyQueue.Name]][KeySite.IDView](Q[KeyQueue.ID]),DOM.span)
		)
		if (Q[KeyQueue.Part]) MakeDetailSetupInfo(Q)
		else RDetailInfo.text(L(Queue.IsInfo(Q[KeyQueue.Unique]) ? Lang.GetInfo : Lang.ReadyInfo))
	},
	MakeDetailQuerying,
	MakeDetail = function(Q,J)
	{
		J = ZED.isArray(Q)
		J && (Q = Q[0])
		if (MakeDetailQuerying !== Q)
		{
			MakeDetailQuerying = Q
			;(J ? Queue.HInfo : Queue.Info)(Q,function(E,R)
			{
				if (!E && MakeDetailQuerying === Q)
				{
					MakeDetailQuerying = Util.F
					MakeDetailSetup(Q,R)
				}
			})
		}
	},
	MakeDetailClose = function()
	{
		if (MakeDetailActive)
		{
			RDetailChildren.empty()
			RDetail.detach()
			MakeCoverOff()
			MakeDetailActive =
			MakeDetailInfoDir =
			MakeDetailInfoTTS =
			MakeDetailInfoDownloaded = Util.F
		}
	},
	MakeDetailMake = function(H)
	{
		return function(Q,S,R)
		{
			MakeDetailActive === Q[KeyQueue.Unique] && H(Q,S,R)
		}
	},

	MakeMergeEnd,
	MakeMergeStore,
	MakeMergeProcess = function(L,S)
	{
		RMergeProgress.text(ReplaceLang(Lang.ProcessingN,S,L))
	},
	MakeMergeCompose = function(HP,HA)
	{
		var
		Make = ZED.JTO('[\n' +
		'  "mkvmerge",\n' +
		'  "--ui-language",\n' +
		'  "ja",\n' +
		'  "--output",\n' +
		'  "%Output%",\n' +
		'  "%Head%",\n' +
		'  [\n' +
		'    "+",\n' +
		'    "%Tail%"\n' +
		'  ]\n' +
		']'),
		L = Make.length,

		MakeIsString = Array(L),
		MakeIsTail = Array(L),

		File,O = {},
		R = [],S,
		In = function(Q){S.push(HA(ZED.Replace(Q,'%',O)))},
		F,Fa,Fb,Fc;

		for (F = 0;++F < L;)
		{
			File = Make[F]
			if (F && ZED.isArray(File))
			{
				MakeIsTail[F] = /_/.test(ZED.Replace
				(
					('' + File).replace(/_/g,''),
					'%',
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
			S = [HP(Make[0])]
			for (Fa = 0;++Fa < L;)
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
		RMergeText.val(R.join('\n'))
	},
	MakeMerge = function(Q,L)
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
			MakeMergeEnd = Observable.from(Q)
				.flatMapOnline(1,QueueHInfo)
				.map(function(Q,F)
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
							Part[KeyQueue.Suffix] = '.mkv'
							if (1 < T)
							{
								MakeMergeStore.push(
								[
									Download.FileName(Q,Parts.length,0,Part,F,0,0),
									ZED.map(function(V)
									{
										return Path.join(Q[KeyQueue.Dir],V)
									},Q[KeyQueue.File].slice(I,I + T))
								])
							}
							I += T
						}
					}
				}).start(Util.N,function(E)
				{
					Util.Debug(__filename,E)
					RMergeProgress.text(L(Lang.Errored))
				},function()
				{
					MakeMergeCompose(function(Q)
					{
						return /[&<>[\]{}^=;!'+,`~ ]/.test(Q) ? '"' + Q + '"' : Q
					},function(Q,R,T,F)
					{
						if (!Q) return '^"^"'
						if (!/[^\w+,\-./:=@]/.test(Q)) return Q
						R = '"'
						for (F = 0;F < Q.length;++F)
						{
							T = 0
							for (;F < Q.length && '\\' === Q.charAt(F);++F) ++T
							R += Q.length <= F ?
								ZED.Times('\\',2 * T) :
								'"' === Q.charAt(F) ?
									ZED.Times('\\',1 + 2 * T) + '"' :
									Q.substr(F - T,1 + T)
						}
						R += '"'
						return R.replace(/[()%!^"<>&|]/g,'^$&')
					})
				})
		}
	},
	MakeMergeClose = function()
	{
		if (MakeMergeEnd)
		{
			RMergeChildren.empty()
			RMerge.detach()
			RMergeText.val('')
			MakeMergeEnd.end()
			MakeCoverOff()
			MakeMergeEnd =
			MakeMergeStore = Util.F
		}
	},

	MakeStatusText = Array(YTabCount),
	MakeStatusClass = Array(YTabCount),
	MakeStatusChange = function(X,Q,S)
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
	MakeStatus = function(X,Q,S)
	{
		MakeStatusText[X] = Q
		MakeStatusClass[X] = Q && (S || ClassStatusInfo)
		X === UTab.Index() && MakeStatusChange()
	},
	MakeStatusX = function(X,L,T)
	{
		MakeStatus(X,ReplaceLang(L,T,MakeS(T)))
	},
	MakeToolBarClick = function(R,X,Q,L,H,N)
	{
		return Q.on(DOM.click,function(T)
		{
			Util.StopProp(T)
			T = R.Count()
			T = N ? H() : (T && H(R.Selecting()))
			0 < T && MakeStatusX(X,L,T)
		})
	},
	MakeDBError = function(X,G,E)
	{
		Util.Debug(__filename,E)
		MakeStatus(X,ReplaceLang(Lang.ErrWhile,L(G)),ClassStatusError)
	},



	UShortCut = ZED.ShortCut(),
	MakeIndex = ZED.curry(function(X,Q)
	{
		!MakeCoverActive && X === UTab.Index() && Q()
	},3),
	UTab = ZED.Tab(
	{
		Tab : RNavi,
		Content : RStage,
		Default : 0,
		Show : function()
		{
			MakeToolBarChange()
			MakeStatusChange()
		}
	});

	ZED.onError = function(E){Util.Debug(__filename,E)}

	ZED.CSS(ZED.KeyGen(),function(W,H)
	{
		YStageWidth = ZED.max(YNaviWidth,W - YNaviWidth)
		YStageWidthWithoutScroll = YStageWidth - YScrollWidth
		YStageHeight = ZED.max(YToolBarHeight + YStatusBarHeight,H - YToolBarHeight - YStatusBarHeight)

		return ZED.Replace
		(
			'html,body{margin:0;padding:0;background:#F7F7F7;color:#6C6C6C;overflow:hidden}' +
			'input,textarea{background:transparent;color:#6C6C6C;outline:0}' +

			//Rainbow
			'#/R/{height:/r/px;background:inherit;word-break:break-word}' +
			'#/R/>div{background:inherit}' +
			'#/R/ *{box-sizing:border-box}' +

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
			'#/G/{position:relative;width:/g/px;background:inherit}' +
			//		Scroll
			'./Y/,./W/,#/DT/{overflow-x:hidden;overflow-y:scroll}' +
			//		ListView
			'#/G/ ./W/{height:100%}' +
			//			ListViewItem
			'#/G/ ./Z/{cursor:default}' +
			'#/G/ ./Z/:hover{background:#EFE5F9}' +
			//			Selected item
			'#/G/ ./F/{background:#E6D5F5!important}' +
			//			Item Control
			'#/G/ ./HP/{cursor:pointer}' +
			'#/G/ ./HP/:hover svg>rect,#/G/ ./HP/:hover circle{fill:#0065CB!important}' +
			//		Cover
			'./CR/{position:absolute;left:0;top:0;width:100%;height:100%;background:inherit;text-align:center}' +
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
			'#/DP/ ./SL/{padding-left:/p/px;color:blue}' +
			//				URL status
			'#/DP/ div>span{padding-left:/p/px}' +

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
			//		Animation keyframe
			'/e/' +
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

			//Index
			//	Toolbar shadow should be higher than NaviStage
			'#/T/ ./B/,#/S/ ./B/{z-index:8000}' +
			//	Navi .TabTab should be lower than Toolbar shadow but higher than Navi shadow
			'#/N/ ./I/{z-index:6000}',
			'/',
			{
				I : DOM.Tab,
				O : DOM.TabOn,
				W : DOM.ListView,
				X : DOM.ListViewParent,
				Z : DOM.ListViewItem,

				R : IDRainbow,
				r : H,//Rainbow Height

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
				e : ZED.CSSKeyframe(ReKeyGen(Util.T),{'50%' : {transform : 'translateY(-4px)'}}) +
					ZED.CSSKeyframe(ReKeyGen(Util.T),{to : {transform : 'rotate(360deg)'}}) +
					ZED.CSSKeyframe(ReKeyGen(Util.T),{to : {transform : 'rotate(405deg)'}}),
				D : IDSpeed,

				B : ClassShadowBar,
				b : YShadowSize,
				a : YShadowColor,

				E : ClassError,

				UI : ClassUnderlineInput,
				HP : ClassShape,
				SL : ClassSingleLine,

				p : YPadding
			}
		)
	})

	UTab.Add(
	{
		Tab : L(Lang.Browser),
		CSS : function(ID,W)
		{
			W = ZED.FlexibleFit(YStageWidthWithoutScroll - YPadding - YPadding,YCardWidthMin,YCardWidthMax,YPadding)
			return ZED.Replace
			(
				'#/R/{text-align:center}' +
				'#/R/>div{margin-top:10px!important}' +

				//URL input
				'#/I/{position:relative;display:inline-block;padding:0 10px;width:100%}' +
				//	input
				'#/I/ input{padding:12px 60px 4px 20px;font-size:1.2rem}' +
				//	Enter button
				'#/I/>div' +
				'{' +
					'position:absolute;' +
					'right:10px;' +
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
				'#/I/>div:hover{background:#F3F3F3}' +

				//Info panel
				'#/O/{margin:0 10px;padding:10px;border:solid #66AFE0;border-width:2px 0;font-size:1.1rem}' +

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
					'box-shadow:0 5px 10px /a/;' +
				'}' +
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
					O : IDBrowserInfo,
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
		},
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : function(M,X)
		{
			var
			RInput = ShowByRock(IDBrowserInput),
			RURL = ShowByInput(Lang.URL),
			RGo = ShowByClass(DOM.NoSelect).text('\u2192'),
			RInfo = ShowByRock(IDBrowserInfo),
			RList = ShowByRock(IDBrowserList),

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
			Go = function()
			{
				var URL = RURL.val().trim(),T;

				GoLast && GoLast.end()

				RInfo.empty().append(ShowByText(ReplaceLang(Lang.ProcURL,URL)))
				if (T = URL.match(/^([A-Z]+)(?:\s+([^]*))?$/i))
				{
					GoTarget = ZED.toLower(T[1])
					GoDetail = T[2] || ''
					if (!ZED.has(GoTarget,SiteMap)) return GoError(Lang.UknSite,GoTarget)
					GoTarget = SiteMap[GoTarget]
				}
				else
				{
					GoTarget = ZED.find(function(V){return V[KeySite.Judge].test(URL)},SiteAll)
					GoDetail = URL
					if (!GoTarget) return GoError(Lang.UknURL,URL)
				}

				GoDetail = ZED.find(function(V)
				{
					return ZED.find(function(V)
					{
						return GoID = GoDetail.match(V)
					},V[KeySite.Judge])
				},GoTarget[KeySite.Map])

				if (GoDetail)
				{
					GoID = GoID[1]
					T = [GoTarget[KeySite.Name],GoDetail[KeySite.Name]]
					GoID && T.push(GoID)
					RInfo.append(ShowByText(T.join(' ')))

					GoInfo = Util.F
					GoPages = 1
					Jump(1)
				}
				else GoError(Lang.UknURL,URL)
			},
			Hover = function(C,I,Q)
			{
				return Q.on(DOM.click,function(){Cold.Click(I)})
					.on(DOM.mouseover,function(){C.attr(DOM.cls,ClassBrowserHover)})
					.on(DOM.mouseout,function(){C.removeAttr(DOM.cls)})
			},
			Render = function(Q,S)
			{
				var Item = Q[KeySite.Item];

				GoPages = Q[KeySite.Pages]
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
				GoInfo[InfoKeyTotal](Q[KeySite.Total])
				GoInfo[InfoKeyTotalS](MakeS(Q[KeySite.Total]))
				GoInfo[InfoKeyAt](S)
				GoInfo[InfoKeyPages](GoPages)
				GoInfo[InfoKeyPagesS](MakeS(GoPages))

				PagerUp(S,GoPages)
				PagerBotton(S,GoPages)
				RList.empty()
				Cold.Reset()
				ZED.each(function(V,D)
				{
					D = $(DOM.fieldset)
					D.append
					(
						ShowByText
						(
							V[KeySite.Index] +
							' | ' +
							SiteMap[V[KeySite.Name]][KeySite.IDView](V[KeySite.ID]),
							DOM.legend
						),
						Hover(D,V[KeySite.Unique],Cold.New(GoTarget,V)),
						V[KeySite.Img] && Hover
						(
							D,V[KeySite.Unique],
							ShowByClassX(DOM.NoSelect,DOM.img)
								.attr(DOM.src,V[KeySite.Img])
								.attr(DOM.title,V[KeySite.Title])
						),
						ShowByText(V[KeySite.Title]),
						V[KeySite.Author] && ShowByText(V[KeySite.Author]),
						MakeSiteDate(V)
					)
					RList.append(D)
				},Item)
			},
			Jump = function(S)
			{
				if (GoDetail)
				{
					S = ZED.min(ZED.max(1,S || 0),GoPages)
					MakeStatus(X,L(Lang.Loading),ClassStatusLoading)
					GoLast = GoDetail[KeySite.Page](GoID,S).start(function(Q)
					{
						GoLast = Util.F
						MakeStatus(X)
						GoInfo = GoInfo || ZED.EazyLog(InfoLog,$(DOM.div).appendTo(RInfo),Util.T)
						ZED.each(function(V)
						{
							V[KeySite.Unique] = Util.MakeUnique(V[KeySite.Name] = GoTarget[KeySite.Name],V[KeySite.ID])
						},Q[KeySite.Item])
						Render(Q,S)
					},function(E)
					{
						Util.Debug(__filename,E)
						E && MakeStatus(X,ZED.isString(E) ? E : E + (E.stack || ''),ClassStatusError)
					})
				}
			},
			T;

			MakeEnter(RURL,Go)
			RGo.on(DOM.click,Go)
			M.append
			(
				RInput.append(RURL,RGo),
				RInfo
			)
			PagerUp = ZED.Pager({Parent : M,Offset : 1},Jump)
			T = M.find('.' + DOM.Pager).children()
			M.append(RList)
			PagerBotton = ZED.Pager({Parent : M,Offset : 1},Jump)
			UShortCut.cmd(ShortCutCommand.SelAll,MakeIndex(X,Cold.SelAll))
				.cmd(ShortCutCommand.UnAll,MakeIndex(X,Cold.UnAll))
				.cmd(ShortCutCommand.PageHead,MakeIndex(X,FnClick.bind($(T[0]))))
				.cmd(ShortCutCommand.PagePrev,MakeIndex(X,FnClick.bind($(T[1]))))
				.cmd(ShortCutCommand.PageNext,MakeIndex(X,FnClick.bind($(T[T.length - 2]))))
				.cmd(ShortCutCommand.PageTail,MakeIndex(X,FnClick.bind($(ZED.last(T)))))

			return MakeScroll()
		}
	},{
		Tab : RColdCount(),
		CSS : function(ID)
		{
			return ZED.Replace
			(
				//Commit all
				'./A/{position:relative}' +
				'./A/A,./A/B{position:absolute;top:0}' +
				'./A/A{left:20%}' +
				'./A/B{left:40%}' +
				//Info block
				'#/R/ ./M/>div{margin-right:/m/px;padding:/p/px}' +
				//@ mark
				'#/R/ div>span{margin:0 4px;color:#00F;font-weight:bold}' +
				//Commit wrap
				'#/R/ ./M/>span{position:absolute;right:/p/px;top:50%;transform:translateY(-/l/px)}' +
				//Commit
				'#/R/ svg{width:/v/px;height:/v/px}',
				'/',
				{
					M : DOM.ListViewItem,

					A : ClassColdCommitAll,

					R : ID,
					m : YPadding + YListSVG + YPadding,
					v : YListSVG,
					l : YListSVG / 2,
					p : YPadding
				}
			)
		},
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : function(M,X)
		{
			var
			ToolCommit = MakeShape(Lang.Commit,ShapeConfigColdToolCommit),
			ToolRemove = MakeShape(Lang.Remove,ShapeConfigColdToolRemove),

			R = MakeSelectableList
			(
				M,X,
				Cold.Cold,Cold.Map,KeySite.Unique,
				Util.F,
				function(Q)
				{
					return $(DOM.div).append
					(
						$(DOM.div).append
						(
							MakeAt(SiteMap[Q[KeySite.Name]][KeySite.IDView](Q[KeySite.ID]),Q[KeySite.Name]),
							MakeAt(Q[KeySite.Title],Q[KeySite.Author]),
							$(DOM.div).text(MakeSiteDate(Q))
						),
						MakeToolBarClick
						(
							R,X,
							MakeShape(Lang.Commit,ShapeConfigColdListCommit),
							Lang.CommittingN,
							function(){return Cold.Commit([Q])},
							Util.T
						)
					)
				},ZED.noop,function(Q)
				{
					MakeToolBarActive(ToolCommit,Q)
					MakeToolBarActive(ToolRemove,Q)
					MakeSelecting(X,R)
				},
				ZED.noop,ZED.noop,ZED.noop
			);

			MakeToolBarActive(ToolCommit)
			MakeToolBarActive(ToolRemove)
			MakeToolBar(X,$(DOM.div).append
			(
				MakeToolBarClick(R,X,ToolCommit,Lang.CommittingN,Cold.CommitMany),
				MakeToolBarClick(R,X,ToolRemove,Lang.RemovedN,function(S)
				{
					S = Cold.Remove(S)
					R.Redraw()
					return S
				}),
				MakeToolBarClick
				(
					R,X,
					MakeShape(Lang.CommitAll,ShapeConfigColdToolCommitAll,ClassColdCommitAll).append
					(
						ZED.Shape(ShapeConfigColdToolCommitAll).attr(DOM.cls,ClassColdCommitAll + 'A'),
						ZED.Shape(ShapeConfigColdToolCommitAll).attr(DOM.cls,ClassColdCommitAll + 'B')
					),
					Lang.CommittingN,
					Cold.CommitAll,
					Util.T
				)
			))
			Bus.on(Event.Cold.Change,RColdCount)
				.on(EventQueue.Newed,function(Q)
				{
					MakeStatusX(X,Lang.CommittedN,Q.length)
					R.Redraw()
					Cold.Cold.length || UTab.Index(1 + X)
				})
				.on(EventQueue.ENew,function(E)
				{
					MakeDBError(X,Lang.Commit,E)
				})

			return R
		}
	},{
		Tab : RHotCount(),
		CSS : function(ID,W,T)
		{
			W = YStageWidthWithoutScroll - YHotControlWidth
			T = YHotTitlePercentage * W
			return ZED.Replace
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
		},
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : function(M,X)
		{
			var
			ToolPlay = MakeShape(Lang.Restart,ShapeConfigHotToolPlay),
			ToolPause = MakeShape(Lang.Pause,ShapeConfigHotToolPause),
			ToolRemove = MakeShape(Lang.Remove,ShapeConfigHotToolRemove),

			ActiveKeyID = 0,
			ActiveKeyInfo = 1 + ActiveKeyID,
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

			UpdateToolBar = function()
			{
				MakeToolBarActive(ToolPlay,CountPaused)
				MakeToolBarActive(ToolPause,CountActive)
				MakeToolBarActive(ToolRemove,R.Count())
				MakeSelSize(X,R,CountSize,CountSizePlus)
			},

			MakeSpeed = function(ID,Q,A,S)
			{
				A[ActiveKeySpeed].text
				(
					(0 <= S || (Download.Active[ID] && (S = Download.Active[ID].Speed()))) ?
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
			MakePercentage = function(Q,A)
			{
				Q[KeyQueue.Size] ?
					Q[KeyQueue.DoneSum] && 0 < Q[KeyQueue.Size] &&
						A[ActiveKeyPercentage].css(DOM.width,ZED.Format(100 * Q[KeyQueue.DoneSum] / Q[KeyQueue.Size]) + '%') :
					A[ActiveKeyPercentage].addClass(ClassHotPercentageAlways)
				A[ActiveKeyTransition] < 2 &&
					1 < ++A[ActiveKeyTransition] &&
						A[ActiveKeyPercentage].addClass(ClassHotPercentageTransition)
			},

			ClickRemove = function(ID)
			{
				MakeStatusX(X,Lang.RemovingN,1)
				Queue.Remove(ZED.objOf(ID,ID))
			},
			ClickPP = function(A,ID)
			{
				Queue.ActiveMap[ID = A[ActiveKeyID]] ?
				(
					Queue.Pause(ZED.objOf(ID,ID)),
					MakeStatusX(X,Lang.PausingN,1)
				) : (
					Queue.Play(ZED.objOf(ID,ID)),
					MakeStatusX(X,Lang.RestartingN,1)
				)
			},
			MakeAction = function(R,H,Q)
			{
				return R.on(DOM.click,function(E)
				{
					Util.StopProp(E)
					H(Q)
				})
			},

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
				function(ID)
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
					ActiveObj = [ID,Info,Speed,Remain,Percentage,0,PP,PPS];

					Active[ID] = ActiveObj
					Queue.Info(ID,function(E,Q)
					{
						if (!E)
						{
							Title.text(Q[KeyQueue.Title])
							Info.text
							(
								Q[KeyQueue.Part] ?
									Util.U === Q[KeyQueue.Size] ?
										L(Lang.GetSize) :
										MakeSizePercentage(Q[KeyQueue.Size],Q[KeyQueue.DoneSum]) :
									L(Queue.IsInfo(Q[KeyQueue.Unique]) ? Lang.GetInfo : Lang.ReadyInfo)
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
					})

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
				},function(Q)
				{
					ZED.delete_(Q,Active)
				},
				UpdateToolBar,
				function(Q)
				{
					Queue.ActiveMap[Q] ? ++CountActive : ++CountPaused
					Q = Queue.OnSizeMap[Q]
					ZED.isNull(Q) ?
						++CountSizePlus :
						(CountSize += Q)
				},
				function(Q)
				{
					Queue.ActiveMap[Q] ? --CountActive : --CountPaused
					Q = Queue.OnSizeMap[Q]
					ZED.isNull(Q) ?
						--CountSizePlus :
						(CountSize -= Q)
				},
				function()
				{
					CountActive = CountPaused =
					CountSize = CountSizePlus = 0
				}
			);

			RHotCount(Queue.Online.length)
			MakeToolBarActive(ToolPlay)
			MakeToolBarActive(ToolPause)
			MakeToolBarActive(ToolRemove)
			MakeToolBar(X,$(DOM.div).append
			(
				MakeToolBarClick(R,X,ToolPlay,Lang.RestartingN,Queue.Play),
				MakeToolBarClick(R,X,ToolPause,Lang.PausingN,Queue.Pause),
				MakeToolBarClick(R,X,ToolRemove,Lang.RemovingN,Queue.Remove)
			))

			Bus.on(EventQueue.Change,RHotCount)
			.on(EventQueue.First,function(Q)
			{
				Q &&
				(
					RHotCount(Q),
					R.Redraw()
				)
			}).on(EventQueue.Played,function(Q,S,T,F)
			{
				MakeStatusX(X,Lang.RestartedN,F = Q.length)
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
			}).on(EventQueue.PauseShow,function(Q,T)
			{
				if (T = Active[Q[KeyQueue.Unique]]) MakePercentage(Q,T)
			}).on(EventQueue.Paused,function(Q,S,T,F)
			{
				MakeStatusX(X,Lang.PausedN,F = Q.length)
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
			}).on(EventQueue.Removed,function(Q)
			{
				R.Redraw()
				MakeStatusX(X,Lang.RemovedN,Q.length)
			}).on(EventQueue.EAction,function(L,E)
			{
				MakeDBError(X,L,E)
			}).on(EventQueue.Processing,function(A)
			{
				if (A = Active[A[KeyQueue.Unique]])
				{
					A[ActiveKeySpeed].text(L(Lang.Processing))
					A[ActiveKeyRemain].text('')
					A[ActiveKeyPercentage].addClass(ClassHotPercentageActive)
				}
			}).on(EventQueue.Queuing,function(A)
			{
				if (A = Active[A[KeyQueue.Unique] || A])
				{
					A[ActiveKeySpeed].text(L(Lang.Queuing))
					A[ActiveKeyRemain].text('')
					A[ActiveKeyPercentage].removeClass(ClassHotPercentageActive)
				}
			}).on(EventQueue.Info,function(A)
			{
				if (A = Active[A[KeyQueue.Unique]])
					A[ActiveKeyInfo].text(L(Lang.GetInfo))
			}).on(EventQueue.InfoGot,function(A)
			{
				if (A = Active[A[KeyQueue.Unique]])
					A[ActiveKeyInfo].text(L(Lang.GetSize))
			}).on(EventQueue.SizeGot,function(Q,A)
			{
				if (A = Active[Q[KeyQueue.Unique]])
				{
					A[ActiveKeyInfo].text(MakeSizePercentage(Q[KeyQueue.Size],Q[KeyQueue.DoneSum] || 0))
					if (R.Selecting()[Q[KeyQueue.Unique]])
					{
						--CountSizePlus
						CountSize += Q[KeyQueue.Size]
						MakeSelSize(X,R,CountSize,CountSizePlus)
					}
				}
			}).on(EventQueue.Reinfo,function(A,S)
			{
				if (A = Active[A])
				{
					A[ActiveKeySpeed].text(L(Lang.EURL))
					A[ActiveKeyRemain].text('-' + ZED.SecondsToString(S))
					A[ActiveKeyPercentage].removeClass(ClassHotPercentageActive)
				}
			}).on(EventQueue.ReinfoLook,function(A,S)
			{
				if (A = Active[A])
					A[ActiveKeyRemain].text('-' + ZED.SecondsToString(S))
			}).on(EventQueue.RRefresh,function(A)
			{
				if (A = Active[A])
				{
					A[ActiveKeySpeed].text(L(Lang.RRefresh))
					A[ActiveKeyRemain].text('')
				}
			}).on(EventQueue.Refresh,function(A)
			{
				if (A = Active[A[KeyQueue.Unique]])
				{
					A[ActiveKeySpeed].text(L(Lang.Refreshing))
					A[ActiveKeyRemain].text('')
				}
			}).on(EventQueue.Error,function(A,S)
			{
				if (A = Active[A])
				{
					A[ActiveKeySpeed].text(L(Lang.EConn))
					A[ActiveKeyRemain].text('-' + ZED.SecondsToString(S))
					A[ActiveKeyPercentage].removeClass(ClassHotPercentageActive)
				}
			}).on(EventQueue.ErrorLook,function(A,S)
			{
				if (A = Active[A])
					A[ActiveKeyRemain].text('-' + ZED.SecondsToString(S))
			}).on(EventQueue.EFinish,function(E)
			{
				MakeDBError(X,Lang.Finish,E)
			}).on(EventQueue.FHot,R.Redraw)
			.on(EventDownload.Speed,function(S,Q,A)
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
		CSS : function(ID,W,T)
		{
			W = YStageWidthWithoutScroll - YHistoryControlWidth
			T = YHistoryTitlePercentage * W
			return ZED.Replace
			(
				//Merge
				'./E/ svg{transform:translateY(-3px)}' +
				//Panel
				'#/R/ ./I/>*{display:inline-block;vertical-align:middle}' +
				//Title
				'./H/{padding:/p/px;width:/t/px}' +
				//Date
				'#/R/ ./D/' +
				'{' +
					'display:-webkit-inline-box;' +
					'-webkit-box-orient:vertical;' +
					'-webkit-line-clamp:2;' +
					'margin:/p/px 0;' +
					'width:/d/px;' +
					'overflow:hidden;' +
					'word-break:break-all' +
				'}' +
				//Remove
				'#/R/ ./M/{margin:0 /_/px;line-height:0}',
				'/',
				{
					I : DOM.ListViewItem,

					E : ClassHistoryToolMerge,

					R : ID,
					H : ClassHistoryTitleInfo,
					t : T,
					D : ClassHistoryDate,
					d : W - T,
					M : ClassHistoryControlRemove,
					_ : YHistoryControlPadding,
					O : ClassHistoryControlMore,
					o : YHistoryControlMoreWidth,

					p : YPadding
				}
			)
		},
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : function(M,X)
		{
			var
			ToolRemove = MakeShape(Lang.Remove,ShapeConfigHistoryToolRemove),
			ToolMerge = MakeShape(Lang.Merge,ShapeConfigHistoryToolMerge).addClass(ClassHistoryToolMerge),

			CountSize = 0,

			ClickRemove = function(ID)
			{
				Queue.HRemove(ZED.objOf(ID,ID))
			},
			MakeAction = function(R,H,Q)
			{
				return R.on(DOM.click,function(E)
				{
					Util.StopProp(E)
					H(Q)
				})
			},

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
				function(ID)
				{
					var
					Title = ShowByClass(ClassSingleLine + ' ' + ClassHistoryTitle).text(DOM.nbsp),
					Info = ShowByClass(ClassSingleLine + ' ' + ClassHistoryInfo).text(DOM.nbsp),
					Date = ShowByClassX(ClassHistoryDate,DOM.span);

					Queue.HInfo(ID,function(E,Q)
					{
						if (!E)
						{
							Title.text(Q[KeyQueue.Title]),
							Info.text(ReplaceLang
							(
								Lang.HiInfo,
								ZED.FormatSize(Q[KeyQueue.Size]),Q[KeyQueue.File].length,MakeS(Q[KeyQueue.File].length)
							))
							Date.text(ZED.DateToString(DateToStringFormatDisplay,Q[KeyQueue.Finished]))
						}
					})

					return $(DOM.div).append
					(
						ShowByClass(ClassHistoryTitleInfo).append(Title,Info),
						Date,
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
				},ZED.noop,function(Q)
				{
					MakeToolBarActive(ToolRemove,Q)
					MakeToolBarActive(ToolMerge,Q)
					MakeSelSize(X,R,CountSize)
				},
				function(Q)
				{
					CountSize += Queue.OffSizeMap[Q]
				},
				function(Q)
				{
					CountSize -= Queue.OffSizeMap[Q]
				},
				function()
				{
					CountSize = 0
				}
			);

			MakeToolBarActive(ToolRemove)
			MakeToolBarActive(ToolMerge)
			MakeToolBar(X,$(DOM.div).append
			(
				MakeToolBarClick(R,X,ToolRemove,Lang.RemovingN,Queue.HRemove),
				MakeToolBarClick(R,X,ToolMerge,Util.U,MakeMerge)
			))
			Bus.on(EventQueue.First,function(Q)
			{
				Util.U === Q && R.Redraw()
			}).on(EventQueue.FHis,R.Redraw)
			.on(EventQueue.HRemoved,function(Q)
			{
				R.Redraw()
				MakeStatusX(X,Lang.RemovedN,Q.length)
			}).on(EventQueue.EHRemove,function(E)
			{
				MakeDBError(X,Lang.Remove,E)
			})

			return R
		}
	},{
		Tab : L(Lang.Component),
		CSS : function(ID)
		{
			return ZED.Replace
			(
				'#/R/ ./B/{margin-bottom:/p/px}',
				'/',
				{
					B : DOM.Button,

					R : ID,

					p : YPadding
				}
			)
		},
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : function(M,X)
		{
			var
			RSite = ShowByClass(ClassComponentSite),
			RView = ShowByClass(ClassComponentView),
			RInfo = ShowByRock(),
			RExe = ShowByClass(DOM.Button).text(L(Lang.ComLoad)),
			RCheck = ShowByClass(DOM.Button).text(L(Lang.ComCheck)),

			Target,
			Active,

			Switch = function(R,V)
			{
				Active && Active.removeAttr(DOM.cls)
				Active = R
				R.attr(DOM.cls,ClassSignInSiteActive)
				Target = V
				RInfo.empty()
			},

			LoadLast,
			Load = function()
			{
				MakeStatus(X,L(Lang.Loading),ClassStatusLoading)
				LoadLast && LoadLast.end()
				LoadLast = Target[KeySite.Component]().start(ZED.noop,function(E)
				{
					Util.Debug(__filename,E)
					MakeStatus(X,E,ClassStatusError)
				},function()
				{
					MakeStatus(X,L(Lang.ComLoaded))
				})
			},

			CheckLast,
			Check = function()
			{
				MakeStatus(X,L(Lang.Loading),ClassStatusLoading)
				CheckLast && CheckLast.end()
				CheckLast = Target[KeySite.ComCheck]().start(ZED.noop,function(E)
				{
					Util.Debug(__filename,E)
					MakeStatus(X,E,ClassStatusError)
				},function()
				{
					MakeStatus(X,L(Lang.ComLoaded))
				})
			},

			SafeMap = {},
			SafeScript = ZED.KeyGen();

			global[SafeScript] = function(Q,W)
			{
				try{SafeMap[Q](W)}catch(e){}
			}

			ZED.each(function(V,R)
			{
				if (V[KeySite.Component])
				{
					V[KeySite.Frame] && V[KeySite.Frame](function(Safe,Load,J)
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
						Refresh = function()
						{
							Frame.attr(DOM.src,URL)
						};

						SafeMap[V[KeySite.Name]] = Safe
						Frame.on(DOM.load,function()
						{
							Load(Element.contentWindow)
						})
						J && Refresh()

						RHidden.append(Frame)

						return [JSPath,Refresh]
					})
					R = $(DOM.div).text(V[KeySite.Name]).on(DOM.click,function()
					{
						Switch(R,V)
					})
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
					RInfo,
					RCheck
				)
			)

			return MakeScroll()
		}
	},{
		Tab : L(Lang.SignIn),
		CSS : function()
		{
			return ZED.Replace
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
				'./I/ ./U/{margin:/p/px 0;padding:4px 10px;font-size:1.2rem}' +
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
			)
		},
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : function(M,X)
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
			Switch = function(R,V)
			{
				Active && Active.removeAttr(DOM.cls)
				Active = R
				R.attr(DOM.cls,ClassSignInSiteActive)
				Target = V
				RefreshVCode(Util.F)
				RInfo.empty()
				RefreshCookie()
				SwitchOn = []
				ZED.each(function(V,P)
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
			RefreshVCode = function(J)
			{
				if (J || VCodeTarget !== Target)
				{
					VCodeTarget = Target
					VCodeEnd && VCodeEnd.end()
					RVCodeImg.removeAttr(DOM.src).attr(DOM.title,L(Util.F === J ? Lang.ClkLoad : Lang.Loading))
					if (Target[KeySite.VCode])
					{
						RVCode.removeAttr(DOM.style)
						if (Util.F !== J)
						{
							VCodeEnd = Target[KeySite.VCode]().start(function(Q)
							{
								if (ZED.isArrayLike(Q))
								{
									Q = ZED.Code.Base64Encode(ZED.Code.UTF8ToBinB(ZED.map(ZED.chr,Q).join('')))
									RVCodeImg.removeAttr(DOM.title).attr(DOM.src,'data:image/jpg;base64,' + Q)
								}
							},function(E)
							{
								Util.Debug(__filename,E)
								RVCodeImg.attr(DOM.title,L(Lang.VCFail))
							})
						}
					}
					else
					{
						VCodeEnd = Util.F
						RVCode.hide()
					}
				}
			},
			RefreshCookie = function()
			{
				RCookie.val(Cookie.Read(Target[KeySite.Name]))
			},

			SignInEnd,
			SignIn = function()
			{
				MakeStatus(X,L(Lang.Signing),ClassStatusLoading)
				SignInEnd && SignInEnd.end()
				SignInEnd = Target[KeySite.Login].apply
				(
					Target,
					ZED.map(ZED.invokeProp('val'),SwitchOn).concat(RVCodeInput.val())
				).start(function(Q)
				{
					MakeStatus(X,Q)
				},function(E)
				{
					Util.Debug(__filename,E)
					MakeStatus(X,L(Lang.SIError),ClassStatusError)
				})
			},

			CheckEnd,
			Check = function()
			{
				Cookie.Set(Target[KeySite.Name],RCookie.val())
				MakeStatus(X,L(Lang.Checking),ClassStatusLoading)
				CheckEnd && CheckEnd.end()
				CheckEnd = Target[KeySite.Check]().start(function(Q)
				{
					MakeStatus(X,Q ? ReplaceLang(Lang.Checked,Q) : L(Lang.NotSigned))
				},function(E)
				{
					Util.Debug(__filename,E)
					MakeStatus(X,L(Lang.CheckError),ClassStatusError)
				})
			};

			ZED.each(function(V,R)
			{
				if (V[KeySite.Login])
				{
					R = $(DOM.div).text(V[KeySite.Name])
						.on(DOM.click,function(){Switch(R,V)})
					Target || Switch(R,V)
					RSite.append(R)
				}
			},SiteAll)
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

			return MakeScroll()
		}
	},{
		Tab : L(Lang.Shortcut),
		CSS : function(ID)
		{
			return ZED.Replace
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
				'#/R/ input{padding:4px 6px 0;width:60%;cursor:text}',
				'/',
				{
					S : ClassShape,

					R : ID,
					T : ClassShortCutTitle,
					B : ClassShortCutButton,

					p : YPadding
				}
			)
		},
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : function(M)
		{
			var
			Active,
			SC = ZED.ShortCut(
			{
				Target : M,
				IgnoreInput : Util.F
			});

			ZED.Each(ShortCut.DefaultMap,function(Command,Default)
			{
				var
				R = $(DOM.div),

				List = [],

				Build = function(Q)
				{
					ZED.each(function(V)
					{
						Add(V)
						UShortCut.on(V,Command)
					},Q || Default)
				},

				Save = function()
				{
					ShortCut.Save(Command,ZED.filter(ZED.identity,ZED.map(function(V){return V[1].val()},List)))
				},

				Add = function(Q,I,L)
				{
					I = ShowByClassX(ClassUnderlineInput + ' ' + DOM.NoSelect,DOM.input)
						.attr(DOM.readonly,'')
						.val(L = ZED.isString(Q) ? Q : '')
						.on(DOM.focus,function(){Active = I})
						.on(DOM.blur,function(T)
						{
							I === Active && (Active = Util.F)
							T = I.val()
							if (L !== T)
							{
								UShortCut.off(L,Command)
								T && UShortCut.on(T,Command)
								L = T
								Save()
							}
						})
					R.append(Q = $(DOM.div).append
					(
						MakeShape(Lang.Remove,ShapeConfigShortCutRemove)
							.on(DOM.click,function()
							{
								Remove(Q)
								Save()
							}),
						I
					))
					List.push(Q = [Q,I])
				},
				Remove = function(Q,T)
				{
					T = Q[1].val()
					T && UShortCut.off(T,Command)
					Q[0].detach()
					for (T = List.length;T;) if (Q === List[--T])
					{
						List.splice(T,1)
						break
					}
				};

				Default = ZED.isArray(Default) ? Default : [Default]

				R.append
				(
					ShowByText(ZED.map(function(V)
					{
						return Lang[V] ? L(Lang[V]) : V
					},Command.split('.')).join(' | ')).addClass(ClassShortCutTitle),
					$(DOM.div).append
					(
						MakeShape(Lang.AddSC,ShapeConfigShortCutAdd).on(DOM.click,Add),
						ShowByClassX(ClassShortCutButton + ' ' + DOM.NoSelect,DOM.span).text(L(Lang.DefSC)).on(DOM.click,function(F)
						{
							for (F = List.length;F;) Remove(List[--F])
							Build()
							ShortCut.Remove(Command)
						})
					)
				)
				Build(ShortCut.Data(Command))

				M.append(R)
			})

			SC.on('*',Util.F,function()
			{
				Active && Active.val(SC.keyNames()[0])
			})

			UShortCut.cmd(ShortCutCommand.ToggleDev,ToggleDev)
				.on('ctrl+a',Util.N,Util.PrevDef,Util.T)

			return MakeScroll()
		}
	},{
		Tab : L(Lang.Setting),
		CSS : function(ID)
		{
			return ZED.Replace
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
			)
		},
		Show : MakeSelectableListShow,
		BeforeHide : MakeSelectableListHide,
		Content : function(M)
		{
			var
			Default = ZED.ReduceToObject
			(
				KeySetting.Dir,Path.join(Config.Root,'Download'),
				KeySetting.Name,'|Author|/|YYYY|/|Author|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?',
				KeySetting.Max,5,
				KeySetting.Font,'Microsoft Yahei',
				KeySetting.Size,'14',
				KeySetting.Weight,'normal',
				KeySetting.Restart,180
			),
			Data,

			KeyFont = ZED.KeyGen(),

			MakeInput = function(Q,S)
			{
				return ZED.Merge({T : 'I',E : {placeholder : Default[Q]}},S)
			},

			RefreshStyle = function(S)
			{
				S = ('' + Setting.Data(KeySetting.Size)).trim()
				return ZED.Replace
				(
					'html,input,textarea{font-family:"/F/";font-size:/S/;font-weight:/W/}',
					'/',
					{
						F : Setting.Data(KeySetting.Font),
						S : /^\d+(?:\.\d*)?$/.test(S) ? ZED.min(ZED.max(8,Number(S) || 0),30) + 'px' : S,
						W : Setting.Data(KeySetting.Weight)
					}
				)
			},
			RefreshFont = function()
			{
				ZED.CSS(KeyFont,RefreshStyle)
			},

			DirInput,
			Opening,
			OpenDir = function()
			{
				if (!Opening)
				{
					Opening = Util.T
					Dialog.showOpenDialog({properties : ['openDirectory']},function(Q)
					{
						Opening = Util.F
						Q && Q[0] && DirInput.val(Q[0]).trigger(DOM.einput)
					})
				}
			},

			T;

			Data = Setting.Data()
			Setting.Default(Default)
			T = Number(Data[KeySetting.Max])
			;(0 < T && T < 11) || (T = Default[KeySetting.Max])
			Queue.Max(Data[KeySetting.Max] = T)
			T = Number(Data[KeySetting.Restart])
			0 < T || (T = Default[KeySetting.Restart])
			Queue.Wait(Data[KeySetting.Restart] = T)
			RefreshFont()

			ZED.Preference(
			{
				Parent : M,
				Data : Data,
				Set :
				[
					[L(Lang.Directory),[MakeInput(KeySetting.Dir)],KeySetting.Dir],
					[L(Lang.FName),[MakeInput(KeySetting.Name)],KeySetting.Name],
					[L(Lang.MaxDown),ZED.range(1,11),KeySetting.Max,function()
					{
						Queue.Max(Data[KeySetting.Max])
						Queue.Dispatch()
					}],
					[L(Lang.Font),[MakeInput(KeySetting.Font)],KeySetting.Font,RefreshFont],
					[L(Lang.Size),[MakeInput(KeySetting.Size)],KeySetting.Size,RefreshFont],
					[
						L(Lang.Weight),
						['normal','lighter','bold','bolder',MakeInput(KeySetting.Weight)],
						KeySetting.Weight,
						RefreshFont
					],
					[L(Lang.RestartT),[MakeInput(KeySetting.Restart,{N : Util.T})],KeySetting.Restart,function()
					{
						Queue.Wait(Data[KeySetting.Restart] || Default[KeySetting.Restart])
					}]
				],
				Change : function(){Setting.Save(Data)}
			})
			DirInput = M.find('.' + DOM.Input).eq(0).addClass(ClassSettingDir)
			DirInput.before(MakeShape(Lang.DirSel,ShapeConfigSettingDir,ClassSettingDirOpen,DOM.div).on(DOM.click,OpenDir))

			return MakeScroll()
		}
	})

	//ShadowBar
	RNavi.find('.' + DOM.Tab).append(ShowByClass(ClassShadowBar))
	//Close Cover
	RNavi.on(DOM.click,'.' + DOM.Tab,function()
	{
		MakeDetailClose()
		MakeMergeClose()
	})
	//Detail
	RDetail.append(RDetailHead,RDetailInfo,RDetailPart)
	Bus
		//Queue
		.on(EventQueue.Info,MakeDetailMake(function()
		{
			RDetailInfo.text(L(Lang.GetInfo))
		}))
		.on(EventQueue.InfoGot,MakeDetailMake(MakeDetailSetupInfo))
		.on(EventQueue.SizeGot,MakeDetailMake(function(Q)
		{
			MakeDetailInfoTTS.text(ZED.FormatSize(Q[KeyQueue.Size]))
		}))
		.on(EventQueue.Finish,MakeDetailMake(MakeDetailRefresh))
		//Download
		.on(EventDownload.Size,MakeDetailMake(function(Q,S,F)
		{
			MakeDetailURL[F].text(MakeSizePercentage(S,0))
		}))
		.on(EventDownload.Dir,MakeDetailMake(function(Q)
		{
			MakeDetailInfoDir.text(Q[KeyQueue.Dir])
		}))
		.on(EventDownload.Speed,function(S,Q)
		{
			MakeDetailActive === Q[KeyQueue.Unique] && MakeDetailRefresh(Q)
		})
	//Merge
	RMerge.append(RMergeProgress,RMergeText)
	//StatusBar Icon
	ZED.each(function(V){RStatusIcon.append(ShowByRock(IDStatusIcon + ZED.chr(65 + V)))},ZED.range(0,5))
	//Speed
	Bus.on(EventDownload.SpeedTotal,function(Q)
	{
		RSpeed.text(ZED.FormatSize(Q) + '/s')
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
				ShowByRock(IDStatusBarRight).append
				(
					RSpeed
				)
			)
		),
		RHidden
	)

	$(function()
	{
		Rainbow.appendTo('body')
		Queue.Dispatch()
	})
}()