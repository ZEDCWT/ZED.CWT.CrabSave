'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	Fantia = 'https://fantia.jp/',
	FantiaPost = WW.Tmpl(Fantia,'posts/',undefined),
	FantiaProfile = WW.Tmpl(Fantia,'profiles/',undefined),
	FantiaFanclub = WW.Tmpl(Fantia,'fanclubs/',undefined),
	FantiaFanclubPost = WW.Tmpl(Fantia,'fanclubs/',undefined,'/posts?page=',undefined),
	FantiaMyPage = Fantia + 'mypage/',
	FantiaMyPagePlan = WW.Tmpl(FantiaMyPage,'users/plans?type=',undefined),
	FantiaAPI = Fantia + 'api/v1/',
	FantiaAPIMe = FantiaAPI + 'me/',
	FantiaAPIMeTimeline = WW.Tmpl(FantiaAPIMe,'timelines/posts?page=',undefined,'&per=',O.Size),
	FantiaAPIPost = WW.Tmpl(FantiaAPI,'posts/',undefined),

	Common = function(B)
	{
		var T;
		B = WC.JTO(B)
		T = WR.Key(B)
		return 1 === T.length ?
			'redirect' === T[0] ? // {redirect:'/recaptcha'}
				O.Bad(B) :
				B[T[0]] :
			T.length ? B : WW.Throw('Empty Response')
	},
	CSRFToken,CSRFTokenLast,
	MakeAPI = function(Q)
	{
		return (CSRFToken && CSRFTokenLast && WW.Now() < 6E5 + CSRFTokenLast ?
			WX.Just(CSRFToken) :
			O.ReqAPI(Fantia).Map(function(B)
			{
				CSRFToken = WW.MF(/<[^>]+csrf-token[^>]+content="([^"]+)/,B)
				// CSRFTokenLast = WW.Now()
			}))
			.FMap(function()
			{
				return O.ReqAPI(WW.N.ReqOH(Q,'X-CSRF-Token',CSRFToken))
			})
			.Tap(null,function(E)
			{
				WW.ErrIs(WW.Err.NetBadStatus,E) &&
					403 === E.Arg[0] &&
					(CSRFToken = null)
			})
	},
	SolvePost = function(B)
	{
		/*
		/angularjs/js/app.customers.js
		category
			text
			photo_gallery
			file
			product
			embed
			blog
		publishedState
			invisible
			unlimited
			members_only
		visibleStatus
			visible
			adult_only
			expired
			members_only
			catchable
			uncatchable
		joinStatus
			need_join
			need_upgrade
			need_purchase
			need_extend
			no_backnumber_with_join
			no_backnumber_with_upgrade
			no_backnumber_with_extend
			purchased
			fanclub_owner
			plan_closed
		backnumberStatus
			not_sale_backnumber
			will_creating
			backnumber_exist
		streamingFileExtensions
			MUSIC [/mp3/,/aac/,/m4a/,/wav/]
			VIDEO [/mp4/,/ogg/,/mpe?g/,/mov/]
		*/
		var
		FanClub = B.fanclub,
		R = [
		{
			Non : !B.post_contents || B.post_contents.length,
			ID : B.id,
			Img : WR.Path(['thumb','thumb_webp'],B) || B.thumb_micro,
			Title : B.title,
			UP : FanClub.fanclub_name_with_creator_name,
			UPURL : FantiaFanclub(FanClub.id),
			Date : B.posted_at,
			Desc : B.comment,
			More :
			[
				O.Ah(FanClub.user.name,FantiaProfile(FanClub.user.toranoana_identify_token))
				// /mypage/messages/${Fanclub.user.id}
			]
		}];
		WR.Each(function(V)
		{
			var
			Visible = 'visible' === V.visible_status;
			R.push(
			{
				Non : !Visible,
				ID : B.id + '_' + V.id,
				URL : FantiaPost(B.id),
				Title : V.title,
				UP : FanClub.fanclub_name_with_creator_name,
				UPURL : FantiaFanclub(FanClub.id),
				Img : WR.Path(['post_content_photos_micro',0],V),
				Desc : V.comment,
				More :
				[
					V.plan && 'Plan ' + WW.Quo(V.plan.id) + 'JPY ' + V.plan.price,
					WW.Quo(V.category) +
					[
						V.published_state,
						V.visible_status,
						V.join_status
					].join(' ')
				]
			})
		},B.post_contents)
		return R
	},
	MakePlan = function(H)
	{
		// TODO | Not yet completed without paging samples
		return function()
		{
			return O.Req(FantiaMyPagePlan(H)).Map(function(B)
			{
				var
				ROI = WW.MU(/id="main"[^]+?<footer/,B);
				return {
					Item : WW.MR(function(D,V)
					{
						var
						FanClub = WW.MF(/="\/fanclubs\/(\d+)/,V);
						D.push(
						{
							Non : true,
							ID : FanClub,
							URL : FantiaFanclub(FanClub),
							Title : WC.HED(WW.MF(/strong>([^<]+)/,V)),
							Img : WC.HED(WW.MF(/src="([^"]+)/,V)),
							Date : WW.MF(/"time">([^<]+)/,V)
						})
						return D
					},[],/row-packed">[^]+?support-comment-parent">/g,ROI)
				}
			})
		}
	};

	return {
		ID : 'Fantia',
		Name : '\u30D5\u30A1\u30F3\u30C6\u30A3\u30A2',
		Alias : 'FT',
		Judge : /\bFantia\b/i,
		Min : '_session_id',
		Sign : function()
		{
			return O.Req(FantiaAPIMe).Map(function(B)
			{
				return WR.Path(['current_user','name'],WC.JTO(B))
			})
		},
		Map : [
		{
			Name : 'FanClub',
			Judge : O.Num('FanClubs?'),
			View : function(ID,Page)
			{
				return MakeAPI(FantiaFanclubPost(ID,-~Page)).Map(function(B)
				{
					var
					FanClubEle = WW.MU(/fanclub-name">.*?<\/a/,B),
					FanClub = WC.HED(WW.MF(/>([^<]+)<\/a/,FanClubEle)),
					FanClubURL = FantiaFanclub(WW.MF(/fanclubs\/(\d+)/,FanClubEle));
					return {
						Len : WW.MF(/tab[^<>]+active[^<>]+\/posts[^]+?counter">(\d+)/,B),
						Size : 20,
						Item : WW.MR(function(D,V)
						{
							var
							ID = WW.MF(/href="[^"\d]+(\d+)/,V);
							D.push(
							{
								Non : true,
								ID : ID,
								Img : WW.MF(/src="([^"]+)/,V),
								Title : WC.HED(WW.MF(/post-title">([^<]+)/,V)),
								UP : FanClub,
								UPURL : FanClubURL,
								Date : WW.MF(/"post-date[^>]+>(?:<[^>]+>)?([^<]+)/,V) + '+0900',
								Desc : WC.HED(WW.MF(/post-text">([^<]+)/,V)),
							})
							return D
						},[],/"post-inner">[^]+?<\/a/g,B)
					}
				})
			}
		},{
			Name : 'Post',
			Judge : [/^\d+(?=(?:_\d+)?$)/,O.Num('Posts?')],
			View : function(ID)
			{
				return MakeAPI(FantiaAPIPost(ID)).Map(function(B)
				{
					return {
						Item : SolvePost(Common(B))
					}
				})
			}
		},{
			Name : 'User',
			Judge : O.Word('User|Profiles?'),
			View : function(ID)
			{
				return MakeAPI(FantiaProfile(ID)).Map(function(B)
				{
					var
					ROI = WW.MU(/="user-avatar[^]+list-group-item">/,B),
					FanClub = WW.MF(/="\/fanclubs\/(\d+)/,B);
					return {
						Item : [
						{
							Non : true,
							ID : ID,
							URL : FantiaProfile(ID),
							Img : WC.HED(WW.MF(/src="([^"]+)/,ROI)),
							UP : WC.HED(WW.MF(/"user-name[^<>]+><[^>]+>([^<]+)/,ROI)),
							UPURL : FantiaProfile(ID),
							More :
							[
								FanClub && O.Ah('FanClub',FantiaFanclub(FanClub))
							]
						}]
					}
				})
			}
		},{
			Name : 'Following',
			Judge : O.UP,
			View : MakePlan('free')
		},{
			Name : 'Plan',
			Judge : /\bPl(?:an)?\b/i,
			View : MakePlan('not_free')
		},{
			Name : 'Timeline',
			Judge : O.TL,
			View : O.More(function()
			{
				return O.Req(FantiaAPIMeTimeline(1))
			},function(I,Page)
			{
				return O.Req(FantiaAPIMeTimeline(-~Page))
			},function(B)
			{
				B = Common(B)
				return [B.has_next,
				{
					Item : WR.Unnest(WR.Map(SolvePost,B.posts))
				}]
			})
		}],
		IDURL : function(Q)
		{
			return FantiaPost(WW.IsStr(Q) ? Q.replace(/_\d+$/,'') : Q)
		}
	}
})