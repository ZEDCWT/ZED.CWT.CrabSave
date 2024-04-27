'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	// We may need to resolve some tokens automatically if it changes in the future
	// /"[^"]+/main[^"]+/ https://abs.twimg.com/responsive-web/web/main.713ccc64.js
	Twitter = 'https://twitter.com/',
	TwitterTweet = WW.Tmpl(Twitter,'_/status/',undefined),
	TwitterUser = WW.Tmpl(Twitter,undefined),
	TwitterUserTweet = WW.Tmpl(Twitter,undefined,'/status/',undefined),
	TwitterUserMedia = WW.Tmpl(Twitter,undefined,'/media'),
	TwitterHashTag = WW.Tmpl(Twitter,'hashtag/',undefined),
	TwitterSearch = WW.Tmpl(Twitter,'search?q=',undefined),
	TwitterAPI = 'https://api.twitter.com/',
	// TwitterAPITypeHome = 'timeline/home',
	// TwitterAPITypeConversation = 'timeline/conversation/',
	// TwitterAPITypeMedia = 'timeline/media/',
	// TwitterAPITypeSearch = 'search/adaptive',
	TwitterAPITypeGuide = 'guide',
	TwitterAPISearchSug = WW.Tmpl(TwitterAPI,'1.1/search/typeahead.json?q=',undefined,'&tweet_mode=extended&count=',O.Size),
	TwitterAPIFollowing = WW.Tmpl(TwitterAPI,'1.1/friends/list.json?user_id=',undefined,'&cursor=',undefined,'&count=',O.Size),
	TwitterAPIJSON = WW.Tmpl(TwitterAPI,'2/',undefined,'.json?tweet_mode=extended&count=',O.Size),
	TwitterAPIGraphQL = TwitterAPI + 'graphql/',
	TwitterAPIGraphQLTweetDetail = TwitterAPIGraphQL + '3XDB26fBve-MmjHaWTUZxA/TweetDetail',
	// TwitterAPIGraphQLUserTweet = TwitterAPIGraphQL + 'UsDw2UjYF5JE6-KyC7MDGw/UserTweets',
	TwitterAPIGraphQLUserTweetReply = TwitterAPIGraphQL + '3GeIaLmNhTm1YsUmxR57tg/UserTweetsAndReplies',
	TwitterAPIGraphQLUserTweet = TwitterAPIGraphQL + 'PoZUz38XdT-pXNk0FRfKSw/UserTweets',
	TwitterAPIGraphQLUserMedia = TwitterAPIGraphQL + 'YqiE3JL1KNgf9nSljYdxaA/UserMedia',
	TwitterAPIGraphQLUserByScreen = TwitterAPIGraphQL + 'G6Lk7nZ6eEKd7LBBZw9MYw/UserByScreenName',
	// TwitterAPIGraphQLUserByRestID = TwitterAPIGraphQL + 'tD8zKvQzwY3kdx5yz6YmOw/UserByRestId', // {userId}
	// TwitterAPIGraphQLHomeTimeline = TwitterAPIGraphQL + '6VUR2qFhg6jw55JEvJEmmA/HomeTimeline',
	TwitterAPIGraphQLHomeLatestTimeline = TwitterAPIGraphQL + 'AKmCZTyU1gWxo41b4PrQGA/HomeLatestTimeline',
	TwitterAPIGraphQLSearchTimeline = TwitterAPIGraphQL + 'NA567V_8AFwu0cZEkAAKcw/SearchTimeline',
	TwitterAPIGraphQLFeature = WC.OTJ(
	{
		blue_business_profile_image_shape_enabled : false,
		c9s_tweet_anatomy_moderator_badge_enabled : true,
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
		rweb_video_timestamps_enabled : true,
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
				case 131 :
					// {message:'Dependency: Internal error. (131)',locations:[{line:2606,column:3}],path:['user','result','timeline_v2','timeline','instructions',1,'entries',13,'content','itemContent','tweet_results','result','tweet','legacy','retweeted_status_result','result','tweet','quoted_status_result','result'],extensions:{name:'DependencyError',source:'Server',retry_after:0,code:131,kind:'Operational',tracing:{trace_id:...}},code:131,kind:'Operational',name:'DependencyError',source:'Server',retry_after:0,tracing:{trace_id:...}}
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
			URL : TwitterUser(User.screen_name),
			Img : User.profile_image_url_https,
			UP : User.name,
			UPURL : TwitterUser(User.screen_name),
			More : (User.location ? '[[' + User.location + ']]\n\n' : '') + User.description
		}
	},
	SolveStringSpread = function(B)
	{
		var
		R = [],T,C,F = 0;
		for (;F < B.length;)
		{
			T = B.charAt(F)
			if ('\uD7FF' < T && T < '\uDC00' &&
				'\uDBFF' < (C = B.charAt(-~F)) && C < '\uE000')
			{
				R.push(T + C)
				F += 2
			}
			else
			{
				R.push(T)
				++F
			}
		}
		return R
	},
	SolveRichText = function(Q,S)
	{
		var
		Text = '',
		View = [],
		All = [],
		Pos = 0;
		Q = SolveStringSpread(Q)
		WR.EachU(function(V,F)
		{
			WR.Each(function(B)
			{
				WR.Each(function(N)
				{
					All.push([N,F,B])
				},WR.SplitAll(2,B.indices))
			},V)
		},S)
		All.sort(function(Q,S)
		{
			return Q[0][0] - S[0][0] || Q[0][1] - S[0][1]
		})
		WR.Each(function(V)
		{
			var
			Index = V[0],
			Type = V[1],
			SingleText,SingleView;
			V = V[2]
			if (Pos < Index[0])
			{
				SingleText = WC.HED(Q.slice(Pos,Index[0]).join(''))
				Text += SingleText
				View.push(SingleText)
				Pos = Index[0]
			}
			if (Pos === Index[0])
			{
				SingleText = Q.slice(Index[0],Index[1]).join('')
				SingleView = SingleText
				switch (Type)
				{
					case 'media' :
						SingleText = SingleView = null
						break
					case 'user_mentions' :
						SingleView = WV.Ah('@' + V.name,TwitterUser(V.screen_name))
						break
					case 'urls' :
						SingleText = V.expanded_url
						SingleView = WV.Ah(V.expanded_url,V.expanded_url)
						break
					case 'hashtags' :
						SingleView = WV.Ah('#' + V.text,TwitterHashTag(WC.UE(V.text)))
						break
					case 'symbols' :
						// CashTag
						SingleView = WV.Ah('$' + V.text,TwitterSearch(WC.UE('$' + V.text)))
						break
				}
				if (SingleText)
					Text += SingleText
				SingleView && View.push(SingleView)
				Pos = Index[1]
			}
		},All)
		if (Pos < Q.length)
		{
			Pos = WC.HED(Q.slice(Pos).join(''))
			Text += Pos
			View.push(Pos)
		}
		return [Text,View]
	},
	SolveTweet = function(Tweet,User,ID,Ext)
	{
		if (!Tweet)
		{
			/*
				1542440303566524416
					Removed? Can still view comments
			*/
			return {
				Non : true,
				ID : ID,
				UP : User.name,
				UPURL : TwitterUser(User.screen_name)
			}
		}

		var
		GroupKey = WR.Path(['self_thread','id_str'],Tweet),
		Retweet = Tweet.retweeted_status_id_str ||
			WR.Path(['retweeted_status_result','result','rest_id'],Tweet) ||
			Tweet.quoted_status_id_str,
		Media = WR.Path(['extended_entities','media'],Tweet),
		Img = [],
		Len = 0,
		Title = Tweet.full_text,
		TitleView,
		More = [],
		Card,
		UnifiedCard,

		U = [],

		SolveMedia = function(V)
		{
			Img.push(V.media_url_https)
			Len += WR.Path(['video_info','duration_millis'],V) || 0
		},
		SolveLink = function(V)
		{
			var T;
			if (/\.com\/intent\/tweet\?/.test(V))
			{
				T = WC.QSP(V).text
				T && WW.MR(function(_,V)
				{
					if (User.screen_name === V[1])
					{
						U.push(
						{
							Group : GroupKey,
							ID : V[2],
							UP : User.name,
							UPURL : TwitterUser(User.screen_name)
						})
					}
				},null,/\.com\/([^/]+)\/status\/(\d+)/g,T)
			}
		},
		SolveUnifiedCardComponent = function(V)
		{
			var D = V.data;
			switch (V.type)
			{
				case 'app_store_details' :
				case 'button_group' :
				case 'community_details' :
					break
				case 'details' :
					/*
						Both `details` and `media` have `destination`
						Of course they are ALWAYS pointing the same target, right?

						1769936840084340831
							Links of this contains `intent` to tweet
							And ending with a photo link to a tweet (by the same author, same created_at)
							Where the photo only tweets are EXCLUDED from the user post list, even INVISIBLE through the media type tab
							Seems to be a formal way to general tweet template with image
					*/
					More.push(O.Ah(D.title.content,D = UnifiedCard.destination_objects[D.destination].data.url_data.url))
					SolveLink(D)
					break
				case 'swipeable_media' :
					WR.Each(function(V)
					{
						SolveMedia(UnifiedCard.media_entities[V.id])
					},D.media_list)
					break
				case 'media' :
					SolveMedia(UnifiedCard.media_entities[D.id])
					break
				default :
					More.push('Unknown VideoWebsite.Component #' + UnifiedCard.name)
			}
		},

		T;

		Title = SolveRichText(Title,Tweet.entities)
		TitleView = Title[1]
		Title = Title[0]

		Retweet && More.push(O.Ah('RT ' + Retweet,TwitterTweet(Retweet)))

		Media && WR.Each(SolveMedia,Media)

		if (!Retweet && Ext)
		{
			if (Card = Ext.card)
			{
				Card = Card.legacy
				T = WR.FromPair(WR.Map(function(V)
				{
					return [V.key,V.value]
				},Card.binding_values))
				switch (Card.name.replace(/^\d+:/,''))
				{
					case 'audiospace' :
						/*
							1714316253840728170
								Linked to /i/spaces/.*
						*/
					case 'message_me' :
						/*
							1534968887606910977
								A button to DM
						*/
						break

					case 'broadcast' :
						/*
							1453638301756248064
								Linked to /i/broadcasts/.*
								LIVE with playback
						*/
						T.broadcast_thumbnail_original && Img.push(T.broadcast_thumbnail_original.image_value.url)
						More.push(T.broadcast_title.string_value)
						break
					case 'live_event' :
						/*
							1597257832927473664
								Linked to /i/event/${.event_id}
								With a media of `.media_type` that from an exist tweet `.media_tweet_id`
								And it will ask `TweetResultByRestId` for media playback
						*/
						T.event_thumbnail_original && Img.push(T.event_thumbnail_original.image_value.url)
						More.push(T.media_tweet_id ?
							O.Ah(T.event_title.string_value,TwitterTweet(T.media_tweet_id.string_value)) :
							T.event_title.string_value)
						T.event_subtitle && More.push(T.event_subtitle.string_value)
						break
					case 'periscope_broadcast' :
						/*
							1354670923056508929
								LIVE of pscp.tv
						*/
						T.thumbnail_original && Img.push(T.thumbnail_original.image_value.url)
						More.push(T.title.string_value)
						break
					case 'player' :
						/*
							1763876724335591433
								A video link from other sites
						*/
						T.player_image_original && Img.push(T.player_image_original.image_value.url)
						More.push(O.Ah(T.title.string_value,T.player_url.string_value))
						T.description && More.push(T.description.string_value)
						break
					case 'promo_image_convo' :
						/*
							1766042676791845249
								An image
								With multiple topic to tweet
						*/
						T.promo_image_original && Img.push(T.promo_image_original.image_value.url)
					case 'promo_video_convo' :
						/*
							1614445686694760451
								A video
								And a button to retweet the topic
								Has both `player_url` and `player_stream_url` with `player_stream_content_type`
								Where the playback is wrapped by `VMap` XML
						*/
						T.player_image_original && Img.push(T.player_image_original.image_value.url)
						T.title && More.push(T.title.string_value)
						More.push(T.thank_you_text.string_value)
						// Is there any damnable reason to use the stupid word instead of number...
						WR.Each(function(V)
						{
							V = 'cta_' + V
							WR.Has(V,T) && More.push(T[V].string_value)
						},[
							'one',
							'two',
							'three',
							'four',
							'five',
							'six',
							'seven',
							'eight',
							'nine'
						])
						break

					case 'app' :
						/*
							926756857200254978
								A link to external site
						*/
					case 'summary' :
						/*
							1763900977298681910
								A link to an app
						*/
					case 'summary_large_image' :
						/*
							1763885406448439554
								A shared content
								Card contains image + desc
								`full_text` is the link
							1762820559015199221
								A link
								With NO image... Why
						*/
						T.photo_image_full_size_original ? Img.push(T.photo_image_full_size_original.image_value.url) :
							T.thumbnail_original ? Img.push(T.thumbnail_original.image_value.url) :
							null
						More.push(O.Ah(T.title.string_value,T.card_url.string_value))
						T.description && More.push(T.description.string_value)
						break

					case 'unified_card' :
						UnifiedCard = WC.JTO(T.unified_card.string_value)
						switch (UnifiedCard.type)
						{
							case undefined :
								/*
									1763928542067462593
										A link to a community
										Also contains the banner
								*/
							case 'image_app' :
								/*
									1688838930634866688
										An image
										And a button linked to an app
								*/
							case 'image_carousel_app' :
								/*
									1540286698696847360
										A slide show linked to other site
										And a button linked to an app
								*/
							case 'image_carousel_website' :
								/*
									1569998075627970562
										A slide show linked to other site
								*/
							case 'image_website' :
								/*
									1733464007770845576
										An image
								*/
							case 'mixed_media_multi_dest_carousel_website' :
								/*
									1783692484025143535
										A slide show including images and videos
								*/
							case 'mixed_media_single_dest_carousel_app' :
								/*
									1734477459255677210
										A slide show including images and videos
										And a link to an app
								*/
							case 'mixed_media_single_dest_carousel_website' :
								/*
									1638556135392423937
										A slide show including images and videos
								*/
							case 'video_app' :
								/*
									1727303783024349509
										A media
										Linked to platform related app store
								*/
							case 'video_carousel_app' :
								/*
									1744991688094089226
										A slide of videos
										And a link to an app
								*/
							case 'video_website' :
								/*
									1763942349531398254
										A media
										Which is linked to other site
								*/
								WR.Each(function(V){SolveUnifiedCardComponent(UnifiedCard.component_objects[V])},UnifiedCard.components)
								break
							case 'image_collection_website' :
								/*
									1769936840084340831
										A key image
										And a slide show of buttons
										Building up a `collection`
								*/
							case 'image_multi_dest_carousel_website' :
								/*
									1707176656329482544
										A slide show linked to other site
										Each image with different description
								*/
							case 'video_multi_dest_carousel_website' :
								/*
									1649223927993106432
										A slide show of videos
								*/
								switch (UnifiedCard.layout.type)
								{
									case 'collection' :
										// Where the first item being the key view, the rest are the actual slides
									case 'swipeable' :
										WR.Each(function(V)
										{
											WR.Each(function(B)
											{
												SolveUnifiedCardComponent(UnifiedCard.component_objects[B])
											},V)
										},UnifiedCard.layout.data.slides)
										break
									default :
										More.push('Unknown UnifiedCard.ImageMulti.Layout #' + UnifiedCard.layout.type)
								}
								break
							default :
								More.push('Unknown UnifiedCard #' + UnifiedCard.type)
						}
						break
					default :
						if (/^poll\d+choice_(text_only|video)$/.test(Card.name)) ~function()
						{
							/*
								1764169483302977708
									A vote
								1014798461546348545
									A video
									The vote is hidden
							*/
							var
							Vote,
							Sum = 0;
							More.push(WW.Quo('Vote') + WW.StrDate(T.end_datetime_utc.string_value,WW.DateColS))
							Vote = WR.ReduceU(function(D,V,F)
							{
								var C;
								if (C = /^choice(\d+)_(count|label)$/.exec(F))
								{
									D[C[1] = ~-C[1]] || (D[C[1]] = ['',0])
									if ('label' === C[2])
										D[C[1]][0] = V.string_value
									else
										Sum += D[C[1]][1] = +V.string_value
								}
							},[],T)
							WR.EachU(function(V,F)
							{
								More.push(WW.Quo(F) +
									V[1] +
									':' +
									(Sum ? WR.ToFix(2,100 * V[1] / Sum) + '%' : '0%') +
									' ' +
									V[0])
							},Vote)
						}()
						else More.push('Unknown Card #' + Card.name)
				}
			}
		}

		return WR.Pre(
		{
			NonAV : !Media || Retweet,
			Group : GroupKey,
			ID : Tweet.id_str || ID,
			URL : TwitterUserTweet(User.screen_name,Tweet.id_str || ID),
			Img : Img,
			Title : Title,
			TitleView : TitleView,
			UP : User.name,
			UPURL : TwitterUser(User.screen_name),
			Date : Tweet.created_at,
			Len : Len && WW.StrMS(Len),
			More : More
		},U)
	},
	/*
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
	*/
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
		Prompt = [],
		CheckTypePrompt = function(V)
		{
			/*
				Happens when we hit the request limit
				{"contentType":"TimelineInlinePrompt","headerText":"サブスクライブしてより多くの投稿を表示する","bodyText":"本日の投稿表示制限に達しました。1日に表示可能な投稿数を増やすにはサブスクライブしてください。","primaryButtonAction":{"text":"購読する","action":{"url":"https://twitter.com/i/twitter_blue_sign_up","dismissOnClick":false}}}

				Also the direct premium prompt...
				{"contentType":"TimelineInlinePrompt","headerText":"広告をなくす","bodyText":"Xプレミアムプラスで [おすすめ] と [フォロー中] に表示される広告をなくす","primaryButtonAction":{"text":"サブスクライブする","action":{"url":"https://x.com/i/premium_sign_up?referring_page=timeline_prompt","dismissOnClick":true,"onClickCallbacks":[{"endpoint":"/1.1/onboarding/fatigue.json?flow_name=premium-plus-upsell-prompt&fatigue_group_name=PremiumPlusUpsellFatigueGroup&action_name=click&scribe_name=primary_cta&display_location=home_latest&served_time_secs=1710247323&injection_type=inline_message"}],"clientEventInfo":{"action":"primary_cta"}}},"headerRichText":{"text":"広告をなくす","entities":[]},"bodyRichText":{"text":"Xプレミアムプラスで [おすすめ] と [フォロー中] に表示される広告をなくす","entities":[]}}
			*/
			return V && 'TimelineMessagePrompt' === V.__typename &&
				Prompt.push(
				{
					Non : true,
					Title : V.content.headerText,
					More :
					[
						V.content.bodyText,
						O.Ah(V.content.primaryButtonAction.text,V.content.primaryButtonAction.action.url)
					]
				})
		},
		CheckTypeCommunity = function(V)
		{
			return V && 'Community' === V.__typename
		},
		UserHas = {},
		CheckTypeUser = function(V)
		{
			return V && 'User' === V.__typename &&
			(
				V = SolveUser(V.legacy),
				WR.Has(V.ID,UserHas) || (UserHas[V.ID] = R.push(V))
			)
		},
		AddTweet = function(V)
		{
			WR.Each(function(V){R.push(V)},SolveTweet(V.legacy,V.core.user_results.result.legacy,V.rest_id,V))
			WR.Each(CheckTypeTweet,
			[
				WR.Path(['quoted_status_result','result'],V),
				WR.Path(['legacy','retweeted_status_result','result'],V)
			])
		},
		CheckTypeTweet = function(V)
		{
			switch (V && V.__typename)
			{
				case 'Tweet' :
					AddTweet(V)
					return true
				case 'TweetWithVisibilityResults' :
					AddTweet(V.tweet)
					return true
			}
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
					CheckTypePrompt(V) ||
					CheckTypeCommunity(V) ||
					CheckTypeUser(V) ||
					CheckTypeTweet(V) &&
					(-~Begin === R.length ||
						WR.Each(function(V){V.Group = R.length},R.slice(Begin)))
			})
		})
		return [R.length && SolveCursor(B),{Item : R.length ? R : Prompt}]
	},
	UserCommon =
	{
		Reply : [TwitterAPIGraphQLUserTweetReply,
		{
			includePromotedContent : false,
			withCommunity : true,
			withVoice : true,
			withV2Timeline : true
		}],
		Post : [TwitterAPIGraphQLUserTweet,
		{
			includePromotedContent : false,
			withQuickPromoteEligibilityTweetFields : true,
			withSuperFollowsUserFields : true,
			withDownvotePerspective : true,
			withReactionsMetadata : true,
			withReactionsPerspective : true,
			withSuperFollowsTweetFields : true,
			withVoice : true,
			withV2Timeline : true
		}],
		Media : [TwitterAPIGraphQLUserMedia,
		{
			includePromotedContent : false,
			withClientEventToken : false,
			withBirdwatchNotes : false,
			withVoice : true,
			withV2Timeline : true
		}],
	},
	MakeUserCommon = function(Type,DirectID)
	{
		var
		Query = function(User,Cursor)
		{
			return MakeGraphQL(Type[0],WW.Merge(
			{
				userId : User,
				count : O.Size,
				cursor : Cursor
			},Type[1]))
		};
		return O.More(function(ID,I)
		{
			return (DirectID ?
				WX.Just(ID) :
				MakeGraphQL(TwitterAPIGraphQLUserByScreen,{screen_name : ID,withHighlightedLabel : true})
					.Map(function(B){return Common(B).data.user.rest_id}))
				.FMap(function(ID)
				{
					return Query(I[0] = ID)
				})
		},function(I,Page)
		{
			return Query(I[0],I[Page])
		},SolveGraphQLTweet)
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
			querySource : '',
			product : 'Top'
		})
	};
	return {
		ID : 'Twitter',
		Alias : 'T',
		Judge : /\bTwitter\b|\bX\.com\b/i,
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
			Judge : /\bSearch\b.*?\bQ=([^#&?]+)/i,
			JudgeMap : function(V)
			{
				return WC.UD(V[1])
			},
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
			Name : 'HashTag',
			Judge :
			[
				/\bHashTag\/([^#/?]+)/i,
				O.Word('HashTag')
			],
			JudgeMap : function(V)
			{
				return WC.UD(V[1])
			},
			View : O.More(function(ID)
			{
				return MakeSearchTimeline('#' + ID)
			},function(I,Page,ID)
			{
				return MakeSearchTimeline('#' + ID,I[Page])
			},SolveGraphQLTweet),
		},{
			Name : 'UserPost',
			Judge :
			[
				O.Word('UserPost')
			],
			Example :
			[
				'code'
			],
			View : MakeUserCommon(UserCommon.Post)
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
			View : MakeUserCommon(UserCommon.Media)
		},{
			Name : 'User',
			Judge :
			[
				/(?:@|\.com\/)\s*((?![_I]\b)[^&?#\s/]+)/i,
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
			View : MakeUserCommon(UserCommon.Reply)
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
			View : MakeUserCommon(UserCommon.Reply,true)
			/*
			View : MakeTimeline(function(ID)
			{
				return WX.Just(MakeHead(TwitterAPIJSON(TwitterAPITypeMedia + ID)))
			})
			*/
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