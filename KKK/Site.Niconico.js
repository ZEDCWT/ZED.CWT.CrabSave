'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('./Util'),
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('./Lang'),
L = Lang.L,
Cookie = require('./Cookie'),

Name = '\u30CB\u30B3\u30CB\u30B3',
PageSize = 30,

URLLogin = 'https://secure.nicovideo.jp/secure/login',
URLLoginCheck = 'http://seiga.nicovideo.jp/',
URLUser = ZED.URLBuild('http://www.nicovideo.jp/user/',Util.U,'/video?page=',Util.U),
URLMylist = ZED.URLBuild('http://www.nicovideo.jp/mylist/',Util.U),
URLRepo = ZED.URLBuild('http://www.nicovideo.jp/my/top/user?innerPage=1&mode=next_page&last_timeline=',Util.U),
URLVInfo = ZED.URLBuild('http://ext.nicovideo.jp/api/getthumbinfo/sm',Util.U),
URLVInfoURL = ZED.URLBuild('http://flapi.nicovideo.jp/api/getflv?v=sm',Util.U),
UrlVideo = ZED.URLBuild('http://www.nicovideo.jp/watch/sm',Util.U),

MaybeError = function(Q)
{
	/<error>/.test(Q) && ZED.Throw(Util.ReplaceLang
	(
		Lang.BadCE,
		Util.MF(/code>([^<]+)/,Q),
		Util.MF(/tion>([^<]+)/,Q)
	))
},

RepoActive,

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.nico(?:nico|video)\.|^sm\d+$/i,
	KeySite.Login,function(ID,PW)
	{
		return Util.RequestHead(
		{
			url : URLLogin,
			method : 'post',
			form :
			{
				mail : ID,
				password : PW
			},
			followRedirect : Util.F
		}).map(function(H)
		{
			Cookie.Set(Name,Util.MU(/user_session=user_[^;]+/,H.rawHeaders.join('\n')))
		})
	},
	KeySite.Check,function()
	{
		return Util.RequestBody(Cookie.URL(Name,URLLoginCheck)).map(function(Q)
		{
			return Util.MF(/data-nickname="([^"]+)/,Q)
		})
	},
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^(\d+)$/,Util.MakeLabelNumber('sm')],
		KeySite.Page,function(ID)
		{
			return Util.RequestBody(Cookie.URL(Name,URLVInfo(ID))).map(function(Q)
			{
				MaybeError(Q)

				return ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.Index,0,
						KeySite.ID,ID,
						KeySite.Img,Util.MF(/l_url>([^<]+)/,Q),
						KeySite.Title,Util.MF(/itle>([^<]+)/,Q),
						KeySite.Author,Util.MF(/name>([^<]+)/,Q),
						KeySite.Date,Util.MF(/ieve>([^<]+)/,Q)
					)]
				)
			})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[Util.MakeLabelNumber('user')],
		KeySite.Page,function(ID,X)
		{
			return Util.RequestBody(Cookie.URL(Name,URLUser(ID,X))).map(function(Q,T,A)
			{
				/noListMsg/.test(Q) &&
				(
					Q = Util.MF(/noListMsg[^]+?<p[^>]+>([^<]+)/,Q),
					ZED.Throw(Q ? Util.ReplaceLang(Lang.BadE,Q) : L(Lang.Bad))
				)
				T = Number(Util.MF(/id="video[^]+?(\d+(?!>))/,Q))
				A = Util.MF(/profile[^]+?<h2>([^<]+)/,Q)

				return ZED.ReduceToObject
				(
					KeySite.Pages,Math.ceil(T / PageSize) || 0,
					KeySite.Total,T,
					KeySite.Item,ZED.Map
					(
						ZED.match(/outer"(?![^<]+<form)[^]+?<\/p/g,Util.MU(/Body"[^]+?="side/,Q)),
						function(F,V)
						{
							return ZED.ReduceToObject
							(
								KeySite.Index,PageSize * (X - 1) + F,
								KeySite.ID,Util.MF(/sm(\d+)/,V),
								KeySite.Img,Util.MF(/src="([^"]+)/,V),
								KeySite.Title,Util.MF(/h5>[^>]+>([^<]+)/,V),
								KeySite.Author,A,
								KeySite.Date,Util.DateDirect(ZED.match(/\d+/g,Util.MF(/posttime">([^<]+)/,V)))
							)
						}
					)
				)
			})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Mylist),
		KeySite.Judge,[Util.MakeLabelNumber('Mylist')],
		KeySite.Page,function(ID,X)
		{
			return Util.RequestBody(URLMylist(ID)).map(function(Q)
			{
				var
				Len,
				Page,
				Item = [],
				F,Fa,
				T;

				Q = Util.MF(/preload\([^\[]+(\[[^\]]+\])/,Q)
				Q || ZED.Throw(L(Lang.Bad))
				Q = ZED.filter(function(V){return 0 === V.item_type},ZED.JTO(Q))
					.sort(function(Q,S){return S.item_data.first_retrieve - Q.item_data.first_retrieve})
				Len = Q.length
				Len || ZED.Throw(L(Lang.EmptyList))

				Page = Math.ceil(Q.length / PageSize) || 0
				F = (ZED.max(1,ZED.min(X,Page)) - 1) * PageSize
				Fa = ZED.min(F + PageSize,Len)
				for (;F < Fa;++F)
				{
					T = Q[F].item_data
					Item.push(ZED.ReduceToObject
					(
						KeySite.Index,F,
						KeySite.ID,T.video_id.replace(/sm/,''),
						KeySite.Img,T.thumbnail_url,
						KeySite.Title,T.title,
						KeySite.Date,1000 * T.first_retrieve
					))
				}

				return ZED.ReduceToObject
				(
					KeySite.Pages,Page,
					KeySite.Total,Len,
					KeySite.Item,Item
				)
			})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,'ニコレポ',
		KeySite.Judge,[/^(?:repo|my|top)?$/i],
		KeySite.Page,function(_,X)
		{
			return Util.RequestBody(Cookie.URL(Name,URLRepo(RepoActive && RepoActive[X - 2] || ''))).map(function(Q)
			{
				var
				R = [],
				M = {},
				T;

				Util.ML(/content"[^]+?content --/g,Q,function(Q)
				{
					T = Util.MF(/sm(\d+)/,Q)
					if (T && !M[T])
					{
						M[T] = Util.T
						R.push(ZED.ReduceToObject
						(
							KeySite.Index,R.length,
							KeySite.ID,T,
							KeySite.Img,Util.MF(/original="([^"]+)/,Q),
							KeySite.Title,Util.DecodeHTML(Util.MF(/info[^]+sm\d+[^>]+>([^<]+)/,Q)).trim(),
							KeySite.Author,Util.DecodeHTML(Util.MF(/user">([^<]+)/,Q)).trim(),
							KeySite.Date,new Date(Util.MF(/datetime="([^"]+)/,Q))
						))
					}
				})

				T = Util.MF(/last_timeline=(\d+)/,Q)
				if (1 < X) T && (RepoActive[X - 2] = T)
				else RepoActive = T ? [T] : []

				return ZED.ReduceToObject
				(
					KeySite.Pages,1 + RepoActive.length,
					KeySite.Total,R.length,
					KeySite.Item,R
				)
			})
		}
	)],
	KeySite.URL,function(ID)
	{
		return Util.RequestBody(Cookie.URL(Name,URLVInfo(ID))).flatMap(function(Q)
		{
			MaybeError(Q)

			return Util.RequestBody(Cookie.URL(Name,URLVInfoURL(ID))).map(function(U)
			{
				U = ZED.QueryString(U).url
				U || ZED.Throw(Util.ReplaceLang(ZED.BadE,Q.error))

				return ZED.ReduceToObject
				(
					KeyQueue.Author,Util.MF(/name>([^<]+)/,Q),
					KeyQueue.Date,Util.MF(/ieve>([^<]+)/,Q),
					KeyQueue.Part,[ZED.ReduceToObject
					(
						KeyQueue.Title,Util.MF(/itle>([^<]+)/,Q),
						KeyQueue.URL,[U],
						KeyQueue.Suffix,'.' + Util.MF(/e_type>([^<]+)/,Q)
					)],
					KeyQueue.Sizes,[Number(Util.MF(/high>([^<]+)/,Q))]
				)
			})
		})
	},
	KeySite.IDView,ZED.add('sm'),
	KeySite.Pack,function(S,Q)
	{
		return Util.RequestHead(Cookie.URL(Name,UrlVideo(Q[KeyQueue.ID]))).map(function(H)
		{
			Cookie.Save(Name,H)
			return Cookie.URL(Name,S)
		})
	}
);

module.exports = R