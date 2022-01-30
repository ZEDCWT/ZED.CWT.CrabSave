'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

PrefixSeiga = 'im',
PrefixMangaEpisode = 'mg',
PrefixVideoLike = new Set(
[
	'sm',
	'ch', // Channel
	'nm', // Movie Maker
]),

Nico = 'https://www.nicovideo.jp/',
NicoWatch = WW.Tmpl(Nico,'watch/',undefined),
NicoDMCAPI = 'https://api.dmc.nico/api/sessions?_format=json',
NicoExt = 'https://ext.nicovideo.jp/',
NicoExtThumb = WW.Tmpl(NicoExt,'api/getthumbinfo/',undefined),
NicoSeiga = 'https://seiga.nicovideo.jp/',
NicoSeigaSeiga = WW.Tmpl(NicoSeiga,'seiga/',undefined),
NicoSeigaSource = WW.Tmpl(NicoSeiga,'image/source/',undefined),
NicoSeigaAPI = NicoSeiga + 'api/',
NicoSeigaAPIIllust = WW.Tmpl(NicoSeigaAPI,'illust/info?id=',undefined),
NicoSeigaAPIMangaEpisodeInfo = WW.Tmpl(NicoSeigaAPI,'theme/info?id=',undefined),
NicoSeigaAPIMangaEpisodeDetail = WW.Tmpl(NicoSeigaAPI,'theme/data?theme_id=',undefined),
NicoSeigaAPIMangaInfo = WW.Tmpl(NicoSeigaAPI,'manga/info?id=',undefined);
// NicoMangaAPI = 'https://api.nicomanga.jp/',
// NicoMangaAPIEpisodeFrame = WW.Tmpl(NicoMangaAPI,'api/v1/manga/episodes/',undefined,'/frames');

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	PadSM = Q => /^\d/.test(Q) ? 'sm' + Q : Q,
	SolveXMLField = (Q,B) => WC.HED(WW.MF(RegExp(`<${Q}>([^]+?)</${Q}>`),B)),
	SolveXMLDesc = B => SolveXMLField('description',B)
		.replace(/<br>\n?/g,'\n'),
	Coke = Q =>
	{
		Q = O.Coke(Q)
		Q.Head.Cookie += '; watch_flash=0; skip_fetish_warning=1; webp_supported=true'
		return Q
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
						Up : WC.HED(WW.MF(/"user_name"[^]+?<strong>([^<]+)</,Page)),
						Date : +new Date(SolveXMLField('created',Illust) + '+0900'),
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
							Up : SolveXMLField('author_name',Manga),
							Date : SolveXMLField('created',Episode),
							Meta : SolveXMLDesc(Episode),
							Part,
						})
					})))

			PrefixVideoLike.has(Prefix) || WW.Throw('Unexpected Prefix ' + Prefix)

			return Ext.ReqB(Coke(NicoWatch(Q))).FMap(B =>
			{
				var
				Up,
				S;
				B = WC.JTO(WC.HED(WW.MF(/api-data="([^"]+)"/,B)))
				S = B.media.delivery.movie
				Up = B.owner ? B.owner.nickname :
					B.channel && B.channel.name
				return (B ?
					Ext.ReqB(O.Req(
					{
						URL : NicoDMCAPI,
						JSON :
						{
							session :
							{
								recipe_id : S.session.recipeId,
								content_id : S.session.contentId,
								content_type : 'movie',
								content_src_id_sets : [
								{
									content_src_ids : [
									{
										src_id_to_mux :
										{
											video_src_ids : [O.Best(['metadata','bitrate'],WR.Where(V => V.isAvailable,S.videos)).id],
											audio_src_ids : [O.Best(['metadata','bitrate'],WR.Where(V => V.isAvailable,S.audios)).id]
										}
									}]
								}],
								timing_constraint : 'unlimited',
								keep_method : {heartbeat : {lifetime : S.session.heartbeatLifetime}},
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
										token : S.session.token,
										signature : S.session.signature
									}
								},
								content_auth :
								{
									auth_type : S.session.authTypes.http,
									content_key_timeout : S.session.contentKeyTimeout,
									service_id : WC.JTO(S.session.token).service_id,
									service_user_id : S.session.serviceUserId
								},
								client_info : {player_id : S.session.playerId},
								priority : S.session.priority
							}
						}
					})).Map(B =>
					(
						B = WC.JTO(B),
						B.data || O.Bad(B),
						B.data.session.content_uri
					)) :
					WW.Throw('No provided url, requires payment?'))
					.FMap(U => (Up ?
						WX.Just(Up) :
						Ext.ReqB(O.Req(NicoExtThumb(Q)))
							.Map(B => WC.HED(WW.MF(/name>([^<]+)/,B))))
						.Map(Up => (
						{
							Title : B.video.title,
							Up : Up.replace(/ さん$/,''), // 敬稱略
							Date : +new Date(B.video.registeredAt),
							Meta : B.video.description,
							Cover : B.video.thumbnail.largeUrl,
							CoverExt : '.jpg',
							Part : [
							{
								URL : [U],
								Ext : '.flv'
							}]
						})))
			})
		},
		IDView : PadSM,
		Range : false,
	}
}