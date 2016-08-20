~function()
{
	var
	EmptyObject = {},

	ZED = ZEDQuery,

	Observable = ZED.Observable,

	$ = ZED.jQuery,

	Request = require('request'),
	RequestJSON = Observable.wrapNode(Request,null,ZED.flip(ZED.JTO)),



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

	SessionPageSizeKey = ZED.KeyGen(),
	Session = ZED.ReduceToObject
	(
		SessionPageSizeKey,50
	),



	div = '<div>',
	input = '<input>',

	attrID = 'id',
	attrClass = 'class',

	click = 'click',

	ClassPrefix = 'ZED',
	ClassButton = ClassPrefix + 'Button',
	ClassInput = ClassPrefix + 'Input',

	ShowByRock = function(V,J,T)
	{
		return $(T || div).attr(J ? attrClass : attrID,V)
	},
	ShowByButton = function(Text,Click,T,V,J)
	{
		return ShowByRock(V,J,T).addClass(ClassButton).text(Text).on(click,Click)
	},
	WithTitle = function(Q,T)
	{
		Q.append
		(
			ShowByRock(ClassTitle,true).text(T),
			T = ShowByRock(ClassContent,true)
		)
		return T
	},

	Best = function(Q)
	{
		return ZED.reduce(ZED.maxBy(ZED.prop(Q)),ZED.objOf(Q,-Infinity))
	},
	BestQulity = Best('width'),

	Padding = 8,
	NaviWidth = 140,
	StageWidth,
	TitleHeight = 40,

	IDRainbow = ZED.KeyGen(),
	IDNavi = ZED.KeyGen(),
	IDStage = ZED.KeyGen(),
	ClassTitle = ZED.KeyGen(),
	ClassContent = ZED.KeyGen(),

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



	//	Toolbox
	ToolNameKey = ZED.KeyGen(),
	ToolJudgeKey = ZED.KeyGen(),
	ToolNailKey = ZED.KeyGen(),
	ToolNameKey = ZED.KeyGen(),
	ToolInitKey = ZED.KeyGen(),

	//	List
	ListIDKey = ZED.KeyGen(),
	ListJumpKey = ZED.KeyGen(),
	ListPageKey = ZED.KeyGen(),
	ListPageTotalKey = ZED.KeyGen(),
	ListCountKey = ZED.KeyGen(),
	ListDispatchKey = ZED.KeyGen(),
	ListCardKey = ZED.KeyGen(),
	ListCardIDKey = ZED.KeyGen(),
	ListCardIDDisplayKey = ZED.KeyGen(),//Optional
	ListCardNoKey = ZED.KeyGen(),
	ListCardImgKey = ZED.KeyGen(),
	ListCardTitleKey = ZED.KeyGen(),
	ListCardAuthorKey = ZED.KeyGen(),
	ListCardDateKey = ZED.KeyGen(),
	_ListFromKey = ZED.KeyGen(),
	_ListToKey = ZED.KeyGen(),
	_ListLengthKey = ZED.KeyGen(),
	_ListOrderKey = ZED.KeyGen(),
	LangListHint = ZED.Replace
	(
		'Page ,$0$, / ,$1$, | ,$2$, ~ ,$3$, | ,$4$, in ,$5$, ,$6$',
		ListPageKey,ListPageTotalKey,
		_ListFromKey,_ListToKey,
		_ListLengthKey,ListCountKey,
		_ListOrderKey
	),



	HTTP = 'http://',
	HTTPS = 'https://',
	//	URL
	//		Bilibili
	DomainBilibili = '.bilibili.com/',
	DomainBilibiliSpace = 'space' + DomainBilibili,
	URLBilibiliUser = ZED.URLBuild(HTTP,DomainBilibiliSpace,'ajax/member/getSubmitVideos?mid=',undefined,'&page=',undefined,'&pagesize=',undefined),
	//		Youtube
	GoogleAPIKey = 'AIzaSyA_ltEFFYL4E_rOBYkQtA8aKHnL5QR_uMA',
	DomainGoogleAPI = '.googleapis.com/',
	DomainGoogleAPIWWW = 'www' + DomainGoogleAPI,
	URLYoutubePrefix = DomainGoogleAPIWWW + 'youtube/v3/',
	URLYoutubeChannel = ZED.URLBuild(HTTPS,URLYoutubePrefix,'channels?part=contentDetails&id=',undefined,'&key=',GoogleAPIKey),
	URLYoutubeChannelForUser = ZED.URLBuild(HTTPS,URLYoutubePrefix,'channels?part=contentDetails&forUsername=',undefined,'&key=',GoogleAPIKey),
	URLYoutubePlaylist = ZED.URLBuild(HTTPS,URLYoutubePrefix,'playlistItems?part=snippet%2CcontentDetails&playlistId=',undefined,'&pageToken=',undefined,'&maxResults=',undefined,'&key=',GoogleAPIKey),

	//	Action
	//		Bilibili
	BilibiliUser = function(ID,Page)
	{
		var
		PageSize = Session[SessionPageSizeKey];

		return RequestJSON(URLBilibiliUser(ID,Page = Number(Page) || 0,PageSize))
			.map(function(Q)
			{
				if (!Q.status) throw Q.data && Q.data.error

				Q = Q.data || EmptyObject
				return ZED.ReduceToObject
				(
					ListIDKey,ID,
					ListJumpKey,BilibiliUser,
					ListPageKey,Page,
					ListPageTotalKey,Q.pages,
					ListCountKey,Q.count,
					// ListDispatchKey,BilibiliDispatch,
					ListCardKey,ZED.Map(Q.vlist,function(F,V)
					{
						return ZED.ReduceToObject
						(
							ListCardNoKey,F + Page * PageSize,
							ListCardIDKey,V.aid,
							ListCardIDDisplayKey,ZED.add('av'),
							ListCardImgKey,V.pic,
							ListCardTitleKey,V.title,
							ListCardAuthorKey,V.author,
							ListCardDateKey,V.created.replace(' ','T') + '+0800'
						)
					})
				)
			})
	},
	//		Youtube
	YoutubePlaylist = function(ID,Page)
	{
		var
		PageSize = Session[SessionPageSizeKey];

		return RequestJSON(URLYoutubePlaylist(ID,ZED.Code.PageToken(PageSize * (Page = Page || 0)),PageSize))
			.map(function(Q,Total)
			{
				if (Q.error) throw Q.error.message

				Total = ZED.path(['pageInfo','totalResults'],Q)

				return ZED.ReduceToObject
				(
					ListIDKey,ID,
					ListJumpKey,YoutubePlaylist,
					ListPageKey,Page,
					ListPageTotalKey,Total / PageSize,
					ListCountKey,Total,
					// ListDispatchKey,YoutubeDispatch,
					ListCardKey,ZED.map(function(V)
					{
						return ZED.ReduceToObject
						(
							ListCardNoKey,ZED.path(['snippet','position'],V),
							ListCardIDKey,ZED.path(['contentDetails','videoId'],V),
							ListCardImgKey,BestQulity(ZED.path(['snippet','thumbnails'],V)).url,
							ListCardTitleKey,ZED.path(['snippet','title'],V),
							ListCardAuthorKey,ZED.path(['snippet','channelTitle'],V),
							ListCardDateKey,ZED.path(['snippet','publishedAt'],V)
						)
					},Q.items)
				)
			})
	},
	YoutubeChannel = ZED.curry(function(U,ID)
	{
		return RequestJSON(U(ID))
			.flatMap(function(Q)
			{
				Q = ZED.path(['items',0,'contentDetails','relatedPlaylists','uploads'],Q)
				return Q ?
					YoutubePlaylist(Q) :
					Observable.throw('No provided playlist id')
			})
	}),



	ToolBox = [ZED.ReduceToObject
	(
		ToolNameKey,'Bilibili',
		ToolJudgeKey,/\.bilibili\./i,
		ToolNailKey,[ZED.ReduceToObject
		(
			ToolNameKey,'User',
			ToolJudgeKey,/space[^\/]+\/(\d+)/i,
			ToolInitKey,BilibiliUser
		)]
	),ZED.ReduceToObject
	(
		ToolNameKey,'Youtube',
		ToolJudgeKey,/\.youtu\.?be\./i,
		ToolNailKey,[ZED.ReduceToObject
		(
			ToolNameKey,'User',
			ToolJudgeKey,/user\/([^\/]+)/i,
			ToolInitKey,YoutubeChannel(URLYoutubeChannelForUser)
		),ZED.ReduceToObject
		(
			ToolNameKey,'Channel',
			ToolJudgeKey,/channel\/([^\/]+)/i,
			ToolInitKey,YoutubeChannel(URLYoutubeChannel)
		),ZED.ReduceToObject
		(
			ToolNameKey,'Playlist',
			ToolJudgeKey,/playlist.*list=([^&]+)/i,
			ToolInitKey,YoutubePlaylist
		)]
	)];

	ZED.CSS(ZED.KeyGen(),function(W,H)
	{
		StageWidth = ZED.max(NaviWidth,W - NaviWidth)

		return ZED.Replace
		(
			'html,body{margin:0;padding:0;background:#F7F7F7;color:#5A5A5A;overflow:hidden}' +
			'#/R/{width:/r/px;height:/h/px}' +
			'#/R/ *{/b/}' +
			'#/R/ table{width:100%}' +
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

	ZED.Each('qwert'.split(''),function(F,V)
	{
		SC.on(V,ZED.invokeAlways(ZED.invokeProp,'Index',NS,F))
	})

	NS.Add(
	{
		Tab : 'Browser',
		CSS : function(ID)
		{
			return ZED.Replace
			(
				'#/R/{text-align:center}' +
				'#/R/ ./C/>*{margin-top:16px}' +
				'#/R/ ./C/>./I/{width:100%}',
				'/',
				{
					R : ID,
					C : ClassContent,
					I : ClassInput
				}
			)
		},
		Content : function(Q)
		{
			var
			Input = ShowByRock(ClassInput,true,input).attr('placeholder','URL').val('http://space.bilibili.com/13046'),
			Button = ShowByButton('Initialize'),
			Panel = ShowByRock();

			Q = WithTitle(Q,'Browser')

			Observable.wrapEmitter(Button,click)
				.flatMapLatest(function()
				{
					var
					V = Input.val(),
					D = ZED.find(ZED.propSatisfies(ZED.test(ZED.__,V),ToolJudgeKey)),
					T;

					T = D(ToolBox)
					T = T && D(T[ToolNailKey])
					return T ?
						T[ToolInitKey](ZED.match(T[ToolJudgeKey],V)[1]) :
						Observable.throw('Unknown url format')
				})
				.tap(null,function(e)
				{
					ZED.Tips('Unable to initialize from the given url\n' + (e || ''))
					console.log(e)
				})
				.retry()
				.start(function(Q)
				{
					console.log(Q)
				})

			Q.append
			(
				Input,
				Button
			)

			ZED.Preference(
			{
				Set :
				[
					['Page size',[10,20,50,{T : 'I',N : true}],SessionPageSizeKey]
				],
				Data : Session,
				Parent : Q,
				Table : true
			})

			Q.append(Panel)
		}
	},{
		Tab : 'Queue',
		Content : function(Q)
		{
			Q = WithTitle(Q,'Queue')
		}
	},{
		Tab : 'Processing',
		Content : function(Q)
		{
			Q = WithTitle(Q,'Processing')
		}
	},{
		Tab : 'History',
		Content : function(Q)
		{
			Q = WithTitle(Q,'History')
		}
	},{
		Tab : 'Setting',
		Content : function(Q)
		{
			Q = WithTitle(Q,'Setting')
		}
	})

	Rainbow.append(Navi,Stage)

	ZED(function()
	{
		$('body').append(Rainbow)
		ipcRenderer.send('Rainbow')
	})
}()