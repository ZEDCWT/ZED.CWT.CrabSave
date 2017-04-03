'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('./Util'),
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('./Lang'),
L = Lang.L,

Name = 'Iwara',
PageSize = 40;

module.exports = function(Domain,SubName,Judge)
{
	var
	URLDomain = 'http://' + Domain + '.iwara.tv/',
	URLVideo = ZED.URLBuild(URLDomain,'videos/',Util.U),
	URLUserPrefix = URLDomain + 'users/',
	URLUser = ZED.URLBuild(URLUserPrefix,Util.U,'/videos?page=',Util.U),
	URLVInfoURL = ZED.URLBuild(URLDomain,'api/video/',Util.U),
	URLSearch = ZED.URLBuild(URLDomain,'search?query=',Util.U);

	return ZED.ReduceToObject
	(
		KeySite.Name,Name + SubName,
		KeySite.Judge,Judge,
		KeySite.Map,[ZED.ReduceToObject
		(
			KeySite.Name,L(Lang.Video),
			KeySite.Judge,[/^([\da-z]+)$/,Util.MakeLabelWord('videos?','[\\da-z]+')],
			KeySite.Page,function(ID)
			{
				return Util.RequestBody(URLVideo(ID)).map(function(Q)
				{
					/player/.test(Q) || ZED.Throw(L(Lang.Bad))

					return ZED.ReduceToObject
					(
						KeySite.Pages,1,
						KeySite.Total,1,
						KeySite.Item,[ZED.ReduceToObject
						(
							KeySite.Index,0,
							KeySite.ID,ID,
							KeySite.Img,Util.MF(/poster="([^"]+)/,Q),
							KeySite.Title,Util.DecodeHTML(Util.MF(/title">([^<]+)/,Q)),
							KeySite.Author,Util.DecodeHTML(Util.MF(/username">([^<]+)/,Q)),
							KeySite.AuthorLink,URLUserPrefix + Util.MF(/users\/([^"]+)/,Q),
							KeySite.Date,Util.MU(/\d{4}(?:-\d\d)+ \d\d:\d\d/,Q)
						)]
					)
				})
			}
		),ZED.ReduceToObject
		(
			KeySite.Name,L(Lang.User),
			KeySite.Judge,[Util.MakeLabelWord('users?','[^\\s\/]+')],
			KeySite.Page,function(ID,X)
			{
				return Util.RequestBody(URLUser(ID,--X)).map(function(Q,R)
				{
					R = []
					Util.ML(/id="node[^]+?username[^<]+/g,Q,function(Q)
					{
						R.push(ZED.ReduceToObject
						(
							KeySite.Index,PageSize * X + R.length,
							KeySite.ID,Util.MF(/videos\/([^"]+)/,Q),
							KeySite.Img,Util.MF(/src="([^"]+)/,Q),
							KeySite.Title,Util.DecodeHTML(Util.MF(/alt="([^"]+)/,Q)),
							KeySite.Author,Util.DecodeHTML(Util.MF(/username">([^<]+)/,Q)),
							KeySite.AuthorLink,URLUserPrefix + Util.MF(/users\/([^"]+)/,Q)
						))
					})
					return ZED.ReduceToObject
					(
						KeySite.Pages,1 + (Number(Util.MF(/last"[^?]+\?page=(\d+)/,Q)) || 0),
						KeySite.Total,'~' + PageSize * (1 + X),
						KeySite.Item,R
					)
				})
			}
		),ZED.ReduceToObject
		(
			KeySite.Name,L(Lang.Search),
			KeySite.Judge,Util.RSearch,
			KeySite.Page,function(ID,X)
			{
				return Util.RequestBody(URLSearch(encodeURIComponent(ID),X)).map(function(Q,R)
				{
					R = []
					Util.ML(/id="node[^<]+<[^"]+"row[^]+?heart/g,Q,function(Q)
					{
						R.push(ZED.ReduceToObject
						(
							KeySite.Index,R.length,
							KeySite.ID,Util.MF(/videos\/([^"\/]+)"/,Q),
							KeySite.Img,Util.MF(/src="([^"]+)/,Q),
							KeySite.Title,Util.DecodeHTML(Util.MF(/title">[^>]+?>([^<]+)/,Q)),
							KeySite.Author,Util.DecodeHTML(Util.MF(/username">([^<]+)/,Q)),
							KeySite.AuthorLink,URLUserPrefix + Util.MF(/users\/([^"]+)/,Q),
							KeySite.Date,Util.MU(/\d{4}(?:-\d\d)+ \d\d:\d\d/,Q)
						))
					})

					return ZED.ReduceToObject
					(
						KeySite.Pages,1 + (Number(Util.MF(/last"[^?]+\?page=(\d+)/,Q)) || 0),
						KeySite.Total,R.length,
						KeySite.Item,R
					)
				})
			}
		)],
		KeySite.URL,function(ID)
		{
			return Util.RequestBody(URLVideo(ID)).flatMap(function(Q)
			{
				return Util.RequestBody(URLVInfoURL(ID)).map(function(U,T)
				{
					U = ZED.JTO(U)[0]
					T = Util.MF(/file=.*?%2F(\d{10,})(?:[\da-z]{5})?_/,U.uri)

					return ZED.ReduceToObject
					(
						KeyQueue.Author,Util.DecodeHTML(Util.MF(/username">([^<]+)/,Q)),
						KeyQueue.Date,ZED.now(new Date(T ? 1000 * T : Util.MU(/\d{4}(?:-\d\d)+ \d\d:\d\d/,Q))),
						KeyQueue.Part,[ZED.ReduceToObject
						(
							KeyQueue.URL,[U.uri],
							KeyQueue.Suffix,'.' + (U.mime && U.mime.replace(/^[^\/]+\//,'') || 'mp4')
						)]
					)
				})
			})
		},
		KeySite.IDView,ZED.identity,
		KeySite.IDLink,URLVideo,
		KeySite.Pack,ZED.identity
	)
}