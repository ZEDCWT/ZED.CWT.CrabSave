'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WB)
{
	var
	BiliBili = 'https://www.bilibili.com/',
	BiliBiliVideo = WW.Tmpl(BiliBili,'video/av',undefined),
	BiliBiliApi = 'https://api.bilibili.com/',
	BiliBiliApiWeb = BiliBiliApi + 'x/web-interface/',
	BiliBiliApiWebNav = BiliBiliApiWeb + 'nav',
	BiliBiliApiWebView = WW.Tmpl(BiliBiliApiWeb,'view?aid=',undefined),
	BiliBiliSpace = 'https://space.bilibili.com/',
	BiliBiliSpaceSubmit = WW.Tmpl(BiliBiliSpace,'ajax/member/getSubmitVideos?mid=',undefined,'&pagesize=',O.Size,'&page=',undefined),
	BiliBiliVCApi = 'https://api.vc.bilibili.com/',
	BiliBiliVCApiDynamicNew = BiliBiliVCApi + 'dynamic_svr/v1/dynamic_svr/dynamic_new?uid=&type_list=8,512',
	BiliBiliVCApiDynamicHistory = WW.Tmpl(BiliBiliVCApi,'dynamic_svr/v1/dynamic_svr/dynamic_history?uid=&type_list=8,512&offset_dynamic_id=',undefined),
	Common = function(V)
	{
		V = WC.JTO(V)
		V.code && O.Bad(V.code,V.msg || V.message)
		false === V.status && O.Bad(V.data)
		return V.data
	},
	SolveAV = function(V)
	{
		return {
			ID : V.aid,
			Img : V.pic,
			Title : V.title,
			UP : V.owner.name,
			UPURL : BiliBiliSpace + V.owner.mid,
			Date : 1E3 * V.pubdate,
			Len : V.duration,
			Desc : V.desc,
			More : 'CTime ' + O.DTS(1E3 * V.ctime)
		}
	};
	return {
		ID : 'BiliBili',
		Name : '\u55F6\u54E9\u55F6\u54E9',
		Alias : 'B \u55F6\u54E9 \u54D4\u54E9\u54D4\u54E9 \u54D4\u54E9',
		Judge : /\bBiliBili\b|AV\d+/i,
		Min : 'SESSDATA',
		Sign : function()
		{
			return O.Req(BiliBiliApiWebNav).Map(function(B)
			{
				return Common(B).uname
			})
		},
		Map : [
		{
			Name : 'Video',
			Judge : [/^\d+$/,O.Num('Video|AID|AV')],
			View : O.Less(function(ID)
			{
				return WB.ReqB(O.Api(BiliBiliApiWebView(ID))).Map(function(V)
				{
					V = Common(V)
					return [SolveAV(V)].concat(WR.Map(function(B)
					{
						return {
							Index : B.page,
							ID : V.aid + '?p=' + B.page,
							Img : V.pic,
							Title : B.part,
							Len : B.duration
						}
					},V.pages || []))
				})
			})
		},{
			Name : 'User',
			Judge : O.Num('Space|User'),
			View : function(ID,Page)
			{
				return WB.ReqB(O.Api(BiliBiliSpaceSubmit(ID,++Page))).Map(function(V)
				{
					V = Common(V)
					return {
						Max : V.pages,
						Len : V.count,
						Item : WR.Map(function(B)
						{
							return {
								ID : B.aid,
								Img : B.pic,
								Title : B.title,
								UP : B.author,
								UPURL : BiliBiliSpace + B.mid,
								Date : 1E3 * B.created,
								Len : B.length,
								Desc : B.description
							}
						},V.vlist || [])
					}
				})
			}
		},{
			Name : 'Dynamic',
			Judge : /^$|\bDynamic\b/i,
			View : O.More(function()
			{
				return O.Req(BiliBiliVCApiDynamicNew).Map(function(B)
				{
					B = Common(B).cards
					return [[0,WR.Last(B).desc.dynamic_id_str],B]
				})
			},function(_,Page,I)
			{
				return O.Req(BiliBiliVCApiDynamicHistory(I[Page])).Map(function(B)
				{
					B = Common(B)
					B.has_more && (I[-~Page] = WR.Last(B.cards).desc.dynamic_id_str)
					return B.cards
				})
			},function(Q)
			{
				return {
					Item : WR.Map(function(V)
					{
						return SolveAV(WC.JTO(V.card))
					},Q)
				}
			})
		},{
			Name : 'Search',
			Judge : O.Find,
			View : function()
			{
			},
			Hint : function()
			{
			}
		}],
		IDView : WR.Add('av'),
		IDURL : BiliBiliVideo
	}
})