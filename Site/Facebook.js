'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	Facebook = 'https://www.facebook.com/',
	FacebookPage = WW.Tmpl(Facebook,'pages_reaction_units/more/?__a=1&fb_dtsg_ag=',undefined,'&page_id=',undefined,'&surface=www_pages_posts&cursor=%7B%22timeline_cursor%22%3A%22',undefined,'%22%2C%22timeline_section_cursor%22%3A%7B%7D%2C%22has_next_page%22%3Atrue%7D&unit_count=',O.Size),
	FacebookTimelineRecent = Facebook + '?sk=h_chr',
	FacebookPageletRecent = WW.Tmpl(Facebook,'ajax/pagelet/generic.php/LitestandTailLoadPagelet?__a=1&fb_dtsg_ag=',undefined,'&data=',undefined),
	IDURL = function(Q){return Facebook + Q.replace('/','/posts/')},
	Common = function(B)
	{
		B = WC.JTO(B.replace(/^[^{]+/,''))
		B.error && O.Bad(B.error,B.errorSummary + ' | ' + B.errorDescription)
		return B
	},
	SolveAsyncToken = function(B)
	{
		return WW.MF(/"async_get_token":"([^"]+)/,B)
	},
	SolvePost = function(B,Count,R)
	{
		var
		W = /<div[^>]+userContentWrapper/g,
		ID,Img,Video,
		T;
		Count = Count || Infinity
		R = R || []
		for (;Count-- && (T = W.exec(B));)
		{
			T = WC.TagM('div',T.index,B)
			ID = WR.Match(/<a[^>]+href="[^>]*?(\w+)(?:\/[\w.]+)+(\/\d+)[^>]+>(?:<[^>]+data-utime="(\d+)|<abbr[^>]+title="([^"]+))/,T)
			if (!ID.length) continue
			Img = T
			if (Video = WW.MU(/<video[^]+?<img[^>]+/,T))
				Img = Video
			else
				Img = WW.MU(/"scaledImage[^>]+/,T)
			R.push(
			{
				Non : !Video,
				ID : ID[1] + ID[2],
				Img : WC.HED(WW.MF(/src="([^"]+)/,Img)),
				Title : O.Text(WC.TagM('p',0,T),true),
				UP : WC.HED(WW.MF(/>([^<]+)<\/a><\/span/,T)),
				UPURL : Facebook + ID[1],
				Date : ID[3] ? 1E3 * ID[3] : ID[4]
			})
		}
		return R
	};
	return {
		ID : 'Facebook',
		Alias : 'FB',
		Judge : /\bFacebook\b/i,
		Min : 'c_user xs',
		Sign : function()
		{
			return O.Req(Facebook).Map(function(B)
			{
				return WC.JTO(WW.MF(/"NAME":(".*?"),"/,B))
			})
		},
		Map : [
		{
			Name : 'Timeline',
			Judge : O.TL,
			View : O.More(function(_,I)
			{
				return O.Req(FacebookTimelineRecent).Map(function(B)
				{
					I[0] = SolveAsyncToken(B)
					return B
					return [WW.MF(/data-cursor="([^"=]+)/,B),B]
				})
			},function(I,Page)
			{
				return O.Req(FacebookPageletRecent(I[0],WC.UE(WC.OTJ(
				{
					cursor : I[Page],
					pager_config : WC.OTJ(
					{
						"section_type" : 1,
						"most_recent" : true,
						"sequence" : null
					})
				})))).Map(function(B)
				{
					return Common(B).payload
					var Next;
					B = Common(B)
					WR.Each(function(V)
					{
						if (V = WR.Path([3,1,'__bbox','result','data','feedback','top_level_comments','page_info'],V))
							Next = V.has_next_page && V.end_cursor
						return !Next
					},B.jsmods.pre_display_requires)
					return [Next,B.payload]
				})
			},function(B)
			{
				return [WW.MR(function(D,V){return V[1]},'',/data-cursor="([^"=]+)/g,B),
				{
					Item : SolvePost(B)
				}]
			})
		},{
			Name : 'Post',
			Judge : [/com\/(?:pg\/)?(\w+)(?:\/[\w.]+)+(\/\d+)/,/(?:^|Post\s+)(\w+\/\d+)/i],
			Join : '',
			View : function(ID)
			{
				return O.Api(IDURL(ID)).Map(function(B)
				{
					return {
						Item : SolvePost(B,1)
					}
				})
			}
		},{
			Name : 'User',
			Judge : [/com\/(?:pg\/)?(\w+)/,O.Word('User')],
			View : O.More(function(ID,I)
			{
				return O.Api(IDURL(ID)).FMap(function(B)
				{
					var
					PageID = WW.MF(/"pageID":"(\d+)/,B),
					Token = SolveAsyncToken(B);
					I[0] = [Token,PageID]
					return O.Api(FacebookPage(Token,PageID,''))
				})
			},function(I,Page)
			{
				return O.Api(FacebookPage(I[0][0],I[0][1],I[Page]))
			},function(B,T)
			{
				B = Common(B)
				T = B.domops[0][3].__html
				return [WW.MF(/timeline_cursor.{9}([^%]+)/,T),
				{
					Item : SolvePost(T)
				}]
			})
		}],
		IDURL : IDURL
	}
})