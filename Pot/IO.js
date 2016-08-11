~function()
{
	var
	ZED = ZEDQuery,

	Lang = ZED.Lang(),

	$ = ZED.jQuery,

	div = '<div>',

	attrID = 'id',
	attrClass = 'class',

	click = 'click',

	ClassPrefix = 'ZED',
	ClassButton = ClassPrefix + 'Button',

	ShowByRock = function(V,J,T)
	{
		return $(T || div).attr(J ? attrClass : attrID,V)
	},
	ShowByButton = function(Text,Click,T,V,J)
	{
		return ShowByRock(V,J,T).addClass(ClassButton).text(Lang(Text)).on(click,Click)
	},

	Padding = 8,
	NaviWidth = 140,
	StageWidth,
	TitleHeight = 40,

	IDRainbow = ZED.KeyGen(),
	IDNavi = ZED.KeyGen(),
	IDStage = ZED.KeyGen(),
	ClassTitle = ZED.KeyGen(),
	ClassContent = ZED.KeyGen(),

	Electron = require('electron'),
	ipcRenderer = Electron.ipcRenderer,

	SendRenderer = ZED.nAry(5,ZED.invokeAlways)(ZED.invokeProp,'send',ipcRenderer),
	SendCMD = SendRenderer('CMD'),

	SKG = ZED.StableKeyGen(114514),
	Global = ZED.Merge
	(
		ZED.pick(ZED.times(ZED.compose(SKG,ZED.inc),2),ipcRenderer.sendSync('Mirror')),
		ZED.ReduceToObject
		(
		)
	),
	GlobalSave = SendRenderer('Mirror',Global),

	Rainbow = ShowByRock(IDRainbow),
	Navi = ShowByRock(IDNavi),
	Stage = ShowByRock(IDStage),

	NS = ZED.Tab(
	{
		Tab : Navi,
		Content : Stage,
		Default : 0
	}),

	SC = ZED.ShortCut(),

	WithTitle = function(Q,T)
	{
		Q.append
		(
			ShowByRock(ClassTitle,true).text(T),
			T = ShowByRock(ClassContent,true)
		)
		return T
	};

	ZED.CSS(ZED.KeyGen(),function(W,H)
	{
		StageWidth = ZED.max(NaviWidth,W - NaviWidth)

		return ZED.Replace
		(
			'html,body{margin:0;padding:0;background:#F7F7F7;color:#5A5A5A;overflow:hidden}' +
			'#/R/{width:/r/px;height:/h/px}' +
			'#/R/ *{/b/}' +
			'#/N/,#/S/{display:inline-block;height:/h/px;vertical-align:top}' +
			'#/N/' +
			'{' +
				'width:/n/px;' +
				'background:#0099ED;' +
				'color:rgba(255,255,255,.8);' +
				'/a/' +
			'}' +
			'#/N/ .ZEDTabTab{position:relative;padding-left:/p/px;height:/t/px;line-height:/t/px}' +
			'#/N/ .ZEDTabTab:hover{color:#FFF}' +
			'#/N/ .ZEDTabOn{color:#FFF}' +
			'#/N/ .ZEDTabOn:after' +
			'{' +
				'content:"";' +
				'position:absolute;' +
				'top:50%;' +
				'right:/p/px;' +
				'border:solid 6px transparent;' +
				'border-left-color:#FFF;' +
				'/f/' +
			'}' +
			'#/S/{position:relative;width:/s/px;overflow-y:auto}' +
			'#/S/ table{text-align:left}' +
			'#/S/ th,#/S/ td{padding:4px}' +
			'./T/' +
			'{' +
				'position:absolute;' +
				'left:0;' +
				'right:0;' +
				'top:0;' +
				'background:#F4F4F4;' +
				'height:/t/px;' +
				'line-height:/t/px;' +
				'text-align:center;' +
				'border-bottom:1px solid #D1D9DB;' +
				'/i/' +
			'}' +
			'./C/{margin:/p/px;margin-top:/t/px}' +
			'.ZEDPreferenceContent .ZEDInput{width:60%}' +

			'#/N/,./T/,#/R/ .ZEDPreferenceTitle{font-weight:bold}',
			'/',
			{
				R : IDRainbow,
				r : NaviWidth + StageWidth,
				h : H,
				N : IDNavi,
				n : NaviWidth,
				a : ZED.CSSMulti('box-shadow','1px 0 3px rgba(0,0,0,.3)'),
				f : ZED.CSSMulti('transform','translateY(-6px)'),
				S : IDStage,
				s : StageWidth,
				t : TitleHeight,
				T : ClassTitle,
				i : ZED.CSSMulti('box-shadow','0 1px 1px rgba(0,0,0,.3)'),
				C : ClassContent,

				p : Padding,

				b : ZED.CSSMulti('box-sizing','border-box')
			}
		)
	})

	ZED.Each(
	{
		dev : 'alt+shift+d',
		reload : 'f5'
	},function(F,V)
	{
		SC.on(V,SendCMD(F))
	})

	ZED.Each(['q','w','e'],function(F,V)
	{
		SC.on(V,ZED.invokeAlways(ZED.invokeProp,'Index',NS,F))
	})

	NS.Add(
	{
		Tab : '',
		Content : function(Q)
		{
		}
	},{
		Tab : '',
		Content : function(Q)
		{
		}
	},{
		Tab : '',
		Content : function(Q)
		{
		}
	})

	Rainbow.append(Navi,Stage)

	ZED(function()
	{
		$('body').append(Rainbow)
		ipcRenderer.send('Rainbow')
	})
}()