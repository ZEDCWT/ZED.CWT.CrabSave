'use strict'
var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Util = require('../Util'),
Key = require('../Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Lang = require('../Lang'),
L = Lang.L,
Component = require('../Component'),

Name = 'ToonsTV',
PageSize = 30,

URLDomain = 'https://www.toons.tv/',
URLChannel = ZED.URLBuild(URLDomain,'channels/',Util.U),
URLDownload = ZED.URLBuild(Util.U,Util.U,'_MP4_1280x720_2000_',Util.U,'.mp4'),

FrameTool,
FrameRepeater = ZED.Repeater(),
Video,

Extract = Q => ZED.JTO(Util.MF(/bundled-json">([^<]+)/,Q)).dataView,
FitQulity = Q => ZED.find(ZED.pipe(ZED.prop('width'),ZED.lt(300)),Q).url,
FindDate = (Q,V) => ZED.find
(
	ZED.pipe(ZED.prop('title'),ZED.identical(V.title)),
	Q.videos
).publicationTime,
Compare = ZED.comparator((Q,S) => Q < S),

R = ZED.ReduceToObject
(
	KeySite.Name,Name,
	KeySite.Judge,/\.toons\./i,
	KeySite.Frame,Reg => FrameTool = Reg(ZED.noop,W =>
	{
		Video = W.M
		if (ZED.isArray(Video)) FrameRepeater.finish()
		else
		{
			Video = Util.F
			FrameRepeater.error(L(Lang.Bad))
		}
	},Component.Data(Name)),
	KeySite.Component,(Say,Len) =>
	(
		Say(Util.ReplaceLang(Lang.LoadScr,L(Lang.HP))),
		Util.RequestBody(URLDomain)
			.map(Extract)
			.pluck('allChannels')
			.tap(Q => Say(Util.ReplaceLang(Lang.ToonsSub,Len = Q.length)))
			.flatMap(ZED.identity)
			.flatMapOnline(1,Q => Util.RequestBody(URLChannel(Q.id)).retry())
			.map(Extract)
			.map((Q,F) =>
			(
				Q = Q.activeChannel,
				Say(`${Util.PadTo(Len,F)} / ${Len}, ${Q.title}`),
				ZED.each(V =>
				{
					ZED.delete_('contentType',V)
					V.c = Q.title
					V.id = Q.id + '/' + V.id
					V.thumbnails = FitQulity(V.thumbnails)
				},Q.videos)
			))
			.reduce((D,V) => D.concat(V))
			.flatMap((Q,M) =>
			(
				M = ZED.reduce((D,V) => {D[V.id] = Util.T},{},Q),
				Video && ZED.each(V => M[V.id] || Q.push(V),Video),
				Q = Q.sort((Q,S) => Q.publicationTime === S.publicationTime ?
					Compare(Q.id,S.id) :
					S.publicationTime - Q.publicationTime),
				Say(Util.ReplaceLang(Lang.ToonsNew,Video ? Q.length - Video.length : Q.length)),
				Say(L(Lang.FileWrite)),
				Util.writeFile(FrameTool[0],'M=' + ZED.OTJ(Q,{UTF : Util.T}))
			))
			.flatMap(() =>
			(
				Component.Save(ZED.objOf(Name,9)),
				FrameRepeater = ZED.Repeater(),
				FrameTool[1](),
				FrameRepeater
			))
	),
	KeySite.ComCheck,() => Video ?
		Observable.empty() :
		Observable.throw(L(Lang.ComNot)),
	KeySite.Map,[ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Video),
		KeySite.Judge,[/channels\/([\dA-Z_]+\/[\dA-Z_]+)/i,/^([\dA-Z_]+\/[\dA-Z_]+)$/i],
		KeySite.Page,ID => Util.RequestBody(URLChannel(ID))
			.map(Extract)
			.map((Q,V) =>
			(
				V = Q.activeVideo,
				Q = Q.activeChannel,
				ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,1,
					KeySite.Item,[ZED.ReduceToObject
					(
						KeySite.ID,ID,
						KeySite.Img,FitQulity(V.thumbnails),
						KeySite.Title,V.title,
						KeySite.Author,Q.title,
						KeySite.AuthorLink,URLChannel(ID.split('/')[0]),
						KeySite.Date,FindDate(Q,V)
					)]
				)
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.Channel),
		KeySite.Judge,[/channels\/([\dA-Z_]+)/i,/^([\dA-Z_]+)$/i],
		KeySite.Page,ID => Util.RequestBody(URLChannel(ID))
			.map(Extract)
			.map(Q =>
			(
				Q = Q.activeChannel,
				ZED.ReduceToObject
				(
					KeySite.Pages,1,
					KeySite.Total,Q.videos.length,
					KeySite.Item,ZED.map(V => ZED.ReduceToObject
					(
						KeySite.ID,Q.id + '/' + V.id,
						KeySite.Img,FitQulity(V.thumbnails),
						KeySite.Title,V.title,
						KeySite.Author,Q.title,
						KeySite.AuthorLink,URLChannel(Q.id),
						KeySite.Date,V.publicationTime
					),Q.videos)
				)
			))
	),ZED.ReduceToObject
	(
		KeySite.Name,L(Lang.All),
		KeySite.Judge,[/^$/],
		KeySite.Page,(_,X) =>
		{
			var
			R = [],
			O,T,F;

			if (Video)
			{
				F = PageSize * (X - 1)
				T = ZED.min(PageSize + F,Video.length)
				for (;F < T;++F)
				{
					O = Video[F]
					R.push(ZED.ReduceToObject
					(
						KeySite.Index,F,
						KeySite.ID,O.id,
						KeySite.Img,O.thumbnails,
						KeySite.Title,O.title,
						KeySite.Author,O.c,
						KeySite.AuthorLink,URLChannel(O.id.split('/')[0]),
						KeySite.Date,O.publicationTime
					))
				}
				return Observable.just(ZED.ReduceToObject
				(
					KeySite.Pages,Math.ceil(Video.length / PageSize),
					KeySite.Total,Video.length,
					KeySite.Item,R
				))
			}
			else return Observable.throw(L(Lang.ComNot))
		}
	)],
	KeySite.URL,ID => Util.RequestBody(URLChannel(ID))
		.map(Extract)
		.map((Q,V,J,T) =>
		(
			V = Q.activeVideo,
			Q = Q.activeChannel,
			T = ZED.find(ZED.T,V.renditions),
			T || ZED.Throw(L(Lang.NoURL)),
			T = ZED.match(/^(.*\/)([^_]+).*_([^_]+)\..*$/,T.url),
			ZED.ReduceToObject
			(
				KeyQueue.Title,V.episodeNumber ? ZED.FillLeft(V.episodeNumber,2) + '.' + V.title : V.title,
				KeyQueue.Author,Name + '.' + Q.title,
				KeyQueue.Date,FindDate(Q,V),
				KeyQueue.Part,[ZED.ReduceToObject
				(
					KeyQueue.URL,[URLDownload(T[1],T[2],T[3])],
					KeyQueue.Suffix,'.mp4'
				)]
			)
		)),
	KeySite.IDView,ZED.identity,
	KeySite.IDLink,URLChannel,
	KeySite.Pack,ZED.identity
);

module.exports = R