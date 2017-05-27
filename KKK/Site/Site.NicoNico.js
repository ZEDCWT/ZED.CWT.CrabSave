'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,
Cookie = require('../Cookie'),

Name = 'NicoNico',
PageSize = 30,

URLLogin = 'https://secure.nicovideo.jp/secure/login',
URLLoginCheck = 'http://seiga.nicovideo.jp/',
URLUserPrefix = 'http://www.nicovideo.jp/user/',
URLUser = ZED.URLBuild(URLUserPrefix,Util.U,'/video?page=',Util.U),
URLMylist = ZED.URLBuild('http://www.nicovideo.jp/mylist/',Util.U),
URLRepo = ZED.URLBuild('http://www.nicovideo.jp/my/top/user?innerPage=1&mode=next_page&last_timeline=',Util.U),
URLFollowing = ZED.URLBuild('http://www.nicovideo.jp/my/fav/user?page=',Util.U),
URLSearch = ZED.URLBuild('http://www.nicovideo.jp/search/',Util.U,'?page=',Util.U,Util.U),
URLSearchHint = ZED.URLBuild('http://sug.search.nicovideo.jp/suggestion/complete/',Util.U),
URLVInfo = ZED.URLBuild('http://ext.nicovideo.jp/api/getthumbinfo/sm',Util.U),
URLVInfoURL = ZED.URLBuild('http://flapi.nicovideo.jp/api/getflv?v=sm',Util.U),
URLVideo = ZED.URLBuild('http://www.nicovideo.jp/watch/sm',Util.U),

MaybeError = Q => /<error>/.test(Q) && ZED.Throw(Util.ReplaceLang
(
	Lang.BadCE,
	Util.MF(/code>([^<]+)/,Q),
	Util.MF(/tion>([^<]+)/,Q)
)),

RepoActive,
FilterMenu,
FilterMenuDef = {},

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.nico(?:nico|video)\.|^sm\d+$/i,
	KeySite.Login,(ID,PW) => Util.RequestHead(
	{
		url : URLLogin,
		method : 'post',
		form :
		{
			mail : ID,
			password : PW
		},
		followRedirect : Util.F
	}).tap(H => Cookie.Set(Name,Util.MU(/user_session=user_[^;]+/,H.rawHeaders.join('\n')))),
	KeySite.Check,() => Util.RequestBody(Cookie.URL(Name,URLLoginCheck))
		.map(Q => Util.MF(/data-nickname="([^"]+)/,Q)),
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^(\d+)$/,Util.MakeLabelNumber('sm')],
		KeySite.Page,ID => Util.RequestBody(Cookie.URL(Name,URLVInfo(ID)))
			.map(Q =>
			(
				MaybeError(Q),
				ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.Index,0,
						KeySite.ID,ID,
						KeySite.Img,Util.MF(/l_url>([^<]+)/,Q),
						KeySite.Title,Util.DecodeHTML(Util.MF(/itle>([^<]+)/,Q)),
						KeySite.Author,Util.DecodeHTML(Util.MF(/name>([^<]+)/,Q)),
						KeySite.AuthorLink,URLUserPrefix + Util.MF(/user_id>(\d+)/,Q),
						KeySite.Date,Util.MF(/ieve>([^<]+)/,Q)
					)]
				)
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[Util.MakeLabelNumber('user')],
		KeySite.Page,(ID,X) => Util.RequestBody(Cookie.URL(Name,URLUser(ID,X)))
			.map((Q,T,A) =>
			(
				/noListMsg/.test(Q) &&
				(
					Q = Util.MF(/noListMsg[^]+?<p[^>]+>([^<]+)/,Q),
					ZED.Throw(Q ? Util.ReplaceLang(Lang.BadE,Q) : L(Lang.Bad))
				),
				T = Number(Util.MF(/id="video[^]+?(\d+(?!>))/,Q)),
				A = Util.DecodeHTML(Util.MF(/profile[^]+?<h2>([^<]+)/,Q)),
				ZED.ReduceToObject
				(
					KeySite.Pages,Math.ceil(T / PageSize) || 0,
					KeySite.Total,T,
					KeySite.Item,ZED.Reduce
					(
						ZED.match(/outer"(?![^<]+<form)[^]+?<\/p/g,Util.MU(/Body"[^]+?="side/,Q)),
						(D,F,V,I) =>
						{
							I = Util.MF(/sm(\d+)/,V)
							I && D.push(ZED.ReduceToObject
							(
								KeySite.Index,PageSize * (X - 1) + F,
								KeySite.ID,I,
								KeySite.Img,Util.MF(/src="([^"]+)/,V),
								KeySite.Title,Util.DecodeHTML(Util.MF(/h5>[^>]+>([^<]+)/,V)),
								KeySite.Author,A,
								KeySite.AuthorLink,URLUserPrefix + ID,
								KeySite.Date,Util.DateDirect(ZED.match(/\d+/g,Util.MF(/posttime">([^<]+)/,V)))
							))
						},
						[]
					)
				)
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Mylist),
		KeySite.Judge,[Util.MakeLabelNumber('Mylist')],
		KeySite.Page,(ID,X) => Util.RequestBody(URLMylist(ID))
			.map(Q =>
			{
				var
				Len,
				Page,
				Item = [],
				F,Fa,
				T;

				Q = ZED.JTO(Util.MF(/preload\([^\[]+([^]+\])\);\n/,Q))
				ZED.isArray(Q) || ZED.Throw(L(Lang.Bad))
				Q = ZED.filter(V => 0 === V.item_type,Q)
					.sort((Q,S) => S.item_data.first_retrieve - Q.item_data.first_retrieve)
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
	),ZED.ReduceToObject
	(
		KeySite.Name,'ニコレポ',
		KeySite.Judge,[/^(?:repo|my|top)?$/i],
		KeySite.Page,(_,X) => Util
			.RequestBody(Cookie.URL(Name,URLRepo(RepoActive && RepoActive[X - 2] || '')))
			.map(Q =>
			{
				var M = {},T;

				T = Util.MF(/last_timeline=(\d+)/,Q)
				if (1 < X) T && (RepoActive[X - 2] = T)
				else RepoActive = T ? [T] : []

				return ZED.ReduceToObject
				(
					KeySite.Pages,1 + RepoActive.length,
					KeySite.Item,Util.MA(/content"[^]+?content --/g,Q,(Q,I) =>
					(
						T = Util.MF(/sm(\d+)/,Q),
						T && !M[T] &&
						(
							M[T] = Util.T,
							ZED.ReduceToObject
							(
								KeySite.Index,I,
								KeySite.ID,T,
								KeySite.Img,Util.MF(/original="([^"]+)/,Q),
								KeySite.Title,Util.DecodeHTML(Util.MF(/info[^]+sm\d+[^>]+>([^<]+)/,Q)).trim(),
								KeySite.Author,Util.DecodeHTML(Util.MF(/user">([^<]+)/,Q)).trim(),
								KeySite.AuthorLink,URLUserPrefix + Util.MF(/user\/(\d+)/,Q),
								KeySite.Date,new Date(Util.MF(/datetime="([^"]+)/,Q))
							)
						)
					))
				)
			})
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Following),
		KeySite.Judge,Util.RFollow,
		KeySite.Page,(_,X) => Util.RequestBody(Cookie.URL(Name,URLFollowing(X)))
			.map(Q => ZED.ReduceToObject
			(
				KeySite.Pages,Util.MF(/>(\d+)<(?![^]*>\d)/,Util.MU(/pager"[^]+?<\/div/,Q)),
				KeySite.Total,Util.MF(/favUser[^(]+\((\d+)/,Q),
				KeySite.Item,Util.MA(/thumbCont[^]+?buttonShape/g,Q,(Q,I) => ZED.ReduceToObject
				(
					KeySite.Index,I,
					KeySite.ID,Util.F,
					KeySite.Img,Util.MF(/src="([^"]+)/,Q),
					KeySite.Author,Util.DecodeHTML(Util.MF(/alt="([^"]+)/,Q)),
					KeySite.AuthorLink,URLUserPrefix + Util.MF(/user\/(\d+)/,Q)
				))
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Search),
		KeySite.Judge,Util.RSearch,
		KeySite.Page,(Q,X,O) => Util.RequestBody(Util.MakeSearch(URLSearch,Q,X,O))
			.map((Q,T) =>
			(
				T = Number(Util.MF(/more">([\d,]+)/,Q).replace(/,/g,'')) || 0,
				FilterMenu = FilterMenu || Util.MA(/optionList"(?:[^]+?<\/div){2}/g,Q,Q =>
				(
					Q =
					[
						Util.MF(/h3>([^<]+)/,Q),
						Util.MA(/<li[^>]*>[^]+?<\/li>/g,Q,Q =>
						[
							Q.replace(/<[^>]+>/g,''),
							Util.MF(/\?[^=]+=([^&]+(?:&order=.)?)/,Q.replace(/&amp;/g,'&'))
						]),
						Util.MF(/\?([^=]+)/,Q)
					],
					FilterMenuDef[Q[2]] = '',
					Q
				)),
				ZED.ReduceToObject
				(
					KeySite.Pages,ZED.min(Math.ceil(T / 32),50),
					KeySite.Total,T,
					KeySite.Item,Util.MA(/video-item[^]+?<\/li/g,Q,(Q,I,ID) => (ID = Util.MF(/sm(\d+)/,Q)) &&
						ZED.ReduceToObject
						(
							KeySite.Index,PageSize * (X - 1) + I,
							KeySite.ID,ID,
							KeySite.Img,Util.MF(/original="([^"]+)/,Q),
							KeySite.Title,Util.DecodeHTML(Util.MF(/title="([^"]+)/,Q)),
							KeySite.Date,Util.MF(/time">([^<]+)/,Q).replace(/^(?=\d\d\/)/,'20')
						)),
					KeySite.Pref,FilterMenu,
					KeySite.PrefDef,FilterMenuDef
				)
			)),
		KeySite.Hint,Q => Util.RequestBody(URLSearchHint(encodeURIComponent(Q)))
			.map(Q => ZED.JTO(Q).candidates || [])
	)],
	KeySite.URL,ID => Util.RequestBody(Cookie.URL(Name,URLVInfo(ID)))
		.flatMap(Q =>
		(
			MaybeError(Q),
			Util.RequestBody(Cookie.URL(Name,URLVInfoURL(ID))).map(U =>
			(
				U = ZED.QueryString(U).url,
				U || ZED.Throw(Util.ReplaceLang(ZED.BadE,Q.error)),
				ZED.ReduceToObject
				(
					KeyQueue.Title,Util.DecodeHTML(Util.MF(/itle>([^<]+)/,Q)),
					KeyQueue.Author,Util.DecodeHTML(Util.MF(/name>([^<]+)/,Q)),
					KeyQueue.Date,Util.MF(/ieve>([^<]+)/,Q),
					KeyQueue.Part,[ZED.ReduceToObject
					(
						KeyQueue.URL,[U],
						KeyQueue.Suffix,'.' + Util.MF(/e_type>([^<]+)/,Q)
					)],
					KeyQueue.Sizes,[Number(Util.MF(/high>([^<]+)/,Q))]
				)
			))
		)),
	KeySite.IDView,ZED.add('sm'),
	KeySite.IDLink,URLVideo,
	KeySite.Pack,(S,Q) => Util.RequestHead(Cookie.URL(Name,URLVideo(Q[KeyQueue.ID])))
		.map(H =>
		(
			Cookie.Save(Name,H),
			Cookie.URL(Name,S)
		)).delay(1000)
);

module.exports = R