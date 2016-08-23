~function()
{
	var
	EmptyObject = {},

	ZED = ZEDQuery,

	Observable = ZED.Observable,

	$ = ZED.jQuery,

	Request = require('request'),
	RequestBody = Observable.wrapNode(Request,null,ZED.nthArg(1)),
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
	span = '<span>',
	br = '<br>',
	input = '<input>',
	img = '<img>',
	fieldset = '<fieldset>',
	legend = '<legend>',

	attrID = 'id',
	attrClass = 'class',
	attrSrc = 'src',

	click = 'click',

	ClassPrefix = 'ZED',
	ClassButton = ClassPrefix + 'Button',
	ClassInput = ClassPrefix + 'Input',
	ClassPager = ClassPrefix + 'Pager',
	ClassNoSelect = ClassPrefix + 'NoSelect',

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

	FriendlyDate = ZED.pipe
	(
		ZED.unless(ZED.isDate,ZED.constructN(1,Date)),
		ZED.binary(ZED.DateToString)('%YYYY%.%MM%.%DD%.%HH%.%NN%.%SS%')
	),
	Best = function(Q)
	{
		return ZED.reduce(ZED.maxBy(ZED.prop(Q)),ZED.objOf(Q,-Infinity))
	},
	BestQulity = Best('width'),

	Padding = 8,
	PaddingHalf = Padding / 2,
	ScrollWidth = 12,
	NaviWidth = 150,
	StageWidth,
	TitleHeight = 40,
	CardWidthMin = 160,
	CardWidthMax = 200,

	IDRainbow = ZED.KeyGen(),
	IDNavi = ZED.KeyGen(),
	ClassNotiUp = ZED.KeyGen(),
	ClassNotiDown = ZED.KeyGen(),
	IDStage = ZED.KeyGen(),
	ClassTitle = ZED.KeyGen(),
	ClassContent = ZED.KeyGen(),
	IDCard = ZED.KeyGen(),
	ClassWave = ZED.KeyGen(),
	ClassWaveHover = ZED.KeyGen(),
	ClassWaveOn = ZED.KeyGen(),

	Rainbow = ShowByRock(IDRainbow).attr(attrClass,'ZEDScroll'),
	Navi = ShowByRock(IDNavi),
	ProcessingUp = ShowByRock(ClassNotiUp,true),
	ProcessingDown = ShowByRock(ClassNotiDown,true),
	Stage = ShowByRock(IDStage),

	NS = ZED.Tab(
	{
		Tab : Navi,
		Content : Stage,
		Default : 0
	}),

	SC = ZED.ShortCut()
		.on('ctrl+a',null,function(K)
		{
			K.preventDefault()
		}),



	//	Task
	TaskSKG = ZED.StableKeyGen(84941),
	TaskHashKey = TaskSKG(),
	TaskIDKey = TaskSKG(),
	TaskStateKey = TaskSKG(),
	TaskStateCold = TaskSKG(),
	TaskStatePlay = TaskSKG(),
	TaskStatePause = TaskSKG(),
	TaskStateDone = TaskSKG(),
	TaskDispatchKey = TaskSKG(),
	TaskStorage = [],//TODO : read from json
	HistoryStorage = [],
	TaskSolveHash = ZED.reduce(function(D,V){D[V[TaskHashKey]] = V}),
	TaskHash = TaskSolveHash({},TaskStorage),
	HistoryHash = TaskSolveHash({},HistoryStorage),
	TaskGenHash = function(P,ID){return P + '|' + ID},
	TaskSearch = function(P,ID)
	{
		P = ZED.propEq(TaskHashKey,TaskGenHash(P,ID))
		return ZED.find(P,TaskStorage) || ZED.find(P,HistoryStorage)
	},
	TaskUpdateProcessing = function(F,L)
	{
		L = 0
		for (F = TaskStorage.length;F;)
			if (TaskStateCold === TaskStorage[--F][TaskStateKey])
				++L
		ProcessingDown.css('visibility',L ? 'visible' : 'hidden').text(L)
		L = TaskStorage.length - L
		ProcessingUp.css('visibility',L ? 'visible' : 'hidden').text(L)
	},
	TaskColdOn = function(P,ID,D)
	{
		if (!TaskHash[P = TaskGenHash(P,ID)])
		{
			TaskStorage.push(TaskHash[P] = ZED.ReduceToObject
			(
				TaskHashKey,P,
				TaskStateKey,TaskStateCold,
				TaskIDKey,ID,
				TaskDispatchKey,D
			))
			TaskUpdateProcessing()
		}
	},
	TaskColdOff = function(P,ID,F)
	{
		if (TaskHash[P = TaskGenHash(P,ID)] && TaskStateCold === TaskHash[P][TaskStateKey])
		{
			F = ZED.indexOf(TaskHash[P],TaskStorage)
			0 <= F && TaskStorage.splice(F,1)
			ZED.delete_(P,TaskHash)
			TaskUpdateProcessing()
		}
	},



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
	ListPageSizeKey = ZED.KeyGen(),
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



	DispatchSKG = ZED.StableKeyGen(39021),
	DispatchStorage = {},
	DispatchWrap = function(Q,T)
	{
		return ZED.isFunction(Q) ?
		(
			DispatchStorage[T = DispatchSKG()] = Q,
			T
		) : DispatchStorage[Q]
	},

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
	//		Niconico
	DomainNiconico = 'www.nicovideo.jp/',
	URLNiconicoUser = ZED.URLBuild(HTTP,DomainNiconico,'user/',undefined,'/video?page=',undefined),

	//	Action
	//		Bilibili
	BilibiliUser = function(ID,Page)
	{
		var
		PageSize = Session[SessionPageSizeKey];
		Page = Page || 0
		return RequestJSON(URLBilibiliUser(ID,1 + Page,PageSize))
			.map(function(Q)
			{
				if (!Q.status) throw Q.data && Q.data.error

				Q = Q.data || EmptyObject
				return ZED.ReduceToObject
				(
					ListIDKey,ID,
					ListJumpKey,BilibiliUser,
					ListPageKey,Page,
					ListPageSizeKey,PageSize,
					ListPageTotalKey,Q.pages,
					ListCountKey,Q.count,
					ListDispatchKey,BilibiliDispatch,
					ListCardKey,ZED.Map(Q.vlist,function(F,V)
					{
						return ZED.ReduceToObject
						(
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
	BilibiliDispatch = DispatchWrap(function()
	{

	}),
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
					ListPageSizeKey,PageSize,
					ListCountKey,Total,
					ListDispatchKey,YoutubeDispatch,
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
	YoutubeDispatch = DispatchWrap(function()
	{

	}),
	//		Niconico
	NiconicoUser = function(ID,Page)
	{
		Page = Page || 0
		return RequestBody(
		{
			url : URLNiconicoUser(ID,1 + Page),
			headers :
			{
				Cookie : ''
			}
		})
			.map(function(Q,A)
			{
				A = ZED.match(/profile[^]+?<h2>([^<]+)/,Q)[1]
				return ZED.ReduceToObject
				(
					ListIDKey,ID,
					ListJumpKey,NiconicoUser,
					ListPageKey,Page,
					ListPageSizeKey,30,
					ListCountKey,Number(ZED.match(/id="video[^]+?(\d+)/,Q)[1]),
					ListDispatchKey,NiconicoDispatch,
					ListCardKey,ZED.Map(ZED.match(/outer"(?![^<]+<form)[^]+?<\/p/g,Q),function(F,V)
					{
						return ZED.ReduceToObject
						(
							ListCardIDKey,ZED.match(/sm(\d+)/,V)[1],
							ListCardImgKey,ZED.match(/src="([^"]+)/,V)[1],
							ListCardTitleKey,ZED.match(/h5>[^>]+>([^<]+)/,V)[1],
							ListCardAuthorKey,A,
							ListCardDateKey,ZED.trim(ZED.match(/posttime">([^<]+)/,V)[1] || '')
						)
					})
				)
			})
	},
	NiconicoDispatch = DispatchWrap(function()
	{

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
	),ZED.ReduceToObject
	(
		ToolNameKey,'Niconico',
		ToolJudgeKey,/\.nicovideo\./i,
		ToolNailKey,[ZED.ReduceToObject
		(
			ToolNameKey,'User',
			ToolJudgeKey,/user\/(\d+)/i,
			ToolInitKey,NiconicoUser
		)]
	)];

	ZED.CSS(ZED.KeyGen(),function(W,H)
	{
		StageWidth = ZED.max(NaviWidth,W - NaviWidth)

		return ZED.Replace
		(
			'html,body{margin:0;padding:0;background:#F7F7F7;color:#5A5A5A;overflow:hidden}' +
			'#/R/{width:/r/px;height:/h/px;word-break:break-word}' +
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
			'#/N/ ./U/,#/N/ ./D/' +
			'{' +
				'position:absolute;' +
				'right:24px;' +
				'padding:0 5px;' +
				'background:#007ACC;' +
				'color:#FFF;' +
				'min-width:8px;' +
				'height:18px;' +
				'line-height:18px;' +
				'font-size:11px;' +
				'border-radius:20px;' +
				'text-align:center' +
			'}' +
			'#/N/ ./U/{top:0}' +
			'#/N/ ./D/{bottom:0}' +
			'#/S/{position:relative;width:/s/px;overflow-y:auto}' +
			'#/S/ table{text-align:left}' +
			'#/S/ th,#/S/ td{padding:4px}' +
			'./T/' +
			'{' +
				'background:#F4F4F4;' +
				'height:/t/px;' +
				'line-height:/t/px;' +
				'text-align:center;' +
				'border-bottom:1px solid #D1D9DB;' +
				'/i/' +
			'}' +
			'./C/{margin:/p/px}' +
			'.ZEDPreferenceContent .ZEDInput{width:60%}' +

			'#/N/,./T/,#/R/ .ZEDPreferenceTitle{font-weight:bold}',
			'/',
			{
				R : IDRainbow,
				r : NaviWidth + StageWidth,
				h : H,
				N : IDNavi,
				U : ClassNotiUp,
				D : ClassNotiDown,
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
		CSS : function(ID,W,F)
		{
			return ZED.Replace
			(
				'#/R/{text-align:center}' +
				'#/R/ ./C/>*{margin-top:16px}' +
				'#/R/ ./C/>./I/{width:100%}' +
				'#/R/ ./P/{visibility:hidden}' +
				'#/R/ #/D/{margin-left:-/h/px;margin-right:-/h/px;text-align:left;font-size:14px}' +
				'#/R/ fieldset{display:inline-block;margin:0 /h/px /p/px;padding:/p/px;width:/f/px;max-width:/f/px;border:0;vertical-align:top;/s/;cursor:pointer}' +
				'#/R/ legend{padding:0;cursor:auto}' +
				'#/R/ ./W/{background:transparent;color:transparent;font-weight:bold;text-align:center}' +
				'#/R/ fieldset:hover ./W/,#/R/ ./H/ ./W/{background:#CCD0D7;color:white}' +
				'#/R/ ./O/ ./W/{background:#2672EC!important;color:white!important}' +
				'#/R/ img{width:/m/px}' +
				'#/R/ fieldset span{cursor:auto}',
				'/',
				{
					R : ID,
					C : ClassContent,
					I : ClassInput,
					P : ClassPager,
					D : IDCard,
					W : ClassWave,
					H : ClassWaveHover,
					O : ClassWaveOn,

					p : Padding,
					h : PaddingHalf,
					f : F = ZED.FlexibleFit(W - ScrollWidth - NaviWidth - Padding - Padding,CardWidthMin,CardWidthMax,Padding),
					s : ZED.CSSMulti('box-shadow','0 5px 10px rgba(0,0,0,.3)'),
					m : F - Padding - Padding
				}
			)
		},
		Content : function(Q)
		{
			var
			ID,Jump,Dispatch,

			Input = ShowByRock(ClassInput,true,input).attr('placeholder','URL').val('http://space.bilibili.com/13046'),
			Button = ShowByButton('Initialize'),
			State = $(div),
			PagerUp,
			CardPanel = ShowByRock(IDCard),
			PagerDown,
			Pager,
			Wave = [],
			WaveDisplay = function(ID,Card,W,Last,Now,Say,Class)
			{
				switch (Last)
				{
					case TaskStateCold :
						Class = ClassWaveOn
						break
					case TaskStateDone :
						Class = ClassWaveHover
				}
				Class && Card.removeClass(Class)
				Class = undefined
				switch (Now)
				{
					case TaskStateCold :
						Say = 'Selected'
						Class = ClassWaveOn
						break
					case TaskStatePlay :
					case TaskStatePause :
						break
					case TaskStateDone :
						Say = 'Downloaded'
						Class = ClassWaveHover
						break
					default :
						Say = 'Select'
				}
				Say && W.text(Say)
				Class && Card.addClass(Class)
			},
			Waving = function(ID,Card,W)
			{
				var
				StartAt,
				Now = TaskSearch(Dispatch,ID),
				Go = function(J,L)
				{
					switch (L = Now)
					{
						case TaskStateCold :
							true === J ||
							(
								TaskColdOff(Dispatch,ID),
								Now = StartAt
							)
							break
						case TaskStatePlay :
						case TaskStatePause :
							break
						case TaskStateDone :
							if (true !== J) break
						default :
							false === J ||
							(
								TaskColdOn(Dispatch,ID),
								Now = TaskStateCold
							)
					}
					L === Now || WaveDisplay(ID,Card,W,L,Now)
				};

				Now = Now && Now[TaskStateKey]
				TaskStateDone === Now && (StartAt = Now)
				WaveDisplay(ID,Card,W,undefined,Now)

				Wave.push(Go)
				Card.on(click,function(D)
				{
					/span|legend/i.test(D.target.tagName) || Go()
				})
			},
			Display = function(Q)
			{
				var
				Page = Q[ListPageKey],
				PageSize = Q[ListPageSizeKey],
				Total = Q[ListPageTotalKey],
				Offset = Page * PageSize,
				Count = Q[ListCountKey],
				List = Q[ListCardKey],
				From = List[0],
				To = ZED.last(List);

				ID = Q[ListIDKey]
				Jump = Q[ListJumpKey]
				Dispatch = Q[ListDispatchKey]
				ZED.isNumber(Total) || (Total = Count / Q[ListPageSizeKey])
				Total = Math.ceil(Total) - 1

				State.text(ZED.Replace
				(
					'Page $0$ / $1$ | $2$ ~ $3$ | $4$ in $5$',
					Page,Total,
					From ? 'No.' + ZED.defaultTo(Offset,From[ListCardNoKey]) : '-',
					To ? 'No.' + ZED.defaultTo(Offset + List.length - 1,To[ListCardNoKey]) : '-',
					List.length,Count
				))
				CardPanel.empty()
				Wave.length = 0
				ZED.Each(List,function(F,V,W)
				{
					CardPanel.append
					(
						F = $(fieldset).attr('title',V[ListCardTitleKey]).append
						(
							$(legend).text
							(
								ZED.defaultTo(Offset + F,V[ListCardNoKey]) +' | ' +
								(
									V[ListCardIDDisplayKey] ?
										V[ListCardIDDisplayKey](V[ListCardIDKey]) :
										V[ListCardIDKey]
								)
							),
							W = ShowByRock(ClassWave + ' ' + ClassNoSelect,true),
							ShowByRock(ClassNoSelect,true,img).attr(attrSrc,V[ListCardImgKey]),
							$(span).text(V[ListCardTitleKey]),
							br,
							$(span).text(V[ListCardAuthorKey]),
							br,
							$(span).text(FriendlyDate(V[ListCardDateKey]))
						)
					)
					Waving(V[ListCardIDKey],F,W)
				})
				PagerUp(Page,Total)
				PagerDown(Page,Total)
				Pager.css('visibility',Total ? 'visible' : 'hidden')
			},
			PageChange = function(Q)
			{
				ZED.Tips('Jumping to page ' + Q)
				Jump && Jump(ID,Q).start(Display,function(e)
				{
					ZED.Tips('Unable to jump to page ' + Q + ', maybe you want to try agagin\n' + (e || ''))
				})
			},
			T;

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
					console.error(e)
				})
				.retry()
				.start(Display)

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
			Q.append(State)
			PagerUp = ZED.Pager({Parent : Q},PageChange)
			Q.append(CardPanel)
			PagerDown = ZED.Pager({Parent : Q},PageChange)
			Pager = Q.find('.' + ClassPager)
			T = Pager[0].children
			ZED.Each(
			{
				h : 0,
				j : 1,
				k : -2,
				l : -1
			},function(F,V)
			{
				SC.on(F,ZED.invokeAlways(ZED.invokeProp,click,ZED.nth(V,T)))
			})
			SC.on('ctrl+a',null,ZED.invokeAlways(ZED.each,ZED.call_(ZED.__,true),Wave))
				.on('ctrl+shift+a',null,ZED.invokeAlways(ZED.each,ZED.call_(ZED.__,false),Wave))
		}
	},{
		Tab : $(div).append
		(
			'Processing',
			ProcessingUp,
			ProcessingDown
		),
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
		Tab : 'Sign in',
		Content : function(Q)
		{
			Q = WithTitle(Q,'Sign in')
		}
	},{
		Tab : 'Setting',
		Content : function(Q)
		{
			Q = WithTitle(Q,'Setting')
		}
	})

	TaskUpdateProcessing()

	Rainbow.append(Navi,Stage)

	ZED(function()
	{
		$('body').append(Rainbow)
		ipcRenderer.send('Rainbow')
	})
}()