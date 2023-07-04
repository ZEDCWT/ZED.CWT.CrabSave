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
		Title = WC.HED(Tweet.full_text),
		Part = [],
		MediaURL = [],
		MediaExt = [],
		T;
		Meta.length && Meta.push('')
		Meta.push
		(
			TwitterTweetFull(User.screen_name,Tweet.id_str),
			WW.StrDate(Tweet.created_at,WW.DateColS) + ' ' + User.name,
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
		},Tweet.entities)
		if (Info)
		{
			WR.Each(V =>
			{
				if (V.source_status_id_str && V.source_status_id_str !== Tweet.id_str)
					return

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
			},WR.Path(['extended_entities','media'],Tweet) || [])
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
			Info.Title = WR.Trim(Title)
			Info.UP = User.name
			Info.Date = +new Date(Tweet.created_at)
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
			Sep = ['',WR.RepS('\u2014',63),''],
			AddTweet = V =>
			{
				var
				Legacy = V.legacy,
				User = V.core.user_results.result.legacy;
				Legacy.id_str === ID ?
					SolveTweet(Legacy,User,Meta = [],Info) :
					SolveTweet(Legacy,User,Meta ? Reply : Prelude)
				WR.Each(B => {'Tweet' === B?.__typename && AddTweet(B)},
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
					if (!R && 'Tweet' === V.__typename)
					{
						R = true
						AddTweet(V)
					}
					return R
				})
			},V.entries))
			Info.Meta =
			[
				...Prelude,
				...Prelude.length ? Sep : [],
				...Meta,
				...Reply.length ? Sep : [],
				...Reply,
			]
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