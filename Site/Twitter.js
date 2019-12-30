'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	// We may need to resolve some tokens automatically if it changes in the future
	// /"[^"]+/main[^"]+/ https://abs.twimg.com/responsive-web/web/main.713ccc64.js
	Twitter = 'https://twitter.com/',
	TwitterTweet = WW.Tmpl(Twitter,'_/status/',undefined),
	TwitterAPI = 'https://api.twitter.com/',
	TwitterAPITypeHome = 'timeline/home',
	TwitterAPITypeConversation = 'timeline/conversation/',
	TwitterAPITypeMedia = 'timeline/media/',
	TwitterAPITypeSearch = 'search/adaptive',
	TwitterAPITypeGuide = 'guide',
	TwitterAPISearchSug = WW.Tmpl(TwitterAPI,'1.1/search/typeahead.json?q=',undefined,'&tweet_mode=extended&count=',O.Size),
	TwitterAPIFollowing = WW.Tmpl(TwitterAPI,'1.1/friends/list.json?user_id=',undefined,'&cursor=',undefined,'&count=',O.Size),
	TwitterAPIJSON = WW.Tmpl(TwitterAPI,'2/',undefined,'.json?tweet_mode=extended&count=',O.Size),
	TwitterAPIUserByScreen = WW.Tmpl(TwitterAPI,'graphql/G6Lk7nZ6eEKd7LBBZw9MYw/UserByScreenName?variables=%7B%22screen_name%22%3A',undefined,'%2C%22withHighlightedLabel%22%3Atrue%7D'),
	TwitterAuth = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
	Common = function(Q)
	{
		Q = WC.JTO(Q)
		Q.errors && O.Bad(Q.errors[0].code,Q.errors[0].message)
		return Q
	},
	SolveTweet = function(ID,Tweet,User)
	{
		var
		Media = WR.Path(['extended_entities','media'],Tweet),
		NonVideo;
		return {
			Non : NonVideo = !Media || WR.All(function(V){return 'video' !== V.type},Media),
			ID : ID,
			Img : Media && Media[0] && Media[0].media_url_https,
			Title : WR.Trim(Tweet.full_text.replace(/\n#.*$/g,'')),
			UP : User[Tweet.user_id_str].name,
			UPURL : Twitter + User[Tweet.user_id_str].screen_name,
			Date : new Date(Tweet.created_at),
			Len : !NonVideo && WW.StrMS(WR.Reduce(function(D,V)
			{
				return D += WR.Path(['video_info','duration_millis'],V) || 0
			},0,Media)),
			Desc : Tweet.full_text
		}
	},
	MakeTimeline = function(H)
	{
		return O.More(function(ID)
		{
			return H(ID).FMap(function(URL)
			{
				return O.Req(MakeHead(URL)).Map(function(B,T)
				{
					B = Common(B)
					T = SolveCursor(B)
					return [T ? [URL,T] : [URL],B]
				})
			})
		},function(I,Page)
		{
			return O.Req(MakeHead(I[0] + '&cursor=' + WC.UE(I[Page]))).Map(function(B)
			{
				B = Common(B)
				WR.Key(B.globalObjects.tweets).length && (I[-~Page] = SolveCursor(B))
				return B
			})
		},function(Q)
		{
			Q = Q.globalObjects
			return {
				Item : WR.Map(function(V)
				{
					return SolveTweet(V[0],V[1],Q.users)
				},WR.Ent(Q.tweets).sort(function(Q,S)
				{
					Q = WR.PadS0(32,Q[0])
					S = WR.PadS0(32,S[0])
					return Q < S || S < Q && -1
				}))
			}
		})
	},
	SolveCursor = function(Q,R)
	{
		R = ''
		WR.Each(function(V)
		{
			V = WR.Path(['content','operation','cursor'],V)
			if (V && 'Bottom' === V.cursorType)
				R = V.value
		},WR.Path(['timeline','instructions',0,'addEntries','entries'],Q))
		return R
	},
	MakeHead = function(Q)
	{
		Q = WW.IsObj(Q) ? Q : {url : Q}
		Q.headers || (Q.headers = {})
		Q.headers['X-CSRF-Token'] = WC.CokeP(O.Coke()).ct0
		Q.headers.Authorization = 'Bearer ' + TwitterAuth
		return Q
	};
	return {
		ID : 'Twitter',
		Alias : 'T',
		Judge : /\bTwitter\b/i,
		Min : 'auth_token ct0 rweb_optin',
		Sign : function()
		{
			return O.Req(O.Head(Twitter,WW.UA,'Chrome/' + WW.Rnd(3E3,6E6))).Map(function(B)
			{
				B = WW.MF(/,"name":("([^"]+|\\")+")/,B)
				return B && WC.JTO(B)
			})
		},
		Map : [
		{
			Name : 'Search',
			Judge : O.Find,
			View : MakeTimeline(function(ID)
			{
				return WX.Just(TwitterAPIJSON(TwitterAPITypeSearch) + '&q=' + WC.UE(ID))
			}),
			Hint : function(Q)
			{
				return O.Req(MakeHead(TwitterAPISearchSug(WC.UE(Q)))).Map(function(B)
				{
					B = Common(B)
					return {
						Item : WR.Unnest(
						[
							WR.Pluck('topic',B.topics),
							WR.Pluck('name',B.users)
						])
					}
				})
			}
		},{
			Name : 'Tweet',
			Judge : [/^\d+$/,O.Num('Tweet|Status(?:es)?')],
			View : function(ID)
			{
				return O.Req(MakeHead(TwitterAPIJSON(TwitterAPITypeConversation + ID))).Map(function(B)
				{
					B = Common(B)
					B = B.globalObjects
					return {
						Item : [SolveTweet(ID,B.tweets[ID],B.users)]
					}
				})
			}
		},{
			Name : 'User',
			Judge : [/\.com\/([^/]+)/i,O.Word('User')],
			View : MakeTimeline(function(ID)
			{
				return O.Req(MakeHead(TwitterAPIUserByScreen(WC.UE(WC.OTJ(ID))))).Map(function(U)
				{
					return TwitterAPIJSON(TwitterAPITypeMedia + Common(U).data.user.rest_id)
				})
			})
		},{
			Name : 'UserID',
			Judge : O.Num('UserID'),
			View : MakeTimeline(function(ID)
			{
				return WX.Just(TwitterAPIJSON(TwitterAPITypeMedia + ID))
			})
		},{
			Name : 'Timeline',
			Judge : O.TL,
			View : MakeTimeline(WR.Const(WX.Just(TwitterAPIJSON(TwitterAPITypeHome))))
		},{
			Name : 'Following',
			Judge : O.UP,
			View : O.More(function()
			{
				return O.Req(MakeHead(TwitterAPIJSON(TwitterAPITypeGuide))).FMap(function(U)
				{
					U = WW.MU(/\d+/,Common(U).timeline.id)
					return O.Req(MakeHead(TwitterAPIFollowing(U,-1))).Map(function(B)
					{
						B = Common(B)
						return [[U,B.next_cursor_str],B]
					})
				})
			},function(I,Page)
			{
				return O.Req(MakeHead(TwitterAPIFollowing(I[0],I[Page]))).Map(function(B)
				{
					B = Common(B)
					B.users.length && (I[-~Page] = B.next_cursor_str)
					return B
				})
			},function(Q)
			{
				return {
					Item : WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.screen_name,
							View : '@' + V.screen_name,
							URL : Twitter + V.screen_name,
							Img : V.profile_image_url_https,
							Title : V.name,
							Desc : (V.location ? '[[' + V.location + ']]\n\n' : '') + V.description
						}
					},Q.users)
				}
			})
		}],
		IDURL : TwitterTweet
	}
})