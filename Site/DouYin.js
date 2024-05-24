'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	PrefixMusic = 'Music',

	DouYin = 'https://www.douyin.com/',
	DouYinVideo = WW.Tmpl(DouYin,'video/',undefined),
	DouYinUser = WW.Tmpl(DouYin,'user/',undefined),
	DouYinMusic = WW.Tmpl(DouYin,'music/',undefined),
	DouYinCollection = WW.Tmpl(DouYin,'collection/',undefined),
	// DouYinUserSelf = DouYinUser('self'),
	DouYinAPI = DouYin + 'aweme/v1/',
	DouYinAPIWeb = DouYinAPI + 'web/',
	DouYinAPIWebAwemeDetail = DouYinAPIWeb + 'aweme/detail',
	DouYinAPIWebAwemePost = DouYinAPIWeb + 'aweme/post',
	DouYinAPIWebMusicDetail = DouYinAPIWeb + 'music/detail',
	DouYinAPIWebMusicAweme = DouYinAPIWeb + 'music/aweme',
	DouYinAPIWebUserFollowingList = DouYinAPIWeb + 'user/following/list',
	DouYinAPIWebUserProfileSelf = DouYinAPIWeb + 'user/profile/self',
	DouYinAPIWebFollowFeed = DouYinAPIWeb + 'follow/feed',
	DouYinAPIWebSearch = DouYinAPIWeb + 'search/item',
	DouYinAPIWebSearchSug = DouYinAPIWeb + 'search/sug',

	Common = function(B)
	{
		B || WW.Throw('Signature Failure')
		B = WC.JTO(B)
		B.status_code && O.Bad(B.status_code,B.status_msg)
		return B
	},
	API = function(Q,S,B)
	{
		// lf-c-flwb.bytetos.com/obj/rc-client-security/c-webmssdk/1.0.0.20/webmssdk.es5.js
		var
		QS = WC.QSS(WW.Merge(
		{
			aid : 6383,
			device_platform : 'webapp',
			os_version : 12 // download_suffix_logo_addr
		},S)),
		Body = B ? WC.OTJ(B) : null,
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
			Head :
			{
				// `user/profile/self` checks this header
				'Accept-Language' : '*',
				Referer : DouYin
			},
			QS : QS + '&X-Bogus=' + WC.B64S(
				WC.Con([[2,255],WC.RC4([255],Bogus)]),
				'Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe')
		}).Map(Common)
	},

	SolveUserSelf = O.CokeC(function()
	{
		return API(DouYinAPIWebUserProfileSelf).Map(function(B)
		{
			return B.user
		})
	}),
	SolveAweme = function(B)
	{
		return {
			ID : B.aweme_id,
			Img : B.images ? WR.Map(function(V)
			{
				return V.url_list[0]
			},B.images) : WR.MapW(function(V)
			{
				return V && V.url_list[0]
			},[
				B.video.origin_cover,
				B.video.dynamic_cover
			]),
			Title : B.preview_title,
			UP : B.author.nickname,
			UPURL : DouYinUser(B.author.sec_uid),
			Date : 1E3 * B.create_time,
			Len : B.video && B.video.duration && WW.StrMS(B.video.duration),
			More :
			[
				B.preview_title !== B.desc && B.desc,
				B.music &&
				[
					O.Ah('\u266B ' + B.music.title,DouYinMusic(B.music.id_str)),
					B.music.sec_uid !== B.author.sec_uid &&
						O.Ah('@' + B.music.author,DouYinUser(B.music.sec_uid))
				]
			]
		}
	},
	SolveMusic = function(B)
	{
		return {
			ID : PrefixMusic + B.id_str,
			Img : B.cover_hd.url_list[0],
			Title : B.title,
			UP : B.author,
			UPURL : DouYinUser(B.sec_uid),
			Len : B.duration,
		}
	};

	return {
		ID : 'DouYin',
		Name : '\u6296\u97F3',
		Alias : 'DY',
		Judge : /\bDouYin\b/i,
		Min : '__ac_nonce __ac_signature sessionid_ss',
		Sign : function()
		{
			return SolveUserSelf().Map(function(User)
			{
				return User.nickname
			})
		},
		Map : [
		{
			Name : O.NameFind,
			Example :
			[
				'メイドインアビス'
			],
			View : function(ID,Page)
			{
				return API(DouYinAPIWebSearch,
				{
					keyword : ID,
					offset : Page * O.Size,
					// This endpoint does not perfectly follow the count param...
					count : O.Size
				}).Map(function(B)
				{
					var T;
					return {
						Max : 1000000,
						Item : WR.Map(function(V)
						{
							switch (V.type)
							{
								case 1 : return SolveAweme(V.aweme_info)
								case 16 : // Mix
									T = SolveAweme(V.aweme_mix_info.mix_items[0])
									T.More.push(O.Ah(V.aweme_mix_info.mix_info.desc,DouYinCollection(V.aweme_mix_info.mix_info.mix_id)))
									return T
								case 76 : // BaiKe
									T = WC.JTO(V.common_aladdin.display)
									return {
										Non : true,
										ID : V.provider_doc_id_str,
										URL : T.pc_site_url,
										Img : T.head_image,
										Title : T.title,
										More :
										[
											T.content_from,
											T.subtitle,
											T.abstract
										]
									}
								case 77 : // TouTiao Article
									T = V.card_info
									return {
										Non : true,
										ID : V.provider_doc_id_str,
										URL : T.article_url,
										Img : T.img,
										Title : T.title,
										UP : T.author,
										Date : 1E3 * T.create_time,
										More :
										[
											T.content_from,
											T.abstract
										]
									}
							}
							return {
								Non : true,
								ID : V.type,
								Title : 'Unknown Type #' + V.type
							}
						},B.data)
					}
				})
			},
			Hint : function(ID)
			{
				return API(DouYinAPIWebSearchSug,{keyword : ID}).Map(function(B)
				{
					return {
						Item : WR.Map(function(V)
						{
							var
							Last = 0,
							Split = [],
							F = 0;
							for (;F < V.pos.length;++F)
							{
								Last < V.pos[F].begin &&
									Split.push(V.content.slice(Last,V.pos[F].begin))
								Split.push(O.High(V.content.slice(V.pos[F].begin,Last = -~V.pos[F].end)))
							}
							Last < V.content.length &&
								Split.push(V.content.slice(Last))
							return [
								V.content,
								Split
							]
						},B.sug_list)
					}
				})
			}
		},{
			Name : 'Video',
			Judge : [/^\d+$/,O.Num('Note|Video')],
			JudgeVal : O.ValNum,
			Example :
			[
				'7205900736272534784',
				{
					As : 'Sub',
					Val : '7205900736272534784',
					ID : '7205900736272534784'
				},
				{
					As : 'Inp',
					Val : DouYinVideo('7205900736272534784'),
					ID : '7205900736272534784'
				}
			],
			View : function(ID)
			{
				return API(DouYinAPIWebAwemeDetail,{aweme_id : ID}).Map(function(B)
				{
					return {
						Item : [SolveAweme(B.aweme_detail)]
					}
				})
			}
		},{
			Name : 'Music',
			Judge : O.Num('Music'),
			JudgeVal : O.ValNum,
			Example :
			[
				'7205900995417770809',
				{
					As : 'Inp',
					Val : DouYinMusic('7205900995417770809'),
					ID : '7205900995417770809'
				}
			],
			View : function(ID)
			{
				return API(DouYinAPIWebMusicDetail,{music_id : ID}).FMap(function(Music)
				{
					return API(DouYinAPIWebMusicAweme,{music_id : ID}).Map(function(Aweme)
					{
						return {
							Item : WR.Pre(SolveMusic(Music.music_info),
								WR.Map(SolveAweme,Aweme.aweme_list))
						}
					})
				})
			}
		},{
			Name : 'User',
			Judge : O.Word('User'),
			JudgeVal : /[^\s/]+/,
			Example :
			[
				'MS4wLjABAAAA3y0gs9xhygmvZhVEHWt5Y4aLHi9KooKSNxVQ2pslu10',
				{
					As : 'Inp',
					Val : DouYinUser('MS4wLjABAAAA3y0gs9xhygmvZhVEHWt5Y4aLHi9KooKSNxVQ2pslu10'),
					ID : 'MS4wLjABAAAA3y0gs9xhygmvZhVEHWt5Y4aLHi9KooKSNxVQ2pslu10'
				}
			],
			View : O.More(function(ID)
			{
				return API(DouYinAPIWebAwemePost,
				{
					count : O.Size,
					publish_video_strategy_type : 2,
					show_live_replay_strategy : 1,
					max_cursor : 0,
					sec_user_id : ID
				})
			},function(I,Page,ID)
			{
				return API(DouYinAPIWebAwemePost,
				{
					count : O.Size,
					publish_video_strategy_type : 2,
					show_live_replay_strategy : 1,
					max_cursor : I[Page],
					sec_user_id : ID
				})
			},function(B)
			{
				return [B.has_more && B.max_cursor,
				{
					Item : WR.Map(SolveAweme,B.aweme_list)
				}]
			})
		},{
			Name : O.NameUP,
			JudgeVal : false,
			Example :
			[
				''
			],
			View : O.More(function(_,I)
			{
				return SolveUserSelf().FMap(function(User)
				{
					return API(DouYinAPIWebUserFollowingList,
					{
						user_id : I[0] = User.uid,
						max_time : 0,
						count : O.Size
					})
				})
			},function(I,Page)
			{
				return API(DouYinAPIWebUserFollowingList,
				{
					user_id : I[0],
					max_time : I[Page],
					count : O.Size
				})
			},function(B)
			{
				return [B.has_more && B.max_time,
				{
					Len : B.total,
					Item : WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.uid,
							URL : DouYinUser(V.sec_uid),
							Img : V.avatar_larger.url_list[0],
							UP : V.nickname,
							UPURL : DouYinUser(V.sec_uid),
							Date : 1E3 * V.create_time,
							More :
							[
								V.enterprise_verify_reason,
								WR.Path(['following_list_secondary_information_struct','secondary_information_text'],V),
								'Aweme ' + V.aweme_count,
								V.signature
							]
						}
					},B.followings)
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
				return API(DouYinAPIWebFollowFeed,
				{
					count : O.Size,
					cursor : 0
				})
			},function(I,Page)
			{
				return API(DouYinAPIWebFollowFeed,
				{
					count : O.Size,
					cursor : I[Page]
				})
			},function(B)
			{
				return [B.has_more && B.cursor,
				{
					Item : WR.Map(function(V)
					{
						switch (V.feed_type)
						{
							case 1 : return SolveAweme(V.aweme)
						}
						return {
							Non : true,
							ID : V.feed_type,
							Title : 'Unknown Type #' + V.feed_type
						}
					},B.data)
				}]
			})
		}],
		IDURL : function(Q)
		{
			Q = /^([A-Z]*)(\d+)$/i.exec(Q) || ['','',Q]
			return PrefixMusic === Q[1] ? DouYinMusic(Q[2]) :
				DouYinVideo(Q[2])
		}
	}
})