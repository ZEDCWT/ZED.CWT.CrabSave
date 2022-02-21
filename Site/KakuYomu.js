'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	JoinID = '+',

	KakuYomu = 'https://kakuyomu.jp/',
	KakuYomuMyProfile = KakuYomu + 'settings/profile',
	KakuYomuWork = WW.Tmpl(KakuYomu,'works/',undefined),
	KakuYomuEpisode = WW.Tmpl(KakuYomu,'works/',undefined,'/episodes/',undefined),
	KakuYomuUser = WW.Tmpl(KakuYomu,'users/',undefined),
	KakuYomuUserFollowingWork = WW.Tmpl(KakuYomu,'users/',undefined,'/following_works?page=',undefined),
	KakuYomuUserFollowingUser = WW.Tmpl(KakuYomu,'users/',undefined,'/following_users?page=',undefined),
	KakuYomuAPIAPP = KakuYomu + 'api/app/',
	KakuYomuAPIAPPWork = WW.Tmpl(KakuYomuAPIAPP,'works/',undefined),
	KakuYomuAPIAPPEpisode = WW.Tmpl(KakuYomuAPIAPP,'works/',undefined,'/episodes/',undefined,'.html'),
	KakuYomuAPIAPPUserInfo = WW.Tmpl(KakuYomuAPIAPP,'users/names/',undefined),
	KakuYomuAPIAPPUserWork = WW.Tmpl(KakuYomuAPIAPP,'users/',undefined,'/works?page=',undefined),

	API = function(Q)
	{
		return (O.Coke() ? O.Req : O.API)(Q)
	},
	MakeID = function(Work,Episode)
	{
		return Work + JoinID + WW.Nat(Episode).Sub(Work).DEC()
	},
	SolveID = function(ID)
	{
		ID = ID.split(/(\D)/)
		return [ID[0],JoinID === ID[1] ? WW.Nat(ID[0]).Add(ID[2]).DEC() : ID[2]]
	},
	MakeEdited = function(V)
	{
		return 'MTime ' + O.DTS(1E3 * V.edited_at)
	},
	SolveWork = function(B,Author)
	{
		Author = Author || B.author
		return {
			Non : true,
			ID : B.id,
			URL : KakuYomuWork,
			Img : B.cover_image_url,
			Title : B.title,
			UP : Author && Author.activity_name,
			UPURL : Author && KakuYomuUser(Author.screen_name.replace(/^@/,'')),
			Date : 1E3 * B.published_at,
			More :
			[
				B.catchphrase,
				'Char ' + B.total_character_count,
				MakeEdited(B),
				B.introduction
			]
		}
	},
	SolveSelfName = function()
	{
		return O.Req(KakuYomuMyProfile).Map(function(B)
		{
			return WC.HED(WW.MF(/<a[^>]+href="[^>"]+user[^>]+>@([^<]+)/,B))
		})
	},
	SolveSelfNameCache = O.CokeC(SolveSelfName),
	SolveUserInfo = WX.CacheM(function(Q)
	{
		return API(KakuYomuAPIAPPUserInfo(Q)).Map(WC.JTO)
	}),
	SolveUserTabCount = function(B)
	{
		return WW.MR(function(D,V)
		{
			D[V[1]] = +WW.MF(/="TabItem_tabItemCount[^>]+>(\d+)/,V)
			return D
		},{},/<li><a[^>]+users\/[^/]+\/([^"]+)"[^]+?<\/li/g,B)
	};

	return {
		ID : 'KakuYomu',
		Name : '\u30AB\u30AF\u30E8\u30E0',
		Alias : 'KY',
		Judge : /\bKakuYomu\b/i,
		Min : 'dlsc',
		Sign : SolveSelfName,
		Map : [
		{
			Name : 'Episode',
			Judge :
			[
				/^\d+\+\d+$/,
				/Work\D+(\d+)\D+Episode\D+(\d+)/i
			],
			Join : ' ',
			View : function(ID)
			{
				ID = SolveID(ID)
				return API(KakuYomuAPIAPPEpisode(ID[0],ID[1])).Map(function(B)
				{
					return {
						Item : [
						{
							ID : MakeID(ID[0],ID[1]),
							Title : WC.HED(WW.MF(/widget-episodeTitle">([^<]+)/,B)),
							UP : WC.HED(WW.MF(/header-author">([^<]+)/,B)),
							Desc : WW.MR(function(D,V)
							{
								D.push(O.Text(V[1]))
								return D
							},[],/id="p\d+"[^>]*>([^]+?)<\/p>/g,B).join('\n'),
							More : O.Ah(WC.HED(WW.MF(/header-workTitle">([^<]+)/,B)) || 'Work' + ID[0],
								KakuYomuWork(ID[0]))
						}]
					}
				})
			}
		},{
			Name : 'Work',
			Judge : O.Num('Works?'),
			View : O.Less(function(ID)
			{
				return API(KakuYomuAPIAPPWork(ID)).Map(function(B)
				{
					B = WC.JTO(B)
					return WR.Concat([SolveWork(B)],WR.Rev(WR.Map(function(V)
					{
						return {
							ID : MakeID(B.id,V.id),
							Title : V.title,
							Date : 1E3 * V.published_at,
							More :
							[
								'Char ' + V.character_count,
								MakeEdited(V)
							]
						}
					},B.episodes)))
				})
			})
		},{
			Name : 'User',
			Judge :
			[
				/@([^/]+)/i,
				O.Word('Users?')
			],
			View : O.More(function(ID,I)
			{
				return SolveUserInfo(ID).FMap(function(B)
				{
					I[0] = B
					return API(KakuYomuAPIAPPUserWork(B.id,''))
				})
			},function(I,Page)
			{
				return API(KakuYomuAPIAPPUserWork(I[0].id,I[Page]))
			},function(B,I)
			{
				B = WC.JTO(B)
				return [B.has_next && B.next_page_token,
				{
					Item : WR.Map(function(V)
					{
						return SolveWork(V,I[0])
					},B.works)
				}]
			})
		},{
			Name : 'FollowingWork',
			Judge : WR.Concat(O.TL,
			[
				/\bFollowingWork\b/i
			]),
			View : function(_,Page)
			{
				return SolveSelfNameCache().FMap(function(B)
				{
					return API(KakuYomuUserFollowingWork(B,-~Page))
				}).Map(function(B)
				{
					return {
						Size : 50,
						Len : SolveUserTabCount(B).following_works,
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								Non : true,
								ID : WW.MF(/works\/(\d+)/,V),
								URL : KakuYomuWork,
								Title : WC.HED(WW.MF(/<a[^>]+works\/[^>]+>([^<]+)/,V)),
								UP : WC.HED(WW.MF(/class="ActivityName_[^>]+>([^<]+)/,V)),
								UPURL : KakuYomuUser(WW.MF(/users\/([^"]+)"/,V))
							})
							return D
						},[],/<[^>]+WorkItem_container[^]+?<[^>]+EyeCatch_container/g,B)
					}
				})
			}
		},{
			Name : 'FollowingUser',
			Judge : WR.Concat(O.UP,
			[
				/\bFollowingUser\b/i
			]),
			View : function(_,Page)
			{
				return SolveSelfNameCache().FMap(function(B)
				{
					return API(KakuYomuUserFollowingUser(B,-~Page))
				}).Map(function(B)
				{
					return {
						Size : 50,
						Len : SolveUserTabCount(B).following_users,
						Item : WW.MR(function(D,V)
						{
							var ID = WW.MF(/users\/([^"]+)"/,V);
							D.push(
							{
								Non : true,
								ID : ID,
								URL : KakuYomuUser,
								UP : WC.HED(WW.MF(/class="ActivityName_[^>]+>([^<]+)/,V)),
								UPURL : KakuYomuUser(ID),
								More : WC.HED(WW.MF(/="TruncateMultipleLines[^>]+>([^<]+)/,V))
							})
							return D
						},[],/<[^>]+UserItem_userItem[^]+?<\/li/g,B)
					}
				})
			}
		}],
		IDView : function(ID)
		{
			return SolveID(ID)[1]
		},
		IDURL : function(ID)
		{
			ID = SolveID(ID)
			return KakuYomuEpisode(ID[0],ID[1])
		}
	}
})