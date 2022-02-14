'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	YouTube = 'https://www.youtube.com/',
	YouTubeWatch = WW.Tmpl(YouTube,'watch?v=',undefined),
	YouTubeChannel = WW.Tmpl(YouTube,'channel/',undefined),
	YouTubeCustomURL = WW.Tmpl(YouTube,'c/',undefined),
	YouTubeFeed = YouTube + 'feed/',
	YouTubeFeedSubscription = YouTubeFeed + 'subscriptions',
	YouTubeFeedChannel = YouTubeFeed + 'channels',
	YouTubeBrowse = WW.Tmpl(YouTube,'youtubei/v1/browse?key=',undefined),
	YouTubeAccount = YouTube + 'account',
	GoogleAPIKey = '#GoogleAPIKey#',
	GoogleAPI = 'https://www.googleapis.com/',
	GoogleAPIYouTube = GoogleAPI + 'youtube/v3/',
	GoogleAPIYouTubeVideo = WW.Tmpl(GoogleAPIYouTube,'videos?key=',GoogleAPIKey,'&part=',undefined,'&id=',undefined),
	GoogleAPIYouTubeChannel = WW.Tmpl(GoogleAPIYouTube,'channels?key=',GoogleAPIKey,'&part=contentDetails&',undefined,'=',undefined),
	GoogleAPIYouTubePlayList = WW.Tmpl(GoogleAPIYouTube,'playlistItems?key=',GoogleAPIKey,'&part=snippet,contentDetails&playlistId=',undefined,'&pageToken=',undefined,'&maxResults=',O.Size),
	GoogleAPIYouTubeSearch = WW.Tmpl(GoogleAPIYouTube,'search?key=',GoogleAPIKey,'&part=id,snippet&q=',undefined,'&pageToken=',undefined,'&maxResults=',O.Size,'&type=video&safeSearch=none',undefined),
	GoogleClient = 'https://clients1.google.com/',
	GoogleClientYouTubeSuggestion = WW.Tmpl(GoogleClient,'complete/search?client=youtube&ds=yt&q=',undefined,'&callback=_'),
	Common = function(B)
	{
		B = WW.IsObj(B) ? B : WC.JTO(B)
		B.error && O.Bad(B.code || B.error.code,WC.OTJ(B.error))
		return B
	},
	CommonPath = function(P,B,R)
	{
		R = WR.Path(P,Common(B))
		null == R && O.BadR(B)
		return R
	},
	SolveSnippet = function(B)
	{
		B = Common(B)
		return {
			Len : B.pageInfo.totalResults,
			Item : WR.Map(function(V)
			{
				return {
					Index : V.snippet.position,
					ID : V.id,
					Img : V.snippet.thumbnails.medium.url,
					Title : 'youtube#searchResult' === V.kind ? WC.HED(V.snippet.title) : V.snippet.title,
					UP : V.snippet.channelTitle,
					UPURL : YouTubeChannel(V.snippet.channelId),
					Date : new Date(V.snippet.publishedAt),
					Len : WW.PTP(V.contentDetails.duration),
					Desc : V.snippet.description,
					More :
					[
						WR.Up(V.contentDetails.dimension + ' ' + V.contentDetails.definition),
						'true' === V.contentDetails.caption && 'Caption On'
					]
				}
			},B.items)
				// .sort(function(Q,S){return S.Date - Q.Date})
		}
	},
	PageToken = function(Q)
	{
		// The endpoint only responses the first 20000 items, thus the token pattern is unclear beyond that
		// channel/UCPF-oYb2-xN5FbCXy0167Gg user/MrWebdriver channel/UCKvky_c4MzuFGfgspYlzjSA
		var
		Seq = WW.D + WW.AZ + WW.az + '$_',
		TokenKeyPrefix = 0,
		TokenKey0o4A = 1,
		TokenKey0o4B = 2,
		TokenKey0o14A = 3,
		TokenKey0o14B = 4,
		TokenKey7o6 = 5,
		TokenKeySuffix = 6,
		Token1 =
		[
			'EAAaB1BUOkN',
			'QRSTUVWYZabcdMNO','QRSTUVWZabcdeMNO',
			28,[0,0,0,0,0,0,0,34,34,34,34,34,34,48,48,48],
			14,
			''
		],
		Token2 =
		[
			'EAAaCVBUOkN',
			'QRSTUVYZabcdeMNL','QRSTUVZabcdefMNL',
			-2,[0,0,0,0,0,0,30,30,30,30,30,30,30,46,46,30],
			15,
			'BUQ'
		],
		Token0o14Diff = WR.Unnest(WR.Map(WR.Apply(WR.RepA),[[2,15],[3,11],[4,15],[5,11],[1,10],[0,1],[3,1]])),
		Token7o6 = WR.Map(function(V){return 50 + Seq.indexOf(V)},WR.RepS(WR.RepS('EIMQUYcgkosw048A',2).slice(0,26),2) + 'AEIMQUYcgk08'),
		CHR = function(Q){return Seq.charAt(63 & Q)},
		Token = Q < 16384 ? Token1 : Token2;
		Q = Q < 16384 ? Q : Q - 16384
		return Token[TokenKeyPrefix] +
			CHR(19 + (7 & Q >>> 4)) +
			Token[8192 & Q ? TokenKey0o4B : TokenKey0o4A][15 & Q] +
			CHR(Token[TokenKey0o14A] +
				(8192 & Q && 16) +
				Token0o14Diff[63 & Q >>> 7] + Token[TokenKey0o14B][15 & Q]) +
			CHR(Token[TokenKey7o6] + Token7o6[63 & Q >>> 7]) +
			Token[TokenKeySuffix]
	},
	GoogleAPIReq = function(Q)
	{
		return O.API(Q,true).Map(function(U)
		{
			var T;
			if (200 !== U[2].status)
			{
				T = WC.JTO(U[1]).error
				T ?
					O.Bad(T.code,T.message) :
					O.Bad('Bad Status Code | ' + U[2].status)
			}
			return U[1]
		})
	},
	SolveDetail = function(B)
	{
		B = Common(B)
		return GoogleAPIReq(GoogleAPIYouTubeVideo('id,contentDetails',WR.Map(function(V)
		{
			return (V.contentDetails || V.id).videoId
		},B.items)))
			.Map(function(N)
			{
				N = Common(N)
				WR.EachU(function(V,F)
				{
					V.id = N.items[F].id
					V.contentDetails = N.items[F].contentDetails
				},B.items)
				return SolveSnippet(B)
			})
	},
	SolvePlayList = function(ID,Page)
	{
		return GoogleAPIReq(GoogleAPIYouTubePlayList(ID,Page ? PageToken(O.Size * Page) : ''))
			.FMap(SolveDetail)
	},
	Channel2PlayList = WX.CacheM(function(Q)
	{
		return GoogleAPIReq(Q).Map(function(B)
		{
			return CommonPath(['items',0,'contentDetails','relatedPlaylists','uploads'],B)
		})
	}),
	SolveChannelIDByCustomURL = WX.CacheM(function(Q)
	{
		return O.API(Q).Map(function(B)
		{
			return WW.MF(/(?:"canonical"[^>]+\/channel\/|prop="channelId"[^"]+")([^"]+)/,B)
		})
	}),
	SolveFeedText = function(V)
	{
		return V && (V.runs ? V.runs[0].text : V.simpleText)
	},
	MakeFeed = function(Feed,Map)
	{
		var
		ClientName,ClientVersion,
		APIKey,
		MakeI = function(URL,Req,Now)
		{
			Now = WR.Floor(WW.Now() / 1E3)
			return O.Req(
			{
				URL : URL,
				Head :
				{
					Authorization : 'SAPISIDHASH ' +
						Now + '_' +
						WR.Low(WC.HEXS(WC.SHA1(
						[
							Now,
							WC.CokeP(O.Coke()).SAPISID,
							YouTube.slice(0,-1)
						].join(' ')))),
					Origin : YouTube.slice(0,-1),
				},
				JSON : WW.Merge(
				{
					context :
					{
						client :
						{
							clientName : ClientName,
							clientVersion : ClientVersion
						},
						request :
						{
							useSsl : true,
						},
					}
				},Req)
			})
		};
		return O.More(function()
		{
			return O.Req(
			{
				URL : Feed,
				UA : ''
			}).Map(function(V)
			{
				ClientName = WC.JTO(WW.MF(/CLIENT_NAME":("[^"]+")/,V))
				ClientVersion = WC.JTO(WW.MF(/CLIENT_VERSION":("[^"]+")/,V))
				APIKey = WC.JTO(WW.MF(/API_KEY":("[^"]+")/,V))
				return O.JOM(/ytInitialData[ =]+/,V)
			})
		},function(I,Page)
		{
			return MakeI(YouTubeBrowse(APIKey),
			{
				continuation : I[Page]
			}).Map(WC.JTO)
		},function(B)
		{
			var
			Token,
			Item = [];
			O.Walk(B,function(V,F)
			{
				return 'continuationCommand' === F ?
					Token = V.token :
					Map(Item,V,F)
			})
			return [Token,
			{
				Item : Item
			}]
		})
	},
	Menu =
	[
		['order',['relevance','date','viewCount','rating','title','videoCount']],
		['videoDefinition',['any','high','standard']],
		['videoDimension',['any','2d','3d']],
		['videoDuration',['any','long','medium','short']],
		['videoType',['any','episode','movie']]
	];
	return {
		ID : 'YouTube',
		Alias : 'Y',
		Judge : /\bYouTube\b|\bY[\dA-Z]+\.be\b/i,
		Min :
		[
			'SID',
			'SSID',
			'SAPISID',
			'HSID',
			'LOGIN_INFO',
			'__Secure-3PSID',
			'__Secure-3PAPISID',
			'PREF'
		],
		Sign : function()
		{
			return O.Req({URL : YouTubeAccount,Red : false}).Map(function(B)
			{
				return WC.JTO(WW.MF(/"name":(".*?"),"/,B))
			})
		},
		Map : [
		{
			Name : 'Search',
			Judge : O.Find,
			View : function(ID,Page,Pref)
			{
				return GoogleAPIReq(GoogleAPIYouTubeSearch(WC.UE(ID),Page ? WC.PageToken(O.Size * Page) : '',Pref ? '&' + WC.QSS(Pref) : ''))
					.FMap(SolveDetail)
					.Map(function(N)
					{
						N.Pref = function(I)
						{
							var
							R = WV.Pref({C : I});
							R.S(WR.Map(function(V)
							{
								return [O.Pascal(V[0]).replace(/Video/,''),WV.Inp(
								{
									Inp : R.C(V[0]),
									NoRel : O.NoRel
								}).Drop(WR.Map(function(V)
								{
									return [V,O.Pascal(V)]
								},V[1]))]
							},Menu))
							return R
						}
						return N
					})
			},
			Hint : function(ID)
			{
				return O.API(GoogleClientYouTubeSuggestion(WC.UE(ID))).Map(function(B)
				{
					B = WC.JTO(B.replace(/^[^[]+|[^\]]+$/g,''))[1] || []
					return {
						Item : WR.Pluck(0,B)
					}
				})
			}
		},{
			Name : 'User',
			Judge : O.Word('User'),
			View : function(ID,Page)
			{
				return Channel2PlayList(GoogleAPIYouTubeChannel('forUsername',ID))
					.FMap(function(ID){return SolvePlayList(ID,Page)})
			}
		},{
			Name : 'Channel',
			Judge : O.Word('Channel'),
			View : function(ID,Page)
			{
				return Channel2PlayList(GoogleAPIYouTubeChannel('id',ID))
					.FMap(function(ID){return SolvePlayList(ID,Page)})
			}
		},{
			Name : 'CustomURL',
			Judge : O.Word('CustomURL|C'),
			View : function(ID,Page)
			{
				return SolveChannelIDByCustomURL(YouTubeCustomURL(ID))
					.FMap(function(ID){return Channel2PlayList(GoogleAPIYouTubeChannel('id',ID))})
					.FMap(function(ID){return SolvePlayList(ID,Page)})
			}
		},{
			Name : 'PlayList',
			Judge : O.Word('PlayList(?:\\b.*\\bList\\b)?'),
			View : SolvePlayList
		},{
			Name : 'Following',
			Judge : O.UP,
			View : MakeFeed(YouTubeFeedChannel,function(I,V,K)
			{
				return 'channelRenderer' === K && I.push(
				{
					Non : true,
					ID : V.channelId,
					URL : YouTubeChannel(V.channelId),
					Img : WR.Last(V.thumbnail.thumbnails).url,
					UP : SolveFeedText(V.title),
					UPURL : YouTubeChannel(V.channelId),
					Desc : SolveFeedText(V.descriptionSnippet)
				})
			})
		},{
			Name : 'Subscription',
			Judge : O.TL,
			View : MakeFeed(YouTubeFeedSubscription,function(I,V,K)
			{
				return 'gridVideoRenderer' === K && I.push(
				{
					ID : V.videoId,
					Img : V.thumbnail.thumbnails[0].url,
					Title : SolveFeedText(V.title),
					UP : SolveFeedText(V.shortBylineText),
					UPURL : O.SolU(V.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,YouTube),
					Date : SolveFeedText(V.publishedTimeText),
					More : V.upcomingEventData && O.DTS(1E3 * V.upcomingEventData.startTime),
					Len : '' + WR.MapW(WR.Prop(['thumbnailOverlayTimeStatusRenderer','text','simpleText']),V.thumbnailOverlays)
				})
			})
		},{
			Name : 'Video',
			Judge : [/^[-_\dA-Z]+$/i,O.Word('Embed|V|Video'),/\.be\/(\S+)/i],
			View : function(ID)
			{
				return GoogleAPIReq(GoogleAPIYouTubeVideo('id,snippet,contentDetails',ID))
					.Map(SolveSnippet)
			}
		},{
			Name : 'DirectCustomURL',
			Judge :
			[
				/YouTube[^/]+\/([^/]+)$/i,
				O.Word('DirectCustomURL')
			],
			View : function(ID,Page)
			{
				return SolveChannelIDByCustomURL(YouTube + ID)
					.FMap(function(ID){return Channel2PlayList(GoogleAPIYouTubeChannel('id',ID))})
					.FMap(function(ID){return SolvePlayList(ID,Page)})
			}
		}],
		IDURL : YouTubeWatch
	}
})