'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	HicceArs = 'https://www.hiccears.com/',
	HicceArsAccountUser = HicceArs + 'account/user',
	HicceArsContent = WW.Tmpl(HicceArs,'contents/',undefined),
	HicceArsUser = HicceArs + 'p/',
	HicceArsUserSub = WW.Tmpl(HicceArsUser,undefined,'/',undefined),
	HicceArsUserSubPage = WW.Tmpl(HicceArsUser,undefined,'/',undefined,'/',undefined),
	HicceArsUserFollowing = WW.Tmpl(HicceArsUser,undefined,'/following/',undefined),

	RegExpGUID = '\\b' + WR.Map(function(V)
	{
		return '[\\dA-F]{' + V + '}'
	},[8,4,4,4,12]).join('-') + '\\b',

	SolveContentIDRegExp = RegExp('/Contents?/(' + RegExpGUID + ')','i'),
	SolveContentID = function(B){return WW.MF(SolveContentIDRegExp,B)},
	SolveContentStickerShow =
	{
		'fas fa-cubes' : 'Cube',
		'far fa-images' : 'Image',
		'hac-orange' : 'Bithril'
	},
	SolveContentSticker = function(B)
	{
		return WR.MapW(function(V)
		{
			var T = WW.MF(/class="([^"]+)/,V);
			return WR.StartW('</',V) ? null :
				(T ? SolveContentStickerShow[T] : WR.Trim(V)) || null
		},WW.MF(/"text-sticker[^>]+>([^]+?)<\/p/,B).split(/(<[^>]+>)/))
			.join(' ')
	},
	SolveContentImgDate = function(Img){return WW.MF(/\/(\d{4,}(?:-\d\d){2})\//,Img).replace(/-/g,'.')},
	SolveContentCard = function(B)
	{
		var Img = O.SolU(WW.MF(/src="([^"]+)/,B),HicceArs);
		return {
			ID : SolveContentID(B),
			Img : Img,
			Title : WC.HED(WW.MF(/preview-title">([^<]+)/,B)),
			UP : WC.HED(WW.MF(/preview-text">(?:\s*by\s+)?([^<]+)/,B)),
			Date : SolveContentImgDate(Img),
			More :
			[
				SolveContentSticker(B)
			]
		}
	},
	SolveContentList = function(B)
	{
		return WR.Cat
		(
			WW.MR(function(D,V)
			{
				D.push(SolveContentCard(V))
				return D
			},[],/"album-preview"[^]+?<\/a/g,B),
			WW.MR(function(D,V)
			{
				D.push(
				{
					ID : SolveContentID(V),
					Img : O.SolU(WW.MF(/src="([^"]+)/,V),HicceArs),
					Title : WC.HED(WW.MF(/preview-title"[^>]+>([^<]+)/,V)),
					UP : WC.HED(WW.MF(/meta-line-link"[^>]+>(?:\s*by\s+)?([^<]+)/,V)),
					More : WC.HED(WW.MF(/post-preview-text">([^<]+)/,V))
				})
				return D
			},[],/"post-preview"[^]+?"meta-line">[^]+?<\/a/g,B)
		)
	},
	SolveSectionWithHeadKey = '"section-header">',
	SolveSectionWithHead = function(Q,S)
	{
		WW.IsStr(Q) && (Q = RegExp(WR.SafeRX(Q),'i'))
		return SolveContentList(WR.Find(function(V)
		{
			return Q.test(WW.MF(/section-title">([^<]+)/,V))
		},S.split(SolveSectionWithHeadKey)))
	},
	SolveSelfURL = O.CokeC(function()
	{
		return O.Req(HicceArsAccountUser).Map(function(B)
		{
			return WW.MF(/profiles\/([^/]+)\/management">/,B)
		})
	}),
	SolveContent = function(B)
	{
		var
		NeedPurchase,
		ID,Img,Title,UP,UPURL,At,
		Desc,
		More = [],
		Sub = [],SubMap = {},
		Sibling = [],
		C,T;
		B = B.split(SolveSectionWithHeadKey)
		if (1 === B.length)
		{
			B = B[0].split('post-open">')[1]
			B || WW.Throw('Unable to resolve the content')
			ID = WW.MF(/contents?\/([^/]+)\/favourites/,B)
			Img = O.SolU(WW.MF(/src="([^"]+)/,B),HicceArs)
			Title = WC.HED(WW.MF(/open-title">([^<]+)/,B))
			Desc = O.Text(WW.MF(/open-paragraph">([^]+?)<\/p><div/,B))
			UP = WW.MF(/open-title">[^]+?href="\/p\/([^/"]+)/,B)
			UPURL = HicceArsUser + UP
			At = SolveContentImgDate(Img)
			More.push(O.Text(WW.MF(/open-paragraph" id[^>]+>([^]+?)<\/p><div/,B)))
		}
		else
		{
			B = B[1]
			Title = WR.Trim(WC.HED(WW.MF(/section-title">([^<]+)/,B)))
			if (T = B.match(/<a[^>]+"album-preview"[^]+?<\/a/g))
				WR.Each(function(V)
				{
					Sub.push(SolveContentCard(V))
					SubMap[WR.Last(Sub).ID] = WR.Last(Sub)
				},T)
			if (T = WW.MU(/slider-panel">[^]+?slider-panel-roster">/,B))
			{
				NeedPurchase = true
				Img = WW.MR(function(D,V){return D.push(O.SolU(V[1],HicceArs)),D},[],/src="([^"]+)/g,T)
			}
			else
			{
				Img = WW.MR(function(D,V)
				{
					D.push(O.SolU(WW.MF(/src="([^"]+)/,V),HicceArs))
					return D
				},[],/<a[^>]+"photo-preview[^]+?<\/a/g,B)
			}
			if (T = WW.MU(/sidebar-box">[^]+?id="leaveCommentModal"/,B))
			{
				ID = WW.MF(/contents?\/([^/]+)\/favourites/,T)
				if (C = WW.MF(/price-title[^<>]+>\s*(\d+)/,T))
					More.push(C + ' Bithril')
				if (C = /content-author"[^<>]+href="\/p\/([^"]+)[^>]+>([^<]+)</.exec(T))
				{
					UP = WR.Trim(WC.HED(C[2]))
					UPURL = HicceArsUser + C[1]
					WR.Each(function(V){UP === V.UP && (V.UPURL = UPURL)},Sub)
				}
				WW.MR(function(T,V)
				{
					var Content;
					T = WR.Match(/[^<>]+(?=<)/g,V)
					if (2 === T.length)
					{
						if (/Created/.test(T[0]))
							At = new Date(T[1])
						else if (/Picture/.test(T[0]))
							More.push(T[1])
						else if (Content = At && SolveContentID(V))
						{
							T[0] = WR.Pascal(WR.Trim(T[0]))
							T[1] = WR.Trim(WC.HED(T[1]))
							if (!Sub.length)
								Sibling.push(['{' + T[0] + '} ' + T[1],HicceArsContent(Content)])
							else if (Content = SubMap[Content])
								Content.More.push(T[0])
						}
					}
				},null,/information-line">[^]+?<\/div/g,T)
				WR.EachU(function(V,F)
				{
					More.push(O.Ah(F ? WW.Quo(WW.ShowLI(~-Sibling.length,~-F)) + V[0] : V[0],V[1]))
				},Sibling)
			}
			WW.MR(function(T,V)
			{
				T = WW.MF(/box-title">([^<]+)/,V)
				V = O.Text(V.split('box-content">').pop())
				switch (T)
				{
					case 'Description' :
						More.push(V)
						break
					case 'Preview' :
						Desc = V
						break
				}
			},null,/widget-box">[^]+?(?=<\/div)/g,B)
		}
		return WR.Pre(
		{
			Non : NeedPurchase,
			ID : ID,
			Img : Img,
			Title : Title,
			UP : UP,
			UPURL : UPURL,
			Date : At,
			Desc : Desc,
			More : More
		},Sub)
	},

	MakeUP = function(Index,Key,User)
	{
		var
		Tag =
		[
			'Illust',
			'Novel',
			'DigitalPack',
			'Blog'
		],
		URL =
		[
			'illustrations',
			'novels',
			'digital-packs',
			'blog-posts'
		];

		return {
			Name : Tag[Index],
			Judge :
			[
				RegExp
				(
					'\\bP\\W+([^/ ]+)\\W*(?=' +
					(User ? '|' : '') +
					(Key ? Key + '|' : '') +
					URL[Index] + '|' + Tag[Index] +
					')',
					'i'
				),
				O.Word
				(
					(User ? 'User|' : '') +
					(Key ? Key + '|' : '') +
					URL[Index] + '|' + Tag[Index]
				)
			],
			View : function(ID,Page)
			{
				return O.Req(HicceArsUserSubPage(ID,URL[Index],-~Page)).Map(function(B)
				{
					var Count;
					B = B.split('profile-header">').pop()
					Count = WW.MR(function(D,V){return D.push(+V[1]),D},[],
						/user-stat-title">(\d+)/g,B)
					return {
						Size : 24,
						Len : Count[Index],
						Item : WR.Pre
						(
							{
								Non : true,
								ID : ID,
								URL : HicceArsUser + ID,
								Img : O.SolU(WW.MF(/user-avatar-content"><[^>]+src="([^"]+)/,B),HicceArs),
								UP : WC.HED(WW.MF(/description-title">(?:<[^>]+>)*([^<]+)/,B)),
								UPURL : HicceArsUser + ID,
								More : WR.MapU(function(V,F)
								{
									return O.Ah(V + ' ' + Count[F],HicceArsUserSub(ID,URL[F]))
								},Tag)
							},
							WR.Each(function(V)
							{
								V.UPURL = HicceArsUser + ID
							},SolveContentList(B))
						)
					}
				})
			}
		}
	};

	return {
		ID : 'HicceArs',
		Alias : 'HA',
		Judge : /\bHicceArs\b/i,
		Min : 'REMEMBERME',
		Sign : function()
		{
			return O.Req(HicceArsAccountUser).Map(function(B)
			{
				return WR.Trim(WC.HED(WW.MF(/management">([^<]+)/,B)))
			})
		},
		Map :
		[
			MakeUP(1),
			MakeUP(2,'Digi(?:tal(?:-?Pack)?)?'),
			MakeUP(3),
			MakeUP(0,null,true),
			{
				Name : 'Content',
				Judge : O.Word('Contents?|Post|File'),
				View : function(ID)
				{
					return O.Req(HicceArsContent(ID)).Map(function(B)
					{
						return {
							Item : SolveContent(B)
						}
					})
				}
			},
			{
				Name : 'Following',
				Judge : O.UP,
				View : function(_,Page)
				{
					return SolveSelfURL()
						.FMap(function(B){return O.Req(HicceArsUserFollowing(B,-~Page))})
						.Map(function(B)
						{
							B = B.split(SolveSectionWithHeadKey)[1]
							return {
								Size : 24,
								Len : WW.MF(/highlighted">(\d+)/,B),
								Item : WW.MR(function(D,V)
								{
									var
									ID = WW.MF(/="\/p\/([^"]+)/,V);
									D.push(
									{
										Non : true,
										ID : ID,
										URL : HicceArsUser + ID,
										Img : O.SolU(WW.MF(/avatar-content">[^]*?src="([^"]+)/,V),HicceArs),
										UP : WR.Trim(WC.HED(WW.MF(/description-title">(?:<.*?>)*([^<]+)/,V))),
										UPURL : HicceArsUser + ID,
										More : WR.Trim(WC.HED(WW.MF(/description-text">(?:<.*?>)*([^<]+)/,V)))
									})
									return D
								},[],/="user-preview[^]+?user-preview-actions">/g,B)
							}
						})
				}
			},
			{
				Name : 'Home',
				Judge : O.TL,
				View : function()
				{
					return O.Req(HicceArs).Map(function(B)
					{
						return {
							Item : WR.Reduce(WR.Cat,[],
							[
								SolveSectionWithHead('Recent Content',B)
								// SolveSectionWithHead('Recent Illust',B),
								// SolveSectionWithHead('Recent Novel',B),
								// SolveSectionWithHead('Recent Digital',B),
								// SolveSectionWithHead('Recent Blog',B)
							])
						}
					})
				}
			}
		],
		IDURL : HicceArsContent
	}
})