'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	FanBox = 'https://www.fanbox.cc/',
	FanBoxUserSetting = FanBox + 'user/settings',
	FanBoxUser = WW.Tmpl(FanBox,'@',undefined),
	FanBoxUserPost = WW.Tmpl(FanBox,'@',undefined,'/posts/',undefined),
	// FanBoxUserDomain = WW.Tmpl('https://',undefined,'.fanbox.cc/'),
	// FanBoxUserDomainPost = WW.Tmpl('https://',undefined,'.fanbox.cc/posts/',undefined),
	FanBoxAPI = 'https://api.fanbox.cc/',
	FanBoxAPIPostInfo = WW.Tmpl(FanBoxAPI,'post.info?postId=',undefined),
	FanBoxAPIUserPager = WW.Tmpl(FanBoxAPI,'post.paginateCreator?creatorId=',undefined),
	FanBoxAPIHome = FanBoxAPI + 'post.listHome?limit=' + O.Size,
	FanBoxAPIFollowing = FanBoxAPI + 'creator.listFollowing',
	FanBoxAPISupporting = FanBoxAPI + 'plan.listSupporting',

	API = function(Q,ForceReq)
	{
		return O.ReqAPI(
		{
			URL : Q,
			Head : {Origin : FanBoxAPI.slice(0,-1)}
		},ForceReq).Map(function(B)
		{
			return WC.JTO(B).body
		})
	},
	SolvePost = function(B)
	{
		return {
			Non : B.isRestricted,
			ID : B.id,
			URL : FanBoxUserPost(B.creatorId,B.id),
			Img : B.coverImageUrl ||
				WR.Path(['cover','url'],B),
			Title : B.title,
			UP : B.user.name,
			UPURL : FanBoxUser(B.creatorId),
			Date : B.publishedDatetime,
			Desc : B.excerpt,
			More :
			[
				(B.isRestricted ? '[Restricted] ' : '') +
				(B.feeRequired ? 'JPY ' + B.feeRequired : '')
			]
		}
	};

	return {
		ID : 'FanBox',
		Alias : 'FX',
		Judge : /\bFanBox\./i,
		Min : 'FANBOXSESSID',
		Sign : function()
		{
			return O.Req({URL : FanBoxUserSetting,Red : 0}).Map(function(B)
			{
				return O.JOM(/name":/,B)
			})
		},
		Map : [
		{
			Name : 'Post',
			Judge :
			[
				/^\d+$/,
				O.Num('Posts?')
			],
			JudgeVal : O.ValNum,
			Example :
			[
				'2450',
				{
					As : 'Inp',
					Val : FanBoxUserPost('official',2450),
					ID : '2450'
				}
			],
			View : function(ID)
			{
				return API(FanBoxAPIPostInfo(ID)).Map(function(B)
				{
					B = SolvePost(B)
					if (B.Non)
					{
						B.Non = false
						B.NonAV = true
					}
					return {
						Item : [B]
					}
				})
			}
		},{
			Name : 'User',
			Judge :
			[
				O.Word('User'),
				/\b((?!www|api)[-\dA-Z]+)\.FanBox/i,
				/@([-\dA-Z]+)/i
			],
			JudgeVal : /[-\dA-Z]+/i,
			Example :
			[
				'official',
				{
					As : 'Inp',
					Val : FanBoxUser('official'),
					ID : 'official'
				}
			],
			View : O.More(function(ID,I)
			{
				return API(FanBoxAPIUserPager(ID)).FMap(function(B)
				{
					WR.EachU(function(V,F){I[F] = V},B)
					return API(B[0])
				})
			},function(I,Page)
			{
				return API(I[Page])
			},function(B)
			{
				return [null,
				{
					Item : WR.Map(SolvePost,B)
				}]
			})
		},{
			Name : O.NameUP,
			JudgeVal : false,
			Example :
			[
				''
			],
			View : O.Less(function()
			{
				return API(FanBoxAPIFollowing,true).Map(function(B)
				{
					return WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.creatorId,
							URL : FanBoxUser,
							Img : V.user.iconUrl,
							UP : WW.Quo(V.user.userId) + V.user.name,
							UPURL : FanBoxUser(V.creatorId),
							More :
							[
								WR.Map(function(N)
								{
									return O.Ah(N,N)
								},V.profileLinks),
								V.description
							]
						}
					},B)
				})
			})
		},{
			Name : 'Supporting',
			JudgeVal : false,
			Example :
			[
				''
			],
			View : O.Less(function()
			{
				return API(FanBoxAPISupporting,true).Map(function(B)
				{
					return WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.creatorId,
							URL : FanBoxUser,
							Img : V.user.iconUrl,
							UP : WW.Quo(V.user.userId) + V.user.name,
							UPURL : FanBoxUser(V.creatorId),
							More :
							[
								WW.Quo(V.id) + V.title,
								'JPY ' + V.fee,
								O.Img(V.coverImageUrl),
								V.description
							]
						}
					},B)
				})
			})
		},{
			Name : 'Home',
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
			View : O.More(function()
			{
				return API(FanBoxAPIHome,true)
			},function(I,Page)
			{
				return API(I[Page],true)
			},function(B)
			{
				return [B.nextUrl,
				{
					Item : WR.Map(SolvePost,B.items)
				}]
			})
		}],
		IDURL : function(Q)
		{
			return FanBoxUserPost('owo',Q)
		}
	}
})