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
		navigator : {userAgent : ''}
	},[
		'Object',
		'Function',
		'Array',
		'String',
		'Date',
		'RegExp',
		'JSON'
	]),
	SolveSign = WX.CacheL(function(URL)
	{
		return O.Api(URL).Map(function(B,T)
		{
			CrabSave[T = WW.Key()] = Happy
			try
			{
				Function('Function','return ' + WW.MF(/(function[^{]+{[^};]+;Function.+?\)}),function\(/,B))
					(function(Q)
					{
						return Function(Q.replace(/=this/,'=CrabSave.' + T))
					})
					(null,B = {})
			}
			finally
			{
				WR.Del(T,CrabSave)
			}
			return B.sign || WR.Const('')
		})
	}),
	ReqAPI = function(Q)
	{
		return O.Api(IXiGua).FMap(function(B)
		{
			Happy.tac = WC.JTO('"' + WW.MF(/tac='(.+?)'<\/scr/,B).replace(/"/g,'\\"') + '"')
			return SolveSign(WW.MF(/="([^"]+vendors_index[^"]+js)"/,B))
		}).FMap(function(S)
		{
			return (O.Coke() ? O.Req : O.Api)(
			{
				URL : Q + (/\?/.test(Q) ? '&' : '?') + '_signature=' + S(
				{
					url : Q.slice(~-IXiGua.length).replace(/\?.*/,'')
				}),
				Head :
				{
					Referer : IXiGua
				}
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
				return ReqAPI(IXiGuaAPISearch(WC.UE(ID),0))
			},function(I,Page,ID)
			{
				return ReqAPI(IXiGuaAPISearch(WC.UE(ID),I[Page]))
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
				return ReqAPI(IXiGuaAPISearchSugg(WC.UE(Q))).Map(function(B)
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
				/\bIXiGua\b[^/]+\/(\d+)/i
			],
			View : function(ID)
			{
				return ((O.Coke() ? O.Req : O.Api))(IXiGua + ID).Map(function(B)
				{
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
							URL : IXiGuaHome(V.user_id),
							Img : V.avatar_url,
							UP : V.name,
							UPURL : IXiGuaHome(V.user_id),
							More :
							[
								V.description,
								V.followers_count_str + ' (' + V.followers_count + ')',
								V.verified_content
							].join('\n')
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