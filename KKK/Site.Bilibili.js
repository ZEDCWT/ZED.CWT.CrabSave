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

Name = 'Bilibili',
PageSize = 30,

PadURL = ZED.replace(/^\/\//,'http://'),

Appkey = '20bee1f7a18a425c',
APPAppkey = '1d8b6e7d45233436',
APPSecretKey = '560c52ccd288fed045859ed18bffd973',
APPAccessKey = 'd83e170b84ddd7c0bb1fa5510087f13d',
URLParam = function(Q,R)
{
	Q = ZED.Merge(
	{
		access_key : APPAccessKey,
		appkey : APPAppkey
	},Q)
	R = ZED.Reduce(Q,function(D,F,V)
	{
		D.push(F + '=' + V)
	},[])
	R.sort()
	R = R.join('&')
	return R + '&sign=' + ZED.Code.MD5(R + APPSecretKey).toLowerCase()
},

URLCaptcha = 'https://passport.bilibili.com/captcha',
URLLoginKey = 'https://passport.bilibili.com/login?act=getkey',
URLLogin = 'https://passport.bilibili.com/login/dologin',
URLLoginCheck = 'http://space.bilibili.com/ajax/member/MyInfo',
URLSpace = ZED.URLBuild('http://space.bilibili.com/ajax/member/getSubmitVideos?mid=',Util.U,'&pagesize=',PageSize,'&page=',Util.U),
URLMylist = ZED.URLBuild('http://www.bilibili.com/mylist/mylist-',Util.U,'.js'),
URLDynamic = ZED.URLBuild('http://api.bilibili.com/x/feed/pull?type=0&ps=',PageSize,'&pn=',Util.U),
URLSearchMain = 'http://search.bilibili.com/all',
URLSearch = ZED.URLBuild('http://search.bilibili.com/ajax_api/video?keyword=',Util.U,'&page=',Util.U,Util.U),
URLVInfo = ZED.URLBuild('http://api.bilibili.com/view?id=',Util.U,'&batch=1&appkey=',Appkey,'&type=json'),
URLVInfoURL = function(Q)
{
	return 'http://interface.bilibili.com/playurl?' + URLParam(
	{
		cid : Q,
		quality : 4,
		otype : 'json'
	})
},
URLPlayer = 'http://static.hdslb.com/player/js/bilibiliPlayer.min.js',

FrameTool,
FrameRepeater = ZED.Repeater(),
BishiID,
BishiMethod,
BishiSign,
BishiReturned,
BishiCall = function(Q){BishiReturned = Q},
Bishi,
TryBishi = function(Q,B)
{
	if (BishiSign) try
	{
		BishiReturned = Util.F
		Bishi.U = BishiCall
		B ? BishiSign(1,1,Q,4,'','module=bangumi',0) : BishiSign(0,1,Q,4,'',Util.N,0)
	}
	catch(e){}
	return BishiReturned
},
BishiURL = function(Q,B)
{
	return TryBishi(Q,B) || URLVInfoURL(Q)
},
FilterMenu,

Overspeed = ZED.Mark(),
MaybeOverspeed = function(Q)
{
	-503 === Q.code &&
	(
		Util.Debug(__filename,'Overspeed'),
		ZED.Throw(Overspeed)
	)
},
OverspeedRetry = function(Q)
{
	return Q.tap(function(E){Overspeed === E || ZED.Throw(E)})
		.delay(2000)
},
R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.bilibili\.|^av\d+$/i,
	KeySite.Frame,function(Reg)
	{
		BishiMethod = Component.Data(Name) || []
		BishiID = BishiMethod[0]
		BishiMethod = BishiMethod[1]
		FrameTool = Reg(function(W)
		{
			W.$ = W.jQuery = ZED.Merge(function(){},ZED.jQuery)
			W.setTimeout = function(Q){Q()}
			ZED.delete_('localStorage',W)
			W.JSON.parse = ZED.JTO
			Object.defineProperty(W.document,'cookie',{value : ''})
			W.BISHI = {U : ZED.noop}
		},function(W)
		{
			Bishi = W.BISHI
			try
			{
				//Sign
				BishiSign = Bishi.R(BishiID)[BishiMethod]
					('r',Util.N,'number number number number string string number'.split(' '))
				FilterMenu = W.filterMenu
				FrameRepeater.finish()
			}
			catch(e){FrameRepeater.error(e)}
		},BishiID && BishiMethod)
	},
	KeySite.Component,function()
	{
		return Util.ajax(URLPlayer).flatMap(function(ScriptPlayer)
		{
			ScriptPlayer = ZED.ReplaceList
			(
				ScriptPlayer,
				//Remove initial loading
				/(\(global\)\s*{)(?:[a-z.=]*__webpack_require__\(\d+\);)+/,'$1',
				//Exports loader,
				/function ([a-z]+)[^}]*?MODULE_NOT_FOUND/,'BISHI.R=$1;$&',
				//Export url
				/\$\.ajax\({url:([a-z.]+\([a-z]\))/,'return BISHI.U($1);$&'
			)

			//Module ID
			BishiID = Number(Util.MF(/}],(\d+):\[func[^{]+{[^{]+{ try {/,ScriptPlayer))
			//Method
			BishiMethod = Util.MF(/([^.])\("r",null,"(?:number )+/,ScriptPlayer)

			return Util.ajax(URLSearchMain).flatMap(function(Q)
			{
				Q = Util.MF(/"([^"]+search[^"]+\.js)/,Q)
				return Q ? Util.ajax(PadURL(Q)) : Observable.just('')
			}).flatMap(function(Q)
			{
				return Util.writeFile(FrameTool[0],ScriptPlayer + ZED.UTF(Q))
			})
		}).flatMap(function()
		{
			Component.Save(ZED.objOf(Name,[BishiID,BishiMethod]))
			FrameRepeater = ZED.Repeater()
			FrameTool[1]()
			return FrameRepeater
		})
	},
	KeySite.ComCheck,function()
	{
		return TryBishi(0) ? Observable.empty() : Observable.throw(L(Lang.ComNot))
	},
	KeySite.VCode,function()
	{
		return Util.RequestFull(
		{
			url : URLCaptcha,
			headers : Cookie.Head(Name),
			encoding : Util.N
		}).map(function(H)
		{
			Cookie.Save(Name,H[0])
			return H[1]
		})
	},
	KeySite.Login,function(ID,PW,Code)
	{
		return Util.RequestFull(Cookie.URL(Name,URLLoginKey)).flatMap(function(H,Q)
		{
			Cookie.Save(Name,H[0])
			Q = ZED.JTO(H[1])
			return Util.RequestFull(
			{
				url : URLLogin,
				method : 'post',
				headers : Cookie.Head(Name),
				form :
				{
					act : 'login',
					keeptime : 3E8,
					userid : ID,
					pwd : ZED.Code.RSAEncode(Q.key || '',Q.hash + PW),
					vdcode : Code
				},
				followRedirect : Util.F
			})
		}).map(function(H)
		{
			Cookie.Save(Name,H[0])
			return H[1] ? Util.MF(/<div[^>]+>\s*([^<]+)/,H[1]).trim() : L(Lang.Signed)
		})
	},
	KeySite.Check,function()
	{
		return Util.RequestBody(Cookie.URL(Name,URLLoginCheck)).map(function(Q)
		{
			return ZED.path(['data','uname'],ZED.JTO(Q))
		})
	},
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^(\d+)$/,Util.MakeLabelNumber('av')],
		KeySite.Page,function(ID)
		{
			return Util.RequestBody(Cookie.URL(Name,URLVInfo(ID))).map(function(Q)
			{
				Q = ZED.JTO(Q)
				Q.error && ZED.Throw(Util.ReplaceLang
				(
					Lang.BadCE,
					Q.code || '-',Q.error || '-'
				))

				return ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.Index,0,
						KeySite.ID,ID,
						KeySite.Img,Q.pic,
						KeySite.Title,Q.title,
						KeySite.Author,Q.author,
						KeySite.Date,new Date(1000 * Q.created)
					)]
				)
			})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[Util.MakeLabelNumber('space')],
		KeySite.Page,function(ID,X)
		{
			return Util.RequestBody(Cookie.URL(Name,URLSpace(ID,X))).map(function(Q)
			{
				Q = ZED.JTO(Q)
				Q.status || ZED.Throw(L(Lang.Bad))
				Q = Q.data
				;(Q.vlist && Q.vlist.length) || ZED.Throw(L(Lang.EmptyList))

				return ZED.ReduceToObject
				(
					KeySite.Pages,Q.pages,
					KeySite.Total,Q.count,
					KeySite.Item,ZED.Map(Q.vlist || [],function(F,V)
					{
						return ZED.ReduceToObject
						(
							KeySite.Index,PageSize * (X - 1) + F,
							KeySite.ID,V.aid,
							KeySite.Img,V.pic,
							KeySite.Title,V.title,
							KeySite.Author,V.author,
							KeySite.Date,new Date(1000 * V.created)
						)
					})
				)
			})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Mylist),
		KeySite.Judge,[Util.MakeLabelNumber('mylist')],
		KeySite.Page,function(ID)
		{
			return Util.RequestBody(URLMylist(ID)).map(function(Q,With)
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
					KeySite.Item,ZED.Map(With.playlist,function(F,V)
					{
						return ZED.ReduceToObject
						(
							KeySite.Index,F,
							KeySite.ID,V.aid,
							KeySite.Title,V.title,
							KeySite.Date,new Date(1000 * V.pubdate)
						)
					})
				)
			})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Dynamic),
		KeySite.Judge,[/^(?:dynamic)?$/i],
		KeySite.Page,function(_,X)
		{
			return Util.RequestBody(Cookie.URL(Name,URLDynamic(X))).map(function(Q)
			{
				Q = ZED.JTO(Q)
				Q.data || ZED.Throw(Util.ReplaceLang(Lang.BadC,Q.code))
				Q = Q.data

				return ZED.ReduceToObject
				(
					KeySite.Pages,Math.ceil(Q.page.count / Q.page.size),
					KeySite.Total,Q.page.count,
					KeySite.Item,ZED.Map(Q.feeds || [],function(F,V)
					{
						V = V.addition
						return ZED.ReduceToObject
						(
							KeySite.Index,PageSize * (X - 1) + F,
							KeySite.ID,V.aid,
							KeySite.Img,V.pic,
							KeySite.Title,V.title,
							KeySite.Author,V.author,
							KeySite.Date,new Date(V.create)
						)
					})
				)
			})
		}
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Search),
		KeySite.Judge,[/^(?:find|search)\s+(.*)$/i],
		KeySite.Page,function(Q,X,O)
		{
			return Util.RequestBody(Util.MakeSearch(URLSearch,Q,X,O)).map(function(Q,R)
			{
				Q = ZED.JTO(Q)
				Q.code && ZED.Throw(Util.ReplaceLang
				(
					Lang.BadCE,
					Q.code,Q.text
				))
				Q.html || ZED.Throw(L(Lang.Bad))
				R = []
				Util.ML(/<li[^]+?<\/li/g,Q.html,function(Q)
				{
					R.push(ZED.ReduceToObject
					(
						KeySite.Index,PageSize * (X - 1) + R.length,
						KeySite.ID,Util.MF(/av(\d+)/,Q),
						KeySite.Img,PadURL(Util.MF(/src="([^"]+)/,Q)),
						KeySite.Title,Util.MF(/title".+?title="([^"]+)/,Q),
						KeySite.Author,Util.MF(/up-name[^>]+>([^<]+)/,Q),
						KeySite.Date,Util.MF(/-date.+?i>([^<]+)/,Q).trim()
					))
				})
				R = ZED.ReduceToObject
				(
					KeySite.Pages,Q.numPages,
					KeySite.Total,Q.numResults,
					KeySite.Item,R
				)
				if (FilterMenu)
				{
					Q = {}
					R[KeySite.Pref] = ZED.reduce(function(D,V,R)
					{
						D.push(
						[
							V.alias,
							R = ZED.reduce(function(D,V)
							{
								D.push([V.name,V.val])
							},[],V.cell)
						])
						Q[V.alias] = R[0][1]
					},[],FilterMenu)
					R[KeySite.PrefDef] = Q
				}

				return R
			})
		}
	)],
	KeySite.URL,function(ID)
	{
		return Util.RequestBody(Cookie.URL(Name,URLVInfo(ID))).flatMap(function(Q)
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
				KeyQueue.Author,Q.author,
				KeyQueue.Date,1000 * Q.created
			)

			return Observable.from(Q.list).flatMapOnline(1,function(V)
			{
				return Util.RequestBody(Cookie.URL(Name,BishiURL(V.cid,Q.bangumi),
				{
					Referer : 'http://static.hdslb.com/play.swf'
				})).map(function(B,D)
				{
					B = ZED.JTO(B)
					MaybeOverspeed(B)
					D = B.durl
					D || ZED.Throw(L(Lang.Bad))
					ZED.isArray(D) || (D = [D])
					Sizes.push(ZED.pluck('size',D))
					B = B.format
					;/hdflv/.test(B) && (B = 'flv')
					Part.push(D = ZED.ReduceToObject
					(
						KeyQueue.Title,V.part,
						KeyQueue.URL,ZED.pluck('url',D),
						KeyQueue.Suffix,'.' + B.replace(/^hd/,'')
					))
					V.part || ZED.delete_(KeyQueue.Title,D)
				})
				.retryWhen(OverspeedRetry)
			})
			.finish()
			.map(function()
			{
				R[KeyQueue.Part] = Part
				R[KeyQueue.Sizes] = ZED.flatten(Sizes)
				return R
			})
		})
		.retryWhen(OverspeedRetry)
	},
	KeySite.IDView,ZED.add('av'),
	KeySite.Pack,ZED.identity
);

module.exports = R