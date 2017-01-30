~function()
{
	var
	ZED = require('@zed.cwt/zedquery'),

	Util = require('./Util'),
	Lang = require('./Lang'),
	L = Lang.L,
	DOM = require('./DOM'),
	DOMCard = DOM.Card,
	Key = require('./Key'),
	KeySite = Key.Site,
	KeyQueue = Key.Queue,
	ShortCut = require('./ShortCut'),
	ShortCutCommand = ShortCut.Command,
	Event = require('./Event'),
	Cold = require('./Cold'),
	Queue = require('./Queue'),
	Site = require('./Site'),
	SiteAll = Site.All,
	SiteMap = Site.Map,

	$ = ZED.jQuery,
	FnClick = $.fn.click,



	DateToStringFormat = '%YYYY%.%MM%.%DD%.%HH%.%NN%.%SS%',
	ReKeyGenStore = [],
	ReKeyGen = function(Q)
	{
		return Q ? ReKeyGenStore.shift() :
		(
			ReKeyGenStore.push(Q = ZED.KeyGen()),
			Q
		)
	},
	ReplaceLang = function(Q,S)
	{
		return ZED.Replace(L(Q),'/',ZED.isArray(S) ? S : ZED.tail(arguments))
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
	MakeAt = function(Q,S)
	{
		return ShowByClass(ClassSingleLine).attr(DOM.title,Q + '@' + S)
			.append(Q,ShowByText('@',DOM.span),S)
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
	ClassStageScroll = ZED.KeyGen(),
	ClassListSelected = ZED.KeyGen(),
	IDStatusBar = ZED.KeyGen(),
	IDStatusBarLeft = ZED.KeyGen(),
	IDStatusBarRight = ZED.KeyGen(),
	IDStatus = ZED.KeyGen(),
	IDStatusIcon = ZED.KeyGen(),
	ClassStatusIconAnimation = ZED.KeyGen(),
	ClassStatusLoading = ZED.KeyGen(),
	ClassStatusError = ZED.KeyGen(),
	IDSpeed = ZED.KeyGen(),
	ClassShadowBar = ZED.KeyGen(),
	ClassError = ZED.KeyGen(),
	//	Util
	ClassShape = ZED.KeyGen(),
	ClassSingleLine = ZED.KeyGen(),
	//	Browser
	IDBrowserInput = ZED.KeyGen(),
	IDBrowserInfo = ZED.KeyGen(),
	IDBrowserList = ZED.KeyGen(),
	ClassBrowserHover = ZED.KeyGen(),
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
	ClassHotSizeUnknown = ZED.KeyGen(),

	//Element
	Rainbow = ShowByRock(IDRainbow),
	RToolBar = ShowByRock(IDToolBar),
	RToolBarIcon = ShowByRock(IDToolBarIcon),
	RToolBarItem = ShowByRock(IDToolBarItem),
	RNavi = ShowByRock(IDNavi),
	RStage = ShowByRock(IDStage).attr(DOM.cls,ClassStageScroll),
	RStatusBar = ShowByRock(IDStatusBar),
	RStatus = ShowByRock(IDStatus),
	RStatusIcon = ShowByRock(IDStatusIcon)
		.on(DOM.aniend,function(){RStatusIcon.removeClass(ClassStatusIconAnimation)}),
	RStatusText = $(DOM.div),
	RSpeed = ShowByRock(IDSpeed),



	ShapeConfigColorTransparent = 'transparent',
	ShapeConfigColorDisabled = '#D1D1D1',
	ShapeConfigColorEnabled = '#7D7D7D',
	ShapeConfigColorHover = '#852ED9',
	ShapeConfigColorBackground = '#A9A9A9',
	ShapeConfigBrowserSelectAll,
	ShapeConfigBrowserUnselectAll,
	ShapeConfigColdCommit =
	{
		Type : 'Tick',
		Fill : false,
		Stroke : ShapeConfigColorEnabled,
		Line : '12%'
	},
	ShapeConfigColdRemove =
	{
		Fill : false,
		Stroke : ShapeConfigColorEnabled,
		Line : '12%',
		Padding : '10%'
	},
	ShapeConfigColdCommitAll =
	{
		Type : 'Tick',
		Fill : false,
		Stroke : ShapeConfigColorEnabled,
		Line : '8%'
	},
	ShapeConfigColdListCommit =
	{
		Type : 'Tick',
		Fill : ShapeConfigColorBackground,
		Line : '20%'
	},
	ShapeConfigHotRemove = ShapeConfigColdRemove,
	ShapeConfigHotPlay =
	{
		Type : 'Polygon',
		General : 4,
		Fill : ShapeConfigColorBackground,
		Stroke : '#F7F7F7',
		Line : '20%'
	},
	ShapeConfigHotPause =
	{
		Type : 'Pause',
		Padding : '25%',
		Fill : ShapeConfigColorBackground,
		Line : '18.75%'
	},
	ShapeConfigHotMore =
	{
		Type : 'More',
		Fill : false,
		Stroke : ShapeConfigColorBackground
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

	MakeScroll = function(S)
	{
		return {
			Show : function(){RStage.scrollTop(S)},
			Hide : function(){S = RStage.scrollTop()}
		}
	},
	MakeSelectableList = function(Scroll,Index,Data,Map,Key,Make,Destroy,SelectChange)
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
			LastID = false
			Count = 0
		},
		Change = function()
		{
			SelectChange(Count)
			MakeStatus(Index,Count ? ReplaceLang(Lang.Selecting,Count,MakeS(Count)) : '')
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
					J = true,
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
							Selecting[T] = true
							if (!S[T])
							{
								J = Active[T]
								J && J.addClass(ClassListSelected)
							}
						}
						ZED.Each(S,function(F,V)
						{
							Selecting[F] ||
							(
								V = Active[F],
								V && V.removeClass(ClassListSelected)
							)
						})
						J = false
					}
					else if (Ctrl)
					{
						J = false
						LastIndex = X
						LastID = ID
						On = !On
						On ?
						(
							++Count,
							R.addClass(ClassListSelected),
							Selecting[ID] = true
						) : (
							--Count,
							R.removeClass(ClassListSelected),
							ZED.delete_(ID,Selecting)
						)
					}
					if (J)
					{
						Clear()
						LastIndex = X
						LastID = ID
						Selecting[ID] = true
						Count = 1
						R.addClass(ClassListSelected)
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
				Active[V[Key]] = false
				Destroy(V,Q)
			}
		}),

		Redraw = function()
		{
			Active = {}
			if (Count)
			{
				ZED.Each(Selecting,function(F)
				{
					ZED.has(F,Map) ||
					(
						--Count,
						ZED.delete_(F,Selecting)
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
						Selecting[ID] = true
						V = Active[ID]
						V && V.addClass(ClassListSelected)
					}
				},Data)
				LastIndex = 0
				LastID = false
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
				RStage.attr(DOM.cls,ClassStageScroll)
				LastScroll = List.scroll()
			},
			Redraw : function()
			{
				LastScroll = List.scroll()
				Redraw()
			}
		}
	},
	MakeSelectableListShow = ZED.flip(ZED.invokeProp('Show')),
	MakeSelectableListHide = ZED.flip(ZED.invokeProp('Hide')),

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
		MakeStatusClass[X] = S
		X === UTab.Index() && MakeStatusChange()
	},



	UShortCut = ZED.ShortCut(),
	MakeIndex = ZED.curry(function(X,Q)
	{
		X === UTab.Index() && Q()
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
		YStageHeight = ZED.max(YToolBarHeight + YStatusBarHeight,H - YToolBarHeight - YStatusBarHeight)

		return ZED.Replace
		(
			'html,body{margin:0;padding:0;background:#F7F7F7;color:#6C6C6C;font-size:14px;overflow:hidden}' +
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
			'#/P/ ./HP/:hover path{fill:/v/!important}' +
			//		Disabled
			'#/P/ ./PD/{cursor:auto}' +
			'#/P/ ./PD/ path,#/P/ ./PD/:hover path{fill:/x/!important}' +

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
			'#/G/{width:/g/px}' +
			//		ListView
			'./Y/,./W/{overflow-x:hidden;overflow-y:scroll}' +
			'#/G/ ./W/{height:100%}' +
			//		ListViewItem
			'#/G/ ./Z/{cursor:default}' +
			'#/G/ ./Z/:hover{background:#EFE5F9}' +
			//		Selected item
			'#/G/ ./F/{background:#E6D5F5!important}' +
			//		Item Control
			'#/G/ ./HP/{cursor:pointer}' +
			'#/G/ ./HP/:hover svg>rect,#/G/ ./HP/:hover circle{fill:#0065CB!important}' +

			//StatusBar
			'#/S/{height:/s/px}' +
			//	Wrapper
			'#/L/,#/H/{position:absolute;bottom:10px}' +
			'#/L/ div,#/H/ div{display:inline-block;vertical-align:middle}' +
			'#/L/{left:8px}' +
			'#/H/{right:8px}' +
			//	Icon
			'#/C/{position:relative;width:20px;height:20px}' +
			'#/C/[class]{margin-right:8px}' +
			'#/C/>div{position:absolute}' +
			//	Loading
			'/e/' +
			'./J/>div{border:solid 2px transparent;border-radius:50%}' +
			'./J/ #/C/A,./J/ #/C/B{border-color:transparent blue blue}' +
			'./J/ #/C/A{left:0;top:0;width:100%;height:100%;animation:/j/ 2s linear infinite}' +
			'./J/ #/C/B{left:25%;top:25%;width:50%;height:50%;animation:/j/ 1s infinite}' +
			//	Error
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
			'./HP/{display:inline-block;line-height:0}' +
			//Single line
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
				G : IDStage,
				g : YStageWidth,
				h : YStageHeight,
				Y : ClassStageScroll,
				F : ClassListSelected,
				V : ClassCount,

				S : IDStatusBar,
				s : YStatusBarHeight,
				L : IDStatusBarLeft,
				H : IDStatusBarRight,
				U : IDStatus,
				C : IDStatusIcon,
				Q : ClassStatusIconAnimation,
				J : ClassStatusLoading,
				j : ReKeyGen(),
				K : ClassStatusError,
				k : ReKeyGen(),
				e : ZED.CSSKeyframe(ReKeyGen(true),{to : {transform : 'rotate(360deg)'}}) +
					ZED.CSSKeyframe(ReKeyGen(true),{to : {transform : 'rotate(405deg)'}}),
				D : IDSpeed,

				B : ClassShadowBar,
				b : YShadowSize,
				a : YShadowColor,

				E : ClassError,

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
			W = ZED.FlexibleFit(W - YScrollWidth - YNaviWidth - YPadding - YPadding,YCardWidthMin,YCardWidthMax,YPadding)
			return ZED.Replace
			(
				'#/R/{text-align:center}' +
				'#/R/>div{margin-top:10px!important}' +

				//URL input
				'#/I/{position:relative;display:inline-block;padding:0 10px;width:100%}' +
				//	input
				'#/I/ input{padding:12px 60px 4px 20px;width:100%;font-size:1.6rem;border:0;border-bottom:solid 2px #DCDCDC}' +
				'#/I/ input:hover{border-bottom-color:#CCCEDB}' +
				'#/I/ input:focus{border-bottom-color:#3399FF}' +
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
			RURL = $(DOM.input).attr(DOM.placeholder,'URL').val('bili space159'),//DEBUG
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
			InfoLog = ReplaceLang(Lang.Info,
			[
				InfoKeyFrom,InfoKeyTo,
				InfoKeyCount,InfoKeyTotal,InfoKeyTotalS,
				InfoKeyAt,InfoKeyPages,InfoKeyPagesS
			]),

			GoError = function(Q)
			{
				Q = ZED.isNumber(Q) ? ReplaceLang(Q,ZED.tail(arguments)) : Q
				RInfo.append(ShowByClass(ClassError).text(Q))
				MakeStatus(X,Q.split('\n')[0],ClassStatusError)
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

				ShowByTextS(ReplaceLang(Lang.Processing,URL),RInfo.empty())
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

				GoInfo = false
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
						ShowByText(V[KeySite.Index] + ' | ' + V[KeySite.ID],DOM.legend),
						Hover(D,V[KeySite.Unique],Cold.New(GoTarget,V)),
						Hover
						(
							D,V[KeySite.Unique],
							ShowByClassX(DOM.NoSelect,DOM.img)
								.attr(DOM.src,V[KeySite.Img])
								.attr(DOM.title,V[KeySite.Title])
						),
						V[KeySite.Title],
						DOM.br,
						V[KeySite.Author],
						DOM.br,
						ZED.DateToString(V[KeySite.Date],DateToStringFormat)
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
						GoLast = false
						MakeStatus(X)
						GoInfo = GoInfo || ZED.EazyLog(InfoLog,$(DOM.div).appendTo(RInfo),true)
						Render(Q,S)
					},function(E)
					{
						E && MakeStatus(X,ZED.isString(E) ? E : E + (E.stack || ''),ClassStatusError)
					})
				}
			},
			T;

			ZED.ShortCut(
			{
				Target : RURL,
				IgnoreInput : false
			}).on('enter',Go)
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
			Tool = $(DOM.div),
			ToolCommit = MakeShape(Lang.Commit,ShapeConfigColdCommit),
			ToolRemove = MakeShape(Lang.Remove,ShapeConfigColdRemove),
			ToolCommitAll = MakeShape(Lang.CommitAll,ShapeConfigColdCommitAll),

			MakeClick = function(Q,L,H)
			{
				return Q.on(DOM.click,function(T)
				{
					Util.StopProp(T)
					T = Cold.Cold.length
					H()
					R.Redraw()
					T -= Cold.Cold.length
					0 < T && MakeStatus(X,ReplaceLang(L,T,MakeS(T)))
				})
			},

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
							MakeAt(Q[KeySite.ID],Q[KeySite.Name]),
							MakeAt(Q[KeySite.Title],Q[KeySite.Author]),
							$(DOM.div).text(ZED.DateToString(Q[KeySite.Date],DateToStringFormat))
						),
						MakeClick(MakeShape(Lang.Commit,ShapeConfigColdListCommit),Lang.Committed,function()
						{
							Cold.Commit(ZED.objOf(Q[KeySite.Unique],Q))
						})
					)
				},ZED.noop,function(Q)
				{
					MakeToolBarActive(ToolCommit,Q)
					MakeToolBarActive(ToolRemove,Q)
				}
			);

			MakeToolBarActive(ToolCommit)
			MakeToolBarActive(ToolRemove)
			MakeToolBar(X,Tool.append
			(
				MakeClick(ToolCommit,Lang.Committed,function()
				{
					R.Count() && Cold.Commit(R.Selecting())
				}),
				MakeClick(ToolRemove,Lang.Removed,function()
				{
					R.Count() && Cold.Remove(R.Selecting())
				}),
				MakeClick(ToolCommitAll,Lang.Committed,Cold.CommitAll)
			))
			Cold.Bus.on(Event.Cold.Change,RColdCount)

			return R
		}
	},{
		Tab : RHotCount(),
		CSS : function(ID,W,T)
		{
			W = YStageWidth - YScrollWidth - YHotControlWidth
			T = YHotTitlePercentage * W
			return ZED.Replace
			(
				'./H/,./S/,./C/,./O/{display:inline-block;vertical-align:middle}' +
				//Title
				'./H/{padding:/p/px;width:/t/px}' +
				'./T/{font-size:1.1rem}' +
				'./N/{color:#979797}' +
				//Status
				'./S/{padding:/p/px 0;width:/s/px}' +
				'./S/>*{display:inline-block;max-width:100%;vertical-align:bottom}' +
				//Control
				'./C/{margin:0 /_/px;line-height:0}' +
				'./C/ svg{width:/c/px;height:/c/px}' +
				'./M/:hover{background:#EF3000}' +
				'./M/:hover path{fill:#F7F7F7!important}' +
				'./P/{margin-top:/_/px}' +
				//	More
				'./O/ svg{width:/o/px;height:/o/px}' +
				//Percentage
				'./G/{position:absolute;left:0;bottom:0;height:3px;background:#979797;transition:width .2s linear}' +
				'./A/{background:#69A0D7}' +
				'./U/{}',
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
			Tool = $(DOM.div),

			ActiveKeyTitle = 0,
			ActiveKeyInfo = 1 + ActiveKeyTitle,
			ActiveKeySpeed = 1 + ActiveKeyInfo,
			ActiveKeyRemain = 1 + ActiveKeySpeed,
			ActiveKeyPercentage = 1 + ActiveKeyRemain,
			Active = {},

			R = MakeSelectableList
			(
				M,X,
				Queue.Online,Queue.OnlineMap,KeyQueue.Unique,
				function(Q)
				{
					var
					ID = Q[KeyQueue.Unique],

					Title = ShowByClass(ClassSingleLine + ' ' + ClassHotTitle).text(Q[KeyQueue.Title]),
					Info = ShowByClass(ClassSingleLine + ' ' + ClassHotInfo).text(L(Lang.GetInfo)),
					Speed = ShowByClass(ClassSingleLine),
					Remain = ShowByClass(ClassSingleLine),
					Percentage = ShowByClass(ClassHotPercentage);

					Active[ID] = [Title,Info,Speed,Remain,Percentage]

					return $(DOM.div).append
					(
						$(DOM.div).append
						(
							ShowByClass(ClassHotTitleInfo).append(Title,Info),
							ShowByClass(ClassHotStatus).append(Speed,' ',Remain),
							ShowByClass(ClassHotControl).append
							(
								MakeShape(Lang.Remove,ShapeConfigHotRemove,ClassHotControlRemove),
								DOM.br,
								MakeShape(Lang.Pause,ShapeConfigHotPause,ClassHotControlPP)
							),
							MakeShape(Lang.More,ShapeConfigHotMore,ClassHotControlMore)
						),
						Percentage
					)
				},function(Q)
				{
					ZED.delete_(Q[KeyQueue.Unique],Active)
				},function(Q)
				{

				}
			);

			MakeToolBar(X,Tool)
			Queue.Bus.on(Event.Queue.ChangeOnline,RHotCount)

			return R
		}
	},{
		Tab : L(Lang.History),
		CSS : function(ID)
		{
			return ZED.Replace
			(
				'',
				'/',
				{
					R : ID
				}
			)
		},
		Content : function(M,X)
		{

		}
	},{
		Tab : L(Lang.SignIn),
		CSS : function(ID)
		{
			return ZED.Replace
			(
				'',
				'/',
				{
					R : ID
				}
			)
		},
		Content : function(M,X)
		{

		}
	},{
		Tab : L(Lang.Setting),
		CSS : function(ID)
		{
			return ZED.Replace
			(
				'',
				'/',
				{
					R : ID
				}
			)
		},
		Content : function(M,X)
		{

		}
	})

	RNavi.find('.' + DOM.Tab).append(ShowByClass(ClassShadowBar))
	ZED.each(function(V){RStatusIcon.append(ShowByRock(IDStatusIcon + ZED.chr(65 + V)))},ZED.range(0,5))

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
			ShowByRock(IDStatusBarLeft).append
			(
				RStatus.append(RStatusIcon,RStatusText)
			),
			ShowByRock(IDStatusBarRight).append
			(
				RSpeed
			)
		)
	)
ZED.Each(ShortCut.DefaultMap,function(F,V){UShortCut.on(V,F)})
	$(function()
	{
		Rainbow.appendTo('body')
	})
}()