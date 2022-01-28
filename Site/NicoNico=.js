'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC} = WW,

Nico = 'https://www.nicovideo.jp/',
NicoWatch = WW.Tmpl(Nico,'watch/',undefined),
NicoDMCApi = 'https://api.dmc.nico/api/sessions?_format=json',
NicoExt = 'https://ext.nicovideo.jp/',
NicoExtThumb = WW.Tmpl(NicoExt,'api/getthumbinfo/',undefined);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	PadSM = Q => /^\d/.test(Q) ? 'sm' + Q : Q,
	Coke = Q =>
	{
		Q = O.Coke(Q)
		Q.Head.Cookie += '; watch_flash=0'
		return Q
	};
	return {
		URL : (ID,Ext) => Ext.ReqB(Coke(NicoWatch(PadSM(ID))))
			.FMap(B =>
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
						URL : NicoDMCApi,
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
						Ext.ReqB(O.Req(NicoExtThumb(PadSM(ID))))
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
			}),
		IDView : Q => 'sm' + Q,
	}
}