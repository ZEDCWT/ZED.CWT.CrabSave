'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	Facebook = 'https://www.facebook.com/',
	FacebookPage = WW.Tmpl(Facebook,'pages_reaction_units/more/?page_id=',undefined,'&fb_dtsg_ag=',undefined,'&__a=1&surface=www_pages_posts&cursor=%7B%22timeline_cursor%22%3A%22',undefined,'%22%2C%22timeline_section_cursor%22%3A%7B%7D%2C%22has_next_page%22%3Atrue%7D&unit_count=',O.Size),
	IDURL = function(Q){return Facebook + Q.replace('/','/posts/')},
	Common = function(B)
	{
		return WC.JTO(B.replace(/^[^{]+/,''))
	},
	SolvePost = function(B,Count)
	{
		var
		W = /<div[^>]+userContentWrapper/g,
		R = [],
		ID,Img,Video,
		T;
		for (;Count-- && (T = W.exec(B));)
		{
			T = WC.TagM('div',T.index,B)
			ID = WR.Match(/<a[^>]+href="[^>]*?(\w+)(?:\/[\w.]+)+(\/\d+)[^>]+><[^>]+-utime="(\d+)/,T)
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
				Date : 1E3 * ID[3]
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
					Token = WW.MF(/"async_get_token":"([^"]+)/,B);
					I[0] = [PageID,Token]
					return O.Api(FacebookPage(PageID,Token,''))
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
					Item : SolvePost(T,Infinity)
				}]
			})
		}],
		IDURL : IDURL
	}
})