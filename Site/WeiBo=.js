'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC} = WW,

WeiBo = 'https://weibo.com/',
WeiBoAJAX = WeiBo + 'ajax/',
WeiBoAJAXStatusShow = WW.Tmpl(WeiBoAJAX,'statuses/show?id=',undefined),
WeiBoAJAXStatusLong = WW.Tmpl(WeiBoAJAX,'statuses/longtext?id=',undefined),
WeiBoPostHistory = WW.Tmpl(WeiBo,'p/aj/v6/history?mid=',undefined,'&page_size=',undefined,'page=1'),
WeiBoLiveShow = WW.Tmpl(WeiBo,'l/!/2/wblive/room/show_pc_live.json?live_id=',undefined),

NumberZip = WC.Rad(WW.D + WW.az + WW.AZ),
// Zip = Q => WR.MapU((V,F) => (V = NumberZip.S(V),F ? WR.PadS0(4,V) : V),
// 		WR.SplitAll(7,WR.PadS0(7 * WR.Ceil(Q.length / 7),Q))).join``,
UnZip = Q => WR.MapU((V,F) => (V = NumberZip.P(V),F ? WR.PadS0(7,V) : V),
		WR.SplitAll(4,WR.PadS0(4 * WR.Ceil(Q.length / 4),Q))).join``;

/*
	1168377245/H9DtcoC7I	TextOnly
	1812175903/H9rlQkIAs	Multiple Image
	5181851618/H9DNStKQc	Video
	1195054531/KCHmjroGh	Live Archive
	1195054531/HvN4dC9TN	Live XiaoKa
	1195054531/HBuaKtpO8	Link Video
	3010420480/Lbrl01Fw8	External Link
	1111681197/Lbc6zzKom	Forward Chain
	1111681197/LaV9yusrt	Forward Removed
	1111681197/H9KXndEm2	Forward Hidden
	1195054531/ImKxcFvqE	Forward With Image
	1195054531/Fzabr7ZVY	Forward With Link
	5044281310/H9EEP6pbF	Article 2309351002454323012466853424
	1195054531/FCdU2kOPH	Article
	7031421269/Lbwq466Xs	Vote
*/

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	RegExpIsM3U = /\.m3u8?(\?.*)?$/i;
	return {
		URL : (ID,Ext) =>
		{
			ID = /^\d+\/(\w+)$/.exec(ID) || [ID]
			if (!ID[1]) return WX.Throw('Bad ID ' + ID[0])
			return Ext.ReqB(O.Coke(WeiBoAJAXStatusShow(ID = ID[1]))).FMap(B =>
			{
				B = WC.JTO(B)
				return (B.isLongText ? Ext.ReqB(O.Coke(WeiBoAJAXStatusLong(ID))) : WX.Just()).FMap(Long =>
				{
					var
					Forwarded = B.retweeted_status,
					Title,
					Meta,
					Cover,
					PicIndex = {},
					Part = [],
					Card,
					C,T;
					Long = Long && WC.JTO(Long).data
					Title = B.text_raw
					Meta = [Long ? Long.longTextContent : Title]
					if (Forwarded)
						Title = Title.replace(/\/\/@.*/,'')
					WR.EachU((V,F) =>
					{
						Title = Title.replace(RegExp(`\\s*${WR.SafeRX(V.short_url)}\\s*`),' ')
						Meta.push(`URL [${WW.ShowLI(B.url_struct.length,F)}] ${V.url_title} ${V.short_url}`)
						V.long_url && Meta.push('\t' + V.long_url)
					},B.url_struct)
					if (B.pic_num)
						WR.Each(V => PicIndex[V] = ~-Part.push(
						{
							URL : [B.pic_infos[V].largest.url]
						}),B.pic_ids)
					else if (Forwarded)
						WR.Each(V => V.pic_infos && Part.push(
						{
							URL : V.pic_ids.map(B => V.pic_infos[B].large.url)
						}),B.url_struct)
					else if (T = B.page_info)
					{
						Card = T.card_info
						Cover = T.page_pic ||
							Card && Card.pic_url
						switch (T.object_type)
						{
							case undefined :
								break
							// 0 23
							case 'webpage' :
								break
							// 0
							case 'group' :
								break
							// 0
							case 'audio' :
								break
							// 2
							case 'appItem' :
								break
							// 2
							case 'file' :
								break
							// 2
							case 'user' :
								break
							// 2 5
							case 'article' :
								break
							// 5
							case 'event' :
								break
							// 5 11
							case 'video' :
							case 'live' :
								if ('live' === T.object_type)
									Part.push(Ext.ReqB(O.Coke(
									{
										URL : WeiBoLiveShow(T.page_id),
										Head : {Referer : WeiBo}
									})).Map(N =>
									{
										N = WC.JTO(N)
										N.error_code && O.Bad(N)
										return {
											URL : [N.data.replay_origin_url]
										}
									}))
								else if (C = T.media_info)
								{
									if ((T = C.playback_list) && T.length)
										T = 1 - T.length ?
												O.Best('bitrate',WR.Pluck('play_info',T)).url :
												T[0].play_info.url
									else
										T = C.h265_mp4_hd ||
											C.mp4_hd_url ||
											C.mp4_sd_url
									if (T)
										Part.push({URL : [T]})
									else
										WW.Throw('Unable to solve video URL')
								}
								break
							// 23
							case 'hudongvote' :
								C = Card.vote_object
								Meta.push(
									C.content + ' ' +
									WW.StrDate(1E3 * C.expire_date) + ' ' +
									C.part_info + C.part_num_unitname)
								WR.EachU((V,F) => Meta.push(`[${F}] ` +
									V.part_num + ' ' +
									(0 | 100 * V.part_ratio) + '% ' +
									V.content),C.vote_list)
								break
							// 24
							case 'wenda' :
								Meta.push('')
								WR.Key(T).sort()
									.forEach(V => /^content\d+$/.test(V) && Meta.push(T[V]))
								break
							// 31
							case 'story' :
								C = WR.Pluck('play_info',T.slide_cover.playback_list)
								Part.push(
								{
									URL : [O.Best('bitrate',C.filter(V => V.bitrate)).url]
								})
								break
							default :
								WW.Throw('Unknown Type #' + T.type + ':' + T.object_type)
						}
					}
					return (B.edit_count ? Ext.ReqB(O.Coke(WeiBoPostHistory(UnZip(ID),-~B.edit_count))).Map(His =>
					{
						var
						PicList = [],
						HTS = Q => Q.split(/<[^>]+>/)
							.map(V => WC.HED(V.trim()))
							.filter(V => V)
							.join` `;
						WC.JTO(His).data.html
							.split`WB_cardwrap`
							.filter(V => /WB_detail/.test(V))
							.forEach((V,F) => Meta.push
							(
								'',
								'{History} ' + WW.ShowLI(-~B.edit_count,B.edit_count - F),
								HTS(WW.MU(/<[^>]+WB_from[^]+?<\/span>/,V)),
								HTS(WW.MU(/<[^>]+WB_text[^>]+>([^<>]+)/,V)),
								...WW.MR((D,V) =>
								{
									V[1] = V[1].replace(/\/[a-z]+\d+\//,'/large/')
									if (!WR.Has(V[2],PicIndex))
										PicIndex[V[2]] = ~-Part.push(
										{
											URL : [V[1]]
										})
									PicList.push(V = [PicIndex[V[2]],V[1]])
									D.push(V)
									return D
								},[],/<[^>]+WB_pic[^]+?src="([^"]+\/([^.]+)\.\w+)"/g,V)
							))
							PicList.forEach(V => V[0] = `	[${WR.PadL(Part.length,V[0])}] ${V.pop()}`)
					}) : WX.Just())
						.FP(WX.From(Part))
						.FMapE(V => WX.Any(V).FMap(V =>
							RegExpIsM3U.test(V.URL[0]) ?
								O.M3U(V.URL[0],Ext) :
								WX.Just(V)))
						.Reduce((D,V) => D.push(V) && D,[])
						.Map(Part => (
						{
							Title : Title.trim(),
							Up : B.user.screen_name,
							Date : +new Date(B.created_at),
							Meta,
							Cover,
							Part,
						}))
				})
			})
		}
	}
}