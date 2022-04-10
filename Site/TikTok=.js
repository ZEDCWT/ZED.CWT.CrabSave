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
Happy = WN.Evil(`
(U =>
	[
		'String',
		'Date',
		'RegExp',
		'JSON',
		'parseInt',
	].reduce((D,V) => (D[V] = this[V],D),
	{
		[Symbol.toStringTag] : 'Window',
		Object : U.defineProperty = U,
		document :
		{
			[Symbol.toStringTag] : 'Document',
			createElement : () => ({toDataURL : () => '' + Math.random()})
		},
		location : {href : '',protocol : ''},
		navigator :
		{
			[Symbol.toStringTag] : 'Navigator',
			userAgent : '',
			plugins : [],
			platform : ''
		},
		history : {[Symbol.toStringTag] : 'History'},
		Image : U,
		console : {log : U},
		PluginArray : Array
	})
)(function(){})
`,WN.VMO());
Happy.window = Happy

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	Sign,SignAt,
	SolveSign = () => WN.ReqB(O.Req(TikTokAcrawler)).Map(B =>
	{
		try
		{
			WN.Evil(`'use strict';` + B,Happy)
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
						UP : Music.authorName,
						Date : 1E3 * Share.body.itemListData[0].itemInfos.createTime,
						Part : [{URL : [Music.playUrl]}]
					})))

			return ReqAPI(TikTokAPIItemDetail(Q)).Map(B => (
			{
				Title : (B = B.itemInfo.itemStruct).desc,
				UP : B.author.nickname,
				Date : 1E3 * B.createTime,
				Part : [{URL : [B.video.downloadAddr]}]
			}))
		},
		Pack : Q => O.Coke(WN.ReqOH(Q,'Referer',TikTok))
	}
}