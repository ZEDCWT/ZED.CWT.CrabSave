~function()
{
	'use strict'
	var
	ZED = require('@zed.cwt/zedquery'),

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
	Download = require('./Download'),
	Cookie = require('./Cookie'),
	Setting = require('./Setting'),

	$ = ZED.jQuery,
	FnClick = $.fn.click,



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
	MakeEnter = function(Q,S)
	{
		ZED.ShortCut(
		{
			Target : Q,
			IgnoreInput : Util.F
		}).on('enter',S)
	},
	MakeShape = function(S,Q,C)
	{
		return ShowByClassX(ClassShape + (C ? ' ' + C : ''),DOM.span).attr(DOM.title,L(S)).append(ZED.Shape(Q))
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
	ShowByTextS = function(Q,S)
	{
		S.append($(DOM.div).text(Q))
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
	MakeSizeJust = function(Q)
	{
		return (Q = Q[KeyQueue.Size]) ? ZED.FormatSize(Q) : L(Lang.SizeUn)
	},
	MakeSizePercentage = function(S,D)
	{
		return ZED.isNull(S) ?
			L(Lang.Calculating) :
			S ?
				S === D ?
					L(Lang.Completed) :
					ReplaceLang(Lang.SizeP,ZED.FormatSize(D),ZED.FormatSize(S),ZED.Format(100 * D / S)) :
				ReplaceLang(Lang.SizeNP,ZED.FormatSize(D))
	},



	//Config
	//	Misc
	YTabCount = 6,
	//	Global
	YPadding = 10,
	YPaddingHalf = 5,
	YScrollWidth = 20,
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

	//ID & Class
	//	Global
	IDRainbow = ZED.KeyGen(),
	IDToolBar = ZED.KeyGen(),
	IDToolBarIcon = ZED.KeyGen(),
	IDToolBarItem = ZED.KeyGen(),
	ClassToolBarDisabled = ZED.KeyGen(),
	IDNaviStage = ZED.KeyGen(),
	IDNavi = ZED.KeyGen(),
	ClassCount = ZED.KeyGen(),
	IDStage = ZED.KeyGen(),
	ClassListSelected = ZED.KeyGen(),
	IDDetail = ZED.KeyGen(),
	IDDetailHead = ZED.KeyGen(),
	IDDetailInfo = ZED.KeyGen(),
	ClassDetailLabel = ZED.KeyGen(),
	IDDetailPart = ZED.KeyGen(),
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
	ClassHotPercentageActive = ZED.KeyGen(),
	ClassHotPercentageAlways = ZED.KeyGen(),
	ClassHotSizeUnknown = ZED.KeyGen(),
	//	History
	ClassHistoryTitleInfo = ZED.KeyGen(),
	ClassHistoryTitle = ClassHotTitle,
	ClassHistoryInfo = ClassHotInfo,
	ClassHistoryDate = ZED.KeyGen(),
	ClassHistoryControlRemove = ClassHotControlRemove,
	ClassHistoryControlMore = ClassHotControlMore,
	//	Sign index
	IDSignInSite = ZED.KeyGen(),
	ClassSignInSiteActive = ZED.KeyGen(),
	IDSignInInput = ZED.KeyGen(),
	IDSignInInputVCode = ZED.KeyGen(),

	//Element
	Rainbow = ShowByRock(IDRainbow),
	RToolBar = ShowByRock(IDToolBar),
	RToolBarIcon = ShowByRock(IDToolBarIcon),
	RToolBarItem = ShowByRock(IDToolBarItem),
	RNavi = ShowByRock(IDNavi),
	RStage = ShowByRock(IDStage).attr(DOM.cls,ClassScrollable),
	RDetail = ShowByRock(IDDetail),
	RDetailHead = ShowByRock(IDDetailHead),
	RDetailInfo = ShowByRock(IDDetailInfo),
	RDetailPart = ShowByRock(IDDetailPart),
	RDetailChildren = $(ZED.flatten([RDetailHead,RDetailInfo,RDetailPart])),
	RStatusBar = ShowByRock(IDStatusBar),
	RStatus = ShowByRock(IDStatus),
	RStatusIcon = ShowByRock(IDStatusIcon)
		.on(DOM.aniend,function(){RStatusIcon.removeClass(ClassStatusIconAnimation)}),
	RStatusText = ShowByClass(ClassSingleLine),
	RSpeed = ShowByRock(IDSpeed),



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
	ShapeConfigHistoryListRemove = ShapeConfigHotListRemove,
	ShapeConfigHistoryListMore = ShapeConfigHotListMore,

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
	MakeToolBarClick = function(R,X,Q,L,H)
	{
		return Q.on(DOM.click,function(T,C)
		{
			Util.StopProp(T)
			T = R.Count()
			C = H(T)
			Util.T === C ?
				R.Redraw() :
				0 < C ?
					(T = C,R.Redraw()) :
					T = -C
			0 < T && MakeStatus(X,ReplaceLang(L,T,MakeS(T)))
		})
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
		Make,Destroy,
		SelectChange,
		OnSelect,OnUnselect,OnClear
	)
	{
		var
		LastScroll = 0,

		LastIndex = 0,
		LastID,
		Selecting = {},
		Count = 0,
		Active = {},

		Clear = function()
		{
			ZED.Each(Selecting,function(F,V)
			{
				V &&
				(
					F = Active[F],
					F && F.removeClass(ClassListSelected)
				)
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
			MakeStatus(Index,Count ? ReplaceLang(Lang.SelectingN,Count,MakeS(Count)) : '')
		},
		ClearChange = ZED.pipe(Clear,Change),
		List = ZED.ListView(
		{
			Scroll : Scroll,
			Data : Data,
			Make : function(Q,X)
			{
				var
				ID = Q[Key],
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
							T = Data[F][Key]
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
				Active[V[Key]] = Util.F
				Destroy(V,Q)
			}
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
		UShortCut.on('esc',MakeIndex(Index,ClearChange))
			.on('ctrl+a',MakeIndex(Index,function()
			{
				ZED.each(function(V,ID)
				{
					ID = V[Key]
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
	MakeSelectableListShow = ZED.flip(ZED.invokeProp('Show')),
	MakeSelectableListHide = ZED.flip(ZED.invokeProp('Hide')),

	MakeDetailActive,
	MakeDetailAt,
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
	MakeDetailProgress = function()
	{
		return MakeDetailActive[KeyQueue.Finished] ?
			ReplaceLang(Lang.FinishedAt,ZED.DateToString(DateToStringFormatDisplay,MakeDetailActive[KeyQueue.Finished])) :
			MakeDetailActive[KeyQueue.Done] ?
				0 < MakeDetailActive[KeyQueue.Size] ?
					ZED.Format(100 * ZED.sum(MakeDetailActive[KeyQueue.Done]) / MakeDetailActive[KeyQueue.Size]) + '%' :
					L(Lang.Unfinished) :
				'0%'
	},
	MakeDetailSize = function()
	{
		return MakeDetailActive[KeyQueue.Size] < 0 ?
			L(Lang.Calculating) :
			MakeDetailActive[KeyQueue.Size] ?
				ZED.FormatSize(MakeDetailActive[KeyQueue.Size]) :
				L(Lang.SizeUn)
	},
	MakeDetailSetupURL = ZED.each(function(Q)
	{
		var I = MakeDetailURL.length,R;

		RDetailPart.append($(DOM.div).append
		(
			ShowByClass(ClassSingleLine).attr(DOM.title,Q).text(Q),
			R = ShowByText
			(
				MakeDetailActive[KeyQueue.Sizes] ?
					MakeSizePercentage(MakeDetailActive[KeyQueue.Sizes][I],MakeDetailActive[KeyQueue.Done][I]) :
					L(Lang.GetSize),
				DOM.span
			)
		))
		MakeDetailURL.push(R)
	}),
	MakeDetailSetup = function()
	{
		var
		Part = MakeDetailActive[KeyQueue.Part];

		RDetailInfo.empty().append
		(
			MakeDetailSetupSingle(Lang.Created,ZED.DateToString(DateToStringFormatDisplay,MakeDetailActive[KeyQueue.Created])),
			MakeDetailSetupSingle(Lang.Progress,MakeDetailInfoProgress = ShowByText(MakeDetailProgress(),DOM.span)),
			MakeDetailSetupSingle(Lang.Author,MakeDetailActive[KeyQueue.Author]),
			MakeDetailSetupSingle(Lang.UpDate,ZED.DateToString(DateToStringFormatFile,MakeDetailActive[KeyQueue.Date])),
			MakeDetailSetupSingle(Lang.Parts,Part.length),
			MakeDetailSetupSingle(Lang.Files,MakeDetailActive[KeyQueue.File]),
			MakeDetailSetupSingle(Lang.Directory,MakeDetailInfoDir = ShowByText(MakeDetailActive[KeyQueue.Dir] || L(Lang.NoDir),DOM.span)),
			MakeDetailSetupSingle(Lang.TTS,MakeDetailInfoTTS = ShowByText(MakeDetailSize(),DOM.span)),
			MakeDetailSetupSingle
			(
				Lang.Downloaded,
				MakeDetailInfoDownloaded = ShowByText(Util.CalcSize(MakeDetailActive[KeyQueue.Done]),DOM.span)
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
			MakeDetailSetupURL(V[KeyQueue.URL])
		})
		else MakeDetailSetupURL(Part[0][KeyQueue.URL])
	},
	MakeDetailRefresh = function()
	{
		var
		Size = MakeDetailActive[KeyQueue.Sizes],
		Done = MakeDetailActive[KeyQueue.Done];

		MakeDetailInfoProgress && MakeDetailInfoProgress.text(MakeDetailProgress())
		Done && MakeDetailInfoDownloaded.text(Util.CalcSize(Done))
		Size && ZED.Each(MakeDetailURL,function(F,V){V.text(MakeSizePercentage(Size[F],Done[F]))})
	},
	MakeDetail = function(Q)
	{
		if (MakeDetailActive) RDetailChildren.empty()
		else RStage.append(RDetail)
		MakeDetailActive = Q
		MakeDetailAt = UTab.Index()
		MakeToolBarLast && MakeToolBarLast.detach()

		RDetailHead.append
		(
			ShowByText(Q[KeyQueue.Title]),
			ShowByText(Q[KeyQueue.Name] + ' ' + SiteMap[Q[KeyQueue.Name]][KeySite.IDView](Q[KeyQueue.ID]))
		)
		if (Q[KeyQueue.Part]) MakeDetailSetup()
		else RDetailInfo.text(L(Queue.IsInfo(Q[KeyQueue.Unique]) ? Lang.GetInfo : Lang.ReadyInfo))
	},
	MakeDetailClose = function()
	{
		if (MakeDetailActive)
		{
			RDetailChildren.empty()
			RDetail.detach()
			MakeDetailAt === UTab.Index() && MakeToolBarChange()
			MakeDetailActive =
			MakeDetailInfoDir =
			MakeDetailInfoTTS =
			MakeDetailInfoDownloaded = Util.F
		}
	},
	MakeDetailMake = function(H)
	{
		return function(Q)
		{
			MakeDetailActive === Q && H()
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
			RStatusText.text(Q)
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



	UShortCut = ZED.ShortCut(),
	MakeIndex = ZED.curry(function(X,Q)
	{
		!MakeDetailActive && X === UTab.Index() && Q()
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
			'#/N/{width:/n/px;background:#F3F3F3!important;font-size:1.15rem;font-weight:bold;overflow:hidden;z-index:200200}' +
			//		Tab
			'#/N/ ./I/{position:relative;margin:/b/px 0;padding:18px 0 18px 18px;}' +
			'#/N/ ./I/,#/N/ ./I/ ./B/{transition:all .2s linear}' +
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
			//		Detail
			'#/DT/{position:absolute;left:0;top:0;width:100%;height:100%;background:inherit;text-align:center}' +
			'#/DT/>div{text-align:left}' +
			//			Info
			'#/DI/{display:inline-block;padding:/p/px}' +
			//			Head
			'#/DH/{padding:/p/px;background:#F3EBFA}' +
			//			Label
			'./DL/{font-weight:bold;opacity:.7}' +
			//			Part
			'#/DP/{padding-left:/p/px}' +
			'#/DP/>div{padding-bottom:/p/px}' +
			//			URL
			'#/DP/ ./SL/{padding-left:/p/px;color:blue}' +
			//			URL status
			'#/DP/ div>span{padding-left:/p/px}' +

			//StatusBar
			'#/S/{padding:0 /p/px;height:/s/px}' +
			//	Wrapper
			'#/L/,#/H/{display:inline-block}' +
			'#/L/ div,#/H/ div{display:inline-block;vertical-align:middle}' +
			'#/L/{width:100%}' +
			'#/H/{float:right}' +
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
			'./B/{position:absolute;z-index:200400;pointer-events:none}' +
			//	ToolBar
			'#/T/ ./B/{left:0;bottom:-/b/px;width:100%;height:/b/px;box-shadow:inset 0 /b/px /b/px -/b/px /a/}' +
			//	Navi
			'#/N/ ./B/{right:0;top:0;width:/b/px;height:100%;box-shadow:inset -/b/px 0 /b/px -/b/px /a/;z-index:200000}' +
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
			'./SL/{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
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
				J : ClassStatusLoading,
				j : ReKeyGen(),
				K : ClassStatusError,
				k : ReKeyGen(),
				e : ZED.CSSKeyframe(ReKeyGen(Util.T),{to : {transform : 'rotate(360deg)'}}) +
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
			RURL = ShowByInput(Lang.URL).val('bili space 287301'),//DEBUG
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
			Go = function()
			{
				var URL = RURL.val().trim(),T;

				GoLast && GoLast.end()

				ShowByTextS(ReplaceLang(Lang.ProcURL,URL),RInfo.empty())
				if (T = URL.match(/^([0-9A-Z]+)[^0-9A-Z]\s*([^]+?)\s*$/i))
				{
					GoTarget = ZED.toLower(T[1])
					GoDetail = T[2]
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

				if (!GoDetail) return GoError(Lang.UknURL,URL)
				GoID = GoID[1]
				ShowByTextS([GoTarget[KeySite.Name],GoDetail[KeySite.Name],GoID].join(' '),RInfo)

				GoInfo = Util.F
				Jump(1)
			},
			Hover = function(C,I,Q)
			{
				return Q.on(DOM.click,function(){Cold.Click(I)})
					.on(DOM.mouseover,function(){C.attr(DOM.cls,ClassBrowserHover)})
					.on(DOM.mouseout,function(){C.removeAttr(DOM.cls)})
			},
			Render = function(Q,S)
			{
				var
				Pages = Q[KeySite.Pages],
				Item = Q[KeySite.Item];

				if (Item.length)
				{
					GoInfo[InfoKeyFrom](Item[0][KeySite.Index])
					GoInfo[InfoKeyTo](ZED.last(Item)[KeySite.Index])
				}
				else
				{
					GoInfo[InfoKeyFrom](NaN)
					GoInfo[InfoKeyTo](NaN)
				}
				GoInfo[InfoKeyCount](Item.length)
				GoInfo[InfoKeyTotal](Q[KeySite.Total])
				GoInfo[InfoKeyTotalS](MakeS(Q[KeySite.Total]))
				GoInfo[InfoKeyAt](S)
				GoInfo[InfoKeyPages](Pages)
				GoInfo[InfoKeyPagesS](MakeS(Pages))

				PagerUp(S,Pages)
				PagerBotton(S,Pages)
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
						V[KeySite.Title] + DOM.br,
						V[KeySite.Author] && V[KeySite.Author] + DOM.br,
						ZED.DateToString(DateToStringFormatFile,V[KeySite.Date])
					)
					RList.append(D)
				},Item)
			},
			Jump = function(S)
			{
				if (GoDetail)
				{
					S = ZED.max(1,S)
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
				function(Q)
				{
					return $(DOM.div).append
					(
						$(DOM.div).append
						(
							MakeAt(SiteMap[Q[KeySite.Name]][KeySite.IDView](Q[KeySite.ID]),Q[KeySite.Name]),
							MakeAt(Q[KeySite.Title],Q[KeySite.Author]),
							$(DOM.div).text(ZED.DateToString(DateToStringFormatFile,Q[KeySite.Date]))
						),
						MakeToolBarClick
						(
							R,X,
							MakeShape(Lang.Commit,ShapeConfigColdListCommit),
							Lang.CommittedN,
							function()
							{
								Cold.Commit(ZED.objOf(Q[KeySite.Unique],Q))
								return 1
							}
						)
					)
				},ZED.noop,function(Q)
				{
					MakeToolBarActive(ToolCommit,Q)
					MakeToolBarActive(ToolRemove,Q)
				},
				ZED.noop,ZED.noop,ZED.noop
			);

			MakeToolBarActive(ToolCommit)
			MakeToolBarActive(ToolRemove)
			MakeToolBar(X,$(DOM.div).append
			(
				MakeToolBarClick(R,X,ToolCommit,Lang.CommittedN,function(Q)
				{
					return Q && Cold.Commit(R.Selecting())
				}),
				MakeToolBarClick(R,X,ToolRemove,Lang.RemovedN,function(Q)
				{
					return Q && Cold.Remove(R.Selecting())
				}),
				MakeToolBarClick
				(
					R,X,
					MakeShape(Lang.CommitAll,ShapeConfigColdToolCommitAll,ClassColdCommitAll).append
					(
						ZED.Shape(ShapeConfigColdToolCommitAll).attr(DOM.cls,ClassColdCommitAll + 'A'),
						ZED.Shape(ShapeConfigColdToolCommitAll).attr(DOM.cls,ClassColdCommitAll + 'B')
					),
					Lang.CommittedN,
					function(Q)
					{
						Q = Cold.CommitAll()
						Q && UTab.Index(1 + X)
						return Q
					}
				)
			))
			Bus.on(Event.Cold.Change,RColdCount)

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
				'./G/{position:absolute;left:0;bottom:0;height:3px;width:0;background:#979797;transition:width .2s linear}' +
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

			ActiveKeyTarget = 0,
			ActiveKeyAction = 1 + ActiveKeyTarget,
			ActiveKeyInfo = 1 + ActiveKeyAction,
			ActiveKeySpeed = 1 + ActiveKeyInfo,
			ActiveKeyRemain = 1 + ActiveKeySpeed,
			ActiveKeyPercentage = 1 + ActiveKeyRemain,
			ActiveKeyPP = 1 + ActiveKeyPercentage,
			ActiveKeyPPS = 1 + ActiveKeyPP,
			Active = {},
			CountActive = 0,
			CountPaused = 0,

			UpdateToolBar = function()
			{
				MakeToolBarActive(ToolPlay,CountPaused)
				MakeToolBarActive(ToolPause,CountActive)
				MakeToolBarActive(ToolRemove,R.Count())
			},

			MakeSpeedStatus = function(A,S)
			{
				var
				Q = A[ActiveKeyTarget],
				ID = Q[KeyQueue.Unique],
				D;

				A[ActiveKeyInfo].text
				(
					Q[KeyQueue.Part] ?
						Q[KeyQueue.Size] < 0 ?
							L(Lang.GetSize) :
							Q[KeyQueue.Done] && (D = ZED.sum(Q[KeyQueue.Done])) ?
								MakeSizePercentage(Q[KeyQueue.Size],D) :
								MakeSizeJust(Q) :
						L(Queue.IsInfo(Q[KeyQueue.Unique]) ? Lang.GetInfo : Lang.ReadyInfo)
				)
				A[ActiveKeySpeed].text
				(
					Queue.IsRunning(Q) ?
						(0 <= S || (Download.Active[ID] && (S = Download.Active[ID].Speed()))) ?
							ZED.FormatSize(S) + '/s' :
							L(Lang.Processing) :
						L(Q[KeyQueue.Active] ? Lang.Queuing : Lang.Paused)
				)
				A[ActiveKeyRemain].text
				(
					0 <= S && Q[KeyQueue.Size] ?
						'-' + ZED.SecondsToString(Q[KeyQueue.Size] / S) :
						''
				)
				Download.Active[ID] ?
					A[ActiveKeyPercentage].addClass(ClassHotPercentageActive) :
					A[ActiveKeyPercentage].removeClass(ClassHotPercentageActive)
				Q[KeyQueue.Size] ?
					0 <= D && 0 < Q[KeyQueue.Size] &&
						A[ActiveKeyPercentage].css(DOM.width,ZED.Format(100 * D / Q[KeyQueue.Size]) + '%') :
					A[ActiveKeyPercentage].addClass(ClassHotPercentageAlways)

			},
			SetPlay = function(Q)
			{
				Q[ActiveKeyPP].attr(DOM.title,L(Lang.Restart))
				ZED.Shape(ShapeConfigHotListPlay,{Target : Q[ActiveKeyPPS]})
				MakeSpeedStatus(Q)
			},
			SetPause = function(Q)
			{
				Q[ActiveKeyPP].attr(DOM.title,L(Lang.Pause))
				ZED.Shape(ShapeConfigHotListPause,{Target : Q[ActiveKeyPPS]})
				MakeSpeedStatus(Q)
			},

			ClickRemove = function(Q)
			{
				Queue.Remove(Q)
				R.Redraw()
			},
			ClickPP = function(Q)
			{
				Q[ActiveKeyTarget][KeyQueue.Active] ?
				(
					Queue.Pause(Q[ActiveKeyAction]) && R.Selecting()[Q[ActiveKeyTarget][KeyQueue.Unique]] &&
					(
						--CountActive,
						++CountPaused
					),
					SetPlay(Q)
				) : (
					Queue.Play(Q[ActiveKeyAction]) && R.Selecting()[Q[ActiveKeyTarget][KeyQueue.Unique]] &&
					(
						--CountPaused,
						++CountActive
					),
					SetPause(Q)
				)
				UpdateToolBar()
			},
			MakeAction = function(R,H,Q)
			{
				return R.on(DOM.click,function(E)
				{
					H(Q)
					Util.StopProp(E)
				})
			},

			R = MakeSelectableList
			(
				M,X,
				Queue.Online,Queue.OnlineMap,KeyQueue.Unique,
				function(Q)
				{
					var
					ID = Q[KeyQueue.Unique],

					Title = ShowByClass(ClassSingleLine + ' ' + ClassHotTitle).text(Q[KeyQueue.Title]),
					Info = ShowByClass(ClassSingleLine + ' ' + ClassHotInfo),
					Speed = ShowByClass(ClassSingleLine),
					Remain = ShowByClass(ClassSingleLine),
					Percentage = ShowByClass(ClassHotPercentage),
					PP = Q[KeyQueue.Active] ?
						MakeShape(Lang.Pause,ShapeConfigHotListPause,ClassHotControlPP) :
						MakeShape(Lang.Restart,ShapeConfigHotListPlay,ClassHotControlPP),
					PPS = PP.children(),
					ActionObj = ZED.objOf(ID,Q),
					ActiveObj = [Q,ActionObj,Info,Speed,Remain,Percentage,PP,PPS];

					Active[ID] = ActiveObj
					MakeSpeedStatus(ActiveObj)

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
									ClickRemove,ActionObj
								),
								DOM.br,
								MakeAction(PP,ClickPP,ActiveObj)
							),
							MakeAction
							(
								MakeShape(Lang.More,ShapeConfigHotListMore,ClassHotControlMore),
								MakeDetail,Q
							)
						),
						Percentage
					)
				},function(Q)
				{
					ZED.delete_(Q[KeyQueue.Unique],Active)
				},
				UpdateToolBar,
				function(Q)
				{
					Q[KeyQueue.Active] ? ++CountActive : ++CountPaused
				},
				function(Q)
				{
					Q[KeyQueue.Active] || !Queue.IsRunning(Q) ? --CountActive : --CountPaused
				},
				function()
				{
					CountActive = CountPaused = 0
				}
			),

			MakeActive = function(H)
			{
				return function(Q)
				{
					(Q = Active[Q]) && H(Q)
				}
			},
			UpdateSpeedStatus = function(Q)
			{
				(Q = Active[Q[KeyQueue.Unique]]) && MakeSpeedStatus(Q)
			};

			RHotCount(Queue.Online.length)
			MakeToolBarActive(ToolPlay)
			MakeToolBarActive(ToolPause)
			MakeToolBarActive(ToolRemove)
			MakeToolBar(X,$(DOM.div).append
			(
				MakeToolBarClick(R,X,ToolPlay,Lang.RestartedN,function(Q)
				{
					Q = Q && Queue.Play(R.Selecting())
					ZED.EachKey(R.Selecting(),MakeActive(SetPause))
					CountActive += Q
					CountPaused -= Q
					UpdateToolBar()
					return -Q
				}),
				MakeToolBarClick(R,X,ToolPause,Lang.PausedN,function(Q)
				{
					Q = Q && Queue.Pause(R.Selecting())
					ZED.EachKey(R.Selecting(),MakeActive(SetPlay))
					CountActive -= Q
					CountPaused += Q
					UpdateToolBar()
					return -Q
				}),
				MakeToolBarClick(R,X,ToolRemove,Lang.RemovedN,function(Q)
				{
					return Q && Queue.Remove(R.Selecting())
				})
			))
			Bus.on(EventQueue.Change,RHotCount)
				.on(EventQueue.FakeRun,UpdateSpeedStatus)
				.on(EventQueue.Play,UpdateSpeedStatus)
				.on(EventQueue.Pause,UpdateSpeedStatus)
				.on(EventQueue.Info,UpdateSpeedStatus)
				.on(EventQueue.InfoGot,UpdateSpeedStatus)
				.on(EventQueue.SizeGot,UpdateSpeedStatus)
				.on(EventQueue.Finish,R.Redraw)
				.on(EventDownload.Speed,function(S,Q)
				{
					(Q = Active[Q]) && MakeSpeedStatus(Q,S)
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

			ClickRemove = function(Q)
			{
				Queue.Bye(Q)
				R.Redraw()
			},
			MakeAction = function(R,H,Q)
			{
				return R.on(DOM.click,function(E)
				{
					H(Q)
					Util.StopProp(E)
				})
			},

			R = MakeSelectableList
			(
				M,X,
				Queue.Offline,Queue.OfflineMap,KeyQueue.IDHis,
				function(Q)
				{
					return $(DOM.div).append
					(
						ShowByClass(ClassHistoryTitleInfo).append
						(
							ShowByClass(ClassSingleLine + ' ' + ClassHistoryTitle).text(Q[KeyQueue.Title]),
							ShowByClass(ClassSingleLine + ' ' + ClassHistoryInfo).text(ReplaceLang
							(
								Lang.HiInfo,
								ZED.FormatSize(Q[KeyQueue.Size]),Q[KeyQueue.File],MakeS(Q[KeyQueue.File])
							))
						),
						ShowByClassX(ClassHistoryDate,DOM.span).text(ZED.DateToString(DateToStringFormatDisplay,Q[KeyQueue.Finished])),
						MakeAction
						(
							MakeShape(Lang.Remove,ShapeConfigHistoryListRemove,ClassHistoryControlRemove),
							ClickRemove,ZED.objOf(Q[KeyQueue.IDHis],Q)
						),
						MakeAction
						(
							MakeShape(Lang.More,ShapeConfigHistoryListMore,ClassHistoryControlMore),
							MakeDetail,Q
						)
					)
				},ZED.noop,function(Q)
				{
					MakeToolBarActive(ToolRemove,Q)
				},
				ZED.noop,ZED.noop,ZED.noop
			);

			MakeToolBarActive(ToolRemove)
			MakeToolBar(X,$(DOM.div).append
			(
				MakeToolBarClick(R,X,ToolRemove,Lang.RemovedN,function(Q)
				{
					return Q && Queue.Bye(R.Selecting())
				})
			))
			Bus.on(EventQueue.Finish,R.Redraw)

			return R
		}
	},{
		Tab : L(Lang.SignIn),
		CSS : function()
		{
			return ZED.Replace
			(
				'#/S/,#/I/{display:inline-block;vertical-align:top}' +
				//Site
				'#/S/{width:/s/px}' +
				'#/S/>div{margin:/p/px 0;padding:/p/px;cursor:pointer}' +
				'#/S/>div:hover,./A/{color:#2672EC}' +
				'#/S/>div:hover{opacity:.5}' +
				'#/S/>div./A/{opacity:1}' +
				//Input
				'#/I/{padding:/p/px;width:/i/px}' +
				'#/I/ ./U/{margin:/p/px 0;padding:4px 10px;font-size:1.2rem}' +
				//	Button
				'#/I/ ./B/{text-align:center}' +
				//	VCode
				'#/V/>*{vertical-align:bottom}' +
				'#/V/ ./U/{width:50%}' +
				'#/V/ img{padding:/p/px;max-width:50%;max-height:100%;cursor:pointer}' +
				//	Cookie
				'#/I/ textarea{max-width:100%;font-size:.9rem!important}',
				'/',
				{
					B : DOM.Button,

					U : ClassUnderlineInput,

					S : IDSignInSite,
					s : YSignInSiteWidth,
					A : ClassSignInSiteActive,
					I : IDSignInInput,
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
			RSite = ShowByRock(IDSignInSite),
			RInput = ShowByRock(IDSignInInput),
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
				RefreshCookie()
				RInfo.empty()
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
					RVCodeImg.removeAttr(DOM.src).attr(DOM.title,L(Lang.Loading))
					if (Target[KeySite.VCode])
					{
						RVCode.show()
						VCodeEnd = Target[KeySite.VCode]().start(function(Q)
						{
							if (ZED.isArrayLike(Q))
							{
								Q = ZED.Code.Base64Encode(ZED.Code.UTF8ToBinB(ZED.map(ZED.chr,Q).join('')))
								RVCodeImg.attr(DOM.src,'data:image/jpg;base64,' + Q)
							}
						},function()
						{
							RVCodeImg.attr(DOM.title,L(Lang.VCFail))
						})
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
				},function()
				{
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
					MakeStatus(X,Q ? ReplaceLang(Lang.Checked,Q) : L(Lang.CheckFail))
				},function()
				{
					MakeStatus(X,L(Lang.CheckError),ClassStatusError)
				})
			};

			ZED.each(function(V,R)
			{
				R = $(DOM.div).text(V[KeySite.Name]).on(DOM.click,function()
				{
					Switch(R,V)
					RefreshVCode()
				})
				Target || Switch(R,V)
				RSite.append(R)
			},SiteAll)
			RVCodeImg.on(DOM.click,RefreshVCode)
			MakeEnter(RVCodeInput,SignIn)
			RExe.on(DOM.click,SignIn)
			RCheck.on(DOM.click,Check)
			M.append
			(
				RSite,
				RInput.append
				(
					RInfo,
					RVCode.append(RVCodeInput,RVCodeImg),
					RExe,
					RCookie,
					RCheck
				)
			)

			Bus.on(Event.Cookie.Change,RefreshCookie)

			return MakeScroll(RefreshVCode)
		}
	},{
		Tab : L(Lang.Setting),
		CSS : function(ID)
		{
			return ZED.Replace
			(
				'#/R/{padding:/p/px}' +
				'#/R/ ./I/{width:100%}',
				'/',
				{
					I : DOM.Input,

					R : ID,

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
				KeySetting.Dir,Config.Root,
				KeySetting.Name,'|Author|/|YYYY|/|Author|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?',
				KeySetting.Max,5,
				KeySetting.Font,'Microsoft Yahei',
				KeySetting.Size,'14',
				KeySetting.Weight,'normal'
			),
			Data,

			KeyFont = ZED.KeyGen(),

			MakeInput = function(Q)
			{
				return {T : 'I',E : {placeholder : Default[Q]}}
			},

			RefreshFont = function()
			{
				ZED.CSS(KeyFont,function(S)
				{
					S = Setting.Data(KeySetting.Size)
					return ZED.Replace
					(
						'html,input,textarea{font-family:"/F/";font-size:/S/;font-weight:/W/}',
						'/',
						{
							F : Setting.Data(KeySetting.Font),
							S : /\D/.test(S) ? S : S + 'px',
							W : Setting.Data(KeySetting.Weight)
						}
					)
				})
			},

			T;

			Data = Setting.Data()
			Setting.Default(Default)
			T = Number(Data[KeySetting.Max])
			;(0 < T && T < 11) || (T = Default[KeySetting.Max])
			Queue.Max(Data[KeySetting.Max] = T)
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
				],
				Change : function(){Setting.Save(Data)}
			})

			return MakeScroll()
		}
	})

	//ShadowBar
	RNavi.find('.' + DOM.Tab).append(ShowByClass(ClassShadowBar))
	//Detail
	RNavi.on(DOM.click,'.' + DOM.Tab,MakeDetailClose)
	RDetail.append(RDetailHead,RDetailInfo,RDetailPart)
	Bus
		//Queue
		.on(EventQueue.Info,MakeDetailMake(function()
		{
			RDetailInfo.text(L(Lang.GetInfo))
		}))
		.on(EventQueue.InfoGot,MakeDetailMake(MakeDetailSetup))
		.on(EventQueue.SizeGot,MakeDetailMake(function()
		{
			MakeDetailInfoTTS.text(ZED.FormatSize(MakeDetailActive[KeyQueue.Size]))
		}))
		.on(EventQueue.Finish,MakeDetailMake(MakeDetailRefresh))
		//Download
		.on(EventDownload.Size,function(Q,S,F)
		{
			MakeDetailActive === Q && MakeDetailURL[F].text(MakeSizePercentage(S,0))
		})
		.on(EventDownload.Dir,MakeDetailMake(function()
		{
			MakeDetailInfoDir.text(MakeDetailActive[KeyQueue.Dir])
		}))
		.on(EventDownload.SpeedTotal,function()
		{
			MakeDetailActive && Queue.IsRunning(MakeDetailActive) && MakeDetailRefresh()
		})
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
			RNavi.prepend(ShowByClass(ClassShadowBar)),
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
		)
	)
ZED.Each(ShortCut.DefaultMap,function(F,V){UShortCut.on(V,F)})
ZED.onError=function(E){console.error('CATCHED',E)}
	$(function()
	{
		Rainbow.appendTo('body')
		Queue.Dispatch()
	})
}()