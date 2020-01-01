'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	WeiBo = 'https://weibo.com/',
	WeiBoUserAll = WW.Tmpl(WeiBo,undefined,'?is_all=1&page=',undefined),
	WeiBoUserAllSub = WW.Tmpl(WeiBo,'p/aj/v6/mblog/mbloglist?script_uri=/',undefined,'&id=',undefined,'&pl_name=Pl_Official_MyProfileFeed__20&domain=100505&is_all=1&page=',undefined,'&pre_page=',undefined,'&pagebar=',undefined),
	WeiBoHome = WW.Tmpl(WeiBo,'aj/mblog/fsearch?',undefined),
	WeiBoFollow = WW.Tmpl(WeiBo,undefined,'/follow'),
	WeiBoFollowAPI = WW.Tmpl(WeiBo,'p/',undefined,'/myfollow?ajaxpagelet=1&pids=Pl_Official_RelationMyfollow__95&Pl_Official_RelationMyfollow__95_page=',undefined),
	NumberZip = WC.Rad(WW.D + WW.az + WW.AZ),
	Zip = function(Q)
	{
		return WR.MapU(function(V,F){return V = NumberZip.S(V),F ? WR.PadS0(4,V) : V},
			WR.SplitAll(7,WR.PadS0(7 * Math.ceil(Q.length / 7),Q))).join('')
	},
	Common = function(B)
	{
		B = WC.JTO(B)
		B.msg && O.Bad(B.code,B.msg)
		return B.data
	},
	SolveID = function(B){return WW.MF(/href="\/(\d+\/\w+).*?date="/,B)},
	SolvePageID = function(B){return WW.MF(/page_id']='(\d+)/,B)},
	SolveHTML = function(B)
	{
		return WR.Trim(WC.HED(B
			.replace(/<br>/g,'\n')
			.replace(/<.*?>/g,''))
			.replace(/.*/g,WR.Trim))
	},
	SolveCard = function(B)
	{
		var
		Non = true,
		Title = SolveHTML(WW.MU(/<[^>]+WB_text[^]+?<\/div>/,B)
			.replace(/<a[^>]+ignore=.*?<\/a>/g,'')),
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
			Img = Img && Img.split(',')[0]
		}
		return {
			Non : Non,
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
		return WR.Map(SolveCard,B.match(/feed_list_item"[^]+?WB_feed_handle/g))
	},
	SolveSelfUID = WR.Pipe(O.Coke,WX.CacheL(function()
	{
		return O.Req(WeiBo).Map(function(B)
		{
			return WW.MF(/'uid']='(\d+)/,B)
		})
	})),
	SolveFollowPageID = WX.CacheL(function(UID)
	{
		return O.Req(WeiBoFollow(UID)).Map(SolvePageID)
	});
	return {
		ID : 'WeiBo',
		Name : '\u65B0\u6D6A\u5FAE\u535A',
		Alias : 'WB',
		Judge : /\bWeiBo\b/i,
		Min : 'SUB',
		Sign : function()
		{
			return O.Req(WeiBo).Map(function(B)
			{
				return WW.MF(/'nick']=.(.*).;/,B)
			})
		},
		Map : [
		{
			Name : 'Post',
			Judge : /(?:\/|Post\s+)(\d+\/\w+)/i,
			View : function(ID)
			{
				ID = ID.split('/')
				if (!/\D/.test(ID[1]))
					ID[1] = Zip(ID[1])
				ID = ID.join('/')
				return O.Req(WeiBo + ID).Map(function(B)
				{
					B = WC.JTO(WW.MU(/{"ns":"pl.content.*}/,B)).html
					return {
						Item : [SolveCard(B)]
					}
				})
			}
		},{
			Name : 'User',
			Judge : [/\.com\/(\w+)/,O.Word('User')],
			View : function(ID,Page)
			{
				var PageID;
				return WX.Range(0,3).FMapO(1,function(N)
				{
					return N ?
						WX.Just().FMap(function(){return O.Req(WeiBoUserAllSub(ID,PageID,-~Page,-~Page,~-N))})
							.Map(Common) :
						O.Req(WeiBoUserAll(ID,-~Page))
							.Map(function(B)
							{
								PageID = SolvePageID(B)
								return WC.JTO(WW.MU(/{"ns":"pl.content.home.*MyProfileFeed.*}/,B)).html
							})
				}).Reduce(WR.Add,'').Map(function(B)
				{
					return {
						Max : +WW.MF(/"page".*countPage=(\d+)/,B),
						Item : SolveCardList(B)
					}
				})
			}
		},{
			Name : 'Home',
			Judge : O.TL,
			View : O.More(function()
			{
				return O.Req(WeiBo).Map(function(B)
				{
					B = WC.JTO(WW.MU(/{"ns":"pl.content.homefeed.*}/,B)).html
					return [[0],B]
				})
			},function(I,Page)
			{
				return O.Req(WeiBoHome(I[Page])).Map(Common)
			},function(B,I,Page,T)
			{
				T = WW.MF(/lazyload" action-data="([^"]+)/,B)
				T && (I[-~Page] = T)
				return {
					Item : SolveCardList(B)
				}
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
						return O.Req(WeiBoFollowAPI(PageID,-~Page))
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
									Title : WC.HED(WW.MF(/title="([^"]+)/,V)),
									More : WR.Trim(WR.Trim(WW.MF(/"text[^>]+>([^<]+)/,V)) + '\n' +
										SolveHTML(WW.MF(/info_from[^>]+>([^]+?)<\/div/,V)))
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