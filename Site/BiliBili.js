'use strict'
CrabSave.Site(function(O,WW,WC)
{
	var
	BiliBili = 'https://www.bilibili.com/',
	BiliBiliApi = 'https://api.bilibili.com/',
	BiliBiliApiNav = BiliBiliApi + 'x/web-interface/nav';
	return {
		ID : 'BiliBili',
		Name : '\u55F6\u54E9\u55F6\u54E9',
		Alias : 'B',
		Judge : /av\d+/g,
		Min : 'SESSDATA',
		Sign : function()
		{
			return O.Req(BiliBiliApiNav).Map(function(B)
			{
				return WC.JTO(B).data.uname
			})
		},
		Map : [
		{
			Name : 'Video',
			Judge : /av/,
			View : function(ID,Page)
			{

			}
		}]
	}
})