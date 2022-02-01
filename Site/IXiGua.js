'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	IXiGua = 'https://www.ixigua.com/',
	IXiGuaHome = WW.Tmpl(IXiGua,'home/',undefined),
	IXiGuaAPIAuthorVideo = WW.Tmpl(IXiGua,'api/videov2/author/video?author_id=',undefined,'&type=video&max_time=',undefined),
	IXiGuaAPIFollow = WW.Tmpl(IXiGua,'api/userv2/follow/list?authorId=',undefined,'&cursor=',undefined),
	// Keep the count <=16 or it will not response with HasMore
	IXiGuaAPIFeedHot = WW.Tmpl(IXiGua,'api/feedv2/feedById?channelId=94349549215&count=16&maxTime=',undefined),
	IXiGuaAPISearch = WW.Tmpl(IXiGua,'api/searchv2/complex/',undefined,'/',undefined,'?debug_model=false'),
	IXiGuaAPISearchSugg = WW.Tmpl(IXiGua,'api/search/associative/',undefined),
	Happy = WR.Reduce(function(D,V)
	{
		D[V] = WW.Top[V]
	},{
		document : {},
		location : {href : '',protocol : ''},
		navigator : {userAgent : ''}
	},[
		'Object',
		'Function',
		'Array',
		'String',
		'Date',
		'RegExp',
		'JSON',
		'parseInt',
	]),
	Sign,SignAt,
	SolveSign = WX.CacheL(function(URL)
	{
		return O.API(URL).Map(function(B,T)
		{
			CrabSave[T = WW.Key()] = Happy
			try
			{
				if (/acrawler/.test(URL))
				{
					Function('window',"'use strict';" + B)(Happy)
					B = Happy.byted_acrawler
				}
				else
					Function('Function','return ' + WW.MF(/(function[^{]+{[^};]+;Function.+?\)}),function\(/,B))
					(function(Q)
					{
						return Function(Q.replace(/=this/,'=CrabSave.' + T))
					})
					(null,B = {})
			}
			catch(_){}
			WR.Del(T,CrabSave)
			SignAt = WW.Now()
			return Sign = B && B.sign
		})
	}),
	ReqSign = function()
	{
		return (Sign && WW.Now() < SignAt + 36E5 ? WX.Just(Sign) : O.API(IXiGua).FMap(function(B)
		{
			Happy.tac = WC.JTOO(WW.MF(/tac='(.+?)'<\/scr/,B).replace(/"/g,'\\"'),{Ext : true})
			return SolveSign
			(
				WW.MF(/="([^"]+acrawler.js)"/,B) ||
				WW.MF(/="([^"]+vendors_index[^"]+js)"/,B)
			)
		}))
	},
	ReqAPI = function(Q,ForceAPI)
	{
		return ReqSign().FMap(function(S)
		{
			return (!ForceAPI && O.Coke() ? O.Req : O.API)(
			{
				URL : Q,
				QS :
				{
					_signature : S ? S({url : Q}) : ''
				},
				Head :
				{
					Referer : IXiGua
				}
			})
		})
	},
	ReqCokeAC = {},
	Req = function(Q)
	{
		var U = function(H)
		{
			return O.Req(
			{
				URL : Q,
				Cookie : false,
				Head :
				{
					Cookie : WR.Where(WR.Id,[O.Coke(),WC.CokeS(ReqCokeAC)]).join('; ')
				}
			},H)
		};
		return ReqSign().FMap(function(S)
		{
			return U(true).FMap(function(B)
			{
				WR.Each(function(V)
				{
					if (WR.StartW('__ac_nonce=',V))
					{
						ReqCokeAC.__ac_signature = S('',ReqCokeAC.__ac_nonce = WC.CokeP(V).__ac_nonce)
						B = 0
					}
				},B[2]['set-cookie'])
				return B ?
					WX.Just(B[1]) :
					U()
			})
		})
	},
	Common = function(B)
	{
		B = WC.JTO(B)
		0 === B.code || 200 === B.code ||
			O.Bad(WR.Default(B.code,B.data.code),B.data.message)
		return B.data
	},
	SolveSelfID = O.CokeC(function()
	{
		return O.Req(IXiGua).Map(function(B)
		{
			return O.JOM(/_globalConfig=/,B).identity.id
		})
	});
	return {
		ID : 'IXiGua',
		Name : '\u897F\u74DC\u8996\u983B',
		Alias : 'XG XiGua',
		Judge : /\bIXiGua\b/i,
		Min : 'sid_tt',
		Sign : function()
		{
			return O.Req(IXiGuaHome('')).Map(function(B)
			{
				return WR.Path(['userDetail','name'],O.JOM(/_globalConfig=/,B))
			})
		},
		Map : [
		{
			Name : 'Search',
			Judge : O.Find,
			View : O.More(function(ID)
			{
				return ReqAPI(IXiGuaAPISearch(WC.UE(ID),0),true)
			},function(I,Page,ID)
			{
				return ReqAPI(IXiGuaAPISearch(WC.UE(ID),I[Page]),true)
			},function(B)
			{
				B = Common(B)
				return [B.has_more && B.offset + B.count,
				{
					Item : WR.MapW(function(V,B)
					{
						B = V.data
						return 'video' === V.type ?
						{
							ID : B.group_id,
							Img : B.image,
							Title : B.title,
							UP : B.anchor,
							UPURL : IXiGuaHome(B.anchor_id),
							Date : 1E3 * B.publish_time,
							Len : B.video_time
						} : null
					},B.data)
				}]
			}),
			Hint : function(Q)
			{
				return ReqAPI(IXiGuaAPISearchSugg(WC.UE(Q)),true).Map(function(B)
				{
					return {
						Item : WR.Pluck('keyword',Common(B).data)
					}
				})
			}
		},{
			Name : 'User',
			Judge : O.Num('Home|User'),
			View : O.More(function(ID)
			{
				return ReqAPI(IXiGuaAPIAuthorVideo(ID,0))
			},function(I,Page,ID)
			{
				return ReqAPI(IXiGuaAPIAuthorVideo(ID,I[Page]))
			},function(B)
			{
				B = Common(B)
				return [B.has_more && B.data.length && WR.Last(B.data).publish_time,
				{
					Item : WR.Map(function(V)
					{
						return {
							ID : V.group_id,
							Img : V.middle_image.url,
							Title : V.title,
							UP : V.user_info.name,
							UPURL : IXiGuaHome(V.user_info.user_id),
							Date : 1E3 * V.publish_time,
							Len : V.video_duration,
							More : V.abstract
						}
					},B.data)
				}]
			})
		},{
			Name : 'Video',
			Judge :
			[
				/^\d+$/,
				O.Num('Video'),
				/\bIXiGua\b[^/]+\/I?(\d+)/i
			],
			View : function(ID)
			{
				return Req(IXiGua + ID).Map(function(B)
				{
					B = B.replace(/([^\\]":)undefined/g,'$1null')
					return {
						Item : [
						{
							ID : ID,
							Img : WW.MF(/og:image[^>]+content="([^"]+)/,B),
							Title : (B = O.JOM(/SSR_HYDRATED_DATA=/,B).anyVideo.gidInformation.packerData.video).title,
							UP : B.user_info.name,
							UPURL : IXiGuaHome(B.user_info.user_id),
							Date : 1E3 * B.video_publish_time,
							Len : B.video_duration
						}]
					}
				})
			}
		},{
			Name : 'Following',
			Judge : O.UP,
			View : O.More(function(_,I)
			{
				return SolveSelfID().FMap(function(ID)
				{
					return ReqAPI(IXiGuaAPIFollow(I[0] = ID,0))
				})
			},function(I,Page)
			{
				return ReqAPI(IXiGuaAPIFollow(I[0],I[Page]))
			},function(B)
			{
				B = Common(B)
				return [B.has_more && B.next_offset,
				{
					Item : WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.user_id,
							URL : IXiGuaHome,
							Img : V.avatar_url,
							UP : V.name,
							UPURL : IXiGuaHome(V.user_id),
							More :
							[
								V.description,
								V.followers_count_str + ' (' + V.followers_count + ')',
								V.verified_content
							]
						}
					},B.data)
				}]
			})
		},{
			Name : 'Feed',
			Judge : O.TL,
			View : O.More(function()
			{
				return ReqAPI(IXiGuaAPIFeedHot(0))
			},function(I,Page)
			{
				return ReqAPI(IXiGuaAPIFeedHot(I[Page]))
			},function(B)
			{
				B = Common(B).channelFeed
				return [B.HasMore && B.Data.length && WR.Last(B.Data).maxTime,
				{
					Item : WR.Map(function(V)
					{
						V = V.data
						return {
							ID : V.group_id,
							Img : V.image_uri.replace(/^(?!\w+:)/,'https://p1-xg.byteimg.com/'),
							Title : V.title,
							UP : V.user_info.name,
							UPURL : IXiGuaHome(V.user_info.user_id),
							Date : 1E3 * V.publish_time,
							Len : V.duration,
							More : V.tag
						}
					},B.Data)
				}]
			})
		}],
		IDURL : WR.Add(IXiGua)
	}
})