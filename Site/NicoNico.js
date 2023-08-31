'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	PrefixVideo = 'sm',
	PrefixChannel = 'ch',
	PrefixSeiga = 'im',
	PrefixMangaEpisode = 'mg',

	Nico = 'https://www.nicovideo.jp/',
	NicoWatch = WW.Tmpl(Nico,'watch/',undefined),
	NicoUser = WW.Tmpl(Nico,'user/',undefined),
	// NicoMyList = WW.Tmpl(Nico,'mylist/',undefined),
	NicoSeries = WW.Tmpl(Nico,'series/',undefined),
	NicoMy = Nico + 'my',
	// NicoRepo = WW.Tmpl(Nico,'api/nicorepo/timeline/my/followingUser?cursor=',undefined,'&client_app=pc_myrepo'),
	NicoSearch = WW.Tmpl(Nico,'search/',undefined,'?page=',undefined,undefined),
	NicoNVAPI = 'https://nvapi.nicovideo.jp/',
	NicoNVAPIUser = WW.Tmpl(NicoNVAPI,'v1/users/',undefined,'/videos?sortKey=registeredAt&sortOrder=desc&pageSize=',O.Size,'&page=',undefined),
	NicoNVAPIFollowing = WW.Tmpl(NicoNVAPI,'v1/users/me/following/users?pageSize=',O.Size,'&cursor=',undefined),
	NicoNVAPIMyList = WW.Tmpl(NicoNVAPI,'v2/mylists/',undefined,'?pageSize=',O.Size,'&page=',undefined),
	NicoPublicAPI = 'https://public.api.nicovideo.jp/',
	NicoPublicAPITop = WW.Tmpl(NicoPublicAPI,'v1/timelines/nicorepo/last-1-month/my/pc/entries.json?list=followingUser&untilId=',undefined),
	NicoChannel = 'https://ch.nicovideo.jp/',
	NicoChannelCH = NicoChannel + 'ch',
	NicoChannelVideo = WW.Tmpl(NicoChannel,undefined,'/video?sort=f&order=d&page=',undefined),
	NicoExt = 'https://ext.nicovideo.jp/',
	NicoExtThumb = WW.Tmpl(NicoExt,'api/getthumbinfo/',undefined),
	NicoSearchSug = 'https://sug.search.nicovideo.jp/',
	NicoSearchSugComplete = WW.Tmpl(NicoSearchSug,'suggestion/complete/',undefined),
	NicoSeiga = 'https://seiga.nicovideo.jp/',
	NicoSeigaMy = WW.Tmpl(NicoSeiga + 'my/personalize?page=',undefined),
	NicoSeigaSeiga = WW.Tmpl(NicoSeiga,'seiga/',undefined),
	NicoSeigaUser = WW.Tmpl(NicoSeiga,'user/illust/',undefined),
	NicoSeigaUserAll = WW.Tmpl(NicoSeiga,'user/illust/',undefined,'?target=illust_all&page=',undefined),
	NicoSeigaComic = WW.Tmpl(NicoSeiga,'comic/',undefined),
	NicoSeigaWatch = WW.Tmpl(NicoSeiga,'watch/',undefined),
	NicoSeigaUserManga = WW.Tmpl(NicoSeiga,'manga/list?user_id=',undefined),
	NicoSeigaAPI = NicoSeiga + 'api/',
	// First 200 only
	// NicoSeigaAPIUserData = WW.Tmpl(NicoSeigaAPI,'user/data?id=',undefined),
	NicoSeigaAPIIllust = WW.Tmpl(NicoSeigaAPI,'illust/info?id=',undefined),
	// NicoSeigaAPIMangaInfo = WW.Tmpl(NicoSeigaAPI,'manga/info?id=',undefined),
	NicoSeigaAPIMangaEpisodeInfo = WW.Tmpl(NicoSeigaAPI,'theme/info?id=',undefined),
	// NicoSeigaLohas = 'https://lohas.nicoseiga.jp/',
	// NicoSeigaLohasThumb = WW.Tmpl(NicoSeigaLohas,'thumb/',undefined,'qz'),
	SolveSM = function(Q)
	{
		return Q.replace(/^SM/i,'')
	},
	PadSM = function(Q)
	{
		return /^\d/.test(Q) ? PrefixVideo + Q : Q
	},
	PadCH = function(Q)
	{
		return /^\d/.test(Q) ? PrefixChannel + Q : Q
	},
	MakeNV = function(Q)
	{
		return O.Head(Q,'X-Frontend-Id',WW.Rnd(3389))
	},
	CommonMeta = function(Q)
	{
		Q = WC.JTO(Q)
		Q.meta || O.Bad(Q)
		200 === Q.meta.status || O.Bad(O.meta.status,Q.meta.errorCode)
		return Q
	},
	CommonNV = function(Q)
	{
		return CommonMeta(Q).data
	},
	SolveNVItem = function(Q)
	{
		return WR.Map(function(V,B)
		{
			B = V.video || V
			return {
				ID : SolveSM(B.id),
				Img : B.thumbnail.url,
				Title : B.title,
				UP : B.owner && B.owner.name,
				UPURL : B.owner && NicoUser(B.owner.id),
				Date : O.DTS(B.registeredAt),
				Len : +B.duration,
				More : (V.addedAt ? 'Added at ' + O.DTS(V.addedAt) : '') +
					B.latestCommentSummary
			}
		},Q.items)
	},
	SolveXMLField = function(Q,B)
	{
		return WC.HED(WW.MF(RegExp('<' + Q + '>([^]+?)</' + Q + '>'),B))
	},
	SolveXMLDesc = function(B)
	{
		return O.Text(SolveXMLField('description',B))
	};
	return {
		ID : 'NicoNico',
		Name : '\u30CB\u30B3\u30CB\u30B3',
		Alias : 'N',
		Judge : /\bNico(Nico|Video)\b|\bSM\d+$/i,
		Min : 'user_session',
		Sign : function()
		{
			return O.Req({URL : NicoMy,RedX : 1}).Map(function(B)
			{
				return O.JOM(/\bnickname[ =:"]+(?=")/,WC.HED(B))
			})
		},
		Map : [
		{
			Name : O.NameFind,
			View : function(ID,Page,Pref)
			{
				return O.API(NicoSearch(WC.UE(ID),-~Page,Pref ? '&' + WC.UD(WC.QSS(Pref)) : '')).Map(function(B)
				{
					return {
						Len : +WW.MF(/"dataValue[^>]+>([\d,]+)/,B).replace(/,/g,''),
						Size : 32,
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								ID : SolveSM(V[1]),
								Img : WW.MF(/(?:original|src)="([^"]+)/,V = V[0]),
								Title : WC.HED(WW.MF(/title="([^"]+)/,V)),
								Date : WW.MF(/time">([^<]+)/,V),
								Len : WW.MF(/gth">([^<]+)/,V)
							})
							return D
						},[],/video-id="([^"]+)[^]+?<\/li/g,B),
						Pref : function(I)
						{
							var
							R = WV.Pref({C : I});
							WW.MR(function(K,V,D)
							{
								D = WW.MR(function(D,V)
								{
									K = K || V[1]
									D.push(
									[
										WC.HED(V[2] || '').replace(/&sort.*/,''),
										V[3]
									])
									return D
								},[],/-label"[^">]*(?:"[^"]+\?([^=]+)=([^"]+))?[^>]*>([^<]+)/g,V)
								R.S([[WW.MF(/h\d+>([^<]+)/,V),WV.Inp(
								{
									Inp : R.C(K),
									NoRel : O.NoRel
								}).Drop(D)]])
							},0,/"title">\s+<h[^]+?<\/ul/g,B)
							return R
						}
					}
				})
			},
			Hint : function(ID)
			{
				return O.API(NicoSearchSugComplete(WC.UE(ID))).Map(function(V)
				{
					return {
						Item : WC.JTO(V).candidates
					}
				})
			}
		},{
			Name : 'UserManga',
			Judge : O.Num('User\\W*Manga|Manga.*User(?:_ID)?'),
			JudgeVal : O.ValNum,
			View : function(ID,Page)
			{
				// Examples where paging effects are not identified yet
				return O.Req(NicoSeigaUserManga(ID,-~Page)).Map(function(B)
				{
					return {
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								Non : true,
								ID : WW.MF(/\/comic\/(\d+)/,V),
								URL : NicoSeigaComic,
								Img : WW.MF(/thumb_image"[^<>]+src="([^"]+)/,V),
								Title : WW.MF(/"title">(?:<[^>]+>)*([^<]+)/,V),
								More :
								[
									WC.HED(WW.MF(/created">([^<]+)/,V)),
									WC.HED(WW.MF(/updated">([^<]+)/,V)),
									WR.Trim(WC.HED(WW.MF(/"description">([^<]+)/,V)))
								]
							})
							return D
						},[],/"mg_item[^]+?<\/li/g,B)
					}
				})
			}
		},{
			Name : 'Manga',
			Judge : O.Num('Manga|Comic'),
			JudgeVal : O.ValNum,
			View : O.Less(function(ID)
			{
				return O.Req(NicoSeigaComic(ID)).Map(function(B)
				{
					var
					UP = WC.HED(WW.MF(/"author_name">([^<]+)/,B)),
					UPURL = NicoSeigaUserManga(WW.MF(/"author_list"[^]+?user_id=(\d+)/,B));
					return WW.MR(function(D,V)
					{
						D.push(
						{
							ID : WW.MF(/\/(mg\d+)/,V),
							Img : WW.MF(/data-original="([^"]+)/,V),
							Title : WC.HED(WW.MF(/alt="([^"]+)/,V)),
							UP : UP,
							UPURL : UPURL,
							More :
							[
								WC.HED(WW.MF(/"counter[^>]+>([^<]+)/,V)),
								WC.HED(WW.MF(/"comment_summary[^>]+>([^<]+)/,V))
							]
						})
						return D
					},[],/"episode_item">[^]+?<\/li/g,B)
				})
			})
		},{
			Name : 'MangaEpisode',
			Judge : O.Num('MangaEpisode|MG'),
			JudgeVal : O.ValNum,
			View : function(ID)
			{
				return O.Req(NicoSeigaAPIMangaEpisodeInfo(ID)).Map(function(B)
				{
					return {
						Item : [
						{
							ID : PrefixMangaEpisode + ID,
							Img : SolveXMLField('thumbnail_url',B),
							Title : SolveXMLField('episode_title',B),
							UP : 'User' + SolveXMLField('user_id',B),
							UPURL : NicoSeigaUserManga(SolveXMLField('user_id',B)),
							Date : SolveXMLField('created',B),
							Desc : SolveXMLDesc(B),
							More :
							[
								O.Ah(SolveXMLField('content_title',B),NicoSeigaComic(SolveXMLField('content_id',B)))
							]
						}]
					}
				})
			}
		},{
			Name : 'UserIllust',
			Judge : O.Num('User\\W*Illust'),
			JudgeVal : O.ValNum,
			View : function(ID,Page)
			{
				return O.Req(NicoSeigaUserAll(ID,-~Page)).Map(function(B)
				{
					return {
						Size : 40,
						Len : WW.MF(/<a[^>]+target=illust_all[^]+?>(\d+)</,B),
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								ID : WW.MF(/\/(im\d+)/,V),
								Img : WW.MF(/src="([^"]+)/,V),
								Title : WC.HED(WW.MF(/"title">([^<]+)/,V))
							})
							return D
						},[],/class="list_item[^]+?<\/li/g,B)
					}
				})
			}
		},{
			Name : 'Seiga',
			Judge : O.Num('Seiga|IM'),
			JudgeVal : O.ValNum,
			View : function(ID)
			{
				return O.Req(NicoSeigaAPIIllust(ID)).Map(function(B)
				{
					return {
						Item : [
						{
							ID : PrefixSeiga + ID,
							Img : SolveXMLField('thumbnail_url',B),
							Title : SolveXMLField('title',B),
							UP : 'User' + SolveXMLField('user_id',B),
							UPURL : NicoSeigaUser(SolveXMLField('user_id',B)),
							Date : SolveXMLField('created',B) + '+0900',
							Desc : SolveXMLDesc(B)
						}]
					}
				})
			}
		},{
			// /my/personalize
			Name : 'SeigaMyPersonalize',
			JudgeVal : false,
			View : function(_,Page)
			{
				return O.Req(NicoSeigaMy(-~Page)).Map(function(B)
				{
					return {
						Size : 20,
						Max : WW.MR(function(D,V)
						{
							return WR.Max(D,+V[1])
						},1,/>(\d+)</g,WW.MU(/class="mg_pager.*/,B)),
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								ID : WW.MF(/\/(im\d+)/,V),
								Img : WW.MF(/src="([^"]+)/,V),
								Title : WR.Trim(WC.HED(WW.MF(/<a[^>]+>([^<]+)/,V))),
								UP : WC.HED(WW.MF(/class="user_name"[^>]+>([^<]+)/,V)),
								UPURL : NicoSeigaUser(WW.MF(/User\/Illust\/(\d+)/i,V))
							})
							return D
						},[],/class="illust_thumb[^]+?<\/p>\s*<\/div>/g,B)
					}
				})
			}
		},{
			Name : 'MyList',
			Judge : O.Num('MyList'),
			JudgeVal : O.ValNum,
			View : function(ID,Page)
			{
				return O.Req(MakeNV(NicoNVAPIMyList(ID,-~Page))).Map(function(B)
				{
					B = CommonNV(B).mylist
					return {
						Len : B.totalItemCount,
						Item : SolveNVItem(B)
					}
				})
			}
		},{
			// It does not seem to be paged (3**3*2593)
			Name : 'Series',
			Judge : O.Num('Series'),
			JudgeVal : O.ValNum,
			View : O.Less(function(ID)
			{
				return O.API(NicoSeries(ID)).Map(function(B)
				{
					return WW.MR(function(D,V)
					{
						D.push(
						{
							ID : SolveSM(WW.MF(/video-id="(\w+)/,V)),
							Img : WW.MF(/image="([^"]+)/,V),
							Title : WC.HED(WW.MF(/alt="([^"]+)/,V)),
							Date : WW.MF(/RegisteredAt">\s*(\S+ \S+)/,V),
							Len : WW.MF(/VideoLength">([^<]+)/,V)
						})
						return D
					},[],/class="MediaObject[^]+?videoMetaCount">/g,B)
				})
			})
		},{
			Name : 'User',
			Judge : O.Num('User'),
			JudgeVal : O.ValNum,
			View : function(ID,Page)
			{
				return O.API(MakeNV(NicoNVAPIUser(ID,-~Page))).Map(function(B)
				{
					B = CommonNV(B)
					return {
						Len : B.totalCount,
						Item : SolveNVItem(B)
					}
				})
			}
		},{
			Name : 'Channel',
			Judge :
			[
				O.Num('Channel|CH'),
				/Ch\.Nico[^/]+\/([^ ?/]+)/i
			],
			JudgeVal : O.ValNum,
			View : function(ID,Page)
			{
				return O.Req(NicoChannelVideo(PadCH(ID),-~Page)).Map(function(B)
				{
					var
					UP = WW.MF(/channel_name"[^]+?>([^<]+)</,B),
					UPURL = NicoChannel + WW.MF(/channel_name"[^]+?href="\/([^"]+)/,B);
					return {
						Len : +WW.MF(/articles_total_number">(\d+)/,B),
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								ID : WW.MF(/watch\/(\w+)/,V),
								Img : WW.MF(/src="([^"]+)/,V),
								Title : WC.HED(WW.MF(/title">[^]+?title="([^"]+)/,V)),
								UP : UP,
								UPURL : UPURL,
								Date : WW.MF(/time>[^]+?title='([^']+)/,V),
								Len : WW.MF(/length"[^>]+>([^<]+)/,V),
								More : WR.Trim(WW.MF(/description">([^<]+)/,V)),
							})
							return D
						},[],/"item">[^]+?\/time>/g,B)
					}
				})
			}
		},{
			Name : O.NameUP,
			JudgeVal : false,
			View : O.More(function()
			{
				return O.Req(MakeNV(NicoNVAPIFollowing('')))
			},function(I,Page)
			{
				return O.Req(MakeNV(NicoNVAPIFollowing(I[Page])))
			},function(B)
			{
				B = CommonNV(B)
				return [B.summary.hasNext && B.summary.cursor,
				{
					Len : B.summary.followees,
					Item : WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.id,
							URL : NicoUser,
							Img : V.icons.large,
							UP : V.nickname,
							UPURL : NicoUser(V.id),
							More : V.description
						}
					},B.items)
				}]
			})
		},{
			Name : 'Video',
			Judge :
			[
				/^\d+$/,O.Num('Video|SM'),
				/\b(?:SO|NM)\d+\b/i
			],
			JudgeVal : O.ValNum,
			View : function(ID)
			{
				ID = WR.Low(ID)
				return O.API(NicoExtThumb(PadSM(ID))).Map(function(B)
				{
					var T;
					/<error>/.test(B) && O.Bad(WW.MF(/code>([^<]+)/,B),WW.MF(/tion>([^<]+)/,B))
					return {
						Item : [
						{
							ID : ID,
							Img : WW.MF(/l_url>([^<]+)/,B),
							Title : WC.HED(WW.MF(/itle>([^<]+)/,B)),
							UP : WC.HED(WW.MF(/name>([^<]+)/,B)),
							UPURL : (T = WW.MF(/user_id>(\d+)/,B)) ? NicoUser(T) :
								(T = WW.MF(/ch_id>(\d+)/,B)) ? NicoChannelCH + T :
								'',
							Date : WW.MF(/ieve>([^<]+)/,B),
							Len : WW.MF(/gth>([^<]+)/,B),
							Desc : WC.HED(WW.MF(/tion>([^<]+)/,B))
						}]
					}
				})
			}
		},{
			Name : 'Top',
			Judge : /^$/,
			JudgeVal : false,
			View : O.More(function()
			{
				return O.Req(NicoPublicAPITop(''))
			},function(I,Page)
			{
				return O.Req(NicoPublicAPITop(I[Page]))
			},function(B)
			{
				B = CommonMeta(B)
				return [B.meta.hasNext && B.meta.minId,
				{
					Item : WR.MapW(function(V)
					{
						return 'video' === V.object.type ?
						{
							ID : SolveSM(V.object.url.split('/').pop()),
							Img : V.object.image,
							Title : V.object.name,
							UP : V.actor.name,
							UPURL : V.actor.url,
							Date : V.updated,
							More : WV.Parse(V.title)
						} : null
					},B.data)
				}]
			})
		}],
		IDView : PadSM,
		IDURL : function(V)
		{
			var
			ID,Prefix;
			V = PadSM(V)
			ID = /^([A-Z]+)(\d+)$/i.exec(V)
			if (ID)
			{
				Prefix = ID[1]
				ID = ID[2]
			}
			return PrefixSeiga === Prefix ? NicoSeigaSeiga(V) :
				PrefixMangaEpisode === Prefix ? NicoSeigaWatch(V) :
				NicoWatch(V)
		}
	}
})