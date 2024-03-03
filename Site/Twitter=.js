'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC,N : WN} = WW,

Twitter = 'https://twitter.com/',
TwitterTweetFull = WW.Tmpl(Twitter,undefined,'/status/',undefined),
TwitterAPI = 'https://api.twitter.com/',
// TwitterAPITimelineConversation = WW.Tmpl(TwitterAPI,'2/timeline/conversation/',undefined,'.json?tweet_mode=extended&count=20'),
TwitterAPIGraphQL = TwitterAPI + 'graphql/',
TwitterAPIGraphQLTweetDetail = TwitterAPIGraphQL + '3XDB26fBve-MmjHaWTUZxA/TweetDetail',
TwitterAuth = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',

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
	Common = Q =>
	{
		Q = WC.JTO(Q)
		Q.errors?.some(V => 214 - V.code) && O.Bad(Q.errors)
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
	}),

	SolveTweet = (Tweet,User,Meta,Info) =>
	{
		var
		Legacy = Tweet.legacy,
		Card = Tweet.card,

		Retweet = Tweet.retweeted_status_id_str ||
			WR.Path(['retweeted_status_result','result','rest_id'],Tweet) ||
			Tweet.quoted_status_id_str,

		Title = WC.HED(Legacy.full_text),
		Cover,
		Part = [],
		MediaURL = [],
		MediaExt = [],

		SolveMedia = V =>
		{
			var T;
			if (T = V.video_info)
			{
				T = T.variants
				T = O.Best('bitrate',T.filter(V => WW.IsNum(V.bitrate)))
				MediaURL.push(T.url)
				MediaExt.push('.' + WW.MF(/\/(\w+)/,T.content_type))
			}
			else if (T = V.media_url_https)
			{
				MediaURL.push(T)
				MediaExt.push(null)
			}
			else WW.Throw('Unknown Media Type #' + V.type)
		},

		T;

		Meta.length && Meta.push('')
		Meta.push
		(
			TwitterTweetFull(User.screen_name,Legacy.id_str),
			WW.StrDate(Legacy.created_at,WW.DateColS) + ' ' + User.name,
			Title
		)
		WR.EachU((V,F) =>
		{
			WR.EachU((B,G) =>
			{
				if (B.url)
				{
					Title = Title.replace(RegExp(`\\s*${WR.SafeRX(B.url)}\\s*`,'g'),'_')
					Meta.push(
						WR.Pascal(F).replace(/s$/,'') + ' ' + WW.Quo(WW.ShowLI(V.length,G)) + ' ' + B.url,
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
			switch (Card.name)
			{
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
				case 'summary' :
				case 'summary_large_image' :
					Meta.push(T.title.string_value)
					T.description && Meta.push(T.description.string_value)
					T.photo_image_full_size_original && Part.push({URL : [T.photo_image_full_size_original.image_value.url],Ext : '.jpg'})
					break
				case 'unified_card' :
					T = WC.JTO(T.unified_card.string_value)
					switch (T.type)
					{
						case undefined :
							break
						case 'video_website' :
							WR.Each(V =>
							{
								var D = V.data;
								switch (V.type)
								{
									case 'details' :
										break
									case 'media' :
										SolveMedia(T.media_entities[D.id])
										Meta.push(T.destination_objects[D.destination].data.url_data.url)
										break
									default :
										WW.Throw('Unknown VideoWebsite.Component #' + T.name + ' ' + WC.OTJ(T))
								}
							},T.component_objects)
							break
						default :
							WW.Throw('Unknown UnifiedCard #' + T.type + ' ' + WC.OTJ(T))
					}
					break
				default :
					if (/^poll\d+choice_text_only$/.test(Card.name)) (() =>
					{
						var
						Vote,
						Sum = 0;
						Meta.push(WW.Quo('Vote') + WW.StrDate(T.end_datetime_utc.string_value,WW.DateColS))
						Vote = WR.ReduceU((D,V,F) =>
						{
							var C;
							if (C = /^choice(\d+)_(label)$/.exec(F))
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
					})()
					else WW.Throw('Unknown Card #' + Card.name + ' ' + WC.OTJ(T))
			}
		}

		MediaURL.length && Part.push({URL : MediaURL,Ext : MediaExt})
		Part.forEach(V =>
		{
			V.URL = V.URL.map(V =>
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

	return {
		URL : (ID,Ext) => Ext.ReqB(O.Coke(MakeGraphQL(TwitterAPIGraphQLTweetDetail,
		{
			focalTweetId : ID,
			includePromotedContent : false,
			with_rux_injections : false,
			withBirdwatchNotes : true,
			withCommunity : true,
			withQuickPromoteEligibilityTweetFields : true,
			withVoice : true,
			withV2Timeline : true
		}))).Map(B =>
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
			return Info
		}),
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
		Range : false
	}
}