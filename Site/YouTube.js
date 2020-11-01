'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	YouTube = 'https://www.youtube.com/',
	YouTubeWatch = WW.Tmpl(YouTube,'watch?v=',undefined),
	YouTubeChannel = WW.Tmpl(YouTube,'channel/',undefined),
	YouTubeFollowing = YouTube + 'subscription_manager',
	YouTubeSubscription = YouTube + 'feed/subscriptions',
	YouTubeBrowse = WW.Tmpl(YouTube,'browse_ajax?ctoken=',undefined,'&continuation=',undefined,'&itct=',undefined),
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
					URL : YouTubeWatch(V.id),
					Img : V.snippet.thumbnails.medium.url,
					Title : V.snippet.title,
					UP : V.snippet.channelTitle,
					UPURL : YouTubeChannel(V.snippet.channelId),
					Date : new Date(V.snippet.publishedAt),
					Len : WW.PTP(V.contentDetails.duration),
					Desc : V.snippet.description,
					More : WR.Up(V.contentDetails.dimension + ' ' + V.contentDetails.definition) +
						('true' === V.contentDetails.caption ? '\nCaption On' : '')
				}
			},B.items)
				// .sort(function(Q,S){return S.Date - Q.Date})
		}
	},
	SolveDetail = function(B)
	{
		B = Common(B)
		return O.Api(GoogleAPIYouTubeVideo('id,contentDetails',WR.Map(function(V)
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
		return O.Api(GoogleAPIYouTubePlayList(ID,WC.PageToken(O.Size * Page)))
			.FMap(SolveDetail)
	},
	Channel2PlayList = WX.CacheM(function(Q)
	{
		return O.Api(Q).Map(function(B)
		{
			return CommonPath(['items',0,'contentDetails','relatedPlaylists','uploads'],B)
		})
	}),
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
		Min : 'SID SSID LOGIN_INFO PREF',
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
				return O.Api(GoogleAPIYouTubeSearch(WC.UE(ID),WC.PageToken(O.Size * Page),Pref ? '&' + WC.QSS(Pref) : ''))
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
				return O.Api(GoogleClientYouTubeSuggestion(WC.UE(ID))).Map(function(B)
				{
					B = WC.JTO(B.replace(/^[^[]+|[^\]]+$/g,''))[1] || []
					return {
						Item : WR.Pluck(0,B)
					}
				})
			}
		},{
			Name : 'User',
			Judge : O.Word('User|C'),
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
			Name : 'PlayList',
			Judge : O.Word('PlayList(?:\\b.*\\bList\\b)?'),
			View : SolvePlayList
		},{
			Name : 'Following',
			Judge : O.UP,
			View : function()
			{
				return O.Req(YouTubeFollowing).Map(function(B)
				{
					return {
						Max : 1,
						Item : WW.MR(function(D,V,I)
						{
							D.push(
							{
								Non : true,
								ID : I = WW.MF(/\/channel\/([^"]+)/,V),
								URL : YouTubeChannel(I),
								Img : WW.MF(/data-thumb="([^"]+)/,V),
								UP : WC.HED(WW.MF(/title="([^"]+)/,V)),
								UPURL : YouTubeChannel(I)
							})
							return D
						},[],/tion-thumb[^]+?<\/div/g,B)
					}
				})
			}
		},{
			Name : 'Subscription',
			Judge : O.TL,
			View : O.More(function(_,I)
			{
				return O.Req(YouTubeSubscription).Map(function(V)
				{
					I[0] =
					{
						'X-YouTube-Client-Name' : 1,
						'X-YouTube-Client-Version' : WW.MF(/CLIENT_VERSION":"([^"]+)/,V),
						'X-YouTube-Identity-Token' : WW.MF(/ID_TOKEN":"([^"]+)/,V)
					}
					return WW.MF(/ytInitialData[^\w{]+?({.*});/,V)
				})
			},function(I,Page)
			{
				return O.Req(
				{
					URL : YouTubeBrowse(I[Page][0],I[Page][0],I[Page][1]),
					Head : I[0]
				})
			},function(B)
			{
				var
				Token,
				Item = [],
				H = function(V,K)
				{
					'nextContinuationData' === K ?
						Token = [WC.UE(V.continuation),WC.UE(V.clickTrackingParams)] :
						'gridVideoRenderer' === K ?
							Item.push(
							{
								ID : V.videoId,
								Img : V.thumbnail.thumbnails[0].url,
								Title : V.title.runs ? V.title.runs[0].text : V.title.simpleText,
								UP : V.shortBylineText.runs[0].text,
								UPURL : O.SolU(V.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,YouTube),
								Date : V.publishedTimeText && V.publishedTimeText.simpleText,
								More : V.upcomingEventData && O.DTS(1E3 * V.upcomingEventData.startTime),
								Len : '' + WR.MapW(WR.Prop(['thumbnailOverlayTimeStatusRenderer','text','simpleText']),V.thumbnailOverlays)
							}) :
							WW.IsObj(V) && WR.EachU(H,V)
				};
				H(WC.JTO(B))
				return [Token,
				{
					Item : Item
				}]
			})
		},{
			Name : 'Video',
			Judge : [/^[-_\dA-Z]+$/i,O.Word('V'),/\.be\/(\S+)/i],
			View : function(ID)
			{
				return O.Api(GoogleAPIYouTubeVideo('id,snippet,contentDetails',ID))
					.Map(SolveSnippet)
			}
		}],
		IDURL : YouTubeWatch
	}
})