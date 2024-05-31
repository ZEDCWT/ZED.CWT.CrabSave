'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	/*
		MyList seemed to have been terminated
		VC project had been terminated, posts are now normal videos but hidden from user uploaded lists. https://vc.bilibili.com/p/eden/rank
		Audio homepage. https://www.bilibili.com/audio/home?musicType=music
	*/
	PrefixVideo = 'av',
	PrefixTimeline = 'TL',
	// PrefixShortVideo = 'vc',
	PrefixAudio = 'au',
	PrefixArticleList = 'rl',
	PrefixArticle = 'cv',
	PrefixBgmMedia = 'md',
	PrefixBgmSeason = 'ss',
	PrefixBgmEpisode = 'ep',
	PrefixCheeseSeason = 'CheeseSeason',
	PrefixCheeseEpisode = 'CheeseEpisode',
	PrefixUGCSeries = 'UGCSeries',
	PrefixUGCSeason = 'UGCSeason',

	BiliBili = 'https://www.bilibili.com/',
	BiliBiliVideo = WW.Tmpl(BiliBili,'video/av',undefined),
	BiliBiliBgmMedia = WW.Tmpl(BiliBili,'bangumi/media/md',undefined),
	BiliBiliBgmSeason = WW.Tmpl(BiliBili,'bangumi/play/ss',undefined),
	BiliBiliBgmEpisode = WW.Tmpl(BiliBili,'bangumi/play/ep',undefined),
	// BiliBiliOpus = WW.Tmpl(BiliBili,'opus/',undefined), // Basically a timeline
	// BiliBiliMediaListFav = WW.Tmpl(BiliBili,'medialist/detail/ml',undefined),
	// BiliBiliMyList = WW.Tmpl(BiliBili,'mylist/mylist-',undefined,'.js'),
	BiliBiliAudio = BiliBili + 'audio/',
	BiliBiliAudioURL = BiliBili + 'audio/au',
	BiliBiliAudioMenu = BiliBili + 'audio/am',
	BiliBiliAudioWeb = BiliBiliAudio + 'music-service-c/web/',
	BiliBiliAudioWebInfo = WW.Tmpl(BiliBiliAudioWeb,'song/info?sid=',undefined),
	BiliBiliAudioWebUp = WW.Tmpl(BiliBiliAudioWeb,'song/upper?uid=',undefined,'&pn=',undefined,'&ps=',O.Size,'&order=1'),
	BiliBiliAudioWebMenu = WW.Tmpl(BiliBiliAudioWeb,'song/of-menu?sid=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliArticleRead = BiliBili + 'read/cv',
	BiliBiliArticleReadList = BiliBili + 'read/readlist/rl',
	// BiliBiliArticleReadContent = WW.Tmpl(BiliBili,'read/native?id=',undefined),
	BiliBiliCheese = BiliBili + 'cheese/',
	BiliBiliCheeseSeason = WW.Tmpl(BiliBiliCheese,'play/ss',undefined),
	BiliBiliCheeseEpisode = WW.Tmpl(BiliBiliCheese,'play/ep',undefined),
	BiliBiliAPI = 'https://api.bilibili.com/',
	BiliBiliAPIArticle = BiliBiliAPI + 'x/article/',
	BiliBiliAPIArticleList = WW.Tmpl(BiliBiliAPIArticle,'list/articles?id=',undefined),
	BiliBiliAPIArticleView = WW.Tmpl(BiliBiliAPIArticle,'view?id=',undefined),
	// BiliBiliAPIArticleInfo = WW.Tmpl(BiliBiliAPI,'x/article/viewinfo?id=',undefined,'&mobi_app=unknown'),
	BiliBiliAPIFavList = WW.Tmpl(BiliBiliAPI,'x/v3/fav/folder/created/list-all?up_mid=',undefined),
	BiliBiliAPIFav = WW.Tmpl(BiliBiliAPI,'medialist/gateway/base/spaceDetail?media_id=',undefined,'&pn=',undefined,'&ps=20'),
	BiliBiliAPIWeb = BiliBiliAPI + 'x/web-interface/',
	BiliBiliAPIWebNav = BiliBiliAPIWeb + 'nav',
	// BiliBiliAPIWebView = WW.Tmpl(BiliBiliAPIWeb,'view?aid=',undefined),
	BiliBiliAPIWebViewDetail = WW.Tmpl(BiliBiliAPIWeb,'view/detail?aid=',undefined),
	BiliBiliAPIWebViewDetailBV = WW.Tmpl(BiliBiliAPIWeb,'view/detail?bvid=',undefined),
	BiliBiliAPIPlayerSo = WW.Tmpl(BiliBiliAPI,'x/player.so?aid=',undefined,'&id=cid:',undefined),
	BiliBiliAPISteinNode = WW.Tmpl(BiliBiliAPI,'x/stein/nodeinfo?aid=',undefined,'&graph_version=',undefined,'&node_id=',undefined),
	BiliBiliAPIFo = WW.Tmpl(BiliBiliAPI,'x/relation/followings?vmid=',undefined,'&ps=',O.Size,'&pn=',undefined),
	BiliBiliAPISpace = BiliBiliAPI + 'x/space/',
	BiliBiliAPISpaceNavNum = WW.Tmpl(BiliBiliAPISpace,'navnum?mid=',undefined),
	// BiliBiliAPISpaceChannel = WW.Tmpl(BiliBiliAPISpace,'channel/video?mid=',undefined,'&cid=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliAPISpaceWBI = BiliBiliAPISpace + 'wbi/',
	BiliBiliAPISpaceWBIInfo = WW.Tmpl(BiliBiliAPISpaceWBI,'acc/info?platform=web&mid=',undefined),
	BiliBiliAPISpaceWBIUpload = WW.Tmpl(BiliBiliAPISpaceWBI,'arc/search?mid=',undefined,'&ps=',O.Size,'&pn=',undefined),
	BiliBiliAPISpaceArticle = WW.Tmpl(BiliBiliAPISpace,'article?mid=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliAPIPolymer = BiliBiliAPI + 'x/polymer/',
	BiliBiliAPIPolymerSeries = WW.Tmpl(BiliBiliAPIPolymer,'space/seasons_series_list?mid=',undefined,'&page_num=',undefined,'&page_size=20'),
	BiliBiliAPIPolymerArchive = WW.Tmpl(BiliBiliAPIPolymer,'space/seasons_archives_list?mid=0&season_id=',undefined,'&page_num=',undefined,'&page_size=',O.Size),
	BiliBiliAPIPolymerDynamic = BiliBiliAPIPolymer + 'web-dynamic/v1/',
	BiliBiliAPIPolymerDynamicFeature = '&features=' +
	[
		// 'itemOpusStyle', // Enabling this will convert `module_dynamic.major.type` to `MAJOR_TYPE_OPUS`
		'listOnlyfans',
		'opusBigCover',
		'onlyfansVote'
	],
	BiliBiliAPIPolymerDynamicDetail = WW.Tmpl(BiliBiliAPIPolymerDynamic,'detail?id=',undefined),
	BiliBiliAPIPolymerDynamicNew = WW.Tmpl(BiliBiliAPIPolymerDynamic,'feed/all?type=all',BiliBiliAPIPolymerDynamicFeature,'&offset=',undefined),
	BiliBiliAPIPolymerDynamicSpace = WW.Tmpl(BiliBiliAPIPolymerDynamic,'feed/space?',BiliBiliAPIPolymerDynamicFeature,'&host_mid=',undefined,'&offset=',undefined),
	BiliBiliAPISeries = BiliBiliAPI + 'x/series/',
	// BiliBiliAPISeriesDetail = WW.Tmpl(BiliBiliAPISeries,'series?series_id=',undefined),
	BiliBiliAPISeriesArchive = WW.Tmpl(BiliBiliAPISeries,'archives?mid=',undefined,'&series_id=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliAPISearchTypeVideo = 'video',
	BiliBiliAPISearchTypeBgm = 'media_bangumi',
	BiliBiliAPISearchTypeFilm = 'media_ft',
	BiliBiliAPISearchTypeUser = 'bili_user',
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
	BiliBiliSearchKeyword = WW.Tmpl(BiliBiliSearch,'all?keyword=',undefined),
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
	// BiliBiliVCAPI = 'https://api.vc.bilibili.com/',
	// BiliBiliVCAPIDetail = WW.Tmpl(BiliBiliVCAPI,'clip/v1/video/detail?video_id=',undefined),
	// BiliBiliVCAPIOnes = WW.Tmpl(BiliBiliVCAPI,'clip/v1/video/ones?poster_uid=',undefined,'&need_playurl=0&page_size=',O.Size,'&next_offset=',undefined),
	// BiliBiliVCAPIDynamicAPIRoot = BiliBiliVCAPI + 'dynamic_svr/v1/dynamic_svr/',
	// BiliBiliVCAPIDynamicType = 268435455,
	// BiliBiliVCAPIDynamicNew = BiliBiliVCAPIDynamicAPIRoot + 'dynamic_new?uid=&type_list=' + BiliBiliVCAPIDynamicType,
	// BiliBiliVCAPIDynamicHistory = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'dynamic_history?uid=&type=',BiliBiliVCAPIDynamicType,'&offset_dynamic_id=',undefined),
	// BiliBiliVCAPIDynamicDetail = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'get_dynamic_detail?dynamic_id=',undefined),
	// BiliBiliVCAPIDynamicDetailType2 = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'get_dynamic_detail?type=2&rid=',undefined),
	// BiliBiliVCAPIDynamicUser = WW.Tmpl(BiliBiliVCAPIDynamicAPIRoot,'space_history?host_uid=',undefined,'&offset_dynamic_id=',undefined),
	BiliBiliTimeline = 'https://t.bilibili.com/',
	// BiliBiliTimelineVote = WW.Tmpl(BiliBiliTimeline,'vote/h5/index/#/result?vote_id=',undefined),
	BiliBiliLive = 'https://live.bilibili.com/',
	// Appkey = '20bee1f7a18a425c',
	ReqWBISalt = 'bdab7be0a313f1d847ccd8999e1b4370',ReqWBILast,
	ReqWBI = function(Q)
	{
		Q = WW.N.ReqOH(Q,'Referer',BiliBili)
		return (ReqWBILast && WW.Now() < 144E5 + ReqWBILast ? WX.Just() : O.API(BiliBiliSpace + 2).FMap(function(Space)
		{
			Space = WW.MR(function(D,V){return D.push(V[1]),D},[],/<script[^>]+src="([^"]+space[^"]+)/g,Space)
			return WX.From(Space)
				.FMap(O.API)
				.Reduce(WR.Add)
				.FMap(function(Script)
				{
					return O.API(BiliBiliAPIWebNav).Map(function(Nav)
					{
						var
						// IS = WC.JTO(WW.MU(/{img:[^}]+}/,Script).replace(/(\w+):/g,'"$1":')),
						IS = Common(Nav,true).wbi_img,
						Index = O.JOM(/\.subKey[^]+?(?=\[[\d,]+\])/,Script),
						SolveFakeURL = function(Q){return WW.MF(/\/([^/.]+)\.\w+$/,Q)};
						// IS = IS.img + IS.sub
						IS = SolveFakeURL(IS.img_url) + SolveFakeURL(IS.sub_url)
						ReqWBISalt = WR.Map(function(V){return IS.charAt(V) || ''},Index).join('').slice(0,32)
						ReqWBILast = WW.Now()
					})
				})
		})).FMap(function()
		{
			if (WR.StartW(BiliBiliAPISpaceWBI,Q.URL))
			{
				Q.URL += '&wts=' + ~~(WW.Now() / 1E3)
				Q.URL += '&w_rid=' + WR.Low(WC.HEXS(WC.MD5
				(
					Q.URL.split('?')[1].split('&').sort().join('&') +
					ReqWBISalt
				)))
			}
			return O.Req(Q).Map(function(B)
			{
				if (-403 === WC.JTO(B).code)
					ReqWBILast = null
				return Common(B)
			})
		})
	},
	Common = function(V,IgnoreErr)
	{
		V = WW.IsObj(V) ? V : WC.JTO(V)
		if (!IgnoreErr)
		{
			V.code && O.Bad(V.code,V.msg || V.message)
			false === V.status && O.Bad(V.data)
		}
		return V.data || V.result
	},
	SolveInitState = function(B)
	{
		return O.JOM(/__INITIAL_STATE__=|<script[^>]+__NEXT_DATA__[^>]+>/,B)
	},
	SolveCTime = function(V)
	{
		return null != V && 'CTime ' + O.DTS(1E3 * V)
	},
	SolveAV = function(V,Detail)
	{
		var
		UP,EP;
		return {
			ID : V.aid,
			Img : V.pic || V.cover,
			Title : V.title || V.new_desc,
			UP : WR.Default(V.author,V.owner && V.owner.name) ||
				V.apiSeasonInfo && V.apiSeasonInfo.title + ' ' + PrefixBgmSeason + V.apiSeasonInfo.season_id,
			UPURL : (UP = WR.Default(V.mid,V.owner && V.owner.mid)) ? BiliBiliSpace + UP :
				V.apiSeasonInfo ? BiliBiliBgmSeason(V.apiSeasonInfo.season_id) :
				null,
			Date : 1E3 * WR.Default(V.created,V.pubdate),
			Len : WR.Default(V.length,V.duration),
			More :
			[
				V.dynamic,
				WR.Default(V.description,V.desc),
				Detail && WR.Map(function(V)
				{
					return O.Ah(WW.Quo(V.tag_id) + '#' + V.tag_name + '#',
						V.jump_url || BiliBiliSearchKeyword(WC.UE(V.tag_name)))
				},Detail.Tags),
				WR.Map(function(B)
				{
					return O.Ah(B.title + ' ' + B.name,BiliBiliSpace + B.mid)
				},V.staff),
				[
					SolveCTime(V.ctime),
					V.stein_guide_cid &&
						O.Ah('Stein ' + V.stein_guide_cid + ' (' + V.videos + ')',
							BiliBiliVideo(V.aid) + '#Stein'),
					(EP = V.redirect_url) && O.Ah(EP = WW.MU(/ep\d+/,V.redirect_url),BiliBiliBgmEpisode(EP = EP.slice(2))),
					!!V.season_id && O.Ah(PrefixUGCSeason + V.season_id,BiliBiliSpaceChannelSeason(UP,V.season_id)),
					V.is_union_video ? '{UnionVideo}' : ''
				]
			],
			EP : EP
		}
	},
	SolveCV = function(B)
	{
		var
		Img = B.banner_url || B.origin_image_urls,
		Article;
		WW.IsArr(Img) || (Img = Img ? [Img] : [])
		if (Article = B.opus)
			Article = WR.Map(function(V)
			{
				var
				Line = '',
				SolveText = function(Q)
				{
					WR.Each(function(B)
					{
						switch (B.node_type)
						{
							case 1 :
								Line += B.word.words || ''
								break
							default :
								Line += WC.OTJ(B)
						}
					},Q.nodes)
				};
				switch (V.para_type)
				{
					case 1 :
						SolveText(V.text)
						break
					case 2 :
						Line = []
						WR.Each(function(B)
						{
							Img.push(B.url)
							Line.push(B.url)
						},V.pic.pics)
						Line = '<Img> ' + Line.join(' ')
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
							'```'
						].join('\n')
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
								// Link to same site video
								Line = BiliBiliVideo(V.link_card.card.biz_id)
								break
							default :
								Line = WC.OTJ(V)
						}
						break
					default :
						Line = WC.OTJ(V)
				}
				return Line.replace(/\n+$/,'')
			},Article.content.paragraphs).join('\n')
		else Article = O.Text(B.content)
		return {
			NonAV : true,
			ID : PrefixArticle + B.id,
			Img : Img,
			Title : B.title,
			UP : B.author.name,
			UPURL : BiliBiliSpace + B.author.mid,
			Date : 1E3 * B.publish_time,
			Desc : Article,
			More :
			[
				SolveCTime(B.ctime),
				B.summary
			]
		}
	},
	/*
	SolveDynamicSingle = function(Desc,Card,User)
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
				UP : User.name || User.uname,
				UPURL : BiliBiliSpace + User.uid,
				Date : 1E3 * Desc.timestamp,
				More : []
			}
		},
		R;
		Card = WC.JTO(Card)
		User = User ||
			WR.Path(['user_profile','info'],Desc) ||
			Card.user
		switch (Desc.type)
		{
			case 1 : // Forward
				MakePost()
				R.More.push(O.Ah(Desc.origin.dynamic_id_str,BiliBiliTimeline + Desc.origin.dynamic_id_str))
					TL784351038127734807
					Weird that the user field in this card points to an absurd target
					{"code":0,"msg":"","message":"","data":{"card":{"desc":{"uid":9099524,"type":2,"rid":235910203,"acl":1024,"view":57117,"repost":6351,"comment":528,"like":1323,"is_liked":0,"dynamic_id":784351038127734807,"timestamp":1681459357,"pre_dy_id":0,"orig_dy_id":0,"orig_type":0,"user_profile":{"info":{"uid":9099524,"uname":"李旎CarlyLee","face":"https://i2.hdslb.com/bfs/app/6ad0e27720eeabd1c85873e82af5027a7994f911.jpg","face_nft":0},"card":{"official_verify":{"type":0,"desc":"bilibili副董事长兼COO"}},"vip":{"vipType":2,"vipDueDate":1944489600000,"vipStatus":1,"themeType":0,"label":{"path":"","text":"十年大会员","label_theme":"ten_annual_vip","text_color":"#FFFFFF","bg_style":1,"bg_color":"#FB7299","border_color":""},"avatar_subscript":1,"nickname_color":"#FB7299","role":7,"avatar_subscript_url":""},"pendant":{"pid":0,"name":"","image":"","expire":0,"image_enhance":"","image_enhance_frame":""},"rank":"10000","sign":"destiny","level_info":{"current_level":6}},"uid_type":1,"stype":0,"r_type":0,"inner_id":0,"status":1,"dynamic_id_str":"784351038127734807","pre_dy_id_str":"0","orig_dy_id_str":"0","rid_str":"235910203"},"card":"{\"item\":{\"at_control\":\"[{\\\"location\\\":30,\\\"length\\\":4,\\\"data\\\":\\\"4\\\",\\\"type\\\":2}]\",\"category\":\"daily\",\"description\":\"送10个年度大会员，我们在B站一起看《流浪地球2》 [OK]互动抽奖\",\"id\":235910203,\"is_fav\":0,\"pictures\":[{\"img_height\":1920,\"img_size\":2821.0732421875,\"img_src\":\"https:\\/\\/i0.hdslb.com\\/bfs\\/new_dyn\\/7e24022e0e1ffe67ba8496ad99e386df3493270688631292.png\",\"img_tags\":null,\"img_width\":1080}],\"pictures_count\":1,\"reply\":528,\"role\":[],\"settings\":{\"copy_forbidden\":\"0\"},\"source\":[],\"title\":\"\",\"upload_time\":1681459357},\"user\":{\"head_url\":\"https:\\/\\/i0.hdslb.com\\/bfs\\/face\\/member\\/noface.jpg\",\"name\":\"bili_31310634183\",\"uid\":3493270688631292,\"vip\":{\"avatar_subscript\":0,\"due_date\":0,\"label\":{\"label_theme\":\"\",\"path\":\"\",\"text\":\"\"},\"nickname_color\":\"\",\"status\":0,\"theme_type\":0,\"type\":0,\"vip_pay_type\":0}}}","extension":{"lott":"{\"lottery_id\":146091}"},"extend_json":"{\"ctrl\":[{\"data\":\"4\",\"length\":4,\"location\":30,\"type\":2}],\"from\":{\"from\":\"create.dynamic.web\",\"verify\":{\"dc\":{},\"verify_first\":true}},\"like_icon\":{\"action\":\"\",\"action_url\":\"\",\"end\":\"\",\"end_url\":\"\",\"start\":\"\",\"start_url\":\"\"},\"lott\":{\"lottery_id\":146091}}","display":{"emoji_info":{"emoji_details":[{"emoji_name":"[OK]","id":1950,"package_id":1,"state":0,"type":1,"attr":0,"text":"[OK]","url":"https://i0.hdslb.com/bfs/emote/4683fd9ffc925fa6423110979d7dcac5eda297f4.png","meta":{"size":1},"mtime":1668688325}]},"relation":{"status":1,"is_follow":0,"is_followed":0}}},"result":0,"_gt_":0}}
				Card.origin ?
					R = [R,SolveDynamicSingle(Desc.origin,Card.origin,WR.Path(['origin_user','info'],Card))] :
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
					Date : Card.live_time || Card.start_time,
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
					Date : 1E3 * Card.live_start_time,
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
		var
		R = SolveDynamicSingle(V.desc,V.card),
		X,T;
		WW.IsArr(R) || (R = [R])
		WW.IsArr(R[0].More) || (R[0].More = R[0].More ? [R[0].More] : [])
		if (X = V.extension)
		{
			if (T = X.lbs)
			{
				T = WC.JTO(T)
				R[0].More.push(T.address + ' ' + T.title)
			}
		}
		WR.Each(function(B)
		{
			var Card,U;
			switch (B.add_on_card_show_type)
			{
				case 2 : // Game Card
					break
				case 3 : // Vote Card
					B = WC.JTO(B.vote_card)
					R[0].More.push(O.Ah('Vote ' + B.desc,BiliBiliTimelineVote(B.vote_id)))
					break
				case 5 :
					Card = B.ugc_attach_card
					U =
					{
						ID : Card.oid_str,
						Img : Card.image_url,
						Title : Card.title,
						Len : Card.duration
					}
					break
				case 6 :
					Card = B.reserve_attach_card
					U =
					{
						Non : true,
						ID : Card.oid_str,
						URL : false,
						Img : 1 === Card.reserve_button.status ?
							WR.Path(['reserve_button','uncheck','icon'],Card) :
							WR.Path(['reserve_button','check','share','icon'],Card),
						Title : Card.title,
						Date : 1E3 * Card.livePlanStartTime,
						More :
						[
							Card.desc_first.text,
							Card.desc_second
						]
					}
					break
				default :
					R[0].More.push('Unknown AddOn Type #' + B.add_on_card_show_type)
			}
			U && R.push(U)
		},WR.Path(['display','add_on_card_info'],V))
		if (WW.IsArr(R) && 1 < (R = WR.Flatten(R)).length)
			WR.Each(function(V){V.Group = R},R)
		return R
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
	*/
	SolvePolymerDynamic = function(B,R)
	{
		var
		IsTop = !R,
		ModAuthor = B.modules.module_author,
		ModDynamic = B.modules.module_dynamic,
		// ModInteraction = B.modules.module_interaction,
		// ModMore = B.modules.module_more,
		// ModStat = B.modules.module_stat,
		More = [],
		Card = {More : More},
		SetUnk = function(Q)
		{
			More.push('Unknown ' + Q)
		},
		SolveRichText = function(Q)
		{
			return WR.Map(function(V)
			{
				var
				Link,
				Ele;
				switch (V.type)
				{
					case 'RICH_TEXT_NODE_TYPE_AT' :
						Link = BiliBiliSpace + V.rid
						break
					case 'RICH_TEXT_NODE_TYPE_EMOJI' :
						Link = WR.Path(['emoji','icon_url'],V) || V.jump_url
						Ele = O.Img(Link,V.text)
						WV.CSS(Ele,
						{
							width : 22,
							height : 22
						})
						break
					case 'RICH_TEXT_NODE_TYPE_VIEW_PICTURE' :
						Link = V.pics[0].src
						Card.Img = Card.Img || []
						WR.Each(function(B)
						{
							Card.Img.push(B.src)
						},V.pics)
						break
					default :
						Link = V.jump_url
				}
				return Ele || (Link ? WV.Ah(V.text,Link) : V.orig_text)
			},Q)
		},
		SolveMajor = function()
		{
			var
			Major = ModDynamic.major;
			if (Major) switch (Major.type)
			{
				case 'MAJOR_TYPE_NONE' :
					/*
						148659959260614422
							Though the original user has been deleted, the post can still be accessed directly
							But not by the API anyway which responses `{code:500,message:'MISS_DRAW_DATA: id = 6327475',ttl:1}`
					*/
					T = Major.none
					More.push(T.tips)
					break

				case 'MAJOR_TYPE_ARCHIVE' :
					T = Major.archive
					Card.ID = T.aid
					Card.Img = T.cover
					Card.Title = T.title
					Card.Len = T.duration_text
					break
				case 'MAJOR_TYPE_ARTICLE' :
					T = Major.article
					Card.ID = PrefixArticle + T.id
					Card.Img = T.covers
					Card.Title = T.title
					More.push(T.desc)
					break
				case 'MAJOR_TYPE_COMMON' :
					T = Major.common
					Card.Img = T.cover
					More.push(O.Ah(WW.Quo(T.title) + T.desc,T.jump_url))
					break
				case 'MAJOR_TYPE_COURSES' :
					T = Major.courses
					Card.Img = T.cover
					More.push
					(
						O.Ah(T.title,T.jump_url),
						T.sub_title,
						T.desc
					)
					break
				case 'MAJOR_TYPE_DRAW' :
					T = Major.draw
					Card.Img = WR.Pluck('src',T.items)
					break
				case 'MAJOR_TYPE_LIVE' :
					T = Major.live
					Card.Title = T.title
					Card.Img = T.cover
					More.push(
						O.Ah(T.badge.text,T.jump_url),
						T.desc_first,
						T.desc_second)
					break
				case 'MAJOR_TYPE_LIVE_RCMD' :
					T = WC.JTO(Major.live_rcmd.content).live_play_info
					Card.Title = T.title
					Card.Img = T.cover
					More.push(O.Ah(T.area_id + ':' + T.area_name,BiliBiliLive + T.room_id))
					break
				case 'MAJOR_TYPE_OPUS' :
					T = Major.opus
					Card.Img = WR.Pluck('url',T.pics)
					Card.Title = T.summary.text
					break
				case 'MAJOR_TYPE_PGC' :
					T = Major.pgc
					Card.ID = PrefixBgmEpisode + T.epid
					Card.Img = T.cover
					Card.Title = T.title
					break
				case 'MAJOR_TYPE_UGC_SEASON' :
					T = Major.ugc_season
					Card.ID = T.aid
					Card.Img = T.cover
					Card.Title = T.title
					Card.Len = T.duration_text
					break
				default :
					SetUnk(Major.type)
			}
		},
		T;

		R = R || []
		R.push(Card)

		Card.ID = PrefixTimeline + B.id_str
		if (ModAuthor) switch (ModAuthor.type)
		{
			case 'AUTHOR_TYPE_NORMAL' :
				Card.UP = ModAuthor.name
				Card.UPURL = BiliBiliSpace + ModAuthor.mid
				Card.Date = 1E3 * ModAuthor.pub_ts
				ModAuthor.pub_action && More.push(ModAuthor.pub_action)
				break
			case 'AUTHOR_TYPE_PGC' :
				Card.UP = ModAuthor.name
				Card.UPURL = BiliBiliBgmSeason(ModAuthor.mid)
				Card.Date = ModAuthor.pub_time
				break
			case 'AUTHOR_TYPE_UGC_SEASON' :
				Card.UP = ModAuthor.name
				// MID is the video ID
				Card.Date = 1E3 * ModAuthor.pub_ts
				ModAuthor.pub_action && More.push(ModAuthor.pub_action)
				break
			default :
				SetUnk(ModAuthor.type)
		}
		switch (B.type)
		{
			case 'DYNAMIC_TYPE_NONE' :
				R.pop()
				break
			case 'DYNAMIC_TYPE_ARTICLE' :
			case 'DYNAMIC_TYPE_AV' :
			case 'DYNAMIC_TYPE_COMMON_SQUARE' :
				// 904252656351969304 Link to mall/suit
			case 'DYNAMIC_TYPE_COMMON_VERTICAL' :
				// 505308039164421683 Link to a bangumi
			case 'DYNAMIC_TYPE_COURSES_SEASON' :
			case 'DYNAMIC_TYPE_DRAW' :
			case 'DYNAMIC_TYPE_LIVE' :
			case 'DYNAMIC_TYPE_LIVE_RCMD' :
			case 'DYNAMIC_TYPE_PGC_UNION' :
			case 'DYNAMIC_TYPE_UGC_SEASON' :
			case 'DYNAMIC_TYPE_WORD' :
				SolveMajor()
				break
			case 'DYNAMIC_TYPE_FORWARD' :
				SolvePolymerDynamic(B.orig,R)
				break
			default :
				SetUnk(B.type)
		}
		if (T = ModDynamic && ModDynamic.desc)
		{
			if (Card.Title)
			{
				More.push(SolveRichText(T.rich_text_nodes))
			}
			else
			{
				Card.Title = T.text
				Card.TitleView = SolveRichText(T.rich_text_nodes)
			}
		}
		if (T = ModDynamic && ModDynamic.additional)
		{
			// We may handle this to display more content
		}

		if (IsTop && 1 < R.length)
			WR.Each(function(V){V.Group = R},R)
		return R
	},
	SolvePolymerDynamicResponse = function(B)
	{
		B = Common(B)
		return [B.has_more && B.offset,
		{
			Item : WR.Flatten(WR.Map(SolvePolymerDynamic,B.items))
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
		return O.API(WW.N.ReqOH(BiliBiliBgmEpisode(ID),'Cookie','stardustpgcv=0')).Map(function(B)
		{
			B = SolveInitState(B)
			B = WR.Find(function(V)
			{
				return /pgc\/view/.test(V.queryHash)
			},B.props.pageProps.dehydratedState.queries)
				.state.data
				.seasonInfo
				.mediaInfo
			return [
				WR.Find(WR.PropEq('ep_id',+ID),B.episodes).aid,
				B.season_id
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
		return O.API(BiliBiliAPIWebViewDetail(ID)).FMap(function(V)
		{
			V = WC.JTO(V)
			return -403 === V.code && O.Auth() ?
				O.Req(BiliBiliAPIWebViewDetail(ID)) :
				WX.Just(V)
		}).FMap(function(B,R,T)
		{
			var
			V;
			B = Common(B)
			V = B.View
			R = SolveAV(V,B)
			R = [R].concat(WR.MapU(function(B,F)
			{
				return {
					Index : B.page,
					ID : V.aid + '#' + B.cid,
					View : PrefixVideo + V.aid + '?p=' + B.page,
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
				R[0].More.push(O.Ah(PrefixBgmSeason + Q[1],BiliBiliBgmSeason(Q[1])))
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
						!!V.aid && PrefixVideo + V.aid + '#' + V.cid,
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
		Min :
		[
			'SESSDATA',
			'buvid3' // Required to read articles
		],
		Sign : function()
		{
			return O.Req(BiliBiliAPIWebNav).Map(function(B)
			{
				return Common(B).uname
			})
		},
		Map : [
		{
			Name : O.NameFind,
			Judge : /\bSearch\b.*?\bKeyword=([^#&?]+)/i,
			JudgeMap : function(V)
			{
				return WC.UD(V[1])
			},
			Example :
			[
				'メイドインアビス'
			],
			View : function(ID,Page,Pref)
			{
				var
				Head = {Cookie : 'DedeUserID=0'},
				Find = function(Type,Index,Solve)
				{
					return O.API({URL : BiliBiliAPISearch(Type,ID,Page,''),Head : Head}).Map(function(B)
					{
						B = Common(B)
						return [B.numPages,B.numResults,WR.MapU(function(V,F)
						{
							V = Solve ? Solve(V) :
							{
								Non : true,
								ID : V.pgc_season_id,
								View : PrefixBgmSeason + V.pgc_season_id,
								URL : BiliBiliBgmSeason,
								Img : V.cover,
								Title : (V.org_title && V.org_title !== V.title ? V.org_title + '\n' : '') +
									V.title,
								UP : PrefixBgmMedia + V.media_id,
								UPURL : BiliBiliBgmMedia(V.media_id),
								Date : 1E3 * V.pubtime
							}
							V.Index = Index + WR.PadL(B.result.length + ~-B.page * B.pagesize,F + ~-B.page * B.pagesize)
							return V
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
					Find(BiliBiliAPISearchTypeBgm,'Bgm#'),
					Find(BiliBiliAPISearchTypeFilm,'Film#'),
					Find(BiliBiliAPISearchTypeUser,'UP#',function(V)
					{
						return {
							Non : true,
							ID : V.mid,
							URL : BiliBiliSpace + V.mid,
							Img : V.upic,
							UP : V.uname,
							UPURL : BiliBiliSpace + V.mid,
							More : V.usign
						}
					}),
					Menu ? WX.Empty :
						O.API(BiliBiliSearch)
							.FMap(function(B)
							{
								return WW.B.ReqB(O.SolU(WW.MF(/"([^"]+\/index\.[^"]+\.js)/,B)))
							})
							.Tap(function(B)
							{
								var
								JTO = function(Q)
								{
									return WC.JTO(WR.RepL(
									[
										/\b\w+(?=:)/g,'"$&"',
										/\\x([\dA-F]{2})/ig,'\\u00$1'
									],Q))
								},
								Walk = function(Out,O,Prefix)
								{
									WR.Each(function(V)
									{
										V.name = Prefix + V.name
										Out.push(V)
										Walk(Out,V.children,Prefix + '\u3000\u3000')
									},O)
								},
								T;
								Menu = {}
								if (T = WW.MU(/\[{name[^,]+,order[^\]]+]/,B))
									Menu.order = JTO(T)
								if (T = WW.MU(/\[{name[^,]+,duration[^\]]+]/,B))
									Menu.duration = JTO(T)
								if (T = WW.MU(/\[{tids[^]+?](?=,\w)/,B))
									Walk(Menu.tids = [],JTO(T),'')
								return WX.Empty
							})
							.FinErr()
							.FP(WX.Empty)
				).Reduce(function(D,V)
				{
					return [WR.Max(D[0],V[0]),D[1] + V[1],WR.Cat(D[2],V[2])]
				}).Map(function(V)
				{
					return {
						Max : V[0],
						Len : V[1],
						Item : WR.Each(function(B)
						{
							if (B.Title)
							{
								B.TitleView = SolveHighLight(B.Title)
								B.Title = SolveHighLightRaw
							}
						},V[2].sort(function(Q,S)
						{
							return (0 | Q.Non) - (0 | S.Non) ||
								(Q.Non ? WR.CmpL(Q.Index,S.Index) : Q.Index - S.Index)
						})),
						Pref : Menu && function(I)
						{
							var
							R = WV.Pref({C : I});
							WR.EachU(function(V,F)
							{
								R.S([[O.Pascal(F),WV.Inp(
								{
									Inp : R.C(F),
									NoRel : O.NoRel
								}).Drop(WR.Map(function(V)
								{
									return [V[F],V.name]
								},V)).V(WR.Default('',V[0] && V[0][F]),true)]])
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
						},WR.Unnest(WR.Val(B.result)))
						// Desc : WR.MapU(WR.Join(' '),WR.Ent(B.cost.about)).join(', ')
					}
				})
			}
		},{
			Name :
			[
				'Opus',
				'Timeline',
				'DynamicPost'
			],
			Judge :
			[
				O.Num('T(?:\\.\\w+)+|Dynamic(?=\\W+\\d{10})|TL|Opus'),
				/*
					`Type=2` may be a lottery sub view
					Since we have not recorded the sample and we are upgrading to the polymer API
					Just ignore it
					/\bT(?:\.\w+)+\/(\d+).*?\b(Type=2)\b/i,
				*/
			],
			JudgeVal : O.ValNum,
			Example :
			[
				'2714420379649',
				{
					As : 'Inp',
					Val : BiliBiliTimeline + '406709711895875057',
					ID : '406709711895875057'
				}
			],
			/*
			View : function(ID)
			{
				ID = ID.split('#')
				return O.ReqAPI(1 < ID.length ?
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
			*/
			View : function(ID)
			{
				return O.ReqAPI(BiliBiliAPIPolymerDynamicDetail(ID)).Map(function(B)
				{
					B = Common(B)
					return {
						Item : SolvePolymerDynamic(B.item)
					}
				})
			}
		},{
			Name : 'UserDynamic',
			Judge : O.Num('Space(?=\\..*/Dynamic)'),
			JudgeVal : O.ValNum,
			Example :
			[
				'2',
				{
					As : 'Inp',
					Val : BiliBiliSpaceDynamic(2),
					ID : '2'
				}
			],
			/*
			// Even though the proper response does not seem to include any special items
			// The old API will fail on certain timeline returning an absurd result
			// {"code":0,"msg":"","message":"","data":{"has_more":1,"next_offset":0,"_gt_":0}}
			View : O.More(function(ID)
			{
				return O.API(BiliBiliVCAPIDynamicUser(ID,''))
			},function(I,Page,ID)
			{
				return O.API(BiliBiliVCAPIDynamicUser(ID,I[Page]))
			},SolveDynamicResponse)
			*/
			View : O.More(function(ID)
			{
				return O.ReqAPI(BiliBiliAPIPolymerDynamicSpace(ID,''))
			},function(I,Page,ID)
			{
				return O.ReqAPI(BiliBiliAPIPolymerDynamicSpace(ID,I[Page]))
			},SolvePolymerDynamicResponse)
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
			Judge : O.Num('AU'),
			JudgeVal : O.ValNum,
			Example :
			[
				'158984',
				{
					As : 'Sub',
					Val : 'au157230',
					ID : '157230'
				},
				{
					As : 'Inp',
					Val : BiliBiliAudioURL + 157230,
					ID : '157230'
				}
			],
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
			Judge : O.Num('AM'),
			JudgeVal : O.ValNum,
			Example :
			[
				'109568',
				{
					As : 'Sub',
					Val : 'am109568',
					ID : '109568'
				},
				{
					As : 'Inp',
					Val : BiliBiliAudioMenu + 109568,
					ID : '109568'
				}
			],
			View : function(ID,Page)
			{
				return O.API(BiliBiliAudioWebMenu(ID,-~Page))
					.Map(SolveAUList)
			}
		},{
			Name : 'UserAudio',
			Judge : O.Num('Space(?=\\..*/Audio)'),
			JudgeVal : O.ValNum,
			Example :
			[
				'391679',
				{
					As : 'Inp',
					Val : BiliBiliSpaceAudio(391679),
					ID : '391679'
				}
			],
			View : function(ID,Page)
			{
				return O.API(BiliBiliAudioWebUp(ID,-~Page))
					.Map(SolveAUList)
			}
		},{
			Name : ['Article','Read'],
			Judge : O.Num('CV(?:ID)?'),
			JudgeVal : O.ValNum,
			Example :
			[
				'2',
				{
					As : 'Sub',
					Val : 'cv11332',
					ID : '11332'
				},
				{
					As : 'Inp',
					Val : BiliBiliArticleRead + 3112593,
					ID : '3112593'
				}
			],
			/*
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
									B.list && O.Ah(B.list.name + ' ' + PrefixArticleList + B.list.id,BiliBiliArticleReadList + B.list.id)
								]
							}]
						}
					})
			}
			*/
			View : function(ID)
			{
				return O.ReqAPI(BiliBiliAPIArticleView(ID)).Map(function(B)
				{
					B = Common(B)
					return {
						Item : [SolveCV(B)]
					}
				})
			}
		},{
			Name : ['ArticleList','ReadList'],
			Judge : O.Num('RL'),
			JudgeVal : O.ValNum,
			Example :
			[
				'500',
				{
					As : 'Sub',
					Val : 'rl500',
					ID : '500'
				},
				{
					As : 'Inp',
					Val : BiliBiliArticleReadList + 500,
					ID : '500'
				}
			],
			View : O.Less(function(ID)
			{
				return O.API(BiliBiliAPIArticleList(ID))
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
			Judge : O.Num('Space(?=\\..*/Article)'),
			JudgeVal : O.ValNum,
			Example :
			[
				'144900660',
				{
					As : 'Inp',
					Val : BiliBiliSpaceArticle(144900660),
					ID : '144900660'
				}
			],
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
			Judge : /AV(\d+)\W+Stein/i,
			JudgeVal : O.ValNum,
			Example :
			[
				'610768697'
			],
			View : O.Less(WX.CacheL(function(ID)
			{
				return O.DB('CID',ID).FMap(function(CIDDB)
				{
					return AV(ID).FMap(function(R)
					{
						var CID = R[1].CID;
						R.pop()
						return O.API(WW.N.ReqOH(BiliBiliAPIPlayerSo(ID,CID),'Referer',BiliBili)).FMap(function(B)
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
			JudgeVal : O.ValNum,
			Example :
			[
				'9',
				{
					As : 'Sub',
					Val : 'av9',
					ID : '9'
				},
				{
					As : 'Inp',
					Val : 'av9',
					ID : '9'
				},
				{
					As : 'Inp',
					Val : BiliBiliVideo(314),
					ID : '314'
				}
			],
			View : O.Less(AVWithCID)
		},{
			Name : 'BV',
			Judge : /\bBV[\dA-Z]+\b/i,
			JudgeVal : /\bBV[\dA-Z]+\b/i,
			Example :
			[
				'BV1xx411c7mC'
			],
			View : O.Less(function(ID)
			{
				return O.API(BiliBiliAPIWebViewDetailBV(ID)).FMap(function(B)
				{
					return AVWithCID(Common(B).View.aid)
				})
			})
		},{
			Name : 'Fav',
			Judge : O.Num('Fav|FID|ML'),
			JudgeVal : O.ValNum,
			Example :
			[
				'61782948',
				{
					As : 'Inp',
					Val : BiliBiliSpaceFav(1348,61782948),
					ID : '61782948'
				}
			],
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
			Judge : O.NumR('FavList'),
			JudgeVal : O.ValNum,
			Example :
			[
				'1348',
				{
					As : 'Inp',
					Val : BiliBiliSpaceFavList(1348),
					ID : '1348'
				}
			],
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
			Judge : O.Num('Collection.*?SID='),
			JudgeVal : O.ValNum,
			Example :
			[
				'523',
				{
					As : 'Inp',
					Val : BiliBiliSpaceChannelSeason(1868902080,523),
					ID : '523'
				}
			],
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
			Judge : /\b(\d+)\b.*Series.*?SID=(\d+)/i,
			JudgeVal : /(\d+)\D+(\d+)/,
			Example :
			[
				'15773384 1211579',
				{
					As : 'Inp',
					Val : BiliBiliSpaceChannelSeries(15773384,1211579),
					ID : '15773384 1211579'
				}
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
			Judge : O.NumR('Channel'),
			JudgeVal : O.ValNum,
			Example :
			[
				'15773384',
				{
					As : 'Inp',
					Val : BiliBiliSpaceChannel(15773384),
					ID : '15773384'
				}
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
						},WR.Cat(B.seasons_list,B.series_list))
					}
				})
			}
		},{
			Name : 'PUGV',
			Judge : O.NumR('PUGV'),
			JudgeVal : O.ValNum,
			Example :
			[
				'517327498',
				{
					As : 'Inp',
					Val : BiliBiliSpacePUGV(517327498),
					ID : '517327498'
				}
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
			Judge : O.Num('Space'),
			JudgeVal : O.ValNum,
			Example :
			[
				'2',
				{
					As : 'Inp',
					Val : BiliBiliSpace + 2,
					ID : '2'
				}
			],
			View : function(ID,Page)
			{
				return (Page ? WX.Just([]) : ReqWBI(BiliBiliAPISpaceWBIInfo(ID)).FMap(function(UP)
				{
					return O.Req(WW.N.ReqOH(BiliBiliAPISpaceNavNum(ID),'Referer',BiliBili)).Map(function(Nav)
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
					return ReqWBI(BiliBiliAPISpaceWBIUpload(ID,-~Page)).Map(function(V)
					{
						return {
							Len : V.page.count,
							Item : WR.Cat(UP,WR.MapU(function(V,F)
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
			Name : O.NameUP,
			JudgeVal : false,
			Example :
			[
				''
			],
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
			Judge : /^$/,
			JudgeVal : false,
			Example :
			[
				'',
				{
					As : 'Sub',
					Val : ''
				}
			],
			/*
			View : O.More(function()
			{
				return O.Req(BiliBiliVCAPIDynamicNew)
			},function(I,Page)
			{
				return O.Req(BiliBiliVCAPIDynamicHistory(I[Page]))
			},SolveDynamicResponse)
			*/
			View : O.More(function()
			{
				return O.Req(BiliBiliAPIPolymerDynamicNew(''))
			},function(I,Page)
			{
				return O.Req(BiliBiliAPIPolymerDynamicNew(I[Page]))
			},SolvePolymerDynamicResponse)
		},{
			Name : PrefixCheeseSeason,
			Judge : O.Num('Cheese.*SS'),
			JudgeVal : O.ValNum,
			Example :
			[
				'150',
				{
					As : 'Inp',
					Val : BiliBiliCheeseSeason(150),
					ID : '150'
				}
			],
			View : function(ID)
			{
				return O.API(BiliBiliAPIPUGVViewSeason(ID)).Map(SolveCheeseSeason)
			}
		},{
			Name : PrefixCheeseEpisode,
			Judge : O.Num('Cheese.*EP'),
			JudgeVal : O.ValNum,
			Example :
			[
				'2234',
				{
					As : 'Inp',
					Val : BiliBiliCheeseEpisode(2234),
					ID : '2234'
				}
			],
			View : function(ID)
			{
				return O.API(BiliBiliAPIPUGVViewSeasonByEP(ID)).Map(SolveCheeseSeason)
			}
		},{
			Name : 'Episode',
			Judge : O.Num('EP'),
			JudgeVal : O.ValNum,
			Example :
			[
				'340931',
				{
					As : 'Inp',
					Val : BiliBiliBgmEpisode(340931),
					ID : '340931'
				}
			],
			View : O.Less(function(ID)
			{
				return EP2AV(ID).FMap(function(Q)
				{
					return AVWithCID(Q[0])
				})
			})
		},{
			Name : 'Season',
			Judge : O.Num('SS|BanGuMi\\b.*?\\bAnime'),
			JudgeVal : O.ValNum,
			Example :
			[
				'34543',
				{
					As : 'Inp',
					Val : BiliBiliBgmSeason(34543),
					ID : '34543'
				}
			],
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
							ID : PrefixBgmSeason + B.season_id,
							URL : BiliBiliBgmSeason(B.season_id),
							Img : B.cover,
							Title : B.title,
							UP : PrefixBgmMedia + B.media_id,
							UPURL : BiliBiliBgmMedia(B.media_id),
							Date : B.publish.pub_time,
							Desc : B.evaluate,
							More : B.time_length_show
						}].concat(WR.MapU(function(V,F)
						{
							return {
								Index : F,
								ID : SingleExpanded ? V.aid + '#' + V.cid : V.aid,
								URL : BiliBiliBgmEpisode(V.id),
								Img : V.cover,
								Title : WR.Trim(V.title + ' ' + V.long_title),
								UP : 'ep' + V.id,
								UPURL : BiliBiliBgmEpisode(V.id),
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
						return WR.Cat(R,WR.Unnest(WR.Map(function(V)
						{
							return WR.Map(function(B)
							{
								return {
									ID : B.aid,
									URL : BiliBiliBgmEpisode(B.id),
									Img : B.cover,
									Title : WR.Trim(V.title + ' | ' + B.title + ' ' + B.long_title),
									UP : PrefixBgmEpisode + B.id,
									UPURL : BiliBiliBgmEpisode(B.id),
								}
							},V.episodes)
						},B.section)))
					})
				})
			})
		},{
			Name : 'Media',
			Judge : O.Num('MD'),
			JudgeVal : O.ValNum,
			Example :
			[
				'28230043',
				{
					As : 'Inp',
					Val : BiliBiliBgmMedia(28230043),
					ID : '28230043'
				}
			],
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
									ID : PrefixBgmSeason + V.season_id,
									URL : BiliBiliBgmSeason(V.season_id),
									Img : V.cover,
									Title : J ? B.title : V.season_title,
									UP : PrefixBgmMedia + V.media_id,
									UPURL : BiliBiliBgmMedia(V.media_id),
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
			/^(?=\d)/,PrefixVideo
		]),
		IDURL : function(Q)
		{
			Q = /^([A-Z]*)(\d+)$/i.exec(Q) || ['','',Q]
			return PrefixTimeline === Q[1] ? BiliBiliTimeline + Q[2] :
				PrefixAudio === Q[1] ? BiliBiliAudioURL + Q[2] :
				PrefixArticleList === Q[1] ? BiliBiliArticleReadList + Q[2] :
				PrefixArticle === Q[1] ? BiliBiliArticleRead + Q[2] :
				PrefixBgmMedia === Q[1] ? BiliBiliBgmMedia(Q[2]) :
				PrefixBgmSeason === Q[1] ? BiliBiliBgmSeason(Q[2]) :
				PrefixBgmEpisode === Q[1] ? BiliBiliBgmEpisode(Q[2]) :
				PrefixCheeseSeason === Q[1] ? BiliBiliCheeseSeason(Q[2]) :
				PrefixCheeseEpisode === Q[1] ? BiliBiliCheeseEpisode(Q[2]) :
				BiliBiliVideo(Q[2].replace(/#\d+$/,''))
		}
	}
})