'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	/*
		MyList seemed to have been terminated
		VC project had been terminated, posts are not normal videos but hidden from user uploaded lists. https://vc.bilibili.com/p/eden/rank
		Audio homepage. https://www.bilibili.com/audio/home?musicType=music
	*/
	PrefixTimeline = 'TL',
	// PrefixShortVideo = 'vc',
	PrefixAudio = 'au',
	PrefixArticle = 'cv',
	PrefixCheeseSeason = 'CheeseSeason',
	PrefixCheeseEpisode = 'CheeseEpisode',
	PrefixUGCSeries = 'UGCSeries',
	PrefixUGCSeason = 'UGCSeason',

	BiliBili = 'https://www.bilibili.com/',
	BiliBiliVideo = WW.Tmpl(BiliBili,'video/av',undefined),
	BiliBiliBgmMD = WW.Tmpl(BiliBili,'bangumi/media/md',undefined),
	BiliBiliBgmSS = WW.Tmpl(BiliBili,'bangumi/play/ss',undefined),
	BiliBiliBgmEP = WW.Tmpl(BiliBili,'bangumi/play/ep',undefined),
	BiliBiliMediaListFav = WW.Tmpl(BiliBili,'medialist/detail/ml',undefined),
	// BiliBiliMyList = WW.Tmpl(BiliBili,'mylist/mylist-',undefined,'.js'),
	BiliBiliAudio = BiliBili + 'audio/',
	BiliBiliAudioURL = BiliBili + 'audio/au',
	BiliBiliAudioWeb = BiliBiliAudio + 'music-service-c/web/',
	BiliBiliAudioWebInfo = WW.Tmpl(BiliBiliAudioWeb,'song/info?sid=',undefined),
	BiliBiliAudioWebUp = WW.Tmpl(BiliBiliAudioWeb,'song/upper?uid=',undefined,'&pn=',undefined,'&ps=',O.Size,'&order=1'),
	BiliBiliAudioWebMenu = WW.Tmpl(BiliBiliAudioWeb,'song/of-menu?sid=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliArticleRead = BiliBili + 'read/cv',
	BiliBiliArticleReadList = BiliBili + 'read/readlist/rl',
	BiliBiliArticleReadContent = WW.Tmpl(BiliBili,'read/native?id=',undefined),
	BiliBiliCheese = BiliBili + 'cheese/',
	BiliBiliCheeseSeason = WW.Tmpl(BiliBiliCheese,'play/ss',undefined),
	BiliBiliCheeseEpisode = WW.Tmpl(BiliBiliCheese,'play/ep',undefined),
	BiliBiliAPI = 'https://api.bilibili.com/',
	BiliBiliArticleList = WW.Tmpl(BiliBiliAPI,'x/article/list/articles?id=',undefined),
	BiliBiliAPIFavList = WW.Tmpl(BiliBiliAPI,'x/v3/fav/folder/created/list-all?up_mid=',undefined),
	BiliBiliAPIFav = WW.Tmpl(BiliBiliAPI,'medialist/gateway/base/spaceDetail?media_id=',undefined,'&pn=',undefined,'&ps=20'),
	BiliBiliAPIWeb = BiliBiliAPI + 'x/web-interface/',
	BiliBiliAPIWebNav = BiliBiliAPIWeb + 'nav',
	BiliBiliAPIWebView = WW.Tmpl(BiliBiliAPIWeb,'view?aid=',undefined),
	BiliBiliAPIWebViewBV = WW.Tmpl(BiliBiliAPIWeb,'view/detail?bvid=',undefined),
	BiliBiliAPIPlayerSo = WW.Tmpl(BiliBiliAPI,'x/player.so?aid=',undefined,'&id=cid:',undefined),
	BiliBiliAPISteinNode = WW.Tmpl(BiliBiliAPI,'x/stein/nodeinfo?aid=',undefined,'&graph_version=',undefined,'&node_id=',undefined),
	BiliBiliAPIFo = WW.Tmpl(BiliBiliAPI,'x/relation/followings?vmid=',undefined,'&ps=',O.Size,'&pn=',undefined),
	BiliBiliAPISpace = BiliBiliAPI + 'x/space/',
	BiliBiliAPISpaceInfo = WW.Tmpl(BiliBiliAPISpace,'acc/info?mid=',undefined),
	BiliBiliAPISpaceNavNum = WW.Tmpl(BiliBiliAPISpace,'navnum?mid=',undefined,'&callback='),
	// BiliBiliAPISpaceChannel = WW.Tmpl(BiliBiliAPISpace,'channel/video?mid=',undefined,'&cid=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliAPISpaceUpload = WW.Tmpl(BiliBiliAPISpace,'arc/search?mid=',undefined,'&ps=',O.Size,'&pn=',undefined),
	BiliBiliAPISpaceArticle = WW.Tmpl(BiliBiliAPISpace,'article?mid=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliAPIPolymer = BiliBiliAPI + 'x/polymer/',
	BiliBiliAPIPolymerSeries = WW.Tmpl(BiliBiliAPIPolymer,'space/seasons_series_list?mid=',undefined,'&page_num=',undefined,'&page_size=20'),
	BiliBiliAPIPolymerArchive = WW.Tmpl(BiliBiliAPIPolymer,'space/seasons_archives_list?mid=0&season_id=',undefined,'&page_num=',undefined,'&page_size=',O.Size),
	BiliBiliAPISeries = BiliBiliAPI + 'x/series/',
	// BiliBiliAPISeriesDetail = WW.Tmpl(BiliBiliAPISeries,'series?series_id=',undefined),
	BiliBiliAPISeriesArchive = WW.Tmpl(BiliBiliAPISeries,'archives?mid=',undefined,'&series_id=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliAPISearchTypeVideo = 'video',
	BiliBiliAPISearchTypeBgm = 'media_bangumi',
	BiliBiliAPISearchTypeFilm = 'media_ft',
	BiliBiliAPISearch = WW.Tmpl(BiliBiliAPIWeb,'search/type?search_type=',undefined,'&keyword=',undefined,'&page=',undefined,'&highlight=1',undefined),
	BiliBiliAPIPGC = BiliBiliAPI + 'pgc/',
	BiliBiliAPIPGCMedia = WW.Tmpl(BiliBiliAPIPGC,'view/web/media?media_id=',undefined),
	BiliBiliAPIPGCSeason = WW.Tmpl(BiliBiliAPIPGC,'view/web/season?season_id=',undefined),
	BiliBiliAPIPGCSeasonSection = WW.Tmpl(BiliBiliAPIPGC,'web/season/section?season_id=',undefined),
	BiliBiliAPIPUGV = BiliBiliAPI + 'pugv/',
	BiliBiliAPIPUGVViewSeason = WW.Tmpl(BiliBiliAPIPUGV,'view/web/season?season_id=',undefined),
	BiliBiliAPIPUGVViewSeasonByEP = WW.Tmpl(BiliBiliAPIPUGV,'view/web/season?ep_id=',undefined),
	BiliBiliAPIPUGVByUser = WW.Tmpl(BiliBiliAPIPUGV,'app/web/season/page?mid=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliSearch = 'https://search.bilibili.com/',
	BiliBiliSearchS = 'https://s.search.bilibili.com/',
	BiliBiliSearchSuggestion = WW.Tmpl(BiliBiliSearchS,'main/suggest?main_ver=v1&highlight&term=',undefined),
	BiliBiliSpace = 'https://space.bilibili.com/',
	BiliBiliSpaceDynamic = WW.Tmpl(BiliBiliSpace,undefined,'/dynamic'),
	BiliBiliSpaceAudio = WW.Tmpl(BiliBiliSpace,undefined,'/audio'),
	BiliBiliSpaceArticle = WW.Tmpl(BiliBiliSpace,undefined,'/article'),
	BiliBiliSpaceChannel = WW.Tmpl(BiliBiliSpace,undefined,'/channel/series'),
	BiliBiliSpaceChannelSeason = WW.Tmpl(BiliBiliSpace,undefined,'/channel/collectiondetail?sid=',undefined),
	BiliBiliSpaceChannelSeries = WW.Tmpl(BiliBiliSpace,undefined,'/channel/seriesdetail?sid=',undefined),
	BiliBiliSpacePUGV = WW.Tmpl(BiliBiliSpace,undefined,'/pugv'),
	BiliBiliSpaceFavList = WW.Tmpl(BiliBiliSpace,undefined,'/favlist'),
	BiliBiliSpaceFav = WW.Tmpl(BiliBiliSpace,undefined,'/favlist?fid=',undefined),
	// BiliBiliVC = 'https://vc.bilibili.com/',
	// BiliBiliVCVideo = WW.Tmpl(BiliBiliVC,'video/',undefined),
	BiliBiliVCAPI = 'https://api.vc.bilibili.com/',
	// BiliBiliVCAPIDetail = WW.Tmpl(BiliBiliVCAPI,'clip/v1/video/detail?video_id=',undefined),
	// BiliBiliVCAPIOnes = WW.Tmpl(BiliBiliVCAPI,'clip/v1/video/ones?poster_uid=',undefined,'&need_playurl=0&page_size=',O.Size,'&next_offset=',undefined),
	BiliBiliVCAPIDynamicAPIRoot = BiliBiliVCAPI + 'dynamic_svr/v1/dynamic_svr/',
	BiliBiliVCAPIDynamicType = 268435455,
	BiliBiliVCAPIDynamicNew = BiliBiliVCAPIDynamicAPIRoot + 'dynamic_new?uid=&type_list=' + BiliBiliVCAPIDynamicType,
	BiliBiliVCAPIDynamicHistory = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'dynamic_history?uid=&type=',BiliBiliVCAPIDynamicType,'&offset_dynamic_id=',undefined),
	BiliBiliVCAPIDynamicDetail = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'get_dynamic_detail?dynamic_id=',undefined),
	BiliBiliVCAPIDynamicDetailType2 = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'get_dynamic_detail?type=2&rid=',undefined),
	BiliBiliVCAPIDynamicUser = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'space_history?host_uid=',undefined,'&offset_dynamic_id=',undefined),
	BiliBiliTimeline = 'https://t.bilibili.com/',
	BiliBiliLive = 'https://live.bilibili.com/',
	// Appkey = '20bee1f7a18a425c',
	Common = function(V)
	{
		V = WW.IsObj(V) ? V : WC.JTO(V)
		V.code && O.Bad(V.code,V.msg || V.message)
		false === V.status && O.Bad(V.data)
		return V.data || V.result
	},
	SolveInitState = function(B){return O.JOM(/__INITIAL_STATE__=/,B)},
	SolveCTime = function(V)
	{
		return null != V && 'CTime ' + O.DTS(1E3 * V)
	},
	SolveAV = function(V)
	{
		var
		UP,EP;
		return {
			ID : V.aid,
			Img : V.pic || V.cover,
			Title : V.title || V.new_desc,
			UP : WR.Default(V.author,V.owner && V.owner.name) ||
				V.apiSeasonInfo && V.apiSeasonInfo.title + ' ss' + V.apiSeasonInfo.season_id,
			UPURL : (UP = WR.Default(V.mid,V.owner && V.owner.mid)) ? BiliBiliSpace + UP :
				V.apiSeasonInfo ? BiliBiliBgmSS(V.apiSeasonInfo.season_id) :
				null,
			Date : 1E3 * WR.Default(V.created,V.pubdate),
			Len : WR.Default(V.length,V.duration),
			Desc : WR.Default(V.description,V.desc),
			More : WR.Cat
			(
				WR.Map(function(B)
				{
					return O.Ah(B.title + ' ' + B.name,BiliBiliSpace + B.mid)
				},V.staff),
				[
					SolveCTime(V.ctime),
					V.stein_guide_cid &&
						O.Ah('Stein ' + V.stein_guide_cid + ' (' + V.videos + ')',
							BiliBiliVideo(V.aid) + '#Stein'),
					(EP = V.redirect_url) && O.Ah(EP = WW.MU(/ep\d+/,V.redirect_url),BiliBiliBgmEP(EP = EP.slice(2))),
					V.season_id && O.Ah(PrefixUGCSeason + V.season_id,BiliBiliSpaceChannelSeason(UP,V.season_id)),
					V.is_union_video ? '{UnionVideo}' : ''
				]
			),
			EP : EP
		}
	},
	SolveCV = function(V)
	{
		return {
			NonAV : true,
			ID : PrefixArticle + V.id,
			Img : V.banner_url,
			Title : V.title,
			UP : V.author.name,
			UPURL : BiliBiliSpace + V.author.mid,
			Date : 1E3 * V.publish_time,
			Desc : V.summary,
			More :
			[
				SolveCTime(V.ctime)
			]
		}
	},
	SolveDynamicSingle = function(Desc,Card)
	{
		var
		MakePost = function()
		{
			R =
			{
				NonAV : true,
				ID : PrefixTimeline + Desc.dynamic_id_str,
				Title : Card.item && (Card.item.description || Card.item.content),
				// Forwarded desc may not include user info
				UP : Card.user.name || Card.user.uname,
				UPURL : BiliBiliSpace + Card.user.uid,
				Date : 1E3 * Desc.timestamp,
				More : []
			}
		},
		R;
		Card = WC.JTO(Card)
		switch (Desc.type)
		{
			case 1 : // Forward
				MakePost()
				R.More.push(O.Ah(Desc.origin.dynamic_id_str,BiliBiliTimeline + Desc.origin.dynamic_id_str))
				Card.origin ?
					R = [R,SolveDynamicSingle(Desc.origin,Card.origin)] :
					R.More.push(Card.item.tips)
				break
			case 2 : // Picture
				MakePost()
				R.Img = WR.Pluck('img_src',Card.item.pictures)
				break
			case 4 : // Text Only
				MakePost()
				break
			case 8 : // Video
			case 512 :
				R = SolveAV(Card)
				break
			case 64 : // CV
				R = SolveCV(Card)
				break
			case 256 : // Audio
				R = SolveAU(Card)
				break
			case 2048 : // External
				MakePost()
				R.Img = Card.sketch.cover_url
				R.Title = Card.vest.content
				R.More.push
				(
					O.Ah(Card.sketch.title,Card.sketch.target_url),
					Card.sketch.desc_text
				)
				break
			case 4098 : // Movie 649924763705147506
			case 4099 : // Series
			case 4101 : // Series 658954502692405301
			case 4310 : // Channel 670374429942874210
				R = SolveAV(Card)
				break
			case 4200 : // Live
			case 4201 : // Live 129429363453235147
				R =
				{
					Non : true,
					ID : Card.roomid,
					URL : BiliBiliLive + Card.roomid,
					Img : Card.cover,
					Title : Card.title,
					UP : Card.uname,
					UPURL : BiliBiliSpace + Card.uid,
					Date : new Date(Card.live_time || Card.start_time),
					More :
					[
						Card.area_v2_parent_id && Card.area_v2_parent_id + ':' + Card.area_v2_parent_name,
						Card.area_v2_id + ':' + Card.area_v2_name
					]
				}
				break
			case 4300 : // Fav
				R =
				{
					Non : true,
					ID : Card.id,
					URL : BiliBiliMediaListFav(Card.id),
					Title : Card.title,
					Img : Card.cover,
					More : Card.media_count
				}
				break
			case 4302 : // Cheese
			case 4303 : // Cheese
				R =
				{
					Non : true,
					ID : PrefixCheeseSeason + Card.id,
					URL : BiliBiliCheeseSeason(Card.id),
					Img : Card.cover,
					Title : Card.title,
					UP : WR.Path(['up_info','name'],Card) ||
						WR.Path(['user_profile','info','uname'],Card),
					UPURL : BiliBiliSpace +
					(
						Card.up_id ||
						WR.Path(['user_profile','info','uid'],Card)
					),
					More : Card.subtitle
				}
				break
			case 4308 : // Live
				Card = Card.live_play_info || Card
				R =
				{
					Non : true,
					ID : Card.room_id,
					URL : BiliBiliLive + Card.room_id,
					Img : Card.cover,
					Title : Card.title,
					Date : new Date(1E3 * Card.live_start_time),
					More : Card.area_id + ':' + Card.area_name
				}
				break
			default :
				R =
				{
					Non : true,
					Unk : true,
					ID : PrefixTimeline + Desc.dynamic_id_str,
					Title : 'Unknown Type #' + Desc.type
				}
		}
		return R
	},
	SolveDynamic = function(V)
	{
		return SolveDynamicSingle(V.desc,V.card)
	},
	SolveDynamicResponse = function(B)
	{
		B = Common(B)
		return [B.history_offset ||
			B.has_more && WR.Last(B.cards).desc.dynamic_id_str, // B.next_offset
			{
				Item : WR.WhereU(function(V,F)
				{
					V.F = F
					return B !== (B = V.ID)
				},WR.Flatten(WR.Map(SolveDynamic,B.cards)))
					.sort(function(Q,S)
					{
						return !Q.Unk - !S.Unk || Q.F - S.F
					})
			}]
	},
	SolveHighLightRaw,
	SolveHighLight = function(V)
	{
		SolveHighLightRaw = ''
		return WR.MapU(function(V,F)
		{
			SolveHighLightRaw += V = WC.HED(V)
			return 1 & F ? O.High(V) : V
		},V.split(/<em[^>]+>([^<]+)<\/em>/))
	},
	EP2AV = WX.CacheM(function(ID)
	{
		return O.API(O.Head(BiliBiliBgmEP(ID),'Cookie','stardustpgcv=0')).Map(function(B)
		{
			B = SolveInitState(B)
			return [
				B.epInfo.aid,
				B.mediaInfo.ssId
			]
		})
	}),
	ShowCID = function(CID,Downloaded)
	{
		return 'CID ' + CID +
			(Downloaded && Downloaded[CID] ? '\n{Downloaded ' + Downloaded[CID] + '}' : '')
	},
	AV = function(ID,CID)
	{
		return O.API(BiliBiliAPIWebView(ID)).FMap(function(V)
		{
			V = WC.JTO(V)
			return -403 === V.code && O.Auth() ?
				O.Req(BiliBiliAPIWebView(ID)) :
				WX.Just(V)
		}).FMap(function(V,R,T)
		{
			V = Common(V)
			R = SolveAV(V)
			R = [R].concat(WR.MapU(function(B,F)
			{
				return {
					Index : B.page,
					ID : V.aid + '#' + B.cid,
					View : 'av' + V.aid + '?p=' + B.page,
					URL : BiliBiliVideo(V.aid + '?p=' + B.page),
					Img : R.Img,
					Title : R.Title + '.' + WR.PadL(V.pages.length,F) + (B.part ? '.' + B.part : ''),
					TitleView : B.part,
					UP : R.UP,
					UPURL : R.UPURL,
					Len : B.duration,
					More :
					[
						ShowCID(B.cid,CID)
					],
					CID : B.cid
				}
			},V.pages))
			if (T = V.ugc_season)
			{
				R.push(
				{
					Non : true,
					ID : PrefixUGCSeason + T.id,
					URL : false,
					Img : T.cover,
					Title : T.title
				})
				WR.EachU(function(V,F)
				{
					R.push(
					{
						Non : true,
						Index : PrefixUGCSeason + ' ' + WR.PadL(T.sections.length,F),
						ID : 'Section' + V.id,
						URL : false,
						Title : V.title
					})
					WR.EachU(function(B,G)
					{
						R.push(B = SolveAV(B.arc))
						B.Index = PrefixUGCSeason + ' '+ WR.PadL(T.sections.length,F) +
							' Section ' + WR.PadL(V.episodes.length,G)
					},V.episodes)
				},T.sections)
			}
			return (R[0].EP ? EP2AV(R[0].EP).Tap(function(Q)
			{
				R[0].More.push(O.Ah('ss' + Q[1],BiliBiliBgmSS(Q[1])))
			}) : WX.Just())
				.Map(WR.Const(R))
		})
	},
	AVWithCID = function(ID)
	{
		return O.DB('CID',ID).FMap(function(CID)
		{
			return AV(ID,CID)
		})
	},
	SolveAU = function(V)
	{
		var
		UP = V.uname || V.upper,
		UPID = V.uid || V.upId;
		return {
			ID : PrefixAudio + V.id,
			Img : V.cover,
			Title : V.title,
			UP : UP,
			UPURL : BiliBiliSpace + UPID,
			Date : 1E3 * V.passtime,
			Len : V.duration,
			More :
			[
				V.author && V.author !== UP ? V.author : '',
				V.intro,
				O.Ah('Audio@' + UP,BiliBiliSpaceAudio(UPID))
			]
		}
	},
	SolveAUList = function(V)
	{
		V = Common(V) || {}
		return {
			Len : V.totalSize || 0,
			Item : WR.Map(SolveAU,V.data || [])
		}
	},
	/*SolveVC = function(V)
	{
		return {
			ID : ShortVideoPrefix + V.item.id,
			URL : BiliBiliVCVideo(V.item.id),
			Img : V.item.cover.default,
			Title : V.item.description,
			UP : V.user.name,
			UPURL : BiliBiliSpace + V.user.uid,
			Date : V.item.upload_time,
			Len : V.item.video_time,
			More : O.Ah('VC@' + V.user.name,BiliBiliSpaceDynamic(V.user.uid))
		}
	},*/
	SolveCheeseSeason = function(B)
	{
		B = Common(B)
		return {
			Item : WR.Map(function(V)
			{
				return {
					Non : V.ep_status,
					ID : PrefixCheeseEpisode + V.id,
					URL : BiliBiliCheeseEpisode(V.id),
					Img : V.cover,
					Title : V.title,
					Len : V.duration,
					Date : 1E3 * V.release_date,
					More :
					[
						!!V.aid && 'av' + V.aid + '#' + V.cid,
						V.label,
						V.subtitle
					]
				}
			},B.episodes)
		}
	},
	Menu;
	return {
		ID : 'BiliBili',
		Name : '\u55F6\u54E9\u55F6\u54E9',
		Alias : 'B \u55F6\u54E9 \u54D4\u54E9\u54D4\u54E9 \u54D4\u54E9',
		Judge : /\bBiliBili\b|\b[AB]V\d+/i,
		Min : 'SESSDATA',
		Sign : function()
		{
			return O.Req(BiliBiliAPIWebNav).Map(function(B)
			{
				return Common(B).uname
			})
		},
		Map : [
		{
			Name : 'Search',
			Judge : O.Find,
			Example : 'メイドインアビス',
			View : function(ID,Page,Pref)
			{
				var
				Head = {Cookie : 'DedeUserID=0'},
				Find = function(H)
				{
					return O.API({URL : BiliBiliAPISearch(H,ID,Page,''),Head : Head}).Map(function(B)
					{
						B = Common(B)
						return [B.numPages,B.numResults,WR.Map(function(V)
						{
							return {
								Non : true,
								ID : V.pgc_season_id,
								View : 'ss' + V.pgc_season_id,
								URL : BiliBiliBgmSS,
								Img : V.cover,
								Title : (V.org_title && V.org_title !== V.title ? V.org_title + '\n' : '') +
									V.title,
								UP : 'md' + V.media_id,
								UPURL : BiliBiliBgmMD(V.media_id),
								Date : 1E3 * V.pubtime
							}
						},B.result)]
					}).ErrAs(function(){return WX.Just([0,[]])})
				};
				ID = WC.UE(ID)
				return WX.Merge
				(
					O.API({URL : BiliBiliAPISearch(BiliBiliAPISearchTypeVideo,ID,++Page,Pref ? '&' + WC.QSS(Pref) : ''),Head : Head}).Map(function(B)
					{
						B = Common(B)
						return [B.numPages,B.numResults,WR.MapU(function(V,F)
						{
							V = SolveAV(V)
							V.Index = F + ~-B.page * B.pagesize
							return V
						},B.result)]
					}),
					Find(BiliBiliAPISearchTypeBgm),
					Find(BiliBiliAPISearchTypeFilm),
					Menu ? WX.Empty :
						O.API(BiliBiliSearch)
							.FMap(function(B)
							{
								return WW.B.ReqB(O.SolU(WW.MF(/"([^"]+\/search\.[^"]+\.js)/,B)))
							})
							.Tap(function(B)
							{
								B = B.match(/menus:{o.+?}}}}}/g)
									.pop().slice(6,-3)
									.replace(/[\da-z]+(?=:["{])/g,'"$&"')
								Menu = WC.JTO(B)
								return WX.Empty
							})
							.FinErr()
							.FMap(WR.Const(WX.Empty))
				).Reduce(function(D,V)
				{
					return [WR.Max(D[0],V[0]),D[1] + V[1],WR.Concat(D[2],V[2])]
				}).Map(function(V)
				{
					return {
						Max : V[0],
						Len : V[1],
						Item : WR.EachU(function(B,F)
						{
							B.Non && (B.Index = 'Bgm#' + F)
							B.TitleView = SolveHighLight(B.Title)
							B.Title = SolveHighLightRaw
						},V[2].sort(function(Q,S)
						{
							return (0 | S.Non) - (0 | Q.Non) ||
								(Q.Non ? Q.ID - S.ID : Q.Index - S.Index)
						})),
						Pref : Menu && function(I)
						{
							var
							H = function(Q)
							{
								return 5E5 * (Q = Q.split('-'))[0] - ~Q[1]
							},
							R = WV.Pref({C : I});
							WR.EachU(function(V,F)
							{
								V = V[0] ?
									WR.Ent(V).sort(function(Q,S){return H(Q[0]) - H(S[0])}) :
									WR.Ent(V)
								R.S([[O.Pascal(F),WV.Inp(
								{
									Inp : R.C(F),
									NoRel : O.NoRel
								}).Drop(WR.Map(function(V)
								{
									return [V[0].split('-').pop(),V[1] + ' (' + V[0] + ')']
								},V))]])
							},Menu)
							return R
						}
					}
				})
			},
			Hint : function(Q)
			{
				return O.API(BiliBiliSearchSuggestion(WC.UE(Q))).Map(function(B)
				{
					B = WC.JTO(B)
					B.code && O.Bad(B.code,B.msg)
					return {
						Item : WR.Map(function(V)
						{
							return [
								V.value,
								SolveHighLight(V.name)
							]
						},WR.Unnest(WR.Val(B.result))),
						Desc : WR.MapU(WR.Join(' '),WR.Ent(B.cost.about)).join(', ')
					}
				})
			}
		},{
			Name : 'DynamicPost',
			Judge :
			[
				/\bT(?:\.\w+)+\/(\d+).*?\b(Type=2)\b/i,
				O.Num('DynamicPost|T(?:\\.\\w+)+|Dynamic(?=\\W+\\d{10})|TL')
			],
			Example : '2714420379649',
			View : function(ID)
			{
				ID = ID.split('#')
				return O.API(1 < ID.length ?
					BiliBiliVCAPIDynamicDetailType2(ID[0]) :
					BiliBiliVCAPIDynamicDetail(ID[0]))
					.Map(function(B)
					{
						B = Common(B)
						return {
							Item : WR.Flatten([SolveDynamic(B.card)])
						}
					})
			}
		},{
			Name : 'UserDynamic',
			Judge : O.Num('UserDynamic|Space(?=\\..*/Dynamic)'),
			Example : '2',
			View : O.More(function(ID)
			{
				return O.API(BiliBiliVCAPIDynamicUser(ID,''))
			},function(I,Page,ID)
			{
				return O.API(BiliBiliVCAPIDynamicUser(ID,I[Page]))
			},SolveDynamicResponse)
		}/*,{
			Name : 'VC',
			Judge : [O.Num('VC'),/\bVC\..*?Video\/(\d+)/i],
			View : function(ID)
			{
				return O.API(BiliBiliVCAPIDetail(ID)).Map(function(B)
				{
					return {
						Item : [SolveVC(Common(B))]
					}
				})
			}
		},{
			Name : 'Ones',
			Judge : O.Num('Ones|Space(?=\\..*\/Dynamic)'),
			View : O.More(function(ID)
			{
				return O.API(BiliBiliVCAPIOnes(ID,0))
			},function(I,Page,ID)
			{
				return O.API(BiliBiliVCAPIOnes(ID,I[Page]))
			},function(B)
			{
				B = Common(B)
				return [B.has_more && B.next_offset,
				{
					Item : WR.Map(function(V)
					{
						return SolveVC({user : B.user,item : V})
					},B.items)
				}]
			})
		}*/,{
			Name : 'Audio',
			Judge : O.Num('Audio|AU'),
			Example : 'au158984',
			View : function(ID)
			{
				return O.Req(BiliBiliAudioWebInfo(ID)).Map(function(B)
				{
					B = Common(B)
					return {
						Item : [SolveAU(B)]
					}
				})
			}
		},{
			Name : 'AudioMenu',
			Judge : O.Num('AudioMenu|AM'),
			Example : 'am109568',
			View : function(ID,Page)
			{
				return O.API(BiliBiliAudioWebMenu(ID,-~Page))
					.Map(SolveAUList)
			}
		},{
			Name : 'UserAudio',
			Judge : O.Num('UserAudio|Space(?=\\..*/Audio)'),
			Example : '391679',
			View : function(ID,Page)
			{
				return O.API(BiliBiliAudioWebUp(ID,-~Page))
					.Map(SolveAUList)
			}
		},{
			Name : 'Article',
			Judge : O.Num('Article|Read|CV'),
			Example : '2',
			View : function(ID)
			{
				return O.API(BiliBiliArticleReadContent(ID))
					.Map(function(B)
					{
						B = SolveInitState(B).readInfo
						return {
							Item : [
							{
								NonAV : true,
								ID : PrefixArticle + B.id,
								Img : B.banner_url,
								Title : B.title,
								UP : B.author.name,
								UPURL : BiliBiliSpace + B.author.mid,
								Date : 1E3 * B.publish_time,
								Desc : O.Text(B.content),
								More :
								[
									SolveCTime(B.ctime),
									B.list && O.Ah(B.list.name + ' rl' + B.list.id,BiliBiliArticleReadList + B.list.id)
								]
							}]
						}
					})
			}
		},{
			Name : 'ArticleList',
			Judge : O.Num('ArticleList|ReadList|RL'),
			Example : '500',
			View : O.Less(function(ID)
			{
				return O.API(BiliBiliArticleList(ID))
					.Map(function(B)
					{
						B = Common(B)
						return WR.Map(function(V)
						{
							return {
								NonAV : true,
								ID : PrefixArticle + V.id,
								Img : V.image_urls,
								Title : V.title,
								UP : B.author.name,
								UPURL : BiliBiliSpace + B.author.mid,
								Date : 1E3 * V.publish_time,
								Desc : V.summary
							}
						},WR.Rev(B.articles))
					})
			})
		},{
			Name : 'UserArticle',
			Judge : O.Num('UserArticle|Space(?=\\..*/Article)'),
			Example : '144900660',
			View : function(ID,Page)
			{
				return O.API(BiliBiliAPISpaceArticle(ID,-~Page))
					.Map(function(B)
					{
						B = Common(B)
						return {
							Len : B.count,
							Item : WR.Map(function(V)
							{
								return {
									NonAV : true,
									ID : PrefixArticle + V.id,
									Img : V.banner_url || V.image_urls,
									Title : V.title,
									UP : V.author.name,
									UPURL : BiliBiliSpace + V.author.mid,
									Date : 1E3 * V.publish_time,
									Desc : V.summary
								}
							},B.articles)
						}
					})
			}
		},{
			Name : 'Stein',
			Judge : [/AV(\d+)\W+Stein/i,O.Num('Stein')],
			Example : '841474000',
			View : O.Less(WX.CacheL(function(ID)
			{
				return O.DB('CID',ID).FMap(function(CIDDB)
				{
					return AV(ID).FMap(function(R)
					{
						var CID = R[1].CID;
						R.pop()
						return O.API(O.Head(BiliBiliAPIPlayerSo(ID,CID),'Referer',BiliBili)).FMap(function(B)
						{
							var
							Loaded = 0,Max = 0,
							Graph = WW.MF(/graph_version":(\d+)/,B),
							CID2Node = WR.OfObj(CID,[1]),
							Node2CID = {1 : CID};
							Graph || O.Bad('Unable to acquire GraphVersion')
							R[0].More.push('Graph ' + Graph)
							return WX.Exp(function(I)
							{
								return O.API(BiliBiliAPISteinNode(ID,Graph,CID === I ? '' : CID2Node[I][0])).Map(function(V)
								{
									V = Common(V)
									++Loaded
									R.push(
									{
										ID : ID + '#' + I,
										URL : BiliBiliVideo(ID),
										Img : V.story_list[0].cover.replace(CID,I),
										Title : V.title,
										More :
										[
											ShowCID(I,CIDDB)
										],
										Next : V.edges && V.edges.choices,
										CID : I,
										Node : CID2Node[I]
									})
									V = V.edges && WR.Map(function(B)
									{
										Node2CID[B.node_id] = B.cid
										CID2Node[B.cid] ?
											CID2Node[B.cid].push(B.node_id) :
											CID2Node[++Max,B.cid] = [B.node_id]
										return B.cid
									},V.edges.choices)
									O.Progress('Node ' + Loaded + ' / ' + Max)
									return V
								})
							},CID,true)
						}).Map(function(C)
						{
							WR.EachU(function(V){V.Node.sort(WR.Sub)})
							R.sort(function(Q,S)
							{
								return !Q.Len - !S.Len ||
									Q.Node[0] - S.Node[0]
							})
							C = WR.ReduceU(function(D,V,F){D[V.CID] = F},{},R)
							WR.EachU(function(V,F)
							{
								if (F)
									V.More = WR.Flatten(
									[
										'Node' + WW.Quo(V.Node.length) + V.Node.join(' '),
										WR.Map(function(B)
										{
											return WW.Quo(C[B.cid] + ':' + B.node_id) + B.option
										},V.Next),
										V.More
									])
							},R)
							return R
						})
					})
				})
			}))
		},{
			Name : 'Video',
			Judge : [/^\d+$/,O.Num('Video|AID|AV')],
			Example : '9',
			View : O.Less(AVWithCID)
		},{
			Name : 'BV',
			Judge : /\bBV[\d\w]+\b/i,
			Example : 'BV1xx411c7mC',
			View : O.Less(function(ID)
			{
				return O.API(BiliBiliAPIWebViewBV(ID)).FMap(function(B)
				{
					return AVWithCID(Common(B).View.aid)
				})
			})
		},{
			Name : 'Fav',
			Judge : O.Num('Fav|FID|ML'),
			Example : '61989503',
			View : function(ID,Page)
			{
				return O.API(BiliBiliAPIFav(ID,-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.info.media_count,
						Size : 20,
						Item : WR.Map(function(V)
						{
							var R =
							{
								ID : V.id,
								Img : V.cover,
								Title : V.title,
								UP : V.upper.name,
								UPURL : BiliBiliSpace + V.upper.mid,
								Date : 1E3 * V.pubtime,
								Desc : V.intro
							};
							switch (V.type)
							{
								case 12 :
									R.ID = PrefixAudio + R.ID
									break
							}
							return R
						},B.medias)
					}
				})
			}
		},{
			Name : 'FavList',
			Judge : [O.NumR('FavList'),O.Num('FavList')],
			View : function(ID)
			{
				return O.API(BiliBiliAPIFavList(ID)).Map(function(B)
				{
					B = Common(B)
					return {
						Item : WR.Map(function(V)
						{
							return {
								Non : true,
								ID : V.id,
								URL : BiliBiliSpaceFav(ID,V.id),
								Title : V.title,
								More : V.media_count
							}
						},B && B.list)
					}
				})
			}
		},{
			Name : PrefixUGCSeason,
			Judge : O.Num('UGCSeason|Channel.*Collection(?:Detail)'),
			View : function(ID,Page)
			{
				return O.API(BiliBiliAPIPolymerArchive(ID,-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.page.total,
						Item : WR.Map(SolveAV,B.archives)
					}
				})
			}
		},{
			Name : PrefixUGCSeries,
			Judge :
			[
				/UGCSeries.*?(\d+)\D+(\d+)/i,
				/\b(\d+)\b.*Series(?:Detail)?.*SID=(\d+)/i
			],
			Join : ' ',
			View : function(ID,Page)
			{
				ID = WR.Match(/\d+/g,ID)
				return O.API(BiliBiliAPISeriesArchive(ID[0],ID[1],-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.page.total,
						Item : WR.Map(SolveAV,B.archives)
					}
				})
			}
		},{
			Name : 'Channel',
			Judge :
			[
				O.NumR('Channel'),
				O.Num('Channel')
			],
			View : function(ID,Page)
			{
				return O.API(BiliBiliAPIPolymerSeries(ID,-~Page)).Map(function(B)
				{
					B = Common(B).items_lists
					return {
						Len : B.page.total,
						Size : 20,
						Item : WR.Map(function(V)
						{
							V = V.meta
							return {
								Non : true,
								ID : V.season_id ?
									PrefixUGCSeason + V.season_id :
									PrefixUGCSeries + V.series_id,
								URL : V.season_id ?
									BiliBiliSpaceChannelSeason(V.mid,V.season_id) :
									BiliBiliSpaceChannelSeries(V.mid,V.series_id),
								Img : V.cover,
								Title : V.name,
								Date : 1E3 * (V.mtime || V.ptime),
								More : V.description
							}
						},WR.Concat(B.seasons_list,B.series_list))
					}
				})
			}
		},{
			Name : 'PUGV',
			Judge :
			[
				O.NumR('PUGV'),
				O.Num('PUGV')
			],
			View : function(ID,Page)
			{
				return O.API(BiliBiliAPIPUGVByUser(ID,-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.page.total,
						Item : WR.Map(function(V)
						{
							return {
								Non : true,
								ID : PrefixCheeseSeason + V.season_id,
								URL : BiliBiliCheeseSeason(V.season_id),
								Img : V.cover,
								Title : V.title,
								More : V.subtitle
							}
						},B.items)
					}
				})
			}
		},{
			Name : 'User',
			Judge : O.Num('Space|User'),
			Example : '2',
			View : function(ID,Page)
			{
				return (Page ? WX.Just([]) : O.Req(BiliBiliAPISpaceInfo(ID)).FMap(function(UP)
				{
					UP = Common(UP)
					return O.API(O.Head(BiliBiliAPISpaceNavNum(ID),'Referer',BiliBili)).Map(function(Nav)
					{
						Nav = Common(Nav)
						return [
						{
							Non : true,
							ID : ID,
							URL : BiliBiliSpace + ID,
							Img : UP.face,
							UP : UP.name,
							UPURL : BiliBiliSpace + ID,
							More :
							[
								UP.sign,
								O.Ah('Dynamic',BiliBiliSpaceDynamic(ID)),
								O.Ah('Audio ' + Nav.audio,BiliBiliSpaceAudio(ID)),
								O.Ah('Article',BiliBiliSpaceArticle(ID)),
								O.Ah('Channel',BiliBiliSpaceChannel(ID)),
								O.Ah('PUGV',BiliBiliSpacePUGV(ID)),
								O.Ah('Fav',BiliBiliSpaceFavList(ID))
							]
						}]
					})
				})).FMap(function(UP)
				{
					return O.Req(BiliBiliAPISpaceUpload(ID,-~Page)).Map(function(V)
					{
						V = Common(V)
						return {
							Len : V.page.count,
							Item : WR.Concat(UP,WR.MapU(function(V,F)
							{
								V = SolveAV(V)
								Page || (V.Index = F)
								return V
							},V.list.vlist))
						}
					})
				})
			}
		},{
			Name : 'Following',
			Judge : O.UP,
			View : function(_,Page)
			{
				return O.Req(BiliBiliAPIWebNav).FMap(function(B)
				{
					return O.Req(BiliBiliAPIFo(Common(B).mid,-~Page))
				}).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.total,
						Item : WR.Map(function(V)
						{
							return {
								Non : true,
								ID : V.mid,
								URL : BiliBiliSpace + V.mid,
								Img : V.face,
								UP : V.uname,
								UPURL : BiliBiliSpace + V.mid,
								Date : 1E3 * V.mtime,
								Desc : V.sign,
								More : V.official_verify && V.official_verify.desc
							}
						},B.list)
					}
				})
			}
		},{
			Name : 'Dynamic',
			Judge : O.TL,
			View : O.More(function()
			{
				return O.Req(BiliBiliVCAPIDynamicNew)
			},function(I,Page)
			{
				return O.Req(BiliBiliVCAPIDynamicHistory(I[Page]))
			},SolveDynamicResponse)
		},{
			Name : PrefixCheeseSeason,
			Judge : O.Num('CheeseSeason|Cheese.*SS'),
			View : function(ID)
			{
				return O.API(BiliBiliAPIPUGVViewSeason(ID)).Map(SolveCheeseSeason)
			}
		},{
			Name : PrefixCheeseEpisode,
			Judge : O.Num('CheeseEpisode|Cheese.*EP'),
			View : function(ID)
			{
				return O.API(BiliBiliAPIPUGVViewSeasonByEP(ID)).Map(SolveCheeseSeason)
			}
		},{
			Name : 'Episode',
			Judge : O.Num('Episode|EP'),
			Example : '340931',
			View : O.Less(function(ID)
			{
				return EP2AV(ID).FMap(function(Q)
				{
					return AVWithCID(Q[0])
				})
			})
		},{
			Name : 'Season',
			Judge : O.Num('Season|SS|BanGuMi\\b.*?\\bAnime'),
			Example : '34543',
			View : O.Less(function(ID)
			{
				return O.API(BiliBiliAPIPGCSeason(ID)).FMap(function(B)
				{
					var
					AVAll = {},
					AVList,
					SingleExpanded;
					B = Common(B)
					WR.Each(function(V)
					{
						AVAll[V.aid] = -~AVAll[V.aid]
					},B.episodes)
					AVList = WR.Key(AVAll)
					SingleExpanded = 1 === AVList.length && 1 < B.episodes.length
					return (SingleExpanded ? O.DB('CID',AVList[0]) : WX.Just()).Map(function(CID)
					{
						return [
						{
							Non : true,
							ID : 'ss' + B.season_id,
							URL : BiliBiliBgmSS(B.season_id),
							Img : B.cover,
							Title : B.title,
							UP : 'md' + B.media_id,
							UPURL : BiliBiliBgmMD(B.media_id),
							Date : B.publish.pub_time,
							Desc : B.evaluate,
							More : B.time_length_show
						}].concat(WR.MapU(function(V,F)
						{
							return {
								Index : F,
								ID : SingleExpanded ? V.aid + '#' + V.cid : V.aid,
								URL : BiliBiliBgmEP(V.id),
								Img : V.cover,
								Title : WR.Trim(V.title + ' ' + V.long_title),
								UP : 'ep' + V.id,
								UPURL : BiliBiliBgmEP(V.id),
								More :
								[
									SingleExpanded && ShowCID(V.cid,CID)
								]
							}
						},B.episodes))
					})
				}).FMap(function(R)
				{
					return O.API(BiliBiliAPIPGCSeasonSection(ID)).Map(function(B)
					{
						B = Common(B)
						return WR.Concat(R,WR.Unnest(WR.Map(function(V)
						{
							return WR.Map(function(B)
							{
								return {
									ID : B.aid,
									URL : BiliBiliBgmEP(B.id),
									Img : B.cover,
									Title : WR.Trim(V.title + ' | ' + B.title + ' ' + B.long_title),
									UP : 'ep' + B.id,
									UPURL : BiliBiliBgmEP(B.id),
								}
							},V.episodes)
						},B.section)))
					})
				})
			})
		},{
			Name : 'Media',
			Judge : O.Num('Media|MD'),
			Example : '28230043',
			View : function(ID)
			{
				return O.API(BiliBiliAPIPGCMedia(ID))
					.FMap(function(B){return O.API(BiliBiliAPIPGCSeason(Common(B).season_id))})
					.Map(function(B)
					{
						B = Common(B)
						return {
							Item : WR.Map(function(V,J)
							{
								J = V.season_id === B.season_id
								return {
									Non : true,
									ID : 'ss' + V.season_id,
									URL : BiliBiliBgmSS(V.season_id),
									Img : V.cover,
									Title : J ? B.title : V.season_title,
									UP : 'md' + V.media_id,
									UPURL : BiliBiliBgmMD(V.media_id),
									Date : J && B.publish.pub_time,
									Desc : J && B.evaluate,
									More : J && B.time_length_show
								}
							},B.seasons.length ? B.seasons : [B])
						}
					})
			}
		}/*,{
			Name : 'MyList',
			Judge : O.Num('MyList'),
			View : O.Less(function(ID)
			{
				return O.API(BiliBiliMyList(ID)).Map(function(B)
				{
					B = WW.MF(/Array\(([^]+)\);\s+init/,B)
					return WR.Map(function(V)
					{
						return {
							ID : V.aid,
							Title : V.title,
							Date : 1E3 * V.pubdate
						}
					},WC.JTO('[' + B + ']'))
				})
			})
		}*/],
		IDView : WR.RepL(
		[
			/^(?=\d)/,'av'
		]),
		IDURL : function(Q)
		{
			Q = /^([A-Z]*)(\d+)$/i.exec(Q) || ['','',Q]
			return PrefixTimeline === Q[1] ? BiliBiliTimeline + Q[2] :
				PrefixAudio === Q[1] ? BiliBiliAudioURL + Q[2] :
				PrefixArticle === Q[1] ? BiliBiliArticleRead + Q[2] :
				PrefixCheeseEpisode === Q[1] ? BiliBiliCheeseEpisode(Q[2]) :
				BiliBiliVideo(Q[2].replace(/#\d+$/,''))
		}
	}
})