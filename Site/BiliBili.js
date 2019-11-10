'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	BiliBili = 'https://www.bilibili.com/',
	BiliBiliVideo = WW.Tmpl(BiliBili,'video/av',undefined),
	BiliBiliBgmMD = WW.Tmpl(BiliBili,'bangumi/media/md',undefined),
	BiliBiliBgmSS = WW.Tmpl(BiliBili,'bangumi/play/ss',undefined),
	BiliBiliBgmEP = WW.Tmpl(BiliBili,'bangumi/play/ep',undefined),
	BiliBiliMyList = WW.Tmpl(BiliBili,'mylist/mylist-',undefined,'.js'),
	BiliBiliApi = 'https://api.bilibili.com/',
	BiliBiliApiWeb = BiliBiliApi + 'x/web-interface/',
	BiliBiliApiWebNav = BiliBiliApiWeb + 'nav',
	BiliBiliApiWebView = WW.Tmpl(BiliBiliApiWeb,'view?aid=',undefined),
	BiliBiliApiPlayerSo = WW.Tmpl(BiliBiliApi,'x/player.so?aid=',undefined,'&id=cid:',undefined),
	BiliBiliApiSteinNode = WW.Tmpl(BiliBiliApi,'x/stein/nodeinfo?aid=',undefined,'&graph_version=',undefined,'&node_id=',undefined),
	BiliBiliApiFo = WW.Tmpl(BiliBiliApi,'x/relation/followings?vmid=',undefined,'&ps=',O.Size,'&pn=',undefined),
	BiliBiliApiSearchTypeVideo = 'video',
	BiliBiliApiSearchTypeBgm = 'media_bangumi',
	BiliBiliApiSearchTypeFilm = 'media_ft',
	BiliBiliApiSearch = WW.Tmpl(BiliBiliApiWeb,'search/type?search_type=',undefined,'&keyword=',undefined,'&page=',undefined,'&highlight=1',undefined),
	BiliBiliApiPGC = BiliBiliApi + 'pgc/',
	BiliBiliApiPGCMedia = WW.Tmpl(BiliBiliApiPGC,'view/web/media?media_id=',undefined),
	BiliBiliApiPGCSeason = WW.Tmpl(BiliBiliApiPGC,'view/web/season?season_id=',undefined),
	BiliBiliSearch = 'https://search.bilibili.com/',
	BiliBiliSearchS = 'https://s.search.bilibili.com/',
	BiliBiliSearchSuggestion = WW.Tmpl(BiliBiliSearchS,'main/suggest?main_ver=v1&highlight&term=',undefined),
	BiliBiliSpace = 'https://space.bilibili.com/',
	BiliBiliSpaceSubmit = WW.Tmpl(BiliBiliSpace,'ajax/member/getSubmitVideos?mid=',undefined,'&pagesize=',O.Size,'&page=',undefined),
	BiliBiliVCApi = 'https://api.vc.bilibili.com/',
	BiliBiliVCApiDynamicNew = BiliBiliVCApi + 'dynamic_svr/v1/dynamic_svr/dynamic_new?uid=&type_list=8,512',
	BiliBiliVCApiDynamicHistory = WW.Tmpl(BiliBiliVCApi,'dynamic_svr/v1/dynamic_svr/dynamic_history?uid=&type_list=8,512&offset_dynamic_id=',undefined),
	// Appkey = '20bee1f7a18a425c',
	Common = function(V)
	{
		V = WW.IsObj(V) ? V : WC.JTO(V)
		V.code && O.Bad(V.code,V.msg || V.message)
		false === V.status && O.Bad(V.data)
		return V.data || V.result
	},
	SolveAV = function(V,E)
	{
		return {
			ID : V.aid,
			Img : V.pic,
			Title : V.title,
			UP : WR.Default(V.author,V.owner && V.owner.name),
			UPURL : BiliBiliSpace + WR.Default(V.mid,V.owner && V.owner.mid),
			Date : 1E3 * WR.Default(V.created,V.pubdate),
			Len : WR.Default(V.length,V.duration),
			Desc : WR.Default(V.description,V.desc),
			More :
			[
				null != V.ctime && 'CTime ' + O.DTS(1E3 * V.ctime),
				V.stein_guide_cid &&
					O.Ah('Stein ' + V.stein_guide_cid + ' (' + V.videos + ')',
						BiliBiliVideo(V.aid) + '#Stein'),
				V.redirect_url && O.Ah(E = WW.MU(/ep\d+/,V.redirect_url),BiliBiliBgmEP(E = E.slice(2)))
			],
			EP : E
		}
	},
	SolveHighLightRaw,
	SolveHighLight = function(V)
	{
		SolveHighLightRaw = ''
		return WR.MapU(function(V,F)
		{
			SolveHighLightRaw += V = WC.HED(V)
			return 1 & F ? O.High(V) : V
		},V.split(/<em[^>]+>([^<]+)<\/em>/))
	},
	EP2AV = WX.CacheM(function(ID)
	{
		return O.Api(O.Head(BiliBiliBgmEP(ID),'Cookie','stardustpgcv=0')).Map(function(B)
		{
			return [
				WW.MF(/aid":(\d+)/,B),
				WW.MF(/season_id":(\d+)/,B)
			]
		})
	}),
	AV = function(ID)
	{
		return O.Api(BiliBiliApiWebView(ID)).FMap(function(V)
		{
			V = WC.JTO(V)
			return -403 === V.code && O.Auth() ?
				O.Req(BiliBiliApiWebView(ID)) :
				WX.Just(V)
		}).FMap(function(V,R)
		{
			V = Common(V)
			R = [SolveAV(V)].concat(WR.Map(function(B)
			{
				return {
					Index : B.page,
					ID : V.aid + '#' + B.cid,
					View : 'av' + V.aid + '?p=' + B.page,
					URL : BiliBiliVideo(V.aid + '?p=' + B.page),
					Img : V.pic,
					Title : B.part,
					Len : B.duration,
					More : 'cid' + V.cid,
					CID : V.cid
				}
			},V.pages))
			return (R[0].EP ? EP2AV(R[0].EP).Tap(function(Q)
			{
				R[0].More.push(O.Ah('ss' + Q[1],BiliBiliBgmSS(Q[1])))
			}) : WX.Just())
				.Map(WR.Const(R))
		})
	},
	Menu;
	return {
		ID : 'BiliBili',
		Name : '\u55F6\u54E9\u55F6\u54E9',
		Alias : 'B \u55F6\u54E9 \u54D4\u54E9\u54D4\u54E9 \u54D4\u54E9',
		Judge : /\bBiliBili\b|\bAV\d+/i,
		Min : 'SESSDATA',
		Sign : function()
		{
			return O.Req(BiliBiliApiWebNav).Map(function(B)
			{
				return Common(B).uname
			})
		},
		Map : [
		{
			Name : 'Search',
			Judge : O.Find,
			View : function(ID,Page,Pref)
			{
				var
				Find = function(H)
				{
					return O.Api(BiliBiliApiSearch(H,ID,Page,'')).Map(function(B)
					{
						B = Common(B)
						return [B.numPages,B.numResults,WR.Map(function(V)
						{
							return {
								Non : true,
								ID : V.pgc_season_id,
								View : 'ss' + V.pgc_season_id,
								URL : BiliBiliBgmSS(V.pgc_season_id),
								Img : V.cover,
								Title : (V.org_title && V.org_title !== V.title ? V.org_title + '\n' : '') +
									V.title,
								UP : 'md' + V.media_id,
								UPURL : BiliBiliBgmMD(V.media_id),
								Date : 1E3 * V.pubtime
							}
						},B.result)]
					}).ErrAs(function(){return WX.Just([0,[]])})
				}
				ID = WC.UE(ID)
				return WX.Merge
				(
					O.Api(BiliBiliApiSearch(BiliBiliApiSearchTypeVideo,ID,++Page,Pref ? '&' + WC.QSS(Pref) : '')).Map(function(B)
					{
						B = Common(B)
						return [B.numPages,B.numResults,WR.MapU(function(V,F)
						{
							V = SolveAV(V)
							V.Index = F + ~-B.page * B.pagesize
							return V
						},B.result)]
					}),
					Find(BiliBiliApiSearchTypeBgm),
					Find(BiliBiliApiSearchTypeFilm),
					Menu ? WX.Empty :
						O.Api(O.Head(BiliBiliSearch,WW.UA,'Chrome/' + WW.Rnd(3E3,9E9)))
							.FMap(function(B)
							{
								return WW.B.ReqB(O.SolU(WW.MF(/"([^"]+\/search\.[^"]+\.js)/,B)))
							})
							.Tap(function(B)
							{
								B = B.match(/menus:{o.+?}}}}}/g)
									.pop().slice(6,-3)
									.replace(/[\da-z]+(?=:["{])/g,'"$&"')
								Menu = WC.JTO(B)
								return WX.Empty
							})
							.FinErr()
							.FMap(WR.Const(WX.Empty))
				).Reduce(function(D,V)
				{
					return [WR.Max(D[0],V[0]),D[1] + V[1],WR.Concat(D[2],V[2])]
				}).Map(function(V)
				{
					return {
						Max : V[0],
						Len : V[1],
						Item : WR.EachU(function(B,F)
						{
							B.Non && (B.Index = 'Bgm#' + F)
							B.TitleView = SolveHighLight(B.Title)
							B.Title = SolveHighLightRaw
						},V[2].sort(function(Q,S)
						{
							return (0 | S.Non) - (0 | Q.Non) ||
								(Q.Non ? Q.ID - S.ID : Q.Index - S.Index)
						})),
						Pref : Menu && function(I)
						{
							var
							H = function(Q)
							{
								return 5E5 * (Q = Q.split('-'))[0] - ~Q[1]
							},
							R = WV.Pref({C : I});
							WR.EachU(function(V,F)
							{
								V = V[0] ?
									WR.Ent(V).sort(function(Q,S){return H(Q[0]) - H(S[0])}) :
									WR.Ent(V)
								R.S([[null,WV.Inp(
								{
									Hint : O.Pascal(F),
									Inp : R.C(F)
								}).Drop(WR.Map(function(V)
								{
									return [V[0].split('-').pop(),V[1] + ' (' + V[0] + ')']
								},V))]])
							},Menu)
							return R
						}
					}
				})
			},
			Hint : function(Q)
			{
				return O.Api(BiliBiliSearchSuggestion(WC.UE(Q))).Map(function(B)
				{
					B = WC.JTO(B)
					B.code && O.Bad(B.code,B.msg)
					return {
						Item : WR.Map(function(V)
						{
							return [
								V.value,
								SolveHighLight(V.name)
							]
						},WR.Unnest(WR.Val(B.result))),
						Desc : WR.MapU(WR.Join(' '),WR.Ent(B.cost.about)).join(', ')
					}
				})
			}
		},{
			Name : 'Stein',
			Judge : [/AV(\d+)\W+Stein/i,O.Num('Stein')],
			View : O.Less(WX.CacheM(function(ID)
			{
				return AV(ID).FMap(function(R)
				{
					var CID = R[1].CID;
					R.pop()
					return O.Api(O.Head(BiliBiliApiPlayerSo(ID,CID),'Referer',BiliBili)).FMap(function(B)
					{
						var
						Loaded = 0,Max = 0,
						Graph = WW.MF(/graph_version":(\d+)/,B),
						CID2Node = WR.OfObj(CID,[1]),
						Node2CID = {1 : CID};
						Graph || O.Bad('Unable to acquire GraphVersion')
						R[0].More.push('Graph ' + Graph)
						return WX.Exp(function(I)
						{
							return O.Api(BiliBiliApiSteinNode(ID,Graph,CID === I ? '' : CID2Node[I][0])).Map(function(V)
							{
								V = Common(V)
								++Loaded
								R.push(
								{
									ID : ID + '#' + I,
									URL : BiliBiliVideo(ID),
									Img : V.story_list[0].cover.replace(CID,I),
									Title : V.title,
									More : V.edges && V.edges.choices,
									CID : I,
									Node : CID2Node[I]
								})
								V = V.edges && WR.Map(function(B)
								{
									Node2CID[B.node_id] = B.cid
									CID2Node[B.cid] ?
										CID2Node[B.cid].push(B.node_id) :
										CID2Node[++Max,B.cid] = [B.node_id]
									return B.cid
								},V.edges.choices)
								O.Progress('Node ' + Loaded + ' / ' + Max)
								return V
							})
						},CID,true)
					}).Map(function(C)
					{
						WR.EachU(function(V){V.Node.sort(WR.Sub)})
						R.sort(function(Q,S)
						{
							return !Q.Len - !S.Len ||
								Q.Node[0] - S.Node[0]
						})
						C = WR.ReduceU(function(D,V,F){D[V.CID] = F},{},R)
						WR.EachU(function(V,F)
						{
							if (F)
								V.More = 'Node[' + V.Node.length + '] ' + V.Node.join(' ') +
									WR.Map(function(B)
									{
										return '\n[' + C[B.cid] + ':' + B.node_id + '] ' + B.option
									},V.More).join('')
						},R)
						return R
					})
				})
			}))
		},{
			Name : 'Video',
			Judge : [/^\d+$/,O.Num('Video|AID|AV')],
			View : O.Less(AV)
		},{
			Name : 'User',
			Judge : O.Num('Space|User'),
			View : function(ID,Page)
			{
				return O.Api(BiliBiliSpaceSubmit(ID,++Page)).Map(function(V)
				{
					V = Common(V)
					return {
						Max : V.pages,
						Len : V.count,
						Item : WR.Map(SolveAV,V.vlist)
					}
				})
			}
		},{
			Name : 'Following',
			Judge : O.UP,
			View : function(_,Page)
			{
				return O.Req(BiliBiliApiWebNav).FMap(function(B)
				{
					return O.Req(BiliBiliApiFo(Common(B).mid,-~Page))
				}).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.total,
						Item : WR.Map(function(V)
						{
							return {
								Non : true,
								ID : V.mid,
								URL : BiliBiliSpace + V.mid,
								Img : V.face,
								UP : V.uname,
								UPURL : BiliBiliSpace + V.mid,
								Date : 1E3 * V.mtime,
								Desc : V.sign,
								More : V.official_verify && V.official_verify.desc
							}
						},B.list)
					}
				})
			}
		},{
			Name : 'Dynamic',
			Judge : O.TL,
			View : O.More(function()
			{
				return O.Req(BiliBiliVCApiDynamicNew).Map(function(B)
				{
					B = Common(B).cards
					return [[0,WR.Last(B).desc.dynamic_id_str],B]
				})
			},function(I,Page)
			{
				return O.Req(BiliBiliVCApiDynamicHistory(I[Page])).Map(function(B)
				{
					B = Common(B)
					B.has_more && (I[-~Page] = WR.Last(B.cards).desc.dynamic_id_str)
					return B.cards
				})
			},function(Q)
			{
				return {
					Item : WR.Map(function(V)
					{
						return SolveAV(WC.JTO(V.card))
					},Q)
				}
			})
		},{
			Name : 'Episode',
			Judge : O.Num('Episode|EP'),
			View : O.Less(function(ID)
			{
				return EP2AV(ID).FMap(function(Q)
				{
					return AV(Q[0])
				})
			})
		},{
			Name : 'Season',
			Judge : O.Num('Season|SS'),
			View : O.Less(function(ID)
			{
				return O.Api(BiliBiliApiPGCSeason(ID)).Map(function(B)
				{
					B = Common(B)
					return [
					{
						Non : true,
						ID : 'ss' + B.season_id,
						URL : BiliBiliBgmSS(B.season_id),
						Img : B.cover,
						Title : B.title,
						UP : 'md' + B.media_id,
						UPURL : BiliBiliBgmMD(B.media_id),
						Date : B.publish.pub_time,
						Desc : B.evaluate,
						More : B.time_length_show
					}].concat(WR.MapU(function(V,F)
					{
						return {
							Index : F,
							ID : V.aid + '#' + V.cid,
							URL : BiliBiliBgmEP(V.id),
							Img : V.pic,
							Title : WR.Trim(V.title + ' ' + V.long_title),
							UP : 'ep' + V.id,
							UPURL : BiliBiliBgmEP(V.id),
							More : 'cid' + V.cid
						}
					},B.episodes))
				})
			})
		},{
			Name : 'Media',
			Judge : O.Num('Media|MD'),
			View : function(ID)
			{
				return O.Api(BiliBiliApiPGCMedia(ID))
					.FMap(function(B){return O.Api(BiliBiliApiPGCSeason(Common(B).season_id))})
					.Map(function(B)
					{
						B = Common(B)
						return {
							Item : WR.Map(function(V,J)
							{
								J = V.season_id === B.season_id
								return {
									Non : true,
									ID : 'ss' + V.season_id,
									URL : BiliBiliBgmSS(V.season_id),
									Img : V.cover,
									Title : J ? B.title : V.season_title,
									UP : 'md' + V.media_id,
									UPURL : BiliBiliBgmMD(V.media_id),
									Date : J && B.publish.pub_time,
									Desc : J && B.evaluate,
									More : J && B.time_length_show
								}
							},B.seasons.length ? B.seasons : [B])
						}
					})
			}
		},{
			Name : 'MyList',
			Judge : O.Num('MyList'),
			View : O.Less(function(ID)
			{
				return O.Api(BiliBiliMyList(ID)).Map(function(B)
				{
					B = WW.MF(/Array\(([^]+)\);\s+init/,B)
					return WR.Map(function(V)
					{
						return {
							ID : V.aid,
							Title : V.title,
							Date : 1E3 * V.pubdate
						}
					},WC.JTO('[' + B + ']'))
				})
			})
		}],
		IDView : WR.Add('av'),
		IDURL : BiliBiliVideo
	}
})