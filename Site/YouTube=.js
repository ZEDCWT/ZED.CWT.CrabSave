'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

YouTube = 'https://www.youtube.com/',
YouTubeWatch = WW.Tmpl(YouTube,'watch?v=',undefined),
YouTubeGetVideoInfo = WW.Tmpl('https://www.youtube.com/get_video_info?video_id=',undefined,'&eurl=',undefined,'&el=detailpage'),
GoogleAPIKey = 'AIzaSyA_ltEFFYL4E_rOBYkQtA8aKHnL5QR_uMA',
GoogleAPI = 'https://www.googleapis.com/',
GoogleAPIYouTube = GoogleAPI + 'youtube/v3/',
GoogleAPIYouTubeVideo = WW.Tmpl(GoogleAPIYouTube,'videos?key=',GoogleAPIKey,'&part=',undefined,'&id=',undefined);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	TransformParse = WX.CacheL(Q => WN.ReqB(O.Req(WN.JoinU(YouTube,Q)))
		.Map(B =>
		{
			var
			Process = WW.MU(/.split\(""[^{}]+.join\(""/,B),
			Method = WW.MU(RegExp(`${WW.MU(/\w+(?=\.)/,Process)}={[^]*?}}`),B),
			Map = WW.MR((D,V) =>
			{
				D[V[1]] = /rev/.test(V) ? Q => Q.reverse() :
					/spl/.test(V) ? (Q,S) => Q.splice(0,S) :
					(Q,S) => [Q[0],Q[S % Q.length]] = [Q[S % Q.length],Q[0]]
				return D
			},{},/(\w+):(.*?})/g,Method),
			R = Q => Process.forEach(([V,B]) => Map[V] && Map[V](Q,B),Q = [...Q]) || Q.join``;
			Process = WW.MR((D,V) => D.push([V[1],+V[2]]) && D,[],/\.(\w+)[^)]+?(\d+)/g,Process)
			return R
		})),
	TransformSolve = Q => WN.ReqB(O.Req(Q))
		.FMap(B => TransformParse(WC.JTO(WW.MF(/assets"[^}]+js":("[^"]+")/,B))))
		.ErrAs(() => WX.Just(WR.Id));
	return {
		URL : ID => WN.ReqB(O.Req(GoogleAPIYouTubeVideo('snippet',ID))).FMap(Info =>
		{
			Info = WC.JTO(Info)
			Info.error && O.Bad('#' + (Info.code || Info.error.code) + ' ' + WC.OTJ(Info.error))
			Info = Info.items[0].snippet
			return WN.ReqB(O.Coke(YouTubeGetVideoInfo(ID,WC.UE(YouTubeWatch(ID)))))
				.FMap(B =>
				{
					var
					SortBest = Q => Q.sort((Q,S) => S.width * S.height - Q.width * Q.height ||
						S.bitrate - Q.bitrate),
					SolveURL = (H,Q,X) =>
					{
						Q = Q.filter(V => WR.StartW(H,V.mimeType))
						Q[0] || O.Bad(B)
						Q = Q[0]
						Size.push(+Q.contentLength || null)
						Ext.push(WW.MF(/\/(\w+)/,Q.mimeType) + (X || ''))
						URL.push(Q.cipher ? WC.QSP(Q.cipher) : Q.url)
					},
					URL = [],Size = [],Ext = [],
					T;
					B = WC.QSP(B)
					B.player_response || O.Bad(B)
					B = WC.JTO(B.player_response).streamingData
					if ((T = B.adaptiveFormats) && T.length)
					{
						T = SortBest(T)
						SolveURL('video',T)
						SolveURL('audio',T,'.mp3')
					}
					else if ((T = B.formats) && T.length)
					{
						T = SortBest(T)
						SolveURL('video',T)
					}
					else O.Bad(B)
					return (WR.Any(WW.IsObj,URL) ?
						TransformSolve(YouTubeWatch(ID)).Map(H => URL.map(V =>
							WW.IsObj(V) ? `${V.url}&${V.sp}=${H(V.s)}` : V)) :
						WX.Just(URL)).Map(URL => (
						{
							Title : Info.title,
							Up : Info.channelTitle,
							Date : +new Date(Info.publishedAt),
							Part : [{URL,Size,Ext}]
						}))
				})
		})
	}
}