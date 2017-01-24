~function()
{
	var
	EmptyObject = {},

	ZED = ZEDQuery,

	Observable = ZED.Observable,

	$ = ZED.jQuery,
	EmptyJQuery = $(),

	Path = require('path'),

	Request = require('request'),
	RequestBody = Observable.wrapNode(Request,null,ZED.nthArg(1)),
	RequestJSON = Observable.wrapNode(Request,null,ZED.flip(ZED.JTO)),



	Electron = require('electron'),
	ipcRenderer = Electron.ipcRenderer,

	SendRenderer = ZED.nAry(5,ZED.invokeAlways)(ZED.invokeProp,'send',ipcRenderer),
	SendCMD = SendRenderer('CMD'),

	SKG = ZED.StableKeyGen(114514),
	GlobalPathKey = SKG(),
	GlobalOnlineKey = SKG(),
	GlobalCookieKey = SKG(),
	Global = ZED.Merge
	(
		ZED.pick(ZED.times(ZED.compose(SKG,ZED.inc),2),ipcRenderer.sendSync('Mirror')),
		ZED.ReduceToObject
		(
			GlobalPathKey,Path.join(ZED.HOME,'ZED/CrabSave/Download'),
			GlobalOnlineKey,5,
			GlobalCookieKey,{}
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
	attrTitle = 'title',

	click = 'click',

	ClassPrefix = 'ZED',
	ClassButton = ClassPrefix + 'Button',
	ClassScroll = ClassPrefix + 'Scroll',
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

	ColorCold = '#989898',
	ColorHot = '#69A0D7',

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
	ClassOver = ZED.KeyGen(),
	ClassOverCold = ZED.KeyGen(),
	ClassOverHot = ZED.KeyGen(),
	ClassOverTitle = ZED.KeyGen(),
	ClassOverState = ZED.KeyGen(),
	ClassOverEnd = ZED.KeyGen(),
	ClassOverAction = ZED.KeyGen(),
	ClassOverProgress = ZED.KeyGen(),

	Rainbow = ShowByRock(IDRainbow).attr(attrClass,ClassScroll),
	Navi = ShowByRock(IDNavi),
	ProcessingUp = ShowByRock(ClassNotiUp,true).attr(attrTitle,'Queuing'),
	ProcessingDown = ShowByRock(ClassNotiDown,true).attr(attrTitle,'Uncommitted'),
	Stage = ShowByRock(IDStage),

	NS = ZED.Tab(
	{
		Tab : Navi,
		Content : Stage,
		Default : 0
	}),
	NSMakeIndex = function(Q,C)
	{
		return function()
		{
			Q === NS.Index() && C()
		}
	},

	SC = ZED.ShortCut()
		.on('ctrl+a',null,function(K)
		{
			K.preventDefault()
		}),

	RedrawStorage = [true],
	Redraw = function(F,J)
	{
		F = RedrawStorage.length - 1
		if (J = RedrawStorage[F]) RedrawStorage[F] = false
		else RedrawStorage.push(true)

		return J ? function(S,Q)
		{
			Q.redraw().scroll(RedrawStorage[F])
		} : function(S,Q)
		{
			RedrawStorage[F] = Q.scroll()
		}
	},



	//	Task
	TaskSKG = ZED.StableKeyGen(84941),
	TaskHashKey = TaskSKG(),
	TaskWaveKey = TaskSKG(),
	TaskIDKey = TaskSKG(),
	TaskStateKey = TaskSKG(),
	TaskStateCold = TaskSKG(),
	TaskStatePlay = TaskSKG(),
	TaskStatePause = TaskSKG(),
	TaskStateDone = TaskSKG(),
	TaskTitleKey = TaskSKG(),
	TaskDispatchKey = TaskSKG(),
	TaskStorage = [],//TODO : read from json
	HistoryStorage = [],
	TaskSolveHash = ZED.reduce(function(D,V){D[V[TaskHashKey]] = V}),
	TaskHash = TaskSolveHash({},TaskStorage),
	HistoryHash = TaskSolveHash({},HistoryStorage),
	TaskGenHash = function(P,ID){return P + '|' + ID},
	TaskSearch = function(P,ID)
	{
		return TaskHash[P = TaskGenHash(P,ID)] || HistoryHash[P]
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
	TaskOnColdAdd = ZED.KeyGen(),
	TaskOnColdRemove = ZED.KeyGen(),
	TaskOnProcessingEnd = ZED.KeyGen(),
	TaskOnStateChange = ZED.KeyGen(),
	TaskOnNotice = ZED.KeyGen(),
	TaskEmitter = ZED.Emitter(),
	TaskRemove = function(H,N,Q,F)
	{
		F = ZED.indexOf(Q = TaskHash[H],TaskStorage)
		0 <= F && TaskStorage.splice(F,1)
		ZED.delete_(H,TaskHash)
		TaskUpdateProcessing()
		TaskEmitter.emit(N,H)
	},
	TaskColdOn = function(P,ID,Title,H)
	{
		if (!TaskHash[H = TaskGenHash(P,ID)])
		{
			TaskStorage.push(ID = TaskHash[H] = ZED.ReduceToObject
			(
				TaskHashKey,H,
				TaskStateKey,TaskStateCold,
				TaskIDKey,ID,
				TaskTitleKey,Title,
				TaskDispatchKey,P
			))
			TaskUpdateProcessing()
			TaskEmitter.emit(TaskOnColdAdd,ID)
		}
	},
	TaskColdOff = function(P,ID)
	{
		if (TaskHash[P = TaskGenHash(P,ID)] && TaskStateCold === TaskHash[P][TaskStateKey])
			TaskRemove(P,TaskOnColdRemove)
	},
	TaskPlay = function(H,Q)
	{
		Q = TaskHash[H]
		if (TaskStateCold === Q[TaskStateKey] || TaskStatePause === Q[TaskStateKey])
		{
			Q[TaskStateKey] = TaskStatePlay
			TaskEmitter.emit(TaskOnStateChange,H,TaskStatePlay)
			TaskDispatch()
			TaskUpdateProcessing()
		}
	},
	TaskPause = function(H,Q)
	{
		Q = TaskHash[H]
		if (TaskStatePlay === Q[TaskStateKey])
		{
			Q[TaskStateKey] = TaskStatePause
			TaskEmitter.emit(TaskOnStateChange,H,TaskStatePause)
			TaskDispatch()
			TaskUpdateProcessing()
		}
	},
	TaskEnd = function(Q)
	{
		TaskPause(Q)
		TaskRemove(Q,TaskOnProcessingEnd)
		TaskEmitter.emit(TaskOnStateChange,Q,undefined)
	},
	TaskOnline = [],
	TaskOnlineHash = {},
	TaskDownload = function(B,R)
	{
		B = ZED.Downloader(B)
			.on('connected',function()
			{
				R.push(true)
			})
			.on('drain',function()
			{

			})
			.on('done',function()
			{

			})
			.on('die',function()
			{

			})
		R.push(B)
	},
	TaskBear = function(Q,R)
	{
		R = [Q]
		if (Q[TaskWaveKey])
		{
			R.push(ZED.End.empty)
			TaskDownload(Q[TaskWaveKey],R)
		}
		else
		{
			R.push(DispatchWrap(Q[TaskDispatchKey])(Q[TaskIDKey],Q)
				.start(function(B)
				{
					TaskDownload(Q[TaskWaveKey] =
					{
						request : B[0],
						path : Path.join(Global[GlobalPathKey],B[1]),
						interval : Infinity
					},R)
				},function()
				{
					//TODO
				}))
		}
		return R
	},
	TaskKill = function(Q)
	{
		console.log(Q)
		Q[1].end()
		Q[2] && Q[2].Stop()
	},
	TaskDispatch = function(T,F)
	{
		for (F = TaskOnline.length;F;)
		{
			T = TaskOnline[--F]
			if (TaskStatePause === T[0][TaskStateKey])
			{
				TaskKill(T)
				ZED.delete_(T[0][TaskHashKey],TaskOnlineHash)
				TaskOnline.splice(F,1)
			}
		}

		if (Global[GlobalOnlineKey] < TaskOnline.length)
		{
			for (F = TaskOnline.length;Global[GlobalOnlineKey] < F;)
			{
				TaskKill(T = TaskOnline[--F])
				if (TaskStatePause !== T[0][TaskStateKey])
				{
					T[0][TaskStateKey] = TaskStatePause
					TaskEmitter.emit(TaskOnStateChange,T[0][TaskHashKey],TaskStatePause)
				}
				ZED.delete_(T[0][TaskHashKey],TaskOnlineHash)
			}
			TaskOnline.splice(Global[GlobalOnlineKey])
		}
		else
		{
			for (F = 0;TaskOnline.length < Global[GlobalOnlineKey] && F < TaskStorage.length;++F)
			{
				T = TaskStorage[F]
				if (TaskStatePlay === T[TaskStateKey] && !TaskOnlineHash[T[TaskHashKey]])
				{
					TaskOnlineHash[T[TaskHashKey]] = true
					TaskOnline.push(TaskBear(T))
				}
			}
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
	DomainBilibiliAPI = 'api' + DomainBilibili,
	DomainBilibiliInterface = 'interface' + DomainBilibili,
	URLBilibiliAPPAppkey = '1d8b6e7d45233436',
	URLBilibiliAPPSecretKey = '560c52ccd288fed045859ed18bffd973',
	URLBilibiliAPPAccessKey = 'd83e170b84ddd7c0bb1fa5510087f13d',
	URLBilibiliParam = function(Q,R)
	{
		Q = ZED.Merge(
		{
			access_key : URLBilibiliAPPAccessKey,
			appkey : URLBilibiliAPPAppkey
		},Q)
		R = ZED.Reduce(Q,function(D,F,V)
		{
			D.push(F + '=' + V)
		},[])
		R.sort()
		R = R.join('&')
		return R + '&sign=' + ZED.toLower(ZED.Code.MD5(R + URLBilibiliAPPSecretKey))
	},
	URLBilibiliUser = ZED.URLBuild(HTTP,DomainBilibiliSpace,'ajax/member/getSubmitVideos?mid=',undefined,'&page=',undefined,'&pagesize=',undefined),
	URLBilibiliView = ZED.URLBuild(HTTP,DomainBilibiliAPI,'view?id=',undefined,'&batch=1&appkey=20bee1f7a18a425c&type=json'),
	URLBilibiliPlayURL = function(Q)
	{
		return DomainBilibiliInterface + 'playurl?' + URLBilibiliParam(
		{
			cid : Q,
			quality : 3,
			otype : 'json'
		})
	},
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
	BilibiliDispatch = DispatchWrap(function(Q)
	{
		return RequestJSON(URLBilibiliView(Q))
			.flatMap(function(Q)
			{
				return ZED.isArray(Q.list) ?
					Observable.from(Q.list)
						.flatMapOnline(1,function(Q)
						{
							return RequestJSON(URLBilibiliPlayURL(Q))
								.map(function(Q)
								{
								})
						}) :
					Observable.throw('No provided cid list')
			})
	}),
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
	//		Youtube
	YoutubeDispatch = DispatchWrap(function()
	{

	}),
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
	//		Niconico
	NiconicoDispatch = DispatchWrap(function()
	{

	}),
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
			'html,body{margin:0;padding:0;background:#F7F7F7;font-size:14px;overflow:hidden}' +
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
				'right:34px;' +
				'padding:0 5px;' +
				'background:#007ACC;' +
				'color:#FFF;' +
				'min-width:8px;' +
				'height:18px;' +
				'line-height:18px;' +
				'font-size:10px;' +
				'border-radius:20px;' +
				'text-align:center' +
			'}' +
			'#/N/ ./U/{top:0}' +
			'#/N/ ./D/{bottom:0}' +
			'#/S/{position:relative;width:/s/px;overflow-y:auto}' +
			'#/S/>div{height:100%}' +
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
				'#/R/ ./C/{margin:/p/px}' +
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
				'#/R/ fieldset span{font-size:12px;cursor:auto}',
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
		Content : function(Q,Index)
		{
			var
			ID,Jump,Dispatch,

			Input = ShowByRock(ClassInput,true,input).attr('placeholder','URL').val('http://space.bilibili.com/374377'),
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
					case TaskStatePlay :
					case TaskStatePause :
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
						Say = 'Processing'
						Class = ClassWaveOn
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
			Waving = function(ID,Card,W,Title)
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
								TaskColdOn(Dispatch,ID,Title),
								Now = TaskStateCold
							)
					}
					L === Now || WaveDisplay(ID,Card,W,L,Now)
				};

				Now = Now && Now[TaskStateKey]
				Go[TaskHashKey] = TaskGenHash(Dispatch,ID)
				Go[TaskDispatchKey] = function(Q)
				{
					if (TaskStateDone === Q) StartAt = Q
					WaveDisplay(ID,Card,W,Now,Now = Q)
				}
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
					Waving(V[ListCardIDKey],F,W,V[ListCardTitleKey])
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

			Observable.fromEmitter(Button,click)
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
				SC.on(F,NSMakeIndex(Index,ZED.invokeAlways(ZED.invokeProp,click,ZED.nth(V,T))))
			})

			TaskEmitter.on(TaskOnStateChange,function(H,Q)
			{
				ZED.each(function(V)
				{
					if (H === V[TaskHashKey])
					{
						V[TaskDispatchKey](Q)
						return false
					}
				},Wave)
			})

			SC.on('ctrl+a',null,NSMakeIndex(Index,ZED.invokeAlways(ZED.each,ZED.call_(ZED.__,true),Wave)))
				.on('ctrl+shift+a',null,NSMakeIndex(Index,ZED.invokeAlways(ZED.each,ZED.call_(ZED.__,false),Wave)))
		}
	},{
		Tab : $(div).append
		(
			'Processing',
			ProcessingUp,
			ProcessingDown
		),
		CSS : function(ID,W,H)
		{
			return ZED.Replace
			(
				'#/R/ ./C/{height:/h/px}' +
				'#/R/ ./V/{padding-top:/p/px;border-bottom:1px solid #E4E4E4}' +
				'#/R/ ./V/>*{vertical-align:middle}' +
				'#/R/ ./T/,#/R/ ./S/{margin-left:/p/px;width:/w/px}' +
				'#/R/ ./T/{/i/;overflow:hidden;font-size:15px;white-space:nowrap;text-overflow:ellipsis}' +
				'#/R/ ./S/{/i/;font-size:12px}' +
				'#/R/ ./E/,#/R/ ./A/{/i/}' +
				'#/R/ svg{width:16px;height:16px;cursor:pointer}' +
				'#/R/ ./E/{}' +
				'#/R/ ./A/{}' +
				'#/R/ ./P/{margin-top:4px;height:3px;width:0}' +
				'#/R/ ./D/ ./P/{background:/c/}' +
				'#/R/ ./H/ ./P/{background:/l/}',
				'/',
				{
					R : ID,
					C : ClassContent,

					V : ClassOver,
					D : ClassOverCold,
					H : ClassOverHot,
					T : ClassOverTitle,
					w : StageWidth - Padding - Padding - ScrollWidth - 20,
					S : ClassOverState,
					E : ClassOverEnd,
					A : ClassOverAction,
					P : ClassOverProgress,

					p : Padding,
					i : 'display:inline-block',
					h : H - TitleHeight,
					c : ColorCold,
					l : ColorHot
				}
			)
		},
		Show : Redraw(),
		BeforeHide : Redraw(),
		Content : function(Q,Index)
		{
			var
			Q = WithTitle(Q,'Processing'),
			Above = {},
			OverPanelKey = ZED.KeyGen(),
			OverTitleKey = ZED.KeyGen(),
			OverStateKey = ZED.KeyGen(),
			OverActionKey = ZED.KeyGen(),
			OverFigureKey = ZED.KeyGen(),
			OverProgressKey = ZED.KeyGen(),
			OverFigure = function(C,Q,ID,L)
			{
				Q = ZED.Shape(Q).on(click,function(){C(ID)})
				return L ? ShowByRock(L,true).append(Q) : Q
			},
			Over = function(Q)
			{
				var
				Title,
				State,
				Action,
				Progress;

				return Above[Q] || (Above[Q] = ZED.ReduceToObject
				(
					OverTitleKey,Title = ShowByRock(ClassOverTitle,true),
					OverStateKey,State = ShowByRock(ClassOverState,true).html('Ready to be committed'),
					OverActionKey,Action = OverFigure(RollPlay,{Type : 'Tick',Line : '24%',Fill : 'transparent',Stroke : '#6FB139'},Q,ClassOverAction).attr(attrTitle,'Commit'),
					OverFigureKey,
					[
						OverFigure(RollPause,{Type : 'Pause',Padding : '20%'},Q),
						OverFigure(RollPlay,{Type : 'Polygon',General : 3,Padding : '12%',Rotate : -90},Q)
					],
					OverProgressKey,Progress = ShowByRock(ClassOverProgress,true),
					OverPanelKey,ShowByRock(ClassOver,true).append
					(
						Title,
						OverFigure(TaskEnd,{Type : 'X',Line : '20%',Padding : '10%',Fill : 'transparent',Stroke : '#656565'},Q,ClassOverEnd).attr(attrTitle,'Remove'),
						br,
						State,
						Action,
						br,
						Progress
					)
				))
			},
			List = ZED.ListView(
			{
				Scroll : Q,
				Data : TaskStorage,
				Make : function(Q,A,R)
				{
					A = Over(Q[TaskHashKey])
					R = A[OverPanelKey]
					A[OverTitleKey].attr(attrTitle,Q[TaskTitleKey])
					A[OverProgressKey].css('width','50%')//DEBUG
					return R
				}
			}),

			RollAction = function(Q,I,T)
			{
				Q[OverActionKey].attr(attrTitle,T).children().detach()
				Q[OverActionKey].append(Q[OverFigureKey][I])
			},
			RollClass = function(Q,H)
			{
				Q[OverPanelKey].removeClass(H ? ClassOverCold : ClassOverHot).addClass(H ? ClassOverHot : ClassOverCold)
			},
			RollPlay = function(ID,Q)
			{
				Q = Over(ID)
				RollAction(Q,0,'Pause')
				RollClass(Q,true)
				Q[OverStateKey].text('Queuing')
				TaskPlay(ID)
			},
			RollPause = function(ID,Q)
			{
				Q = Over(ID)
				RollAction(Q,1,'Resume')
				RollClass(Q,false)
				Q[OverStateKey].text('Paused')
				TaskPause(ID)
			};

			Q.on('mousedown','svg',function(E)
			{
				ZED.ClearSelection()
				E.stopPropagation()
				E.preventDefault()
			})

			TaskEmitter.on(TaskOnColdAdd,function(Q,A)
			{
				A = Over(Q[TaskHashKey])
				A[OverTitleKey].text(Q[TaskTitleKey])
			}).on(TaskOnColdRemove,function(A)
			{
				A = Over(Q)
				A[OverPanelKey] = EmptyJQuery
			}).on(TaskOnProcessingEnd,function(Q)
			{
				ZED.delete_(Q,Above)
				Index === NS.Index() && List.redraw()
			}).on(TaskOnNotice,ZED.each(function(H,I,A)
			{
				I = H[1]
				Over(H[0])[OverStateKey].text
				(
					A.Total ? ZED.Replace
					(
						'$0$ / $1$, $2$%, $3$/s, -$4$',
						ZED.FormatSize(A.Saved),ZED.FormatSize(A.Total),
						ZED.Format(100 * A.Percentage),
						ZED.FormatSize(1000 * A.Speed),
						ZED.SecondsToString(A.Rest / 1000)
					) : ZED.Replace
					(
						'$0$, $1$/s',
						ZED.FormatSize(A.Saved),
						ZED.FormatSize(1000 * A.Speed)
					)
				)
			}))

			return List
		}
	},{
		Tab : 'History',
		Show : Redraw(),
		BeforeHide : Redraw(),
		Content : function(Q)
		{
			var
			Q = WithTitle(Q,'History'),
			List = ZED.ListView(
			{
				Scroll : Q,
				Data : HistoryStorage,
				Make : function(Q)
				{

				}
			});

			return List
		}
	},{
		Tab : 'Sign in',
		Content : function(Q)
		{
			Q = WithTitle(Q,'Sign in')
		}
	},{
		Tab : 'Setting',
		CSS : function(ID)
		{
			return ZED.Replace
			(
				'#/R/ ./C/{margin:/p/px}',
				'/',
				{
					R : ID,
					C : ClassContent,
					p : Padding
				}
			)
		},
		Content : function(Q)
		{
			Q = WithTitle(Q,'Setting')
			ZED.Preference(
			{
				Set :
				[
					['Path',[{T : 'I'}],GlobalPathKey],
					['Online',[1,2,3,4,5,6,7,8,9,10],GlobalOnlineKey]
				],
				Data : Global,
				Change : GlobalSave,
				Parent : Q
			})
		}
	})

	setInterval(function()
	{
		TaskEmitter.emit(TaskOnNotice,ZED.reduce(function(D,V)
		{
			if (V[3])
			{
				D.push(V[0][TaskHashKey],V[2].Calc())
			}
		},[],TaskOnline))
	},1E3)

	TaskUpdateProcessing()

	Rainbow.append(Navi,Stage)

	ZED(function()
	{
		$('body').append(Rainbow)
		ipcRenderer.send('Rainbow')
	})
}()