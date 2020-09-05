'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	ShortVideoPrefix = 'vc',

	BiliBili = 'https://www.bilibili.com/',
	BiliBiliVideo = WW.Tmpl(BiliBili,'video/av',undefined),
	BiliBiliBgmMD = WW.Tmpl(BiliBili,'bangumi/media/md',undefined),
	BiliBiliBgmSS = WW.Tmpl(BiliBili,'bangumi/play/ss',undefined),
	BiliBiliBgmEP = WW.Tmpl(BiliBili,'bangumi/play/ep',undefined),
	BiliBiliMyList = WW.Tmpl(BiliBili,'mylist/mylist-',undefined,'.js'),
	BiliBiliAudio = BiliBili + 'audio/',
	BiliBiliAudioURL = BiliBili + 'audio/au',
	BiliBiliAudioWeb = BiliBiliAudio + 'music-service-c/web/',
	BiliBiliAudioWebInfo = WW.Tmpl(BiliBiliAudioWeb,'song/info?sid=',undefined),
	BiliBiliAudioWebUp = WW.Tmpl(BiliBiliAudioWeb,'song/upper?uid=',undefined,'&pn=',undefined,'&ps=',O.Size,'&order=1'),
	BiliBiliAudioWebMenu = WW.Tmpl(BiliBiliAudioWeb,'song/of-menu?sid=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliApi = 'https://api.bilibili.com/',
	BiliBiliApiFav = WW.Tmpl(BiliBiliApi,'medialist/gateway/base/spaceDetail?media_id=',undefined,'&pn=',undefined,'&ps=20'),
	BiliBiliApiWeb = BiliBiliApi + 'x/web-interface/',
	BiliBiliApiWebNav = BiliBiliApiWeb + 'nav',
	BiliBiliApiWebView = WW.Tmpl(BiliBiliApiWeb,'view?aid=',undefined),
	BiliBiliApiWebViewBV = WW.Tmpl(BiliBiliApiWeb,'view/detail?bvid=',undefined),
	BiliBiliApiPlayerSo = WW.Tmpl(BiliBiliApi,'x/player.so?aid=',undefined,'&id=cid:',undefined),
	BiliBiliApiSteinNode = WW.Tmpl(BiliBiliApi,'x/stein/nodeinfo?aid=',undefined,'&graph_version=',undefined,'&node_id=',undefined),
	BiliBiliApiFo = WW.Tmpl(BiliBiliApi,'x/relation/followings?vmid=',undefined,'&ps=',O.Size,'&pn=',undefined),
	BiliBiliApiSpace = BiliBiliApi + 'x/space/',
	BiliBiliApiSpaceInfo = WW.Tmpl(BiliBiliApiSpace,'acc/info?mid=',undefined),
	BiliBiliApiSpaceNavNum = WW.Tmpl(BiliBiliApiSpace,'navnum?mid=',undefined,'&callback='),
	BiliBiliApiSpaceChannel = WW.Tmpl(BiliBiliApiSpace,'channel/video?mid=',undefined,'&cid=',undefined,'&pn=',undefined,'&ps=',O.Size),
	BiliBiliApiSpaceUpload = WW.Tmpl(BiliBiliApiSpace,'arc/search?mid=',undefined,'&ps=',O.Size,'&pn=',undefined),
	BiliBiliApiSearchTypeVideo = 'video',
	BiliBiliApiSearchTypeBgm = 'media_bangumi',
	BiliBiliApiSearchTypeFilm = 'media_ft',
	BiliBiliApiSearch = WW.Tmpl(BiliBiliApiWeb,'search/type?search_type=',undefined,'&keyword=',undefined,'&page=',undefined,'&highlight=1',undefined),
	BiliBiliApiPGC = BiliBiliApi + 'pgc/',
	BiliBiliApiPGCMedia = WW.Tmpl(BiliBiliApiPGC,'view/web/media?media_id=',undefined),
	BiliBiliApiPGCSeason = WW.Tmpl(BiliBiliApiPGC,'view/web/season?season_id=',undefined),
	BiliBiliApiPGCSeasonSection = WW.Tmpl(BiliBiliApiPGC,'web/season/section?season_id=',undefined),
	BiliBiliSearch = 'https://search.bilibili.com/',
	BiliBiliSearchS = 'https://s.search.bilibili.com/',
	BiliBiliSearchSuggestion = WW.Tmpl(BiliBiliSearchS,'main/suggest?main_ver=v1&highlight&term=',undefined),
	BiliBiliSpace = 'https://space.bilibili.com/',
	BiliBiliSpaceAudio = WW.Tmpl(BiliBiliSpace,undefined,'/audio'),
	BiliBiliSpaceDynamic = WW.Tmpl(BiliBiliSpace,undefined,'/dynamic'),
	BiliBiliVC = 'https://vc.bilibili.com/',
	BiliBiliVCVideo = WW.Tmpl(BiliBiliVC,'video/',undefined),
	BiliBiliVCApi = 'https://api.vc.bilibili.com/',
	BiliBiliVCApiDetail = WW.Tmpl(BiliBiliVCApi,'clip/v1/video/detail?video_id=',undefined),
	BiliBiliVCApiOnes = WW.Tmpl(BiliBiliVCApi,'clip/v1/video/ones?poster_uid=',undefined,'&need_playurl=0&page_size=',O.Size,'&next_offset=',undefined),
	BiliBiliVCApiDynamicType = 268435455,
	BiliBiliVCApiDynamicNew = BiliBiliVCApi + 'dynamic_svr/v1/dynamic_svr/dynamic_new?uid=&type_list=' + BiliBiliVCApiDynamicType,
	BiliBiliVCApiDynamicHistory = WW.Tmpl(BiliBiliVCApi,'dynamic_svr/v1/dynamic_svr/dynamic_history?uid=&type=',BiliBiliVCApiDynamicType,'&offset_dynamic_id=',undefined),
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
			Img : V.pic || V.cover,
			Title : V.title || V.new_desc,
			UP : WR.Default(V.author,V.owner && V.owner.name) ||
				V.apiSeasonInfo && V.apiSeasonInfo.title + ' ss' + V.apiSeasonInfo.season_id,
			UPURL : (E = WR.Default(V.mid,V.owner && V.owner.mid)) ? BiliBiliSpace + E :
				V.apiSeasonInfo ? BiliBiliBgmSS(V.apiSeasonInfo.season_id) :
				null,
			Date : 1E3 * WR.Default(V.created,V.pubdate),
			Len : WR.Default(V.length,V.duration),
			Desc : WR.Default(V.description,V.desc),
			More :
			[
				null != V.ctime && 'CTime ' + O.DTS(1E3 * V.ctime),
				V.stein_guide_cid &&
					O.Ah('Stein ' + V.stein_guide_cid + ' (' + V.videos + ')',
						BiliBiliVideo(V.aid) + '#Stein'),
				(E = V.redirect_url) && O.Ah(E = WW.MU(/ep\d+/,V.redirect_url),BiliBiliBgmEP(E = E.slice(2)))
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
			B = O.JOM(/__INITIAL_STATE__=/,B)
			return [
				B.epInfo.aid,
				B.mediaInfo.ssId
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
			R = SolveAV(V)
			R = [R].concat(WR.MapU(function(B,F)
			{
				return {
					Index : B.page,
					ID : V.aid + '#' + B.cid,
					View : 'av' + V.aid + '?p=' + B.page,
					URL : BiliBiliVideo(V.aid + '?p=' + B.page),
					Img : R.Img,
					Title : R.Title + '.' + WR.PadU(F,~-V.pages.length) + (B.part ? '.' + B.part : ''),
					TitleView : B.part,
					UP : R.UP,
					UPURL : R.UPURL,
					Len : B.duration,
					More : 'cid' + B.cid,
					CID : B.cid
				}
			},V.pages))
			return (R[0].EP ? EP2AV(R[0].EP).Tap(function(Q)
			{
				R[0].More.push(O.Ah('ss' + Q[1],BiliBiliBgmSS(Q[1])))
			}) : WX.Just())
				.Map(WR.Const(R))
		})
	},
	SolveAU = function(V)
	{
		return {
			ID : 'au' + V.id,
			URL : BiliBiliAudioURL + V.id,
			Img : V.cover,
			Title : V.title,
			UP : V.uname,
			UPURL : BiliBiliSpace + V.uid,
			Date : 1E3 * V.passtime,
			Len : V.duration,
			More :
			[
				V.author && V.author !== V.uname ? V.author + '\n' : '',
				V.intro && V.intro + '\n',
				O.Ah('Audio@' + V.uname,BiliBiliSpaceAudio(V.uid))
			]
		}
	},
	SolveVC = function(V)
	{
		return {
			ID : ShortVideoPrefix + V.item.id,
			URL : BiliBiliVCVideo(V.item.id),
			Img : V.item.cover.default,
			Title : V.item.description,
			UP : V.user.name,
			UPURL : BiliBiliSpace + V.user.uid,
			Date : V.item.upload_time,
			Len : V.item.video_time,
			More : O.Ah('VC@' + V.user.name,BiliBiliSpaceDynamic(V.user.uid))
		}
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
						O.Api(BiliBiliSearch)
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
									Inp : R.C(F),
									NoRel : O.NoRel
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
			Name : 'Audio',
			Judge : O.Num('Audio|AU'),
			View : function(ID)
			{
				return O.Req(BiliBiliAudioWebInfo(ID)).Map(function(B)
				{
					B = Common(B)
					return {
						Item : [SolveAU(B)]
					}
				})
			}
		},{
			Name : 'AudioMenu',
			Judge : O.Num('AudioMenu|AM'),
			View : function(ID,Page)
			{
				return O.Api(BiliBiliAudioWebMenu(ID,-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.totalSize,
						Item : WR.Map(SolveAU,B.data)
					}
				})
			}
		},{
			Name : 'UserAudio',
			Judge : O.Num('UserAudio|Space(?=\\..*/Audio)'),
			View : function(ID,Page)
			{
				return O.Api(BiliBiliAudioWebUp(ID,-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.totalSize,
						Item : WR.Map(SolveAU,B.data)
					}
				})
			}
		},{
			Name : 'VC',
			Judge : [O.Num('VC'),/\bVC\..*?Video\/(\d+)/i],
			View : function(ID)
			{
				return O.Api(BiliBiliVCApiDetail(ID)).Map(function(B)
				{
					return {
						Item : [SolveVC(Common(B))]
					}
				})
			}
		},{
			Name : 'Ones',
			Judge : O.Num('Ones|Space(?=\\..*/Dynamic)'),
			View : O.More(function(ID)
			{
				return O.Api(BiliBiliVCApiOnes(ID,0))
			},function(I,Page,ID)
			{
				return O.Api(BiliBiliVCApiOnes(ID,I[Page]))
			},function(B)
			{
				B = Common(B)
				return [B.has_more && B.next_offset,
				{
					Item : WR.Map(function(V)
					{
						return SolveVC({user : B.user,item : V})
					},B.items)
				}]
			})
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
			Name : 'BV',
			Judge : /\bBV[\d\w]+\b/i,
			View : O.Less(function(ID)
			{
				return O.Api(BiliBiliApiWebViewBV(ID)).FMap(function(B)
				{
					return AV(Common(B).View.aid)
				})
			})
		},{
			Name : 'Fav',
			Judge : O.Num('Fav|FID'),
			View : function(ID,Page)
			{
				return O.Api(BiliBiliApiFav(ID,-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.info.media_count,
						Size : 20,
						Item : WR.Map(function(V)
						{
							return {
								ID : V.id,
								Img : V.cover,
								Title : V.title,
								UP : V.upper.name,
								UPURL : BiliBiliSpace + V.upper.mid,
								Date : 1E3 * V.pubtime,
								Desc : V.intro
							}
						},B.medias)
					}
				})
			}
		},{
			Name : 'Channel',
			Judge : [/(\d+).*\bChannel\b.*?CID=(\d+)/i,/\bChannel\b\W+(\d+)#(\d+)/i],
			View : function(ID,Page)
			{
				ID = WR.Match(/\d+/g,ID)
				return O.Api(BiliBiliApiSpaceChannel(ID[0],ID[1],-~Page)).Map(function(B)
				{
					B = Common(B).list
					return {
						Len : B.count,
						Item : WR.Map(SolveAV,B.archives)
					}
				})
			}
		},{
			Name : 'User',
			Judge : O.Num('Space|User'),
			View : function(ID,Page)
			{
				return (Page ? WX.Just([]) : O.Api(BiliBiliApiSpaceInfo(ID)).FMap(function(UP)
				{
					UP = Common(UP)
					return O.Api(O.Head(BiliBiliApiSpaceNavNum(ID),'Referer',BiliBili)).Map(function(Nav)
					{
						Nav = Common(Nav)
						return [
						{
							Non : true,
							ID : ID,
							URL : BiliBiliSpace + ID,
							Img : UP.face,
							UP : UP.name,
							UPURL : BiliBiliSpace + ID,
							More :
							[
								UP.sign,
								O.Ah('Audio ' + Nav.audio,BiliBiliSpaceAudio(ID)),
								O.Ah('VC',BiliBiliSpaceDynamic(ID))
							]
						}]
					})
				})).FMap(function(UP)
				{
					return O.Api(BiliBiliApiSpaceUpload(ID,-~Page)).Map(function(V)
					{
						V = Common(V)
						return {
							Len : V.page.count,
							Item : WR.Concat(UP,WR.MapU(function(V,F)
							{
								V = SolveAV(V)
								Page || (V.Index = F)
								return V
							},V.list.vlist))
						}
					})
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
				return O.Req(BiliBiliVCApiDynamicNew)
			},function(I,Page)
			{
				return O.Req(BiliBiliVCApiDynamicHistory(I[Page]))
			},function(B)
			{
				B = Common(B)
				return [B.history_offset || B.has_more && B.next_offset,
				{
					Item : WR.MapW(function(V,C)
					{
						C = WC.JTO(V.card)
						V = V.desc.type
						return 16 === V ? SolveVC(C) :
							8 === V || 512 === V ? SolveAV(C) :
							null
					},B.cards)
				}]
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
			Judge : O.Num('Season|SS|BanGuMi\\b.*?\\bAnime'),
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
							Img : V.cover,
							Title : WR.Trim(V.title + ' ' + V.long_title),
							UP : 'ep' + V.id,
							UPURL : BiliBiliBgmEP(V.id),
							More : 'cid' + V.cid
						}
					},B.episodes))
				}).FMap(function(R)
				{
					return O.Api(BiliBiliApiPGCSeasonSection(ID)).Map(function(B)
					{
						B = Common(B)
						return WR.Concat(R,WR.Unnest(WR.Map(function(V)
						{
							return WR.Map(function(B)
							{
								return {
									ID : B.aid + '#' + B.cid,
									URL : BiliBiliBgmEP(B.id),
									Img : B.cover,
									Title : WR.Trim(V.title + ' | ' + B.title + ' ' + B.long_title),
									UP : 'ep' + B.id,
									UPURL : BiliBiliBgmEP(B.id),
								}
							},V.episodes)
						},B.section)))
					})
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
		IDView : function(Q)
		{
			return /^\D/.test(Q) ? Q : 'av' + Q
		},
		IDURL : BiliBiliVideo
	}
})