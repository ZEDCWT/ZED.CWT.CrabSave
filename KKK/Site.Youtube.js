'use strict'
var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Util = require('./Util'),
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('./Lang'),
L = Lang.L,
Cookie = require('./Cookie'),
Component = require('./Component'),

Name = 'YouTube',
PageSize = 30,

GoogleAPIKey = 'AIzaSyA_ltEFFYL4E_rOBYkQtA8aKHnL5QR_uMA',
URLMain = 'https://www.youtube.com/',
URLLoginCheck = 'https://www.youtube.com/account',
URLChannel = ZED.URLBuild('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=',Util.U,'&key=',GoogleAPIKey),
URLChannelByUser = ZED.URLBuild('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername=',Util.U,'&key=',GoogleAPIKey),
URLPlaylist = ZED.URLBuild('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=',Util.U,'&pageToken=',Util.U,'&maxResults=',PageSize,'&key=',GoogleAPIKey),
URLSubscription = 'https://www.youtube.com/feed/subscriptions',
URLSearch = ZED.URLBuild('https://www.googleapis.com/youtube/v3/search?part=snippet&q=',Util.U,'&pageToken=',Util.U,'&maxResults=',PageSize,'&type=video',Util.U,'&key=',GoogleAPIKey),
URLVInfo = ZED.URLBuild('https://www.googleapis.com/youtube/v3/videos?id=',Util.U,'&part=snippet,statistics,recordingDetails&key=',GoogleAPIKey),
URLWatch = ZED.URLBuild('https://www.youtube.com/watch?v=',Util.U),
URLVInfoURL = ZED.URLBuild('https://www.youtube.com/get_video_info?video_id=',Util.U,'&eurl=',Util.U,'&el=info&sts=',Util.U),

FitQulity = ZED.prop('medium'),
URLJoin = function(Q,S)
{
	return Q + ('/' === S.charAt() ? S.substr(1) : S)
},

FrameTool,
FrameRepeater = ZED.Repeater(),
STS,
Sign,
TrySign = function(Q,R)
{
	try{R = Sign(Q)}
	catch(e){}
	return R
},

TypeMap =
{
	'3gpp' : '3gp'
},

MakeReturnBySnippet = function(Q,X,T)
{
	Q = ZED.JTO(Q)
	Q.error && ZED.Throw(Util.ReplaceLang
	(
		Lang.BadCE,
		Q.code,ZED.OTJ(Q.error)
	))
	T = ZED.path(['pageInfo','totalResults'],Q)

	return ZED.ReduceToObject
	(
		KeySite.Pages,Math.ceil(T / PageSize),
		KeySite.Total,T,
		KeySite.Item,ZED.Map(Q.items,function(F,V,I)
		{
			I = ZED.path(['snippet','position'],V)
			return ZED.ReduceToObject
			(
				KeySite.Index,ZED.isNull(I) ? PageSize * (X - 1) + F : I,
				KeySite.ID,ZED.path(['contentDetails','videoId'],V) || ZED.path(['id','videoId'],V),
				KeySite.Img,FitQulity(ZED.path(['snippet','thumbnails'],V)).url,
				KeySite.Title,ZED.path(['snippet','title'],V),
				KeySite.Author,ZED.path(['snippet','channelTitle'],V),
				KeySite.Date,new Date(ZED.path(['snippet','publishedAt'],V))
			)
		})
	)
},
MakeListByPlaylist = function(ID,X)
{
	return Util.RequestBody(URLPlaylist(ID,ZED.Code.PageToken(PageSize * (X - 1))))
		.map(MakeReturnBySnippet)
},
MakeListCacheUser = {},
MakeListCacheChannel = {},
MakeList = function(ID,X,U,C)
{
	return ZED.has(ID,C) ?
		MakeListByPlaylist(C[ID],X) :
		Util.RequestBody(U(ID)).flatMap(function(Q)
		{
			Q = ZED.path(['items',0,'contentDetails','relatedPlaylists','uploads'],ZED.JTO(Q))
			return Q ? MakeListByPlaylist(C[ID] = Q,X) : Observable.throw(L(Lang.Bad))
		})
},

SubsActive,
SubsContent = function(Q,R)
{
	R = []
	Util.ML(/shelf-grid[^]+?menu-container/g,Q,function(Q)
	{
		R.push(ZED.ReduceToObject
		(
			KeySite.Index,R.length,
			KeySite.ID,Util.MF(/v=([^"]+)/,Q),
			KeySite.Img,Util.DecodeHTML(Util.MF(/src="([^"]+)/,Q).replace(/^\/\//,'http://')),
			KeySite.Title,Util.DecodeHTML(Util.MF(/-title[^]+?title="([^"]+)/,Q)),
			KeySite.Author,Util.DecodeHTML(Util.MF(/ytid[^>]+>([^<]+)/,Q)),
			KeySite.Date,Util.MF(/meta-info.*?<\/li.*?<li.*?>([^<]+)/,Q),
			KeySite.Length,Util.MF(/-time"[^>]+>([^<]+)/,Q)
		))
	})
	return R
},
SubsMore = /more-href="([^"]+)/,

FilterMenu =
[
	['order',['relevance','date','viewCount','rating','title','videoCount']],
	['videoCaption',['any','closedCaption','none']],
	['videoDefinition',['any','high','standard']],
	['videoDimension',['any','2d','3d']],
	['videoDuration',['any','long','medium','short']],
	['videoLicense',['any','creativeCommon','youtube']],
	['videoType',['any','episode','movie']]
],
FilterMenuDef = ZED.reduce(function(D,V)
{
	V[1][0] = [V[1][0],D[V[0]] = '']
	D = V[0]
	if (/^vid/.test(D))
	{
		V.push(V[0])
		V[0] = ZED.toLower(V[0].substr(5))
	}
},{},FilterMenu),

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.you\.?tu\.?be\./i,
	KeySite.Frame,function(Reg)
	{
		STS = Component.Data(Name)
		;/\D/.test(STS) && (STS = '')
		FrameTool = Reg(function(W)
		{
			W.SIGN = ZED.noop
		},function(W)
		{
			Sign = W.SIGN
			TrySign(Name) ? FrameRepeater.finish() : FrameRepeater.error(L(Lang.Bad))
		},STS)
	},
	KeySite.Component,function()
	{
		return Util.ajax(URLMain).flatMap(function(Q)
		{
			Q = ZED.JTO(Util.MF(/assets"[^}]+js":("[^"]+")/,Q))
			return ZED.isString(Q) ?
				Util.ajax(URLJoin(URLMain,Q)).flatMap(function(Q)
				{
					Q = Q.replace(/=[^=]+...split\(""\S+ ..join\(""/,'=SIGN$&')
					STS = Util.MF(/sts:(\d+)/,Q)
					return Util.writeFile(FrameTool[0],Q)
				}).flatMap(function()
				{
					Component.Save(ZED.objOf(Name,STS))
					FrameRepeater = ZED.Repeater()
					FrameTool[1]()
					return FrameRepeater
				}) :
				Observable.throw(L(Lang.Bad))
		})
	},
	KeySite.ComCheck,function()
	{
		return TrySign(Name) ? Observable.empty() : Observable.throw(L(Lang.ComNot))
	},
	KeySite.Require,['Cookie SID','Cookie SSID'],
	KeySite.Login,function(SID,SSID)
	{
		Cookie.Set(Name,Util.CookieMake(
		{
			SID : SID,
			SSID : SSID
		}))
		return Observable.just(L(Lang.CookieSaved))
	},
	KeySite.Check,function()
	{
		return Util.RequestBody(Cookie.URL(Name,URLLoginCheck)).map(function(Q)
		{
			return Util.MF(/display-name">[^>]+>([^<]+)/,Q)
		})
	},
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[Util.MakeLabelWord('user','[\\s/]+','[_0-9A-Za-z-]+')],
		KeySite.Page,function(ID,X)
		{
			return MakeList(ID,X,URLChannelByUser,MakeListCacheUser)
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Channel),
		KeySite.Judge,[Util.MakeLabelWord('channel','[\\s/]+','[_0-9A-Za-z-]+')],
		KeySite.Page,function(ID,X)
		{
			return MakeList(ID,X,URLChannel,MakeListCacheChannel)
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Playlist),
		KeySite.Judge,[Util.MakeLabelWord('playlist','[\\s/]+','[_0-9A-Za-z-]+')],
		KeySite.Page,MakeListByPlaylist
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Subs),
		KeySite.Judge,[/^(?:sub(?:scri(?:be|ptions?))?)?$/i],
		KeySite.Page,function(_,X)
		{
			return 1 < X && SubsActive && SubsActive[X - 2] ?
				Util.RequestBody(Cookie.URL(Name,URLJoin(URLMain,SubsActive[X - 2]))).map(function(Q,R)
				{
					Q = ZED.JTO(Q)
					;(Q && Q.content_html) || ZED.Throw(L(Lang.EmptyList))
					R = Util.DecodeHTML(Util.MF(SubsMore,Q.load_more_widget_html))
					R && (SubsActive[X - 1] = R)
					R = SubsContent(Q.content_html)

					return ZED.ReduceToObject
					(
						KeySite.Pages,1 + SubsActive.length,
						KeySite.Total,R.length,
						KeySite.Item,R
					)
				}) :
				Util.RequestFull(Cookie.URL(Name,URLSubscription)).map(function(Q)
				{
					Cookie.Save(Name,Q[0])
					Q = Q[1]
					R = SubsContent(Q)
					SubsActive = [Util.DecodeHTML(Util.MF(SubsMore,Q))]

					return ZED.ReduceToObject
					(
						KeySite.Pages,2,
						KeySite.Total,R.length,
						KeySite.Item,R
					)
				})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Search),
		KeySite.Judge,[/^(?:find|search)\s+(.*)$/i],
		KeySite.Page,function(Q,X,O)
		{
			return Util.RequestBody(Util.MakeSearch(URLSearch,Q,'',O)).map(function(Q)
			{
				return ZED.ReduceToObject
				(
					MakeReturnBySnippet(Q,X),
					KeySite.Pref,FilterMenu,
					KeySite.PrefDef,FilterMenuDef
				)
			})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/v=([^&]+)/,/^([_0-9A-Za-z-]+)$/],
		KeySite.Page,function(ID)
		{
			return Util.RequestBody(Cookie.URL(Name,URLVInfo(ID))).map(function(Q)
			{
				Q = ZED.path(['items',0,'snippet'],ZED.JTO(Q))
				Q || ZED.Throw(L(Lang.Bad))

				return ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.Index,0,
						KeySite.ID,ID,
						KeySite.Img,FitQulity(Q.thumbnails).url,
						KeySite.Title,Q.title,
						KeySite.Author,Q.channelTitle,
						KeySite.Date,new Date(Q.publishedAt)
					)]
				)
			})
		}
	)],
	KeySite.URL,function(ID)
	{
		return Util.RequestBody(Cookie.URL(Name,URLVInfo(ID))).flatMap(function(Info)
		{
			Info = ZED.path(['items',0,'snippet'],ZED.JTO(Info))
			Info || ZED.Throw(L(Lang.Bad))

			return Util.RequestBody(Cookie.URL(Name,URLVInfoURL(ID,URLWatch(ID),STS))).map(function(URL,S)
			{
				URL = ZED.QueryString(URL).url_encoded_fmt_stream_map
				URL || ZED.Throw(L(Lang.Bad))
				URL = ZED.map(ZED.QueryString,URL.split(','))[0]
				URL || ZED.Throw(L(Lang.Bad))
				S = URL.s || URL.sig
				if (S)
				{
					S = TrySign(S)
					URL.url += '&signature=' + S
				}
				S = Util.MF(/video\/([^;]+)/,URL.type) || 'mp4'
				TypeMap[S] && (S = TypeMap[S])

				return ZED.ReduceToObject
				(
					KeyQueue.Author,Info.channelTitle,
					KeyQueue.Date,ZED.now(new Date(Info.publishedAt)),
					KeyQueue.Part,[ZED.ReduceToObject
					(
						KeyQueue.URL,[URL.url],
						KeyQueue.Suffix,'.' + S
					)]
				)
			})
		})
	},
	KeySite.IDView,ZED.identity,
	KeySite.Pack,ZED.identity
);

module.exports = R