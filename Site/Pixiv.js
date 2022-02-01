'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	Pixiv = 'https://www.pixiv.net/',
	PixivSetting = Pixiv + 'setting_user.php',
	PixivIllust = WW.Tmpl(Pixiv,'artworks/',undefined),
	PixivUser = WW.Tmpl(Pixiv,'users/',undefined),
	PixivFanBox = WW.Tmpl(Pixiv,'fanbox/creator/',undefined),
	PixivAJAX = Pixiv + 'ajax/',
	PixivAJAXIllust = WW.Tmpl(PixivAJAX,'illust/',undefined),
	PixivAJAXUserAll = WW.Tmpl(PixivAJAX,'user/',undefined,'/profile/all'),
	PixivAJAXUserIllust = WW.Tmpl(PixivAJAX,'user/',undefined,'/profile/illusts?work_category=illustManga&is_first_page=0'),
	PixivAJAXUserFollowing = WW.Tmpl(PixivAJAX,'user/',undefined,'/following?offset=',undefined,'&limit=',O.Size,'&rest=show'),
	PixivBookmark = WW.Tmpl(PixivAJAX,'follow_latest/illust?p=',undefined,'&mode=all'),
	Common = function(B)
	{
		B = WC.JTO(B)
		B.error && O.Bad(B.message)
		return B.body
	},
	PackImg = function(V){return {URL : V,Head : {Referer : Pixiv}}},
	SolveIllustBrief = function(V)
	{
		return {
			ID : V.id,
			Img : PackImg(V.url),
			Title : V.title,
			UP : V.userName,
			UPURL : PixivUser(V.userId),
			Date : new Date(V.createDate)
		}
	},
	SolveUserAll = function(ID)
	{
		return O.Req(PixivAJAXUserAll(ID)).Map(function(B)
		{
			B = Common(B)
			return WR.Key(B.illusts).concat(WR.Key(B.manga)).sort(WR.Sub_)
		})
	},
	SolveSelfID = O.CokeC(function()
	{
		return O.Req(Pixiv).Map(function(B)
		{
			return WW.MF(/var dataLayer[^}]+user_id\D+(\d+)/,B)
		})
	});
	return {
		ID : 'Pixiv',
		Alias : 'P',
		Judge : /\bPixiv\b/i,
		Min : 'PHPSESSID device_token',
		Sign : function()
		{
			return O.Req(PixivSetting).Map(function(B)
			{
				return WW.MF(/strong>([^<]+)/,B)
			})
		},
		Map : [
		{
			Name : 'Bookmark',
			Judge : O.TL,
			View : function(_,Page)
			{
				return O.Req(PixivBookmark(-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Max : 100,
						Size : 60,
						Item : WR.Map(SolveIllustBrief,B.thumbnails.illust)
					}
				})
			}
		},{
			Name : 'User',
			Judge : O.Num('Users?|Member'),
			View : O.Less(SolveUserAll,function(Q,ID)
			{
				return O.Req(
				{
					URL : PixivAJAXUserIllust(ID),
					QS : {ids : Q}
				}).Map(function(B)
				{
					B = Common(B)
					return WR.Map(function(V){return SolveIllustBrief(B.works[V])},Q)
				})
			})
		},{
			Name : 'UserAll',
			Judge : O.Num('UserAll'),
			View : function(ID)
			{
				return SolveUserAll(ID).Map(function(V)
				{
					return {
						Item : WR.Map(WR.OfObj('ID'),V)
					}
				})
			}
		},{
			Name : 'Following',
			Judge : O.UP,
			View : function(_,Page)
			{
				return SolveSelfID().FMap(function(ID)
				{
					return O.Req(PixivAJAXUserFollowing(ID,Page * O.Size))
				}).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.total,
						Item : WR.Map(function(V)
						{
							return {
								Non : true,
								ID : V.userId,
								URL : PixivUser,
								Img : PackImg(V.profileImageUrl),
								Title : V.userName,
								More : V.userComment
							}
						},B.users)
					}
				})
			}
		},{
			Name : 'Illust',
			Judge :
			[
				/^\d+$/,
				O.Num('Illust|Artworks?')
			],
			View : function(ID)
			{
				return O.Req(PixivAJAXIllust(ID)).Map(function(B)
				{
					B = Common(B)
					return {
						Item : [
						{
							ID : B.id,
							Img : WR.Times(function(P)
							{
								return PackImg(B.urls.original.replace(/p0/,'p' + P))
							},B.pageCount),
							Title : B.title,
							UP : B.userName,
							UPURL : PixivUser(B.userId),
							Date : new Date(B.createDate),
							Desc : B.description
						}]
					}
				})
			}
		},{
			Name : 'FanBox',
			Judge : O.Num('FanBox'),
			View : function(ID)
			{
				return O.Req({URL : PixivFanBox(ID),Red : 0},true).Map(function(B)
				{
					B = B[2].location
					return {
						Item : [
						{
							Non : true,
							ID : WW.MF(/([-\dA-Z]+)\.FanBox/i,B),
							URL : B,
							UP : B,
							UPURL : B
						}]
					}
				})
			}
		}],
		IDURL : PixivIllust
	}
})