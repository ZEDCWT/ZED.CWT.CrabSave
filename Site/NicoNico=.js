'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

Nico = 'https://www.nicovideo.jp/',
NicoWatch = WW.Tmpl(Nico,'watch/sm',undefined),
NicoWatchPC = WW.Tmpl(Nico,'watch/sm',undefined,'?mode=pc_html5&playlist_token=',undefined),
NicoDMCApi = 'https://api.dmc.nico/api/sessions?_format=json',

NicoHistory = '';

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	return {
		URL : ID => WN.ReqB(O.Coke(NicoWatch(ID)))
			.FMap(B =>
			(
				B = O.Coke(NicoWatchPC(ID,WW.MF(/playlistToken&quot;:&quot;([^&]+)/,B))),
				B.headers.Cookie = NicoHistory + '; ' + B.headers.Cookie,
				WN.ReqU(B)
			))
			.FMap(([H,B],S) =>
			{
				WR.Each(
					V => {/^nicohistory=/.test(V) && (NicoHistory = V.split('; ')[0])},
					H.headers['set-cookie'])
				B = WC.JTO(B)
				200 === B.status_code || O.Bad(B)
				return ((H = B.video.dmcInfo) ?
					WN.ReqB(O.Req(
					{
						url : NicoDMCApi,
						method : 'post',
						form : WC.OTJ(
						{
							session :
							{
								recipe_id : (S = H.session_api).recipe_id,
								content_id : S.content_id,
								content_type : 'movie',
								content_src_id_sets : [
								{
									content_src_ids : [
									{
										src_id_to_mux :
										{
											video_src_ids : [O.Best('bitrate',WR.Where(V => V.available,H.quality.videos)).id],
											audio_src_ids : [O.Best('bitrate',WR.Where(V => V.available,H.quality.audios)).id]
										}
									}]
								}],
								timing_constraint : 'unlimited',
								keep_method : {heartbeat : {lifetime : S.heartbeat_lifetime}},
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
													file_extension : 'flv',
													use_well_known_port : 'no'
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
										token : S.token,
										signature : S.signature
									}
								},
								content_auth :
								{
									auth_type : S.auth_types.hls,
									content_key_timeout : S.content_key_timeout,
									service_id : WC.JTO(S.token).service_id,
									service_user_id : S.service_user_id
								},
								client_info : {player_id : S.player_id},
								priority : S.priority
							}
						})
					})).Map(B =>
					(
						B = WC.JTO(B),
						B.data || O.Bad(B),
						B.data.session.content_uri
					)) :
					WX.Just(B.video.smileInfo.url))
					.Map(U => (
					{
						Title : B.video.title,
						Up : B.owner.nickname.replace(/ さん$/,''), // 敬稱略
						Date : +new Date(B.video.postedDateTime + '+0900'),
						Part : [
						{
							URL : [U],
							Ext : '.flv'
						}]
					}))
			}),
		Pack : Q => (
		{
			url : Q,
			headers : {Cookie : NicoHistory}
		})
	}
}