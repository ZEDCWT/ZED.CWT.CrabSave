'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

YouTube = 'https://www.youtube.com/',
YouTubeWatch = WW.Tmpl(YouTube,'watch?v=',undefined),
YouTubeIPlayer = WW.Tmpl(YouTube,'youtubei/v1/player?key=',undefined),
// Example : B91P('?wmH{<|dG6`BhE')
YouTubeGetWithBPCTR = WW.Tmpl(YouTube,'watch?v=',undefined,'&bpctr=',undefined,'&pbj=1'),
GoogleAPIKey = '#GoogleAPIKey#',
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
			Method = WW.MU(RegExp(`${WW.MU(/\w+(?=\.)/,Process)}={([^{}]+{[^{}]+})+?}`),B),
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
	TransformSolve = Q => WX.Just(Q)
		.FMap(B => TransformParse
		(
			WW.MF(/"([/\w]+player_ias[^"]+base.js)"/,B) ||
			WC.JTO(WW.MF(/assets"[^}]+js":("[^"]+")/,B))
		))
		.ErrAs(() => WX.Just(WR.Id));
	return {
		URL : ID => WN.ReqB(O.Req(GoogleAPIYouTubeVideo('snippet',ID))).FMap(Info =>
		{
			Info = WC.JTO(Info)
			Info.error && O.Bad('#' + (Info.code || Info.error.code) + ' ' + WC.OTJ(Info.error))
			Info = Info.items[0].snippet
			return WN.ReqB(O.Coke(YouTubeWatch(ID))).FMap(Watch =>
			{
				var
				IDToken = WC.JTO(WW.MF(/ID_TOKEN":("[^"]+")/,Watch)),
				APIKey = WC.JTO(WW.MF(/API_KEY":("[^"]+")/,Watch)),
				ClientName = WC.JTO(WW.MF(/CLIENT_NAME":("[^"]+")/,Watch)),
				ClientVersion = WC.JTO(WW.MF(/CLIENT_VERSION":("[^"]+")/,Watch)),
				SigTS = WC.JTO(WW.MF(/"STS":(\d+)/,Watch)),
				MakeI = (URL,Req,Now = WR.Floor(WW.Now() / 1E3)) => WN.ReqB(O.Coke(
				{
					URL : URL,
					Head :
					{
						Authorization : 'SAPISIDHASH ' +
							Now + '_' +
							WR.Low(WC.HEXS(WC.SHA1(
							[
								Now,
								WC.CokeP(O.CokeRaw()).SAPISID,
								YouTube.slice(0,-1)
							].join(' ')))),
						Origin : YouTube.slice(0,-1),
					},
					JSON :
					{
						context :
						{
							client :
							{
								clientName : ClientName,
								clientVersion : ClientVersion,
							},
							request :
							{
								useSsl : true,
							},
						},
						...Req
					},
				})),
				MakeWebClient = Target => WN.ReqB(O.Coke(
				{
					URL : Target,
					Head :
					{
						'X-YouTube-Client-Name' : 1,
						'X-YouTube-Client-Version' : ClientVersion,
						'X-YouTube-Identity-Token' : IDToken,
					}
				}));
				return MakeI(YouTubeIPlayer(APIKey),
				{
					videoId : ID,
					playbackContext :
					{
						contentPlaybackContext :
						{
							signatureTimestamp : SigTS,
						},
					},
				}).FMap(B =>
				{
					var
					PlayStat = (B = WC.JTO(B)).playabilityStatus,
					Stat = PlayStat && PlayStat.status;
					return 'CONTENT_CHECK_REQUIRED' === Stat ?
						MakeWebClient(YouTubeGetWithBPCTR(ID,0 | 4E3 + WW.Now() / 1E3)).Map(B =>
						[
							B = WC.JTO(B),
							WR.Reduce((D,V) => D || V.playerResponse,null,B)
						]) :
						Stat && 'OK' !== Stat ?
							O.Bad(WR.Pick(['status','reason'],PlayStat)) :
							WX.Just([B,B])
				}).FMap(B =>
				{
					var
					SortBest = Q => Q.sort((Q,S) => S.width * S.height - Q.width * Q.height ||
						S.bitrate - Q.bitrate),
					SolveURL = (H,Q,X) =>
					{
						Q = Q.filter(V => WR.StartW(H,V.mimeType) && +V.contentLength)
						Q[0] || O.Bad(B)
						Q = Q[0]
						Size.push(+Q.contentLength || null)
						Ext.push('.' + WW.MF(/\/(\w+)/,Q.mimeType) + (X || ''))
						URL.push(
							Q.cipher ? WC.QSP(Q.cipher) :
							Q.signatureCipher ? WC.QSP(Q.signatureCipher) :
							Q.url)
					},
					URL = [],Size = [],Ext = [],
					T;
					B[1] || O.Bad(B[0])
					B = B[1].streamingData
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
						TransformSolve(Watch).Map(H => URL.map(V =>
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
		})
	}
}