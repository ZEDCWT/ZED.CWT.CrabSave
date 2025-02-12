'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX)
{
	var
	PrefixMusic = 'Music',

	TikTok = 'https://www.tiktok.com/',
	TikTokVideo = WW.Tmpl(TikTok,'@@/video/',undefined),
	TikTokUser = WW.Tmpl(TikTok,'@',undefined),
	TikTokMusic = WW.Tmpl(TikTok,'music/-',undefined),
	TikTokAPI = TikTok + 'api/',
	TikTokAPIUserDetail = TikTokAPI + 'user/detail/',
	TikTokAPIPostList = 'post/item_list/',
	TikTokAPIFollowingList = TikTokAPI + 'following/item_list/',
	// TikTokShareItemList = WW.Tmpl(TikTok,'share/item/list?id=',undefined,'&count=',O.Size,'&maxCursor=',undefined,'&minCursor=0&type=4'),
	// TikTokT = 'https://t.tiktok.com/',
	// TikTokAPI = TikTokT + 'api/',
	// TikTokAPIItemDetail = WW.Tmpl(TikTokAPI,'item/detail/?itemId=',undefined),
	// TikTokAPIItemList = WW.Tmpl(TikTokAPI,'item_list/?id=',undefined,'&count=',O.Size,'&maxCursor=',undefined,'&minCursor=&sourceType=8'),
	// TikTokAPIItemListTL = WW.Tmpl(TikTokAPI,'item_list/?count=',O.Size,'&maxCursor=',undefined,'&minCursor=&sourceType=18&pullType=',undefined,'&level=',undefined),
	// // TikTokAPIUserDetail = WW.Tmpl(TikTokAPI,'user/detail/?uniqueId=',undefined),
	// TikTokAPIUserList = WW.Tmpl(TikTokAPI,'user/list/?count=',O.Size,'&maxCursor=',undefined,'&minCursor=',undefined),
	// TikTokAPIMusicDetail = WW.Tmpl(TikTokAPI,'music/detail/?musicId=',undefined,'&language='),

	Common = function(B)
	{
		B || WW.Throw('Signature Failure')
		B = WC.JTO(B)
		B.status_code && O.Bad(B.status_code,B.status_msg)
		return B
	},
	API = function(Q,S)
	{
		/*
			Several endpoints require msToken, which can be re-generated along with any API call
			Apparently a 'correct' msToken should be 140 chars (103 bytes decoded through Base64)
			Though it could be re-generated, it seems that an incorrect token will never be able to exchange a correct one
			Any bad msToken will cause these endpoints to fail silently
			Where UserDetail will response '{\n    statusCode: -1,\n    userInfo: {}\n}'
		*/
		var
		QS = WC.QSS(WW.Merge(
		{
			app_name : WW.Rnd(WW.AZ),
			browser_language : WW.Rnd(WW.AZ),
			browser_name : WW.Rnd(WW.AZ),
			browser_platform : WW.Rnd(WW.AZ),
			browser_version : WW.Rnd(WW.AZ),
			device_id : WR.Times(function(V){return WW.Rnd(V ? 0 : 1,10)},WW.Rnd(8,17)).join(''),
			device_platform : WW.Rnd(WW.AZ),
			os : WW.Rnd(WW.AZ),
			region : WW.Rnd(WW.AZ),
			screen_height : WW.Rnd(WW.AZ),
			screen_width : WW.Rnd(WW.AZ)
		},S)),
		Body = null,
		UA = WW.RUA(),
		Now = WW.Now() / 1000,
		EnvEnvCode = 1,
		/*
			kNoMove 2
			kNoClickTouch 4
			kNoKeyboardEvent 8
			kMoveFast 16
			kKeyboardFast 32
			kFakeOperations 64
		*/
		EnvUBCode = 0,
		EnvCavasFP = WW.Rnd(0x100000000),

		QSMD5MD5 = WC.MD5(WC.MD5(QS)),
		BodyMD5MD5 = WC.MD5(WC.MD5(Body || '')),
		EnvMD5 = WC.MD5(WC.B64S(WC.RC4([EnvEnvCode >> 8,255 & EnvEnvCode,EnvUBCode],UA))),
		Bogus =
		[
			64,
			EnvEnvCode >> 8,
			255 & EnvEnvCode,
			EnvUBCode,
			QSMD5MD5[14], // Critical
			QSMD5MD5[15], // Critical
			BodyMD5MD5[14],
			BodyMD5MD5[15],
			EnvMD5[14], // Critical
			EnvMD5[15], // Critical
			Now >> 24,
			Now >> 16,
			Now >> 8,
			Now >> 0,
			EnvCavasFP >> 24,
			EnvCavasFP >> 16,
			EnvCavasFP >> 8,
			EnvCavasFP >> 0
		];
		Bogus.push(WR.Reduce(WR.Xor,0,Bogus))
		return O.Req(
		{
			URL : Q,
			UA : UA,
			Cookie : false,
			Head :
			{
				// Without `tt-target-idc`, timeline endpoint responses messed up list
				Cookie : 'tt-target-idc=alisg; ' + O.Coke()
			},
			QS : QS + '&X-Bogus=' + WC.B64S(
				WC.Con([[2,255],WC.RC4([255],Bogus)]),
				'Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe')
		}).Map(Common)
	},
	SolveUser = WX.CacheM(function(ID)
	{
		return API(TikTokAPIUserDetail,{uniqueId : ID}).Map(function(B)
		{
			return B.userInfo
		})
	}),
	SolveVideo = function(B)
	{
		return {
			ID : B.id,
			Img :
			[
				B.video.originCover,
				B.video.dynamicCover
			],
			Title : B.desc,
			UP : B.author.nickname,
			UPURL : TikTokUser(B.uniqueId),
			Date : 1E3 * B.createTime,
			Len : B.duration,
			More :
			[
				B.music && O.Ah('\u266B ' + B.music.title,TikTokMusic(B.music.id))
			]
		}
	};
	return {
		ID : 'TikTok',
		Alias : 'TT',
		Judge : /\bTikTok\b/i,
		Min : 'sid_tt tt_webid_v2 msToken',
		Sign : function()
		{
			return O.Req(TikTok).Map(function(B)
			{
				return O.JOM(/"\$user":/,B).uniqueId
			})
		},
		Map : [
		{
			Name : 'Music',
			Judge :
			[
				O.Num('Music'),
				/Music\/[^/]+-(\d+)\b/i
			],
			JudgeVal : O.ValNum,
			View : O.More(function(ID,I)
			{
				return ReqAPI(TikTokAPIMusicDetail(ID)).FMap(function(B)
				{
					I[0] = B.musicInfo
					return ReqAPI(TikTokShareItemList(ID,0),true)
				})
			},function(I,Page,ID)
			{
				return ReqAPI(TikTokShareItemList(ID,I[Page]),true)
			},function(B,I,Page)
			{
				B = B.body
				return [B.hasMore && B.maxCursor,
				{
					Len : (I = I[0]).stats.videoCount,
					Item : WR.Cat
					(
						Page ? [] : [
						{
							ID : 'Music' + I.music.id,
							Img : I.music.coverLarge,
							Title : I.music.title,
							UP : I.music.authorName,
							UPURL : I.author && TikTokUser(I.author.uniqueId)
						}],
						WR.MapU(function(V,F)
						{
							V = SolveVideo(V)
							Page || (V.Index = F)
							return V
						},B.itemListData)
					)
				}]
			})
		},{
			Name : 'Video',
			Judge : [/^\d+$/,O.Num('Video')],
			JudgeVal : O.ValNum,
			View : function(ID)
			{
				return ReqAPI(TikTokAPIItemDetail(ID)).Map(function(B)
				{
					return {
						Item : [SolveVideo(B.itemInfo.itemStruct)]
					}
				})
			}
		},{
			Name : O.NameUP,
			JudgeVal : false,
		},{
			Name : 'User',
			Judge : [/@([.\w]+)/,O.Word('User')],
			JudgeVal : /[.\w]+/,
			View : O.More(function(ID,I)
			{
				return SolveUser(ID).FMap(function(User)
				{
					return API(TikTokAPIPostList,
					{
						userId : I[0] = User.user.id,
						count : O.Size,
						cursor : 0
					})
				})
			},function(I,Page)
			{
				return API(TikTokAPIPostList,
				{
					userId : I[0],
					count : O.Size,
					cursor : I[Page]
				})
			},function(B)
			{
				return [B.hasMore && B.cursor,
				{
					Item : WR.Map(SolveVideo,B.itemList)
				}]
			})
		},{
			Name : 'Timeline',
			Judge : /^$/,
			JudgeVal : false,
			Example :
			[
				'',
				{
					As : 'Sub',
					Val : ''
				}
			],
			View : O.More(function()
			{
				return API(TikTokAPIFollowingList,
				{
					level : 1,
					pullType : 1,
					count : 25,
					cursor : 0
				})
			},function(I,Page)
			{
				return API(TikTokAPIFollowingList,
				{
					level : 3,
					pullType : 2,
					count : 25,
					cursor : I[Page]
				})
			},function(B)
			{
				return [B.hasMore && B.cursor,
				{
					Size : 25,
					Item : WR.Map(SolveVideo,B.itemList)
				}]
			})
		}],
		IDURL : function(Q)
		{
			Q = /^([A-Z]*)(\d+)$/i.exec(Q) || ['','',Q]
			return PrefixMusic === Q[1] ? TikTokMusic(Q[2]) :
				TikTokVideo(Q[2])
		}
	}
})