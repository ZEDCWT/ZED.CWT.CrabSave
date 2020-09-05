'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	AcFun = 'https://www.acfun.cn/',
	AcFunVideo = WW.Tmpl(AcFun,'v/ac',undefined),
	AcFunVideoView = WW.Tmpl(AcFun,'v/ac',undefined,'?quickViewId=videoInfo_new&ajaxpipe=1'),
	AcFunUser = WW.Tmpl(AcFun,'u/',undefined),
	AcFunUserVideo = WW.Tmpl(AcFun,'u/',undefined,'?quickViewId=ac-space-video-list&ajaxpipe=1&type=video&order=newest&page=',undefined,'&pageSize=',O.Size),
	AcFunRestPC = AcFun + 'rest/pc-direct/',
	AcFunRestPCPersonal = AcFunRestPC + 'user/personalInfo',
	AcFunRestPCFollow = WW.Tmpl(AcFunRestPC,'relation/getFollows?isGroup=0&groupId=-1&page=',undefined,'&count=',O.Size,'&action=7'),
	AcFunRestPCFeed = WW.Tmpl(AcFunRestPC,'feed/followFeed?isGroup=0&gid=0&count=',O.Size,'&pcursor=',undefined),
	AcFunRestPCSugg = WW.Tmpl(AcFunRestPC,'search/suggest?count=16&keyword=',undefined,'&callback=+'),
	AcFunSearch = WW.Tmpl(AcFun,'search?type=video&keyword=',undefined,'&pCursor=',undefined,'&sortType=1&quickViewId=video-list&ajaxpipe=1'),
	Common = function(V)
	{
		V = WC.JTO(V)
		V.result && O.Bad(V.result,V.error_msg)
		return V
	},
	CommonQuick = function(V)
	{
		return WC.JTO(V,{More : true})[0].html
	},
	SolveAC = function(V,C)
	{
		1 - V.videoList.length && O.Bad('Too many videos ' + WC.OTJ(V.videoList))
		C = V.videoList[0]
		return {
			ID : V.dougaId,
			Img : V.coverCdnUrls[0].url,
			Title : V.title,
			UP : V.user.name,
			UPURL : AcFunUser(V.user.id),
			Date : V.createTimeMillis,
			Len : WW.StrMS(C.durationMillis),
			More :
			[
				C.title,
				C.fileName,
				V.description
			].join('\n')
		}
	};
	return {
		ID : 'AcFun',
		Alias : 'AC',
		Judge : /\bAcFun\b|\bAC\d+/i,
		Min : 'auth_key acPasstoken',
		Sign : function()
		{
			return O.Req(AcFunRestPCPersonal).Map(function(B)
			{
				return Common(B).info.userName
			})
		},
		Map : [
		{
			Name : 'Search',
			Judge : O.Find,
			View : function(ID,Page)
			{
				return O.Api(AcFunSearch(WC.UE(ID),-~Page)).Map(function(B)
				{
					B = CommonQuick(B)
					return {
						Len : WW.MF(/data-total="(\d+)/,B),
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								ID : WW.MF(/\/ac(\d+)/,V),
								Img : WW.MF(/src="([^"]+)/,V),
								Title : WC.HED(WW.MF(/title"><[^>]+>([^<]+)/,V)),
								UP : WC.HED(WW.MF(/user-name">([^<]+)/,V)),
								UPURL : AcFunUser(WW.MF(/"\/u\/(\d+)"/,V)),
								Date : WW.MF(/create-time">([^<]+)/,V),
								Len : WW.MF(/duration">([^<]+)/,V)
							})
							return D
						},[],/search-video"[^]+?class="video__main__intro/g,B)
					}
				})
			},
			Hint : function(Q)
			{
				return O.Api(AcFunRestPCSugg(WC.UE(Q))).Map(function(B)
				{
					B = Common(B.slice(2,-1))
					return {
						Item : B.suggestKeywords || []
					}
				})
			}
		},{
			Name : 'Video',
			Judge : [/^\d+$/,O.Num('Video|AC')],
			View : function(ID)
			{
				return O.Api(AcFunVideoView(ID)).Map(function(B)
				{
					B = O.JOM(/Info\s*=(?={)/,CommonQuick(B))
					return {
						Item : [SolveAC(B)]
					}
				})
			}
		},{
			Name : 'User',
			Judge : O.Num('User|U'),
			View : function(ID,Page)
			{
				return O.Api(AcFunUser(ID)).FMap(function(User)
				{
					return O.Api(AcFunUserVideo(ID,-~Page)).Map(function(B)
					{
						return {
							Len : WW.MF(/video" *data-count="(\d+)/,User),
							Item : WW.MR(function(D,V)
							{
								D.push(
								{
									ID : WW.MF(/\/ac(\d+)/,V),
									Img : WW.MF(/src="([^"]+)/,V),
									Title : WC.HED(WW.MF(/title="([^"]+)/,V)),
									Date : WW.MF(/date">([^<]+)/,V)
								})
								return D
							},[],/<a [^]+?\/figure>/g,CommonQuick(B))
						}
					})
				})
			}
		},{
			Name : 'Following',
			Judge : O.UP,
			View : function(_,Page)
			{
				return O.Req(AcFunRestPCFollow(-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.totalCount,
						Item : WR.Map(function(V)
						{
							return {
								Non : true,
								ID : V.userId,
								URL : AcFunUser(V.userId),
								Img : V.userImg,
								UP : V.userName,
								UPURL : AcFunUser(V.userId),
								More : V.signature
							}
						},B.friendList)
					}
				})
			}
		},{
			Name : 'Feed',
			Judge : O.TL,
			View : function(_,Page)
			{
				return O.Req(AcFunRestPCFeed(-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.totalCount,
						Item : WR.Map(function(V)
						{
							return {
								Non : V.isArticle,
								ID : V.aid,
								Img : V.titleImg,
								Title : V.title,
								UP : V.author,
								UPURL : AcFunUser(V.userId),
								Date : V.releaseDate,
								More : V.description
							}
						},B.feedList)
					}
				})
			}
		}],
		IDView : function(Q)
		{
			return 'ac' + Q
		},
		IDURL : AcFunVideo
	}
})