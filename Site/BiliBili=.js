'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

ShortVideoPrefix = 'vc',

BiliBili = 'https://www.bilibili.com/',
BiliBiliApi = 'https://api.bilibili.com/',
BiliBiliApiWebView = WW.Tmpl(BiliBiliApi,'x/web-interface/view?aid=',undefined),
BiliBiliApiPlayURL = WW.Tmpl(BiliBiliApi,'x/player/playurl?avid=',undefined,'&cid=',undefined,'&qn=',undefined,'&fnval=16&fourk=1'),
BiliBiliApiPlayerSo = WW.Tmpl(BiliBiliApi,'x/player.so?aid=',undefined,'&id=cid:',undefined),
BiliBiliApiSteinNode = WW.Tmpl(BiliBiliApi,'x/stein/nodeinfo?aid=',undefined,'&graph_version=',undefined,'&node_id=',undefined),
BiliBiliVCApi = 'https://api.vc.bilibili.com/',
BiliBiliVCApiDetail = WW.Tmpl(BiliBiliVCApi,'clip/v1/video/detail?video_id=',undefined,'&need_playurl=1'),

Common = V => (V = WC.JTO(V)).code ?
	WW.Throw(V) :
	V.data;

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	PlayURL = (ID,CID,Quality) =>
		WN.ReqB(O.Coke(BiliBiliApiPlayURL(ID,CID,Quality || 120)))
			.Map(Common)
			.RetryWhen(E => E.Map((V,F) =>
				!F && V && -503 === V.code || WW.Throw(V))
				.Delay(2E3));
	return {
		URL : Q =>
		{
			var
			ID,
			CID;
			Q = Q.split('#')
			ID = Q[0]
			CID = Q[1]

			if (WR.StartW(ShortVideoPrefix,ID)) return WN.ReqB(O.Coke(BiliBiliVCApiDetail(ID.slice(ShortVideoPrefix.length)))).Map(B =>
			{
				B = Common(B)
				return {
					Title : B.item.description,
					Up : B.user.name,
					Date : +new Date(B.item.upload_time + '+0800'),
					Part : [
					{
						URL : [B.item.video_playurl]
					}]
				}
			})

			return WN.ReqB(O.Coke(BiliBiliApiWebView(ID))).FMap(AV =>
			{
				var
				Part = [],
				CIDFirst,
				R;
				AV = Common(AV)
				CIDFirst = AV.pages[0].cid
				R =
				{
					Title : AV.title,
					Up : AV.owner.name,
					Date : 1E3 * AV.pubdate,
					Part
				}
				return (AV.stein_guide_cid ?
					WN.ReqB(O.Coke(O.Head(BiliBiliApiPlayerSo(ID,CIDFirst),'Referer',BiliBili))).FMap(G =>
					{
						var
						Graph = WW.MF(/graph_version":(\d+)/,G),
						CID2Node = {[CIDFirst] : ''};
						return WX.Exp(I =>
							WN.ReqB(O.Coke(BiliBiliApiSteinNode(ID,Graph,CID2Node[I])))
								.Map(V =>
								{
									V = Common(V)
									return [V.title].concat(WR.Map(B =>
									(
										CID2Node[B.cid] = B.node_id,
										B.cid
									),V.edges ? V.edges.choices : []))
								}),CIDFirst)
							.Map(V => V[1].sort((Q,S) => Q[0] - S[0]))
					}) :
					WX.Just(WR.Map(V => [V.cid,V.part],AV.pages)))
					.FMap(V =>
					{
						WR.EachU((V,F) => V.push(F),V)
						R.PartTotal = V.length
						if (CID)
						{
							V = WR.Find(B => CID === String(B[0]),V)
							if (!V) WW.Throw('CID Not Found #' + CID + '@' + ID)
							V = [V]
						}
						return WX.From(V)
					})
					.FMapO(1,V =>
						PlayURL(ID,V[0],120).FMap((B,T) =>
						{
							T = B.accept_quality && Math.max(...B.accept_quality)
							return T && B.quality < T ?
								PlayURL(ID,V[0],T) :
								WX.Just(B)
						})
						.Tap(B =>
						{
							var U,T;
							if (T = B.durl)
							{
								WW.IsArr(T) || (T = [T])
								U =
								{
									URL : WR.Pluck('url',T),
									Size : WR.Pluck('size',T),
									Ext : '.' + B.format.replace(/hd/,'').replace(/^flv.+/,'flv')
								}
							}
							else if (T = B.dash)
							{
								U =
								{
									URL : [],
									Ext : []
								}
								if (T.video)
								{
									U.URL.push(O.Best('bandwidth',T.video).baseUrl)
									U.Ext.push('.mp4')
								}
								if (T.audio)
								{
									U.URL.push(O.Best('bandwidth',T.audio).baseUrl)
									U.Ext.push('.mp3')
								}
							}
							else O.Bad(B)
							V[1] && AV.title !== V[1] && (U.Title = V[1])
							U.Index = V[2]
							Part.push(U)
						}))
					.Fin()
					.Map(() => R)
			})
		},
		Pack : Q => (
		{
			URL : Q,
			Head : {Referer : BiliBiliApi}
		})
	}
}