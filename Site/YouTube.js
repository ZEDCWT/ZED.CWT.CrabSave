'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	YouTube = 'https://www.youtube.com/',
	YouTubeAccount = YouTube + 'account';
	return {
		ID : 'YouTube',
		Alias : 'Y',
		Min : 'SID SSID LOGIN_INFO',
		Sign : function()
		{
			return O.Req({url : YouTubeAccount,followRedirect : false}).Map(function(B)
			{
				return WW.MF(/user-name[^>]+>([^<]+)/,B)
			})
		},
		Map : [
		{
			Name : 'Video',
			View : function(ID)
			{
			}
		}]
	}
})