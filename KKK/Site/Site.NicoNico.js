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

Name = 'NicoNico',
PageSize = 30,

URLLogin = 'https://secure.nicovideo.jp/secure/login',
URLLoginCheck = 'http://seiga.nicovideo.jp/',
URLUserPrefix = 'http://www.nicovideo.jp/user/',
URLUser = ZED.URLBuild(URLUserPrefix,Util.U,'/video?page=',Util.U),
URLMylist = ZED.URLBuild('http://www.nicovideo.jp/mylist/',Util.U),
URLRepo = ZED.URLBuild('http://www.nicovideo.jp/api/nicorepo/timeline/my/followingUser?cursor=',Util.U,'&client_app=pc_myrepo'),
URLFollowing = ZED.URLBuild('http://www.nicovideo.jp/my/fav/user?page=',Util.U),
URLSearch = ZED.URLBuild('http://www.nicovideo.jp/search/',Util.U,'?page=',Util.U,Util.U),
URLSearchHint = ZED.URLBuild('http://sug.search.nicovideo.jp/suggestion/complete/',Util.U),
URLVInfo = ZED.URLBuild('http://ext.nicovideo.jp/api/getthumbinfo/sm',Util.U),
URLVideo = ZED.URLBuild('http://www.nicovideo.jp/watch/sm',Util.U),
URLVideoInfo = ZED.URLBuild('http://www.nicovideo.jp/watch/sm',Util.U,'?mode=pc_html5&playlist_token=',Util.U),
URLVIdeoSourceDMC = 'https://api.dmc.nico/api/sessions?_format=json',

MaybeError = Q => /<error>/.test(Q) && ZED.Throw(Util.ReplaceLang
(
	Lang.BadCE,
	Util.MF(/code>([^<]+)/,Q),
	Util.MF(/tion>([^<]+)/,Q)
)),

BestQuality = ZED.pipe(ZED.filter(V => V.available),Util.Best('bitrate')),

RepoCursor,
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
	}).map((H,R) =>
	(
		R = Util.MU(/user_session=(?!deleted)[^;]+/,H = Util.HeaderJoin(H)),
		R || ZED.Throw(H),
		Cookie.Set(Name,R),
		L(Lang.Signed)
	)),
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
					KeySite.PageSize,PageSize,
					KeySite.Item,ZED.reduce
					(
						(D,V,I) =>
						{
							I = Util.MF(/sm(\d+)/,V)
							I && D.push(ZED.ReduceToObject
							(
								KeySite.ID,I,
								KeySite.Img,Util.MF(/src="([^"]+)/,V),
								KeySite.Title,Util.DecodeHTML(Util.MF(/h5>[^>]+>([^<]+)/,V)),
								KeySite.Author,A,
								KeySite.AuthorLink,URLUserPrefix + ID,
								KeySite.Date,Util.DateDirect(ZED.match(/\d+/g,Util.MF(/posttime">([^<]+)/,V)))
							))
						},
						[],
						ZED.match(/outer"(?![^<]+<form)[^]+?<\/p/g,Util.MU(/Body"[^]+?="side/,Q))
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
		KeySite.Judge,[/^(?:repo|my|top|ニコレポ)?$/i],
		KeySite.Page,(_,X) => Util
			.RequestBody(Cookie.URL(Name,URLRepo(RepoCursor && RepoCursor[X - 2] || '')))
			.map(Q =>
			(
				Q = ZED.JTO(Q),
				'ok' === Q.status || ZED.Throw(Util.ReplaceLang(Lang.BadCE,Q.meta.status,Q.status)),
				Q.meta.minId &&
				(
					1 < X ?
						RepoCursor[X - 1] = Q.meta.minId :
						RepoCursor = [Q.meta.minId]
				),
				ZED.ReduceToObject
				(
					KeySite.Pages,1 + RepoCursor.length,
					KeySite.Item,ZED.map(V => ZED.ReduceToObject
					(
						KeySite.ID,V.video.id.substr(2),
						KeySite.Img,V.video.thumbnailUrl.normal,
						KeySite.Title,V.video.title,
						KeySite.Author,V.senderNiconicoUser.nickname,
						KeySite.AuthorLink,URLUserPrefix + V.senderNiconicoUser.id,
						KeySite.Date,V.createdAt
					),ZED.filter(ZED.propEq('topic','nicovideo.user.video.upload'),Q.data))
				)
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Following),
		KeySite.Judge,Util.RFollow,
		KeySite.Page,(_,X) => Util.RequestBody(Cookie.URL(Name,URLFollowing(X)))
			.map(Q => ZED.ReduceToObject
			(
				KeySite.Pages,Util.MF(/>(\d+)<(?![^]*>\d)/,Util.MU(/pager"[^]+?<\/div/,Q)),
				KeySite.Total,Util.MF(/favUser[^(]+\((\d+)/,Q),
				KeySite.Item,Util.MA(/thumbCont[^]+?buttonShape/g,Q,Q => ZED.ReduceToObject
				(
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
							Util.MF(/\?[^=]+=([^&"]+(?:&order=.)?)/,Q.replace(/&amp;/g,'&'))
						]),
						Util.MF(/\?([^=]+)/,Q)
					],
					ZED.last(Q[1])[1] || Q[1].pop(),
					FilterMenuDef[Q[2]] = '',
					Q
				)),
				ZED.ReduceToObject
				(
					KeySite.Pages,ZED.min(Math.ceil(T / 32),50),
					KeySite.Total,T,
					KeySite.PageSize,PageSize,
					KeySite.Item,Util.MA(/video-item[^]+?<\/li/g,Q,(Q,ID) => (ID = Util.MF(/sm(\d+)/,Q)) &&
						ZED.ReduceToObject
						(
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
	KeySite.URL,ID => Util.RequestBody(Cookie.URL(Name,URLVideo(ID)))
		.flatMap(Q => Util.RequestFull(Cookie.URL(Name,URLVideoInfo(ID,Util.MF(/playlistToken&quot;:&quot;([^&]+)/,Q)))))
		.flatMap((Q,O,S) =>
		(
			Cookie.Save(Name,Q[0]),
			Q = ZED.JTO(Q[1]),
			((O = Q.video.dmcInfo) ?
			(
				S = O.session_api,
				Util.RequestBody(
				{
					url : URLVIdeoSourceDMC,
					method : 'post',
					form : ZED.OTJ(
					{
						session :
						{
							recipe_id : S.recipe_id,
							content_id : S.content_id,
							content_type : 'movie',
							content_src_id_sets : [
							{
								content_src_ids : [
								{
									src_id_to_mux :
									{
										video_src_ids : [BestQuality(O.quality.videos).id],
										audio_src_ids : [BestQuality(O.quality.audios).id]
									}
								}]
							}],
							timing_constraint : 'unlimited',
							keep_method : {heartbeat : {lifetime : S.heartbeat_lifetime}},
							protocol :
							{
								name : 'http',
								parameters :
								{
									http_parameters :
									{
										parameters :
										{
											http_output_download_parameters :
											{
												file_extension : 'flv',
												use_well_known_port : 'no'
											}
										}
									}
								}
							},
							content_uri : '',
							session_operation_auth :
							{
								session_operation_auth_by_signature :
								{
									token : S.token,
									signature : S.signature
								}
							},
							content_auth :
							{
								auth_type : S.auth_types.hls,
								content_key_timeout : S.content_key_timeout,
								service_id : ZED.JTO(S.token).service_id,
								service_user_id : S.service_user_id
							},
							client_info : {player_id : S.player_id},
							priority : S.priority
						}
					})
				}).map(U => ZED.JTO(U).data.session.content_uri)
			) : Observable.just(Q.video.smileInfo.url)).map(U => ZED.ReduceToObject
			(
				KeyQueue.Title,Q.video.title,
				KeyQueue.Author,Q.owner.nickname,
				KeyQueue.Date,Q.video.postedDateTime,
				KeyQueue.Part,[ZED.ReduceToObject
				(
					KeyQueue.URL,[U],
					KeyQueue.Suffix,'.flv'
				)]
			))
		)),
	KeySite.IDView,ZED.add('sm'),
	KeySite.IDLink,URLVideo,
	KeySite.Pack,Q => Cookie.URL(Name,Q)
);

module.exports = R