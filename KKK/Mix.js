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
	global = ZED.global,
	document = global.document,



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

	MakeS = function(Q){return 1 === Q ? '' : 's'},
	ShowByRock = function(Q)
	{
		return $(DOM.div).attr(DOM.id,Q)
	},
	ShowByRockX = function(Q,S)
	{
		return $(S).attr(DOM.id,Q)
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



	YPadding = 10,
	YPaddingHalf = 5,
	YScrollWidth = 12,
	YNaviWidth = 150,
	YStageHeight,
	YStageWidth,
	YListSVG = 20,
	YToolBarHeight = 40,
	YStatusBarHeight = 40,
	YShadowSize = 10,
	YShadowColor = 'rgba(0,0,0,.4)',
	YCardWidthMin = 160,
	YCardWidthMax = 200,

	//ID & Class
	//	Global
	IDRainbow = ZED.KeyGen(),
	IDToolBar = ZED.KeyGen(),
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
	//	Browser
	IDBrowserInput = ZED.KeyGen(),
	IDBrowserInfo = ZED.KeyGen(),
	IDBrowserList = ZED.KeyGen(),
	ClassBrowserHover = ZED.KeyGen(),

	Rainbow = ShowByRock(IDRainbow),
	RToolBar = ShowByRock(IDToolBar).append(ShowByClass(ClassShadowBar)),
	RNavi = ShowByRock(IDNavi).append(ShowByClass(ClassShadowBar)),
	RStage = ShowByRock(IDStage).attr(DOM.cls,ClassStageScroll),
	RStatusBar = ShowByRock(IDStatusBar).append(ShowByClass(ClassShadowBar)),
	RStatus = ShowByRock(IDStatus),
	RStatusIcon = ShowByRock(IDStatusIcon).on(DOM.aniend,function(){RStatusIcon.removeClass(ClassStatusIconAnimation)}),
	RStatusText = $(DOM.div),
	RSpeed = ShowByRock(IDSpeed),

	EStatus = function(Q,S)
	{
		if (Q)
		{
			RStatusText.text(Q)
			S && RStatusIcon.attr(DOM.cls,S + ' ' + ClassStatusIconAnimation)
		}
		else RStatusText.text('')
		S || RStatusIcon.removeAttr(DOM.cls)
	},



	EMakeCount = function(Q)
	{
		var
		S = ShowByClassX(ClassCount,DOM.span),
		R = $(DOM.div).append(L(Q),S);

		return function(Q)
		{
			return ZED.isNull(Q) ? R : S.text(Q ? '[' + Q + ']' : '')
		}
	},
	RColdCount = EMakeCount(Lang.Cold),
	RHotCount = EMakeCount(Lang.Hot),

	MakeSelectableList = function(Scroll,Index,Data,Make,Change)
	{
		var
		LastScroll = 0,

		Selected = false,
		LastIndex,
		LastID,
		Selecting = {},
		Active = {},

		Clear = function()
		{
			Selected = false
			ZED.Each(Selecting,function(F,V)
			{
				V &&
				(
					F = Active[F],
					F && F.removeClass(ClassListSelected)
				)
			})
			Selecting = {}
		},

		List = ZED.ListView(
		{
			Scroll : Scroll,
			Data : Data,
			Make : function(Q,X)
			{
				var
				ID = Q[KeySite.Unique],
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
					if (Selected)
					{
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
							for (;F <= L;++F)
							{
								T = Data[F][KeySite.Unique]
								Selecting[T] = Data[F]
								if (!S[T])
								{
									J = Active[T]
									J && J.addClass(ClassListSelected)
								}
							}
							ZED.Each(S,function(F,V)
							{
								V && !Selecting[F] &&
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
							Selecting[ID] = On && Q
							On ?
								R.addClass(ClassListSelected) :
								R.removeClass(ClassListSelected)
						}
					}
					if (J)
					{
						Clear()
						Selected = true
						LastIndex = X
						LastID = ID
						Selecting[ID] = Q
						R.addClass(ClassListSelected)
					}
					Change()
				})
				On && R.addClass(ClassListSelected)
				return R
			},
			Destroy : function(Q,V)
			{
				Q.off(DOM.click)
				Active[V[KeySite.Unique]] = false
			}
		});

		Scroll.addClass(DOM.NoSelect)
		UShortCut.on('esc',MakeIndex(Index,ZED.pipe(Clear,Change)))
			.on('ctrl+a',MakeIndex(Index,function()
			{
				ZED.each(function(V,ID)
				{
					ID = V[KeySite.Unique]
					if (!Selecting[ID])
					{
						Selecting[ID] = V
						V = Active[ID]
						V && V.addClass(ClassListSelected)
					}
				},Data)
				Change()
			}))

		return {
			Selecting : function()
			{
				return ZED.reduce(function(D,V){V && D.push(V)},[],Selecting)
			},
			Show : function(T)
			{
				RStage.removeAttr(DOM.cls)
				Active = {}
				List.scroll(LastScroll).recalc().redraw()
				if (Selected)
				{
					T = ZED.findIndex(function(V){return LastID === V[KeySite.Unique]},Data)
					Selected = LastIndex === T
				}
			},
			Hide : function()
			{
				RStage.attr(DOM.cls,ClassStageScroll)
				LastScroll = List.scroll()
			}
		}
	},
	MakeSelectableListShow = ZED.flip(ZED.invokeProp('Show')),
	MakeSelectableListHide = ZED.flip(ZED.invokeProp('Hide')),

	UShortCut = ZED.ShortCut(),
	MakeIndex = ZED.curry(function(X,Q,E)
	{
		X === UTab.Index() && Q()
	}),
	UTab = ZED.Tab(
	{
		Tab : RNavi,
		Content : RStage,
		Default : 0
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

			//Navi, Stage
			//	Navi
			'#/N/,#/G/{display:inline-block;height:/h/px;vertical-align:top}' +
			'#/N/{width:/n/px;background:#F3F3F3!important;font-size:1.15rem;font-weight:bold;overflow:hidden;z-index:200200}' +
			//		Tab
			'#/N/ ./I/{position:relative;margin:/b/px 0;padding:18px 0 18px 18px;}' +
			'#/N/ ./I/,#/N/ ./I/ ./B/{transition:all .2s linear}' +
			'#/N/ ./I/:hover,#/N/ ./O/{box-shadow:0 0 /b/px /a/}' +
			'#/N/ ./O/{background:#F7F7F7}' +
			'#/N/ ./I/ ./B/{background:#F3F3F3}' +
			'#/N/ ./O/ ./B/{background:#F7F7F7;box-shadow:none}' +
			//		Count
			'./V/{margin-right:20px;float:right}' +
			//	Stage
			'#/G/{width:/g/px}' +
			'./Y/,./W/{overflow-x:hidden;overflow-y:scroll}' +
			'#/G/ ./W/{height:100%}' +
			'#/G/ ./Z/{cursor:default}' +
			'#/G/ ./Z/:hover{background:#EFE5F9}' +
			'#/G/ ./F/{background:#E6D5F5!important}' +
			'#/G/ ./W/ svg{cursor:pointer}' +
			'#/G/ ./W/ svg:hover>rect{fill:#0065CB!important}' +

			//StatusBar
			'#/S/{position:relative;height:/s/px}' +
			'#/L/,#/H/{position:absolute;bottom:10px}' +
			'#/L/ div,#/H/ div{display:inline-block;vertical-align:middle}' +
			'#/L/{left:8px}' +
			'#/H/{right:8px}' +
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
			'#/T/ ./B/{left:0;bottom:-/b/px;width:100%;height:/b/px;box-shadow:inset 0 /b/px /b/px -/b/px /a/}' +
			'#/N/ ./B/{right:0;top:0;width:/b/px;height:100%;box-shadow:inset -/b/px 0 /b/px -/b/px /a/;z-index:200000}' +
			'#/S/ ./B/{left:0;top:-/b/px;width:100%;height:/b/px;box-shadow:inset 0 -/b/px /b/px -/b/px /a/}' +

			//Error
			'./E/{color:red;font-size:1.1em;font-weight:bold}',
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

				E : ClassError
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

				'#/I/{position:relative;display:inline-block;padding:0 10px;width:100%}' +
				'#/I/ input{padding:12px 60px 4px 20px;width:100%;font-size:1.6rem;border:0;border-bottom:solid 2px #DCDCDC}' +
				'#/I/ input:hover{border-bottom-color:#CCCEDB}' +
				'#/I/ input:focus{border-bottom-color:#3399FF}' +
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

				'#/O/{margin:0 10px;padding:10px;border:solid #66AFE0;border-width:2px 0;font-size:1.1rem}' +

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
				'./J/{color:#F7F7F7;font-weight:bold;text-align:center;cursor:pointer}' +
				'./H/ ./K/,./N/{background:rgba(102,175,224,.7)}' +
				'./L/,./M/{background:#66AFE0}' +
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
				EStatus(Q.split('\n')[0],ClassStatusError)
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
			Jump = function(X)
			{
				X = ZED.max(1,X)
				EStatus(L(Lang.Loading),ClassStatusLoading)
				GoLast = GoDetail[KeySite.Page](GoID,X).start(function(Q)
				{
					GoLast = false
					EStatus()
					GoInfo = GoInfo || ZED.EazyLog(InfoLog,$(DOM.div).appendTo(RInfo),true)
					Render(Q,X)
				},function(E)
				{
					E && EStatus(ZED.isString(E) ? E : E + (E.stack || ''),ClassStatusError)
				})
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
			UShortCut.cmd(ShortCutCommand.SelAll,MakeIndex(X,Cold.AddAll))
				.cmd(ShortCutCommand.UnAll,MakeIndex(X,Cold.RemoveAll))
				.cmd(ShortCutCommand.PageHead,MakeIndex(X,FnClick.bind($(T[0]))))
				.cmd(ShortCutCommand.PagePrev,MakeIndex(X,FnClick.bind($(T[1]))))
				.cmd(ShortCutCommand.PageNext,MakeIndex(X,FnClick.bind($(T[T.length - 2]))))
				.cmd(ShortCutCommand.PageTail,MakeIndex(X,FnClick.bind($(ZED.last(T)))))
		}
	},{
		Tab : RColdCount(),
		CSS : function(ID)
		{
			return ZED.Replace
			(
				'#/R/ ./M/>div{margin-right:/m/px;padding:/p/px}' +
				'#/R/ ./M/>div>div{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
				'#/R/ ./M/ span{margin:0 4px;color:#00F;font-weight:bold}' +
				'#/R/ ./M/ svg{position:absolute;right:/p/px;top:50%;width:/v/px;height:/v/px;transform:translateY(-/l/px)}',
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
		Hide : MakeSelectableListHide,
		Content : function(M,X)
		{
			var
			ShapeConfig =
			{
				Type : 'Tick',
				Fill : '#A9A9A9',
				Line : '20%'
			},

			R = MakeSelectableList(M,X,Cold.Cold(),function(Q)
			{
				return $(DOM.div).append
				(
					$(DOM.div).append
					(
						MakeAt(Q[KeySite.ID],Q[KeySite.Name]),
						MakeAt(Q[KeySite.Title],Q[KeySite.Author]),
						$(DOM.div).text(ZED.DateToString(Q[KeySite.Date],DateToStringFormat))
					),
					Q = ZED.Shape(ShapeConfig).on(DOM.click,function(E)
					{
						console.log('commit')
						E.stopPropagation()
					})
				)
			},function()
			{
				console.log(R.Selecting().length)
			}),

			MakeAt = function(Q,S)
			{
				return $(DOM.div).attr(DOM.title,Q + '@' + S)
					.append(Q,ShowByText('@',DOM.span),S)
			};

			Cold.Bus.on(Event.Cold.Change,RColdCount)

			return R
		}
	},{
		Tab : RHotCount(),
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
		RToolBar,
		RNavi,
		RStage,
		RStatusBar.append
		(
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