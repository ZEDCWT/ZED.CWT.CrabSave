~function()
{
	var
	NAME = 'VideoSiteTool',

	undefined,
	True = !undefined,
	False = !True,
	Null = null,
	x00 = 0x00,
	x01 = 0x01,
	x02 = 0x02,
	x03 = 0x03,
	x04 = 0x04,
	x05 = 0x05,
	//x06 = 0x06,
	//x07 = 0x07,
	//x08 = 0x08,
	//x09 = 0x09,
	x0A = 0x0A,
	//x0B = 0x0B,
	x0C = 0x0C,
	x0D = 0x0D,
	//x0E = 0x0E,
	//x0F = 0x0F,
	//x10 = 0x10,
	//x13 = 0x13,
	x14 = 0x14,
	//x16 = 0x16,
	//x18 = 0x18,
	x1E = 0x1E,
	//x24 = 0x24,
	x32 = 0x32,
	//x64 = 0x64,
	//x0100 = x10 * x10,
	m01 = -x01,
	Thousand = 1E3,
	Infinity = x01 / x00,
	NaN = x00 / x00,
	EmptyString = '',
	StringSpace = ' ',
	StringDot ='.',
	StringSolidus = '/',
	//StringColon = ':',
	//ColonSplit = StringSpace + StringColon + StringSpace,
	charI = 'I',
	chara = 'a',
	//EmptyFunction = function(){},
	EmptyObject = {},

	KeyEnter = x0D,

	url = 'url',
	title = 'title',



	ZED = require('@zed.cwt/zedquery'),
	CSS = ZED.CSS,
	CSSMulti = ZED.CSSMulti,
	Mark = ZED.Mark,
	__ = ZED.__,
	curry = ZED.curry,
	always = ZED.always,
	each = ZED.each,
	map = ZED.map,
	reduce = ZED.reduce,
	nth = ZED.nth,
	head = ZED.head,
	last = ZED.last,
	compose = ZED.compose,
	pipe = ZED.pipe,
	flip = ZED.flip,
	bind = ZED.bind_,
	call = ZED.call_,
	apply = ZED.apply_,
	constructN = ZED.constructN,
	nAry = ZED.nAry,
	binary = ZED.binary,
	identity = ZED.identity,
	path = ZED.path,
	add = ZED.add,
	max = ZED.max,
	maxBy = ZED.maxBy,
	min = ZED.min,
	args = ZED.args,
	nthArg = ZED.nthArg,
	has = ZED.has,
	prop = ZED.prop,
	propSatisfies = ZED.propSatisfies,
	objOf = ZED.objOf,
	trim = ZED.trim,
	test = ZED.test,
	replace = ZED.replace,
	propEq = ZED.propEq,
	all = ZED.all,
	when = ZED.when,
	unless = ZED.unless,
	iif = ZED.iif,
	find = ZED.find,
	range = ZED.range,
	replaceList = ZED.replaceList,
	isFunction = ZED.isFunction,
	isNumber = ZED.isNumber,
	isDate = ZED.isDate,
	Map = ZED.Map,
	Reduce = ZED.Reduce,
	Merge = ZED.Merge,
	ReduceToObject = ZED.ReduceToObject,
	Args = ZED.Args,
	KeyGen = ZED.KeyGen,
	Code = ZED.Code,
	PageToken = Code.PageToken,
	DateToString = ZED.DateToString,
	//Storage = ZED.Storage,
	URLBuild = ZED.URLBuild,
	Lang = ZED.Lang(),
	ShortCut = ZED.ShortCut(),
	//Select = ZED.Select,
	Preference = ZED.Preference,
	Tips = compose(ZED.Tips,Lang),
	EazyLog = ZED.EazyLog,
	Replace = ZED.Replace,

	$ = ZED.jQuery,
	fn = $.fn,
	jClick = fn.click,
	jVal = fn.val,
	window = ZED.global,

	noary = nAry(x00),
	WhenEnter = when(propEq('keyCode',KeyEnter)),
	TipsAlways = compose(binary(compose)(Tips),always),

	JSON = window.JSON,
	JSONParse = JSON.parse,
	JTO = function(Q)
	{
		try{return JSONParse(Q)}
		catch(e){}
		return {}
	},
	OTJ = JSON.stringify,



	Number = window.Number,
	Date = window.Date,

	Math = window.Math,
	floor = Math.floor,
	ceil = Math.ceil,

	setTimeout = window.setTimeout,
	clearTimeout = window.clearTimeout,

	Electron = require('electron'),
	Remote = Electron.remote,



	div = '<div>',
	span = '<span>',
	input = '<input>',
	br = '<br>',
	img = '<img>',
	fieldset = '<fieldset>',
	legend = '<legend>',

	tagA = chara,
	tagInput = 'input',

	attrID = 'id',
	attrClass = 'class',
	attrSrc = 'src',
	attrWidth = 'width',
	attrHref = 'href',
	attrStyle = 'style',
	attrPlaceholder = 'placeholder',

	//styleTransparent = 'transparent',

	//mousedown = 'mousedown',
	click = 'click',
	keyup = 'keyup',
	eventInput = tagInput,

	color$ = '#2672EC',
	colorFill = '#F7F7F7',
	colorStroke = '#5A5A5A',
	colorShadow = '#222',

	ClassPrefix = 'ZED',
	SelectorPrefix = StringDot + ClassPrefix,
	ClassInput = ClassPrefix + 'Input',
	ClassButton = ClassPrefix + 'Button',
	ClassScroll = ClassPrefix + 'Scroll',
	ClassVerticalMiddle = ClassPrefix + 'VerticalMiddle',
	ClassSelect = ClassPrefix + 'Select',
	SelectorPreference = SelectorPrefix + 'Preference',
	SelectorPreferenceTitle = SelectorPreference + 'Title',
	SelectorPreferenceContent = SelectorPreference + 'Content',
	IDTips = ClassPrefix + 'Tips',

	PreferenceFunctionKey = 'Func',
	PreferenceInput = {T : charI},
	PreferenceInputNumber = Merge({N : True},PreferenceInput),



	Best = function(Q)
	{
		return reduce(maxBy(prop(Q)),objOf(Q,-Infinity))
	},
	BestQulity = Best(attrWidth),

	PropUpdate = function(Q,K)
	{
		return Q[K] || (Q[K] = {})
	},

	//Logger Date
	LoggerMerge = curry(Reduce,x03)(__,function(D,F,V)
	{
		has(F,D) && V(D[F])
	}),

	FriendlyDate = pipe
	(
		unless(isDate,constructN(x01,Date)),
		binary(DateToString)('%YYYY%.%MM%.%DD%.%HH%.%NN%.%SS%')
	),



	ShowByRock = function(V,J,T)
	{
		return $(T || div).attr(J ? attrClass : attrID,V)
	},
	ShowByButton = function(Text,Click,T,V,J)
	{
		return ShowByRock(V,J,T).addClass(ClassButton).on(click,Click).text(Text)
	},



	ProtocolSuffix = StringSolidus + StringSolidus,
	Protocol = 'http:' + ProtocolSuffix,
	ProtocolSecurity = 'https:' + ProtocolSuffix,
	RequestGET = 'GET',
	RequestPOST = 'POST',
	RequestTotalKey = KeyGen(),
	RequestSuccKey = KeyGen(),
	RequestFailKey = KeyGen(),
	RequestLostKey = KeyGen(),
	RequestState = ReduceToObject
	(
		RequestTotalKey,x00,
		RequestSuccKey,x00,
		RequestFailKey,x00,
		RequestLostKey,x00
	),
	RequestLogger,
	RequestTimeout = x1E * Thousand,
	RequestAbortMark = Mark(),
	//Cross domain ajax
	API = function(Q,A,T)
	{
		Q = Args(arguments,'function,S,E,C;object,D;string,U,T,D;boolean,B')
		RequestLogger[RequestTotalKey](++RequestState[RequestTotalKey])
		A = $.ajax(
		{
			url : test(/\w+:\/\//,Q.U) ? Q.U : Protocol + Q.U,
			type : Q.T || (Q.D ? RequestPOST : RequestGET),
			data : Q.D,
			dataType : 'text',
			timeout : RequestTimeout << x02,
			success : function(B)
			{
				clearTimeout(T)
				RequestLogger[RequestSuccKey](++RequestState[RequestSuccKey])
				Q.B || (B = JTO(B))
				Q.S && Q.S(B)
				Q.C && Q.C()
			},
			error : function()
			{
				if (T !== T) return
				clearTimeout(T)
				RequestLogger[RequestFailKey](++RequestState[RequestFailKey])
				Q.E && Q.E()
				Q.C && Q.C()
			}
		})
		T = setTimeout(function()
		{
			T = NaN
			RequestLogger[RequestLostKey](++RequestState[RequestLostKey])
			A.abort()
			Q.E && Q.E(RequestAbortMark)
			Q.C && Q.C()
		},RequestTimeout)
		return A
	},
	API3 = curry(API,x03),



	WordASC = Lang('ASC',EmptyString),
	WordDESC = Lang('DESC',EmptyString),
	WordInitialize = Lang('Initialize',EmptyString),
	WordOrder = Lang('Order',EmptyString),

	LangNetwork = Lang(Replace
	(
		'Network State\nTry : ,$0$,. Success : ,$1$,. Fail : ,$2$,. Lost : ,$3$',
		RequestTotalKey,RequestSuccKey,
		RequestFailKey,RequestLostKey
	),EmptyString),
	LangInitFail = Lang('Failed to initialize info., please try again',EmptyString),
	LangInitError = Lang('Data got, though, not as expected'),
	LangPageError = Lang('Failed to get page data, you may want to try again'),

	LangInputURL = Lang('Input URL',EmptyString),
	LangPageSize = Lang('Page size',EmptyString),

	LangTryPage = Lang('Try to get page $0$',EmptyString),

	LangUserVideo = Lang('User videos',EmptyString),
	LangChannelVideo = Lang('Channel videos',EmptyString),



	IDRainbow = KeyGen(),
	IDPref = KeyGen(),
	IDURL = KeyGen(),
	IDInit = KeyGen(),
	IDInfo = KeyGen(),
	IDList = KeyGen(),

	Rainbow = ShowByRock(IDRainbow),
	PanelPref = ShowByRock(IDPref),
	InputURL = ShowByRock(ClassInput,True,input)
		.attr(attrID,IDURL)
		.attr(attrPlaceholder,Lang(LangInputURL)),
	ButtonInit = ShowByButton(Lang(WordInitialize),undefined,div,IDInit),
	PanelInfo = ShowByRock(IDInfo),
	PanelList = ShowByRock(IDList),

	ScrollWidth = x0C,
	MainPercent = .75,
	MainMin = 3E2,
	MainWidth,
	MainMargin = x14,
	Padding = x04,
	TwicePadding = x02 * Padding,
	ViewCardWidth = 2E2,

	BoxShadow = 'box-shadow',
	DefaultBoxShadow = CSSMulti(BoxShadow,'1px 1px 5px ' + colorShadow),


	Pegasus = Remote.getGlobal('Pegasus'),
	Setting = Pegasus.Setting,
	Config = Pegasus.Config,



	//	Toolbox Keys
	ToolNameKey = KeyGen(),
	ToolJudgeKey = KeyGen(),
	ToolNailKey = KeyGen(),
	NailNameKey = KeyGen(),
	NailIDKey = KeyGen(),
	NailInitKey = KeyGen(),
	NailKey = KeyGen(),
	NailKey = KeyGen(),
	NailInitFailDefault = TipsAlways(LangInitFail),



	//	Queue
	DispatchStorage = {},
	Dispatch = function(Q,R)
	{
		return isFunction(Q) ?
		(
			DispatchStorage[R = KeyGen()] = Q,
			R
		) : DispatchStorage[Q]
	},
	QueueStorage = {},
	QueueStorageList = [],
	Queue = function(ID,Action,Do,K)
	{
		K = ID + StringSpace + Action
		return undefined === Do ?
			QueueStorage[K] :
			Do ?
				(QueueStorage[K] = [ID,Action]) :
				(delete QueueStorage[K])
	},



	//	List render
	ListPageKey = KeyGen(),
	ListPageTotalKey = KeyGen(),
	ListOrderKey = KeyGen(),//FalseLike : DESC
	ListCountKey = KeyGen(),
	ListDispatchKey = KeyGen(),
	ListCardKey = KeyGen(),
	ListCardIDKey = KeyGen(),
	ListCardIDDisplayKey = KeyGen(),//Optional
	ListCardNoKey = KeyGen(),
	ListCardImgKey = KeyGen(),
	ListCardTitleKey = KeyGen(),
	ListCardAuthorKey = KeyGen(),
	ListCardDateKey = KeyGen(),
	_ListFromKey = KeyGen(),
	_ListToKey = KeyGen(),
	_ListLengthKey = KeyGen(),
	_ListOrderKey = KeyGen(),
	LangListHint = Lang(Replace
	(
		'Page ,$0$, / ,$1$, | ,$2$, ~ ,$3$, | ,$4$, in ,$5$, ,$6$',
		ListPageKey,ListPageTotalKey,
		_ListFromKey,_ListToKey,
		_ListLengthKey,ListCountKey,
		_ListOrderKey
	),EmptyString),
	PanelListLogger = $(div),
	ListLogger = EazyLog(Lang(LangListHint),PanelListLogger,True),
	ListPagerGet,
	ListPagerID,
	ListPageDo = function(P)
	{
		Tips(Replace(Lang(LangTryPage),P))
		ListPagerGet(ListPagerID,P)
	},
	ClassListView = KeyGen(),
	IDListIndicator = KeyGen(),
	ListIndicatorPanel = ShowByRock(IDListIndicator),
	ListIndicatorSingle = function(Q,N,P,J,D,R)
	{
		isFunction(Q) || (Q = add(Q))
		isFunction(N) || (N && (N = always(N)))
		ListIndicatorPanel.append(D = $(div).append(R = $(span)).on(click,function()
		{
			J && ListPageDo(P)
		}))
		return function(Now,Total)
		{
			P = Q(Now,Total)
			P === Now || P < x00 || Total < P ?
			(
				J = False,
				D.hide()
			) : (
				J = True,
				R.text(N ? N(Now,Total) : P),
				D.removeAttr(attrStyle)
			)
		}
	},
	ListIndicatorList = function(L,R)
	{
		return compose(each(__,map(ListIndicatorSingle,range(L,R))),flip(apply),args)
	},
	ListIndicator =
	[
		ListIndicatorSingle(always(x00),'0<<'),
		ListIndicatorSingle(m01,'<'),
		ListIndicatorList(-x04,x00),
		function(R)
		{
			ListIndicatorPanel.append(R = ShowByRock(ClassInput,True,input))
			R.on(eventInput,function(K,T)
			{
				test(/\D/,T = R.val()) && R.val(replace(/\D/,EmptyString,T))
			}).on(keyup,WhenEnter(compose(ListPageDo,bind(noary(jVal),R))))
			return bind(jVal,R)
		}(),
		ListIndicatorList(x01,x05),
		ListIndicatorSingle(x01,'>'),
		ListIndicatorSingle(nthArg(x01),compose(add('>>'),nthArg(x01)))
	],
	ListPager = function(Now,Total,Get,ID)
	{
		ListPagerGet = Get
		ListPagerID = ID

		each(call(__,Now,Total),ListIndicator)
	},
	ListLast,
	ListIndex = compose(unless(isNumber,always('-')),path([ListCardNoKey])),
	ClassCardOn = KeyGen(),
	CardSwitchStorage = [],
	CardSwitch = function(R,ID,Action,C)
	{
		R = ZED(R)
		Queue(ID,Action) && R.addClass(ClassCardOn)
		CardSwitchStorage.push(C = function(Q)
		{
			undefined === Q && (Q = !Queue(ID,Action))
			Queue(ID,Action,Q)
			R[Q ? 'addClass' : 'RemoveClass'](ClassCardOn)
		})
		R.on(click,'img',noary(C))
		return R
	},
	List = function(Q,Get,ID)
	{
		var
		R = $(div),
		CardView = ShowByRock(ClassListView,True),
		CardData = Q[ListCardKey],
		From = ListIndex(head(CardData)),
		To = ListIndex(last(CardData));

		--Q[ListPageTotalKey]

		LoggerMerge(ListLogger,Q)
		LoggerMerge(ListLogger,ReduceToObject
		(
			_ListFromKey,From,
			_ListToKey,To,
			_ListLengthKey,all(isNumber,[From,To]) ? To - From + x01 : x00,
			_ListOrderKey,Lang(Q[ListOrderKey] ? WordASC : WordDESC)
		))

		CardSwitchStorage.splice(x00)
		each(function(V,R)
		{
			CardView.append
			(
				R = $(fieldset).append
				(
					$(legend).text(V[ListCardNoKey] +' | ' + (V[ListCardIDDisplayKey] ? V[ListCardIDDisplayKey](V[ListCardIDKey]) : V[ListCardIDKey])),
					$(img).attr(attrSrc,V[ListCardImgKey]).attr(title,V[ListCardTitleKey]),
					$(div).text(V[ListCardTitleKey]),
					$(div).text(V[ListCardAuthorKey]),
					$(div).text(FriendlyDate(V[ListCardDateKey]))
				)
			)
			CardSwitch(R,V[ListCardIDKey],Q[ListDispatchKey])
		},CardData)

		ListPager(Q[ListPageKey],Q[ListPageTotalKey],Get,ID)

		R.append(PanelListLogger,CardView,ListIndicatorPanel)
		ListLast && ListLast.detach()
		PanelList.append(ListLast = R)
	},
	ListFailed = TipsAlways(LangPageError),



	//	Settings and others
	GlobalURL = EmptyString,
	GlobalPageSizeKey = KeyGen(),
	GlobalOrderKey = KeyGen(),
	GlobalOrderASC = Mark(),
	GlobalOrderDESC = Mark(),
	Global = ReduceToObject
	(
		GlobalPageSizeKey,5,//x1E,TODO
		GlobalOrderKey,GlobalOrderDESC
	),

	//	URLs
	www = 'www',
	com = compose(add(__,'.com/'),add(StringDot)),
	//		Youtube
	GoogleAPIKey = 'AIzaSyA_ltEFFYL4E_rOBYkQtA8aKHnL5QR_uMA',
	GoogleAPIDomain = com('googleapis'),
	GoogleAPIDomainWWW = www + GoogleAPIDomain,
	GoogleAPIYoutube = GoogleAPIDomainWWW + 'youtube/v3/',
	GoogleAPIYoutubeChannel = URLBuild(ProtocolSecurity,GoogleAPIYoutube,'channels?part=contentDetails&id=',undefined,'&key=',GoogleAPIKey),
	GoogleAPIYoutubeChannelFromUser = URLBuild(ProtocolSecurity,GoogleAPIYoutube,'channels?part=contentDetails&forUsername=',undefined,'&key=',GoogleAPIKey),
	GoogleAPIYoutubePlaylist = URLBuild(ProtocolSecurity,GoogleAPIYoutube,'playlistItems?part=snippet%2CcontentDetails&playlistId=',undefined,'&pageToken=',undefined,'&maxResults=',undefined,'&key=',GoogleAPIKey),
	items = 'items',
	snippet = 'snippet',
	position = 'position',
	contentDetails = 'contentDetails',
	pageInfo = 'pageInfo',

	//		Bilibili
	BilibiliDomain = com('bilibili'),
	BilibiliSpace = 'space' + BilibiliDomain,
	BilibiliSubmit = URLBuild(BilibiliSpace,'ajax/member/getSubmitVideos?mid=',undefined,'&page=',undefined,'&pagesize=',undefined),



	//	Sites
	//		Youtube
	YoutubePlaylist = function(ID,Page)
	{
		var
		PageSize = Global[GlobalPageSizeKey];

		API
		(
			GoogleAPIYoutubePlaylist(ID,PageToken(PageSize * (Page = Page || x00)),PageSize),
			function(Q)
			{
				var
				Total = path([pageInfo,'totalResults'],Q),
				R = ReduceToObject
				(
					ListPageKey,Page,
					ListPageTotalKey,ceil(Total / PageSize),
					ListCountKey,Total,
					ListDispatchKey,YoutubeDispatch,
					ListCardKey,map(function(V)
					{
						return ReduceToObject
						(
							ListCardNoKey,path([snippet,position],V),
							ListCardIDKey,path([contentDetails,'videoId'],V),
							ListCardImgKey,BestQulity(path([snippet,'thumbnails'],V))[url],
							ListCardTitleKey,path([snippet,title],V),
							ListCardAuthorKey,path([snippet,'channelTitle'],V),
							ListCardDateKey,path([snippet,'publishedAt'],V)
						)
					},Q[items])
				);

				List(R,YoutubePlaylist,ID)
			},
			ListFailed
		)
	},
	YoutubeInitDeal = pipe
	(
		path([items,x00,contentDetails,'relatedPlaylists','uploads']),
		iif
		(
			identity,
			YoutubePlaylist,
			compose(Tips,always(LangInitError)),
			x01
		)
	),
	YoutubeInit = binary(compose(API3(__,YoutubeInitDeal,NailInitFailDefault),call)),
	YoutubeDispatch = Dispatch(function(ID,CB)
	{

	}),

	//		Bilibili
	BilibiliSubmitList = function(ID,Page)
	{
		var
		PageSize = Global[GlobalPageSizeKey];

		Page = Number(Page) || x00
		API
		(
			BilibiliSubmit(ID,x01 + Page,PageSize),
			function(Q,R)
			{
				Q = Q.data || EmptyObject
				R = ReduceToObject
				(
					ListPageKey,Page,
					ListPageTotalKey,Q.pages,
					ListCountKey,Q.count,
					ListDispatchKey,BilibiliDispatch,
					ListCardKey,Map(Q.vlist,function(F,V)
					{
						return ReduceToObject
						(
							ListCardNoKey,F + Page * PageSize,
							ListCardIDKey,V.aid,
							ListCardIDDisplayKey,add('av'),
							ListCardImgKey,V.pic,
							ListCardTitleKey,V[title],
							ListCardAuthorKey,V.author,
							ListCardDateKey,replaceList([StringSpace,'T',/$/,'+0800'],V.created)
						)
					})
				)
				List(R,BilibiliSubmitList,ID)
			},
			ListFailed
		)
	},
	BilibiliDispatch = Dispatch(function(ID,CB)
	{

	}),



	//	Toolbox
	ToolBox = [ReduceToObject
	(
		ToolNameKey,'Youtube',
		ToolJudgeKey,/\.youtu\.?be\./i,
		ToolNailKey,[ReduceToObject
		(
			NailNameKey,LangUserVideo,
			NailIDKey,/user\/([^\/]+)/i,
			NailInitKey,YoutubeInit(GoogleAPIYoutubeChannelFromUser)
		),ReduceToObject
		(
			NailNameKey,LangChannelVideo,
			NailIDKey,/channel\/([^\/]+)/i,
			NailInitKey,YoutubeInit(GoogleAPIYoutubeChannel)
		)]
	),ReduceToObject
	(
		ToolNameKey,'Bilibili',
		ToolJudgeKey,/\.bilibili\./i,
		ToolNailKey,[ReduceToObject
		(
			NailNameKey,LangUserVideo,
			NailIDKey,/space[^\/]+\/(\d+)/i,
			NailInitKey,BilibiliSubmitList
		)]
	)],



	GetList = function()
	{
		var
		Tool,
		T,F;

		GlobalURL = InputURL.val()
		Tool = find(propSatisfies(test(__,GlobalURL),ToolJudgeKey),ToolBox) || ToolBox[x00]
		Tool = Tool[ToolNailKey]
		for (F = Tool.length;F;)
			if (T = GlobalURL.match(Tool[--F][NailIDKey]))
				break
		T = T ? T[x01] : EmptyString
		Tool[F][NailInitKey](T)
	};

	CSS(NAME,function(W,H,CardWidth)
	{
		W -= ScrollWidth
		MainWidth = min(max(MainMin,MainPercent * W),W)
		CardWidth = MainWidth / max(x01,ceil(MainWidth / (ViewCardWidth + TwicePadding))) - TwicePadding
		return Replace
		(
			'*{font-weight:bold;/b/}' +
			'html,body{margin:0;padding:0;background:/cf/;color:/cs/;text-align:center;font-size:14px}' +
			'input,textarea{color:/cs/;max-width:/r/px}' +
			'input:focus{outline:1px solid /c$/}' +
			'fieldset{min-width:0}' +
			'legend{padding:0}' +

			'#/R/{/db/;margin-top:20px;width:/r/px;word-break:break-word}' +
			'#/R/>div>*{margin:10px 0}' +
			'#/E/ /P/{text-align:center}' +
			'#/U/{width:100%}' +
			'./L/ fieldset' +
			'{' +
				'/db/;' +
				'margin:/p/px;' +
				'padding:/p/px;' +
				'width:/c/px;' +
				'border:solid transparent;' +
				'border-width:0 0 10px;' +
				'text-align:left;' +
				'vertical-align:top;' +
				'/r4/;/s/;' +
			'}' +
			'./L/ legend{text-align:left}' +
			'./L/ img{width:100%;cursor:pointer}' +
			'./N/{border-color:/c$//i/}' +
			'#/I/ div,#/I/ input{/db/;margin:/p/px;padding:0 13px;line-height:30px;/r4/;/s/}' +
			'#/I/ div{cursor:pointer}' +
			'#/I/ input{width:80px;text-align:center}' +
			'#/I/ div:hover{background:/c$/;color:/cf/}',
			StringSolidus,
			{
				P : SelectorPreference,

				R : IDRainbow,
				r : MainWidth,
				E : IDPref,
				U : IDURL,
				G : IDInit,

				L : ClassListView,
				c : CardWidth,
				N : ClassCardOn,
				I : IDListIndicator,

				m : MainMargin,
				p : Padding,
				db : 'display:inline-block',
				r4 : CSSMulti('border-radius','4px'),
				b : CSSMulti('box-sizing','border-box'),
				s : DefaultBoxShadow,
				i : '!important',

				c$ : color$,
				cf : colorFill,
				cs : colorStroke
			}
		)
	})

	Preference(
	{
		Set :
		[
			[
				Lang(LangPageSize),
				[x05,x0A,x14,x1E,x32,PreferenceInputNumber],
				GlobalPageSizeKey
			],
			[
				Lang(WordOrder),
				[
					[Lang(WordDESC),GlobalOrderDESC],
					[Lang(WordASC),GlobalOrderASC]
				],
				GlobalOrderKey
			]
		],
		Data : Global,
		Parent : PanelPref
	})

	RequestLogger = EazyLog(Lang(LangNetwork),PanelInfo,RequestState,True)

	Rainbow.append
	(
		PanelPref.prepend
		(
			InputURL.on(keyup,WhenEnter(GetList)),
			ButtonInit.on(click,GetList)
		),
		PanelInfo,
		PanelList
	)

	$(function(T)
	{
		T = ListIndicatorPanel.children()
		each(function(V)
		{
			ShortCut.on(V[x01],undefined,bind(noary(jClick),$(nth(V[x00],T))))
		},[
			[x00,'h'],
			[x01,'j'],
			[-x02,'k'],
			[m01,'l']
		])
		ShortCut
		.on('a',Null,compose(each(call(__,True)),always(CardSwitchStorage)))
		.on('c',Null,compose(each(call(__,False)),always(CardSwitchStorage)))
		$('body').addClass(ClassScroll).append(Rainbow)
	})

	ZED.Merge(window,
	{
		_ : ZED
	})

InputURL.val('http://space.bilibili.com/13046')
ZED.onError = compose(bind(console.error,console),prop('stack'))
}()