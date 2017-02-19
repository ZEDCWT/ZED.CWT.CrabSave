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
URLPlaylist = ZED.URLBuild('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&playlistId=',Util.U,'&pageToken=',Util.U,'&maxResults=',PageSize,'&key=',GoogleAPIKey),
URLVideo = ZED.URLBuild('https://www.googleapis.com/youtube/v3/videos?id=',Util.U,'&part=snippet,statistics,recordingDetails&key=',GoogleAPIKey),

FitQulity = ZED.prop('medium'),

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

MakeListByPlaylist = function(ID,X)
{
	return Util.RequestBody(URLPlaylist(ID,ZED.Code.PageToken(PageSize * (X - 1)))).map(function(Q,T)
	{
		Q = ZED.JTO(Q)
		Q.error && ZED.Throw(Util.ReplaceLang(Lang.BadCE,Q.error.code,Q.error.message))

		T = ZED.path(['pageInfo','totalResults'],Q)
		return ZED.ReduceToObject
		(
			KeySite.Pages,Math.ceil(T / PageSize),
			KeySite.Total,T,
			KeySite.Item,ZED.Map(Q.items,function(F,V)
			{
				return ZED.ReduceToObject
				(
					KeySite.Index,ZED.path(['snippet','position'],V),
					KeySite.ID,ZED.path(['contentDetails','videoId'],V),
					KeySite.Img,FitQulity(ZED.path(['snippet','thumbnails'],V)).url,
					KeySite.Title,ZED.path(['snippet','title'],V),
					KeySite.Author,ZED.path(['snippet','channelTitle'],V),
					KeySite.Date,new Date(ZED.path(['snippet','publishedAt'],V))
				)
			})
		)
	})
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

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.you\.?tu\.?be\./i,
	KeySite.Frame,function(Reg)
	{
		STS = Component.Data(Name)
		;/\D/.test(STS) && (STS = Util.F)
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
				Util.ajax('/' === Q.charAt() ? URLMain + Q.substr(1) : Q).flatMap(function(Q)
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
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/v=([^&]+)/,/^([_0-9A-Za-z-]+)$/],
		KeySite.Page,function(ID)
		{
			return Util.RequestBody(URLVideo(ID)).map(function(Q)
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
	KeySite.URL,function(ID,R)
	{
	},
	KeySite.IDView,ZED.identity,
	KeySite.Pack,function(S,Q)
	{
		return S
	}
);

module.exports = R