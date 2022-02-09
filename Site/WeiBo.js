'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	WeiBo = 'https://weibo.com/',
	WeiBoUserAll = WW.Tmpl(WeiBo,undefined,'?is_all=1&page=',undefined),
	WeiBoUserAllSub = WW.Tmpl(WeiBo,'p/aj/v6/mblog/mbloglist?script_uri=/',undefined,'&id=',undefined,'&pl_name=Pl_Official_MyProfileFeed__20&domain=100505&is_all=1&page=',undefined,'&pre_page=',undefined,'&pagebar=',undefined),
	WeiBoHome = WW.Tmpl(WeiBo,'aj/mblog/fsearch?',undefined),
	WeiBoFollow = WW.Tmpl(WeiBo,undefined,'/follow'),
	WeiBoFollowAPI = WW.Tmpl(WeiBo,'p/',undefined,'/myfollow?ajaxpagelet=1&pids=Pl_Official_RelationMyfollow__88&Pl_Official_RelationMyfollow__88_page=',undefined),
	WeiBoAJAX = WeiBo + 'ajax/',
	WeiBoAJAXStatusShow = WW.Tmpl(WeiBoAJAX,'statuses/show?id=',undefined),
	WeiBoAJAXStatusLong = WW.Tmpl(WeiBoAJAX,'statuses/longtext?id=',undefined),
	WeiBoSearch = 'https://s.weibo.com/',
	WeiBoSearchSugg = WW.Tmpl(WeiBoSearch,'Ajax_Search/suggest?where=weibo&type=weibo&key=',undefined),
	WeiBoSearchQuery = WW.Tmpl(WeiBoSearch,'weibo?xsort=hot&q=',undefined,'&page=',undefined),
	SinaLogin = 'https://login.sina.com.cn/',
	SinaLoginSSO = SinaLogin + 'sso/login.php',
	SinaLoginCross = SinaLogin + 'crossdomain2.php?action=login',
	// WeiBoMobile = 'https://m.weibo.cn/',
	// WeiBoMobileDetail = WW.Tmpl(WeiBoMobile,'detail/',undefined),
	/*
	NumberZip = WC.Rad(WW.D + WW.az + WW.AZ),
	Zip = function(Q)
	{
		return WR.MapU(function(V,F){return V = NumberZip.S(V),F ? WR.PadS0(4,V) : V},
			WR.SplitAll(7,WR.PadS0(7 * Math.ceil(Q.length / 7),Q))).join('')
	},
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
			AT = AT[2] && AT[2]['set-cookie']
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
					B = B && B[2] && B[2]['set-cookie']
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
		B.msg && O.Bad(B.code,B.msg)
		return B.data
	},
	SolveID = function(B){return WW.MF(/href="\/(\d+\/\w+).*?date="/,B)},
	SolvePageID = function(B){return WW.MF(/page_id']='(\d+)/,B)},
	SolveCard = function(B)
	{
		var
		Non = true,
		Title = O.Text(WW.MU(/<[^>]+WB_text[^]+?<\/div>/,B)
			.replace(/<a[^>]+ignore=.*?<\/a>/g,'')),
		SpecialAction,
		More,
		Img,T;
		T = B.split('"WB_feed_expand">')
		if (T[1])
		{
			B = T[0]
			T = T[1]
			More = WC.HED(WW.MF(/nick-name="([^"]+)/,T))
			T = SolveID(T)
			More =
			[
				O.Ah(T,WeiBo + T),
				O.Ah('@' + More,WeiBo + T.replace(/\/.*/,''))
			]
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
		More = More && !WW.IsArr(More) ? [More] : More
		More = More || []
		SpecialAction = WW.MF(/<div[^>]+WB_cardtitle[^]+?class="subtitle">(?:<[^>]+>)*([^<]+)/,B) ||
			WW.MU(/(<span[^>]+sp_kz[^>]+>)([^]*?\1)*[^<>]*/,B)
		SpecialAction && More.unshift(WC.HED(SpecialAction.replace(/<[^>]+>/g,'')))
		return {
			NonAV : Non,
			AD : /blocktype=ad&/.test(B),
			SPA : SpecialAction,
			ID : SolveID(B),
			Img : Img,
			Title : Title.slice(0,128),
			UP : WC.HED(WW.MF(/face".*title="([^"]+)/,B)),
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
	SolveSelfUID = O.CokeC(function()
	{
		return Req(WeiBo).Map(function(B)
		{
			return WW.MF(/'uid']='(\d+)/,B)
		})
	}),
	SolveFollowPageID = WX.CacheL(function(UID)
	{
		return Req(WeiBoFollow(UID)).Map(SolvePageID)
	});
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
			Name : 'Search',
			Judge : O.Find,
			View : function(ID,Page)
			{
				return Req(WeiBoSearchQuery(WC.UE(ID),-~Page)).Map(function(B)
				{
					return {
						Max : WW.MR(function(D,V)
						{
							return WR.Max(D,+V[1])
						},1,/href="[^"]+&page=(\d+)/g,B),
						Size : 20,
						Item : WW.MR(function(D,V)
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
								Img : Img,
								Title : Title.slice(0,128),
								UP : WC.HED(WW.MF(/nick-name="([^"]+)/,V)),
								UPURL : WeiBo + T.replace(/\/.*/,''),
								Date : WW.MF(/from".*\s+.*\s+(\S+)/,V),
								Desc : Title,
								More : More
							})
							return D
						},[],/feed_list_item"[^]+?"feed_list_repeat"/g,B)
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
				/Weibo_ID=(\d+)/i,
				/(?:^|\/|Post\s+)\d+[/_](\w+)/i,
				/Post\s+(\w+)\b/i,
				/\bDetail\/(\d+)\b/i,
				O.Num('Status')
			],
			View : function(ID)
			{
				return Req(WeiBoAJAXStatusShow(ID)).FMap(function(B)
				{
					B = WC.JTO(B)
					return (B.isLongText ? Req(WeiBoAJAXStatusLong(ID)) : WX.Just()).Map(function(Long)
					{
						var
						NonAV = true,
						Img,
						Len,
						More = WR.Map(function(V)
						{
							return O.Ah(V.url_title || '<No Title>',V.long_url)
						},B.url_struct),
						Card,
						T;
						Long = Long && WC.JTO(Long).data
						if (T = B.retweeted_status)
						{
							More.push
							(
								O.Ah(O.DTS(new Date(T.created_at)) + (T.user ? ' @' + T.user.screen_name : ''),
									WeiBo + (T.user ? T.user.idstr : '_') + '/' + T.mblogid),
								T.text_raw
							)
						}
						if (B.pic_num)
						{
							Img = WR.Map(function(V)
							{
								return B.pic_infos[V].bmiddle.url
							},B.pic_ids)
						}
						else if (T = B.page_info)
						{
							Card = T.card_info
							Img = T.page_pic ||
								Card && Card.pic_url
							switch (T.object_type)
							{
								case undefined :
									break
								// 0 23
								case 'webpage' :
									More.push(T.page_desc)
									break
								// 2
								case 'appItem' :
									break
								// 2
								case 'file' :
									break
								// 2
								case 'user' :
									break
								// 2 5
								case 'article' :
									break
								// 5 11
								case 'video' :
								case 'live' :
									NonAV = false
									Len = WR.Path(['playback_list',0,'play_info','duration'],T) ||
										T.media_info.duration
									break
								// 23
								case 'hudongvote' :
									T = Card.vote_object
									More.push('[' + T.part_info + '] ' + T.content,
										O.DTS(1E3 * T.expire_date))
									WR.EachU(function(V,F)
									{
										More.push('[' + F + '] ' +
											V.part_num + ':' + (0 | 100 * V.part_ratio) + '% ' +
											V.content)
									},T.vote_list)
									break
								// 24
								case 'wenda' :
									WR.Key(T).sort()
										.forEach(V => /^content\d+$/.test(V) && More.push(T[V]))
									break
								// 31
								case 'story' :
									break
								default :
									More.push('Unknown Type #' + T.type + ':' + T.object_type)
							}
						}
						return {
							Item : [
							{
								NonAV : B.retweeted_status || NonAV,
								ID : B.user.idstr + '/' + B.mblogid,
								Img : Img,
								Title : B.text_raw,
								UP : B.user.screen_name,
								UPURL : WeiBo + B.user.profile_url.replace(/^\//,''),
								Date : new Date(B.created_at),
								Len : Len,
								Desc : Long && Long.longTextContent,
								More : More
							}]
						}
					})
				})
			}
		},{
			Name : 'User',
			Judge : [/\.com\/(?:u\/(?=\d))?(\w+)/,O.Word('User')],
			View : function(ID,Page)
			{
				var PageID;
				return WX.Range(0,3).FMapO(1,function(N)
				{
					return N ?
						WX.Just().FMap(function(){return Req(WeiBoUserAllSub(ID,PageID,-~Page,-~Page,~-N))})
							.Map(Common) :
						Req(WeiBoUserAll(ID,-~Page))
							.Map(function(B)
							{
								PageID = SolvePageID(B)
								return WC.JTO(WW.MU(/{"ns":"pl.content.home.*MyProfileFeed.*}/,B)).html
							})
				}).Reduce(WR.Add,'').Map(function(B)
				{
					return {
						Max : +WW.MF(/"page".*countPage=(\d+)/,B),
						Size : 45,
						Item : WR.Where(function(V){return !V.SPA},SolveCardList(B))
					}
				})
			}
		},{
			Name : 'Home',
			Judge : O.TL,
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
		},{
			Name : 'Following',
			Judge : O.UP,
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
							Item : WW.MR(function(D,V,I)
							{
								D.push(
								{
									Non : true,
									ID : I = WW.MF(/\/u\/(\d+)/,V) || WW.MF(/name"[^>]+href="\/(\w+)/,V),
									URL : WeiBo + I,
									Img : WW.MF(/src="([^"]+)/,V),
									UP : WC.HED(WW.MF(/title="([^"]+)/,V)),
									UPURL : WeiBo + I,
									More : WR.Trim(WR.Trim(WW.MF(/"text[^>]+>([^<]+)/,V)) + '\n' +
										O.Text(WW.MF(/info_from[^>]+>([^]+?)<\/div/,V)))
								})
								return D
							},[],/member_li[^]+?<\/li/g,B)
						}
					})
			}
		}],
		IDURL : WR.Add(WeiBo)
	}
})