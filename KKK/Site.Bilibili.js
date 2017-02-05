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

Name = 'Bilibili',
PageSize = 30,

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
URLSpace = ZED.URLBuild('http://space.bilibili.com/ajax/member/getSubmitVideos?mid=',Util.U,'&pagesize=',PageSize,'&page=',Util.U),
URLMylist = ZED.URLBuild('http://www.bilibili.com/mylist/mylist-',Util.U,'.js'),
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
URLCaptcha = 'https://passport.bilibili.com/captcha',
URLLoginKey = 'https://passport.bilibili.com/login?act=getkey',
URLLogin = 'https://passport.bilibili.com/login/dologin',
URLLoginCheck = 'http://space.bilibili.com/ajax/member/MyInfo',

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.bilibili\.|^av\d+$/i,
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
		KeySite.Judge,[/^(\d+)$/,Util.MakeLabelID('av')],
		KeySite.Page,function(ID)
		{
			return Util.RequestBody(URLVInfo(ID)).map(function(Q)
			{
				Q = ZED.JTO(Q)

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
		KeySite.Judge,[Util.MakeLabelID('space')],
		KeySite.Page,function(ID,X)
		{
			return Util.RequestBody(URLSpace(ID,X)).map(function(Q)
			{
				Q = ZED.JTO(Q)
				Q.status || ZED.throw(L(Lang.Bad))
				Q = Q.data

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
		KeySite.Judge,[Util.MakeLabelID('mylist')],
		KeySite.Page,function(ID)
		{
			return Util.RequestBody(URLMylist(ID)).map(function(Q,With)
			{
				Q || ZED.throw(L(Lang.Bad))
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
	)],
	KeySite.URL,function(ID,R)
	{
		return Util.RequestBody(URLVInfo(ID))
			.flatMap(function(Q)
			{
				var
				Part = [],
				Sizes = [];

				Q = ZED.JTO(Q)
				Q.list || ZED.throw(Util.ReplaceLang
				(
					Lang.BadCE,
					Q.code,Q.error || Q.message
				))
				ZED.Merge(Util.T,R,ZED.ReduceToObject
				(
					KeyQueue.Author,Q.author,
					KeyQueue.Date,1000 * Q.created
				))

				return Observable.from(Q.list)
					.flatMapOnline(1,function(V)
					{
						return Util.RequestBody(URLVInfoURL(V.cid))
							.map(function(B,D)
							{
								B = ZED.JTO(B)
								D = B.durl
								D || ZED.throw(L(Lang.Bad))
								ZED.isArray(D) || (D = [D])
								Sizes.push(ZED.pluck('size',D))
								Part.push(ZED.ReduceToObject
								(
									KeyQueue.Title,V.part,
									KeyQueue.URL,ZED.pluck('url',D),
									KeyQueue.Suffix,'.' + B.format
								))
							})
					})
					.tap(ZED.noop,ZED.noop,function()
					{
						R[KeyQueue.Part] = Part
						Util.SetSize(R,ZED.flatten(Sizes))
					})
			})
	},
	KeySite.IDView,ZED.add('av'),
	KeySite.Pack,function(S,Q)
	{
		return S
	}
);

module.exports = R