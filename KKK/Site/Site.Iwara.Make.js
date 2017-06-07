'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,

Name = 'Iwara',
PageSize = 40,

MakePages = (Q,T) => (T = Util.MF(/ last"[^]+?page=(\d+)/,Q)) ?
	1 + Number(T) :
	Util.MF(/last">(\d+)/,Q) || 1;

module.exports = (Domain,SubName,Judge) =>
{
	var
	URLDomain = 'http://' + Domain + '.iwara.tv/',
	URLVideo = ZED.URLBuild(URLDomain,'videos/',Util.U),
	URLUserPrefix = URLDomain + 'users/',
	URLUser = ZED.URLBuild(URLUserPrefix,Util.U,'/videos?page=',Util.U),
	URLVInfoURL = ZED.URLBuild(URLDomain,'api/video/',Util.U),
	URLVideoAll = ZED.URLBuild(URLDomain,'videos?page=',Util.U,Util.U,Util.U),
	URLSearch = ZED.URLBuild(URLDomain,'search?query=',Util.U,'&page=',Util.U);

	return ZED.ReduceToObject
	(
		KeySite.Name,Name + SubName,
		KeySite.Judge,Judge,
		KeySite.Map,[ZED.ReduceToObject
		(
			KeySite.Name,L(Lang.Video),
			KeySite.Judge,[/^([\da-z]+)$/,Util.MakeLabelWord('videos?','[\\da-z]+')],
			KeySite.Page,ID => Util.RequestBody(URLVideo(ID)).map(Q =>
			(
				/player/.test(Q) || ZED.Throw(L(Lang.Bad)),
				ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.ID,ID,
						KeySite.Img,Util.MF(/poster="([^"]+)/,Q),
						KeySite.Title,Util.DecodeHTML(Util.MF(/title">([^<]+)/,Q)),
						KeySite.Author,Util.DecodeHTML(Util.MF(/username">([^<]+)/,Q)),
						KeySite.AuthorLink,URLUserPrefix + Util.MF(/users\/([^"]+)/,Q),
						KeySite.Date,Util.MU(/\d{4}(?:-\d\d)+ \d\d:\d\d/,Q)
					)]
				)
			))
		),ZED.ReduceToObject
		(
			KeySite.Name,L(Lang.User),
			KeySite.Judge,[Util.MakeLabelWord('users?','[^\\s\/]+')],
			KeySite.Page,(ID,X) => Util.RequestBody(URLUser(ID,--X))
				.map(Q => ZED.ReduceToObject
				(
					KeySite.Pages,1 + (Number(Util.MF(/last"[^?]+\?page=(\d+)/,Q)) || 0),
					KeySite.Total,'~' + PageSize * (1 + X),
					KeySite.PageSize,PageSize,
					KeySite.Item,Util.MA(/id="node[^]+?username[^<]+/g,Q,Q => ZED.ReduceToObject
					(
						KeySite.ID,Util.MF(/videos\/([^"]+)/,Q),
						KeySite.Img,Util.MF(/src="([^"]+)/,Q),
						KeySite.Title,Util.DecodeHTML(Util.MF(/alt="([^"]+)/,Q)),
						KeySite.Author,Util.DecodeHTML(Util.MF(/username">([^<]+)/,Q)),
						KeySite.AuthorLink,URLUserPrefix + Util.MF(/users\/([^"]+)/,Q)
					))
				))
		),ZED.ReduceToObject
		(
			KeySite.Name,L(Lang.All),
			KeySite.Judge,[/^(?:all)?$/i],
			KeySite.Page,(_,X,O) => Util.RequestBody(Util.MakeSearch(URLVideoAll,'',--X,O))
				.map((Q,R) =>
				{
					R = ZED.ReduceToObject
					(
						KeySite.Pages,MakePages(Q),
						KeySite.Total,R.length,
						KeySite.PageSize,36,
						KeySite.Item,Util.MA(/"node-[^]+?username[^<]+/g,Q,Q => ZED.ReduceToObject
						(
							KeySite.ID,Util.MF(/videos\/([^"\/]+)"/,Q),
							KeySite.Img,Util.MF(/src="([^"]+)/,Q),
							KeySite.Title,Util.DecodeHTML(Util.MF(/title">[^>]+?>([^<]+)/,Q)),
							KeySite.Author,Util.DecodeHTML(Util.MF(/username">([^<]+)/,Q)),
							KeySite.AuthorLink,URLUserPrefix + Util.MF(/users\/([^"]+)/,Q)
						))
					)
					if (Q = Util.MU(/list-inline[^]+?<\/ul/,Q))
					{
						R[KeySite.Pref] = [
						[
							Util.MF(/title">([^<]+)/,Q),
							Util.MA(/sort=([^"]+)[^>]+>([^<]+)/g,Q,Q =>
							(
								/trail/.test(Q[0]) && (R[KeySite.PrefDef] = {sort : Q[1]}),
								[Q[2],Q[1]]
							),Util.T),
							'sort'
						]]
					}

					return R
				})
		),ZED.ReduceToObject
		(
			KeySite.Name,L(Lang.Search),
			KeySite.Judge,Util.RSearch,
			KeySite.Page,(ID,X) => Util.RequestBody(URLSearch(encodeURIComponent(ID),--X))
				.map(Q => ZED.ReduceToObject
				(
					KeySite.Pages,MakePages(Q),
					KeySite.Item,Util.MA(/id="node[^<]+<[^"]+"row[^]+?heart/g,Q,Q => ZED.ReduceToObject
					(
						KeySite.ID,Util.MF(/videos\/([^"\/]+)"/,Q),
						KeySite.Img,Util.MF(/src="([^"]+)/,Q),
						KeySite.Title,Util.DecodeHTML(Util.MF(/title">[^>]+?>([^<]+)/,Q)),
						KeySite.Author,Util.DecodeHTML(Util.MF(/username">([^<]+)/,Q)),
						KeySite.AuthorLink,URLUserPrefix + Util.MF(/users\/([^"]+)/,Q),
						KeySite.Date,Util.MU(/\d{4}(?:-\d\d)+ \d\d:\d\d/,Q)
					))
				))
		)],
		KeySite.URL,ID => Util.RequestBody(URLVideo(ID))
			.flatMap(Q => Util.RequestBody(URLVInfoURL(ID)).map((U,T) =>
			(
				U = ZED.JTO(U)[0],
				T = Util.MF(/file=.*?%2F(\d{10,})(?:[\da-z]{5})?_/,U.uri),
				ZED.ReduceToObject
				(
					KeyQueue.Title,Util.DecodeHTML(Util.MF(/title">([^<]+)/,Q)),
					KeyQueue.Author,Util.DecodeHTML(Util.MF(/username">([^<]+)/,Q)),
					KeyQueue.Date,ZED.now(new Date(T ? 1000 * T : Util.MU(/\d{4}(?:-\d\d)+ \d\d:\d\d/,Q))),
					KeyQueue.Part,[ZED.ReduceToObject
					(
						KeyQueue.URL,[U.uri],
						KeyQueue.Suffix,'.' + (U.mime && U.mime.replace(/^[^\/]+\//,'') || 'mp4')
					)]
				)
			))),
		KeySite.IDView,ZED.identity,
		KeySite.IDLink,URLVideo,
		KeySite.Pack,ZED.identity
	)
}