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
	// KakuYomuUserFollowingWork = WW.Tmpl(KakuYomu,'users/',undefined,'/following_works?page=',undefined),
	KakuYomuUserFollowingUser = WW.Tmpl(KakuYomu,'users/',undefined,'/following_users?page=',undefined),
	KakuYomuMyAntennaAll = KakuYomu + 'my/antenna/works/all',
	KakuYomuAPIAPP = KakuYomu + 'api/app/',
	KakuYomuAPIAPPWork = WW.Tmpl(KakuYomuAPIAPP,'works/',undefined),
	KakuYomuAPIAPPEpisode = WW.Tmpl(KakuYomuAPIAPP,'works/',undefined,'/episodes/',undefined,'.html'),
	KakuYomuAPIAPPUserInfo = WW.Tmpl(KakuYomuAPIAPP,'users/names/',undefined),
	KakuYomuAPIAPPUserWork = WW.Tmpl(KakuYomuAPIAPP,'users/',undefined,'/works?page=',undefined),

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
		return O.ReqAPI(KakuYomuAPIAPPUserInfo(Q)).Map(WC.JTO)
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
				/^(\d+)\D+(\d+)$/,
				/Work\D+(\d+)\D+Episode\D+(\d+)/i
			],
			JudgeVal : /(\d+)\D+(\d+)/,
			Join : ' ',
			View : function(ID)
			{
				ID = SolveID(ID)
				return O.ReqAPI(KakuYomuAPIAPPEpisode(ID[0],ID[1])).Map(function(B)
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
			JudgeVal : O.ValNum,
			View : O.Less(function(ID)
			{
				return O.ReqAPI(KakuYomuAPIAPPWork(ID)).Map(function(B)
				{
					B = WC.JTO(B)
					return WR.Cat([SolveWork(B)],WR.Rev(WR.Map(function(V)
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
					return O.ReqAPI(KakuYomuAPIAPPUserWork(B.id,''))
				})
			},function(I,Page)
			{
				return O.ReqAPI(KakuYomuAPIAPPUserWork(I[0].id,I[Page]))
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
			JudgeVal : false,
			View : function()
			{
				return O.Req(KakuYomuMyAntennaAll).Map(function(B)
				{
					return {
						// Len : SolveUserTabCount(B).following_works,
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								Non : true,
								ID : WW.MF(/works\/(\d+)/,V),
								URL : KakuYomuWork,
								Title : WC.HED(WW.MF(/title">([^<]+)/,V)),
								UP : WC.HED(WW.MF(/author">([^<]+)/,V)),
							})
							return D
						},[],/<li[^>]+AntennaList[^]+?<\/li/ig,B)
					}
				})
			}
		},{
			Name : 'FollowingUser',
			JudgeVal : false,
			View : function(_,Page)
			{
				return SolveSelfNameCache().FMap(function(B)
				{
					return O.ReqAPI(KakuYomuUserFollowingUser(B,-~Page))
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