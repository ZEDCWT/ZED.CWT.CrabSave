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

Name = 'QQ',

URLVideo = ZED.URLBuild('https://v.qq.com/x/page/',Util.U,'.html'),
URLInfo = ZED.URLBuild('http://vv.video.qq.com/getinfo?otype=json&vid=',Util.U),
URLInfoKey = ZED.URLBuild('http://vv.video.qq.com/getkey?otype=json&platform=11&format=',Util.U,'&vid=',Util.U,'&filename=',Util.U),

Quality = ['fhd','shd','hd','sd'],
JTO = Q => ZED.JTO(Q.replace(/^[a-z]+=|;$/ig,'')),
Solve = (R,VID,Prefix,ID,SL,Name) => Util
	.RequestBody(URLInfoKey(ID,VID,Name = `${VID}.p${ID % 10000}.${1 + R.length}.mp4`))
	.flatMap(S => (S = JTO(S).key) ?
	(
		R.push(`${Prefix}${Name}?vkey=${S}`),
		Solve(R,VID,Prefix,ID,SL)
	) : Observable.just()),

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.qq\./i,
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/^([0-9a-z]+)$/i,/\/x\/page\/([^.]+)/i],
		KeySite.Page,ID => Util.RequestBody(URLVideo(ID)).flatMap(V =>
			Util.RequestBody(URLInfo(ID))
				.map(I => ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.Index,0,
						KeySite.ID,ID,
						KeySite.Img,Util.MF(/image" content="([^"]+)/,V),
						KeySite.Title,ZED.path(['vl','vi',0,'ti'],JTO(I)),
						KeySite.Author,Util.MF(/author" content="([^"]+)/,V),
						KeySite.Date,Util.MF(/uploadDate" content="([^"]+)/,V)
					)]
				)))
	)],
	KeySite.URL,ID => Util.RequestBody(URLVideo(ID)).flatMap(V =>
		Util.RequestBody(URLInfo(ID))
			.flatMap(I =>
			{
				var
				LI = ZED.path(['vl','vi',0],I = JTO(I)),
				VID = LI.vid,
				Prefix = ZED.path(['ul','ui',0,'url'],LI),
				Format = ZED.path(['fl','fi'],I),FormatMap,
				R = [];

				FormatMap = ZED.reduce((D,V) => {D[V.name] = V},{},Format)
				Format = FormatMap[ZED.find(V => FormatMap[V],Quality)]
				;/\/$/.test(Prefix) || (Prefix += '/')

				return Solve(R,VID,Prefix,Format.id,Format.sl).map(() => ZED.ReduceToObject
				(
					KeyQueue.Author,Util.MF(/author" content="([^"]+)/,V),
					KeyQueue.Date,Util.MF(/uploadDate" content="([^"]+)/,V),
					KeyQueue.Part,[ZED.ReduceToObject
					(
						KeyQueue.URL,R,
						KeyQueue.Suffix,'.mp4'
					)]
				))
			})),
	KeySite.IDView,ZED.identity,
	KeySite.IDLink,URLVideo,
	KeySite.Pack,Q => ({url : Q,timeout : 5E3})
);

module.exports = R