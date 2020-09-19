'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC,N : WN,X : WX} = WW,

TikTok = 'https://www.tiktok.com/',
TikTokShareItemList = WW.Tmpl(TikTok,'share/item/list?id=',undefined,'&count=1&maxCursor=0&minCursor=0&type=4'),
TikTokT = 'https://t.tiktok.com/',
TikTokAPI = TikTokT + 'api/',
TikTokAPIItemDetail = WW.Tmpl(TikTokAPI,'item/detail/?itemId=',undefined),
TikTokAPIMusicDetail = WW.Tmpl(TikTokAPI,'music/detail/?musicId=',undefined,'&language='),
TikTokAcrawler = 'https://sf-tb-sg.ibytedtos.com/obj/rc-web-sdk-sg/acrawler.js',
Happy = WR.Reduce((D,V) =>
{
	D[V] = WW.Top[V]
},{
	[Symbol.toStringTag] : 'Window',
	Object : WW.Merge(function(){},{defineProperty : WW.O}),
	document :
	{
		[Symbol.toStringTag] : 'Document',
		createElement : WR.Const({toDataURL : WW.Key})
	},
	location : {href : '',protocol : ''},
	navigator :
	{
		[Symbol.toStringTag] : 'Navigator',
		userAgent : WW.RUA(),
		plugins : [],
		platform : ''
	},
	history : {[Symbol.toStringTag] : 'History'},
	Image : WW.O,
	console : {log : WW.O},
	PluginArray : Array
},[
	'String',
	'Date',
	'RegExp',
	'JSON',
	'parseInt',
]);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	Sign,SignAt,
	SolveSign = () => WN.ReqB(O.Req(TikTokAcrawler)).Map(B =>
	{
		try
		{
			Function('window',`'use strict';` + B)(Happy)
			B = Happy.byted_acrawler
		}
		catch(_){}
		SignAt = WW.Now()
		return Sign = B && B.sign
	}),
	ReqAPI = Q => (Sign && WW.Now() < 36E5 + SignAt ? WX.Just(Sign) : SolveSign())
		.FMap(S => WN.ReqB(O.Coke(
		{
			UA : Happy.navigator.userAgent = WW.RUA(),
			URL : Q + (/\?/.test(Q) ? '&' : '?') + '_signature=' + (S ? S(
			{
				url : Q
			}) : ''),
			Head :
			{
				Referer : TikTok
			}
		})))
		.Map(B =>
		(
			B = WC.JTO(B),
			B.statusCode && O.Bad(B),
			B
		));
	return {
		URL : Q =>
		{
			if (WR.StartW('Music',Q))
				return ReqAPI(TikTokAPIMusicDetail(Q = Q.slice(5)))
					.FMap(Music => ReqAPI(TikTokShareItemList(Q)).Map(Share => (
					{
						Title : (Music = Music.musicInfo.music).title,
						Up : Music.authorName,
						Date : 1E3 * Share.body.itemListData[0].itemInfos.createTime,
						Part : [{URL : [Music.playUrl]}]
					})))

			return ReqAPI(TikTokAPIItemDetail(Q)).Map(B => (
			{
				Title : (B = B.itemInfo.itemStruct).desc,
				Up : B.author.nickname,
				Date : 1E3 * B.createTime,
				Part : [{URL : [B.video.downloadAddr]}]
			}))
		},
		Pack : Q => WN.ReqOH(Q,'Referer',TikTok)
	}
}