'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	NicoVideo = 'http://www.nicovideo.jp/',
	NicoVideoMy = NicoVideo + 'my';
	return {
		ID : 'NicoNico',
		Name : '\u30CB\u30B3\u30CB\u30B3',
		Alias : 'N',
		Min : 'user_session',
		Sign : function()
		{
			return O.Req({url : NicoVideoMy,maxRedirects : 1}).Map(function(B)
			{
				return WC.JTO(WW.MF(/nickname[ =]+(".*");/,B))
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