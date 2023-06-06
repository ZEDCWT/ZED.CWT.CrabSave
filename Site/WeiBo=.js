'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

WeiBo = 'https://weibo.com/',
WeiBoAJAX = WeiBo + 'ajax/',
WeiBoAJAXStatusShow = WW.Tmpl(WeiBoAJAX,'statuses/show?id=',undefined),
WeiBoAJAXStatusLong = WW.Tmpl(WeiBoAJAX,'statuses/longtext?id=',undefined),
WeiBoPostHistory = WW.Tmpl(WeiBo,'p/aj/v6/history?mid=',undefined,'&page_size=',undefined,'&page=1'),
WeiBoLiveShow = WW.Tmpl(WeiBo,'l/!/2/wblive/room/show_pc_live.json?live_id=',undefined),
WeiBoCard = 'https://card.weibo.com/',
WeiBoCardArticle = WeiBoCard + 'article/m/aj/',
WeiBoCardArticleDetail = WW.Tmpl(WeiBoCardArticle,'detail?id=',undefined),
WeiBoCardArticleHistoryList = WW.Tmpl(WeiBoCardArticle,'history/list?id=',undefined),
WeiBoCardArticleHistoryShow = WW.Tmpl(WeiBoCardArticle,'history/show?id=',undefined),
WeiBoCardArticleShow = WW.Tmpl(WeiBoCard,'article/aj/articleshow?cid=',undefined),

NumberZip = WC.Rad(WW.D + WW.az + WW.AZ),
// Zip = Q => WR.MapU((V,F) => (V = NumberZip.S(V),F ? WR.PadS0(4,V) : V),
// 		WR.SplitAll(7,WR.PadS0(7 * WR.Ceil(Q.length / 7),Q))).join``,
UnZip = Q => WR.MapU((V,F) => (V = NumberZip.P(V),F ? WR.PadS0(7,V) : V),
		WR.SplitAll(4,WR.PadS0(4 * WR.Ceil(Q.length / 4),Q))).join``,
ImgEnlarge = V => V.replace(/(?<=\.sinaimg\.cn\/)(?:\w+|crop[\d.]+)(?=\/\w+\.\w+$)/,'large'),

VideoIgnoreDomain =
[
	'acg.tv',
	'iqiyi.com',
	'ku6.com',
	'letv.com',
	'qq.com',
	'tudou.com',
	'weibo.com',
],
VideoIgnoreDomainRX = RegExp(`//[^/]*(${VideoIgnoreDomain.map(WR.SafeRX).join`|`})/`);

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
	1678843974/5KD0tWN9TiG	Ancient
	5833359023/Gu8F2rS5y	Movie
	1781163345/FhlEctNcL	Panorama
*/

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	Common = B =>
	{
		B = WW.IsObj(B) ? B : WC.JTO(B)
		B.msg &&
			'success' !== B.msg &&
			'ok' !== B.msg &&
			O.Bad(WW.Quo(B.code) + B.msg)
		return B.data
	};

	return {
		URL : (ID,Ext) =>
		{
			ID = /^\d+\/(\w+)$/.exec(ID) || [ID]
			if (!ID[1]) return WX.Throw('Bad ID ' + ID[0])
			return Ext.ReqB(O.Coke(WeiBoAJAXStatusShow(ID[1]))).FMap(B =>
			{
				B = WC.JTO(B)
				B.error_code && O.Bad(WW.Quo(B.error_code) + B.message)
				// LlJq26YJu	Unexpected `isLongText` flag
				return (B.isLongText ? Ext.ReqB(O.Coke(WeiBoAJAXStatusLong(ID[1]))) : WX.Just()).FMap(Long =>
				{
					var
					ReqWithRef = V => Ext.ReqB(O.Coke(WN.ReqOH(V,'Referer',WeiBo))),
					Forwarded = B.retweeted_status,
					Title,
					Meta = [],
					Cover,
					PicIndex = {},
					PicAll = [],
					PicID = URL => WW.MF(/\/([^./]+)\.\w+$/,URL) || URL,
					PicPush = URL =>
					{
						var ID = PicID(URL);
						if (!WR.Has(ID,PicIndex))
						{
							PicIndex[ID] = PicAll.length
							PicAll.push(URL)
						}
					},
					PicMeta = [],
					PicShow = URL => PicMeta.push(URL = [PicIndex[PicID(URL)],URL]) && URL,
					Part = [],
					ProcessObject = Q =>
					{
						var
						Card = Q.card_info,
						T;
						Cover = Q.page_pic ||
							Card && Card.pic_url
						switch (Q.object_type)
						{
							case 'adFeedVideo' :
							case 'live' :
							case 'movie' :
							case 'video' : // 5 11
								if ('live' === Q.object_type)
									Part.push(ReqWithRef(WeiBoLiveShow(Q.page_id)).FMap(N =>
									{
										N = WC.JTO(N)
										if (27401 === N.error_code)
											return WX.Empty
										N.error_code && O.Bad(N)
										return WX.Just(
										{
											URL : [N.data.replay_origin_url]
										})
									}))
								else if (T = Q.media_info)
								{
									if ((Q = T.playback_list) && Q.length)
										Q = 1 - Q.length ?
												O.Best('bitrate',WR.Where(function(V)
												{
													// KuTqsBzth | meta.label = scrubber_hd & play_info.type = 3
													return !/^image\//.test(V.mime)
												},WR.Pluck('play_info',Q))).url :
												Q[0].play_info.url
									else
										Q = T.h265_mp4_hd ||
											T.mp4_hd_url ||
											T.mp4_sd_url
									if (Q)
										Part.push({URL : [Q]})
									else if (!VideoIgnoreDomainRX.test(T.h5_url))
										WW.Throw('Unable to solve video URL')
								}
								break

							case 'article' : // 2 5
								Part.push(ReqWithRef(WeiBoCardArticleDetail(Q.page_id)).FMap(B =>
								{
									B = WC.JTO(B)
									return 100002 === B.code ?
										ReqWithRef(WeiBoCardArticleShow(Q.page_id)).Map(N =>
										{
											N = WC.JTO(N)
											if ('100010' === N.code) return {
												title : '#',
												update_at : '-',
												writer :
												{
													screen_name : ''
												},
												content : N.msg,
											}
											N = Common(N)
											return {
												title : N.title,
												update_at : WW.MF(/"time">([^<]+)/,N = N.article),
												writer :
												{
													screen_name : O.Text(WW.MF(/class="t [^>]+>([^<]+)/,N)),
												},
												content : WW.MF(/WBA_content[^>]+>([^]+)<\/div>\s*(<\/div>|<div class="link")/,N),
											}
										}) :
										[120001].includes(B.code) ?
											Meta.push
											(
												'',
												'{Article}',
												WW.Quo(B.code) + B.msg
											) && WX.Empty :
											WX.Just(Common(B))
								}).FMap(B =>
								{
									var
									AllCount = 1,
									SolveContent = (B,F) =>
									{
										B.content || O.Bad(B)
										Meta.push
										(
											'',
											'{Article} ' +
												WW.ShowLI(AllCount,AllCount + ~F) +
												' ' +
												(B.update_at || B.create_at),
											B.title,
											B.writer.screen_name,
											...B.content.split(/<img[^>]* src="([^"]+)"[^>]*>/g)
												.map((V,F) => 1 & F ?
													PicPush(V = ImgEnlarge(V)) ||
													PicShow(V) :
													O.Text(V).trim())
										)
									};
									Meta.push('')
									return B.history ?
										ReqWithRef(WeiBoCardArticleHistoryList(Q.page_id))
											.FMap(B =>
											(
												B = Common(B),
												AllCount = B.length,
												WX.From(B)
											))
											.FMapE((N,F) => ReqWithRef(WeiBoCardArticleHistoryShow(N.id))
												.FMap(V =>
												{
													V = WW.Try(Common,[V])
													if (WW.TryE === V && !F)
														V = B
													if (WW.TryE === V)
														Meta.push
														(
															'',
															'{Article} ' +
																WW.ShowLI(AllCount,AllCount + ~F) +
																' ' +
																N.create_at,
															V[0]
														)
													else
														SolveContent(V,F)
													return WX.Empty
												})) :
										SolveContent(B,0) || WX.Empty
								}))
								break
							case 'hudongvote' : // 23
								T = Card.vote_object
								Meta.push(
									T.content + ' ' +
									WW.StrDate(1E3 * T.expire_date) + ' ' +
									T.part_info + T.part_num_unitname)
								WR.EachU((V,F) => Meta.push(`[${F}] ` +
									V.part_num + ' ' +
									(0 | 100 * V.part_ratio) + '% ' +
									V.content),T.vote_list)
								break
							case 'panorama' : // 29
								break
							case 'story' : // 31
								T = WR.Pluck('play_info',Q.slide_cover.playback_list)
								Part.push(
								{
									URL : [O.Best('bitrate',T.filter(V => V.bitrate)).url]
								})
								break
							case 'wenda' : // 24
								Meta.push('')
								WR.Key(Q).sort()
									.forEach(V => /^content\d+$/.test(V) && Meta.push(Q[V]))
								break

							default :
								WR.Include(Q.object_type,
								[
									'adFeedEvent', // 5
									'app', // 0
									'appItem', // 2
									'audio', // 0
									'cardlist', // 0
									'event', // 5
									'file', // 2
									'group', // 0
									'shop', // 2
									'topic', // 0
									'user', // 2
									'wbox', // 0
									'webpage', // 0 23
									undefined
								]) || WW.Throw('Unknown Type #' + Q.type + ':' + Q.object_type)
						}
					},
					T;
					Long = Long && WR.Path(['data','longTextContent'],WC.JTO(Long))
					Title = B.text_raw.replace(/\u200B+$/,'')
					Meta.push(Long ? WC.HED(Long) : Title)
					if (Forwarded)
						Title = Title.replace(/\/\/@.*/,'')
					WR.EachU((V,F) =>
					{
						Title = Title.replace(RegExp(`\\s*${WR.SafeRX(V.short_url)}\\s*`,'g'),' ')
						Meta.push(`URL [${WW.ShowLI(B.url_struct.length,F)}] ${V.url_title} ${V.short_url}`)
						V.long_url && Meta.push('\t' + V.long_url)
					},B.url_struct)
					if (T = B.mix_media_info)
					{
						WR.Each(V =>
						{
							switch (V.type)
							{
								case 'pic' :
									PicPush(V.data.largest.url)
									break
								default :
									WW.IsStr(V.data?.object_type) ?
										ProcessObject(V.data) :
										WW.Throw('Unknown MixMedia Type #' + V.type)
							}
						},T.items)
					}
					else if (B.pic_num)
						WR.Each(V => PicPush(B.pic_infos[V].largest.url),B.pic_ids)
					if (Forwarded)
						WR.Each(V => V.pic_infos && Part.push(
						{
							URL : V.pic_ids.map(B => V.pic_infos[B].large.url)
						}),B.url_struct)
					else if (T = B.page_info)
						ProcessObject(T)
					return (B.edit_count ? Ext.ReqB(O.Coke(WeiBoPostHistory(UnZip(ID[1]),-~B.edit_count))).Map(His =>
					{
						var
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
									V = ImgEnlarge(V[1])
									PicPush(V)
									D.push(PicShow(V))
									return D
								},[],/<[^>]+WB_pic[^]+?src="([^"]+)"/g,V)
							))
					}) : WX.Just())
						.FP(O.Part(Part,Ext))
						.Map(Part =>
						{
							PicMeta.forEach(V => V[0] = `	[${WR.PadL(PicAll.length,V[0])}] ${V.pop()}`)
							PicAll.length && Part.unshift({URL : PicAll,ExtDefault : '.jpg'})
							return {
								Title : Title.trim(),
								UP : B.user.screen_name,
								Date : +new Date(B.created_at),
								Meta,
								Cover : Cover && ImgEnlarge(Cover),
								Part,
							}
						})
				})
			}).ErrAs(E =>
			{
				WW.ErrIs(WW.Err.NetBadStatus,E) &&
					400 == E.Arg[0] ||
					WW.Throw(E)
				return Ext.ReqB(O.Coke(WeiBo + ID[0])).FMap(B =>
				{
					var
					Title,
					URL,
					T;
					B = O.JOM(/\((?={"ns":"pl.content.weiboDetail)/,B).html
						.replace(/"WB_feed_expand">[^]+/,'')
					Title = O.Text(WW.MU(/<[^>]+WB_text[^]+?<\/div>/,B)
						.replace(/<a[^>]+ignore=.*?<\/a>/g,''))
					if (T = WW.MF(/WB_video_mini.*sources="([^"]+)/,B))
					{
						URL = WR.Ent(WC.QSP(T)).filter(V => !/\D/.test(V[0]) && V[1]).sort((Q,S) => S[0] - Q[0])
						URL[0] && URL[0][1] || O.Bad(URL)
						URL = URL[0][1]
					}
					else if (T = WW.MF(/WB_video_mini.*action-data="([^"]+)/,B))
					{
						URL = WC.QSP(T).live_src
						URL || O.Bad(T)
					}
					else if (T = WW.MF(/WB_video .*action-data="([^"]+)/,B))
					{
						URL = WC.QSP(T).url
						URL || O.Bad(T)
						URL = Ext.ReqB(O.Coke(URL))
							.FMap(B => Ext.ReqB(O.Coke(WN.JoinU(WeiBo,WW.MF(/<iframe[^>]+src="([^"]+)/,B)))))
							.Map(B => WC.JTO(WW.MF(/play_url:(".*")/,B)),Ext)
					}
					else if (T = WW.MF(/li_story.*?action-data="([^"]+)/,B))
						URL = WC.QSP(T).gif_ourl
					else if (T = WW.MF(/WB_media_a.*?action-data="([^"]+)/,B))
					{
						URL = WC.QSP(T).clear_picSrc
						URL = URL && URL.split`,`.map(ImgEnlarge)
					}
					return (WX.IsP(URL) ? URL : WX.Just(URL))
						.FMap(U => O.Part(null == U ? [] : [{URL : WW.IsArr(U) ? U : [U]}],Ext))
						.Map(Part => (
						{
							Title,
							UP : WC.HED(WW.MF(/face".*title="([^"]+)/,B)),
							Date : +WW.MF(/date="(\d+)/,B),
							Meta : Title,
							Part
						}))
				})
			})
		},
		Pack : Q => (
		{
			URL : Q,
			Head : {Referer : WeiBo}
		}),
		Range : false,
	}
}