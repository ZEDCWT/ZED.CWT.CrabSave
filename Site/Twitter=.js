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
			Part = [],
			T;
			B = WC.JTO(B)
			B.errors && O.Bad(B.errors[0])
			B = B.globalObjects
			Tweet = B.tweets[ID]
			User = B.users[Tweet.user_id_str]
			WR.Each(V =>
			{
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
			return {
				Title : WR.Trim(WC.HED(Tweet.full_text)
					.replace(/\n#.*$/g,'')
					.replace(/\w+:\/\/t\.\w+\/\w+/g,'')),
				Up : User.name,
				Date : +new Date(Tweet.created_at),
				Meta : WC.HED(Tweet.full_text),
				Part : Part
			}
		}),
		Range : false
	}
}