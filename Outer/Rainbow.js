~function(window)
{
	var
	NAME = 'VideoSiteTool',

	undefined,
	True = !undefined,
	//False = !True,
	//Null = null,
	x00 = 0x00,
	x01 = 0x01,
	x02 = 0x02,
	//x03 = 0x03,
	x04 = 0x04,
	x05 = 0x05,
	//x06 = 0x06,
	//x07 = 0x07,
	//x08 = 0x08,
	//x09 = 0x09,
	x0A = 0x0A,
	//x0B = 0x0B,
	//x0C = 0x0C,
	x0D = 0x0D,
	//x0E = 0x0E,
	//x0F = 0x0F,
	//x10 = 0x10,
	x13 = 0x13,
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



	$ = window.jQuery = require('./JQuery'),
	ZED = require('@zed.cwt/zedquery'),
	CSS = ZED.CSS,
	//CSSMulti = ZED.CSSMulti,
	Mark = ZED.Mark,
	__ = ZED.__,
	curry = ZED.curry,
	always = ZED.always,
	each = ZED.each,
	map = ZED.map,
	reduce = ZED.reduce,
	head = ZED.head,
	last = ZED.last,
	compose = ZED.compose,
	pipe = ZED.pipe,
	identity = ZED.identity,
	path = ZED.path,
	trim = ZED.trim,
	propEq = ZED.propEq,
	when = ZED.when,
	iif = ZED.iif,
	find = ZED.find,
	range = ZED.range,
	isDate = ZED.isDate,
	isFunction = ZED.isFunction,
	Reduce = ZED.Reduce,
	Merge = ZED.Merge,
	ReduceToObject = ZED.ReduceToObject,
	Args = ZED.Args,
	KeyGen = ZED.KeyGen,
	Code = ZED.Code,
	PageToken = ZED.PageToken,
	DateToString = ZED.DateToString,
	//Storage = ZED.Storage,
	URLBuild = ZED.URLBuild,
	Lang = ZED.Lang(),
	//Select = ZED.Select,
	Preference = ZED.Preference,
	Logger = ZED.Logger,
	Tips = compose(ZED.Tips,Lang),
	EazyLog = ZED.EazyLog,
	Replace = ZED.Replace,



	JSON = window.JSON,
	JSONParse = JSON.parse,
	JTO = function(Q)
	{
		try{return JSONParse(Q)}
		catch(e){}
		return {}
	},
	OTJ = JSON.stringify,



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
	attrPlaceholder = 'placeholder',

	//styleTransparent = 'transparent',

	//mousedown = 'mousedown',
	click = 'click',

	color$ = '#2672EC',
	colorFill = '#F7F7F7',
	colorStroke = '#5A5A5A',
	//colorShadow = '#222',

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



	BestQulity = function(Q,T)
	{
		T = T || attrWidth
		return reduce(function(D,V)
		{
			return D && V[T] < D[T] ? D : V
		},EmptyObject,Q)
	},

	PropUpdate = function(Q,K)
	{
		return Q[K] || (Q[K] = {})
	},

	//Logger Date
	LoggerMerge = curry(Reduce,x03)(__,function(D,F,V)
	{
		has(F,D) && V(D[F])
	}),

	FriendlyDate = function(Q)
	{
		isDate(Q) || (Q = new Date(Q))
		return DateToString(Q).substr(x00,x13)
	},



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
			url : Q.U,
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

	LangInputURL = Lang('Input URL',EmptyString),
	LangPageSize = Lang('Page size',EmptyString),

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



	Config = Remote.getGlobal('Config'),



	GlobalURL = EmptyString,
	GlobalPageSizeKey = KeyGen(),
	GlobalOrderKey = KeyGen(),
	GlobalOrderASC = Mark(),
	GlobalOrderDESC = Mark(),
	Global = ReduceToObject
	(
		GlobalPageSizeKey,x1E,
		GlobalOrderKey,GlobalOrderDESC
	),

	GoogleAPIKey = 'AIzaSyA_ltEFFYL4E_rOBYkQtA8aKHnL5QR_uMA',
	GoogleAPIDomain = '.googleapis.com/',
	GoogleAPIDomainWWW = 'www' + GoogleAPIDomain,
	GoogleAPIYoutube = GoogleAPIDomainWWW + 'youtube/v3/',
	GoogleAPIYoutubeChannel = URLBuild(ProtocolSecurity,GoogleAPIYoutube,'channels?part=contentDetails&id=',undefined,'&key=',GoogleAPIKey),
	GoogleAPIYoutubeChannelFromUser = URLBuild(ProtocolSecurity,GoogleAPIYoutube,'channels?part=contentDetails&forUsername=',undefined,'&key=',GoogleAPIKey),
	GoogleAPIYoutubePlaylist = URLBuild(ProtocolSecurity,GoogleAPIYoutube,'playlistItems?part=snippet%2CcontentDetails&playlistId=',undefined,'&pageToken=',undefined,'&maxResults=',undefined,'&key=',GoogleAPIKey),
	items = 'items',
	snippet = 'snippet',
	position = 'position',
	contentDetails = 'contentDetails',
	pageInfo = 'pageInfo',



	//	Toolbox Keys
	ToolNameKey = KeyGen(),
	ToolJudgeKey = KeyGen(),
	ToolNailKey = KeyGen(),
	NailNameKey = KeyGen(),
	NailIDKey = KeyGen(),
	NailInitKey = KeyGen(),
	NailKey = KeyGen(),
	NailKey = KeyGen(),
	NailInitFailDefault = compose(Tips,always(LangInitFail)),



	//	List render
	ListPageKey = KeyGen(),
	ListPageTotalKey = KeyGen(),
	ListOrderKey = KeyGen(),//FalseLike : DESC
	ListCountKey = KeyGen(),
	ListCardKey = KeyGen(),
	ListCardIDKey = KeyGen(),//Optional
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
		'Page ,$0$, / ,$1$, | ,$2$, ~ ,$3$, | ,$4$, of ,$5$, ,$6$',
		ListPageKey,ListPageTotalKey,
		_ListFromKey,_ListToKey,
		_ListLengthKey,ListCountKey,
		_ListOrderKey
	),EmptyString),
	ListStatePanel = $(div),
	ListLogger = Logger(Lang(LangListHint),ListStatePanel,True),
	ListPagerNow,
	ListPagerTotal,
	ListPagerGet,
	ListPagerID,
	ListIndicatorPanel = $(div),
	ClassListIndicatorDisabled = KeyGen(),
	ListIndicatorSingle = function(Q)
	{
		isFunction(Q) || (Q = always(Q))
		ListIndicatorPanel.append()
	},
	ListIndicatorList = function(L,R)
	{
		L = range(L,R)

	},
	ListIndicatorHead = ListIndicatorSingle(x00),
	ListIndicatorPrev = ListIndicatorSingle(m01),
	ListIndicatorLeft = ListIndicatorList(-x04,x00),
	ListIndicatorPresent = ListIndicatorSingle(x00),
	ListIndicatorRight = ListIndicatorList(x01,x05),
	ListIndicatorNext = ListIndicatorSingle(x01),
	ListIndicatorLast = ListIndicatorSingle(Infinity),
	ListPager = function(Now,Total,Get,ID)
	{
		ListPagerNow = Now
		ListPagerTotal = Total
		ListPagerGet = Get
		ListPagerID = ID

		ListIndicatorLeft(Now)
		ListIndicatorPresent(Now)
		ListIndicatorRight(Now)
		ListIndicatorLast(Total)
	},
	List = function(Q,Get,ID)
	{
		var
		R = $(div),
		CardView = $(div),
		CardData = Q[ListCardKey],
		From = head(CardData)[ListCardNoKey],
		To = last(CardData)[ListCardNoKey];

		--Q[ListPageTotalKey]

		LoggerMerge(ListLogger,Q)
		LoggerMerge(ListLogger,ReduceToObject
		(
			_ListFromKey,From,
			_ListToKey,To,
			_ListLengthKey,To - From + x01,
			_ListOrderKey,Lang(Q[ListOrderKey] ? WordASC : WordDESC)
		))

		each(function(V)
		{
			CardView.append
			(
				$(fieldset).append
				(
					$(legend).text(V[ListCardNoKey] + (V[ListCardIDKey] ? ' | ' + V[ListCardIDKey] : EmptyString)),
					$(img).attr(attrSrc,V[ListCardImgKey]).attr(title,V[ListCardTitleKey]),
					$(div).text(V[ListCardTitleKey]),
					$(div).text(V[ListCardAuthorKey]),
					$(div).text(FriendlyDate(V[ListCardDateKey]))
				)
			)
		},CardData)

		ListPager(Q[ListPageKey],Q[ListPageTotalKey],Get,ID)

		R.append(ListLogger,CardView,ListIndicatorPanel)
	},
	ListFailed = function()
	{
	},



	//	Sites
	//		Youtube
	YoutubePlaylist = function(ID,Page)
	{
		var
		PageSize = Global[GlobalPageSizeKey];

		API
		(
			GoogleAPIYoutubePlaylist(ID,PageToken(PageSize * (Page || x00)),PageSize),
			function(Q)
			{
				var
				Total = path([pageInfo,'totalResults'],Q),
				R = ReduceToObject
				(
					ListPageKey,floor(path([items,x00,snippet,position],Q) / PageSize),
					ListPageTotalKey,ceil(Total / PageSize),
					ListCountKey,Total,
					ListCardKey,map(function(V)
					{
						return ReduceToObject
						(
							ListCardNoKey,path([snippet,'position'],V),
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
			function(){}
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
	YoutubeInit = curry(function(URL,ID)
	{
		API
		(
			URL(ID),
			YoutubeInitDeal,
			NailInitFailDefault
		)
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
			NailInitKey,function()
			{

			}
		)]
	)],



	GetList = function()
	{
		var
		Tool,
		T,F;

		GlobalURL = InputURL.val()
		Tool = find(function(V)
		{
			return V[ToolJudgeKey].test(GlobalURL)
		},ToolBox) || ToolBox[x00]
		Tool = Tool[ToolNailKey]
		for (F = Tool.length;F;)
			if (T = GlobalURL.match(Tool[--F][NailIDKey]))
				break
		T = T ? T[x01] : EmptyString
		Tool[F][NailInitKey](T)
	};

	CSS(NAME,function(W,H)
	{
		return Replace
		(
			'html,body{margin:0;padding:0;background:/cf/;color:/cs/;text-align:center;font-size:14px}' +
			'input:focus{outline:1px solid /c$/}' +

			'#/R/{margin:20px 20px 0}' +
			'#/R/>div>*{margin:10px 0}' +
			'#/E/ /P/{display:inline-block;width:80%;text-align:center}' +
			'#/U/{width:75%;border-radius:4px 0 0 4px}' +
			'#/G/{display:inline-block;border:0;border-radius:0 4px 4px 0}',
			StringSolidus,
			{
				P : SelectorPreference,

				R : IDRainbow,
				E : IDPref,
				U : IDURL,
				G : IDInit,

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
			InputURL.keyup(when(propEq('keyCode',KeyEnter),GetList)),
			ButtonInit.on(click,GetList)
		),
		PanelInfo,
		PanelList
	)

	$(function()
	{
		$('body').append(Rainbow)
	})

	ZED.Merge(window,
	{
		_ : ZED,
		ZEDQuery : ZED
	})

InputURL.val('https://www.youtube.com/user/kotorikun/videos')
ZED.onError = function(E)
{
	console.error(E.stack)
}
}(window)