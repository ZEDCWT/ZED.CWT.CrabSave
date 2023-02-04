'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC,N : WN} = WW,

TwitterAPI = 'https://api.twitter.com/',
TwitterAPITimelineConversation = WW.Tmpl(TwitterAPI,'2/timeline/conversation/',undefined,'.json?tweet_mode=extended&count=20'),
TwitterAuth = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	MakeHead = Q => WN.ReqOH(Q,
	[
		'X-CSRF-Token',WC.CokeP(O.CokeRaw()).ct0,
		'Authorization','Bearer ' + TwitterAuth
	]);
	return {
		URL : (ID,Ext) => Ext.ReqB(O.Coke(MakeHead(TwitterAPITimelineConversation(ID)))).Map(B =>
		{
			var
			Tweet,User,
			Title,Meta,
			Part = [],
			T;
			B = WC.JTO(B)
			B.errors && O.Bad(B.errors[0])
			Tweet = B.globalObjects.tweets[ID]
			Tweet || O.Bad(B)
			User = B.globalObjects.users[Tweet.user_id_str]
			Title = WC.HED(Tweet.full_text)
			Meta = [Title]
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
			WR.Each(V =>
			{
				if (V.source_status_id_str && V.source_status_id_str !== ID)
					return

				if (T = V.video_info)
				{
					T = T.variants
					T = O.Best('bitrate',T.filter(V => WW.IsNum(V.bitrate)))
					Part.push(
					{
						URL : [T.url],
						Ext : ['.' + WW.MF(/\/(\w+)/,T.content_type)]
					})
				}
				else if (T = V.media_url_https)
				{
					Part.push(
					{
						URL : [T]
					})
				}
				else WW.Throw('Unknown Media Type #' + V.type)
			},WR.Path(['extended_entities','media'],Tweet) || [])
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
			return {
				Title : WR.Trim(Title),
				UP : User.name,
				Date : +new Date(Tweet.created_at),
				Meta,
				Part
			}
		}),
		Range : false
	}
}