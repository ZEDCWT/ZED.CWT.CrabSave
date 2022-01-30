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
		return (ForceReq || O.Coke() ? O.Req : O.API)(
		{
			URL : Q,
			Head : {Origin : FanBoxAPI.slice(0,-1)}
		}).Map(function(B)
		{
			return WC.JTO(B).body
		})
	},
	SolvePost = function(B)
	{
		return {
			NonAV : null == B.body,
			ID : B.id,
			URL : FanBoxUserPost(B.creatorId,B.id),
			Img : B.coverImageUrl,
			Title : B.title,
			UP : B.user.name,
			UPURL : FanBoxUser(B.creatorId),
			Date : new Date(B.publishedDatetime),
			Desc : B.excerpt,
			More :
			[
				!!B.feeRequired && 'JPY ' + B.feeRequired
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
			Judge : O.Num('Posts?'),
			View : function(ID)
			{
				return API(FanBoxAPIPostInfo(ID)).Map(function(B)
				{
					return {
						Item : [SolvePost(B)]
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
					Item : WR.Map(SolvePost,B.items)
				}]
			})
		},{
			Name : 'Following',
			Judge : O.UP,
			View : O.Less(function()
			{
				return API(FanBoxAPIFollowing,true).Map(function(B)
				{
					return WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.creatorId,
							URL : FanBoxUser(V.creatorId),
							Img : V.user.iconUrl,
							UP : '[' + V.user.userId + '] ' + V.user.name,
							UPURL : FanBoxUser(V.creatorId),
							More : WR.Concat(WR.Map(function(N)
							{
								return O.Ah(N,N)
							},V.profileLinks),
							[
								V.description
							])
						}
					},B)
				})
			})
		},{
			Name : 'Supporting',
			Judge : /\bSu(?:pp(?:ort(?:ing)?)?)?\b/i,
			View : O.Less(function()
			{
				return API(FanBoxAPISupporting,true).Map(function(B)
				{
					return WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.creatorId,
							URL : FanBoxUser(V.creatorId),
							Img : V.user.iconUrl,
							UP : '[' + V.user.userId + '] ' + V.user.name,
							UPURL : FanBoxUser(V.creatorId),
							More :
							[
								'[' + V.id + '] ' + V.title,
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
			Judge : O.TL,
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