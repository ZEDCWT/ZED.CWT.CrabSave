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
BiliBiliMediaListFav = WW.Tmpl(BiliBili,'medialist/detail/ml',undefined),
BiliBiliAudio = BiliBili + 'audio/',
BiliBiliAudioURL = BiliBili + 'audio/au',
BiliBiliAudioWeb = BiliBiliAudio + 'music-service-c/web/',
BiliBiliAudioWebInfo = WW.Tmpl(BiliBiliAudioWeb,'song/info?sid=',undefined),
BiliBiliAudioWebURL = WW.Tmpl(BiliBiliAudioWeb,'url?sid=',undefined,'&privilege=2&quality=2'),
BiliBiliArticleRead = BiliBili + 'read/cv',
// BiliBiliArticleReadContent = WW.Tmpl(BiliBili,'read/native?id=',undefined),
BiliBiliAPI = 'https://api.bilibili.com/',
BiliBiliAPIArticle = BiliBiliAPI + 'x/article/',
BiliBiliAPIArticleView = WW.Tmpl(BiliBiliAPIArticle,'view?id=',undefined),
BiliBiliAPIArticleCard = WW.Tmpl(BiliBiliAPIArticle,'cards?ids=co',undefined),
BiliBiliAPIWeb = BiliBiliAPI + 'x/web-interface/',
BiliBiliAPIWebNav = BiliBiliAPIWeb + 'nav',
// BiliBiliAPIWebView = WW.Tmpl(BiliBiliAPIWeb,'view?aid=',undefined),
BiliBiliAPIWebViewDetail = WW.Tmpl(BiliBiliAPIWeb,'view/detail?aid=',undefined),
BiliBiliAPIPlayURL = WW.Tmpl(BiliBiliAPI,'x/player/wbi/playurl?avid=',undefined,'&cid=',undefined,'&qn=',undefined,'&fnval=4048&fourk=1'),
BiliBiliAPIPlayURLPGC = WW.Tmpl(BiliBiliAPI,'pgc/player/web/playurl?avid=',undefined,'&cid=',undefined,'&qn=',undefined,'&fnval=4048&fourk=1'),
BiliBiliAPIPlayURLList =
[
	BiliBiliAPIPlayURL,
	BiliBiliAPIPlayURLPGC,
],
// BiliBiliAPIPlayerSo = WW.Tmpl(BiliBiliAPI,'x/player.so?aid=',undefined,'&id=cid:',undefined),
BiliBiliAPIPlayerWBI = WW.Tmpl(BiliBiliAPI,'x/player/wbi/v2?aid=',undefined,'&cid=',undefined),
// BiliBiliAPISteinNode = WW.Tmpl(BiliBiliAPI,'x/stein/nodeinfo?aid=',undefined,'&graph_version=',undefined,'&node_id=',undefined),
BiliBiliAPISteinEdge = WW.Tmpl(BiliBiliAPI,'x/stein/edgeinfo_v2?aid=',undefined,'&graph_version=',undefined,'&edge_id=',undefined),
BiliBiliAPIPUGV = BiliBiliAPI + 'pugv/',
BiliBiliAPIPUGVViewSeasonByEP = WW.Tmpl(BiliBiliAPIPUGV,'view/web/season?ep_id=',undefined),
BiliBiliAPIPUGVPlayURL = WW.Tmpl(BiliBiliAPIPUGV,'player/web/playurl?ep_id=',undefined,'&qn=',undefined,'&fnver=0&fnval=4048&fourk=1'),
// BiliBiliAPINotoInfo = WW.Tmpl(BiliBiliAPI,'x/note/publish/info?cvid=',undefined),
BiliBiliAPIPolymer = BiliBiliAPI + 'x/polymer/',
BiliBiliAPIPolymerDynamic = BiliBiliAPIPolymer + 'web-dynamic/v1/',
BiliBiliAPIPolymerDynamicDetail = WW.Tmpl(BiliBiliAPIPolymerDynamic,'detail?id=',undefined),
BiliBiliAPIPolymerDynamicDetailOpus = WW.Tmpl(BiliBiliAPIPolymerDynamic,'detail?id=',undefined,'&features=itemOpusStyle'),
BiliBiliAPIPolymerDynamicDetailPic = WW.Tmpl(BiliBiliAPIPolymerDynamic,'detail/pic?id=',undefined),
BiliBiliAPIReplyWBI = WW.Tmpl(BiliBiliAPI,'x/v2/reply/wbi/main?mode=3&oid=',undefined,'&type=',undefined),
BiliBiliAPIVoteInfo = WW.Tmpl(BiliBiliAPI,'x/vote/vote_info?vote_id=',undefined),
BiliBiliSpace = 'https://space.bilibili.com/',
// BiliBiliVCAPI = 'https://api.vc.bilibili.com/',
// BiliBiliVCAPIDetail = WW.Tmpl(BiliBiliVCAPI,'clip/v1/video/detail?video_id=',undefined,'&need_playurl=1'),
// BiliBiliVCAPIDynamicAPIRoot = BiliBiliVCAPI + 'dynamic_svr/v1/dynamic_svr/',
// BiliBiliVCAPIDynamicDetail = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'get_dynamic_detail?dynamic_id=',undefined),
BiliBiliTimeline = 'https://t.bilibili.com/',
BiliBiliLive = 'https://live.bilibili.com/',

Common = (V,ErrAsNull = false) =>
{
	V = WW.IsObj(V) ? V : WC.JTO(V)
	if (V.code ||
		false === V.status ||
		V.data?.v_voucher && 1 === WR.Key(V.data).length)
		return ErrAsNull ?
			null :
			WW.Throw(V)
	return V.data || V.result
};

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
	var
	// SolveInitState = B => O.JOM(/__INITIAL_STATE__=/,B);
	ReqWEBID = '',
	ReqWBISalt;

	return {
		URL : (Q,Ext,Full) =>
		{
			var
			ReqWBI = Q => (ReqWBISalt ? WX.Just() : Ext.ReqB(O.Req(BiliBiliSpace + 2)).FMap(Space =>
			{
				ReqWEBID = WC.JTOO(WC.UD(WW.MF(/<script id="__RENDER_DATA__[^>]+>([^<]+)/,Space)))?.access_id
				Space = WW.MR((D,V) => (D.push(V[1]),D),[],/<script[^>]+src="([^"]+space[^"]+)/g,Space)
				return WX.From(Space)
					.FMap(V => Ext.ReqB(O.Req({URL : V,Enc : false})))
					.Reduce((D,V) => D + WC.U16S(V),'')
					.FMap(Script => Ext.ReqB(O.Req(BiliBiliAPIWebNav)).Map(Nav =>
					{
						var
						IS = WC.JTO(Nav).data.wbi_img,
						Index = O.JOM(/(?=\[\d+(,\d+){63,}\][^{}]+forEach[^}]+push)/,Script),
						SolveFakeURL = Q => WW.MF(/\/([^/.]+)\.\w+$/,Q);
						IS = SolveFakeURL(IS.img_url) + SolveFakeURL(IS.sub_url)
						ReqWBISalt = WR.Map(V => IS.charAt(V) || '',Index).join('').slice(0,32)
					}))
			})).FMap(() =>
			{
				Q = WW.N.ReqOH(Q,'Referer',BiliBili)
				if (/\/wbi\//.test(Q.URL))
				{
					if (ReqWEBID)
						Q.URL += '&w_webid=' + ReqWEBID
					Q.URL += '&wts=' + ~~(WW.Now() / 1E3)
					Q.URL += '&w_rid=' + WR.Low(WC.HEXS(WC.MD5
					(
						Q.URL.split('?')[1].split('&').sort().join('&') +
						ReqWBISalt
					)))
				}
				return Ext.ReqB(O.Coke(Q)).Map(B =>
				{
					if (WR.Include(WC.JTO(B).code,[-352,-403]))
						ReqWBISalt = null
					return Common(B)
				})
			}),

			Prefix,ID,CID,
			PlayURL = (ID,CID,Quality) => WX.TCO((_,F) =>
				Ext.ReqB(O.Coke(
				{
					URL : BiliBiliAPIPlayURLList[F](ID,CID,Quality || 120),
					Head :
					{
						Referer : BiliBili,
					},
				}))
					.Map(B => [0,Common(B)])
					.RetryWhen(E => E.Map((V,F) =>
						!F && V && -503 === V.code || WW.Throw(V))
						.Delay(2E3))
					.ErrAs(E => -~F < BiliBiliAPIPlayURLList.length ?
						WX.Just([true]) :
						WX.Throw(E))),

			SolvePart = B =>
			{
				var
				/*
					av1206729228
					While trying to access the avc1.640034 format of the first part naming `1659277992-1-30120.m4s`, it returns
					{"code":"EntityTooLarge","message":"Your proposed upload exceeds the maximum allowed object size.","requestId":"..."}

					The first part is of `3:21:11`, and the second part is of `05:15:30`
					For record, the of avc1.640034 of the second part naming `1659609666-1-30120.m4s` is accessible with ContentLength being 53088613213
					But the hev1.1.6.L153.90 of both parts are 19814895657 and 36144310461 accordingly
					So based on that the avc1.640034 of the longer second part is accessible, the first part should be so...
					Weird...
				*/
				SolveURL = V => V.baseUrl || V.base_url,
				Best = (V,Low = false) =>
				{
					var
					MaxID = Math.max(...V.map(V => V.id));
					return V.filter(B => B.id === MaxID)
						.sort((Q,S) => (Low ? 1 : -1) * (Q.bandwidth - S.bandwidth))[0]
				},
				U,T;
				if (T = B.durl)
				{
					WW.IsArr(T) || (T = [T])
					U =
					{
						URL : WR.Pluck('url',T),
						Size : WR.Pluck('size',T),
						Ext : B.format ? '.' + B.format.replace(/hd/,'').replace(/^flv.+/,'flv') : null,
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
						U.URL.push(SolveURL(Best(T.video)))
						U.Ext.push('.mp4')
					}
					if (T.audio)
					{
						U.URL.push(SolveURL(O.Best('id',T.audio)))
						U.Ext.push('.mp3')
					}
					if (T.flac?.audio)
					{
						U.URL.push(SolveURL(T.flac.audio))
						U.Ext.push('.flac')
					}
					if (T.dolby?.audio)
					{
						U.URL.push(SolveURL(O.Best('id',T.dolby.audio)))
						U.Ext.push('.Dolby.mp3')
					}
				}
				else O.Bad(B)
				return U
			},

			PadComment = (R,User,ID,Type) =>
			{
				var
				Part = R.Part ??= [],
				Reply = [];

				if (Full.File)
					return WX.Just(R)

				return ReqWBI(BiliBiliAPIReplyWBI(ID,Type)).Map(Comment =>
				{
					var
					AddedID = new Set,
					Add = (V,Indent = '') =>
					{
						if (V && !AddedID.has(V.rpid_str))
						{
							AddedID.add(V.rpid_str)
							if (User === +V.member.mid &&
								V.content.pictures?.length)
							{
								Part.push(
								{
									Title : WC.HED(V.content.message),
									URL : V.content.pictures.map(V => V.img_src),
								})
							}
							Reply.length && !Indent && Reply.push('')
							V.dynamic_id && Reply.push(Indent + BiliBiliTimeline + V.dynamic_id_str)
							Reply.push
							(
								Indent + WW.StrDate(1E3 * V.ctime,WW.DateColS) + ' ' + V.member.mid + ':' + V.member.uname,
								Indent + '\u25B2 ' + V.like + ' Reply ' + V.rcount,
								Indent + WC.HED(V.content.message)
							)
							V.replies?.forEach(P => Add(P,'\t' + Indent))
						}
					};

					// WBI response
					Add(WR.Path(['top','admin'],Comment))
					Add(WR.Path(['top','upper'],Comment))
					// Non WBI response
					Add(WR.Path(['upper','top'],Comment))

					WR.Each(Add,Comment.top_replies)
					WR.Each(Add,Comment.replies)

					R.Meta = O.MetaJoin
					(
						R.Meta,
						Reply,
					)
					return R
				}).ErrAs(E =>
				{
					if (
					[
						-404,
						12002,
						12061,
					].includes(E?.code))
					{
						R.Meta = O.MetaJoin
						(
							R.Meta,
							`[${E.code}] ${E.message}`,
						)
						return WX.Just(R)
					}
					WW.Throw(E)
				})
			};

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

			if (PrefixTimeline === Prefix) return WX.From(
			[
				BiliBiliAPIPolymerDynamicDetail(ID),
				BiliBiliAPIPolymerDynamicDetailOpus(ID),
			]).FMapE((V,F) => Ext.ReqB(O.Coke(V)).Map(B => Common(B,!F))).All().FMap(([DynamicNormal,DynamicOpus]) =>
			{
				var
				SetUnk = Q => O.Bad('Unknown ' + Q),
				SolveCard = (Normal,Opus,IsTop) =>
				{
					var
					Info = Normal || Opus,
					Basic = Info.basic,
					ModAuthor = Info.modules.module_author,
					ModDynamic = Info.modules.module_dynamic,
					OpusMajor = Opus.modules.module_dynamic.major?.opus,
					Meta = [],Part = [],
					CommonTitle = [],
					Card = {},
					NonTopCheck = () => IsTop && O.Bad('BadTop ' + Info.type),
					SolveRichText = Q => WR.Each(V =>
					{
						switch (V.type)
						{
							case 'RICH_TEXT_NODE_TYPE_VIEW_PICTURE' :
								if (WW.IsArr(V.pics))
									Part.push({URL : WR.Pluck('src',V.pics)})
								else if (V.rid)
								{
									// 991837283011264531
									Part.push(Ext.ReqB(O.Coke(BiliBiliAPIPolymerDynamicDetailPic(V.rid)))
										.Map(B => ({URL : WR.Pluck('src',Common(B))})))
								}
								break
						}
					},Q.rich_text_nodes),
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
							case 'MAJOR_TYPE_BLOCKED' :
								T = Major.blocked
								O.Bad('{Blocked} ' + T.hint_message)
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
								Part.push({URL : OpusMajor ?
									OpusMajor.pics.map(V => V.live_url || V.url) :
									WR.Pluck('src',T.items)})
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
							case 'MAJOR_TYPE_MEDIALIST' :
								T = Major.medialist
								Card.Cover = T.cover
								Meta.push
								(
									Card.Title = T.title,
									BiliBiliMediaListFav(T.id),
									T.sub_title
								)
								break
							case 'MAJOR_TYPE_MUSIC' :
								NonTopCheck()
								T = Major.music
								Card.Cover = T.cover
								Meta.push
								(
									BiliBiliAudioURL + T.id,
									T.title,
									T.label
								)
								break
							case 'MAJOR_TYPE_OPUS' :
								T = Major.opus
								if (!/\/opus\/\d+$/.test(T.jump_url))
									Meta.push(T.jump_url)
								if (T.title)
								{
									CommonTitle.push(T.title)
									Meta.push(T.title)
								}
								if (T.summary.text)
								{
									CommonTitle.push(T.summary.text)
									Meta.push(T.summary.text)
								}
								Part.push({URL : T.pics.map(V => V.live_url || V.url)})
								SolveRichText(T.summary)
								break
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

					if (Normal)
					{
						if (T = WR.Path(['modules','module_dynamic','major','opus','summary','text'],Opus) ||
							WR.Path(['modules','module_dynamic','major','opus','title'],Opus))
						{
							CommonTitle.push(T)
							Meta.push(T)
						}
						if (T = ModDynamic && ModDynamic.desc)
						{
							CommonTitle.push(T.text)
							Meta.push(T.text)
							SolveRichText(T)
						}
					}

					Card.Link = BiliBiliTimeline + Info.id_str

					switch (Info.type)
					{
						case 'DYNAMIC_TYPE_NONE' :
							NonTopCheck()
							break
						case 'DYNAMIC_TYPE_COMMON_SQUARE' :
						case 'DYNAMIC_TYPE_COMMON_VERTICAL' :
						case 'DYNAMIC_TYPE_COURSES_SEASON' :
						case 'DYNAMIC_TYPE_DRAW' :
						case 'DYNAMIC_TYPE_LIVE_RCMD' :
						case 'DYNAMIC_TYPE_LIVE' :
						case 'DYNAMIC_TYPE_MEDIALIST' :
						case 'DYNAMIC_TYPE_WORD' :
							SolveMajor()
							break
						case 'DYNAMIC_TYPE_ARTICLE' :
						case 'DYNAMIC_TYPE_AV' :
						case 'DYNAMIC_TYPE_MUSIC' :
						case 'DYNAMIC_TYPE_PGC_UNION' :
							NonTopCheck()
							SolveMajor()
							break
						case 'DYNAMIC_TYPE_FORWARD' :
							T = SolveCard(Info.orig,Opus.orig,false)
							Meta = O.MetaJoin(Meta,
							[
								...T.Link ? [T.Link] : [],
								(WW.IsStr(T.Date) ? T.Date : WW.StrDate(T.Date)) + ' ' + T.UP,
								...T.Meta,
							])
							break
						default :
							SetUnk(Info.type)
					}
					Card.Title ||= CommonTitle.join`\n`
					Card.Meta = Meta
					return IsTop ?
						O.Part(Part).FMap(Part =>
						{
							Card.Part = Part
							return PadComment(Card,ModAuthor.mid,Basic.comment_id_str,Basic.comment_type)
						}) :
						Card
				};
				return SolveCard(DynamicNormal?.item,DynamicOpus.item,true)
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
				return Ext.ReqB(O.Coke(BiliBiliAudioWebURL(ID))).FMap(URL =>
				{
					URL = Common(URL)
					return PadComment(
					{
						Title : (Audio.author && Audio.author !== Audio.uname ? Audio.author + '.' : '') +
							Audio.title,
						UP : Audio.uname,
						Date : 1E3 * Audio.passtime,
						Meta : [Audio.intro],
						Cover : Audio.cover,
						Part : [
						{
							URL : [URL.cdns[0]],
							Size : [URL.size]
						}]
					},Audio.uid,ID,14)
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

			if (PrefixArticle === Prefix) return Ext.ReqB(O.Coke(BiliBiliAPIArticleView(ID))).FMap(Article =>
			{
				return Ext.ReqB(O.Coke(BiliBiliAPIArticleCard(ID))).Map(Card => [Article,Card])
			}).FMap(([Article,Card]) =>
			{
				var
				Meta = [],
				MetaExt = [],
				Part = [],
				Img = [],
				T;
				Article = Common(Article)
				Card = WR.Flatten(WR.Val(Common(Card)))
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
								case 4 :
									Line += B.link.link
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
								break
							case 6 :
								// Unordered List
								SolveText(V.text)
								Line = WR.RepS('	',V.format.list_format.level - 1) + '+ ' + Line
								break
							case 7 :
								// Link Card
								switch (V.link_card.card.link_type)
								{
									case 1 :
										Line = BiliBiliVideo(V.link_card.card.biz_id)
										break
									case 3 :
										Part.push(Ext.ReqB(O.Coke(BiliBiliAPIVoteInfo(V.link_card.card.biz_id))).FMap(B =>
										{
											B = Common(B).vote_info
											MetaExt.push
											(
												`{${B.vote_id}} [${B.join_num}] ${B.title}`,
												[B.ctime,B.end_time].map(V => WW.StrDate(1E3 * V,WW.DateColS)).join` => `,
												...B.options.map((V,F) =>
												[
													'	' + WW.ShowLI(B.options.length,F),
													V.cnt + ':' + +(100 * V.cnt / B.join_num).toFixed(2) + '%',
													V.opt_desc,
												].join` `),
											)
											return WX.Empty
										}))
										break
									case 15 :
										Line = BiliBiliArticleRead + V.link_card.card.biz_id
										break
									case 35 :
										if (Line = Card.find(B => V.link_card.card.biz_id === B.itemIdStr))
										{
											Img.push(Line.img)
											Line = `[${Line.name}](${Line.jumpLink})`
										}
										else Line = WC.OTJ(V)
										break
									default :
										Line = O.Bad('Unknown LinkType #' + V.link_card.card.link_type + ' | ' + WC.OTJ(V))
								}
								break
							default :
								O.Bad('Unknown ParaType #' + V.para_type + ' | ' + WC.OTJ(V))
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
				return O.Part(Part).FMap(Part => PadComment(
				{
					Title : Article.title,
					UP : Article.author.name,
					Date : 1E3 * Article.publish_time,
					Meta : O.MetaJoin
					(
						Meta,
						MetaExt,
					),
					Cover : Article.origin_image_urls?.[0],
					Part,
				},Article.author.mid,ID,12))
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
						var Part = [SolvePart(B)];
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
				MetaExt = [],
				R;
				CIDFirst = AV.pages[0].cid
				R =
				{
					Title : AV.title,
					UP : AV.owner.name,
					Date : 1E3 * AV.pubdate,
					Cover : AV.pic,
					Part
				}
				return (AV.stein_guide_cid ?
					Ext.ReqB(O.Coke(BiliBiliAPIPlayerWBI(ID,CIDFirst))).FMap(G =>
					{
						var
						Graph = WW.MF(/graph_version":(\d+)/,G),
						Visited = {},
						All = [],
						Enter = (Edge,CurrentCID) => Visited[CurrentCID] ?
							WX.Empty :
							Visited[CurrentCID] = Ext.ReqB(O.Coke(BiliBiliAPISteinEdge(ID,Graph,Edge))).FMap(B =>
							{
								var Next = [];
								B = Common(B)
								B.edges?.questions?.forEach(V => Next.push(...V.choices))
								All.push(
								{
									CID : CurrentCID,
									Title : B.title,
									Next,
								})
								return WX.From(Next).FMapE(V => Enter(V.id,V.cid))
							});
						return Enter('',CIDFirst).Fin().Map(() =>
						{
							var Index = WR.ReduceU((D,V,F) => {D[V.CID] = F},{},All);
							All.forEach((V,F) => MetaExt.push
							(
								`<${F}> CID ${V.CID} ${V.Title}`,
								...V.Next.map(B => `	<${Index[B.cid]}> [${B.id}] ${B.option}`),
							))
							return All.map(V => [V.CID,V.Title])
						})
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
							var U = SolvePart(B);
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
					.FMap(() =>
					{
						R.Meta = O.MetaJoin
						(
							AV.dynamic,
							[
								AV.desc,
								...B.Tags.map(V => WW.Quo(V.tag_id) + `#${V.tag_name}#` +
									(V.jump_url ? ' ' + V.jump_url : '')),
							],
							MetaExt
						)
						return PadComment(R,AV.owner.mid,ID,1)
					})
			})
		},
		IDView : WR.RepL(
		[
			/^(?=\d)/,'av',
			/#\d+$/,'',
		]),
		/*
			HTTP/1.1 412 Precondition Failed
			{"code":-412,"message":"请求被拦截","ttl":1,"data":null}
		*/
		Is429 : E => WW.ErrIs(WW.Err.NetBadStatus,E) && 412 === E.Arg[0],
		Pack : Q => WN.ReqOH(Q,'Referer',BiliBili),
		Range : false,
	}
}