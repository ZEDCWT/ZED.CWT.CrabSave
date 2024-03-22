'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

PrefixTimeline = 'TL',
// PrefixShortVideo = 'vc',
PrefixAudio = 'au',
PrefixArticle = 'cv',
PrefixCheeseEpisode = 'CheeseEpisode',

BiliBili = 'https://www.bilibili.com/',
BiliBiliVideo = WW.Tmpl(BiliBili,'video/av',undefined),
BiliBiliBgmEpisode = WW.Tmpl(BiliBili,'bangumi/play/ep',undefined),
BiliBiliAudio = BiliBili + 'audio/',
BiliBiliAudioWeb = BiliBiliAudio + 'music-service-c/web/',
BiliBiliAudioWebInfo = WW.Tmpl(BiliBiliAudioWeb,'song/info?sid=',undefined),
BiliBiliAudioWebURL = WW.Tmpl(BiliBiliAudioWeb,'url?sid=',undefined,'&privilege=2&quality=2'),
BiliBiliArticleRead = BiliBili + 'read/cv',
// BiliBiliArticleReadContent = WW.Tmpl(BiliBili,'read/native?id=',undefined),
BiliBiliAPI = 'https://api.bilibili.com/',
BiliBiliAPIArticle = BiliBiliAPI + 'x/article/',
BiliBiliAPIArticleView = WW.Tmpl(BiliBiliAPIArticle,'view?id=',undefined),
// BiliBiliAPIWebView = WW.Tmpl(BiliBiliAPI,'x/web-interface/view?aid=',undefined),
BiliBiliAPIWebViewDetail = WW.Tmpl(BiliBiliAPI,'x/web-interface/view/detail?aid=',undefined),
BiliBiliAPIPlayURL = WW.Tmpl(BiliBiliAPI,'x/player/playurl?avid=',undefined,'&cid=',undefined,'&qn=',undefined,'&fnval=4048&fourk=1'),
BiliBiliAPIPlayURLPGC = WW.Tmpl(BiliBiliAPI,'pgc/player/web/playurl?avid=',undefined,'&cid=',undefined,'&qn=',undefined,'&fnval=4048&fourk=1'),
BiliBiliAPIPlayURLList =
[
	BiliBiliAPIPlayURL,
	BiliBiliAPIPlayURLPGC,
],
BiliBiliAPIPlayerSo = WW.Tmpl(BiliBiliAPI,'x/player.so?aid=',undefined,'&id=cid:',undefined),
BiliBiliAPISteinNode = WW.Tmpl(BiliBiliAPI,'x/stein/nodeinfo?aid=',undefined,'&graph_version=',undefined,'&node_id=',undefined),
BiliBiliAPIPUGV = BiliBiliAPI + 'pugv/',
BiliBiliAPIPUGVViewSeasonByEP = WW.Tmpl(BiliBiliAPIPUGV,'view/web/season?ep_id=',undefined),
BiliBiliAPIPUGVPlayURL = WW.Tmpl(BiliBiliAPIPUGV,'player/web/playurl?ep_id=',undefined,'&qn=',undefined,'&fnver=0&fnval=4048&fourk=1'),
// BiliBiliAPINotoInfo = WW.Tmpl(BiliBiliAPI,'x/note/publish/info?cvid=',undefined),
BiliBiliAPIPolymer = BiliBiliAPI + 'x/polymer/',
BiliBiliAPIPolymerDynamic = BiliBiliAPIPolymer + 'web-dynamic/v1/',
BiliBiliAPIPolymerDynamicDetail = WW.Tmpl(BiliBiliAPIPolymerDynamic,'detail?id=',undefined),
// BiliBiliVCAPI = 'https://api.vc.bilibili.com/',
// BiliBiliVCAPIDetail = WW.Tmpl(BiliBiliVCAPI,'clip/v1/video/detail?video_id=',undefined,'&need_playurl=1'),
// BiliBiliVCAPIDynamicAPIRoot = BiliBiliVCAPI + 'dynamic_svr/v1/dynamic_svr/',
// BiliBiliVCAPIDynamicDetail = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'get_dynamic_detail?dynamic_id=',undefined),
BiliBiliTimeline = 'https://t.bilibili.com/',
BiliBiliLive = 'https://live.bilibili.com/',

Common = V => (V = WC.JTO(V)).code ?
	WW.Throw(V) :
	V.data || V.result;

/*
	av6777232
		Having two parts cid11114072 & cid11036876, since it is redirected to ep278253, the second part seems vanished.
	av54076217
		CID 102724598 vanished
	av669229042
		CID 224439730 vanished
*/

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	// var
	// SolveInitState = B => O.JOM(/__INITIAL_STATE__=/,B);

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

			/*
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
					UP : Desc.user_profile.info.uname,
					Date : 1E3 * Desc.timestamp,
				}
				R.Meta = R.Title
				switch (Desc.type)
				{
					case 1 : // Forward
						break
					case 2 : // Picture
						R.Part = [
						{
							URL : WR.Pluck('img_src',Card.item.pictures),
							ExtDefault : '.jpg',
						}]
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
			*/

			if (PrefixTimeline === Prefix) return Ext.ReqB(O.Coke(BiliBiliAPIPolymerDynamicDetail(ID))).Map(B =>
			{
				var
				SetUnk = Q => O.Bad('Unknown ' + Q),
				SolveCard = (B,IsTop) =>
				{
					var
					ModAuthor = B.modules.module_author,
					ModDynamic = B.modules.module_dynamic,
					Meta = [],Part = [],
					Card = {},
					NonTopCheck = () => IsTop && O.Bad('BadTop ' + B.type),
					SolveMajor = () =>
					{
						var
						Major = ModDynamic.major;
						if (Major) switch (Major.type)
						{
							case 'MAJOR_TYPE_NONE' :
								T = Major.none
								NonTopCheck()
								Meta.push(T.tips)
								break

							case 'MAJOR_TYPE_ARCHIVE' :
								// NonTop
								T = Major.archive
								Card.Link = BiliBiliVideo(T.aid)
								Meta.push(T.title)
								break
							case 'MAJOR_TYPE_ARTICLE' :
								// NonTop
								T = Major.article
								Card.Link = BiliBiliArticleRead + T.id
								Meta.push(T.title)
								break
							case 'MAJOR_TYPE_COMMON' :
								T = Major.common
								Meta.push
								(
									T.jump_url,
									T.title,
									T.desc,
								)
								break
							case 'MAJOR_TYPE_COURSES' :
								T = Major.courses
								Card.Cover = T.cover
								Meta.push
								(
									T.jump_url,
									T.title,
									T.sub_title,
									T.desc,
								)
								break
							case 'MAJOR_TYPE_DRAW' :
								T = Major.draw
								Part.push({URL : WR.Pluck('src',T.items)})
								break
							case 'MAJOR_TYPE_LIVE' :
								T = Major.live
								Card.Cover = T.cover
								Meta.push
								(
									Card.Title = T.title,
									T.jump_url,
									T.badge.text,
									T.desc_first,
									T.desc_second,
								)
								break
							case 'MAJOR_TYPE_LIVE_RCMD' :
								T = WC.JTO(Major.live_rcmd.content).live_play_info
								Card.Cover = T.cover
								Meta.push
								(
									Card.Title = T.title,
									BiliBiliLive + T.room_id,
									T.area_id + ':' + T.area_name,
								)
								break
							// case 'MAJOR_TYPE_OPUS' :
							case 'MAJOR_TYPE_PGC' :
								T = Major.pgc
								Card.Link = BiliBiliBgmEpisode(T.epid)
								Meta.push(T.title)
								break
							default :
								SetUnk(Major.type)
						}
					},
					T;
					if (ModAuthor) switch(ModAuthor.type)
					{
						case 'AUTHOR_TYPE_NORMAL' :
							Card.UP = ModAuthor.name
							Card.Date = 1E3 * ModAuthor.pub_ts
							break
						case 'AUTHOR_TYPE_PGC' :
							Card.UP = ModAuthor.name
							Card.Date = ModAuthor.pub_time
							break
						default :
							SetUnk(ModAuthor.type)
					}
					if (T = ModDynamic && ModDynamic.desc)
						Meta.push(Card.Title = T.text)
					Card.Link = BiliBiliTimeline + B.id_str
					switch (B.type)
					{
						case 'DYNAMIC_TYPE_NONE' :
							NonTopCheck()
							break
						case 'DYNAMIC_TYPE_COMMON_SQUARE' :
						case 'DYNAMIC_TYPE_COMMON_VERTICAL' :
						case 'DYNAMIC_TYPE_COURSES_SEASON' :
						case 'DYNAMIC_TYPE_DRAW' :
						case 'DYNAMIC_TYPE_LIVE' :
						case 'DYNAMIC_TYPE_LIVE_RCMD' :
						case 'DYNAMIC_TYPE_WORD' :
							SolveMajor()
							break
						case 'DYNAMIC_TYPE_ARTICLE' :
						case 'DYNAMIC_TYPE_AV' :
						case 'DYNAMIC_TYPE_PGC_UNION' :
							NonTopCheck()
							SolveMajor()
							break
						case 'DYNAMIC_TYPE_FORWARD' :
							T = SolveCard(B.orig,false)
							Meta = O.MetaJoin(Meta,
							[
								...T.Link ? [T.Link] : [],
								(WW.IsStr(T.Date) ? T.Date : WW.StrDate(T.Date)) + ' ' + T.UP,
								...T.Meta,
							])
							break
						default :
							SetUnk(B.type)
					}
					Card.Meta = Meta
					Card.Part = Part
					return Card
				};
				B = Common(B).item
				return SolveCard(B,true)
			})

			/*
			if (PrefixShortVideo === Prefix) return Ext.ReqB(O.Coke(BiliBiliVCAPIDetail(ID))).Map(B =>
			{
				B = Common(B)
				return {
					Title : B.item.description,
					UP : B.user.name,
					Date : B.item.upload_time + '+0800',
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
						UP : Audio.uname,
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

			/*
			if (PrefixArticle === Prefix) return Ext.ReqB(O.Coke(BiliBiliArticleReadContent(ID))).Map(B =>
			{
				B = SolveInitState(B).readInfo
				return {
					Title : B.title,
					UP : B.author.name,
					Date : 1E3 * B.publish_time,
					Cover : B.banner_url,
					Part : [
					{
						URL : [BiliBiliArticleReadContent(ID)],
						Ext : '.htm'
					},...WW.MR((D,V) =>
					{
							Some resources refuse to load
							cv17652147
							s1.hdslb.com/bfs/static/jinkela/article-web/article-web.bc81fcb45c9ad64666de79b78421e5c2518e97f7.js
							clientW : 660
							r = n.clientW,c = r - 32
							st = nt.d > 2 ? 2 : 1.5
							@942w_progressive.webp
						D.push({URL : [V[2]]})
						return D
					},[],/<img[^>]+src=(['"])(.+?)\1/g,B.content)]
				}
			})
			*/

			if (PrefixArticle === Prefix) return Ext.ReqB(O.Coke(BiliBiliAPIArticleView(ID))).Map(Article =>
			{
				var
				Meta = [],
				Part = [],
				Img = [],
				T;
				Article = Common(Article)
				if (T = Article.opus)
				{
					T.content.paragraphs.forEach(V =>
					{
						var
						Line = '',
						SolveText = Q => Q.nodes.forEach(B =>
						{
							switch (B.node_type)
							{
								case 1 :
									Line += B.word.words || ''
									break
								default :
									O.Bad('Unknown NodeType #' + B.node_type)
							}
						});
						switch (V.para_type)
						{
							case 1 :
								SolveText(V.text)
								break
							case 2 :
								V.pic.pics.forEach(B =>
								{
									Img.push(B.url)
									Meta.push('<Img> ' + B.url)
								})
								break
							case 3 :
								// CutOff
								Line = WR.RepS('\u2014',63)
								break
							case 4 :
								// Quote
								SolveText(V.text)
								Line =
								[
									'```',
									Line,
									'```',
								].join`\n`
								break
							case 5 :
							case 6 :
							case 7 :
							default :
								O.Bad('Unknown ParaType #' + V.para_type)
						}
						Line && Meta.push(Line.replace(/\n+$/,''))
					})
				}
				else
				{
					T = Article.content
					Meta.push(O.Text(T,{Img : Img}))
				}
				Img.length && Part.push({URL : Img})
				return {
					Title : Article.title,
					UP : Article.author.name,
					Date : 1E3 * Article.publish_time,
					Meta,
					Cover : Article.origin_image_urls?.[0],
					Part,
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
								U.URL.push(O.Best('id',T.video).base_url)
								U.Ext.push('.mp4')
							}
							if (T.audio)
							{
								U.URL.push(O.Best('id',T.audio).base_url)
								U.Ext.push('.mp3')
							}
						}
						else O.Bad(B)
						return {
							Title : Episode.title,
							UP : Season.up_info.uname,
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

			return WX.TCO((_,I) => Ext.ReqB(O.Coke(BiliBiliAPIWebViewDetail(ID))).FMap(B =>
			{
				B = Common(B)
				if (!B.View?.owner?.name && !B.View?.owner?.face)
				{
					if (3 < I)
						WW.Throw('Unexpected Fatal | Empty Owner Response')
					return WX.Just([true]).Delay(1E3)
				}
				return WX.Just([false,B])
			})).FMap(B =>
			{
				var
				AV = B.View,
				Part = [],
				CIDFirst,
				R;
				CIDFirst = AV.pages[0].cid
				R =
				{
					Title : AV.title,
					UP : AV.owner.name,
					Date : 1E3 * AV.pubdate,
					Meta : O.MetaJoin
					(
						AV.dynamic,
						[
							AV.desc,
							...B.Tags.map(V => WW.Quo(V.tag_id) + `#${V.tag_name}#` +
								(V.jump_url ? ' ' + V.jump_url : '')),
						]
					),
					Cover : AV.pic,
					Part
				}
				return (AV.stein_guide_cid ?
					Ext.ReqB(O.Coke(WN.ReqOH(BiliBiliAPIPlayerSo(ID,CIDFirst),'Referer',BiliBili))).FMap(G =>
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
					.FMapE((V,F) =>
						PlayURL(ID,V[0],120).FMap((B,T) =>
						{
							T = B.accept_quality && Math.max(...B.accept_quality)
							return T && B.quality < T ?
								PlayURL(ID,V[0],T) :
								WX.Just(B)
						})
						// For vanished parts, we simply ignore them
						.ErrAs(E => E && F && -404 === E.code ?
							WX.Empty :
							WX.Throw(E))
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
								/*
									Actually, videos may have higher bandwidth with lower resolution
									So let us just trust that they arrange the quality by id in order
									av816470741
									{id : 120,bandwidth : 4732045,codecs : 'avc1.640034',width : 3840,height : 2160}
									{id : 116,bandwidth : 5237452,codecs : 'avc1.640032',width : 1920,height : 1080}
									{id : 80,bandwidth : 2625599,codecs : 'avc1.640032',width : 1920,height : 1080}
									{id : 64,bandwidth : 1755296,codecs : 'avc1.640028',width : 1280,height : 720}
									{id : 32,bandwidth : 789775,codecs : 'avc1.64001F',width : 852,height : 480}
									{id : 16,bandwidth : 354406,codecs : 'avc1.64001E',width : 640,height : 360}
								*/
								if (T.video)
								{
									U.URL.push(O.Best('id',T.video).baseUrl)
									U.Ext.push('.mp4')
								}
								if (T.audio)
								{
									U.URL.push(O.Best('id',T.audio).baseUrl)
									U.Ext.push('.mp3')
								}
							}
							else O.Bad(B)
							V[1] && AV.title !== V[1] && (U.Title = V[1])
							/*
								By specifying the CID, it is normally due to the video being updated
								Preserving such info helps to resolve naming conflict
							*/
							CID && (U.Title = U.Title ? CID + '.' + U.Title : CID)
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