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

Name = 'Bilibili',
PageSize = 30,

PadURL = ZED.replace(/^\/\//,'http://'),

Appkey = '20bee1f7a18a425c',
APPAppkey = '1d8b6e7d45233436',
APPSecretKey = '560c52ccd288fed045859ed18bffd973',
APPAccessKey = 'd83e170b84ddd7c0bb1fa5510087f13d',
URLParam = (Q,R) =>
(
	Q = ZED.Merge(
	{
		access_key : APPAccessKey,
		appkey : APPAppkey
	},Q),
	R = ZED.Reduce(Q,(D,F,V) =>
	{
		D.push(F + '=' + V)
	},[]).sort(),
	R = R.join('&'),
	R + '&sign=' + ZED.Code.MD5(R + APPSecretKey).toLowerCase()
),

URLCaptcha = 'https://passport.bilibili.com/captcha',
URLLoginKey = 'https://passport.bilibili.com/login?act=getkey',
URLLogin = 'https://passport.bilibili.com/login/dologin',
URLLoginCheck = 'https://api.bilibili.com/x/web-interface/nav',
DomainSpace = 'http://space.bilibili.com/',
URLSpace = ZED.URLBuild(DomainSpace,'ajax/member/getSubmitVideos?mid=',Util.U,'&pagesize=',PageSize,'&page=',Util.U),
URLBangumi = ZED.URLBuild('http://bangumi.bilibili.com/jsonp/seasoninfo/',Util.U,'.ver?callback=seasonListCallback&jsonp=jsonp'),
URLMylist = ZED.URLBuild('http://www.bilibili.com/mylist/mylist-',Util.U,'.js'),
URLDynamicNew = ZED.URLBuild('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=',Util.U,'&type_list=8,512'),
URLDynamicHistory = ZED.URLBuild('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_history?uid=',Util.U,'&type_list=8,512&offset_dynamic_id=',Util.U),
URLFollowing = ZED.URLBuild('http://api.bilibili.com/x/relation/followings?vmid=',Util.U,'&pn=',Util.U),
URLSearchMain = 'http://search.bilibili.com/all',
URLSearch = ZED.URLBuild('http://search.bilibili.com/api/search?search_type=all&keyword=',Util.U,'&page=',Util.U,Util.U),
// URLSearchBangumi = ZED.URLBuild('https://app.bilibili.com/x/v2/search/type?keyword=',Util.U,'&type=1'),
URLSearchHint = ZED.URLBuild('http://s.search.bilibili.com/main/suggest?func=suggest&sub_type=tag&tag_num=10&term=',Util.U),
URLVInfo = ZED.URLBuild('http://api.bilibili.com/view?id=',Util.U,'&batch=1&appkey=',Appkey,'&type=json'),
URLVInfoURL = Q => 'http://interface.bilibili.com/playurl?' + URLParam(
{
	cid : Q,
	quality : 4,
	otype : 'json'
}),
URLVInfoUToken = ZED.URLBuild('https://api.bilibili.com/x/player/playurl/token?aid=',Util.U,'&cid=',Util.U,'&jsonp=jsonp'),
URLVideo = ZED.URLBuild('http://www.bilibili.com/video/av',Util.U),
URLPlayer = 'http://static.hdslb.com/player/js/bilibiliPlayer.min.js',

FrameTool,
FrameRepeater = ZED.Repeater(),
//BishiID,
//BishiMethod,
BishiSign,
BishiReturned,
// BishiCall = Q => BishiReturned = Q,
Bishi,
BishiDomain =
[
	'interface.bilibili.com/v2/playurl?',
	'bangumi.bilibili.com/player/web_api/v2/playurl?',
	'bangumi.bilibili.com/player/web_api/playurl?'
],
TryBishi = (Q,B,Quality) =>
{
	if (BishiSign) try
	{
		BishiReturned = Util.F
		// Bishi.U = BishiCall
		B ?
			BishiSign(BishiDomain[1],true,Q,4,'',`module=bangumi&season_type=${B}&qn=${Quality || 112}`,0) :
			BishiSign(BishiDomain[0],true,Q,Quality || 112,'','qn=' + (Quality || 112),0)
	}
	catch(e){}
	return BishiReturned
},
BishiURL = (Q,B,Quality) => TryBishi(Q,B,Quality) || URLVInfoURL(Q),
DynamicOffset = [],
CachedVideo = {},
FilterMenu,

MakeURL = (ID,CID,Season,Token,Quality) => Util.RequestBody(Cookie.URL
(
	Name,
	BishiURL(CID,Season,Quality) + (!Season && Token ? '&utoken=' + encodeURIComponent(Token) : ''),
	{Referer : 'http://www.bilibili.com/video/av' + ID}
)).map(ZED.JTO),

Overspeed = ZED.Mark(),
MaybeOverspeed = Q => -503 === Q.code &&
(
	Util.Debug(__filename,'Overspeed'),
	ZED.Throw(Overspeed)
),
OverspeedRetry = Q => Q.tap(E => Overspeed === E || ZED.Throw(E)).delay(2000),
R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/^(?!.*\/t\.bilibili).*\.bilibili\.|^av\d+$|^bilibili:\/\//i,
	KeySite.Frame,Reg =>
	{
		// BishiMethod = Component.Data(Name) || []
		// BishiID = BishiMethod[0]
		// BishiMethod = BishiMethod[1]
		FrameTool = Reg(W =>
		{
			W.$ = W.jQuery = ZED.Merge(() => ({data : ZED.noop}),{ajax : Q => BishiReturned = Q && Q.url},ZED.jQuery)
			W.setTimeout = Q => Q()
			ZED.delete_('localStorage',W)
			W.JSON.parse = ZED.JTO
			Object.defineProperty(W.document,'cookie',{value : ''})
			W.BISHI = {U : ZED.noop}
			W.console = {log : ZED.noop}
		},W =>
		{
			Bishi = W.BISHI || {}
			if (BishiSign = Bishi.R)
			{
				FilterMenu = Bishi.S
				FrameRepeater.finish()
			}
			else FrameRepeater.error('Failed to load sign function')
		},Component.Data(Name))
	},
	KeySite.Component,Say =>
	(
		Say(Util.ReplaceLang(Lang.LoadScr,L(Lang.Player))),
		Util.ajax(URLPlayer).flatMap(ScriptPlayer =>
		(
			ScriptPlayer = ZED.ReplaceList
			(
				ScriptPlayer,
				// Remove initial loading
				/(\(global\)\s*{)(?:[a-z.=]*__webpack_require__\(\d+\);)+/,'$1',
				// Exports loader,
				// /function ([a-z]+)[^}]*?MODULE_NOT_FOUND/,'BISHI.R=$1;$&',
				// Export call
				/[\w.]+\("r",null,"(?:number|string)+/,'BISHI.R=$&'
				// Export url
				// /\$\.ajax\({url:([a-z.]+\([a-z]\))/i,'return BISHI.U($1);$&'
			),

			// BishiID = Number(Util.MF(/}],(\d+):\[func[^{]+{[^{]+{ try {/,ScriptPlayer)),
			// BishiMethod = Util.MF(/([^.]+)\("r",null,"(?:number )+/,ScriptPlayer),

			Say(Util.ReplaceLang(Lang.LoadScr,L(Lang.Search))),
			Util.ajax(URLSearchMain)
				.flatMap(Q =>
					(Q = Util.MU(/\/\/[^>]+search\.[^>]+\.js/,Q)) ?
						Util.ajax(PadURL(Q)).map(V => '\n;BISHI.S=' + Util.MF(/{menus:(\[.*?\]),/,V)) :
						Observable.just(''))
				.flatMap(Q =>
				(
					Say(L(Lang.FileWrite)),
					Util.writeFile(FrameTool[0],ScriptPlayer + ZED.UTF(Q))
				))
		)).flatMap(() =>
		(
			Component.Save(ZED.objOf(Name,9)),
			FrameRepeater = ZED.Repeater(),
			FrameTool[1](),
			FrameRepeater
		))
	),
	KeySite.ComCheck,() => TryBishi(0) ?
		Observable.empty() :
		Observable.throw(L(Lang.ComNot)),
	KeySite.VCode,() => Util.RequestFull(
	{
		url : URLCaptcha,
		headers : Cookie.Head(Name),
		encoding : Util.N
	}).map(H =>
	(
		Cookie.Save(Name,H[0]),
		H[1]
	)),
	KeySite.Login,(ID,PW,Code) => Util.RequestFull(Cookie.URL(Name,URLLoginKey))
		.flatMap((H,Q) =>
		(
			Cookie.Save(Name,H[0]),
			Q = ZED.JTO(H[1]),
			Util.RequestFull(
			{
				url : URLLogin,
				method : 'post',
				headers : Cookie.Head(Name),
				form :
				{
					act : 'login',
					keeptime : 2592000,
					userid : ID,
					pwd : ZED.Code.RSAEncode(Q.key || '',Q.hash + PW),
					vdcode : Code
				},
				followRedirect : Util.F
			})
		)).map(H =>
		(
			Cookie.Save(Name,H[0]),
			H[1] ? Util.MF(/<div[^>]+>\s*([^<]+)/,H[1]).trim() : L(Lang.Signed)
		)),
	KeySite.Check,() => Util.RequestBody(Cookie.URL(Name,URLLoginCheck))
		.map(Q => ZED.path(['data','uname'],ZED.JTO(Q))),
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^(\d+)$/,Util.MakeLabelNumber('av')],
		KeySite.Page,(ID,X) => (1 < X && CachedVideo[ID] ?
			Observable.just(CachedVideo[ID]) :
			Util.RequestBody(Cookie.URL(Name,URLVInfo(ID))).map(Q =>
			(
				Q = ZED.JTO(Q),
				(Q.error || Q.code) && ZED.Throw(Util.ReplaceLang
				(
					Lang.BadCE,
					Q.code,String(Q.error || Q.message)
				)),
				CachedVideo[ID] = Q
			))).map((Q,R) =>
			(
				R = (1 < X ? [] : [ZED.ReduceToObject
				(
					KeySite.ID,ID,
					KeySite.Img,Q.pic,
					KeySite.Title,Q.title,
					KeySite.Author,Q.author,
					KeySite.AuthorLink,DomainSpace + Q.mid,
					KeySite.Date,1000 * Q.created
				)]).concat
				(
					1 < Q.pages ?
						ZED.map(V => ZED.ReduceToObject
						(
							KeySite.ID,ID + '#' + (V.page - 1),
							KeySite.Index,V.page,
							KeySite.Img,Q.pic,
							KeySite.Title,V.part
						),Q.list.slice(R = PageSize * (X - 1),R + PageSize)) :
						[]
				),
				ZED.ReduceToObject
				(
					KeySite.Pages,Math.ceil(Q.pages / PageSize),
					KeySite.Total,1 < Q.pages ? 1 + Q.pages : 1,
					KeySite.Item,R
				)
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[Util.MakeLabelNumber('space')],
		KeySite.Page,(ID,X) => Util.RequestBody(Cookie.URL(Name,URLSpace(ID,X)))
			.map(Q =>
			(
				Q = ZED.JTO(Q),
				Q.status || ZED.Throw(L(Lang.Bad)),
				Q = Q.data,
				(Q.vlist && Q.vlist.length) || ZED.Throw(L(Lang.EmptyList)),
				ZED.ReduceToObject
				(
					KeySite.Pages,Q.pages,
					KeySite.Total,Q.count,
					KeySite.PageSize,PageSize,
					KeySite.Item,ZED.map(V => ZED.ReduceToObject
					(
						KeySite.ID,V.aid,
						KeySite.Img,V.pic,
						KeySite.Title,V.title,
						KeySite.Author,V.author,
						KeySite.AuthorLink,DomainSpace + ID,
						KeySite.Date,1000 * V.created,
						KeySite.Length,V.length
					),Q.vlist || [])
				)
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Bangumi),
		KeySite.Judge,[Util.MakeLabelNumber('(?:anime|bangumi)')],
		KeySite.Page,ID => Util.RequestBody(URLBangumi(ID)).map(Q =>
		(
			Q = ZED.JTO(Q.replace(/^[a-z]+\(|\);\s*$/ig,'')),
			Q.code && ZED.Throw(Util.ReplaceLang
			(
				Lang.BadCE,
				Q.code,Q.message
			)),
			Q = Q.result,
			ZED.ReduceToObject
			(
				KeySite.Pages,1,
				KeySite.Total,Q.seasons.length + Q.episodes.length,
				KeySite.Item,ZED.map(V => ZED.ReduceToObject
				(
					KeySite.Img,V.cover,
					KeySite.Title,V.title,
					KeySite.Author,V.season_id,
					KeySite.AuthorLink,URLBangumi(V.season_id)
				),Q.seasons).concat(ZED.map(V => ZED.ReduceToObject
				(
					KeySite.Index,V.index,
					KeySite.ID,V.av_id,
					KeySite.Img,V.cover,
					KeySite.Title,V.index_title,
					KeySite.Date,V.update_time
				),Q.episodes))
			)
		))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Mylist),
		KeySite.Judge,[Util.MakeLabelNumber('mylist')],
		KeySite.Page,ID => Util.RequestBody(URLMylist(ID))
			.map((Q,With) =>
			{
				Q || ZED.Throw(L(Lang.Bad))
				With =
				{
					author : '',
					description : '',
					uplist : [],
					playlist : [],
					initPlayerList : ZED.noop
				}
				try{ZED.eval_.call(With,Q)}
				catch(e){}

				return ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,With.playlist.length,
					KeySite.Item,ZED.map(V => ZED.ReduceToObject
					(
						KeySite.ID,V.aid,
						KeySite.Title,V.title,
						KeySite.Date,1000 * V.pubdate
					),With.playlist)
				)
			})
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Dynamic),
		KeySite.Judge,[/^(?:dynamic)?$/i],
		KeySite.Page,(Q,X) =>
		(
			Q = Util.CookieTo(Cookie.Read(Name)).DedeUserID,
			Q ? Util.RequestBody(Cookie.URL
			(
				Name,
				1 < X && DynamicOffset[X - 2] ?
					URLDynamicHistory(Q,DynamicOffset[X - 2]) :
					URLDynamicNew(Q)
			)).map(Q =>
			(
				Q = ZED.JTO(Q),
				Q.code && ZED.Throw(Util.ReplaceLang(Lang.BadC,Q.code)),
				Q = Q.data.cards,
				Q.length && (DynamicOffset[X - 1] = ZED.last(Q).desc.dynamic_id),
				ZED.ReduceToObject
				(
					KeySite.Pages,1 + DynamicOffset.length,
					KeySite.Total,Q.length,
					KeySite.Item,ZED.map(V =>
					(
						V = ZED.JTO(V.card),
						ZED.ReduceToObject
						(
							KeySite.ID,V.aid,
							KeySite.Img,V.pic,
							KeySite.Title,V.title,
							KeySite.Author,V.owner.name,
							KeySite.AuthorLink,DomainSpace + V.owner.mid,
							KeySite.Date,V.ctime,
							KeySite.Length,ZED.SecondsToString(V.duration)
						)
					),Q)
				)
			)) : Observable.Throw(L(Lang.NotSigned))
		)
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Following),
		KeySite.Judge,Util.RFollow,
		KeySite.Page,(Q,X) =>
		(
			Q = Util.CookieTo(Cookie.Read(Name)).DedeUserID,
			Q ? Util.RequestBody(URLFollowing(Q,X)).map(Q =>
			(
				Q = ZED.JTO(Q),
				Q.code && ZED.Throw(Util.ReplaceLang(Lang.BadCE,Q.code,Q.message)),
				Q = Q.data.list,
				ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,Q.length,
					KeySite.Item,ZED.map(V => ZED.ReduceToObject
					(
						KeySite.ID,Util.F,
						KeySite.Img,V.face,
						KeySite.Author,V.uname,
						KeySite.AuthorLink,DomainSpace + V.mid
					),Q)
				)
			)) : Observable.throw(L(Lang.NotSigned))
		)
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Search),
		KeySite.Judge,Util.RSearch,
		KeySite.Page,(Raw,X,O) => Util.RequestBody(Util.MakeSearch(URLSearch,Raw,X,O))
			.map((Q,R) =>
			{
				Q = ZED.JTO(Q)
				Q.code && ZED.Throw(Util.ReplaceLang
				(
					Lang.BadCE,
					Q.code,Q.text
				))
				Q.result || ZED.Throw(L(Lang.Bad))
				R = ZED.ReduceToObject
				(
					KeySite.Pages,Q.numPages,
					KeySite.Total,Q.numResults,
					KeySite.PageSize,Q.pagesize,
					KeySite.Item,ZED.concat
					(
						1 < X ? [] : ZED.map(V => ZED.ReduceToObject
						(
							KeySite.Img,PadURL(V.cover),
							KeySite.Title,V.title,
							KeySite.Author,V.season_id,
							KeySite.AuthorLink,V.goto_url,
							KeySite.Date,1E3 * V.pubdate
						),Q.result.media_bangumi),
						ZED.map(V => ZED.ReduceToObject
						(
							KeySite.ID,V.aid,
							KeySite.Img,PadURL(V.pic),
							KeySite.Title,V.title,
							KeySite.Author,V.author,
							KeySite.AuthorLink,DomainSpace + V.mid,
							KeySite.Date,1E3 * V.pubdate,
							KeySite.Length,V.duration
						),Q.result.video)
					)
				)
				if (FilterMenu)
				{
					Q = {}
					R[KeySite.Pref] = ZED.reduce((D,V,R) =>
					{
						D.push(
						[
							V.alias = V.alias.replace(/_1/,''),
							R = ZED.reduce((D,V) =>
							{
								D.push([V.name,V.val])
							},[],V.cell)
						])
						Q[V.alias] = R[0][1]
					},[],FilterMenu)
					R[KeySite.PrefDef] = Q
				}
				return R
			}),
		KeySite.Hint,Q => Util.RequestBody(URLSearchHint(encodeURIComponent(Q)))
			.map(Q =>
			{
				var R = [],F;
				Q = ZED.JTO(Q)
				for (F = 0;F < 10 && Q[F];++F) R.push(Q[F].value)
				return R
			})
	)],
	KeySite.URL,ID => Util.RequestBody(Cookie.URL(Name,URLVInfo((ID = ('' + ID).split('#'))[0])))
		.flatMap(Q =>
		{
			var
			R = {},
			Part = [],
			Sizes = [];

			Q = ZED.JTO(Q)
			MaybeOverspeed(Q)
			Q.list || ZED.Throw(Util.ReplaceLang
			(
				Lang.BadCE,
				Q.code,Q.error || Q.message
			))
			ZED.ReduceToObject
			(
				R,
				KeyQueue.Title,Q.title + (ID[1] ? '.' + Util.PadTo(Q.list.length,ID[1]) : ''),
				KeyQueue.Author,Q.author,
				KeyQueue.Date,1000 * Q.created
			)

			return Util.RequestBody(Cookie.URL(Name,URLVideo(ID[0])))
				.flatMap(Season =>
				(
					Season = Util.MF(/season_type":(\d+)/,Season),
					(ID[1] ? Observable.just(Q.list[ID[1]]) : Util.from(Q.list))
						.flatMapOnline(1,V => Util.RequestBody(Cookie.URL(Name,URLVInfoUToken(ID[0],V.cid)))
							.flatMap(Token =>
							(
								Token = ZED.path(['data','token'],ZED.JTO(Token)),
								MakeURL(ID[0],V.cid,Season,Token)
									.flatMap((B,T) =>
									(
										T = B.accept_quality && Math.max(...B.accept_quality),
										T && B.quality < T ?
											MakeURL(ID[0],V.cid,Season,Token,T) :
											Observable.just(B)
									))
							))
							.tap((B,D) =>
							{
								MaybeOverspeed(B)
								D = B.durl
								D || ZED.Throw(L(Lang.Bad))
								ZED.isArray(D) || (D = [D])
								Sizes.push(ZED.pluck('size',D))
								Part.push(D = ZED.ReduceToObject
								(
									KeyQueue.URL,ZED.pluck('url',D),
									KeyQueue.Suffix,'.' + B.format.replace(/hd/,'').replace(/^flv.+/,'flv')
								))
								V.part && Q.title !== V.part && (D[KeyQueue.Title] = V.part)
							}).retryWhen(OverspeedRetry))
					.finish()
					.map(() =>
					(
						R[KeyQueue.Part] = Part,
						R[KeyQueue.Sizes] = ZED.flatten(Sizes),
						R
					))
				))
		})
		.retryWhen(OverspeedRetry),
	KeySite.IDView,ZED.add('av'),
	KeySite.IDLink,URLVideo,
	KeySite.Pack,Q => (
	{
		url : Q,
		headers : {Referer : 'http://static.hdslb.com/play.swf'},
		timeout : 2500
	})
);

module.exports = R