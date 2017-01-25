~function()
{
	var
	ZED = require('@zed.cwt/zedquery'),

	Lang = require('./Lang'),
	L = Lang.L,
	DOM = require('./DOM'),
	Key = require('./Key'),
	KeySite = Key.Site,
	Event = require('./Event'),
	Cold = require('./Cold'),
	Queue = require('./Queue'),
	Site = require('./Site'),
	SiteAll = Site.All,
	SiteMap = Site.Map,

	$ = ZED.jQuery,
	global = ZED.global,
	document = global.document,



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



	YScrollWidth = 12,
	YNaviWidth = 150,
	YStageHeight,
	YStageWidth,
	YToolBarHeight = 40,
	YStatusBarHeight = 40,
	YShadowSize = 10,
	YShadowColor = 'rgba(0,0,0,.4)',

	//ID & Class
	//	Global
	IDRainbow = ZED.KeyGen(),
	IDToolBar = ZED.KeyGen(),
	IDNavi = ZED.KeyGen(),
	IDStage = ZED.KeyGen(),
	IDStatusBar = ZED.KeyGen(),
	ClassShadowBar = ZED.KeyGen(),
	//	Browser
	IDBrowserInput = ZED.KeyGen(),
	IDBrowserGo = ZED.KeyGen(),

	Rainbow = ShowByRock(IDRainbow),
	RToolBar = ShowByRock(IDToolBar).append(ShowByClass(ClassShadowBar)),
	RNavi = ShowByRock(IDNavi).append(ShowByClass(ClassShadowBar)),
	RStage = ShowByRock(IDStage),
	RStatusBar = ShowByRock(IDStatusBar).append(ShowByClass(ClassShadowBar)),



	MakeCount = function(Q)
	{
		var
		S = document.createTextNode(''),
		R = $(DOM.div).append(L(Q),S);

		return function(Q)
		{
			return ZED.isNull(Q) ? R : S.data = Q ? ' [' + Q + ']' : ''
		}
	},
	RColdCount = MakeCount(Lang.Cold),
	RHotCount = MakeCount(Lang.Hot),

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
			'#/R/{height:/r/px;word-break:break-word}' +
			'#/R/ *{box-sizing:border-box}' +

			//ToolBar
			'#/T/{height:/t/px}' +

			//Navi, Stage
			//	Navi
			'#/N/,#/G/{display:inline-block;height:/h/px;vertical-align:top}' +
			'#/N/{width:/n/px;background:#F3F3F3;font-size:1.15rem;font-weight:bold;overflow:hidden;z-index:200200}' +
			//		Tab
			'#/N/ ./I/{position:relative;margin:/b/px 0;padding:18px 0 18px 18px;}' +
			'#/N/ ./I/,#/N/ ./I/ ./B/{transition:all .2s linear}' +
			'#/N/ ./I/:hover,#/N/ ./O/{box-shadow:0 0 /b/px /a/}' +
			'#/N/ ./O/{background:#F7F7F7}' +
			'#/N/ ./I/ ./B/{background:#F3F3F3}' +
			'#/N/ ./O/ ./B/{background:#F7F7F7;box-shadow:none}' +
			//	Stage
			'#/G/{width:/g/px}' +

			//StatusBar
			'#/S/{height:/s/px}' +

			//ShadowBar
			'#/T/,#/N/,#/S/{position:relative}' +
			'./B/{position:absolute;z-index:200400;pointer-events:none}' +
			'#/T/ ./B/{left:0;bottom:-/b/px;width:100%;height:/b/px;box-shadow:inset 0 /b/px /b/px -/b/px /a/}' +
			'#/N/ ./B/{right:0;top:0;width:/b/px;height:100%;box-shadow:inset -/b/px 0 /b/px -/b/px /a/;z-index:200000}' +
			'#/S/ ./B/{left:0;top:-/b/px;width:100%;height:/b/px;box-shadow:inset 0 -/b/px /b/px -/b/px /a/}',
			'/',
			{
				I : DOM.Tab,
				O : DOM.TabOn,

				R : IDRainbow,
				r : H,//Rainbow Height
				T : IDToolBar,
				t : YToolBarHeight,
				N : IDNavi,
				n : YNaviWidth,
				G : IDStage,
				g : YStageWidth,
				h : YStageHeight,
				S : IDStatusBar,
				s : YStatusBarHeight,
				B : ClassShadowBar,
				b : YShadowSize,
				a : YShadowColor
			}
		)
	})

	UTab.Add(
	{
		Tab : L(Lang.Browser),
		CSS : function(ID)
		{
			return ZED.Replace
			(
				'#/R/{}' +
				'#/R/>div{margin-top:10px}' +

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
				'#/I/>div:hover{background:#F3F3F3}',
				'/',
				{
					R : ID,
					I : IDBrowserInput
				}
			)
		},
		Content : function(Q,X)
		{
			var
			RInput = ShowByRock(IDBrowserInput),
			RURL = $(DOM.input).attr(DOM.placeholder,'URL').val('bili space122879'),//DEBUG
			RGo = ShowByClass(DOM.NoSelect).text('\u2192'),

			GoError = function(Q)
			{
				console.log(L(Q))
			},
			Go = function()
			{
				var
				URL = RURL.val().trim(),

				Target,
				Detail,
				ID,

				T;

				if (T = URL.match(/^([0-9A-Z]+)[^0-9A-Z]\s*([^]+?)\s*$/i))
				{
					Target = ZED.toLower(T[1])
					Detail = T[2]
					if (!ZED.has(Target,SiteMap)) return GoError(Lang.UknSite,Target)
					Target = SiteMap[Target]
				}
				else
				{
					Target = ZED.find(function(V){return V[KeySite.Judge].test(URL)},SiteAll)
					Detail = URL
					if (!Target) return GoError(Lang.UknURL,URL)
				}

				Detail = ZED.find(function(V)
				{
					return ZED.find(function(V)
					{
						return ID = Detail.match(V)
					},V[KeySite.Judge])
				},Target[KeySite.Map])

				if (!Detail) return GoError(Lang.UknSite,URL)

				Detail[KeySite.Page](ID[1],1).start(function(Q)
				{
					console.log(Q)
				},function()
				{

				})
			};

			ZED.ShortCut(
			{
				Target : RURL,
				IgnoreInput : false
			}).on('enter',Go)
			RGo.on(DOM.click,Go)

			Q.append
			(
				RInput.append(RURL,RGo)
			)
		}
	},{
		Tab : RColdCount(),
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
		Content : function(Q,X)
		{

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
		Content : function(Q,X)
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
		Content : function(Q,X)
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
		Content : function(Q,X)
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
		Content : function(Q,X)
		{

		}
	})

	RNavi.find('.' + DOM.Tab).append(ShowByClass(ClassShadowBar))

	Rainbow.append
	(
		RToolBar,
		RNavi,
		RStage,
		RStatusBar
	)

	$(function()
	{
		Rainbow.appendTo('body')
	})
}()