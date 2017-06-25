'use strict'
var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,
Cookie = require('../Cookie'),
Component = require('../Component'),

Name = 'YouTube',
PageSize = 30,

GoogleAPIKey = 'AIzaSyA_ltEFFYL4E_rOBYkQtA8aKHnL5QR_uMA',
URLMain = 'https://www.youtube.com/',
URLLoginCheck = 'https://www.youtube.com/account',
URLChannelPrefix = URLMain + 'channel/',
URLChannel = ZED.URLBuild('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=',Util.U,'&key=',GoogleAPIKey),
URLChannelByUser = ZED.URLBuild('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername=',Util.U,'&key=',GoogleAPIKey),
URLPlaylist = ZED.URLBuild('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=',Util.U,'&pageToken=',Util.U,'&maxResults=',PageSize,'&key=',GoogleAPIKey),
URLSubscription = 'https://www.youtube.com/feed/subscriptions',
URLFollowing = 'https://www.youtube.com/subscription_manager',
URLSearch = ZED.URLBuild('https://www.googleapis.com/youtube/v3/search?part=snippet&q=',Util.U,'&pageToken=',Util.U,'&maxResults=',PageSize,'&type=video',Util.U,'&key=',GoogleAPIKey),
URLSearchHint = ZED.URLBuild('https://clients1.google.com/complete/search?client=youtube&ds=yt&q=',Util.U,'&callback=_'),
URLVInfo = ZED.URLBuild('https://www.googleapis.com/youtube/v3/videos?id=',Util.U,'&part=snippet,statistics,recordingDetails&key=',GoogleAPIKey),
URLWatch = ZED.URLBuild('https://www.youtube.com/watch?v=',Util.U),
URLVInfoURL = ZED.URLBuild('https://www.youtube.com/get_video_info?video_id=',Util.U,'&eurl=',Util.U,'&el=info&sts=',Util.U),
URLVideo = ZED.URLBuild('https://www.youtube.com/watch?v=',Util.U),

FitQulity = ZED.prop('medium'),
URLJoin = (Q,S) => Q + ('/' === S.charAt() ? S.substr(1) : S),

FrameTool,
FrameRepeater = ZED.Repeater(),
STS,
Sign,
TrySign = (Q,R) =>
{
	try{R = Sign(Q)}
	catch(e){}
	return R
},

TypeMap =
{
	'3gpp' : '3gp'
},

MakeReturnBySnippet = (Q,X,T) =>
(
	Q = ZED.JTO(Q),
	Q.error && ZED.Throw(Util.ReplaceLang
	(
		Lang.BadCE,
		Q.code || Q.error.code,ZED.OTJ(Q.error)
	)),
	T = ZED.path(['pageInfo','totalResults'],Q),
	ZED.ReduceToObject
	(
		KeySite.Pages,Math.ceil(T / PageSize),
		KeySite.Total,T,
		KeySite.PageSize,PageSize,
		KeySite.Item,ZED.map(V => ZED.ReduceToObject
		(
			KeySite.Index,ZED.path(['snippet','position'],V),
			KeySite.ID,ZED.path(['contentDetails','videoId'],V) || ZED.path(['id','videoId'],V),
			KeySite.Img,FitQulity(ZED.path(['snippet','thumbnails'],V)).url,
			KeySite.Title,ZED.path(['snippet','title'],V),
			KeySite.Author,ZED.path(['snippet','channelTitle'],V),
			KeySite.AuthorLink,URLChannelPrefix + ZED.path(['snippet','channelId'],V),
			KeySite.Date,new Date(ZED.path(['snippet','publishedAt'],V))
		),Q.items)
	)
),
MakeListByPlaylist = (ID,X) => Util
	.RequestBody(URLPlaylist(ID,ZED.Code.PageToken(PageSize * (X - 1))))
	.map(MakeReturnBySnippet),
MakeListCacheUser = {},
MakeListCacheChannel = {},
MakeList = (ID,X,U,C) => ZED.has(ID,C) ?
	MakeListByPlaylist(C[ID],X) :
	Util.RequestBody(U(ID)).flatMap(Q =>
	(
		Q = ZED.path(['items',0,'contentDetails','relatedPlaylists','uploads'],ZED.JTO(Q)),
		Q ? MakeListByPlaylist(C[ID] = Q,X) : ZED.Throw(L(Lang.Bad))
	)),

SubsActive,
SubsContent = Q => Util.MA(/shelf-grid[^]+?menu-container/g,Q,Q => ZED.ReduceToObject
(
	KeySite.ID,Util.MF(/v=([^"&]+)/,Q),
	KeySite.Img,Util.DecodeHTML(Util.MF(/(?:data-thumb|src(?!.*data-thumb))="([^"]+)/,Q).replace(/^\/\//,'http://')),
	KeySite.Title,Util.DecodeHTML(Util.MF(/-title[^]+?title="([^"]+)/,Q)),
	KeySite.Author,Util.DecodeHTML(Util.MF(/ytid[^>]+>([^<]+)/,Q)),
	KeySite.AuthorLink,URLMain + Util.MF(/\/((?:user|channel)\/[^"]+)/,Q),
	KeySite.Date,Util.MF(/meta-info.*?<\/li.*?<li.*?>([^<]+)/,Q),
	KeySite.Length,Util.MF(/-time"[^>]+>([^<]+)/,Q)
)),
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
FilterMenuDef = ZED.reduce((D,V) =>
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
	KeySite.Judge,/youtu\.?be/i,
	KeySite.Frame,Reg =>
	{
		STS = Component.Data(Name)
		;/\D/.test(STS) && (STS = '')
		FrameTool = Reg
		(
			W => W.SIGN = ZED.noop,
			W =>
			{
				Sign = W.SIGN
				TrySign(Name) ? FrameRepeater.finish() : FrameRepeater.error(L(Lang.Bad))
			},
			STS
		)
	},
	KeySite.Component,Say =>
	(
		Say(Util.ReplaceLang(Lang.LoadScr,L(Lang.HP))),
		Util.ajax(URLMain).flatMap(Q =>
		(
			Q = ZED.JTO(Util.MF(/assets"[^}]+js":("[^"]+")/,Q)),
			ZED.isString(Q) || ZED.Throw(L(Lang.Bad)),
			Say(Util.ReplaceLang(Lang.LoadScr,L(Lang.Assets))),
			Util.ajax(URLJoin(URLMain,Q)).flatMap((Q,T) =>
			(
				Q = Q.replace(/=[^=]+...split\(""\S+ ..join\(""/,'=SIGN$&'),
				T = STS,
				STS = Util.MF(/sts:(\d+)/,Q),
				Say('STS : ' + (T ? `${T} → ${STS}` : STS)),
				Say(L(Lang.FileWrite)),
				Util.writeFile(FrameTool[0],Q)
			)).flatMap(() =>
			(
				Component.Save(ZED.objOf(Name,STS)),
				FrameRepeater = ZED.Repeater(),
				FrameTool[1](),
				FrameRepeater
			))
		))
	),
	KeySite.ComCheck,() => TrySign(Name) ?
		Observable.empty() :
		Observable.throw(L(Lang.ComNot)),
	KeySite.Require,['Cookie SID','Cookie SSID'],
	KeySite.Login,(SID,SSID) =>
	(
		Cookie.Set(Name,Util.CookieMake(
		{
			SID : SID,
			SSID : SSID
		})),
		Observable.just(L(Lang.CookieSaved))
	),
	KeySite.Check,() => Util.RequestBody(Cookie.URL(Name,URLLoginCheck))
		.map(Q => Util.MF(/display-name">[^>]+>([^<]+)/,Q)),
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[Util.MakeLabelWord('user')],
		KeySite.Page,(ID,X) => MakeList(ID,X,URLChannelByUser,MakeListCacheUser)
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Channel),
		KeySite.Judge,[Util.MakeLabelWord('channel')],
		KeySite.Page,(ID,X) => MakeList(ID,X,URLChannel,MakeListCacheChannel)
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Playlist),
		KeySite.Judge,[Util.MakeLabelWord('playlist'),/list=([^&]+)/i],
		KeySite.Page,MakeListByPlaylist
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Subs),
		KeySite.Judge,[/^(?:sub(?:scri(?:be|ptions?))?)?$/i],
		KeySite.Page,(_,X) =>  1 < X && SubsActive && SubsActive[X - 2] ?
			Util.RequestBody(Cookie.URL(Name,URLJoin(URLMain,SubsActive[X - 2]))).map((Q,R) =>
			(
				Q = ZED.JTO(Q),
				(Q && Q.content_html) || ZED.Throw(L(Lang.EmptyList)),
				R = Util.DecodeHTML(Util.MF(SubsMore,Q.load_more_widget_html)),
				R && (SubsActive[X - 1] = R),
				R = SubsContent(Q.content_html),
				ZED.ReduceToObject
				(
					KeySite.Pages,1 + SubsActive.length,
					KeySite.Total,R.length,
					KeySite.Item,R
				)
			)) :
			Util.RequestFull(Cookie.URL(Name,URLSubscription)).map(Q =>
			(
				Cookie.Save(Name,Q[0]),
				Q = Q[1],
				R = SubsContent(Q),
				SubsActive = [Util.DecodeHTML(Util.MF(SubsMore,Q))],
				ZED.ReduceToObject
				(
					KeySite.Pages,2,
					KeySite.Total,R.length,
					KeySite.Item,R
				)
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Following),
		KeySite.Judge,Util.RFollow,
		KeySite.Page,() => Util.RequestBody(Cookie.URL(Name,URLFollowing))
			.map(Q => ZED.ReduceToObject
			(
				KeySite.Pages,1,
				KeySite.Total,Util.MF(/-title">[^>]+>(\d+)/,Q),
				KeySite.Item,Util.MA(/tion-thumb[^]+?<\/div/g,Q,Q => ZED.ReduceToObject
				(
					KeySite.ID,Util.F,
					KeySite.Img,Util.MF(/data-thumb="([^"]+)/,Q),
					KeySite.Author,Util.DecodeHTML(Util.MF(/title="([^"]+)/,Q)),
					KeySite.AuthorLink,URLMain + Util.MF(/\/((?:user|channel)\/[^"]+)/,Q)
				))
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Search),
		KeySite.Judge,Util.RSearch,
		KeySite.Page,(Q,X,O) => Util
			.RequestBody(Util.MakeSearch(URLSearch,Q,ZED.Code.PageToken(PageSize * (X - 1)),O))
			.map(Q => ZED.ReduceToObject
			(
				MakeReturnBySnippet(Q,X),
				KeySite.Pref,FilterMenu,
				KeySite.PrefDef,FilterMenuDef
			)),
		KeySite.Hint,Q => Util.RequestBody(URLSearchHint(encodeURIComponent(Q)))
			.map(Q => ZED.reduce
			(
				(D,V) => {D.push(V[0])},
				[],
				ZED.JTO(Q.replace(/^[^[]+|[^\]]+$/g,''))[1] || []
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/v=([^&]+)/,/^([_\dA-Za-z-]+)$/,/\.be\/(.*)/i],
		KeySite.Page,ID => Util.RequestBody(Cookie.URL(Name,URLVInfo(ID)))
			.map(Q =>
			(
				Q = ZED.path(['items',0,'snippet'],ZED.JTO(Q)),
				Q || ZED.Throw(L(Lang.Bad)),
				ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.ID,ID,
						KeySite.Img,FitQulity(Q.thumbnails).url,
						KeySite.Title,Q.title,
						KeySite.Author,Q.channelTitle,
						KeySite.AuthorLink,URLChannelPrefix + Q.channelId,
						KeySite.Date,new Date(Q.publishedAt)
					)]
				)
			))
	)],
	KeySite.URL,ID => Util.RequestBody(Cookie.URL(Name,URLVInfo(ID)))
		.flatMap(Info =>
		(
			Info = ZED.path(['items',0,'snippet'],ZED.JTO(Info)),
			Info || ZED.Throw(L(Lang.Bad)),
			Util.RequestBody(Cookie.URL(Name,URLVInfoURL(ID,URLWatch(ID),STS))).map((URL,S) =>
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
		)),
	KeySite.IDView,ZED.identity,
	KeySite.IDLink,URLVideo,
	KeySite.Pack,ZED.identity
);

module.exports = R