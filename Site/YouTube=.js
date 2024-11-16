'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

YouTube = 'https://www.youtube.com/',
YouTubeWatch = WW.Tmpl(YouTube,'watch?v=',undefined),
YouTubeIPlayer = YouTube + 'youtubei/v1/player?prettyPrint=false',
// Example : B91P('?wmH{<|dG6`BhE')
YouTubeGetWithBPCTR = WW.Tmpl(YouTube,'watch?v=',undefined,'&bpctr=',undefined,'&pbj=1'),
GoogleAPIKey = '~GoogleAPIKey~',
GoogleAPI = 'https://www.googleapis.com/',
GoogleAPIYouTube = GoogleAPI + 'youtube/v3/',
GoogleAPIYouTubeVideo = WW.Tmpl(GoogleAPIYouTube,'videos?prettyPrint=false&key=',GoogleAPIKey,'&part=',undefined,'&id=',undefined);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	Client =
	{
		IDToken : null,
		APIKey : null,
		Name : null,
		Version : null,
		SigTS : null,
		BaseScript : null,
	},
	ClientLast,
	ClientValid = () => null != ClientLast && WW.Now() < 4 * 36E5 + ClientLast,
	TransformParseExt,
	TransformParse = WX.CacheL(Q => TransformParseExt.ReqB(O.Req(WN.JoinU(YouTube,Q))).Map(B =>
	{
		var
		SProcess = WW.MU(/.split\(""[^{}]+.join\(""/,B),
		SMethod = WW.MU(RegExp('[^.\\w]' + WR.SafeRX(WW.MU(/[$\w]+(?=\.)/,SProcess)) + '={([^{}]+{[^{}]+})+?}'),B),
		SMap = WW.MR((D,V) =>
		{
			D[V[1]] = /rev/.test(V) ? Q => Q.reverse() :
				/spl/.test(V) ? (Q,S) => Q.splice(0,S) :
				(Q,S) => [Q[0],Q[S % Q.length]] = [Q[S % Q.length],Q[0]]
			return D
		},{},/([$\w]+):(.*?})/g,SMethod),
		S = Q => SProcess.forEach(([V,B]) => SMap[V] && SMap[V](Q,B),Q = [...Q]) || Q.join``,
		NProcess = WW.MF(/\.get\(.n.([^]+?)set\(.n./,B) ||
			/([$\w]+)=([$\w]+)\.get\(([^,]+)\W+\1(=[^()]+\()\1\),\2\.set\(\3,\1\)/.exec(B)?.[4] ||
			WW.MF(/[$\w]\.D&&\(([^{}]*?)set/,B),
		NMethod,
		NFunc,
		N = () => WW.Throw('Unable to locate N Method');
		/*
			s/player/b22ef6e7/player_ias.vflset/ja_JP/base.js
			a.D&&(b=String.fromCharCode(110),c=a.get(b))&&(c=IRa[0](c),a.set(b,c)
			s/player/3400486c/player_ias.vflset/ja_JP/base.js
			a.D&&(b="nn"[+a.D],c=a.get(b))&&(c=rDa[0](c),a.set(b,c)
			s/player/d2e656ee/player_ias.vflset/ja_JP/base.js
			a.D&&(JL(a),b=a.j.n||null)&&(b=CDa[0](b),a.set("n",b),CDa.length||Dma(""))
		*/
		if (NProcess)
		{
			NMethod = WW.MF(/=([^(),]+)\(/,NProcess)
			if (NFunc = /([$\w]+)\[/.exec(NMethod))
				NMethod = WW.MF(RegExp(WR.SafeRX(NFunc[1]) + '=\\[([$\\w]+)]'),B)
		}
		else
			NMethod = WW.MF(/^var [$\w]+=\[([$\w]+)];/m,B)
		if (NMethod)
		{
			NFunc = WW.MF(RegExp(WR.SafeRX(NMethod) + '=(function[^]+?\\.join(?:\\.call)?\\([^}]+})'),B)
			N = WN.Evil(`(${NFunc})`)
		}
		SProcess = WW.MR((D,V) => D.push([V[1],+V[2]]) && D,[],/\.([$\w]+)[^)]+?(\d+)/g,SProcess)
		return {S,N}
	}));

	return {
		URL : (ID,Ext) => Ext.ReqB(O.Req(GoogleAPIYouTubeVideo('id,snippet,contentDetails,liveStreamingDetails',ID))).FMap(Info =>
		{
			var
			SolveClientInfo = () => ClientValid() ?
				WX.Just(Client) :
				Ext.ReqB(O.Coke(YouTubeWatch(ID))).Map(Watch =>
				{
					var
					SolveJSONIfPresent = Q =>
					{
						Q = WW.MF(Q,Watch)
						return Q && WC.JTO(Q)
					};
					Client.IDToken = SolveJSONIfPresent(/ID_TOKEN":("[^"]+")/)
					Client.APIKey = SolveJSONIfPresent(/API_KEY":("[^"]+")/)
					Client.Name = SolveJSONIfPresent(/CLIENT_NAME":("[^"]+")/)
					Client.Version = SolveJSONIfPresent(/CLIENT_VERSION":("[^"]+")/)
					Client.SigTS = SolveJSONIfPresent(/"STS":(\d+)/)
					Client.BaseScript = WW.MF(/"([/\w]+player_ias[^"]+base.js)"/,Watch) ||
						WC.JTO(WW.MF(/assets"[^}]+js":("[^"]+")/,Watch))
					ClientLast = WW.Now()
					return Client
				}),

			MakeI = (URL,Req,Now = WR.Floor(WW.Now() / 1E3)) => Ext.ReqB(O.Coke(
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
							clientName : 'MWEB', // Client.Name,
							clientVersion : Client.Version,
						},
						request :
						{
							useSsl : true,
						},
					},
					...Req
				},
			})),
			MakeWebClient = Target => Ext.ReqB(O.Coke(
			{
				URL : Target,
				Head :
				{
					'X-YouTube-Client-Name' : 1,
					'X-YouTube-Client-Version' : Client.Version,
					'X-YouTube-Identity-Token' : Client.IDToken,
				}
			})),

			SolvePlayer = () => WX.TCO((_,I) =>
			{
				var
				Valid = ClientValid();
				return SolveClientInfo()
					.FMap(() => MakeI(YouTubeIPlayer,
					{
						videoId : ID,
						playbackContext :
						{
							contentPlaybackContext :
							{
								signatureTimestamp : Client.SigTS,
							},
						},
					}))
					.ErrAs(E => I < 1 && Valid ? WX.Just([true,ClientLast = null]) : WX.Throw(E))
					.FMap(B =>
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
					})
					.Map(B => [false,B])
			}),

			SolveTransform = () => (TransformParseExt = Ext) && TransformParse(Client.BaseScript)
				.ErrAs(() => WX.Just(
				{
					S : WR.Id,
					N : WR.Id,
				}));

			Info = WC.JTO(Info)
			Info.error && O.Bad('#' + (Info.code || Info.error.code) + ' ' + WC.OTJ(Info.error))
			Info = Info.items[0].snippet

			return SolvePlayer().FMap(B =>
			{
				var
				SortBest = Q => Q.sort((Q,S) => S.width * S.height - Q.width * Q.height ||
					S.bitrate - Q.bitrate),
				SolveURL = (H,Q,X) =>
				{
					Q = Q.filter(V => WR.StartW(H,V.mimeType) && +V.contentLength)[0]
					if (!Q)
						return false
					Size.push(+Q.contentLength || null)
					Ext.push('.' + WW.MF(/\/(\w+)/,Q.mimeType) + (X || ''))
					URL.push(
						Q.cipher ? WC.QSP(Q.cipher) :
						Q.signatureCipher ? WC.QSP(Q.signatureCipher) :
						Q.url)
					return true
				},
				URLValid = false,
				URL = [],Size = [],Ext = [],
				T;
				B[1] || O.Bad(B[0])
				B = B[1].streamingData
				if ((T = B.adaptiveFormats) && T.length)
				{
					T = SortBest(T)
					/*
						OfQP7p8t5AU
						gIRL5pcZNMk
						Missing audio track
					*/
					URLValid = SolveURL('video',T) &&
						SolveURL('audio',T,'.mp3')
				}
				if (!URLValid)
				{
					if ((T = B.formats) && T.length)
					{
						T = SortBest(T)
						SolveURL('video',T)
					}
					else O.Bad(B)
				}
				return SolveTransform().Map(H => (
				{
					Title : Info.title,
					UP : Info.channelTitle,
					Date : Info.publishedAt,
					Meta : Info.description,
					Cover : Info.thumbnails.high.url,
					Part : [
					{
						URL : URL.map(V => (WW.IsObj(V) ? `${V.url}&${V.sp}=${H.S(V.s)}` : V)
							.replace(/(?<=[?&]n=)[^&]+/,N => H.N(N))),
						Size,
						Ext,
					}]
				}))
			})
		}),
		// RefSpeed : 90,
	}
}