'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	TikTok = 'https://www.tiktok.com/',
	TikTokVideo = WW.Tmpl(TikTok,'@@/video/',undefined),
	TikTokUser = WW.Tmpl(TikTok,'@',undefined),
	TikTokMusic = WW.Tmpl(TikTok,'music/-',undefined),
	TikTokShareItemList = WW.Tmpl(TikTok,'share/item/list?id=',undefined,'&count=',O.Size,'&maxCursor=',undefined,'&minCursor=0&type=4'),
	TikTokT = 'https://t.tiktok.com/',
	TikTokAPI = TikTokT + 'api/',
	TikTokAPIItemDetail = WW.Tmpl(TikTokAPI,'item/detail/?itemId=',undefined),
	TikTokAPIItemList = WW.Tmpl(TikTokAPI,'item_list/?id=',undefined,'&count=',O.Size,'&maxCursor=',undefined,'&minCursor=&sourceType=8'),
	TikTokAPIItemListTL = WW.Tmpl(TikTokAPI,'item_list/?count=',O.Size,'&maxCursor=',undefined,'&minCursor=&sourceType=18&pullType=',undefined,'&level=',undefined),
	// TikTokAPIUserDetail = WW.Tmpl(TikTokAPI,'user/detail/?uniqueId=',undefined),
	TikTokAPIUserList = WW.Tmpl(TikTokAPI,'user/list/?count=',O.Size,'&maxCursor=',undefined,'&minCursor=',undefined),
	TikTokAPIMusicDetail = WW.Tmpl(TikTokAPI,'music/detail/?musicId=',undefined,'&language='),
	TikTokAcrawler = 'https://sf-tb-sg.ibytedtos.com/obj/rc-web-sdk-sg/acrawler.js',
	HappyToString = function()
	{
		return '[object ' + (this && this._ || WW.Tag(this)) + ']'
	},
	Happy = WR.Reduce(function(D,V)
	{
		D[V] = WW.Top[V]
	},{
		_ : 'Window',
		toString : HappyToString,
		Object : WW.Merge(false,true,function()
		{
			return Object.defineProperty({},'directSign',
			{
				set : WW.O,
				get : WR.F
			})
		},{
			defineProperty : WW.O,
		}),
		document :
		{
			_ : 'Document',
			toString : HappyToString,
			createElement : WR.Const({toDataURL : WW.Key})
		},
		location : {href : '',protocol : ''},
		navigator :
		{
			_ : 'Navigator',
			toString : HappyToString,
			userAgent : '',
			plugins : [],
			platform : ''
		},
		history :
		{
			_ : 'History',
			toString : HappyToString,
		},
		Image : WW.O,
		console : {log : WW.O},
		PluginArray : Array
	},[
		'Array',
		'String',
		'Date',
		'RegExp',
		'JSON',
		'parseInt',
	]),
	Sign,SignAt,
	SolveSign = function()
	{
		return O.Api(TikTokAcrawler).Map(function(B)
		{
			var
			K = ['window'],V = [Happy];
			try
			{
				B = B.replace(/\beval\b/g,'window.eval')
				WW.MR(function(_,T)
				{
					/^(eval)$/.test(T = T[1]) ||
						WR.Include(T,K) ||
						K.push(T) +
						V.push(Happy[T])
				},null,/typeof (\w+)/g,B)
				WW.Ap(Function('' + K,"'use strict';" + B),Happy,V)
				B = Happy.byted_acrawler
			}
			catch(_){}
			SignAt = WW.Now()
			return Sign = B && B.sign
		})
	},
	ReqAPI = function(Q,ForceReq)
	{
		return (Sign && WW.Now() < 36E5 + SignAt ? WX.Just(Sign) : SolveSign()).FMap(function(S)
		{
			return (ForceReq || O.Coke() ? O.Req : O.Api)(
			{
				UA : Happy.navigator.userAgent = WW.RUA(),
				URL : Q,
				QS :
				{
					_signature : S ? S({url : Q}) : ''
				},
				Head :
				{
					Referer : TikTok
				}
			})
		}).Map(function(B)
		{
			B = WC.JTO(B)
			B.statusCode && O.Bad(B.statusCode,B.statusMsg)
			return B
		})
	},
	SolveUserID = WX.CacheM(function(ID)
	{
		return O.Api(TikTokUser(ID)).Map(function(B)
		{
			return WW.MF(/userInfo":{"user":{"id":"(\d+)"/,B) || WW.Throw('No such user `' + ID + '`')
		})
	}),
	SolveVideo = function(V)
	{
		var
		Item = V.itemInfos,
		Author = V.authorInfos,
		Music = V.musicInfos || V.music;
		return {
			ID : (Item || V).id,
			Img : Item ? Item.coversOrigin[0] : V.video.originCover,
			Title : Item ? Item.text : V.desc,
			UP : Author ? Author.nickName : V.author.nickname,
			UPURL : TikTokUser((Author || V.author).uniqueId),
			Date : 1E3 * (Item || V).createTime,
			Len : (Item ? Item.video.videoMeta : V.video).duration,
			More : MakeMusic
			(
				Music.id || Music.musicId,
				Music.title || Music.musicName,
				Music.authorName
			)
		}
	},
	MakeMusic = function(ID,Name,Author)
	{
		return O.Ah('\u266B ' + Name + '@' + Author,TikTokMusic(ID))
	};
	return {
		ID : 'TikTok',
		Alias : 'TT',
		Judge : /\bTikTok\b/i,
		Min : 'sid_tt tt_webid_v2',
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
					Item : WR.Concat
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
			Name : 'Following',
			Judge : O.UP,
			View : O.More(function()
			{
				return ReqAPI(TikTokAPIUserList(0,0),true)
			},function(I,Page)
			{
				return ReqAPI(TikTokAPIUserList(I[Page],I[Page]),true)
			},function(B)
			{
				return [B.userList && B.maxCursor,
				{
					Item : WR.Map(function(V)
					{
						return {
							Non : true,
							ID : V.user.uniqueId,
							URL : TikTokUser(V.user.uniqueId),
							Img : V.user.avatarLarger,
							UP : V.user.nickname,
							UPURL : TikTokUser(V.user.uniqueId),
							More :
							[
								V.user.signature,
								'ID ' + V.user.id,
								'Video ' + V.stats.videoCount
							].join('\n')
						}
					},B.userList)
				}]
			})
		},{
			Name : 'User',
			Judge : [/@([^/?]+)/,O.Word('User')],
			View : O.More(function(ID,I)
			{
				return SolveUserID(ID).FMap(function(B)
				{
					return ReqAPI(TikTokAPIItemList(I[0] = B,0))
				})
			},function(I,Page)
			{
				return ReqAPI(TikTokAPIItemList(I[0],I[Page]))
			},function(B)
			{
				return [B.hasMore && B.maxCursor,
				{
					Item : WR.Map(SolveVideo,B.items)
				}]
			})
		},{
			Name : 'Home',
			Judge : O.TL,
			View : O.More(function()
			{
				return ReqAPI(TikTokAPIItemListTL(0,1,1),true)
			},function(I,Page)
			{
				return ReqAPI(TikTokAPIItemListTL(I[Page],2,3),true)
			},function(B)
			{
				return [B.hasMore && B.maxCursor,
				{
					Item : WR.Map(SolveVideo,B.items)
				}]
			})
		}],
		IDURL : function(Q)
		{
			return WR.StartW('Music',Q) ? TikTokMusic(Q.slice(5)) :
				TikTokVideo(Q)
		}
	}
})