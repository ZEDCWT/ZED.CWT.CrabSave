var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Util = require('./Util'),
Key = require('./Key').Site,
Lang = require('./Lang'),
L = Lang.L,

PageSize = 30,
URLSpace = ZED.URLBuild('http://space.bilibili.com/ajax/member/getSubmitVideos?mid=',undefined,'&pagesize=',PageSize,'&page=',undefined);

module.exports = ZED.ReduceToObject
(
	Key.Name,'Bilibili',
	Key.Judge,/\.bilibili\./i,
	Key.Login,function()
	{

	},
	Key.Check,function()
	{

	},
	Key.Map,[ZED.ReduceToObject
	(
		Key.Name,L(Lang.User),
		Key.Judge,[/space\D*(\d+)/i],
		Key.Page,function(ID,X)
		{
			return Util.RequestBody(URLSpace(ID,X))
				.map(function(Q)
				{
					Q = ZED.JTO(Q)
					Q.status || ZED.throw(L(Lang.UexRtn))
					Q = Q.data

					return ZED.ReduceToObject
					(
						Key.Pages,Q.pages,
						Key.Total,Q.count,
						Key.Item,ZED.Map(Q.vlist,function(F,V)
						{
							return ZED.ReduceToObject
							(
								Key.Index,PageSize * (X - 1) + F,
								Key.ID,'av' + V.aid,
								Key.Img,V.pic,
								Key.Title,V.title,
								Key.Author,V.author,
								Key.Date,new Date(1000 * V.created)
							)
						})
					)
				})
		}
	)],
	Key.URL,function()
	{

	}
)