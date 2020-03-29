'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	Facebook = 'https://www.facebook.com/',
	FacebookPage = WW.Tmpl(Facebook,'pages_reaction_units/more/?__a=1&fb_dtsg_ag=',undefined,'&page_id=',undefined,'&surface=www_pages_posts&cursor=%7B%22timeline_cursor%22%3A%22',undefined,'%22%2C%22timeline_section_cursor%22%3A%7B%7D%2C%22has_next_page%22%3Atrue%7D&unit_count=',O.Size),
	FacebookProfileTimeline = WW.Tmpl(Facebook,'ajax/pagelet/generic.php/ProfileTimelineJumperStoriesPagelet?__a=1&fb_dtsg_ag=',undefined,'&data=%7B%22profile_id%22%3A%22',undefined,'%22%2C%22start%22%3A%220%22%2C%22end%22%3A%22',undefined,'%22%2C%22cursor%22%3A%22',undefined,'%22%7D'),
	FacebookTimelineRecent = Facebook + '?sk=h_chr',
	FacebookPageletRecent = WW.Tmpl(Facebook,'ajax/pagelet/generic.php/LitestandTailLoadPagelet?__a=1&fb_dtsg_ag=',undefined,'&data=%7B%22cursor%22%3A%22',undefined,'%22%2C%22pager_config%22%3A%22%7B%5C%22section_type%5C%22%3A1%2C%5C%22most_recent%5C%22%3Atrue%2C%5C%22sequence%5C%22%3Anull%7D%22%7D'),
	IDURL = function(Q){return Facebook + Q.replace('/','/posts/')},
	Common = function(B)
	{
		B = WC.JTO(B.replace(/^[^{]+/,''))
		B.error && O.Bad(B.error,B.errorSummary + ' | ' + B.errorDescription)
		return B
	},
	SolveAsyncToken = function(B)
	{
		return WC.UE(WW.MF(/"async_get_token":"([^"]+)/,B))
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
			ID = WR.Match(/<a[^>]+href="[^>]*?(?:(\w+)(?:\/[\w.]+)+(\/\d+)|fbid=(\d+))[^>]+>(?:<[^>]+data-utime="(\d+)|<abbr[^>]+title="([^"]+))/,T)
			if (!ID.length) continue
			if (ID[3])
			{
				ID[1] = WW.MF(/title=[^>]+href="[^"]+\/(\w+)/,T)
				ID[2] = '/' + ID[3]
			}
			Img = T
			if (Video = WW.MU(/<video[^]+?<img[^>]+/,T))
				Img = Video
			else
				Img = ID[3] ?
					WW.MU(/<img[^>]+data-src=/,T) :
					WW.MU(/"scaledImage[^>]+/,T)
			R.push(
			{
				Non : !Video,
				ID : ID[1] + ID[2],
				Img : WC.HED(WW.MF(/src="([^"]+)/,Img)),
				Title : O.Text(WC.TagM('p',0,T),true),
				UP : WC.HED(WW.MF(/>([^<]+)<\/a><\/span/,T)),
				UPURL : Facebook + ID[1],
				Date : ID[4] ? 1E3 * ID[4] : WC.HED(ID[5] || '')
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
				})
			},function(I,Page)
			{
				return O.Req(FacebookPageletRecent(I[0],I[Page])).Map(function(B)
				{
					return Common(B).payload
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
				return O.Req(IDURL(ID)).Map(function(B)
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
				return O.Req(IDURL(ID)).FMap(function(B)
				{
					var
					PageID = WW.MF(/"pageID":"(\d+)/,B),
					ProfileID = WW.MF(/profile_id:(\d+),vanity/,B),
					Token = SolveAsyncToken(B);
					I[0] = [Token,PageID,ProfileID]
					return O.Req(PageID ?
						FacebookPage(Token,PageID,'') :
						FacebookProfileTimeline(Token,ProfileID,0 | WW.Now() / 1E3,''))
				})
			},function(I,Page)
			{
				return O.Req(I[0][1] ?
					FacebookPage(I[0][0],I[0][1],I[Page]) :
					FacebookProfileTimeline(I[0][0],I[0][2],0 | WW.Now() / 1E3,I[Page]))
			},function(B,I,T)
			{
				B = Common(B)
				T = I[0][1] ?
					B.domops[0][3].__html :
					B.payload
				return [I[0][1] ?
					WW.MF(/timeline_cursor.{9}([^%]+)/,T) :
					WR.Reduce(function(D,V)
					{
						return D || (V = WR.Path([2,2],V)) &&
							V.profile_id &&
							V.cursor
					},'',B.jsmods.instances),
				{
					Item : SolvePost(T)
				}]
			})
		}],
		IDURL : IDURL
	}
})