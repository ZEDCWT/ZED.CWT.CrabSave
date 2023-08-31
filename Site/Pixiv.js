'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	PrefixSketch = 'S',

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
	PixivSketch = 'https://sketch.pixiv.net/',
	PixivSketchItem = WW.Tmpl(PixivSketch,'items/',undefined),
	PixivSketchUser = WW.Tmpl(PixivSketch,'@',undefined),
	PixivSketchUser = WW.Tmpl(PixivSketch,'@',undefined),
	PixivSketchAPI = PixivSketch + 'api/',
	PixivSketchAPIHome = PixivSketchAPI + 'walls/home.json',
	PixivSketchAPIPublic = WW.Tmpl(PixivSketchAPI,'walls/@',undefined,'/posts/public.json'),
	PixivSketchAPIUserCurrent = PixivSketchAPI + 'users/current.json',
	PixivSketchAPIUserFollowing = WW.Tmpl(PixivSketchAPI + 'users/@',undefined,'/followings.json'),
	PixivSketchAPIReply = WW.Tmpl(PixivSketchAPI,'replies/',undefined,'.json'),
	Common = function(B)
	{
		B = WC.JTO(B)
		B.error && O.Bad(B.message)
		return B.body
	},
	ReqSketch = function(Q)
	{
		return O.Req(WW.N.ReqOH(Q,'Accept','application/vnd.sketch-v4+json'))
	},
	SketchMoreNext = function(I,Page)
	{
		return ReqSketch(PixivSketch + I[Page])
	},
	CommonSketchNext,
	CommonSketch = function(B)
	{
		B = WC.JTO(B)
		B.error && B.error.length && O.Bad(WR.Pluck('message',B.error).join('\n'))
		CommonSketchNext = WR.Path(['_links','next','href'],B)
		return B.data
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
			Date : V.createDate
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
	}),
	SolveSketchItem = function(V)
	{
		return {
			ID : PrefixSketch + V.id,
			URL : PixivSketchItem(V.id),
			Img : WR.Map(function(B)
			{
				return B.photo.w240.url
			},V.media),
			Title : V.text,
			UP : V.user.name,
			UPURL : PixivSketchUser(V.user.unique_name),
			Date : V.published_at
		}
	};
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
			Name : 'SketchHome',
			JudgeVal : false,
			View : O.More(function()
			{
				return ReqSketch(PixivSketchAPIHome)
			},SketchMoreNext,function(B)
			{
				B = CommonSketch(B)
				return [CommonSketchNext,
				{
					Item : WR.Map(SolveSketchItem,B.items)
				}]
			})
		},
		{
			Name : 'SketchUser',
			Judge : O.Word('SketchUser|Sketch\\b.*@'),
			View : O.More(function(ID)
			{
				return ReqSketch(PixivSketchAPIPublic(ID))
			},SketchMoreNext,function(B)
			{
				B = CommonSketch(B)
				return [CommonSketchNext,
				{
					Item : WR.Map(SolveSketchItem,B.items)
				}]
			})
		},
		{
			Name : 'SketchFollowing',
			JudgeVal : false,
			View : O.More(function()
			{
				return ReqSketch(PixivSketchAPIUserCurrent).FMap(function(B)
				{
					return ReqSketch(PixivSketchAPIUserFollowing(CommonSketch(B).unique_name))
				})
			},SketchMoreNext,function(B)
			{
				B = CommonSketch(B)
				return [CommonSketchNext,
				{
					Item : WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.unique_name,
							URL : PixivSketchUser,
							Img : V.icon.photo.w240.url,
							UP : V.name,
							UPURL : PixivSketchUser(V.unique_name),
							More : O.Ah('Pixiv ' + V.pixiv_user_id,PixivUser(V.pixiv_user_id))
						}
					},B.users)
				}]
			})
		},
		{
			Name : 'SketchItem',
			Judge : O.Num('SketchItem|Sketch\\b.*Items?'),
			JudgeVal : O.ValNum,
			View : function(ID)
			{
				return ReqSketch(PixivSketchAPIReply(ID)).Map(function(B)
				{
					B = CommonSketch(B)
					return {
						Item : [SolveSketchItem(B.item)]
					}
				})
			}
		},
		{
			Name : 'Bookmark',
			JudgeVal : false,
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
			Judge : O.Num('Users?|Member(?!\\D*Illust)'),
			JudgeVal : O.ValNum,
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
			Judge : O.Num('UserAll|UA'),
			JudgeVal : O.ValNum,
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
			JudgeVal : false,
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
			JudgeVal : O.ValNum,
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
							Date : B.userIllusts[B.id].createDate,
							Desc : O.Text(B.description)
						}]
					}
				})
			}
		},{
			Name : 'FanBox',
			Judge : O.Num('FanBox'),
			JudgeVal : O.ValNum,
			View : function(ID)
			{
				return O.Req({URL : PixivFanBox(ID),Red : 0,AC : true},true).Map(function(B)
				{
					B = B.H.Location
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