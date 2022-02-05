'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC} = WW,

PrefixTimeline = 'TL',
// PrefixShortVideo = 'vc',
PrefixAudio = 'au',
PrefixArticle = 'cv',
PrefixCheeseEpisode = 'CheeseEpisode',

BiliBili = 'https://www.bilibili.com/',
BiliBiliAudio = BiliBili + 'audio/',
BiliBiliAudioWeb = BiliBiliAudio + 'music-service-c/web/',
BiliBiliAudioWebInfo = WW.Tmpl(BiliBiliAudioWeb,'song/info?sid=',undefined),
BiliBiliAudioWebURL = WW.Tmpl(BiliBiliAudioWeb,'url?sid=',undefined,'&privilege=2&quality=2'),
BiliBiliAPI = 'https://api.bilibili.com/',
BiliBiliAPIWebView = WW.Tmpl(BiliBiliAPI,'x/web-interface/view?aid=',undefined),
BiliBiliAPIPlayURL = WW.Tmpl(BiliBiliAPI,'x/player/playurl?avid=',undefined,'&cid=',undefined,'&qn=',undefined,'&fnval=16&fourk=1'),
BiliBiliAPIPlayURLPGC = WW.Tmpl(BiliBiliAPI,'pgc/player/web/playurl?avid=',undefined,'&cid=',undefined,'&qn=',undefined,'&fnval=16&fourk=1'),
BiliBiliAPIPlayURLList =
[
	BiliBiliAPIPlayURL,
	BiliBiliAPIPlayURLPGC,
],
BiliBiliAPIPlayerSo = WW.Tmpl(BiliBiliAPI,'x/player.so?aid=',undefined,'&id=cid:',undefined),
BiliBiliAPISteinNode = WW.Tmpl(BiliBiliAPI,'x/stein/nodeinfo?aid=',undefined,'&graph_version=',undefined,'&node_id=',undefined),
BiliBiliAPIPUGV = BiliBiliAPI + 'pugv/',
BiliBiliAPIPUGVViewSeasonByEP = WW.Tmpl(BiliBiliAPIPUGV,'view/web/season?ep_id=',undefined),
BiliBiliAPIPUGVPlayURL = WW.Tmpl(BiliBiliAPIPUGV,'player/web/playurl?ep_id=',undefined,'&qn=',undefined,'&fnver=0&fnval=80&fourk=1'),
BiliBiliVCAPI = 'https://api.vc.bilibili.com/',
// BiliBiliVCAPIDetail = WW.Tmpl(BiliBiliVCAPI,'clip/v1/video/detail?video_id=',undefined,'&need_playurl=1'),
BiliBiliVCAPIDynamicAPIRoot = BiliBiliVCAPI + 'dynamic_svr/v1/dynamic_svr/',
BiliBiliVCAPIDynamicDetail = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'get_dynamic_detail?dynamic_id=',undefined),
BiliBiliArticleReadContent = WW.Tmpl(BiliBili,'read/native?id=',undefined),

Common = V => (V = WC.JTO(V)).code ?
	WW.Throw(V) :
	V.data || V.result;

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	SolveInitState = B => O.JOM(/__INITIAL_STATE__=/,B);

	return {
		URL : (Q,Ext) =>
		{
			var
			Prefix,ID,CID,
			PlayURL = (ID,CID,Quality) => WX.TCO((_,F) =>
				Ext.ReqB(O.Coke(BiliBiliAPIPlayURLList[F](ID,CID,Quality || 120)))
					.Map(B => [0,Common(B)])
					.RetryWhen(E => E.Map((V,F) =>
						!F && V && -503 === V.code || WW.Throw(V))
						.Delay(2E3))
					.ErrAs(E => -~F < BiliBiliAPIPlayURLList.length ?
						WX.Just([true]) :
						WX.Throw(E)));

			Q = Q.split('#')
			ID = /^([A-Z]+)(\d+)$/i.exec(Q[0])
			CID = Q[1]
			if (ID)
			{
				Prefix = ID[1]
				ID = ID[2]
			}
			else ID = Q[0]

			if (PrefixTimeline === Prefix) return Ext.ReqB(O.Coke(BiliBiliVCAPIDynamicDetail(ID))).Map(B =>
			{
				var
				Desc,Card,
				R;
				B = Common(B).card
				Desc = B.desc
				Card = WC.JTO(B.card)
				R =
				{
					Title : Card.item && (Card.item.description || Card.item.content),
					Up : Desc.user_profile.info.uname,
					Date : 1E3 * Desc.timestamp,
				}
				R.Meta = R.Title
				switch (Desc.type)
				{
					case 1 : // Forward
						break
					case 2 : // Picture
						R.Part = Card.item.pictures.map(V => (
						{
							URL : [V.img_src]
						}))
						break
					case 4 : // Text Only
						break
					case 2048 : // External
						R.Title = Card.vest.content
						R.Cover = Card.sketch.cover_url
						break
					case 8 : // Video
					case 512 :
					case 64 : // CV
					case 256 : // Audio
					case 4200 : // Live
					case 4303 : // Cheese
					case 4308 : // Live
					default :
						WX.Throw('Unsupported Type #' + Desc.type)
				}
				return R
			})

			/*
			if (PrefixShortVideo === Prefix) return Ext.ReqB(O.Coke(BiliBiliVCAPIDetail(ID))).Map(B =>
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
			*/

			if (PrefixAudio === Prefix) return Ext.ReqB(O.Coke(BiliBiliAudioWebInfo(ID))).FMap(Audio =>
			{
				Audio = Common(Audio)
				return Ext.ReqB(O.Coke(BiliBiliAudioWebURL(ID))).Map(URL =>
				{
					URL = Common(URL)
					return {
						Title : (Audio.author && Audio.author !== Audio.uname ? Audio.author + '.' : '') +
							Audio.title,
						Up : Audio.uname,
						Date : 1E3 * Audio.passtime,
						Meta : Audio.intro,
						Cover : Audio.cover,
						Part : [
						{
							URL : [URL.cdns[0]],
							Size : [URL.size]
						}]
					}
				})
			})

			if (PrefixArticle === Prefix) return Ext.ReqB(O.Coke(BiliBiliArticleReadContent(ID))).Map(B =>
			{
				B = SolveInitState(B).readInfo
				return {
					Title : B.title,
					Up : B.author.name,
					Date : 1E3 * B.publish_time,
					Cover : B.banner_url,
					Part : [
					{
						URL : [BiliBiliArticleReadContent(ID)],
						Ext : '.htm'
					},...WW.MR((D,V) =>
					{
						D.push({URL : [V[2]]})
						return D
					},[],/<img[^>]+src=(['"])(.+?)\1/g,B.content)]
				}
			})

			if (PrefixCheeseEpisode === Prefix) return Ext.ReqB(O.Coke(BiliBiliAPIPUGVViewSeasonByEP(ID))).FMap(Season =>
			{
				var Episode;
				Season = Common(Season)
				Episode = Season.episodes.find(V => V.id == ID);
				Episode || WX.Throw('Unexpected fatal | No such episode')
				return Ext.ReqB(O.Coke(BiliBiliAPIPUGVPlayURL(ID,120)))
					.FMap((B,T) =>
					{
						B = Common(B)
						T = B.accept_quality && Math.max(...B.accept_quality)
						return T && B.quality < T ?
							Ext.ReqB(O.Coke(BiliBiliAPIPUGVPlayURL(ID,T)))
								.Map(Common) :
							WX.Just(B)
					})
					.Map(B =>
					{
						var
						Part = [],
						U,T;
						if (T = B.durl)
						{
							WW.IsArr(T) || (T = [T])
							Part.push(
							{
								URL : WR.Pluck('url',T),
								Size : WR.Pluck('size',T),
							})
						}
						else if (T = B.dash)
						{
							Part.push(U =
							{
								URL : [],
								Ext : [],
							})
							if (T.video)
							{
								U.URL.push(O.Best('bandwidth',T.video).base_url)
								U.Ext.push('.mp4')
							}
							if (T.audio)
							{
								U.URL.push(O.Best('bandwidth',T.audio).base_url)
								U.Ext.push('.mp3')
							}
						}
						else O.Bad(B)
						return {
							Title : Episode.title,
							Up : Season.up_info.uname,
							Date : 1E3 * Episode.release_date,
							Meta :
							[
								Season.title,
								Season.subtitle,
							],
							Cover : Episode.cover,
							Part,
						}
					})
			})

			if (Prefix) return WX.Throw('Unexpected Prefix ' + Prefix)

			return Ext.ReqB(O.Coke(BiliBiliAPIWebView(ID))).FMap(AV =>
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
					Meta : AV.desc,
					Cover : AV.pic,
					Part
				}
				return (AV.stein_guide_cid ?
					Ext.ReqB(O.Coke(O.Head(BiliBiliAPIPlayerSo(ID,CIDFirst),'Referer',BiliBili))).FMap(G =>
					{
						var
						Graph = WW.MF(/graph_version":(\d+)/,G),
						CID2Node = {[CIDFirst] : ''};
						return WX.Exp(I =>
							Ext.ReqB(O.Coke(BiliBiliAPISteinNode(ID,Graph,CID2Node[I])))
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
		IDView : WR.RepL(
		[
			/^(?=\d)/,'av',
			/#\d+$/,'',
		]),
		Pack : Q => (
		{
			URL : Q,
			Head : {Referer : BiliBiliAPI}
		}),
		Range : false,
	}
}