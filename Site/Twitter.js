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
		return O.More(function(ID,I)
		{
			return H(ID).FMap(function(URL)
			{
				return O.Req(MakeHead(I[0] = URL))
			})
		},function(I,Page)
		{
			return O.Req(MakeHead(I[0] + '&cursor=' + WC.UE(I[Page])))
		},function(B)
		{
			B = Common(B)
			return [WR.Key(B.globalObjects.tweets).length && SolveCursor(B),
			{
				Item : WR.MapW(function(V)
				{
					if (/ads-api\.twitter/.test(V))
						return null
					return SolveTweet(V[0],V[1],B.globalObjects.users)
				},WR.Ent(B.globalObjects.tweets).sort(function(Q,S)
				{
					Q = WR.PadS0(32,Q[0])
					S = WR.PadS0(32,S[0])
					return Q < S || S < Q && -1
				}))
			}]
		})
	},
	SolveCursor = function(Q)
	{
		var
		H = function(Q)
		{
			'Bottom' === Q.cursorType ?
				R = Q.value :
				WR.Each(function(V){WW.IsObj(V) && H(V)},Q)
		},
		R = '';
		H(Q.timeline)
		return R
	},
	MakeHead = function(Q)
	{
		return WW.N.ReqOH(Q,
		[
			'X-CSRF-Token',WC.CokeP(O.Coke()).ct0,
			'Authorization','Bearer ' + TwitterAuth
		])
	};
	return {
		ID : 'Twitter',
		Alias : 'T',
		Judge : /\bTwitter\b/i,
		Min : 'auth_token ct0 rweb_optin',
		Sign : function()
		{
			return O.Req(Twitter).Map(function(B)
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
			View : O.More(function(_,I)
			{
				return O.Req(MakeHead(TwitterAPIJSON(TwitterAPITypeGuide))).FMap(function(U)
				{
					I[0] = WW.MU(/\d+/,Common(U).timeline.id)
					return O.Req(MakeHead(TwitterAPIFollowing(I[0],-1)))
				})
			},function(I,Page)
			{
				return O.Req(MakeHead(TwitterAPIFollowing(I[0],I[Page])))
			},function(B)
			{
				B = Common(B)
				return [B.users.length && B.next_cursor_str,
				{
					Item : WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.screen_name,
							View : '@' + V.screen_name,
							URL : Twitter + V.screen_name,
							Img : V.profile_image_url_https,
							UP : V.name,
							UPURL : Twitter + V.screen_name,
							Desc : (V.location ? '[[' + V.location + ']]\n\n' : '') + V.description
						}
					},B.users)
				}]
			})
		}],
		IDURL : TwitterTweet
	}
})