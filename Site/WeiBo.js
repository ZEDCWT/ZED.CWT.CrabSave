'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	WeiBo = 'https://weibo.com/',
	// WeiBoUser = WW.Tmpl(WeiBo,'u/',undefined),
	WeiBoUserNick = WW.Tmpl(WeiBo,'n/',undefined),
	// WeiBoUserAll = WW.Tmpl(WeiBo,undefined,'?is_all=1&page=',undefined),
	// WeiBoUserAllSub = WW.Tmpl(WeiBo,'p/aj/v6/mblog/mbloglist?script_uri=/',undefined,'&id=',undefined,'&pl_name=Pl_Official_MyProfileFeed__20&domain=100505&is_all=1&page=',undefined,'&pre_page=',undefined,'&pagebar=',undefined),
	// WeiBoHome = WW.Tmpl(WeiBo,'aj/mblog/fsearch?',undefined),
	// WeiBoFollow = WW.Tmpl(WeiBo,undefined,'/follow'),
	// WeiBoFollowAPI = WW.Tmpl(WeiBo,'p/',undefined,'/myfollow?ajaxpagelet=1&pids=Pl_Official_RelationMyfollow__88&Pl_Official_RelationMyfollow__88_page=',undefined),
	// WeiBoArticle = WW.Tmpl(WeiBo,'ttarticle/p/show?id=',undefined),
	WeiBoAJAX = WeiBo + 'ajax/',
	WeiBoAJAXStatus = WeiBoAJAX + 'statuses/',
	WeiBoAJAXStatusConfig = WeiBoAJAXStatus + 'config',
	WeiBoAJAXStatusShow = WW.Tmpl(WeiBoAJAXStatus,'show?id=',undefined),
	WeiBoAJAXStatusLong = WW.Tmpl(WeiBoAJAXStatus,'longtext?id=',undefined),
	WeiBoAJAXStatusMBlog = WW.Tmpl(WeiBoAJAXStatus,'mymblog?feature=0&uid=',undefined,'&page=',undefined),
	WeiBoAJAXFeed = WeiBoAJAX + 'feed/',
	WeiBoAJAXFeedAllGroup = WeiBoAJAXFeed + 'allGroups',
	WeiBoAJAXFeedFriendTimeline = WW.Tmpl(WeiBoAJAXFeed,'friendstimeline?list_id=',undefined,'&max_id=',undefined),
	WeiBoAJAXProfile = WeiBoAJAX + 'profile/',
	// uid screen_name
	WeiBoAJAXProfileInfoCustom = WW.Tmpl(WeiBoAJAXProfile,'info?custom=',undefined),
	WeiBoAJAXProfileInfoScreen = WW.Tmpl(WeiBoAJAXProfile,'info?screen_name=',undefined),
	WeiBoAJAXProfileFollow = WW.Tmpl(WeiBoAJAXProfile,'followContent?page=',undefined),
	WeiBoSearch = 'https://s.weibo.com/',
	WeiBoSearchSugg = WW.Tmpl(WeiBoSearch,'Ajax_Search/suggest?where=weibo&type=weibo&key=',undefined),
	WeiBoSearchQuery = WW.Tmpl(WeiBoSearch,'weibo?q=',undefined),
	WeiBoSearchQueryPage = WW.Tmpl(WeiBoSearch,'weibo?q=',undefined,'&page=',undefined),
	SinaLogin = 'https://login.sina.com.cn/',
	SinaLoginSSO = SinaLogin + 'sso/login.php',
	SinaLoginCross = SinaLogin + 'crossdomain2.php?action=login',
	// WeiBoMobile = 'https://m.weibo.cn/',
	// WeiBoMobileDetail = WW.Tmpl(WeiBoMobile,'detail/',undefined),
	WeiBoCard = 'https://card.weibo.com/',
	WeiBoCardArticleDetail = WW.Tmpl(WeiBoCard,'article/m/aj/detail?id=',undefined),
	NumberZip = WC.Rad(WW.D + WW.az + WW.AZ),
	Zip = function(Q)
	{
		return WR.MapU(function(V,F){return V = NumberZip.S(V),F ? WR.PadS0(4,V) : V},
			WR.SplitAll(7,WR.PadS0(7 * Math.ceil(Q.length / 7),Q))).join('')
	},
	/*
	UnZip = function(Q)
	{
		return WR.MapU(function(V,F){return V = NumberZip.P(V),F ? WR.PadS0(7,V) : V},
			WR.SplitAll(4,WR.PadS0(4 * Math.ceil(Q.length / 4),Q))).join('')
	},
	*/
	TryLogin = O.CokeC(function()
	{
		return O.Req(SinaLoginSSO,true).FMap(function(AT,T)
		{
			AT = AT.H['Set-Cookie']
			return AT && 1 < AT.length ?
			(
				T = WC.CokeP(O.Coke(),WR.Id),
				AT = WC.CokeP(AT.join('; '),WR.Id),
				T.ALC = AT.ALC,
				O.Req(
				{
					URL : SinaLoginCross,
					Head :
					{
						Referer : SinaLogin,
						Cookie : WC.CokeS(T,WR.Id) + '; tgc=' + AT.tgc,
					},
					Cookie : false
				}).FMap(function(B)
				{
					B = WC.JTOO(WW.MF(/List\(.*?(\[.*])/,B))
					return WW.IsArr(B) && B.length ?
						O.Req(
						{
							URL : B[0],
							Head :
							{
								Referer : SinaLogin,
							},
							Cookie : false
						},true) :
						WX.Just()
				}).Map(function(B)
				{
					B = B.H['Set-Cookie']
					if (B && 1 < B.length)
					{
						B = WC.CokeP(B.join('; '),WR.Id)
						T.SUB = B.SUB
						T.SUBP = B.SUBP
						O.CokeU(WC.CokeS(T,WR.Id))
					}
					else B = 0
					return !!B
				})
			) : WX.Just()
		})
	}),
	Req = function(Q)
	{
		return O.Req(Q).FMap(function(B)
		{
			return /'islogin'][ =]*'0'|login\.php/.test(B) && WC.CokeP(O.Coke()).ALC ?
				TryLogin().FMap(function(Y)
				{
					return Y ?
						O.Req(Q) :
						WX.Just(B)
				}) :
				WX.Just(B)
		})
	},
	Common = function(B)
	{
		B = WC.JTO(B)
		B.msg &&
			'success' !== B.msg &&
			'succ' !== B.msg &&
			O.Bad(B.code || B.error_type,B.msg)
		return B.data
	},
	PackImg = function(V){return WW.IsArr(V) ? WR.Map(PackImg,V) : V && {URL : V,Head : {Referer : WeiBo}}},
	// SolveID = function(B){return WW.MF(/href="\/(\d+\/\w+).*?date="/,B)},
	// SolvePageID = function(B){return WW.MF(/page_id']='(\d+)/,B)},
	SolvePost,
	/*
	SolveCard = function(B)
	{
		var
		Non = true,
		Title = O.Text(WW.MU(/<[^>]+WB_text[^]+?<\/div>/,B)
			.replace(/<a[^>]+ignore=.*?<\/a>/g,'')),
		SpecialAction,
		More = [],
		Img,T;
		SpecialAction = WW.MF(/<div[^>]+WB_cardtitle[^]+?class="subtitle">(?:<[^>]+>)*([^<]+)/,B) ||
			WW.MU(/(<span[^>]+sp_kz[^>]+>)([^]*?\1)*[^<>]*(?:)/,B)
		SpecialAction && More.push(WC.HED(SpecialAction.replace(/<[^>]+>/g,'')))
		T = B.split(/<div[^<>]+WB_feed_expand/)
		if (T[1])
		{
			B = SolveID(T[1])
			More.push(
				O.Ah(B,WeiBo + B),
				O.Ah('@' + WC.HED(WW.MF(/nick-name="([^"]+)/,T[1])),WeiBo + B.replace(/\/.*(?:)/,'')))
			B = T[0]
		}
		if (T = WW.MF(/WB_video.*action-data="([^"]+)/,B)) // Video
		{
			Non = false
			Img = WC.QSP(T).cover_img
		}
		else if (T = WW.MF(/WB_story_box.*\s+.*?src="([^"]+)/,B)) // Story
		{
			Non = false
			Img = T
		}
		else if (T = WW.MF(/WB_media_a.*?action-data="([^"]+)/,B))
		{
			Img = WC.QSP(T).clear_picSrc
			Img = Img && Img.split(',')
		}
		if (T = WW.MF(/widget_articleLayer[^<>]+action-data="([^"]+)/,B))
			More.push(O.Ah(WC.HED(WW.MF(/WB_feed_spec_tit[^>]+>([^<]+)/,B)),WC.QSP(T).url))
		return {
			NonAV : Non,
			AD : /blocktype=ad&/.test(B),
			SPA : SpecialAction,
			ID : SolveID(B),
			Img : PackImg(Img),
			Title : Title.slice(0,128),
			UP : ShowName(WC.HED(WW.MF(/face".*title="([^"]+)/,B)),
				WC.HED(WW.MF(/S_txt2[^<>]+usercard[^<>]+>\(([^<]+)\)/,B))),
			UPURL : WeiBo + WW.MF(/WB_info.*\s+.*?href=".*?(\w+)[^/"]*"/,B),
			Date : +WW.MF(/date="(\d+)/,B),
			Desc : Title,
			More : More
		}
	},
	SolveCardList = function(B)
	{
		return WR.Where(function(V){return !V.AD},
			WR.Map(SolveCard,B.match(/feed_list_item"[^]+?WB_feed_handle/g)))
	},
	*/
	SolveTextNormalize = function(Q)
	{
		return Q.replace(/\u200B+/g,'')
	},
	// app.js transText
	StatusConfigEmoticon,
	SolveStatusConfig = function(Origin)
	{
		return StatusConfigEmoticon ?
			WX.Just(Origin) :
			Req(WeiBoAJAXStatusConfig).Map(function(B)
			{
				B = Common(B)
				StatusConfigEmoticon = {}
				O.Walk(B.emoticon,function(V)
				{
					return WW.IsArr(V) && WR.Each(function(B)
					{
						StatusConfigEmoticon[B.phrase] = B.url
					},V)
				})
			}).FinErr().Map(WR.Const(Origin))
	},
	SolveTextWithStruct = function(Text,TopicStruct,URLStruct)
	{
		var
		Entity = {},
		EntityRX;
		WR.Each(function(V)
		{
			V = '#' + V.topic_title + '#'
			Entity[V] = function(){return WV.Ah(V,WeiBoSearchQuery(WC.UE(V)))}
		},TopicStruct)
		WR.Each(function(V)
		{
			Entity[V.short_url] = function(){return WV.Ah(V.url_title,V.long_url)}
		},URLStruct)
		EntityRX = WR.Map(WR.SafeRX,WR.Key(Entity))
		EntityRX.push
		(
			'@[-\\w·\u4E00-\u9FA5\uE7C7-\uE7F3]+',
			'\\[.*?\\](?!#)'
		)
		EntityRX = EntityRX.join('|')
		return WR.MapU(function(V,F)
		{
			F = 1 & F
			return F && WR.Has(V,Entity) ? Entity[V]() :
				F && WR.StartW('@',V) ? WV.Ah(V,WeiBoUserNick(WC.UE(V.slice(1)))) :
				F && WR.Has(V,StatusConfigEmoticon) ?
					WV.CSS(O.Img(StatusConfigEmoticon[V],V),
					{
						width : 18,
						height : 18
					}) :
				V
		},Text.split(RegExp(WW.QuoP(EntityRX,true),'g')))
	},
	SolveStatus = function(B,Long)
	{
		var
		NonAV = true,
		Img,
		Title,
		TitleView,
		Len,
		/*
		More = WR.Map(function(V)
		{
			return O.Ah(V.url_title && WC.HED(V.url_title) || '<No Title>',V.long_url)
		},B.url_struct),
		*/
		More = [],
		ProcessObject = function(Q)
		{
			var
			Card = Q.card_info;
			Img.push(Q.page_pic ||
				Card && Card.pic_url)
			switch (Q.object_type)
			{
				case 'adFeedVideo' :
				case 'live' :
				case 'movie' :
				case 'video' : // 5 11
					NonAV = false
					Len = WR.Path(['playback_list',0,'play_info','duration'],Q) ||
						WR.Path(['media_info','duration'],Q)
					break

				case 'campaign' : // 0
					More.push(
						Q.page_title,
						Q.page_desc,
						Q.tips)
					break

				case 'hudongvote' : // 23
					Q = Card.vote_object
					More.push(WW.Quo(Q.part_info) + Q.content,
						O.DTS(1E3 * Q.expire_date))
					WR.EachU(function(V,F)
					{
						More.push(WW.Quo(F) +
							V.part_num + ':' + (0 | 100 * V.part_ratio) + '% ' +
							V.content)
					},Q.vote_list)
					break
				case 'media_abstract' : // 0
					/*
						O3BiDj99X
							AI总结
							Used to be a video
					*/
					break
				case 'webpage' : // 0 23
					More.push(Q.page_desc)
					break
				case 'wenda' : // 24
					WR.Each(function(V)
					{
						/^content\d+$/.test(V) && More.push(Q[V])
					},WR.Key(Q).sort())
					break

				default :
					WR.Include(Q.object_type,
					[
						'adFeedEvent', // 5
						'app', // 0
						'appItem', // 2
						'article', // 2 5
						'audio', // 0
						'cardlist', // 0
						'event', // 5
						'file', // 2
						'group', // 0
						'shop', // 2
						'story', // 31
						'topic', // 0
						'user', // 2
						'wbox', // 0
						undefined
					]) || More.push('Unknown Type #' + Q.type + ':' + Q.object_type)
			}
		},
		T;

		Long = Long && WC.JTO(Long).data
		// N8tYvti03. With isLongText but not having long text data
		if (Long && Long.longTextContent)
		{
			Title = SolveTextNormalize(WC.HED(Long.longTextContent))
			TitleView = SolveTextWithStruct(Title,Long.topic_struct,Long.url_struct)
		}
		else
		{
			Title = SolveTextNormalize(B.text_raw)
			TitleView = SolveTextWithStruct(Title,B.topic_struct,B.url_struct)
		}

		if (T = B.title)
			More.push(T.text)
		if (T = B.region_name)
			More.push(T)
		if (T = B.source)
			More.push(O.Text(T))
		if (T = B.content_auth_list)
		{
			// O1bRhFWYk
			WR.Each(function(V)
			{
				(V = V.content_auth_info) &&
					More.push(V.content_auth_title)
			},T)
		}
		if (T = B.screen_name_suffix_new)
		{
			More.push(WR.Map(function(V)
			{
				var R = ShowName(V.content,V.remark);
				// Note that we want the <a> to be inline
				return (V = V.scheme) ? WV.Ah(R,V) : R
			},T.slice(1)))
		}
		if (T = B.retweeted_status)
		{
			More.push
			(
				O.Ah(O.DTS(T.created_at) + (T.user ? ' @' + T.user.screen_name : ''),
					WeiBo + (T.user ? T.user.idstr : '_') + '/' + T.mblogid),
				T.text_raw
			)
		}
		if (T = B.mix_media_info)
		{
			// N43H3D2s7
			Img = []
			WR.Each(function(V)
			{
				switch (V.type)
				{
					case 'pic' :
						Img.push(V.data.bmiddle.url)
						break
					default :
						WW.IsStr(WR.Path(['data','object_type'],V)) ?
							ProcessObject(V.data) :
							More.push('Unknown MixMedia Type #' + V.type)
				}
			},T.items)
		}
		else if (B.pic_num)
			Img = WR.Map(function(V)
			{
				return B.pic_infos[V].bmiddle.url
			},B.pic_ids)
		else if (T = B.page_info)
		{
			Img = []
			ProcessObject(T)
		}
		return {
			NonAV : B.retweeted_status || NonAV,
			ID : B.user.idstr + '/' + B.mblogid,
			Img : PackImg(Img),
			Title : Title,
			TitleView : TitleView,
			UP : ShowName(B.user.screen_name,B.user.remark),
			UPURL : WeiBo + B.user.profile_url.replace(/^\//,''),
			Date : B.created_at,
			Len : Len,
			More : More
		}
	},
	/*
	SolveSelfUID = O.CokeC(function()
	{
		return Req(WeiBo).Map(function(B)
		{
			return WW.MF(/'uid']='(\d+)/,B)
		})
	}),
	*/
	SolveUIDByCustom = WX.CacheM(function(Q)
	{
		return Req(WeiBoAJAXProfileInfoCustom(Q)).Map(function(B)
		{
			return Common(B).user.idstr
		})
	}),
	SolveUIDByScreen = WX.CacheM(function(Q)
	{
		return Req(WeiBoAJAXProfileInfoScreen(Q)).Map(function(B)
		{
			return Common(B).user.idstr
		})
	}),
	SolveFeedGroup = O.CokeC(function()
	{
		return Req(WeiBoAJAXFeedAllGroup).Map(function(B)
		{
			B = WC.JTO(B).groups[0].group
			B = WR.Find(WR.PropEq('title','最新微博'),B) || B[1]
			return B.gid
		})
	}),
	/*
	SolveFollowPageID = WX.CacheL(function(UID)
	{
		return Req(WeiBoFollow(UID)).Map(SolvePageID)
	}),
	*/
	ShowName = function(Real,Alias)
	{
		return Alias ?
			Alias + WW.QuoP(Real) :
			Real
	};
	return {
		ID : 'WeiBo',
		Name : '\u65B0\u6D6A\u5FAE\u535A',
		Alias : 'WB',
		Judge : /\bWeiBo\b/i,
		Min : 'ALC SUB SUBP',
		Sign : function()
		{
			return O.Req(WeiBo).Map(function(B)
			{
				return WW.MF(/'nick']=.(.*).;/,B)
			})
		},
		Map : [
		{
			Name : O.NameFind,
			Judge : /\bS\.WeiBo\b.*?\bQ=([^#&?]+)/i,
			JudgeMap : function(V)
			{
				return WC.UD(V[1])
			},
			View : function(ID,Page)
			{
				return Req(WeiBoSearchQueryPage(WC.UE(ID),-~Page)).Map(function(B)
				{
					return {
						Max : WW.MR(function(D,V)
						{
							return WR.Max(D,+V[1])
						},1,/href="[^"]+&page=(\d+)/g,B),
						Size : 10,
						Item : WR.Cat
						(
							WW.MR(function(D,V)
							{
								var ID;
								D.push(
								{
									Non : true,
									ID : ID = WW.MF(/<a[^>]+href="[^"]+\.com\/([^"]+)[^>]+class="name/,V),
									URL : WeiBo + ID,
									Img : PackImg(WW.MF(/src="([^"]+)/,V)),
									UP : WC.HED(WW.MF(/class="name[^>]+>([^<]+)/,V)),
									UPURL : WeiBo + ID,
									More : O.Text(WW.MU(/<span[^]+?<\/span>/))
								})
								return D
							},[],/class="card card-user[^]+?class="btn/g,B),
							WW.MR(function(D,V)
							{
								var
								Non = true,
								Title = O.Text(WW.MU(/<[^>]+feed_list_content_full".*\s+.*/,V) ||
									WW.MU(/<[^>]+feed_list_content".*\s+.*/,V)),
								More,
								Img,T;
								T = V.split(/(feed_list_forwardContent">[^]+)(?="from">)/)
								if (T[1])
								{
									V = T[0] + T[2]
									T = T[1]
									More = WC.HED(WW.MF(/nick-name="([^"]+)/,T))
									T = WW.MF(/from".*\s+.*href="[^"]+\/(\d+\/\w+)/,More)
									More =
									[
										O.Ah(T,WeiBo + T),
										O.Ah('@' + More,WeiBo + T.replace(/\/.*/,''))
									]
								}
								if (T = WW.MF(/WB_video.*action-data="([^"]+)/,V)) // Video
								{
									Non = false
									Img = WC.QSP(T).cover_img
								}
								else if (T = WW.MF(/media-piclist"[^]+?src="([^"]+)/,V))
								{
									Img = T
								}
								D.push(
								{
									NonAV : Non,
									ID : T = WW.MF(/from".*\s+.*href="[^"]+\/(\d+\/\w+)/,V),
									Img : PackImg(Img),
									Title : Title.slice(0,128),
									UP : WC.HED(WW.MF(/nick-name="([^"]+)/,V)),
									UPURL : WeiBo + T.replace(/\/.*/,''),
									Date : WW.MF(/from".*\s+.*\s+(\S+)/,V),
									Desc : Title,
									More : More
								})
								return D
							},[],/feed_list_item"[^]+?"feed_list_repeat"/g,B)
						)
					}
				})
			},
			Hint : function(Q)
			{
				return Req(
				{
					URL : WeiBoSearchSugg(WC.UE(Q)),
					Head :
					{
						'X-Requested-With' : 'XMLHttpRequest',
						Referer : WeiBo
					}
				}).Map(function(B)
				{
					return {
						Item : WR.Map(function(V)
						{
							return [
								V.word,
								V.word + ' (' + V.count + ')'
							]
						},Common(B))
					}
				})
			}
		},{
			Name : 'Post',
			Judge :
			[
				/^\d{14,}/,
				/^[\dA-Z]{8,}$/i,
				/Weibo_ID=(\d+)/i,
				/(?:^|\/|Post\s+)\d+[/_](\w+)/i,
				/Post\s+(\w+)\b/i,
				/\bDetail\/(\d+)\b/i,
				O.Word('Status')
			],
			View : SolvePost = function(ID)
			{
				return Req(WeiBoAJAXStatusShow(ID)).FMap(function(B)
				{
					B = WC.JTO(B)
					B.error_code && O.Bad(B.error_code,B.message)
					return (B.isLongText ? Req(WeiBoAJAXStatusLong(ID)) : WX.Just())
						.FMap(SolveStatusConfig)
						.Map(function(Long)
						{
							return {
								Item : [SolveStatus(B,Long)]
							}
						})
				})
			}
		},{
			Name : 'Article',
			Judge : O.Num('(?:TT)?Article'),
			JudgeVal : O.ValNum,
			View : function(ID)
			{
				return O.Req(
				{
					URL : WeiBoCardArticleDetail(ID),
					Head : {Referer : WeiBo}
				}).Map(function(B)
				{
					B = Common(B)
					return {
						Item : [
						{
							ID : B.uid + '/' + Zip('' + B.mid),
							Img : PackImg(B.cover_img.image.url),
							Title : B.title,
							UP : B.userinfo.screen_name,
							UPURL : B.userinfo.url,
							Date : B.create_at,
							Desc : O.Text(B.content),
							More :
							[
								O.Ah(B.writer.screen_name,WeiBo + B.writer.uid)
							]
						}]
					}
				})
			}
		},{
			Name : 'TVShow',
			Judge : O.Num('(?:TV|Video(?:\\.WeiBo\\.com)?)\\W*Show(?:.*?\\b\\d{3,5}:(?=\\d{6}))?'),
			JudgeVal : O.ValNum,
			View : function(ID)
			{
				return O.Req(
				{
					URL : 'https://weibo.com/tv/api/component',
					Form :
					{
						data : WC.OTJ(
						{
							Component_Play_Playinfo :
							{
								oid : ID
							}
						})
					},
					Head : {Referer : WeiBo}
				}).FMap(function(B)
				{
					return SolvePost(Common(B).Component_Play_Playinfo.mid)
				})
			}
		},{
			Name : 'User',
			Judge : [/\.com\/(?!n\/)(?:u\/(?=\d))?([%\w]+)/,O.Word('User')],
			/*
			// Terminated endpoint, 'old' UI only
			View : function(ID,Page)
			{
				var PageID;
				return WX.Range(0,3).FMapE(function(N)
				{
					return N ?
						WX.Just().FMap(function(){return Req(WeiBoUserAllSub(ID,PageID,-~Page,-~Page,~-N))})
							.Map(Common) :
						Req(WeiBoUserAll(ID,-~Page))
							.Map(function(B)
							{
								PageID = SolvePageID(B)
								return [B,WC.JTO(WW.MU(/{"ns":"pl.content.home.*MyProfileFeed.*}/,B)).html]
							})
				}).Reduce(function(D,V)
				{
					D[1] += V
					return D
				}).Map(function(B)
				{
					var
					Len,
					Max = +WW.MF(/"page".*countPage=(\d+)/,B[1]);
					if (!Max)
					{
						// Seems that the old good pager has been replaced with infinity scroll
						// And the endpoint still works
						// Thus we have to figure out the max page ourself
						Len = WC.JTO(WW.MU(/{"ns":"".*TriColumn.*css.*}/,B[0])).html
						Len = +WR.Match(/[^<>]+(?=<\/strong)/g,Len).pop()
						Max = WR.Ceil(Len / 45)
					}
					return {
						Len : Len,
						Max : 1 + Max || 0,
						Size : 45,
						Item : WR.Where(function(V){return !V.SPA},SolveCardList(B[1]))
					}
				})
			}
			*/
			View : function(ID,Page)
			{
				return (/\D/.test(ID) ? SolveUIDByCustom(ID) : WX.Just(ID)).FMap(function(ID)
				{
					return Req(WeiBoAJAXStatusMBlog(ID,-~Page))
				}).FMap(SolveStatusConfig).Map(function(B)
				{
					B = Common(B)
					return {
						Size : 20,
						Len : B.total,
						Item : WR.Map(SolveStatus,B.list)
					}
				})
			}
		},{
			Name : 'Nick',
			Judge : [/\.com\/n\/([%\w]+)/,O.Word('Nick')],
			View : function(ID,Page)
			{
				return (/\D/.test(ID) ? SolveUIDByScreen(ID) : WX.Just(ID)).FMap(function(ID)
				{
					return Req(WeiBoAJAXStatusMBlog(ID,-~Page))
				}).FMap(SolveStatusConfig).Map(function(B)
				{
					B = Common(B)
					return {
						Size : 20,
						Len : B.total,
						Item : WR.Map(SolveStatus,B.list)
					}
				})
			}
		},{
			Name : 'Home',
			Judge : /^$/,
			JudgeVal : false,
			/*
			// Terminated endpoint, 'old' UI only
			View : O.More(function()
			{
				return Req(WeiBo).Map(function(B)
				{
					return WC.JTO(WW.MU(/{"ns":"pl.content.homefeed.*}/,B)).html
				})
			},function(I,Page)
			{
				return Req(WeiBoHome(I[Page])).Map(Common)
			},function(B)
			{
				return [WW.MF(/lazyload" action-data="([^"]+)/,B),
				{
					Item : SolveCardList(B)
				}]
			})
			*/
			View : O.More(function(_,I)
			{
				return SolveFeedGroup().FMap(SolveStatusConfig).FMap(function(ID)
				{
					return Req(WeiBoAJAXFeedFriendTimeline(I[0] = ID,''))
				})
			},function(I,Page)
			{
				return Req(WeiBoAJAXFeedFriendTimeline(I[0],I[Page]))
			},function(B)
			{
				B = WC.JTO(B)
				return [B.max_id_str,
				{
					Size : 25,
					Len : B.total_number,
					Item : WR.Map(SolveStatus,B.statuses)
				}]
			})
		},{
			Name : O.NameUP,
			JudgeVal : false,
			/*
			// Terminated endpoint, 'old' UI only
			View : function(_,Page)
			{
				return SolveSelfUID()
					.FMap(SolveFollowPageID)
					.FMap(function(PageID)
					{
						return Req(WeiBoFollowAPI(PageID,-~Page))
					})
					.Map(function(B)
					{
						B = WC.JTO(WW.MU(/{.*}/,B)).html
						return {
							Max : WW.MR(function(D,V)
							{
								return WR.Max(D,+V[1])
							},1,/"page"[^>]+>(\d+)</g,B),
							Item : WW.MR(function(D,V,C,I)
							{
								I = WW.MF(/_name"[^>]+href="(?:\/u)?\/(\w+)/,V)
								// Why dont they escape profile_image_url
								C = WC.QSP(WW.MF(/action-data="([^"]+)/,V).replace(/\?/g,''))
								D.push(
								{
									Non : true,
									ID : /\D/.test(I) ? I + WW.QuoP(C.uid) : I,
									URL : WeiBo + I,
									Img : PackImg(WW.MF(/src="([^"]+)/,V)),
									UP : ShowName(C.screen_name,C.remark),
									UPURL : WeiBo + I,
									More :
									[
										O.Text(WW.MF(/"text[^>]+>([^<]+)/,V)),
										O.Text(WW.MF(/info_from[^>]+>([^]+?)<\/div/,V))
									]
								})
								return D
							},[],/member_li[^]+?<\/li/g,B)
						}
					})
			}
			*/
			View : function(_,Page)
			{
				return Req(WeiBoAJAXProfileFollow(-~Page)).Map(function(B)
				{
					B = Common(B).follows
					return {
						Size : 50,
						Len : B.total_number,
						Item : WR.Map(function(V)
						{
							return {
								Non : true,
								ID : V.idstr,
								URL : WeiBo + V.idstr,
								Img : PackImg(V.profile_image_url),
								UP : ShowName(V.screen_name,V.remark),
								UPURL : WeiBo + V.idstr,
								Date : V.created_at,
								More :
								[
									V.content1,
									V.content2
								]
							}
						},B.users)
					}
				})
			}
		}],
		IDURL : WR.Add(WeiBo)
	}
})