'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	Nico = 'https://www.nicovideo.jp/',
	NicoWatch = WW.Tmpl(Nico,'watch/sm',undefined),
	NicoUser = WW.Tmpl(Nico,'user/',undefined),
	NicoUserVideo = WW.Tmpl(Nico,'user/',undefined,'/video?page=',undefined),
	NicoMyList = WW.Tmpl(Nico,'mylist/',undefined),
	NicoAPIMyList = Nico + 'api/mylist/list',
	NicoMy = Nico + 'my',
	NicoMyFavUser = WW.Tmpl(Nico,'my/fav/user?page=',undefined),
	NicoRepo = WW.Tmpl(Nico,'api/nicorepo/timeline/my/followingUser?cursor=',undefined,'&client_app=pc_myrepo'),
	NicoSearch = WW.Tmpl(Nico,'search/',undefined,'?page=',undefined,undefined),
	NicoExt = 'https://ext.nicovideo.jp/',
	NicoExtSM = WW.Tmpl(NicoExt,'api/getthumbinfo/sm',undefined),
	NicoSearchSug = 'http://sug.search.nicovideo.jp/',
	NicoSearchSugComplete = WW.Tmpl(NicoSearchSug,'suggestion/complete/',undefined),
	SolveSM = function(Q)
	{
		return Q.replace(/^SM/i,'')
	};
	return {
		ID : 'NicoNico',
		Name : '\u30CB\u30B3\u30CB\u30B3',
		Alias : 'N',
		Judge : /\bNico(Nico|Video)\b|\bSM\d+$/i,
		Min : 'user_session',
		Sign : function()
		{
			return O.Req({url : NicoMy,maxRedirects : 1}).Map(function(B)
			{
				return WC.JTO(WW.MF(/nickname[ =]+(".*");/,B))
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
								ID : WW.MF(/sm(\d+)/,V),
								Img : WW.MF(/original="([^"]+)/,V),
								Title : WC.HED(WW.MF(/title="([^"]+)/,V)),
								Date : WW.MF(/time">([^<]+)/,V),
								Len : WW.MF(/gth">([^<]+)/,V)
							})
							return D
						},[],/video-id[^]+?<\/li/g,B),
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
									Inp : R.C(K)
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
			Name : 'User',
			Judge : O.Num('User'),
			View : function(ID,Page)
			{
				return O.Api(NicoUserVideo(ID,-~Page)).Map(function(B)
				{
					/noListMsg/.test(B) &&
						O.Bad(WC.HED(WW.MF(/noListMsg[^]+?>(?=[^\s<])([^<]+)/,B)))
					return {
						Len : +WW.MF(/id="video[^]+?(\d+(?!>))/,B),
						Item : WW.MR(function(D,V)
						{
							D.push(
							{
								ID : WW.MF(/sm(\d+)/,V),
								Img : WC.HED(WW.MF(/inal="([^"]+)/,V)),
								Title : WC.HED(WW.MF(/<a[^>]+\/sm\d[^>]+>([^<]+)/,V)),
								Date : WR.Trim(WW.MF(/time">([^<]+)/,V)),
								Len : WW.MF(/Time">([^<]+)/,V)
							})
							return D
						},[],/"outer[^]+?<\/p/g,B)
					}
				})
			}
		},{
			Name : 'Following',
			Judge : O.UP,
			View : function(_,Page)
			{
				return O.Req(NicoMyFavUser(-~Page)).Map(function(B)
				{
					return {
						Len : +WW.MF(/favUser[^(]+\((\d+)/,B),
						Size : 20,
						Item : WW.MR(function(D,V,I)
						{
							D.push(
							{
								Non : true,
								ID : I = WW.MF(/user\/(\d+)/,V),
								URL : NicoUser(I),
								Img : WW.MF(/src="([^"]+)/,V),
								UP : WC.HED(WW.MF(/alt="([^"]+)/,V)),
								UPURL : NicoUser(I),
								More : WC.HED(WW.MF(/<p>([^<]+)/,V))
							})
							return D
						},[],/thumbCont[^]+?buttonShape/g,B)
					}
				})
			}
		},{
			Name : 'MyList',
			Judge : O.Num('MyList'),
			View : O.Less(function(ID)
			{
				return O.Req(
				{
					url : NicoAPIMyList,
					method : 'POST',
					form : {group_id : ID}
				}).Map(function(B)
				{
					B = WC.JTO(B)
					'ok' === B.status || O.Bad(B.error.code,B.error.description)
					return WR.Map(function(V,D)
					{
						D = V.item_data
						return {
							ID : SolveSM(D.video_id),
							Img : D.thumbnail_url,
							Title : D.title,
							Date : 1E3 * D.first_retrieve,
							Len : +D.length_seconds,
							Desc : D,
							More : 'Updated at ' + O.DTS(1E3 * D.update_time) + '\n' +
								'Added at ' + O.DTS(1E3 * V.create_time)
						}
					},B.mylistitem).reverse()
				})
			})
		},{
			Name : 'Video',
			Judge : [/^\d+$/,O.Num('Video|SM')],
			View : function(ID)
			{
				return O.Api(NicoExtSM(ID)).Map(function(B)
				{
					/<error>/.test(B) && O.Bad(WW.MF(/code>([^<]+)/,B),WW.MF(/tion>([^<]+)/,B))
					return {
						Item : [
						{
							ID : ID,
							Img : WW.MF(/l_url>([^<]+)/,B),
							Title : WC.HED(WW.MF(/itle>([^<]+)/,B)),
							UP : WC.HED(WW.MF(/name>([^<]+)/,B)),
							UPURL : NicoUser(WW.MF(/user_id>(\d+)/,B)),
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
				return O.Req(NicoRepo('')).Map(function(B,R)
				{
					R = function(B)
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
					}
					B = R(B)
					return [[R,B[0]],B[1]]
				})
			},function(I,Page)
			{
				return O.Req(NicoRepo(I[Page])).Map(function(B)
				{
					B = I[0](B)
					I[-~Page] = B[0]
					return B[1]
				})
			})
		}],
		IDView : WR.Add('sm'),
		IDURL : NicoWatch
	}
})