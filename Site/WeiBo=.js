'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

WeiBo = 'https://weibo.com/',
WeiBoPage = WW.Tmpl(WeiBo,'p/',undefined),
WeiBoAJAX = WeiBo + 'ajax/',
WeiBoAJAXStatusShow = WW.Tmpl(WeiBoAJAX,'statuses/show?id=',undefined),
WeiBoAJAXStatusLong = WW.Tmpl(WeiBoAJAX,'statuses/longtext?id=',undefined),
WeiBoAJAXStatusComment = WW.Tmpl(WeiBoAJAX,'statuses/buildComments?is_show_bulletin=',undefined,'&id=',undefined),
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
	'my.tv.sohu.com',
	'qq.com',
	'tudou.com',
	'v.ifeng.com',
	'v.mobile.163.com',
	'weibo.com',
	'www.56.com',
	'www.acfun.cn',
	'xiaoka.tv',
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
	PostCache = O.MakePostCache(),
	Common = B =>
	{
		B = WW.IsObj(B) ? B : WC.JTO(B)
		B.msg &&
			'success' !== B.msg &&
			'ok' !== B.msg &&
			O.Bad(WW.Quo(B.code || B.error_type) + B.msg)
		return B.data
	},
	SolveTextWithStruct = (Text,URLStruct) =>
	{
		var
		Entity = {};
		Text = Text.replace(/\u200B+$/,'')
		WR.Each(V =>
		{
			var
			U = V.long_url;
			if (!U) U =
				V.page_id ? WeiBoPage(V.page_id) :
				null
			if (U) Entity[V.short_url] = `<${V.url_title}> ${U}`
		},URLStruct)
		return WR.Key(Entity).length ?
			Text.replace(RegExp(WR.Map(WR.SafeRX,WR.Key(Entity)).join('|'),'g'),V => Entity[V]) :
			Text
	};

	return {
		URL : (ID,Ext) =>
		{
			var
			ReqWithRef = Q => Ext.ReqB(O.Coke(WN.ReqOH(Q,'Referer',WeiBo))),
			GetStatus;
			ID = /^\d+\/(\w+)$/.exec(ID) || [ID]
			if (!ID[1]) return WX.Throw('Bad ID ' + ID[0])

			if (GetStatus = PostCache.Get(ID[0]))
			{
				GetStatus = WX.Just(GetStatus)
			}
			else
			{
				GetStatus = ReqWithRef(WeiBoAJAXStatusShow(ID[1])).Map(Status =>
				{
					Status = WC.JTO(Status)
					Status.error_code && O.Bad(WW.Quo(Status.error_code) + Status.message)
					// {ok:0,msg:'访问频次过高，请稍后再试',error_type:'toast'}
					Status.error_type && O.Bad(WW.Quo(Status.error_type) + Status.msg)
					// LlJq26YJu	Unexpected `isLongText` flag
					return [Status]
				})
			}

			return GetStatus.FMap(([Status,MetaCache]) =>
			{
				return (Status.isLongText ? ReqWithRef(WeiBoAJAXStatusLong(ID[1])) : WX.Just()).FMap(Long =>
				{
					var
					Forwarded = Status.retweeted_status,
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
					PicVariant = [],
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
						Cover = Cover && WR.RepL(
						[
							/*
								JAcRs5olK
									The page_pic has no domain part
							*/
							/^(?=\/assets\/artwork)/,'https://apps.apple.com',
						],Cover)
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

										N = N.data.replay_origin_url
										if (!N || VideoIgnoreDomainRX.test(N))
											return WX.Empty
										return WX.Just(
										{
											URL : [N]
										})
									}))
								else if (T = Q.media_info)
								{
									if ((Q = T.playback_list) && Q.length)
										Q = 1 - Q.length ?
											O.Best('bitrate',WR.Where(V =>
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
									else
										VideoIgnoreDomainRX.test(T.h5_url) ||
										/\.s?html$/.test(T.h5_url) ||
										WW.Throw('Unable to solve video URL')
								}
								break

							case 'ai_summary' : // 0
								Meta.push(Q.title_sub)
								break

							case 'campaign' : // 0
								Meta.push(
									'',
									Q.page_title,
									Q.page_desc,
									Q.tips)
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
										[120001,120002].includes(B.code) ?
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
							// case 'media_abstract' : // 0
							// 	break
							case 'panorama' : // 29
								break
							case 'podcast_audio' : // 44
								Part.push(
								{
									URL : [Q.media_info.stream_url],
									Title : Q.media_info.subtitle_preview,
								})
								break
							case 'story' : // 31
								if (Q.slide_cover.playback_list)
								{
									T = WR.Pluck('play_info',Q.slide_cover.playback_list)
									Part.push(
									{
										URL : [O.Best('bitrate',T.filter(V => V.bitrate)).url]
									})
								}
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
									'fangle', // 24
									'file', // 2
									'gameArticle', // 2
									'group', // 0
									'image', // 2
									'ny25_byebye', // 0
									'product', // 2
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

					Long = Long && WC.JTO(Long).data
					if (Long && !Long.longTextContent) Long = null
					Title = Long ?
						SolveTextWithStruct(WC.HED(Long.longTextContent),Long.url_struct) :
						SolveTextWithStruct(Status.text_raw,Status.url_struct)
					Meta.push(Title)
					if (Forwarded)
						Title = Title.replace(/\/\/@.*/,'')

					if (T = Status.mix_media_info)
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
					else if (Status.pic_num)
						WR.Each(V =>
						{
							V = Status.pic_infos[V]
							PicPush(V.largest.url)
							switch (V.type)
							{
								case 'pic' :
									break
								case 'dynamic' : // Lr2AY7AyW
									// Image is the cover for the video, saving the image may not be necessary
								case 'gif' : // JjRAXxJT5
									// Video is much smaller
								case 'livephoto' : // N9YWhzARq
									// Image contains EXIF
									if (V = V.video_hd || V.video)
										PicVariant.push(V)
									break
								default :
									WW.Throw('Unknown Pic Type #' + V.type)
							}
						},Status.pic_ids)
					if (Forwarded)
						WR.Each(V => V.pic_infos && Part.push(
						{
							URL : V.pic_ids.map(B => V.pic_infos[B].large.url)
						}),Status.url_struct)
					else if (T = Status.page_info)
						ProcessObject(T)
					return (Status.edit_count ? ReqWithRef(WeiBoPostHistory(UnZip(ID[1]),-~Status.edit_count)).Map(His =>
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
								'{History} ' + WW.ShowLI(-~Status.edit_count,Status.edit_count - F),
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
						.FMap(() => ReqWithRef(WeiBoAJAXStatusComment(Status.is_show_bulletin && 2,UnZip(ID[1]))).Map(Comment =>
						{
							Comment = WC.JTO(Comment).data
							if (Comment.length)
							{
								Meta.push('',WR.RepS('\u2014',63))
								WR.Each(V =>
								{
									Meta.push
									(
										'',
										WW.StrDate(V.created_at,WW.DateColS) + ' ' + V.user.idstr + ':' + V.user.screen_name,
										(V.source ? V.source + ' ' : '') + 'Like ' + V.like_counts,
										V.text_raw,
									)
									WR.Each(B =>
									{
										if (B.pic_infos)
										{
											B.pic_ids.forEach((N,F) =>
											{
												Meta.push('\t' + WW.Quo(F) + B.pic_infos[N].large.url)
											})
											Status.user.idstr === V.user.idstr && Part.push(
											{
												Title : V.text_raw.replace(/(\s*\w+:\/\/t\.cn\/\S+)+$/,''),
												URL : B.pic_ids.map(N => B.pic_infos[N].large.url)
											})
										}
									},V.url_struct)
									WR.Each(B =>
									{
										// Weird that they put `reply_comment` & `url_struct` in every sub comment...
										Meta.push
										(
											'',
											'\t' + WW.StrDate(B.created_at,WW.DateColS) + ' ' + B.user.idstr + ':' + B.user.screen_name,
											'\t' + (B.source ? B.source + ' ' : '') + 'Like ' + B.like_count, // Why this field has no ending `s` as the main comment...
											'\t' + B.text_raw,
										)
									},V.comments)
									V.more_info && Meta.push
									(
										'',
										'\t' +
										[
											...WR.Pluck('screen_name',V.more_info.user_list || []),
											V.more_info.text
										].join` `,
									)
								},Comment)
							}
						}))
						.FP(O.Part(Part,Ext,
						{
							ReqB : Q => Ext.ReqB(O.Req(WN.ReqOH(Q,'Referer',WeiBo))),
						}))
						.Map(Part =>
						{
							PicMeta.forEach(V => V[0] = `	[${WR.PadL(PicAll.length,V[0])}] ${V.pop()}`)
							PicVariant.length && Part.unshift({URL : PicVariant})
							PicAll.length && Part.unshift({URL : PicAll,ExtDefault : '.jpg'})
							return {
								Title : Title,
								UP : Status.user.screen_name,
								Date : Status.created_at,
								Meta : O.MetaJoin
								(
									Meta,
									MetaCache,
								),
								Cover : Cover && ImgEnlarge(Cover),
								Part,
							}
						})
				})
			})/*.ErrAs(E =>
			{
				WW.ErrIs(WW.Err.NetBadStatus,E) &&
					400 == E.Arg[0] ||
					WW.Throw(E)
				return ReqWithRef(WeiBo + ID[0]).FMap(B =>
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
						URL = ReqWithRef(URL)
							.FMap(B => ReqWithRef(WN.JoinU(WeiBo,WW.MF(/<iframe[^>]+src="([^"]+)/,B))))
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
			})*/
		},
		Is429 : E => WW.IsArr(E) &&
			WW.IsStr(E[1]) &&
			/频次过高/.test(E[1]),
		Pack : Q => WN.ReqOH(Q,'Referer',WeiBo),
		Range : false,
		OnReq : (Q,S,H,Meta) =>
		{
			if (Q.URL?.startsWith(WeiBoAJAX))
			{
				if (!Meta) return true
				O.Walk(WC.JTO(S),V =>
				{
					if (WW.IsStr(V.mblogid) &&
						WW.IsObj(V.user) &&
						WW.IsStr(V.text))
					{
						PostCache.Set(V.user.idstr + '/' + V.mblogid,V,Meta)
						return true
					}
				})
			}
		},
		OnFin : () =>
		{
			PostCache.Fin()
		},
	}
}