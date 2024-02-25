'use strict'
var
PrefixVideo = 'sm',
PrefixArticle = 'ar',

WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
Crypto = require('crypto'),

NicoChannel = 'https://nicochannel.jp/',
NicoChannelAPI = 'https://nfc-api.nicochannel.jp/',
NicoChannelAPIFC = NicoChannelAPI + 'fc/',
NicoChannelAPIFCContentProviderChannel = NicoChannelAPIFC + 'content_providers/channels',
NicoChannelAPIFCVideo = WW.Tmpl(NicoChannelAPIFC,'video_pages/',undefined),
NicoChannelAPIFCVideoSession = WW.Tmpl(NicoChannelAPIFC,'video_pages/',undefined,'/session_ids'),
NicoChannelAPIFCVideoCommentToken = WW.Tmpl(NicoChannelAPIFC,'video_pages/',undefined,'/comments_user_token'),
NicoChannelAPIFCFanClubSite = NicoChannelAPIFC + 'fanclub_sites/',
NicoChannelAPIFCFanClubSiteBaseInfo = WW.Tmpl(NicoChannelAPIFCFanClubSite,undefined,'/page_base_info'),
NicoChannelAPIFCFanClubSiteArticleRead = WW.Tmpl(NicoChannelAPIFCFanClubSite,undefined,'/article_themes/news/articles/',undefined),
SheetaAPI = 'https://comm-api.sheeta.com/',
SheetaAPIMessageHistory = WW.Tmpl(SheetaAPI,'messages.history?inclusive=true&sort_direction=asc&limit=1000&oldest_playback_time=',undefined);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	SiteToID = {},
	SiteByID = {},
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
	};

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
			Req = (URL,Data,Auth = SolveCookieToken(Site)) => Ext.ReqB(O.Req(
			{
				URL : URL,
				JSON : Data,
				Head :
				{
					Authorization : Auth && 'Bearer ' + Auth,
					Origin : NicoChannel,
					FC_Site_ID : 0,
					FC_Use_Device : 'null'
				}
			})).Map(Common),

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
							B.forEach((V,F) =>
							{
								if (!Seen.has(V.id))
								{
									++New
									Comment.push
									(
										`${WW.StrDate(V.created_at)} [${WR.PadS0(4,Seen.size)}] ${WW.StrS(V.playback_time)} ${V.nickname}`,
										'	' + V.message,
									)
									Seen.add(V.id)
								}
							})
							return [New,[New && B.at(-1).playback_time,Seen]]
						}),[0,new Set]))
						.FP(WX.Empty),
					Req(NicoChannelAPIFCVideoSession(ID),{})
						.FMap(Session => O.M3U(Video.video_stream.authenticated_url.replace(/{session_id}/,Session.session_id),Ext))
						.FMap(Part => Ext.ReqB(O.Req({URL : Part.Raw.KEY.URI,Enc : false}))
							.Map(B =>
							{
								16 === B.length || WW.Throw('Key is ' + WC.U16S(B))
								B = ' ' + WC.B91S(B)
								Part.URL = Part.URL.map(V => V + B)
								Part.Ext = '.ts'
								return Part
							})),
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
		Pack : Q =>
		{
			var TS = /^(.+\/(\d+)\/[^.]+_(\d+)\.ts) (.+)$/.exec(Q);
			if (TS) return WX.P(S =>
			{
				var
				Key = WC.B91P(TS[4]),
				IV = WC.BV() // createInitializationVector
					.U4(0).U4(0)
					.U4(0).U4(100 * TS[2] + +TS[3])
					.B(),
				D = Crypto.createDecipheriv('AES-128-CBC',WC.Buff(Key),WC.Buff(IV));
				return WN.Req(O.Req(
				{
					URL : TS[1],
					OnD : B => S.D(D.update(B)),
					OnE : () => S.U(D.final()),
				})).On('Err',S.E)
					.End
			})

			return {
				URL : Q,
				Head : {Referer : NicoChannel}
			}
		},
		Range : false,
	}
}