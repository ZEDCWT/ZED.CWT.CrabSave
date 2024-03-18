'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
Crypto = require('crypto'),

PrefixSeiga = 'im',
PrefixMangaEpisode = 'mg',
PrefixVideoLike = new Set(
[
	'sm',
	'ch', // Channel
	'nm', // Movie Maker
	'so', // Channel
]),

Nico = 'https://www.nicovideo.jp/',
// NicoWatch = WW.Tmpl(Nico,'watch/',undefined),
NicoAPI = Nico + 'api/',
NicoAPIWatch = WW.Tmpl(NicoAPI,'watch/v3/',undefined),
NicoExt = 'https://ext.nicovideo.jp/',
NicoExtThumb = WW.Tmpl(NicoExt,'api/getthumbinfo/',undefined),
NicoNVAPI = 'https://nvapi.nicovideo.jp/',
NicoNVAPIWatchHLS = WW.Tmpl(NicoNVAPI,'v1/watch/',undefined,'/access-rights/hls'),
NicoDMCAPI = 'https://api.dmc.nico/api/sessions?_format=json',

NicoSeiga = 'https://seiga.nicovideo.jp/',
NicoSeigaSeiga = WW.Tmpl(NicoSeiga,'seiga/',undefined),
NicoSeigaSource = WW.Tmpl(NicoSeiga,'image/source/',undefined),
NicoSeigaAPI = NicoSeiga + 'api/',
NicoSeigaAPIIllust = WW.Tmpl(NicoSeigaAPI,'illust/info?id=',undefined),
NicoSeigaAPIMangaEpisodeInfo = WW.Tmpl(NicoSeigaAPI,'theme/info?id=',undefined),
NicoSeigaAPIMangaEpisodeDetail = WW.Tmpl(NicoSeigaAPI,'theme/data?theme_id=',undefined),
NicoSeigaAPIMangaInfo = WW.Tmpl(NicoSeigaAPI,'manga/info?id=',undefined),
// NicoMangaAPI = 'https://api.nicomanga.jp/',
// NicoMangaAPIEpisodeFrame = WW.Tmpl(NicoMangaAPI,'api/v1/manga/episodes/',undefined,'/frames'),

// watch_app.js
NicoScriptInfo =
{
	ID : 6,
	Ver : 0,
};

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	PadSM = Q => /^\d/.test(Q) ? 'sm' + Q : Q,
	SolveXMLField = (Q,B) => WC.HED(WW.MF(RegExp(`<${Q}>([^]+?)</${Q}>`),B)),
	SolveXMLDesc = B => O.Text(SolveXMLField('description',B)),

	Common = B =>
	{
		B = WC.JTO(B)
		B.meta.errorCode && O.Bad(B)
		return B.data
	},

	Coke = Q =>
	{
		Q = O.Coke(Q)
		Q.Head.Cookie += '; watch_flash=0; skip_fetish_warning=1; webp_supported=true'
		return Q
	},
	CokeDomandROI = new Set(['domand_bid']),
	CokeDomandCurrent = {},
	CokeDomand = Q => O.Req(WN.ReqOH(Q,'Cookie',WC.CokeS(CokeDomandCurrent,WR.Id))),

	CMFPathRX = /^(.*?\/)([^/?]+)(\?.+)$/,
	CMFInitCache = new Map,
	CMFInitSolve = (Q,S) =>
	{
		Q = Q.replace(CMFPathRX,`$1${S}$3`)
		return CMFInitCache.has(Q) ?
		(
			Q = CMFInitCache.get(Q),
			Q[1].D(),
			WX.Just(Q[0])
		) : WN.ReqB(CokeDomand({URL : Q,Enc : false})).Tap(B =>
		{
			CMFInitCache.set(Q,
			[
				B,
				WW.TOD(6E4,() => CMFInitCache.delete(Q))
			])
		})
	};
	return {
		URL : (Q,Ext) =>
		{
			var
			Prefix,ID,
			SourceList = [],
			SourceMake = (D,V,F = D.length) =>
			{
				D.push('')
				SourceList.push(Ext.ReqH(Coke({URL : V,Red : 0}))
					.FMap(H => /^\w+:\/\/[^/]+\/priv\//.test(H = H.H.location) ?
						WX.Just(H) :
						Ext.ReqB(Coke(H)).Map(B => WW.MF(/data-src="([^"]+)/,B)))
					.Map(B => D[F] = B))
			},
			SourceSolve = R => WX.From(SourceList)
				.FMapE(V => V)
				.Fin()
				.Map(() => R);
			Q = PadSM(Q)
			ID = /^([A-Z]+)(\d+)$/i.exec(Q)
			ID || WW.Throw('Bad ID ' + Q)
			Prefix = ID[1]
			ID = ID[2]

			if (PrefixSeiga === Prefix) return Ext.ReqB(Coke(NicoSeigaAPIIllust(ID))).FMap(Illust =>
				Ext.ReqB(Coke(NicoSeigaSeiga(Q))).FMap(Page =>
				{
					var
					Source = WW.MF(/<a[^>]+href="([^"]+)"[^>]+id="illust_link/,Page),
					U = [];
					Source || WW.Throw('Failed to solve source image')
					SourceMake(U,WN.JoinU(NicoSeiga,Source))
					return SourceSolve(
					{
						Title : SolveXMLField('title',Illust),
						UP : WC.HED(WW.MF(/"user_name"[^]+?<strong>([^<]+)</,Page)),
						Date : SolveXMLField('created',Illust) + '+0900',
						Meta : SolveXMLDesc(Illust),
						Part : [
						{
							URL : U,
							Ext : /id="gif_play_button"/.test(Page) ? '.gif' : '.jpg',
						}]
					})
				}))

			if (PrefixMangaEpisode === Prefix) return Ext.ReqB(Coke(NicoSeigaAPIMangaEpisodeInfo(ID))).FMap(Episode =>
				Ext.ReqB(Coke(NicoSeigaAPIMangaInfo(SolveXMLField('content_id',Episode)))).FMap(Manga =>
					Ext.ReqB(Coke(NicoSeigaAPIMangaEpisodeDetail(ID))).FMap(B =>
					{
						var
						Img,
						BGM = [],BGMSet = new Set,
						SE = [],SESet = new Set,
						Part;
						// 74015 | With both BGM & SE
						Img = WW.MR((D,V) =>
						{
							var
							U = SolveXMLField('source_url',V),
							T;
							if (T = SolveXMLField('bgm_path',V))
							{
								T = WN.JoinU(U,T)
								BGMSet.size < BGMSet.add(T).size &&
									BGM.push(T)
							}
							if (T = SolveXMLField('se_path',V))
							{
								T = WN.JoinU(U,T)
								SESet.size < SESet.add(T).size &&
									SE.push(T)
							}
							SourceMake(D,NicoSeigaSource(SolveXMLField('id',V)))
							return D
						},[],/<image>[^]+?<\/image>/g,B)
						Part = WR.MapW(V => V[0].length ?
						{
							Title : V[2],
							URL : V[0],
							ExtDefault : V[1],
						} : null,
						[
							[Img,'.jpg'],
							[BGM,'.mp3','BGM'],
							[SE,'.mp3','SE'],
						])
						return SourceSolve(
						{
							Title : SolveXMLField('title',Manga) + '.' +
								SolveXMLField('episode_title',Episode),
							UP : SolveXMLField('author_name',Manga),
							Date : SolveXMLField('created',Episode),
							Meta : SolveXMLDesc(Episode),
							Part,
						})
					})))

			PrefixVideoLike.has(Prefix) || WW.Throw('Unexpected Prefix ' + Prefix)

			return Ext.ReqB(Coke(
			{
				URL : NicoAPIWatch(Q),
				QS :
				{
					_frontendId : NicoScriptInfo.ID,
					_frontendVersion : NicoScriptInfo.Ver,
					actionTrackId : 'O_0',
					additionals : 'pcWatchPage,external,marquee,series',
				}
			})).FMap(B =>
			{
				var
				B = Common(B),
				UP = B.owner ? B.owner.nickname :
					B.channel && B.channel.name,
				Media = B.media,
				MediaDelivery = Media.delivery,
				MediaDomand = Media.domand,
				Part = [],
				MediaReq = [];

				if (MediaDelivery)
				{
					MediaDelivery = MediaDelivery.movie
					MediaDelivery || WW.Throw('No provided url, requires payment?')
					MediaReq.push(Ext.ReqB(O.Req(
					{
						URL : NicoDMCAPI,
						JSON :
						{
							session :
							{
								recipe_id : MediaDelivery.session.recipeId,
								content_id : MediaDelivery.session.contentId,
								content_type : 'movie',
								content_src_id_sets : [
								{
									content_src_ids : [
									{
										src_id_to_mux :
										{
											video_src_ids : [O.Best(['metadata','bitrate'],WR.Where(V => V.isAvailable,MediaDelivery.videos)).id],
											audio_src_ids : [O.Best(['metadata','bitrate'],WR.Where(V => V.isAvailable,MediaDelivery.audios)).id]
										}
									}]
								}],
								timing_constraint : 'unlimited',
								keep_method : {heartbeat : {lifetime : MediaDelivery.session.heartbeatLifetime}},
								protocol :
								{
									name : 'http',
									parameters :
									{
										http_parameters :
										{
											parameters :
											{
												http_output_download_parameters :
												{
													use_ssl : 'yes',
													file_extension : 'flv',
													use_well_known_port : 'yes'
												}
											}
										}
									}
								},
								content_uri : '',
								session_operation_auth :
								{
									session_operation_auth_by_signature :
									{
										token : MediaDelivery.session.token,
										signature : MediaDelivery.session.signature
									}
								},
								content_auth :
								{
									auth_type : MediaDelivery.session.authTypes.http,
									content_key_timeout : MediaDelivery.session.contentKeyTimeout,
									service_id : WC.JTO(MediaDelivery.session.token).service_id,
									service_user_id : MediaDelivery.session.serviceUserId
								},
								client_info : {player_id : MediaDelivery.session.playerId},
								priority : MediaDelivery.session.priority
							}
						}
					})).Map(B =>
					{
						Part.push(
						{
							URL : [Common(B).session.content_uri],
							Ext : '.flv'
						})
					}))
				}
				else if (MediaDomand)
				{
					/*
						It is fucking hilarious that there are actually some M3U8 maniacs read the damnable specification
						Having the requirements to separate audio track alreay, why not just use the brilliant DASH
						Also why bother saving few bytes by using the never-seen-to-be-used header `X-MAP`
					*/
					MediaReq.push(Ext.ReqU(Coke(
					{
						URL : NicoNVAPIWatchHLS(Q),
						QS :
						{
							actionTrackId : B.videoAds.additionalParams.watchTrackId,
						},
						Head :
						{
							'X-Access-Right-Key' : MediaDomand.accessRightKey,
							'X-Frontend-Id' : NicoScriptInfo.ID,
							'X-Frontend-Version' : NicoScriptInfo.Ver,
							'X-Request-With' : Nico,
						},
						JSON :
						{
							outputs : MediaDomand.videos.map(V =>
							[
								V.id,
								O.Best('qualityLevel',MediaDomand.audios).id,
							])
						}
					})).FMap(([H,B]) =>
					{
						WR.Each(V =>
							WR.EachU((V,F) => {CokeDomandROI.has(F) && (CokeDomandCurrent[F] = V)},WC.CokeP(V,WR.Id)),
							H.H['set-cookie'])
						return Ext.ReqB(CokeDomand(Common(B).contentUrl))
					}).FMap(M3U =>
					{
						var
						Sub = [],
						T;
						M3U = WC.M3U(M3U)

						T = M3U['STREAM-INF']
						T = O.Best([0,'BANDWIDTH'],T)
						T || WW.Throw('Unable to solve video')
						Sub.push([T[1],'.mp4'])

						T = M3U.MEDIA[0]
						'AUDIO' === T.TYPE || WW.Throw('Unable to solve audio')
						Sub.push([T.URI,'.mp3'])

						return WX.From(Sub).FMapE(([URL,X]) =>
							Ext.ReqB(CokeDomand(URL)).FMap(List =>
							{
								var
								Init;
								List = WC.M3U(List)
								Init = CMFPathRX.exec(List.MAP.URI)
								return Ext.ReqB(CokeDomand({URL : List.KEY.URI,Enc : 'Base64'})).Map(B =>
								{
									B = WC.B64P(B)
									16 === B.length || WW.Throw('Key is ' + WC.U16S(B))
									B = ' ' + WC.B91S(B) +
										' ' + WC.B91S(List.KEY.IV)
									Part.push(
									{
										URL : List.INF.map(V =>
										{
											var T = CMFPathRX.exec(V = V[1]);
											return T[1] === Init[1] && T[3] === Init[3] ?
												V + ' ' + Init[2] + B :
												WW.Throw('Unhandled M3U Structure')
										}),
										Ext : X,
									})
								})
							}))
					}))
				}
				else WW.Throw('Unsupported Media ' + WC.OTJ(WR.Key(Media).filter(V => Media[V])))

				return (UP ?
					WX.Just(UP) :
					Ext.ReqB(O.Req(NicoExtThumb(Q)))
						.Map(B => WC.HED(WW.MF(/name>([^<]+)/,B))))
					.FMap(UP => WX.From(MediaReq)
						.Online(1)
						.Fin()
						.Map(() => (
						{
							Title : B.video.title,
							UP : UP.replace(/ さん$/,''), // 敬稱略
							Date : B.video.registeredAt,
							Meta : O.Text(B.video.description),
							Cover : B.video.thumbnail.largeUrl,
							CoverExt : '.jpg',
							Part,
						})))
			})
		},
		IDView : PadSM,
		Pack : Q =>
		{
			var
			CMFTask = /^(.+\.cmf[av]\S*) (\S+) (\S+) (\S+)$/.exec(Q);
			if (CMFTask) return CMFInitSolve(CMFTask[1],CMFTask[2]).FMap(Init => WX.P(S =>
			{
				var
				Key = WC.B91P(CMFTask[3]),
				IV = WC.B91P(CMFTask[4]),
				D = Crypto.createDecipheriv('AES-128-CBC',WC.Buff(Key),WC.Buff(IV));
				S.D(Init)
				return WN.Req(CokeDomand(
				{
					URL : CMFTask[1],
					OnD : B => S.D(D.update(B)),
					OnE : () => S.U(D.final()),
				})).On('Err',S.E)
					.End
			}))
			return Q
		},
		Range : false,
	}
}