'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,

Name = 'LeTV',
PageSize = 30,

URLVideo = ZED.URLBuild('http://www.le.com/ptv/vplay/',Util.U,'.html'),
URLPlay = ZED.URLBuild('http://player-pc.le.com/mms/out/video/playJson?id=',Util.U,'&platid=1&splatid=101&format=1&tkey=',Util.U,'&domain=www.le.com&region=cn&source=1000&accesyx=1'),
URLUpload = ZED.URLBuild('http://chuang.le.com/u/',Util.U,'/queryvideolist?orderType=0&currentPage=',Util.U,'&pageSize=',PageSize),
URLAuthorLink = ZED.URLBuild('http://chuang.le.com/u/',Util.U),
URLAuthorName = ZED.URLBuild('http://api.chuang.le.com/outer/ugc/video/user/videocount?userid=',Util.U),
URLPlayURL = ZED.URLBuild(Util.U,'&m3v=1&termid=1&format=1&hwtype=un&ostype=MacOS10.12.4&p1=1&p2=10&p3=-&expect=3&tn=',Util.U,'&vid=',Util.U,'&uuid=',Util.U,'&sign=letv'),

TimeKeyMagic = 185025305,
TimeKey = () => TimeKeyMagic ^ ZED.Code.BitRotate(ZED.now() / 1E3,32 - (TimeKeyMagic % 17 % 32)),

SolveAuthorName = UID => Util.RequestBody(URLAuthorName(UID))
	.map(U => ZED.path(['data','nickname'],ZED.JTO(U))),

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/le(?:tv)?\./i,
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.User),
		KeySite.Judge,[/\/u\/(\d+)/i],
		KeySite.Page,(ID,X) => Util.RequestBody(URLUpload(ID,X))
			.flatMap(V => SolveAuthorName(ID)
				.map(U =>
				(
					V = ZED.JTO(V.replace(/^[a-z(]+|\)$/g,'')),
					V.msg && ZED.Throw(Util.ReplaceLang(Lang.BadCE,V.status,V.msg)),
					V = V.data,
					ZED.ReduceToObject
					(
						KeySite.Pages,V.totalPage,
						KeySite.Total,PageSize * V.totalPage,
						KeySite.Item,ZED.Map(V.list,(F,V) => ZED.ReduceToObject
						(
							KeySite.Index,F + PageSize * (X - 1),
							KeySite.ID,V.vid,
							KeySite.Img,V.videoPic,
							KeySite.Title,V.title,
							KeySite.Author,U,
							KeySite.AuthorLink,URLAuthorLink(ID),
							KeySite.Date,V.uploadTime,
							KeySite.Length,V.duration
						))
					)
				)))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^(\d+)$/,/ptv\/vplay\/(\d+)/i],
		KeySite.Page,ID => Util.RequestBody(URLVideo(ID))
			.flatMap(V => Util.RequestBody(URLPlay(ID,TimeKey()))
				.flatMap((I,UID) =>
				(
					I = ZED.JTO(I),
					SolveAuthorName(UID = Util.MF(/userId[:"]+(\d+)/,V))
						.map(U => ZED.ReduceToObject
						(
							KeySite.Pages,1,
							KeySite.Total,1,
							KeySite.Item,[ZED.ReduceToObject
							(
								KeySite.Index,0,
								KeySite.ID,ID,
								KeySite.Img,ZED.find(ZED.T,ZED.path(['msgs','playurl','picAll'],I)),
								KeySite.Title,ZED.path(['msgs','playurl','title'],I),
								KeySite.Author,U,
								KeySite.AuthorLink,URLAuthorLink(UID),
								KeySite.Date,Util.MF(/_time">([^<]+)/,V)
							)]
						))
				)))
	)],
	KeySite.URL,ID => Util.RequestBody(URLVideo(ID))
		.flatMap(V => Util.RequestBody(URLPlay(ID,TimeKey()))
			.flatMap(I =>
			{
				var Dispatch,URL;

				I = ZED.JTO(I)
				Dispatch = ZED.path(['msgs','playurl','dispatch'],I)
				Dispatch = Dispatch['1080p'] ||
					Dispatch['720p'] ||
					Dispatch[ZED.ReduceKey(Dispatch,(D,F) => ZED.max(D,F = Number(F)),0)]
				URL = ZED.path(['msgs','playurl','domain',0],I) + Dispatch[0]

				return Util.RequestBody(URLPlayURL
				(
					URL.replace(/tss=0/,'tss=ios'),
					Math.random(),
					ID,
					ZED.Code.SHA1(URL) + '_0'
				)).flatMap(U => Util.RequestBody(
				{
					url : ZED.JTO(U).location,
					encoding : null
				})).map(U =>
				{
					var R = [];

					U = U.slice(5)
					ZED.each(V => R.push(V >> 4,15 & V),U)
					R = R.slice(-11).concat(R.slice(0,-11))
					R = ZED.Map(U,F => ZED.chr((R[2 * F] << 4) + R[1 + 2 * F]))
					R = R.join('').replace(/(EXTINF.*,)\r?\n/g,'$1')
					R = ZED.Code.M3U(R)

					return ZED.ReduceToObject
					(
						KeyQueue.Date,Util.MF(/_time">([^<]+)/,V),
						KeyQueue.Part,[ZED.ReduceToObject
						(
							KeyQueue.URL,R = ZED.map(V => V[1],R.INF || []),
							KeyQueue.Suffix,'.ts'
						)],
						KeyQueue.Sizes,ZED.map(V => +Util.MF(/(\d+)_\d+_\d+\.ts/,V),R)
					)
				})
			})),
	KeySite.IDView,ZED.identity,
	KeySite.IDLink,URLVideo,
	KeySite.Pack,ZED.identity
);

module.exports = R