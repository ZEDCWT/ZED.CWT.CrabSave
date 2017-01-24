~function()
{
	var
	ZED = require('@zed.cwt/zedquery'),

	Queue = require('./Queue'),
	Event = require('./Event'),
	Key = require('./Key'),
	Site = require('./Site'),
	DOM = require('./DOM'),
	Lang = require('./Lang'),
	L = Lang.L,

	$ = ZED.jQuery,
	global = ZED.global,
	document = global.document,



	ShowByRock = function(V,T)
	{
		return $(T || DOM.div).attr(DOM.id,V)
	},
	ShowByClass = function(V,T)
	{
		return $(T || DOM.div).attr(DOM.cls,V)
	},



	YPadding = 8,
	YScrollWidth = 12,
	YNaviWidth = 150,
	YStageWidth,
	YToolBarHeight = 40,
	YStatusBarHeight = 40,

	IDRainbow = ZED.KeyGen(),
	IDToolBar = ZED.KeyGen(),
	IDNavi = ZED.KeyGen(),
	IDStage = ZED.KeyGen(),
	IDStatusBar = ZED.KeyGen(),
	ClassShadowBar = ZED.KeyGen(),

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
	RUncommittedCount = MakeCount(Lang.Uncommitted),
	RProcessingCount = MakeCount(Lang.Processing),

	UTab = ZED.Tab(
	{
		Tab : RNavi,
		Content : RStage,
		Default : 0
	});

	ZED.CSS(ZED.KeyGen(),function(W,H)
	{
		return ZED.Replace
		(
			'html,body{margin:0;padding:0;background:#F7F7F7;font-size:14px;overflow:hidden}' +
			'#/R/{height:/r/px;word-break:break-word}' +
			'#/R/ *{box-sizing:border-box}' +

			'#/T/{height:/t/px}' +

			'#/N/,#/G/{display:inline-block;height:/h/px;vertical-align:top}' +
			'#/N/{width:/n/px;font-size:1.2rem;font-weight:bold;overflow:hidden;z-index:200200}' +
			'#/N/ .ZEDTabTab{position:relative;margin:/b/px 0;padding:18px 0 18px 18px;}' +
			'#/N/ .ZEDTabTab{transition:box-shadow .2s linear}' +
			'#/N/ .ZEDTabTab ./B/{transition:box-shadow .3s linear}' +
			'#/N/ .ZEDTabTab:hover,#/N/ .ZEDTabOn{box-shadow:0 0 /b/px /a/}' +
			'#/N/ .ZEDTabTab ./B/{background:#F7F7F7}' +
			'#/N/ .ZEDTabOn ./B/{box-shadow:none}' +
			'#/G/{width:/g/px}' +

			'#/S/{height:/s/px}' +

			'#/T/,#/N/,#/S/{position:relative}' +
			'./B/{position:absolute;z-index:200400;pointer-events:none}' +
			'#/T/ ./B/{left:0;bottom:-/b/px;width:100%;height:/b/px;box-shadow:inset 0 /b/px /b/px -/b/px /a/}' +
			'#/N/ ./B/{right:0;top:0;width:/b/px;height:100%;box-shadow:inset -/b/px 0 /b/px -/b/px /a/;z-index:200000}' +
			'#/S/ ./B/{left:0;top:-/b/px;width:100%;height:/b/px;box-shadow:inset 0 -/b/px /b/px -/b/px /a/}',
			'/',
			{
				R : IDRainbow,
				r : H,
				T : IDToolBar,
				t : YToolBarHeight,
				N : IDNavi,
				n : YNaviWidth,
				G : IDStage,
				g : W - YNaviWidth,
				h : H - YToolBarHeight - YStatusBarHeight,
				S : IDStatusBar,
				s : YStatusBarHeight,
				B : ClassShadowBar,
				b : 10,
				a : 'rgba(0,0,0,.4)',

				p : YPadding
			}
		)
	})

	UTab.Add(
	{
		Tab : L(Lang.Browser),
		CSS : function(ID)
		{

		},
		Content : function(Q,Index)
		{

		}
	},{
		Tab : RUncommittedCount(),
		CSS : function(ID)
		{

		},
		Content : function(Q,Index)
		{

		}
	},{
		Tab : RProcessingCount(),
		CSS : function(ID)
		{

		},
		Content : function(Q,Index)
		{

		}
	},{
		Tab : L(Lang.History),
		CSS : function(ID)
		{

		},
		Content : function(Q,Index)
		{

		}
	},{
		Tab : L(Lang.SignIn),
		CSS : function(ID)
		{

		},
		Content : function(Q,Index)
		{

		}
	},{
		Tab : L(Lang.Setting),
		CSS : function(ID)
		{

		},
		Content : function(Q,Index)
		{

		}
	})

	RNavi.find('.ZEDTabTab').append(ShowByClass(ClassShadowBar))

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