'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	Nico = 'https://www.nicovideo.jp/',
	NicoWatch = WW.Tmpl(Nico,'watch/',undefined),
	NicoUser = WW.Tmpl(Nico,'user/',undefined),
	NicoMyList = WW.Tmpl(Nico,'mylist/',undefined),
	NicoMy = Nico + 'my',
	NicoRepo = WW.Tmpl(Nico,'api/nicorepo/timeline/my/followingUser?cursor=',undefined,'&client_app=pc_myrepo'),
	NicoSearch = WW.Tmpl(Nico,'search/',undefined,'?page=',undefined,undefined),
	NicoNVAPI = 'https://nvapi.nicovideo.jp/',
	NicoNVAPIUser = WW.Tmpl(NicoNVAPI,'v1/users/',undefined,'/videos?sortKey=registeredAt&sortOrder=desc&pageSize=',O.Size,'&page=',undefined),
	NicoNVAPIFollowing = WW.Tmpl(NicoNVAPI,'v1/users/me/following/users?pageSize=',O.Size,'&cursor=',undefined),
	NicoNVAPIMyList = WW.Tmpl(NicoNVAPI,'v2/mylists/',undefined,'?pageSize=',O.Size,'&page=',undefined),
	NicoChannel = 'https://ch.nicovideo.jp/',
	NicoChannelCH = NicoChannel + 'ch',
	NicoExt = 'https://ext.nicovideo.jp/',
	NicoExtThumb = WW.Tmpl(NicoExt,'api/getthumbinfo/',undefined),
	NicoSearchSug = 'http://sug.search.nicovideo.jp/',
	NicoSearchSugComplete = WW.Tmpl(NicoSearchSug,'suggestion/complete/',undefined),
	SolveSM = function(Q)
	{
		return Q.replace(/^SM/i,'')
	},
	PadSM = function(Q)
	{
		return /^\d/.test(Q) ? 'sm' + Q : Q
	},
	MakeNV = function(Q)
	{
		return O.Head(Q,'X-Frontend-Id',WW.Rnd(3389))
	},
	NVCommon = function(Q)
	{
		Q = WC.JTO(Q)
		Q.meta || O.Bad(Q)
		200 === Q.meta.status || O.Bad(O.meta.status,Q.meta.errorCode)
		return Q.data
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
				More : (V.addedAt ? 'Added at ' + O.DTS(V.addedAt) + '\n' : '') +
					B.latestCommentSummary
			}
		},Q.items)
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
			Name : 'Search',
			Judge : O.Find,
			View : function(ID,Page,Pref)
			{
				return O.Api(NicoSearch(WC.UE(ID),-~Page,Pref ? '&' + WC.UD(WC.QSS(Pref)) : '')).Map(function(B)
				{
					return {
						Len : +WW.MF(/"dataValue[^>]+>([\d,]+)/,B).replace(/,/g,''),
						Size : 32,
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								ID : SolveSM(V[1]),
								Img : WW.MF(/original="([^"]+)/,V = V[0]),
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
								R.S([[null,WV.Inp(
								{
									Hint : WW.MF(/h\d+>([^<]+)/,V),
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
				return O.Api(NicoSearchSugComplete(WC.UE(ID))).Map(function(V)
				{
					return {
						Item : WC.JTO(V).candidates
					}
				})
			}
		},{
			Name : 'MyList',
			Judge : O.Num('MyList'),
			View : function(ID,Page)
			{
				return O.Req(MakeNV(NicoNVAPIMyList(ID,-~Page))).Map(function(B)
				{
					B = NVCommon(B).mylist
					return {
						Len : B.totalItemCount,
						Item : SolveNVItem(B)
					}
				})
			}
		},{
			Name : 'User',
			Judge : O.Num('User'),
			View : function(ID,Page)
			{
				return O.Api(MakeNV(NicoNVAPIUser(ID,-~Page))).Map(function(B)
				{
					B = NVCommon(B)
					return {
						Len : B.totalCount,
						Item : SolveNVItem(B)
					}
				})
			}
		},{
			Name : 'Following',
			Judge : O.UP,
			View : O.More(function()
			{
				return O.Req(MakeNV(NicoNVAPIFollowing('')))
			},function(I,Page)
			{
				return O.Req(MakeNV(NicoNVAPIFollowing(I[Page])))
			},function(B)
			{
				B = NVCommon(B)
				return [B.summary.hasNext && B.summary.cursor,
				{
					Len : B.summary.followees,
					Item : WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.id,
							URL : NicoUser(V.id),
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
			View : function(ID)
			{
				ID = WR.Low(ID)
				return O.Api(NicoExtThumb(PadSM(ID))).Map(function(B)
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
							Date : new Date(WW.MF(/ieve>([^<]+)/,B)),
							Len : WW.MF(/gth>([^<]+)/,B),
							Desc : WC.HED(WW.MF(/tion>([^<]+)/,B))
						}]
					}
				})
			}
		},{
			Name : 'Top',
			Judge : O.TL,
			View : O.More(function()
			{
				return O.Req(NicoRepo(''))
			},function(I,Page)
			{
				return O.Req(NicoRepo(I[Page]))
			},function(B)
			{
				B = WC.JTO(B)
				'ok' === B.status || O.Bad(B.meta.status,B.status)
				return [B.meta.minId,
				{
					Item : WR.Reduce(function(D,V)
					{
						switch (V.topic)
						{
							case 'nicovideo.user.video.upload' :
								D.push(
								{
									ID : SolveSM(V.video.id),
									Img : V.video.thumbnailUrl.normal,
									Title : V.video.title,
									UP : V.senderNiconicoUser.nickname,
									UPURL : NicoUser(V.senderNiconicoUser.id),
									Date : new Date(V.createdAt)
								})
								break
							case 'nicovideo.user.mylist.add.video' :
								D.push(
								{
									Non : true,
									ID : 'MyList ' + V.mylist.id,
									URL : NicoMyList(V.mylist.id),
									Img : WR.Last(WR.Val(V.senderNiconicoUser.icons.tags.defaultValue.urls)),
									Title : V.mylist.name,
									UP : V.senderNiconicoUser.nickname,
									UPURL : NicoUser(V.senderNiconicoUser.id),
									Date : new Date(V.createdAt)
								})
								break
						}
					},[],B.data)
				}]
			})
		}],
		IDView : PadSM,
		IDURL : WR.Pipe(PadSM,NicoWatch)
	}
})