'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	Instagram = 'https://www.instagram.com/',
	InstagramExplore = Instagram + 'explore',
	InstagramExploreTag = WW.Tmpl(InstagramExplore,'/tags/',undefined),
	InstagramPost = WW.Tmpl(Instagram,'p/',undefined),
	InstagramProfile = WW.Tmpl(Instagram,undefined,'/?__a=1'),
	InstagramQueryTmpl = WW.Tmpl(Instagram,'graphql/query/?query_hash=',undefined,'&variables=',undefined),
	InstagramQuery = function(Q,S)
	{
		return (O.Coke() ? O.Req : O.API)(InstagramQueryTmpl(Q,WC.UE(WC.OTJ(S)))).Map(function(B)
		{
			B = WC.JTO(B)
			'ok' === B.status || O.Bad(B.message)
			return B.data
		})
	},
	InstagramHashPost = '3b38775b9f92c2c0b13e0303ca55d34e',
	InstagramHashUserMedia = 'e769aa130647d2354c40ea6a439bfc08',
	InstagramHashTimeline = 'be74df6f00b60e676929508979bee98c',
	InstagramHashFollowing = 'd04b0a864b4b54837c0d870b0e77e076',
	InstagramHashTag = '90cba7a4c91000cf16207e4f3bee2fa2',
	InstagramSearchTop = WW.Tmpl(Instagram,'web/search/topsearch/?query=',undefined),
	SolveUserID = WX.CacheM(function(ID)
	{
		return O.Req(InstagramProfile(ID)).Map(function(B)
		{
			return WC.JTO(B).graphql.user.id
		})
	}),
	SolvePost = function(V)
	{
		return 'shortcode' in V &&
		{
			Non : !V.is_video &&
				WR.None(WR.Path(['node','is_video']),WR.Path(['edge_sidecar_to_children','edges'],V) || []),
			ID : V.shortcode,
			Title : (V.title || WR.Path(['edge_media_to_caption','edges',0,'node','text'],V) || '').slice(0,216),
			Img : V.display_url,
			UP : V.owner && (V.owner.full_name || V.owner.username),
			UPURL : V.owner && Instagram + V.owner.username,
			Date : 1E3 * V.taken_at_timestamp,
			Len : V.video_duration && WW.StrMS(1E3 * V.video_duration),
			More :
			[
				V.edge_sidecar_to_children && 'Sidecar [' + V.edge_sidecar_to_children.edges.length + ']',
				WR.Path(['location','name'],V)
			]
		}
	},
	SolveMore = function(H,V)
	{
		return [V.page_info.has_next_page && V.page_info.end_cursor,
		{
			Len : V.count,
			Item : WR.Where(WR.Id,WR.Map(function(B){return H(B.node)},V.edges))
		}]
	},
	SolveSelfID = O.CokeC(function()
	{
		return O.Req(InstagramExplore).Map(function(B)
		{
			return WW.MF(/"id":"(\d+)/,B)
		})
	});
	return {
		ID : 'Instagram',
		Alias : 'Ins Inst Insta',
		Judge : /\bInstagram\b/i,
		Min : 'sessionid',
		Sign : function()
		{
			return O.Req(InstagramExplore).Map(function(B)
			{
				B = WW.MF(/full_name":(".+?"),"/,B)
				return B && WC.JTO(B)
			})
		},
		Map : [
		{
			Name : 'Search',
			Judge : O.Find,
			View : function(ID)
			{
				return O.API(InstagramSearchTop(WC.UE(ID))).Map(function(B)
				{
					B = WC.JTO(B)
					'ok' === B.status || O.Bad(B.message)
					return {
						Item : WR.Map(function(V)
						{
							return V.user ?
							{
								Non : true,
								ID : V.user.username,
								URL : Instagram + V.user.username,
								Img : V.user.profile_pic_url,
								Title : V.user.full_name,
								Date : 1E3 * V.user.latest_reel_media
							} : {
								Non : true,
								ID : '#' + V.hashtag.name,
								URL : InstagramExploreTag(V.hashtag.name),
								Img : V.hashtag.profile_pic_url,
								More : '#' + V.hashtag.media_count
							}
						},WR.Concat(B.users,B.hashtags).sort(function(Q,S)
						{
							return Q.position - S.position
						}))
					}
				})
			},
			Hint : function(Q)
			{
				return O.API(InstagramSearchTop(WC.UE(Q))).Map(function(B)
				{
					B = WC.JTO(B)
					'ok' === B.status || O.Bad(B.message)
					return {
						Item : WR.Map(function(V)
						{
							return V.user ?
								[Instagram + V.user.username,
									V.user.full_name + ' @' + V.user.username] :
								[InstagramExploreTag(V.hashtag.name),
									'#' + V.hashtag.name + ' (' + V.hashtag.media_count + ')']
						},WR.Concat(B.users,B.hashtags).sort(function(Q,S)
						{
							return Q.position - S.position
						})),
						Jump : true
					}
				})
			}
		},{
			Name : 'Timeline',
			Judge : O.TL,
			View : O.More(function()
			{
				return InstagramQuery(InstagramHashTimeline,{fetch_media_item_count : O.Size})
			},function(I,Page)
			{
				return InstagramQuery(InstagramHashTimeline,{fetch_media_item_count : O.Size,fetch_media_item_cursor : I[Page]})
			},function(B)
			{
				return SolveMore(SolvePost,B.user.edge_web_feed_timeline)
			})
		},{
			Name : 'Following',
			Judge : O.UP,
			View : O.More(function(_,I)
			{
				return SolveSelfID().FMap(function(ID)
				{
					I[0] = ID
					return InstagramQuery(InstagramHashFollowing,{id : ID,first : O.Size})
				})
			},function(I,Page)
			{
				return InstagramQuery(InstagramHashFollowing,{id : I[0],first : O.Size,after : I[Page]})
			},function(B)
			{
				return SolveMore(function(V)
				{
					return {
						Non : true,
						ID : V.username,
						URL : Instagram + V.username,
						Img : V.profile_pic_url,
						UP : V.full_name,
						UPURL : Instagram + V.username
					}
				},B.user.edge_follow)
			})
		},{
			Name : 'User',
			Judge : [/com\/(?!(?:P|Explore)\/)([\w-]+)/i,O.Word('User')],
			View : O.More(function(ID,I)
			{
				return SolveUserID(ID).FMap(function(ID)
				{
					I[0] = ID
					return InstagramQuery(InstagramHashUserMedia,{id : ID,first : O.Size})
				})
			},function(I,Page)
			{
				return InstagramQuery(InstagramHashUserMedia,{id : I[0],first : O.Size,after : I[Page]})
			},function(B)
			{
				return SolveMore(SolvePost,B.user.edge_owner_to_timeline_media)
			})
		},{
			Name : 'Tag',
			Judge : [/Explore\/Tags\/([^?/]+)/i,O.Word('Tag')],
			View : O.More(function(ID,I)
			{
				I[0] = /(%[\dA-F]{2}){3}/i.test(ID) ? WC.UD(ID) : ID
				return InstagramQuery(InstagramHashTag,{tag_name : I[0],first : O.Size})
			},function(I,Page)
			{
				return InstagramQuery(InstagramHashTag,{tag_name : I[0],first : O.Size,after : I[Page]})
			},function(B)
			{
				return SolveMore(SolvePost,B.hashtag.edge_hashtag_to_media)
			})
		},{
			Name : 'Post',
			Judge : [/^[\w-]+$/,/\/P\/([\w-]+)/i,O.Word('Post')],
			View : function(ID)
			{
				return InstagramQuery(InstagramHashPost,{shortcode : ID}).Map(function(B,R)
				{
					B = B.shortcode_media
					R = [SolvePost(B)]
					B.edge_sidecar_to_children && WR.Each(function(V)
					{
						R.push(SolvePost(V.node))
					},B.edge_sidecar_to_children.edges)
					return {
						Item : R
					}
				})
			}
		}],
		IDURL : InstagramPost
	}
})