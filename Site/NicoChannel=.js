'use strict'
var
PrefixVideo = 'sm',
PrefixArticle = 'ar',

WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
NicoNico = require('./NicoNico='),

NicoChannel = 'https://nicochannel.jp/',
// NicoChannelAPI = 'https://nfc-api.nicochannel.jp/',
NicoChannelAPI = 'https://api.nicochannel.jp/',
NicoChannelAPIFC = NicoChannelAPI + 'fc/',
// NicoChannelAPIFCContentProviderChannel = NicoChannelAPIFC + 'content_providers/channels',
NicoChannelAPIFCContentProviderChannelDomain = NicoChannelAPIFC + 'content_providers/channel_domain',
NicoChannelAPIFCVideo = WW.Tmpl(NicoChannelAPIFC,'video_pages/',undefined),
NicoChannelAPIFCVideoSession = WW.Tmpl(NicoChannelAPIFC,'video_pages/',undefined,'/session_ids'),
NicoChannelAPIFCVideoCommentToken = WW.Tmpl(NicoChannelAPIFC,'video_pages/',undefined,'/comments_user_token'),
NicoChannelAPIFCVideoDomand = WW.Tmpl(NicoChannelAPIFC,'video_pages/',undefined,'/domand_content_access'),
NicoChannelAPIFCFanClubSite = NicoChannelAPIFC + 'fanclub_sites/',
NicoChannelAPIFCFanClubSiteBaseInfo = WW.Tmpl(NicoChannelAPIFCFanClubSite,undefined,'/page_base_info'),
NicoChannelAPIFCFanClubSiteArticleRead = WW.Tmpl(NicoChannelAPIFCFanClubSite,undefined,'/article_themes/news/articles/',undefined),
// SheetaAPI = 'https://comm-api.sheeta.com/',
SheetaAPI = 'https://api.messaging.sheeta.com/',
SheetaAPIMessageHistory = WW.Tmpl(SheetaAPI,'messages.history?inclusive=true&sort_direction=asc&limit=1000&oldest_playback_time=',undefined);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	SiteToID = {},
	// SiteByID = {},
	SolveCookieLast = '',SolveCookieCache = {},
	SolveCookieToken = Site =>
	{
		if (SolveCookieLast !== O.CokeRaw())
		{
			SolveCookieLast = O.CokeRaw()
			SolveCookieCache = WR.Where(WR.Path(['userInformation','accessToken']),
				WC.JTOO(WC.JTOO(SolveCookieLast).totalUserInformation))
		}
		return Site ? WR.Path([Site,'userInformation','accessToken'],SolveCookieCache) : SolveCookieCache
	},

	CMFInit = NicoNico.CMFInitMake(O);

	return {
		URL : (ID,Ext) =>
		{
			var
			Site = (ID = ID.split`/`)[0],
			Prefix = (ID = ID[1]).slice(0,2),

			Common = B =>
			{
				B = WC.JTO(B)
				B.error && O.Bad(B.error.message)
				return B.data
			},
			ReqHead,
			Req = (URL,Data,Auth = SolveCookieToken(Site)) => SolveSiteID(Site).FMap(SiteID => Ext.ReqU(O.Req(
			{
				URL : URL,
				JSON : Data,
				Head :
				{
					Authorization : Auth && 'Bearer ' + Auth,
					Origin : NicoChannel,
					FC_Site_ID : SiteID,
					FC_Use_Device : 'null'
				}
			}))).Map(([H,B]) =>
			{
				ReqHead = H
				return Common(B)
			}),

			/*
			SolveSiteAll = () => Ext.ReqB(O.Req(NicoChannelAPIFCContentProviderChannel)).Map(B =>
			{
				Common(B).content_providers.forEach(V =>
				{
					if (V.domain.startsWith(NicoChannel))
						SiteToID[SiteByID[V.id] = V.domain.slice(NicoChannel.length)] = V.id
				})
				return B.id
			}),
			SolveSiteID = Site => WR.Has(Site,SiteToID) ?
				WX.Just(SiteToID[Site]) :
				SolveSiteAll().Map(() => SiteToID[Site] ?? WW.Throw('No Such Site #' + Site)),
			*/
			SolveSiteID = Site => WR.Has(Site,SiteToID) ?
				WX.Just(SiteToID[Site]) :
				Ext.ReqB(O.Req({URL : NicoChannelAPIFCContentProviderChannelDomain,QS : {current_site_domain : NicoChannel + Site}})).Map(B =>
				{
					B = Common(B).content_providers
					B || WW.Throw('No Such Site #' + Site)
					return SiteToID[Site] = B.id
				}),

			PadSiteInfo = R => SolveSiteID(Site)
				.FMap(SiteID => Req(NicoChannelAPIFCFanClubSiteBaseInfo(SiteID)))
				.Map(B => (
				{
					...R,
					UP : B.fanclub_site.fanclub_site_name
				}));

			if (PrefixVideo === Prefix) return Req(NicoChannelAPIFCVideo(ID)).FMap(Video =>
			{
				var
				Meta = [],
				Comment = [],
				CommentCount = new Map,
				Part = [];
				Video = Video.video_page
				Meta.push(Video.description)
				Part.push
				(
					Req(NicoChannelAPIFCVideoCommentToken(ID))
						.FMap(Token => WX.TCO(([Offset,Seen]) => Ext.ReqB(O.Req(
						{
							URL : SheetaAPIMessageHistory(Offset),
							JSON :
							{
								group_id : Video.video_comment_setting.comment_group_id,
								token : Token.access_token,
							}
						})).Map(B =>
						{
							var New = 0;
							B = WC.JTO(B)
							B.forEach(V =>
							{
								if (!Seen.has(V.id))
								{
									++New
									Comment.push
									(
										[
											WW.StrDate(V.created_at),
											WW.Quo(WR.PadS0(4,Seen.size),true),
											WW.StrS(V.playback_time),
											V.nickname,
											`{${~~CommentCount.get(V.nickname)}}`,
										].join` `,
										'	' + V.message,
									)
									CommentCount.set(V.nickname,-~CommentCount.get(V.nickname))
									Seen.add(V.id)
								}
							})
							return [New,[New && B.at(-1).playback_time,Seen]]
						}),[0,new Set]))
						.FP(WX.Empty),
					Video.video_stream ?
						Req(NicoChannelAPIFCVideoSession(ID),{})
							.FMap(Session => O.M3U(Video.video_stream.authenticated_url.replace(/{session_id}/,Session.session_id),Ext,
							{
								// createInitializationVector
								IV : (_,F) => WC.BV()
									.U4(0).U4(0)
									.U4(0).U4(1 + F)
									.B(),
							})) :
						Req(NicoChannelAPIFCVideoDomand(ID)).FMap(B =>
						{
							var Opt =
							{
								ReqB : Q => Ext.ReqB(CMFInit.CokeDomand(Q)),
								Init : V => V[3].MAP.URI,
							};
							CMFInit.OnHead(ReqHead)
							return O.M3U(B.content_url,Ext,{...Opt,Ext : '.mp4'}).FMap(PartMP4 =>
							{
								var T;
								T = PartMP4.Raw.find(V => V.MEDIA).MEDIA[0]
								'AUDIO' === T.TYPE || WW.Throw('Unable to solve audio')
								return O.M3U(T.URI,Ext,{...Opt,Ext : '.mp3'})
									.FMap(PartMP3 => WX.From([PartMP4,PartMP3]))
							})
						}),
				)
				return O.Part(Part,Ext).FMap(Part => PadSiteInfo(
				{
					Title : Video.title,
					Date : Video.released_at,
					Meta : O.MetaJoin
					(
						Meta,
						Comment,
					),
					Cover : Video.thumbnail_url,
					Part,
				}))
			})

			if (PrefixArticle === Prefix) return SolveSiteID(Site).FMap(SiteID =>
			{
				return Req(NicoChannelAPIFCFanClubSiteArticleRead(SiteID,ID)).FMap(Article =>
				{
					var
					Meta = [],
					Collect = {},
					Part = [];
					Article = Article.article.article
					Article.contents || O.Bad(Article)
					Meta.push(O.Text(Article.contents,Collect))
					Collect.Img && Part.push(
					{
						URL : Collect.Img
					})
					return PadSiteInfo(
					{
						Title : Article.article_title,
						Date : Article.publish_at,
						Meta,
						Cover : Article.thumbnail_url,
						Part,
					})
				})
			})

			return WX.Throw('Unexpected Prefix ' + Prefix)
		},
		Pack : O.PackM3U(
		{
			Init : (_,S) => CMFInit.Init(S),
			Pack : Q => CMFInit.CokeDomand(WN.ReqOH(Q,'Referer',NicoChannel)),
		}),
		Range : false,
	}
}