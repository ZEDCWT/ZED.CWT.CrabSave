'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	// We may need to resolve some tokens automatically if it changes in the future
	// /"[^"]+/main[^"]+/ https://abs.twimg.com/responsive-web/web/main.713ccc64.js
	Twitter = 'https://twitter.com/',
	TwitterTweet = WW.Tmpl(Twitter,'_/status/',undefined),
	TwitterUser = WW.Tmpl(Twitter,undefined),
	TwitterUserTweet = WW.Tmpl(Twitter,undefined,'/status/',undefined),
	TwitterUserMedia = WW.Tmpl(Twitter,undefined,'/media'),
	TwitterAPI = 'https://api.twitter.com/',
	// TwitterAPITypeHome = 'timeline/home',
	// TwitterAPITypeConversation = 'timeline/conversation/',
	TwitterAPITypeMedia = 'timeline/media/',
	// TwitterAPITypeSearch = 'search/adaptive',
	TwitterAPITypeGuide = 'guide',
	TwitterAPISearchSug = WW.Tmpl(TwitterAPI,'1.1/search/typeahead.json?q=',undefined,'&tweet_mode=extended&count=',O.Size),
	TwitterAPIFollowing = WW.Tmpl(TwitterAPI,'1.1/friends/list.json?user_id=',undefined,'&cursor=',undefined,'&count=',O.Size),
	TwitterAPIJSON = WW.Tmpl(TwitterAPI,'2/',undefined,'.json?tweet_mode=extended&count=',O.Size),
	TwitterAPIGraphQL = TwitterAPI + 'graphql/',
	TwitterAPIGraphQLTweetDetail = TwitterAPIGraphQL + '3XDB26fBve-MmjHaWTUZxA/TweetDetail',
	// TwitterAPIGraphQLUserTweet = TwitterAPIGraphQL + 'UsDw2UjYF5JE6-KyC7MDGw/UserTweets',
	TwitterAPIGraphQLUserTweet = TwitterAPIGraphQL + 'PoZUz38XdT-pXNk0FRfKSw/UserTweets',
	TwitterAPIGraphQLUserMedia = TwitterAPIGraphQL + 'YqiE3JL1KNgf9nSljYdxaA/UserMedia',
	TwitterAPIGraphQLUserByScreen = WW.Tmpl(TwitterAPIGraphQL,'G6Lk7nZ6eEKd7LBBZw9MYw/UserByScreenName?variables=%7B%22screen_name%22%3A',undefined,'%2C%22withHighlightedLabel%22%3Atrue%7D'),
	// TwitterAPIGraphQLHomeTimeline = TwitterAPIGraphQL + '6VUR2qFhg6jw55JEvJEmmA/HomeTimeline',
	TwitterAPIGraphQLHomeLatestTimeline = TwitterAPIGraphQL + 'AKmCZTyU1gWxo41b4PrQGA/HomeLatestTimeline',
	TwitterAPIGraphQLSearchTimeline = TwitterAPIGraphQL + 'NA567V_8AFwu0cZEkAAKcw/SearchTimeline',
	TwitterAPIGraphQLFeature = WC.OTJ(
	{
		blue_business_profile_image_shape_enabled : false,
		creator_subscriptions_tweet_preview_api_enabled : true,
		freedom_of_speech_not_reach_fetch_enabled : false,
		graphql_is_translatable_rweb_tweet_is_translatable_enabled : false,
		interactive_text_enabled : false,
		longform_notetweets_consumption_enabled : true,
		longform_notetweets_inline_media_enabled : true,
		longform_notetweets_rich_text_read_enabled : true,
		longform_notetweets_richtext_consumption_enabled : false,
		responsive_web_edit_tweet_api_enabled : true,
		responsive_web_enhance_cards_enabled : false,
		responsive_web_graphql_exclude_directive_enabled : false,
		responsive_web_graphql_skip_user_profile_image_extensions_enabled : false,
		responsive_web_graphql_timeline_navigation_enabled : false,
		responsive_web_media_download_video_enabled : true,
		responsive_web_text_conversations_enabled : false,
		responsive_web_twitter_article_tweet_consumption_enabled : false,
		responsive_web_twitter_blue_verified_badge_is_enabled : false,
		rweb_lists_timeline_redesign_enabled : true,
		standardized_nudges_misinfo : true,
		tweet_awards_web_tipping_enabled : false,
		tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled : false,
		tweetypie_unmention_optimization_enabled : true,
		verified_phone_label_enabled : false,
		vibe_api_enabled : true,
		view_counts_everywhere_api_enabled : true
	}),
	TwitterAuth = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
	Common = function(Q)
	{
		Q = WC.JTO(Q)
		WR.Each(function(V)
		{
			switch (V.code)
			{
				case 214 :
					// {message:'BadRequest: Failed to get part of the tweet',locations:[{line:2317,column:3}],path:['user','result','timeline','timeline','instructions',0,'entries',5,'content','itemContent','tweet_results','result','legacy','retweeted_status_result','result','vibe'],extensions:{name:'BadRequestError',source:'Client',code:214,kind:'Validation',tracing:{trace_id:'...'}},code:214,kind:'Validation',name:'BadRequestError',source:'Client',tracing:{trace_id:'...'}}
					break
				default :
					O.Bad(V.code,V.message)
			}
		},Q.errors)
		return Q
	},
	SolveUser = function(User)
	{
		return {
			Non : true,
			ID : User.screen_name,
			View : '@' + User.screen_name,
			URL : Twitter + User.screen_name,
			Img : User.profile_image_url_https,
			UP : User.name,
			UPURL : Twitter + User.screen_name,
			Desc : (User.location ? '[[' + User.location + ']]\n\n' : '') + User.description
		}
	},
	SolveTweet = function(Tweet,User,ID)
	{
		var
		Media = WR.Path(['extended_entities','media'],Tweet),
		Retweet = Tweet.retweeted_status_id_str ||
			WR.Path(['retweeted_status_result','result','rest_id'],Tweet) ||
			Tweet.quoted_status_id_str,
		Title = WC.HED(Tweet.full_text),
		TitleMap = {};
		WR.EachU(function(V,F)
		{
			WR.Each(function(B)
			{
				if (B.url)
				{
					Title = Title.replace(RegExp('\\s*' + WR.SafeRX(B.url) + '\\s*','g'),'_')
					TitleMap[B.url] = function()
					{
						return 'media' === F || Retweet && RegExp(Twitter + '[^/]+/status/' + Retweet).test(B.expanded_url) ?
							'' :
							O.Ah(B.expanded_url,B.expanded_url)
					}
				}
			},V)
		},Tweet.entities)
		return {
			NonAV : !Media || Retweet,
			Group : WR.Path(['self_thread','id_str'],Tweet),
			ID : Tweet.id_str || ID,
			Img : Media && WR.Pluck('media_url_https',Media),
			Title : Title,
			TitleView : O.RepCon(WC.HED(Tweet.full_text),TitleMap),
			UP : User.name,
			UPURL : Twitter + User.screen_name,
			Date : Tweet.created_at,
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
		Tweet || O.Bad(B)
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
	MakeGraphQL = function(URL,Data)
	{
		return O.Req(MakeHead(
		{
			URL : URL,
			QS :
			{
				variables : WC.OTJ(Data),
				features : TwitterAPIGraphQLFeature
			}
		}))
	},
	SolveGraphQLTweet = function(B,I,Page)
	{
		var
		R = [],
		CheckTypeUser = function(V)
		{
			return V && 'User' === V.__typename &&
				R.push(SolveUser(V.legacy))
		},
		CheckTypeTweet = function(V)
		{
			return V && 'Tweet' === V.__typename &&
				R.push(SolveTweet(V.legacy,V.core.user_results.result.legacy)) &&
				WR.Each(CheckTypeTweet,
				[
					WR.Path(['quoted_status_result','result'],V),
					WR.Path(['legacy','retweeted_status_result','result'],V)
				])
		};
		B = Common(B)
		O.Walk(B,function(V,F)
		{
			return 'instructions' === F && !O.Walk(WR.Where(function(V)
			{
				return !Page || 'TimelinePinEntry' !== V.type
			},WR.Rev(V)),function(V)
			{
				var Begin = R.length;
				return V.promotedMetadata ||
					/^(TweetDetailRelatedTweets)-/i.test(V.entryId) ||
					CheckTypeUser(V) ||
					CheckTypeTweet(V) &&
					(-~Begin === R.length ||
						WR.Each(function(V){V.Group = R.length},R.slice(Begin)))
			})
		})
		return [R.length && SolveCursor(B),{Item : R}]
	},
	MakeUserTweet = function(User,Cursor)
	{
		return MakeGraphQL(TwitterAPIGraphQLUserTweet,
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
	},
	MakeUserMedia = function(User,Cursor)
	{
		return MakeGraphQL(TwitterAPIGraphQLUserMedia,
		{
			userId : User,
			count : O.Size,
			cursor : Cursor,
			includePromotedContent : false,
			withClientEventToken : false,
			withBirdwatchNotes : false,
			withVoice : true,
			withV2Timeline : false
		})
	},
	MakeHomeTimeline = function(Cursor)
	{
		return MakeGraphQL(TwitterAPIGraphQLHomeLatestTimeline,
		{
			count : O.Size,
			cursor : Cursor,
			includePromotedContent : false,
			latestControlAvailable : true,
			withDownvotePerspective : true,
			withReactionsMetadata : true,
			withReactionsPerspective : true,
		})
	},
	MakeSearchTimeline = function(Query,Cursor)
	{
		return MakeGraphQL(TwitterAPIGraphQLSearchTimeline,
		{
			rawQuery : Query,
			count : O.Size,
			cursor : Cursor,
			querySource : 'typed_query',
			product : 'Top'
		})
	};
	return {
		ID : 'Twitter',
		Alias : 'T',
		Judge : /\bTwitter\b/i,
		Min : 'auth_token ct0 guest_id rweb_optin',
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
			Name : O.NameFind,
			Example :
			[
				'メイドインアビス'
			],
			/*
			View : MakeTimeline(function(ID)
			{
				return WX.Just(MakeHead(TwitterAPIJSON(TwitterAPITypeSearch) + '&q=' + WC.UE(ID)))
			}),
			*/
			View : O.More(function(ID)
			{
				return MakeSearchTimeline(ID)
			},function(I,Page,ID)
			{
				return MakeSearchTimeline(ID,I[Page])
			},SolveGraphQLTweet),
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
			JudgeVal : O.ValNum,
			Example :
			[
				'1667068832064708608',
				{
					As : 'Sub',
					Val : '1667068832064708608',
					ID : '1667068832064708608'
				},
				{
					As : 'Inp',
					Val : TwitterUserTweet('ChromeDevTools','1667068832064708608'),
					ID : '1667068832064708608'
				}
			],
			View : function(ID)
			{
				return MakeGraphQL(TwitterAPIGraphQLTweetDetail,
				{
					focalTweetId : ID,
					includePromotedContent : false,
					with_rux_injections : false,
					withBirdwatchNotes : true,
					withCommunity : true,
					withQuickPromoteEligibilityTweetFields : true,
					withVoice : true,
					withV2Timeline : true
				}).Map(function(B)
				{
					return SolveGraphQLTweet(B)[1]
				})
			}
			/*
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
			*/
		},{
			Name : 'UserMedia',
			Judge :
			[
				/\.com\/([^/?]+)\/Media\b/i,
				O.Word('UserMedia')
			],
			Example :
			[
				'code',
				{
					As : 'Inp',
					Val : TwitterUserMedia('code'),
					ID : 'code'
				}
			],
			View : O.More(function(ID,I)
			{
				return O.Req(MakeHead(TwitterAPIGraphQLUserByScreen(WC.UE(WC.OTJ(ID))))).FMap(function(U)
				{
					return MakeUserMedia(I[0] = Common(U).data.user.rest_id)
				})
			},function(I,Page)
			{
				return MakeUserMedia(I[0],I[Page])
			},SolveGraphQLTweet)
		},{
			Name : 'User',
			Judge :
			[
				/(?:@|\.com\/)([^/?]+)/i,
				O.Word('User')
			],
			Example :
			[
				'github',
				{
					As : 'Inp',
					Val : TwitterUser('github'),
					ID : 'github'
				}
			],
			View : O.More(function(ID,I)
			{
				return O.Req(MakeHead(TwitterAPIGraphQLUserByScreen(WC.UE(WC.OTJ(ID))))).FMap(function(U)
				{
					return MakeUserTweet(I[0] = Common(U).data.user.rest_id)
				})
			},function(I,Page)
			{
				return MakeUserTweet(I[0],I[Page])
			},SolveGraphQLTweet)
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
			JudgeVal : O.ValNum,
			Example :
			[
				'2142731' // FireFox
			],
			View : MakeTimeline(function(ID)
			{
				return WX.Just(MakeHead(TwitterAPIJSON(TwitterAPITypeMedia + ID)))
			})
		},{
			Name : 'Timeline',
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
			// View : MakeTimeline(WR.Const(WX.Just(TwitterAPIJSON(TwitterAPITypeHome))))
			View : O.More(function()
			{
				return MakeHomeTimeline()
			},function(I,Page)
			{
				return MakeHomeTimeline(I[Page])
			},SolveGraphQLTweet)
		},{
			Name : O.NameUP,
			JudgeVal : false,
			Example :
			[
				''
			],
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
					Item : WR.Map(SolveUser,B.users)
				}]
			})
		}],
		IDURL : TwitterTweet
	}
})