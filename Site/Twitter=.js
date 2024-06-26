'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC,N : WN} = WW,

// Twitter = 'https://twitter.com/',
Twitter = 'https://x.com/',
TwitterTweet = WW.Tmpl(Twitter,'_/status/',undefined),
TwitterTweetFull = WW.Tmpl(Twitter,undefined,'/status/',undefined),
// TwitterAPI = 'https://api.twitter.com/',
TwitterAPI = 'https://api.x.com/',
// TwitterAPITimelineConversation = WW.Tmpl(TwitterAPI,'2/timeline/conversation/',undefined,'.json?tweet_mode=extended&count=20'),
TwitterAPIGraphQL = TwitterAPI + 'graphql/',
TwitterAPIGraphQLTweetDetail = TwitterAPIGraphQL + '3XDB26fBve-MmjHaWTUZxA/TweetDetail',
TwitterAuth = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
TwitterAPIBroadcastShow = WW.Tmpl(TwitterAPI,'1.1/broadcasts/show.json?ids=',undefined),
TwitterAPILiveStream = WW.Tmpl(TwitterAPI,'1.1/live_video_stream/status/',undefined),

TwitterAPIGraphQLFeature = WC.OTJ(
{
	creator_subscriptions_tweet_preview_api_enabled : true,
	freedom_of_speech_not_reach_fetch_enabled : false,
	graphql_is_translatable_rweb_tweet_is_translatable_enabled : false,
	longform_notetweets_consumption_enabled : true,
	longform_notetweets_inline_media_enabled : true,
	longform_notetweets_rich_text_read_enabled : true,
	responsive_web_edit_tweet_api_enabled : true,
	responsive_web_enhance_cards_enabled : false,
	responsive_web_graphql_exclude_directive_enabled : false,
	responsive_web_graphql_skip_user_profile_image_extensions_enabled : false,
	responsive_web_graphql_timeline_navigation_enabled : false,
	responsive_web_media_download_video_enabled : true,
	responsive_web_twitter_article_tweet_consumption_enabled : false,
	rweb_lists_timeline_redesign_enabled : true,
	standardized_nudges_misinfo : true,
	tweet_awards_web_tipping_enabled : false,
	tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled : false,
	tweetypie_unmention_optimization_enabled : true,
	verified_phone_label_enabled : false,
	view_counts_everywhere_api_enabled : true,
});

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	CommonErrorIgnore = new Set(
	[
		37,
		214,
	]),
	Common = Q =>
	{
		Q = WC.JTO(Q)
		Q.errors?.some(V => !CommonErrorIgnore.has(V.code)) && O.Bad(Q.errors)
		return Q
	},
	MakeHead = Q => WN.ReqOH(Q,
	[
		'X-CSRF-Token',WC.CokeP(O.CokeRaw()).ct0,
		'Authorization','Bearer ' + TwitterAuth
	]),
	MakeGraphQL = (URL,Data) => MakeHead(
	{
		URL : URL,
		QS :
		{
			variables : WC.OTJ(Data),
			features : TwitterAPIGraphQLFeature,
		}
	});

	return {
		URL : (ID,Ext) =>
		{
			var
			SolveTweet = (Tweet,User,Meta,Info) =>
			{
				var
				Legacy = Tweet.legacy,
				Card = Tweet.card,
				UnifiedCard,

				Retweet = Legacy.retweeted_status_id_str ||
					WR.Path(['retweeted_status_result','result','rest_id'],Legacy) ||
					Legacy.quoted_status_id_str,

				Title = Legacy.full_text,
				Cover,
				Part = [],
				MediaURL = [],
				MediaExt = [],

				SolveRichText = (Q,S) =>
				{
					var
					Text = '',
					Meta = [],
					All = [],
					Pos = 0;
					Q = [...Q]
					WR.EachU((V,F) => WR.Each(B =>
						WR.Each(N => All.push([N,F,B]),WR.SplitAll(2,B.indices)),V),S)
					All.sort((Q,S) => Q[0][0] - S[0][0] || Q[0][1] - S[0][1])
					All.forEach(V =>
					{
						var
						Index = V[0],
						Type = V[1],
						SingleText,SingleMeta;
						V = V[2]
						if (Pos < Index[0])
						{
							SingleText = WC.HED(Q.slice(Pos,Index[0]).join``)
							Text += SingleText
							Pos = Index[0]
						}
						if (Pos === Index[0])
						{
							SingleText = Q.slice(...Index).join``
							switch (Type)
							{
								case 'media' :
									SingleText = null
									break
								// case 'user_mentions' :
								// 	break
								case 'urls' :
									SingleText = V.expanded_url
									break
								// case 'hashtags' :
								// 	break
								// case 'symbols' :
								// 	break
							}
							if (SingleText)
								Text += SingleText
							SingleMeta && Meta.push(SingleMeta)
							Pos = Index[1]
						}
					})
					if (Pos < Q.length)
					{
						Pos = WC.HED(Q.slice(Pos).join(''))
						Text += Pos
					}
					return [Text,...Meta]
				},
				SolveMediaContentType = V => '.' + WW.MF(/\/(\w+)/,V),
				SolveMedia = V =>
				{
					var T;
					if (T = V.video_info)
					{
						T = T.variants
						T = O.Best('bitrate',T.filter(V => WW.IsNum(V.bitrate)))
						MediaURL.push(T.url)
						MediaExt.push(SolveMediaContentType(T.content_type))
					}
					else if (T = V.media_url_https)
					{
						MediaURL.push(T)
						MediaExt.push(null)
					}
					else WW.Throw('Unknown Media Type #' + V.type)
				},
				SolveMediaBroadcast = V =>
				{
					Part.push(Ext.ReqB(O.Coke(MakeHead(TwitterAPIBroadcastShow(V)))).FMap(Broadcast =>
					{
						Broadcast = Common(Broadcast).broadcasts[V]
						return Ext.ReqB(O.Coke(MakeHead(TwitterAPILiveStream(Broadcast.media_key)))).Map(Live =>
						{
							Live = Common(Live).source
							return {URL : [Live.noRedirectPlaybackUrl]}
						})
					}))
				},
				SolveMediaAuto = (URL,Type) =>
				{
					if (/\.vmap$/i.test(URL))
						Part.push(Ext.ReqB(O.Req(URL)).Map(B =>
						{
							B = WC.XMLP(WC.XMLS({}) + B)
							B = O.Best('bit_rate',B.All['tw:videoVariant']
								.map(V => V.Attr)
								.filter(V => V.bit_rate))
							return {URL : [WC.UD(B.url)],Ext : SolveMediaContentType(B.content_type)}
						}))
					else
					{
						MediaURL.push(URL)
						MediaExt.push(Type)
					}
				},
				SolveUnifiedCardComponent = V =>
				{
					var D = V.data;
					switch (V.type)
					{
						case 'app_store_details' :
						case 'button_group' :
						case 'community_details' :
							break
						case 'details' :
							Meta.push(
								D.title.content,
								'\t' + UnifiedCard.destination_objects[D.destination].data.url_data.url)
							break
						case 'media' :
							SolveMedia(UnifiedCard.media_entities[D.id])
							break
						case 'swipeable_media' :
							WR.Each(V => SolveMedia(UnifiedCard.media_entities[V.id]),D.media_list)
							break
						case 'twitter_list_details' :
							Meta.push(
								D.name.content,
								'\t' + UnifiedCard.destination_objects[D.destination].data.url_data.url)
							break
						default :
							WW.Throw('Unknown Component #' + V.type + ' ' + WC.OTJ(UnifiedCard))
					}
				},

				T;

				Meta.length && Meta.push('')
				Meta.push
				(
					TwitterTweetFull(User.screen_name,Legacy.id_str),
					WW.StrDate(Legacy.created_at,WW.DateColS) + ' ' + User.name,
				)
				Title = SolveRichText(Title,Legacy.entities)
				Meta.push(...Title)
				Title = Title[0]
				WR.EachU((V,F) =>
				{
					WR.EachU((B,G) =>
					{
						if (B.url)
						{
							Meta.push(
								WR.Pascal(F).replace(/s$/,'') + ' ' + WW.Quo(WW.ShowLI(V.length,G)) + B.url,
								'\t' + B.expanded_url)
						}
					},V)
				},Legacy.entities)

				WR.Each(V =>
				{
					if (V.source_status_id_str && V.source_status_id_str !== Legacy.id_str)
						return
					SolveMedia(V)
				},WR.Path(['extended_entities','media'],Legacy) || [])

				if (!Retweet && Card)
				{
					Meta.length && Meta.push('')
					Card = Card.legacy
					T = WR.FromPair(Card.binding_values.map(V => [V.key,V.value]))
					switch (Card.name.replace(/^\d+:/,''))
					{
						case 'audiospace' :
						case 'message_me' :
							break

						case 'broadcast' :
							if (T.broadcast_thumbnail_original)
								Cover = T.broadcast_thumbnail_original.image_value.url
							Meta.push(Title = T.broadcast_title.string_value)
							SolveMediaBroadcast(T.broadcast_id.string_value)
							break
						case 'live_event' :
							if (T.event_thumbnail_original)
								Cover = T.event_thumbnail_original.image_value.url
							T.media_tweet_id && Meta.push(TwitterTweet(T.media_tweet_id.string_value))
							Meta.push(T.event_title.string_value)
							T.event_subtitle && Meta.push(T.event_subtitle.string_value)
							break
						case 'periscope_broadcast' :
							if (T.thumbnail_original)
								Cover = T.thumbnail_original.image_value.url
							Meta.push(Title = T.title.string_value)
							SolveMediaBroadcast(T.id.string_value)
							break
						case 'player' :
							if (T.player_image_original)
								Cover = T.player_image_original.image_value.url
							Meta.push
							(
								T.player_url.string_value,
								T.title.string_value,
							)
							T.description && Meta.push(T.description.string_value)
							break
						case 'promo_image_convo' :
							if (T.promo_image_original)
							{
								MediaURL.push(T.promo_image_original.image_value.url)
								MediaExt.push(null)
							}
						case 'promo_video_convo' :
							if (T.player_image_original)
								Cover = T.player_image_original.image_value.url
							T.title && Meta.push(T.title.string_value)
							Meta.push('\t' + T.thank_you_text.string_value)
							WR.Each(V =>
							{
								V = 'cta_' + V
								WR.Has(V,T) && Meta.push(T[V].string_value)
								V += '_tweet'
								WR.Has(V,T) && Meta.push('\t' + T[V].string_value)
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
							T.player_stream_url && SolveMediaAuto(T.player_stream_url.string_value,SolveMediaContentType(T.player_stream_content_type.string_value))
							break

						case 'app' :
						case 'summary' :
						case 'summary_large_image' :
							Meta.push(T.title.string_value)
							T.description && Meta.push(T.description.string_value)
							T.photo_image_full_size_original ? Part.push({URL : [T.photo_image_full_size_original.image_value.url],Ext : '.jpg'}) :
								T.thumbnail_original ? Part.push({URL : [T.thumbnail_original.image_value.url],Ext : '.jpg'}) :
								null
							break

						case 'unified_card' :
							UnifiedCard = WC.JTO(T.unified_card.string_value)
							switch (UnifiedCard.type)
							{
								case undefined :
								case 'image_app' :
								case 'image_carousel_app' :
								case 'image_carousel_website' :
								case 'image_website' :
								case 'mixed_media_multi_dest_carousel_website' :
								case 'mixed_media_single_dest_carousel_app' :
								case 'mixed_media_single_dest_carousel_website' :
								case 'video_app' :
								case 'video_carousel_app' :
								case 'video_carousel_website' :
								case 'video_website' :
									WR.Each(V => SolveUnifiedCardComponent(UnifiedCard.component_objects[V]),UnifiedCard.components)
									break
								case 'image_collection_website' :
								case 'image_multi_dest_carousel_website' :
								case 'video_multi_dest_carousel_website' :
									switch (UnifiedCard.layout.type)
									{
										case 'collection' :
										case 'swipeable' :
											WR.Each(V => WR.Each(B => SolveUnifiedCardComponent(UnifiedCard.component_objects[B]),V),
												UnifiedCard.layout.data.slides)
											break
										default :
											WW.Throw('Unknown UnifiedCard.ImageMulti.Layout #' + UnifiedCard.layout.type)
									}
									break
								default :
									WW.Throw('Unknown UnifiedCard #' + UnifiedCard.type + ' ' + WC.OTJ(UnifiedCard))
							}
							break
						default :
							if (/^poll\d+choice_(text_only|video)$/.test(Card.name)) (() =>
							{
								var
								Vote,
								Sum = 0;
								Meta.push(WW.Quo('Vote') + WW.StrDate(T.end_datetime_utc.string_value,WW.DateColS))
								Vote = WR.ReduceU((D,V,F) =>
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
								WR.EachU((V,F) =>
								{
									Meta.push(WW.Quo(F) +
										V[1] +
										':' +
										(Sum ? WR.ToFix(2,100 * V[1] / Sum) + '%' : '0%') +
										' ' +
										V[0])
								},Vote)
								T.player_stream_url && SolveMediaAuto(T.player_stream_url.string_value,null)
							})()
							else WW.Throw('Unknown Card #' + Card.name + ' ' + WC.OTJ(T))
					}
				}

				MediaURL.length && Part.push({URL : MediaURL,Ext : MediaExt})
				Part.forEach(V =>
				{
					if (V.URL) V.URL = V.URL.map(V =>
					{
						if (/\/\/pbs.twimg.com/.test(V))
						{
							V = V.split('?')
							V = V[0] + '?' +
								WC.QSS(V = WC.QSP(V[1] || ''),V.name = 'orig')
						}
						return V
					})
				})

				if (Info)
				{
					Info.Cover = Cover
					Info.Title = WR.Trim(Title)
					Info.UP = User.name
					Info.Date = Legacy.created_at
					Info.Part = Part
				}
			};

			return Ext.ReqB(O.Coke(MakeGraphQL(TwitterAPIGraphQLTweetDetail,
			{
				focalTweetId : ID,
				includePromotedContent : false,
				with_rux_injections : false,
				withBirdwatchNotes : true,
				withCommunity : true,
				withQuickPromoteEligibilityTweetFields : true,
				withVoice : true,
				withV2Timeline : true
			}))).FMap(B =>
			{
				var
				Prelude = [],
				Info = {},Meta,
				Reply = [],
				AddMaybe = B =>
				{
					switch (B?.__typename)
					{
						case 'Tweet' :
							AddTweet(B)
							return true
						case 'TweetWithVisibilityResults' :
							AddTweet(B.tweet)
							return true
					}
				},
				AddTweet = V =>
				{
					var
					Legacy = V.legacy,
					User = V.core.user_results.result.legacy;
					Legacy.id_str === ID ?
						SolveTweet(V,User,Meta = [],Info) :
						SolveTweet(V,User,Meta ? Reply : Prelude)
					WR.Each(AddMaybe,
					[
						V.quoted_status_result?.result,
						Legacy.retweeted_status_result?.result,
					])
				};
				B = Common(B)
				O.Walk(B,V => 'TimelineAddEntries' === V.type && WR.Each(V =>
				{
					/*
					{component:'related_tweet',details:{conversationDetails:{conversationSection:'RelatedTweet'}}}
					Though we could check `content.item[...].item.clientEventInfo` to see if we care it or not
					Well, let us do it the easy (unstable?) way
					*/
					/^(Tweet|ConversationThread)-/i.test(V.entryId) && O.Walk(V,V =>
					{
						var R = V.promotedMetadata;
						R = R || AddMaybe(V)
						return R
					})
				},V.entries))
				Info.Meta = O.MetaJoin
				(
					Prelude,
					Meta,
					Reply,
				)
				return O.Part(Info.Part,
				{
					ReqB : Q => Ext.ReqB(WN.ReqOH(Q,'Referer',Twitter)),
				}).Map(Part => (
				{
					...Info,
					Part,
				}))
			})
		},
		/*
		// Why did they terminate such a simple endpoint...
		URL : (ID,Ext) => Ext.ReqB(O.Coke(MakeHead(TwitterAPITimelineConversation(ID)))).Map(B =>
		{
			var
			Tweet,User,
			Info = {},
			Meta = [];
			B = WC.JTO(B)
			B.errors && O.Bad(B.errors[0])
			Tweet = B.globalObjects.tweets[ID]
			Tweet || O.Bad(B)
			User = B.globalObjects.users[Tweet.user_id_str]

			SolveTweet(Tweet,User,Meta,Info)
			Info.Meta = Meta

			return Info
		}),
		*/
		Pack : O.PackM3U(
		{
			Pack : Q => WN.ReqOH(Q,'Referer',Twitter),
		}),
		Range : false,
	}
}