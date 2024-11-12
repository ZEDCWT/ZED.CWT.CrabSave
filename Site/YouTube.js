'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	YouTube = 'https://www.youtube.com/',
	YouTubeWatch = WW.Tmpl(YouTube,'watch?v=',undefined),
	YouTubeUser = WW.Tmpl(YouTube,'user/',undefined),
	YouTubeChannel = WW.Tmpl(YouTube,'channel/',undefined),
	YouTubeCustomURL = WW.Tmpl(YouTube,'c/',undefined),
	YouTubePlayList = WW.Tmpl(YouTube,'playlist?list=',undefined),
	YouTubeEmbed = WW.Tmpl(YouTube,'embed/',undefined),
	YouTubeShort = WW.Tmpl(YouTube,'shorts/',undefined),
	YouTubeFeed = YouTube + 'feed/',
	YouTubeFeedSubscription = YouTubeFeed + 'subscriptions',
	YouTubeFeedSubscriptionShort = YouTubeFeedSubscription + '/shorts',
	YouTubeFeedChannel = YouTubeFeed + 'channels',
	YouTubeI = YouTube + 'youtubei/v1/',
	YouTubeIBrowse = YouTubeI + 'browse?prettyPrint=false',
	// YouTubeIGuide = YouTubeI + 'guide',
	YouTubeAccount = YouTube + 'account',
	// YouTubeKey = YouTube + 'sw.js',
	GoogleAPIKey = '~GoogleAPIKey~',
	GoogleAPI = 'https://www.googleapis.com/',
	GoogleAPIYouTube = GoogleAPI + 'youtube/v3/',
	GoogleAPIYouTubeVideoPart =
	[
		'id',
		'snippet',
		'contentDetails',
		'liveStreamingDetails'
	].join(','),
	GoogleAPIYouTubeVideo = WW.Tmpl(GoogleAPIYouTube,'videos?prettyPrint=false&key=',GoogleAPIKey,'&part=',GoogleAPIYouTubeVideoPart,'&id=',undefined),
	GoogleAPIYouTubeChannel = WW.Tmpl(GoogleAPIYouTube,'channels?prettyPrint=false&key=',GoogleAPIKey,'&part=contentDetails&',undefined,'=',undefined),
	GoogleAPIYouTubePlayList = WW.Tmpl(GoogleAPIYouTube,'playlistItems?prettyPrint=false&key=',GoogleAPIKey,'&part=snippet,contentDetails&playlistId=',undefined,'&pageToken=',undefined,'&maxResults=',O.Size),
	GoogleAPIYouTubeSearch = WW.Tmpl(GoogleAPIYouTube,'search?prettyPrint=false&key=',GoogleAPIKey,'&part=id,snippet&q=',undefined,'&pageToken=',undefined,'&maxResults=',O.Size,'&type=video&safeSearch=none',undefined),
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
	SolveSnippet = function(B,AllowUpcoming)
	{
		B = Common(B)
		return {
			Len : B.pageInfo.totalResults,
			Item : WR.Map(function(V)
			{
				var
				Live = V.liveStreamingDetails,
				IsLivePending = Live &&
				(
					Live.activeLiveChatId ||
					Live.scheduledStartTime && !Live.actualEndTime
				);
				return {
					Non : !AllowUpcoming && IsLivePending,
					Index : V.snippet.position,
					ID : V.id,
					Img : V.snippet.thumbnails.medium.url,
					Title : 'youtube#searchResult' === V.kind ? WC.HED(V.snippet.title) : V.snippet.title,
					UP : V.snippet.channelTitle,
					UPURL : YouTubeChannel(V.snippet.channelId),
					Date : V.snippet.publishedAt,
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
	SolveVideoList = function(B)
	{
		return GoogleAPIReq(GoogleAPIYouTubeVideo(B))
			.Map(function(N){return SolveSnippet(N)})
	},
	SolveDetail = function(B)
	{
		return SolveVideoList(WR.Map(function(V)
		{
			return (V.contentDetails || V.id).videoId
		},Common(B).items))
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
	CookieROI =
	[
		'SID',
		'SSID',
		'SAPISID',
		'HSID',
		'LOGIN_INFO',
		'__Secure-1PSIDTS',
		'__Secure-3PSID',
		'__Secure-3PAPISID',
		'PREF',
		'GOOGLE_ABUSE_EXEMPTION' // Set after the Robot test
	],
	UpdateCookie = function(H)
	{
		var
		Coke = WC.CokeP(O.Coke(),WR.Id),
		New = 0;
		WR.Each(function(V)
		{
			V = WR.SplitBy(';',V)[0]
			V = WR.SplitBy('=',V)
			if (WR.Include(V[0],CookieROI))
			{
				++New
				Coke[V[0]] = V[1]
			}
		},H.H['Set-Cookie'])
		New && O.CokeU(WC.CokeS(Coke,WR.Id))
	},
	ClientName,ClientVersion,
	APIKey,
	PageID,
	MakeI = function(URL,Req,Now)
	{
		Now = WR.Floor(WW.Now() / 1E3)
		return O.Req(
		{
			URL : URL,
			// QS : {key : APIKey},
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
				'X-Goog-AuthUser' : '0',
				'X-Goog-PageId' : PageID,
				'X-Origin' : YouTube.slice(0,-1)
			},
			JSON : WW.Merge(
			{
				context :
				{
					client : WW.Merge(
					{
						clientName : ClientName,
						clientVersion : ClientVersion
					},WR.Pick(
					[
						'tz',
						'hl',
						'gl'
					],WC.QSP(WC.CokeP(O.Coke()).PREF || ''))),
					request :
					{
						useSsl : true
					}
				}
			},Req)
		}).Map(WC.JTO)
	},
	MakeFeed = function(Feed,Map,DataFMap)
	{
		DataFMap = DataFMap || WX.Just
		return O.More(function()
		{
			return O.Req(
			{
				URL : Feed,
				UA : ''
			},true).FMap(function(H)
			{
				var
				B = H.B,
				SolveJSONIfPresent = function(Q)
				{
					Q = WW.MF(Q,B)
					return Q && WC.JTO(Q)
				};
				UpdateCookie(H)
				ClientName = SolveJSONIfPresent(/CLIENT_NAME":("[^"]+")/)
				ClientVersion = SolveJSONIfPresent(/CLIENT_VERSION":("[^"]+")/)
				APIKey = SolveJSONIfPresent(/API_KEY":("[^"]+")/)
				PageID = SolveJSONIfPresent(/DELEGATED_SESSION_ID":("[^"]+")/)
				B = O.JOM(/ytInitialData[ =]+/,B)
				return WR.Has('contents',B) ?
					WX.Just(B) :
					MakeI(YouTubeIBrowse,
					{
						browseId : 'FE' + Feed.slice(YouTubeFeed.length).replace(/\W/g,'_')
					})
			}).FMap(DataFMap)
		},function(I,Page)
		{
			return MakeI(YouTubeIBrowse,
			{
				continuation : I[Page]
			}).FMap(DataFMap)
		},function(B)
		{
			var
			Token,
			Item = [],
			NeedDetail = [],
			NeedDetailIndex = {};
			O.Walk(B,function(V,F)
			{
				return 'continuationCommand' === F ?
					Token = V.token :
					Map(Item,V,F)
			})
			WR.EachU(function(V,F)
			{
				if (V.NeedDetail)
				{
					NeedDetail.push(V.ID)
					NeedDetailIndex[V.ID] = F
				}
			},Item)
			return (NeedDetail.length ? SolveVideoList(NeedDetail) : WX.Just([]))
				.Map(function(B)
				{
					WR.Each(function(V)
					{
						Item[NeedDetailIndex[V.ID]] = V
					},B.Item)
					return [Token,
					{
						Item : Item
					}]
				})
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
		Min : CookieROI,
		Sign : function()
		{
			return O.Req({URL : YouTubeAccount,Red : false}).Map(function(B)
			{
				return WC.JTO(WW.MF(/"name":(".*?"),"/,B))
			})
		},
		Map : [
		{
			Name : O.NameFind,
			Example :
			[
				'メイドインアビス'
			],
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
								},V[1])).V(V[1][0],true)]
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
			Example :
			[
				'xbox',
				{
					As : 'Inp',
					Val : YouTubeUser('xbox'),
					ID : 'xbox'
				}
			],
			View : function(ID,Page)
			{
				return Channel2PlayList(GoogleAPIYouTubeChannel('forUsername',ID))
					.FMap(function(ID){return SolvePlayList(ID,Page)})
			}
		},{
			Name : 'Channel',
			Judge : O.Word('Channel'),
			Example :
			[
				'UCnUYZLuoy1rq1aVMwx4aTzw',
				{
					As : 'Inp',
					Val : YouTubeChannel('UCnUYZLuoy1rq1aVMwx4aTzw'),
					ID : 'UCnUYZLuoy1rq1aVMwx4aTzw'
				}
			],
			View : function(ID,Page)
			{
				return Channel2PlayList(GoogleAPIYouTubeChannel('id',ID))
					.FMap(function(ID){return SolvePlayList(ID,Page)})
			}
		},{
			Name : 'PlayList',
			Judge : O.Word('PlayList(?:\\b.*\\bList\\b)?'),
			Example :
			[
				'PLg8EsA-33oqEpMVgBFu1B3362rsmdSbVJ',
				{
					As : 'Inp',
					Val : YouTubePlayList('PLg8EsA-33oqEpMVgBFu1B3362rsmdSbVJ'),
					ID : 'PLg8EsA-33oqEpMVgBFu1B3362rsmdSbVJ'
				}
			],
			View : SolvePlayList
		},{
			Name : O.NameUP,
			JudgeVal : false,
			Example :
			[
				''
			],
			View : MakeFeed(YouTubeFeedChannel,function(I,V,K)
			{
				return 'channelRenderer' === K && I.push(
				{
					Non : true,
					ID : V.channelId,
					URL : YouTubeChannel(V.channelId),
					Img : O.SolU(WR.Last(V.thumbnail.thumbnails).url,YouTube),
					UP : SolveFeedText(V.title),
					UPURL : YouTubeChannel(V.channelId),
					Desc : SolveFeedText(V.descriptionSnippet)
				})
			})
		},{
			Name : 'Video',
			Judge :
			[
				/^[-_\dA-Z]+$/i,
				O.Word('Embed|Live|V|Video|Shorts?'),
				/\.be\/([-_\dA-Z]+)/i
			],
			Example :
			[
				'qqTnAWL7-v0',
				{
					As : 'Inp',
					Val : YouTubeWatch('qqTnAWL7-v0'),
					ID : 'qqTnAWL7-v0'
				},
				{
					As : 'Inp',
					Val : YouTubeShort('ZseN5AxE8-c'),
					ID : 'ZseN5AxE8-c'
				},
				{
					As : 'Inp',
					Val : YouTubeEmbed('qqTnAWL7-v0'),
					ID : 'qqTnAWL7-v0'
				}
			],
			View : function(ID)
			{
				return GoogleAPIReq(GoogleAPIYouTubeVideo(ID))
					.Map(function(B){return SolveSnippet(B,true)})
			}
		},{
			Name : 'SubscriptionShort',
			Judge : /(?:\bShorts\b)/i,
			JudgeVal : false,
			Example :
			[
				''
			],
			View : MakeFeed(YouTubeFeedSubscriptionShort,function(I,V,K)
			{
				return 'richItemRenderer' === K ||
					'Item' === K && WR.Each(function(B){I.push(B)},V)
			},function(B)
			{
				var All = [];
				O.Walk(B,function(V,K)
				{
					/^(reelItemRenderer|reelWatchEndpoint)$/.test(K) &&
						All.push(V.videoId)
				})
				return GoogleAPIReq(GoogleAPIYouTubeVideo(All))
					.Map(function(N)
					{
						return [B,SolveSnippet(N)]
					})
			})
		},{
			Name : 'Subscription',
			Judge : /^$/,
			JudgeVal : false,
			Example :
			[
				'',
				{
					As : 'Sub',
					Val : ''
				}
			],
			View : MakeFeed(YouTubeFeedSubscription,function(I,V,K)
			{
				var
				IsRenderer = 'gridVideoRenderer' === K,
				T;
				if ('richItemRenderer' === K)
				{
					IsRenderer = true
					V = V.content
					V = V.videoRenderer || V
				}

				// Short Collection. Too bad that it contains no channel/date info
				if ('richShelfRenderer' === K)
				{
					O.Walk(V.menu,function(V)
					{
						T = T || V.url
					})
					I.push(
					{
						Non : true,
						ID : T,
						URL : O.SolU(T,YouTube),
						UP : SolveFeedText(V.title),
						UPURL : O.SolU(T,YouTube)
					})
				}

				if (IsRenderer && (T = V.shortsLockupViewModel))
				{
					IsRenderer = false
					V = T
					T = null
					O.Walk(V,function(V)
					{
						return T = T || V.videoId
					})
					I.push(
					{
						ID : T,
						Img : V.thumbnail.sources[0].url,
						Title : V.overlayMetadata.primaryText.content,
						NeedDetail : true,
					})
				}

				V = V.reelItemRenderer || V

				return IsRenderer && WR.Has('videoId',V) && I.push(
				{
					Non : V.upcomingEventData ||
						WR.Any(function(B)
						{
							return 'BADGE_STYLE_TYPE_LIVE_NOW' === B.metadataBadgeRenderer.style
						},V.badges),
					ID : V.videoId,
					Img : V.thumbnail.thumbnails[0].url,
					Title : SolveFeedText(V.headline || V.title),
					UP : SolveFeedText(V.shortBylineText),
					UPURL : V.shortBylineText && O.SolU(V.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,YouTube),
					Date : SolveFeedText(V.publishedTimeText),
					More :
					[
						V.upcomingEventData && O.DTS(1E3 * V.upcomingEventData.startTime),
						V.badges && WR.Map(WR.Path(['metadataBadgeRenderer','label']),V.badges).join(' ')
					],
					Len : '' + WR.MapW(WR.Prop(['thumbnailOverlayTimeStatusRenderer','text','simpleText']),V.thumbnailOverlays)
				})
			})
		},{
			// www.youtube.com/handle
			Name : 'Handle',
			Judge :
			[
				/YouTube[^/]+\/((?:C\/)?[^/]+)$/i,
				O.Word('Handle')
			],
			Example :
			[
				'@ChromeDevs',
				{
					As : 'Inp',
					Val : YouTube + '@ChromeDevs',
					ID : '@ChromeDevs'
				},
				{
					As : 'Inp',
					Val : YouTubeCustomURL('3blue1brown'),
					ID : 'c/3blue1brown'
				}
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