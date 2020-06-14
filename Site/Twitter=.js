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
		URL : ID =>
		{
			return WN.ReqB(O.Coke(MakeHead(TwitterAPITimelineConversation(ID)))).Map(B =>
			{
				var
				Tweet,User,
				Media,
				Part = [];
				B = WC.JTO(B)
				B.errors && O.Bad(B.errors[0])
				B = B.globalObjects
				Tweet = B.tweets[ID]
				Media = WR.Where(V => 'video' === V.type,WR.Path(['extended_entities','media'],Tweet) || [])
				Media.length || O.Bad('No media')
				User = B.users[Tweet.user_id_str]
				WR.Each(V =>
				{
					V = V.video_info.variants.filter(V => +V.bitrate)
					V = O.Best('bitrate',V)
					Part.push(
					{
						URL : [V.url],
						Ext : ['.' + WW.MF(/\/(\w+)/,V.content_type)]
					})
				},Media)
				return {
					Title : WR.Trim(Tweet.full_text
						.replace(/\n#.*$/g,'')
						.replace(/\w+:\/\/t\.\w+\/\w+/g,'')),
					Up : User.name,
					Date : +new Date(Tweet.created_at),
					Part : Part
				}
			})
		}
	}
}