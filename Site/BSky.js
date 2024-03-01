'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	/*
		Handle names match /^[\da-z][-\da-z]{0,19}$/
	*/
	var
	DIDPrefix = 'did:plc:',

	BSkyApp = 'https://bsky.app/',
	BSkyAppProfile = BSkyApp + 'profile/',
	BSkyAppProfilePost = WW.Tmpl(BSkyAppProfile,undefined,'/post/',undefined),
	BSkySocial = 'https://bsky.social/',
	BSkySocialRPC = BSkySocial + 'xrpc/',
	BSkyMethodSession = 'com.atproto.server.getSession',
	BSkyMethodSessionRefresh = 'com.atproto.server.refreshSession',
	BSkyMethodResolveHandle = 'com.atproto.identity.resolveHandle',
	BSkyMethodPost = 'app.bsky.feed.getPostThread',
	BSkyMethodTimeline = 'app.bsky.feed.getTimeline?limit=' + O.Size,
	BSkyMethodAuthorFeed = 'app.bsky.feed.getAuthorFeed?limit=' + O.Size,
	BSkyMethodSearchPost = 'app.bsky.feed.searchPosts?limit=' + O.Size,
	BSkyMethodSearchActor = 'app.bsky.actor.searchActorsTypeahead?limit=' + O.Size,
	BSkyMethodFollow = 'app.bsky.graph.getFollows?limit=' + O.Size,
	PadDID = function(Q)
	{
		return Q.replace(/^(?!did:)/,DIDPrefix)
	},
	MakePostURI = function(Q)
	{
		/*
			github.com/bluesky-social/atproto/packages/bsky/src/api/app/bsky/feed/getPostThread.ts
			According to the implementation, the whole uri is required to retrieve the post
		*/
		Q = WW.IsArr(Q) ? Q : Q.split('/')
		return 'at://' + PadDID(Q[0]) + '/app.bsky.feed.post/' + Q[1]
	},
	Req = function(Q)
	{
		var
		Coke = O.Coke().split('\n'),
		PadAuth = function(Q,S)
		{
			Q = WW.N.ReqOH(Q,'Authorization',S.replace(/^(?!\w+ )/,'Bearer '),true)
			Q.URL = Q.URL.replace(/^(?!\w+:\/\/)/,BSkySocialRPC)
			// WR.Find(WR.PropEq('type','AtprotoPersonalDataServer'),Session.didDoc.service).serviceEndpoint
			Q.Cookie = false
			return Q
		};
		return WX.TCO(function(_,I)
		{
			return (Coke[1] ? O.Req(PadAuth(Q,Coke[1])) : WX.Throw('Bad Token'))
				.Map(function(B){return [false,B]})
				.ErrAs(function(E)
				{
					I && WW.Throw(E)
					return O.Req(PadAuth({Med : 'POST',URL : BSkyMethodSessionRefresh},Coke[0])).Map(function(B)
					{
						B = Common(B)
						Coke = [B.refreshJwt,B.accessJwt]
						O.CokeU(Coke.join('\n'))
						return [true]
					})
				})
		}).Map(Common)
	},
	Common = function(B)
	{
		B = WC.JTO(B)
		B.error && O.Bad(B.error,B.message)
		return B
	},
	// github.com/did-method-plc/did-method-plc
	SolveSession = O.CokeC(/**@type {() => WishNS.Provider<
	{
		handle : string
		did : string
		didDoc :
		{
			id : string
			service :
			{
				id : string
				type : string
				serviceEndpoint : string
			}[]
		}
	}>}*/ function()
	{
		return Req(BSkyMethodSession)
	}),
	SolveHandleToDID = WX.CacheM(function(Q)
	{
		return O.API({URL : BSkySocialRPC + BSkyMethodResolveHandle,QS : {handle : Q}})
			.Map(function(B){return Common(B).did})
	}),
	MakeCursor = function(Q,S)
	{
		return O.More(function(ID)
		{
			return WX.Any(Q(ID)).FMap(Req)
		},function(I,Page,ID)
		{
			return WX.Any(Q(ID)).FMap(function(T)
			{
				T = WW.IsObj(T) ? WW.Merge({},T) : {URL : T};
				T.QS = WW.Merge(false,{cursor : I[Page]},T.QS)
				return Req(T)
			})
		},function(B)
		{
			return [B.cursor,
			{
				Item : WR.Flatten(S ? S(B) : WR.Map(SolvePost,B.feed))
			}]
		})
	},
	SolvePost = function(B)
	{
		var
		TopPost = B.post,
		TopReply = B.reply,
		TopParent = B.parent,
		TopReason = B.reason,
		PostRecord,
		PostEmbed,
		UserDID,
		PostID,
		Img = [],
		More = [],
		R = [];

		if (B.$type && 'app.bsky.feed.defs#threadViewPost' !== B.$type) switch(B.$type)
		{
			case 'app.bsky.feed.defs#notFoundPost' : return R
			default : return [
			{
				Non : true,
				Unk : true,
				Title : WC.OTJ(B)
			}]
		}

		PostRecord = TopPost.record,
		PostEmbed = TopPost.embed,
		UserDID = TopPost.author.did,
		PostID = WW.MF(/\/([^/]+)$/,TopPost.uri),
		WR.StartW(DIDPrefix,UserDID) && (UserDID = UserDID.slice(DIDPrefix.length))

		if (TopReply)
		{
			// When listed in feed
			WR.Each(function(V)
			{
				WR.Each(function(V)
				{
					V.Group = PostID
					R.push(V)
				},V && SolvePost({post : V}))
			},[
				TopReply.root,
				TopReply.parent
			])
		}
		if (TopParent)
		{
			// When accessing the post directly
			WR.Each(function(V){R.push(V)},SolvePost(TopParent))
		}

		if (TopPost.indexedAt !== PostRecord.createdAt)
		{
			// wpyvghtrmnflwxmknbz67vct/3k5mfs5jt4c22
			More.push('IndexedAt ' + WW.StrDate(TopPost.indexedAt))
		}
		if (PostEmbed) switch (PostEmbed.$type)
		{
			case 'app.bsky.embed.images#view' :
				WR.Each(function(V)
				{
					Img.push(V.fullsize)
				},PostEmbed.images)
				break
			case 'app.bsky.embed.external#view' :
				Img.push(PostEmbed.external.thumb)
				More.push(O.Ah(PostEmbed.external.title,PostEmbed.external.uri))
				break
			default :
				More.push('Unknown Embed ' + PostEmbed.$type)
		}
		if (TopReason) switch (TopReason.$type)
		{
			case 'app.bsky.feed.defs#reasonRepost' :
				More.push(
				[
					WW.Quo('Repost'),
					WV.Ah(TopReason.by.displayName,BSkyAppProfile + TopReason.by.handle),
					' ' + WW.StrDate(TopReason.indexedAt)
				])
				break
			default :
				More.push('Unknown Reason ' + TopReason.$type)
		}
		R.push(
		{
			ID : UserDID + '/' + PostID,
			Group : R.length && R[0].Group,
			URL : BSkyAppProfilePost(TopPost.author.handle,PostID),
			Img : Img,
			Title : PostRecord.text,
			UP : TopPost.author.displayName,
			UPURL : BSkyAppProfile + TopPost.author.handle,
			Date : PostRecord.createdAt,
			More : More
		})

		WR.Each(function(V)
		{
			V = SolvePost(V)
			WR.Each(function(B)
			{
				1 < V.length && (B.Group = V[0].ID)
				R.push(B)
			},V)
		},B.replies)
		return R
	};
	return {
		ID : 'BSky',
		Alias : 'BS',
		Judge : /\bBSky\b|did:plc/i,
		SignHint : "copy(JSON.parse(localStorage.getItem('BSKY_STORAGE')).session.currentAccount.refreshJwt)",
		Sign : function()
		{
			return SolveSession().Map(function(Session){return Session.handle})
		},
		Map : [
		{
			Name : O.NameFind,
			Example :
			[
				'メイドインアビス'
			],
			View : MakeCursor(function(ID)
			{
				return {URL : BSkyMethodSearchPost,QS : {q : ID}}
			},function(B)
			{
				return WR.Map(function(V)
				{
					return SolvePost({post : V})
				},B.posts)
			}),
			Hint : function(Q)
			{
				return Req({URL : BSkyMethodSearchActor,QS : {term : Q}}).Map(function(B)
				{
					return {
						Item : WR.Map(function(V)
						{
							return [
								BSkyAppProfile + V.handle,
								V.displayName + ' @' + V.handle]
						},B.actors),
						Jump : true
					}
				})
			}
		},{
			Name : 'Post',
			Judge :
			[
				/did:plc:([\da-z]{24})\/[^/]+\/([\da-z]{10,})/i,
				/\b([\da-z]{24})[/_]([\da-z]{10,})/,
				/\b([^/.]+(?:\.\w+)+)\/(?:Post\/)?([\da-z]{10,})/i
			],
			Join : '/',
			Example :
			[
				'udon0531.bsky.social/3kksgzeqgf72j',
				{
					As : 'Inp',
					Val : BSkyAppProfilePost('udon0531.bsky.social','3kksgzeqgf72j'),
					ID : 'udon0531.bsky.social/3kksgzeqgf72j'
				},
				'crohlfhshthxncld2v66ybba/3kksgzeqgf72j',
				{
					As : 'Inp',
					Val : MakePostURI('crohlfhshthxncld2v66ybba/3kksgzeqgf72j'),
					ID : 'crohlfhshthxncld2v66ybba/3kksgzeqgf72j'
				}
			],
			View : function(ID)
			{
				ID = ID.split('/')
				return (/\./.test(ID[0]) ?
					SolveHandleToDID(ID[0])
						.Map(function(B){return [B,ID[1]]}) :
					WX.Just(ID))
					.FMap(function(ID)
					{
						return Req(
						{
							URL : BSkyMethodPost,
							QS : {uri : MakePostURI(ID)}
						})
					})
					.Map(function(B)
					{
						return {
							Item : SolvePost(B.thread)
						}
					})
			}
		},{
			Name : 'User',
			Judge :
			[
				/\b[\da-z-]{1,20}\.bsky\.social/i,
				/\b[\da-z]{24}\b/,
				/Profile\/([^./]+(?:\.\w+)+)\b/i
			],
			Example :
			[
				'udon0531.bsky.social',
				{
					As : 'Inp',
					Val : BSkyAppProfile + 'udon0531.bsky.social',
					ID : 'udon0531.bsky.social'
				},
				'crohlfhshthxncld2v66ybba',
				{
					As : 'Sub',
					Val : 'crohlfhshthxncld2v66ybba',
					ID : 'crohlfhshthxncld2v66ybba'
				}
			],
			View : MakeCursor(function(ID)
			{
				return (/\./.test(ID) ? SolveHandleToDID(ID) : WX.Just(PadDID(ID)))
					.Map(function(DID)
					{
						return {
							URL : BSkyMethodAuthorFeed,
							QS :
							{
								actor : DID,
								filter : 'posts_with_replies' // 'posts_and_author_threads' | 'posts_with_media'
							}
						}
					})
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
			View : MakeCursor(WR.Const(BSkyMethodTimeline))
		},{
			Name : O.NameUP,
			JudgeVal : false,
			Example :
			[
				''
			],
			View : MakeCursor(function()
			{
				return SolveSession().Map(function(Session)
				{
					return {URL : BSkyMethodFollow,QS : {actor : Session.did}}
				})
			},function(B)
			{
				return WR.Map(function(V)
				{
					return {
						Non : true,
						ID : V.handle,
						URL : BSkyAppProfile + V.handle,
						Img : V.avatar,
						Title : V.displayName,
						UP : V.did,
						UPURL : BSkyAppProfile + V.handle,
						Date : V.indexedAt,
						More : V.description
					}
				},B.follows)
			})
		}],
		IDURL : MakePostURI
	}
})