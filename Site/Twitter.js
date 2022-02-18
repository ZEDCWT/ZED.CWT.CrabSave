'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	// We may need to resolve some tokens automatically if it changes in the future
	// /"[^"]+/main[^"]+/ https://abs.twimg.com/responsive-web/web/main.713ccc64.js
	Twitter = 'https://twitter.com/',
	TwitterTweet = WW.Tmpl(Twitter,'_/status/',undefined),
	TwitterIAPIUserTweet = Twitter + 'i/api/graphql/UsDw2UjYF5JE6-KyC7MDGw/UserTweets',
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
	SolveTweet = function(Tweet,User,ID)
	{
		var
		Media = WR.Path(['extended_entities','media'],Tweet),
		Retweet = Tweet.retweeted_status_id_str ||
			WR.Path(['retweeted_status_result','result','rest_id'],Tweet);
		return {
			NonAV : !Media || Retweet,
			ID : Tweet.id_str || ID,
			Img : Media && WR.Pluck('media_url_https',Media),
			Title : WR.Trim(WC.HED(Tweet.full_text).replace(/\n#.*$/g,'')),
			UP : User.name,
			UPURL : Twitter + User.screen_name,
			Date : new Date(Tweet.created_at),
			Len : WR.Reduce(function(D,V)
			{
				return D += WR.Path(['video_info','duration_millis'],V) || 0
			},0,Media) / 1E3,
			Desc : WC.HED(Tweet.full_text),
			More :
			[
				Retweet && O.Ah('RT ' + Retweet,TwitterTweet(Retweet))
			]
		}
	},
	SolveTweetIDB = function(ID,B)
	{
		var Tweet = B.globalObjects.tweets[ID];
		return SolveTweet(Tweet,B.globalObjects.users[Tweet.user_id_str],ID)
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
			var
			R = [],
			SolveItem = function(V)
			{
				var
				CS,
				U,T;
				if (V = V.content.tweet)
				{
					CS = V.socialContext
					if (!V.promotedMetadata &&
						'Recommendation' !== WR.Path(['topicContext','functionalityType'],CS))
					{
						R.push(U = SolveTweetIDB(V.id,B))
						if (CS)
						{
							if (T = CS.generalContext)
								U.More.push(WW.Quo(T.contextType) + T.text)
						}
					}
				}
			};
			B = Common(B)
			O.Walk(B.timeline,function(V,F)
			{
				return 'addEntries' === F && WR.Each(function(N)
				{
					N = N.content
					if (V = N.item)
						SolveItem(V)
					else if (V = N.timelineModule)
						/^(VerticalConversation)$/.test(V.displayType) ||
							SolveItem(V.items[0].item)
					else N.operation || R.push(
					{
						Non : true,
						ID : '',
						Title : 'Unknown Timeline Entry ' + WC.OTJ(N,'\t',{Apos : true})
					})
				},V.entries)
			})
			return [WR.Key(B.globalObjects.tweets).length && SolveCursor(B),
			{
				Item : R
			}]
		})
	},
	SolveCursor = function(B)
	{
		var
		R = '';
		O.Walk(B,function(V)
		{
			return 'Bottom' === V.cursorType && (R = V.value)
		})
		return R
	},
	MakeHead = function(Q)
	{
		return WW.N.ReqOH(Q,
		[
			'X-CSRF-Token',WC.CokeP(O.Coke()).ct0,
			'Authorization','Bearer ' + TwitterAuth
		])
	},
	MakeUserTweet = function(User,Cursor)
	{
		return O.Req(MakeHead(
		{
			URL : TwitterIAPIUserTweet,
			QS :
			{
				variables : WC.OTJ(
				{
					userId : User,
					count : O.Size,
					cursor : Cursor,
					includePromotedContent : false,
					withQuickPromoteEligibilityTweetFields : true,
					withSuperFollowsUserFields : true,
					withDownvotePerspective : true,
					withReactionsMetadata : true,
					withReactionsPerspective : true,
					withSuperFollowsTweetFields : true,
					withVoice : true,
					withV2Timeline : false
				})
			}
		}))
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
					return {
						Item : [SolveTweetIDB(ID,B)]
					}
				})
			}
		},{
			Name : 'User',
			Judge :
			[
				/(?:@|\.com\/)([^/]+)/i,
				O.Word('User')
			],
			View : O.More(function(ID,I)
			{
				return O.Req(MakeHead(TwitterAPIUserByScreen(WC.UE(WC.OTJ(ID))))).FMap(function(U)
				{
					return MakeUserTweet(I[0] = Common(U).data.user.rest_id)
				})
			},function(I,Page)
			{
				return MakeUserTweet(I[0],I[Page])
			},function(B)
			{
				var R = [];
				B = Common(B)
				O.Walk(B,function(V)
				{
					return V.promotedMetadata ||
						'Tweet' === V.__typename &&
						R.push(SolveTweet(V.legacy,V.core.user_results.result.legacy))
				})
				return [SolveCursor(B),{Item : R}]
			})
			/*View : MakeTimeline(function(ID)
			{
				return O.Req(MakeHead(TwitterAPIUserByScreen(WC.UE(WC.OTJ(ID))))).Map(function(U)
				{
					return TwitterAPIJSON(TwitterAPITypeMedia + Common(U).data.user.rest_id)
				})
			})*/
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