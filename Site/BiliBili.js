'use strict'
CrabSave.Site(function(O)
{
	return {
		Name : '嗶哩嗶哩',
		Alias : ['BiliBili','B'],
		Judge : /av\d+/g,
		Cookie : 'BiliBili',
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