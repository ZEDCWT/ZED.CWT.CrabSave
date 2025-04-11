'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	PrefixVideo = 'sm',
	PrefixArticle = 'ar',
	PrefixToURL = WW.MakeO
	(
		PrefixVideo,'video', // Could also be `live` that having different default view
		PrefixArticle,'articles/news'
	),

	NicoChannel = 'https://nicochannel.jp/',
	NicoChannelArticle = WW.Tmpl(NicoChannel,undefined,'/articles/news'),
	// NicoChannelAPI = 'https://nfc-api.nicochannel.jp/',
	NicoChannelAPI = 'https://api.nicochannel.jp/',
	NicoChannelAPIFC = NicoChannelAPI + 'fc/',
	// NicoChannelAPIFCContentProviderChannel = NicoChannelAPIFC + 'content_providers/channels',
	NicoChannelAPIFCContentProviderChannelDomain = NicoChannelAPIFC + 'content_providers/channel_domain',
	NicoChannelAPIFCVideo = WW.Tmpl(NicoChannelAPIFC,'video_pages/',undefined),
	NicoChannelAPIFCFanClubSite = NicoChannelAPIFC + 'fanclub_sites/',
	NicoChannelAPIFCFanClubSiteBaseInfo = WW.Tmpl(NicoChannelAPIFCFanClubSite,undefined,'/page_base_info'),
	NicoChannelAPIFCFanClubSiteUserInfo = WW.Tmpl(NicoChannelAPIFCFanClubSite,undefined,'/user_info'),
	NicoChannelAPIFCFanClubSiteVideo = WW.Tmpl(NicoChannelAPIFCFanClubSite,undefined,'/video_pages?vod_type=0&sort=-display_date&per_page=',O.Size,'&page=',undefined),
	NicoChannelAPIFCFanClubSiteArticleList = WW.Tmpl(NicoChannelAPIFCFanClubSite,undefined,'/article_themes/news/articles?sort=published_at_desc&per_page=',O.Size,'&page=',undefined),
	NicoChannelAPIFCFanClubSiteArticleRead = WW.Tmpl(NicoChannelAPIFCFanClubSite,undefined,'/article_themes/news/articles/',undefined),

	MakePatternSiteList = function(Suffix)
	{
		return RegExp('\\bNicoChannel\\b[^/]+/([^&?#\\s/]+)' + Suffix,'i')
	},
	MakePatternSiteContent = function(Prefix,Path)
	{
		return RegExp('([^&?#\\s/]+)(?:/(?:' + Path + '))*[/_](' + Prefix + '\\w+)\\b','i')
	},

	SolveCookieLast = '',SolveCookieCache = {},
	SolveCookieToken = function(Site)
	{
		if (SolveCookieLast !== O.Coke())
		{
			SolveCookieLast = O.Coke()
			SolveCookieCache = WR.Where(WR.Path(['userInformation','accessToken']),
				WC.JTOO(WC.JTOO(SolveCookieLast).totalUserInformation))
		}
		return Site ? WR.Path([Site,'userInformation','accessToken'],SolveCookieCache) : SolveCookieCache
	},

	Req = function(Site,URL,Data)
	{
		var Auth = SolveCookieToken(Site);
		return SolveSiteID(Site).FMap(function(ID)
		{
			return O.ReqAPI(
			{
				URL : URL,
				JSON : Data,
				Head :
				{
					Authorization : Auth && 'Bearer ' + Auth,
					FC_Site_ID : ID,
					FC_Use_Device : 'null'
				},
				Cookie : false
			})
		})
	},
	Common = function(B)
	{
		B = WC.JTO(B)
		B.error && O.Bad(B.error.message)
		return B.data
	},

	/*
	It is designed to load the full entry mapping for just getting the ID, seriously...
	A.find(O =>
	{
		var R,U;
		return ((R = O.domain) == null ? void 0 : R.toLowerCase()) === `${window.location.origin}/${(U = window.location.pathname.split("/")[1]) == null ? void 0 : U.toLowerCase()}`;
	})
	*/
	SiteToID = {},
	/*
	SiteByID = {},
	SolveSiteAll = function()
	{
		return O.API(NicoChannelAPIFCContentProviderChannel).Map(function(B)
		{
			WR.Each(function(V)
			{
				if (WR.StartW(NicoChannel,V.domain))
					SiteToID[SiteByID[V.id] = V.domain.slice(NicoChannel.length)] = V.id
			},Common(B).content_providers)
			return B.id
		})
	},
	SolveSiteID = function(Site)
	{
		return WR.Has(Site,SiteToID) ? WX.Just(SiteToID[Site]) : SolveSiteAll().Map(function()
		{
			return WR.Has(Site,SiteToID) ? SiteToID[Site] : WW.Throw('No Such Site #' + Site)
		})
	},
	*/
	SolveSiteID = function(Site)
	{
		return WR.Has(Site,SiteToID) ?
			WX.Just(SiteToID[Site]) :
			O.API({URL : NicoChannelAPIFCContentProviderChannelDomain,QS : {current_site_domain : NicoChannel + Site}}).Map(function(B)
			{
				B = Common(B).content_providers
				B || WW.Throw('No Such Site #' + Site)
				return SiteToID[Site] = B.id
			})
	},
	SolveSiteMeta = WX.CacheL(function(Site)
	{
		return SolveSiteID(Site).FMap(function(ID)
		{
			return Req(Site,NicoChannelAPIFCFanClubSiteBaseInfo(ID))
		}).Map(function(B)
		{
			return Common(B).fanclub_site
		})
	}),
	SolveVideo = function(Site,V)
	{
		return {
			ID : Site + '/' + V.content_code,
			Img : V.thumbnail_url,
			Title : V.title,
			Date : V.released_at,
			Len : WR.Path(['active_video_filename','length'],V),
			Desc : V.description,
			More :
			[
				V.display_date && 'Display ' + WW.StrDate(V.display_date,WW.DateColS),
				V.video_delivery_target.display_name || 1 === V.video_delivery_target.id && '会員限定',
				!!V.video_free_periods.length && '一部無料'
			]
		}
	},
	PadSiteInfo = function(Site,Item,Init,Ext)
	{
		return SolveSiteMeta(Site).Map(function(B)
		{
			if (Init) Item.unshift(
			{
				Non : true,
				ID : Site,
				URL : NicoChannel + Site,
				Img :
				[
					B.favicon_url,
					B.thumbnail_image_url
				],
				Desc : B.description,
				More : WR.Flatten(
				[
					O.Ah('NEWS',NicoChannelArticle(Site)),
					WR.MapW(function(V){return V.menu_item_link_url && O.Ah(V.menu_item_header,V.menu_item_link_url)},
						B.current_fanclub_design.fanclub_menus),
					WR.Map(function(V){return O.Ah(V.fanclub_sns.display_name,V.sns_page_url)},
						B.current_fanclub_design.fanclub_footer_snses),
					B.content_provider.copyright
				])
			})
			WR.Each(function(V)
			{
				V.UP = B.fanclub_site_name
				V.UPURL = NicoChannel + Site
			},Item)
			return WW.Merge(
			{
				Item : Item
			},Ext)
		})
	};
	return {
		ID : 'NicoChannel',
		Name : '\u30CB\u30B3\u30CB\u30B3\u30C1\u30E3\u30F3\u30CD\u30EB',
		Alias : 'NC',
		Judge : /\bNicoChannel\b/i,
		SignHint : "copy(localStorage.getItem('persist:auth'))",
		Sign : function()
		{
			var T = WR.Key(SolveCookieToken());
			return T.length ?
				SolveSiteID(T[0]).FMap(function(ID)
				{
					return Req(T[0],NicoChannelAPIFCFanClubSiteUserInfo(ID),{})
				}).Map(function(B)
				{
					return WR.Path(['fanclub_site','fanclub_member','nickname'],Common(B))
				}) :
				WX.Throw('No Auth Info')
		},
		Map : [
		{
			Name : 'Video',
			Judge : MakePatternSiteContent(PrefixVideo,'Video|Live'),
			JudgeVal : /([^&?#\\s/]+)[_/](sm\w+)/,
			Join : '/',
			View : function(ID)
			{
				ID = ID.split('/')
				return Req(ID[0],NicoChannelAPIFCVideo(ID[1])).FMap(function(B)
				{
					B = Common(B)
					return PadSiteInfo(ID[0],[SolveVideo(ID[0],B.video_page)])
				})
			}
		},{
			Name : 'Article',
			Judge : MakePatternSiteContent(PrefixArticle + '(?!ticle)','Articles?|News'),
			JudgeVal : /([^&?#\\s/]+)[_/](ar\w+)/,
			Join : '/',
			View : function(ID)
			{
				ID = ID.split('/')
				return SolveSiteID(ID[0]).FMap(function(I)
				{
					return Req(ID[0],NicoChannelAPIFCFanClubSiteArticleRead(I,ID[1]))
				}).FMap(function(B)
				{
					B = Common(B).article
					return PadSiteInfo(ID[0],WR.MapW(function(V)
					{
						return V &&
						{
							ID : ID[0] + '/' + (V.article_code || ID[1]),
							Img : V.thumbnail_url,
							Title : V.article_title,
							Date : V.publish_at,
							Desc : O.Text(V.contents)
						}
					},[
						B.article,
						B.prev_article,
						B.next_article
					]))
				})
			}
		},{
			Name : 'SiteNews',
			Judge :
			[
				MakePatternSiteList('/(?:Article|News)'),
				O.Word('SiteNews')
			],
			JudgeVal : /[-.\w]+/,
			View : function(Site,Page)
			{
				return SolveSiteID(Site).FMap(function(ID)
				{
					return Req(Site,NicoChannelAPIFCFanClubSiteArticleList(ID,-~Page))
				}).FMap(function(B)
				{
					B = Common(B).article_theme.articles
					return PadSiteInfo(Site,WR.Map(function(V)
					{
						return {
							ID : Site + '/' + V.article_code,
							Img : V.thumbnail_url,
							Title : V.article_title,
							Date : V.publish_at,
							Desc : O.Text(V.contents)
						}
					},B.list),!Page,
					{
						Len : B.total
					})
				})
			}
		},{
			Name : 'Site',
			Judge :
			[
				MakePatternSiteList(''),
				O.Word('Site')
			],
			JudgeVal : /[-.\w]+/,
			View : function(Site,Page)
			{
				return SolveSiteID(Site).FMap(function(ID)
				{
					return Req(Site,NicoChannelAPIFCFanClubSiteVideo(ID,-~Page))
				}).FMap(function(B)
				{
					B = Common(B).video_pages
					return PadSiteInfo(Site,WR.Map(function(V){return SolveVideo(Site,V)},B.list),!Page,
					{
						Len : B.total
					})
				})
			}
		}],
		IDURL : function(Q)
		{
			Q = Q.split('/')
			return NicoChannel +
			[
				Q[0],
				PrefixToURL[(Q[1] || '').slice(0,2)],
				Q[1]
			].join('/')
		},
		IDView : function(Q)
		{
			return Q.replace(/^[^/]+\//,'')
		}
	}
})