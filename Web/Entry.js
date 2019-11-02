'use strict'
~function()
{
	var
	WW = Wish,
	WR = WW.R,
	WC = WW.C,
	WB = WW.B,
	WV = WW.V,
	WX = WW.X,
	Top = Wish.Top,
	WebSocket = Top.WebSocket,

	ActionWebShortCut = 'SC',
	ActionWebError = 'Err',
	ActionAuthHello = 'Hell',
	ActionAuthToken = 'Toke',
	ActionAuthCookie = 'Coke',
	ActionAuthShortCut = 'SC',
	ActionAuthSetting = 'Set',
	ActionAuthApi = 'Api',

	Padding = 20,
	SizeHeader = 40,
	SizeFooter = 40,
	Timeout = 1E4,

	Href = location.href.replace(/[?#].*/,'').replace(/^http/,'ws'),
	URLSite = 'Site/',
	URLApi = 'Api/',

	ClassTitleSplit = WW.Key(),
	ClassMargin = WW.Key(),
	ClassPadding = WW.Key(),

	CrabSave = Top.CrabSave,

	Rainbow = WV.Div(2,1,null,[0,SizeFooter]),
	RMain = WV.Div(2,2,['10%'],[SizeHeader,'100%'],true),
	RTab = WV.Split({Pan : [null,RMain[3],RMain[4]],Main : true}),
	Noti = WV.Noti({Top : RMain[0]}),
	NotiAuth = Noti.O(),
	NotiNewToken = Noti.O(),
	ShortCut = WW.Bus(),
	ShortCutGlobalTabPrev = 'Global.TabPrev',
	ShortCutGlobalTabNext = 'Global.TabNext',
	ShortCutGlobalProxy = 'Global.Proxy',
	ShortCutBrowseFocus = 'Browse.Focus',
	ShortCutBrowseSelAll = 'Browse.SelAll',
	ShortCutBrowseSelClear = 'Browse.SelClear',
	ShortCutBrowseHead = 'Browse.Head',
	ShortCutBrowsePrev = 'Browse.Prev',
	ShortCutBrowseNext = 'Browse.Next',
	ShortCutBrowseLast = 'Browse.Last',
	ShortCutColdCommit = 'Cold.Commit',
	ShortCutColdCommitAll = 'Cold.CommitAll',
	ShortCutListSelAll = 'List.SelAll',
	ShortCutListSelClear = 'List.SelClear',
	ShortCutOnPage = function(K,Q,S)
	{
		ShortCut.On(Q,function(){RTab.Is(K) && S()})
	},

	Online,
	WebSocketRetry = 0,
	WebSocketSince = 0,
	WebSocketNotConnected = function(){Noti.S('Unable to perform when offline')},
	WebSocketNotAuthed,WebSocketNotAuthedNoti = Noti.O(),
	WebSocketSend = WebSocketNotConnected,
	WebSocketSendAuth = WebSocketNotConnected,
	WebSocketNoti = Noti.O(),
	TokenStepA = function(Q){return WC.HSHA512(Q,'j!ui+Ju8?j')},
	TokenStepB = function(Q){return WC.HSHA512('!(|[.:O9;~',Q)},
	Cipher,Decipher,
	MakeWebSocket = function()
	{
		var
		First = !WebSocketRetry,
		Client = new WebSocket(Href),
		Suicide = function(){Client.close()};
		Client.onmessage = function(Q)
		{
			var
			K,O;
			Q = Q.data
			if (!Q.charCodeAt(0))
			{
				Q = WC.JTOO(WC.U16S(Decipher.D(WC.B91P(Q))))
				if (!WW.IsArr(Q) || !WW.IsArr(Q = Q[1])) return Suicide()
				K = Q[1]
				O = Q[2]
				switch (Q[0])
				{
					case ActionAuthHello :
						NotiAuth('Authorized!')
						NotiAuth(false)
						WebSocketNotAuthedNoti(false)
						break

					case ActionAuthToken :
						NotiNewToken(K)
						NotiNewToken(false)
						break
					case ActionAuthCookie :
						WSOnCookie(K,O)
						break

					case ActionAuthSetting :
						WSOnSetting(K)
						break

					case ActionAuthApi :
						WR.Has(K,WSOnApi) && WSOnApi[K](Q)
						break
				}
				return
			}
			Q = WC.JTOO(Q)
			K = Q[1]
			O = Q[2]
			switch (Q[0])
			{
				case ActionWebShortCut :
					WSOnSC(K)
					break

				case ActionWebError :
					Noti.S(['Error | ',K,' | ',O])
			}
		}
		Client.onopen = function()
		{
			Online = true
			First || WebSocketNoti('Connected')
			WebSocketNoti(false)
			WebSocketRetry = 0
			WebSocketSend = function(Q)
			{
				if (1 === Client.readyState)
				{
					Client.send(WC.OTJ(Q))
					return true
				}
			}
			WebSocketSendAuth = function(Q)
			{
				if (1 === Client.readyState && Cipher)
				{
					Q = Cipher.D(WC.OTJ([WW.Key(WW.Rnd(20,40)),Q,WW.Key(WW.Rnd(20,40))]))
					Client.send('\0' + WC.B91S(Q))
					return true
				}
				WebSocketNotAuthed()
			}
		}
		Client.onclose = function()
		{
			WebSocketSend = WebSocketNotConnected
			WebSocketSendAuth = WebSocketNotConnected
			Cipher = Decipher = false
			WebSocketNoti(['Offline. Since : ',WW.StrDate(WebSocketSince),', Tried : ',WebSocketRetry++])
			Online ? MakeWebSocket(Online = false) : setTimeout(MakeWebSocket,1E4)
			WSOnOffline.D()
		}
		WebSocketSince = WebSocketRetry ? WebSocketSince : WW.Now()
		First || WebSocketNoti(['Connecting...',WebSocketRetry ? ' Retry : ' + WebSocketRetry : ''])
	},
	WSOnApi = {},
	WSOnOffline = WW.BusS(),
	WSOnCookie,
	WSOnSC,
	WSOnSetting,

	SiteAll = [],
	SiteMap = {},
	SiteBegin,SiteCount = 0,SiteTotal,
	SiteNoti = Noti.O(),
	SiteOnLoad = WW.BusS(),
	SiteOnNoti = function()
	{
		WW.Now() - SiteBegin < 1000 ||
			SiteNoti(['Loading site scripts... ',SiteCount,' / ',SiteTotal,' ',(WW.Now() - SiteBegin),'ms'])
		SiteCount < SiteTotal ||
		(
			WR.Del('Site',CrabSave),
			SiteOnLoad.D(),
			SiteNoti(false)
		)
	},
	SiteSolveName = function(Q)
	{
		Q = SiteMap[Q]
		return Q ? Q.Name || Q.ID : '[Unknown]'
	};

	WV.ClsA(RMain[1],WV.NoSel)
	WV.Text(RMain[1],'CrabSave')
	WV.Ap(WV.Rock(ClassTitleSplit),RMain[2])
	WV.Ap(WV.Rock(WV.ST),RMain[3])
	WV.Ap(WV.Rock(WV.SB),RMain[3])
	WV.Ap(WV.Rock(WV.ST),RMain[4])
	WV.Ap(WV.Rock(WV.SB),RMain[4])
	WV.Ap(RMain[0],Rainbow[1])

	WV.Style(WW.Fmt
	(
		'body{height:100%;font-size:16px;overflow:hidden}' +
		'.`N` .`B`{padding-top:0;padding-bottom:0;vertical-align:top}' +

		'#`M`{position:relative;overflow:hidden}' +
		'#`T`{min-width:100px;text-align:center;line-height:`h`px;font-weight:bold}' +
		'#`C`{position:relative}' +
		'.`S`{position:absolute;left:-2px;top:10%;width:2px;height:80%;background:#BBB}' +
		'.`G`{margin:`p`px 0}' +
		'.`P`{padding:`p`px}' +
		'',
		{
			h : SizeHeader,

			N : WV.NotiW,
			B : WV.ButW,

			M : WV.ID(RMain[0]),
			T : WV.ID(RMain[1]),
			C : WV.ID(RMain[2]),
			S : ClassTitleSplit,
			G : ClassMargin,
			P : ClassPadding,

			p : Padding
		}
	))

	RTab.Add(
	[
		['Browse',function(V,_,K)
		{
			var
			ClassBrief = WW.Key(),
			ClassList = WW.Key(),
			ClassCard = WW.Key(),

			Go = function()
			{
				var Q = Keyword.V();
				Noti.S(Q)
			},

			Keyword = WV.Inp(
			{
				Right : WV.But({X : '\u2192',The : WV.TheP,U : WV.StopProp,C : Go}).R,
				Ent : Go
			}),
			BriefW = WV.Rock(ClassBrief + ' ' + ClassMargin),
			Brief = WV.Rock(),
			List = WV.Rock(ClassList),
			PagerT = WV.Page(),
			PagerB = WV.Page();

			WV.Ap(Brief,BriefW)
			WV.ApR([PagerT,PagerB],List)
			WV.ApR([Keyword,BriefW,List],WV.ClsA(V,ClassPadding))

			ShortCutOnPage(K,ShortCutBrowseFocus,function(){Keyword.Foc(true)})

			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`>.`I`{line-height:34px}' +
						'#`R`>.`I` input{padding-left:6px}' +
						'#`R`>.`I` .`B`{padding:0;min-width:60px}' +
						'.`E`{position:relative;padding:`p`px;`e`}',
						{
							R : ID,
							I : WV.InpW,
							B : WV.ButW,

							p : Padding,

							E : ClassBrief,
							e : WV.Exp('box-shadow','inset 0 0 3px 2px rgba(0,0,0,.2)'),
							L : ClassList,
							C : ClassCard
						}
					)
				}
			}
		}],
		['Cold',function()
		{

		}],
		['Hot',function()
		{

		}],
		['History',function()
		{

		}],
		['Component',function()
		{

		}],
		['Auth',function(V,_,TabKey)
		{
			var
			RToken = WV.Rock(WV.S6),
			Token = WV.Inp(
			{
				Hint : 'Token',
				Pass : true,
				Ent : function(T)
				{
					if (!Online) WebSocketNotConnected()
					else if (Cipher) Noti.S('Already authorized')
					else
					{
						T = TokenStepB(TokenStepA(Token.V()))
						Cipher = WC.AESES(T,T,WC.CFB)
						Decipher = WC.AESDS(T,T,WC.CFB)
						Token.V('').Fresh().Foc()
						WebSocketSendAuth([ActionAuthHello])
						NotiAuth('Authoring...')
					}
				}
			}),
			TokenNew = WV.Inp(
			{
				Hint : 'New Token',
				Pass : true,
				Ent : function()
				{
					if (WebSocketSendAuth([ActionAuthToken,WC.B91S(TokenStepA(Token.V())),WC.B91S(TokenStepA(TokenNew.V()))]))
					{
						Token.V('').Fresh()
						TokenNew.V('').Fresh().Foc()
						NotiNewToken('Saving new token')
					}
				}
			}),
			CookieMap = {},
			Site = WV.Inp(
			{
				Hint : '<Select A Site>',
				Stat : true,
				Inp : function(V)
				{
					Site.Stat(SiteMap[V] && WW.IsArr(SiteMap[V].Min) ? SiteMap[V].Min : '')
					CookieMin.On()
					Cookie.On()
						.V(CookieMap[V] || '')
						.Fresh()
					CookieSave.On()
				}
			}).Off(),
			CookieMin = WV.Cho(
			{
				Mul : true,
				Blk : true,
				Set : [['Y','Save with minimum required cookie entries']]
			}).V(['Y']).Off(),
			Cookie = WV.Inp(
			{
				Hint : 'Cookie',
				Row : 6,
				The : WV.TheS,
				Stat : true,
				Inp : function(){Cookie.Stat(undefined,Cookie.V().length)},
				Ent : function(_,K){K.ctrlKey && CookieSave.C()}
			}).Off().Stat('',0),
			CookieSaving,
			CookieSave = WV.But(
			{
				X : 'Save The Cookie',
				Blk : true,
				C : function(T)
				{
					CookieSaving = Site.V()
					T = Cookie.V()
					if (CookieMin.V().length && SiteMap[CookieSaving].Min)
					{
						T = WW.IsFunc(SiteMap[CookieSaving].Min) ?
							SiteMap[CookieSaving].Min(T) :
							WC.CokeS(WR.Pick(SiteMap[CookieSaving].Min,WC.CokeP(T)))
					}
					WebSocketSendAuth([ActionAuthCookie,CookieSaving,T])
				}
			}).Off();
			WebSocketNotAuthed = function()
			{
				WebSocketNotAuthedNoti(['Unable to perform when unauthorized',WV.But(
				{
					X : 'Enter Token',
					The : WV.TheP,
					C : function()
					{
						RTab.At(TabKey)
						Token.Foc(true)
					}
				}).R])
			}
			WV.ApR(
			[
				Token,WV.But(
				{
					X : 'Auth',
					The : WV.TheO,
					Blk : true,
					C : Token.Ent
				}),
				TokenNew,WV.But(
				{
					X : 'Save New Token',
					The : WV.TheO,
					Blk : true,
					C : TokenNew.Ent
				})
			],RToken)
			SiteOnLoad.R(function()
			{
				Site.On().Drop(WR.Map(function(V)
				{
					return [V.ID,V.ID + (V.Name ? ' ' + V.Name : '')]
				},WR.Where(function(V){return V.Sign},SiteAll)))
			})
			WSOnCookie = function(K,O)
			{
				if (CookieSaving && CookieSaving === K && SiteMap[K])
				{
					CookieSaving = false
					SiteMap[K].Sign().Now(function(Q)
					{
						if (Q && WW.IsStr(Q))
							Noti.S('Signed in as ' + Q + '@' + SiteSolveName(K))
						else Noti.S('Not Signed in @' + SiteSolveName(K))
					},function(E)
					{
						Noti.S('Not signed in @' + SiteSolveName(K))
						console.error(E)
					})
				}
				if (WW.IsObj(K))
				{
					CookieMap = K
					O = CookieMap[K = Site.V()]
				}
				Site.V() && K === Site.V() && Cookie.V(O || '')
			}
			WV.ApR(
			[
				RToken,
				Site,
				CookieMin,
				Cookie,
				CookieSave
			],WV.ClsA(V,ClassPadding))
			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`>.`S`{margin:auto;padding:`p`px;max-width:26em}' +
						'#`R` .`I`{margin:`p`px 0}',
						{
							R : ID,
							S : WV.S6,
							I : WV.InpW,

							p : Padding
						}
					)
				},
				Hide : function(){Token.V('').Fresh(),TokenNew.V('').Fresh()}
			}
		}],
		['ShortCut',function(V)
		{
			var
			ClassTitle = WW.Key(),
			SC = WB.SC(),
			SCC = {},
			SCM = {},
			Mask = [[WB.SCD,'KeyDown'],[WB.SCU,'KeyUp'],[WB.SCI,'Focusing TextInput']];
			WR.EachU(function(B)
			{
				var
				Key = B[0],
				On = function(E)
				{
					WV.PrevDef(E)
					ShortCut.Emit(Key)
				},
				Current = [],
				List = WV.Rock(),
				Make = function(K,M)
				{
					var
					U = WV.Rock(),
					Set = function(Q,S)
					{
						I.V(Q || '',true)
						N.V(WR.Map(WR.Head,WR.Where(function(V){return V[0] === (V[0] & S)},Mask)),true)
						K = Q
						M = S
					},
					Update = function()
					{
						K && SC.Off(K,On)
						K = I.V()
						M = WR.Reduce(WR.BOr,0,N.V())
						K && SC.On(K,On,M)
						Refresh()
					},
					Remove = function(T)
					{
						K && SC.Off(K,On)
						T = WR.Index(R,Current)
						~T && Current.splice(T,1)
						WV.Del(U)
						Refresh()
					},
					I = WV.Inp(
					{
						Hint : 'Set a shortcut',
						Blk : false,
						RO : true,
						InpU : Update
					}),
					N = WV.Cho(
					{
						Mul : true,
						Set : Mask,
						Blk : false,
						Inp : Update
					}),
					S = WB.SC(
					{
						Win : I.I,
						Top : I.I
					}),
					R =
					{
						R : U,
						S : Set,
						G : function(Q){K && Q.push([K,M])},
						D : Remove
					};
					Current.push(R)
					WV.ApR(
					[
						WV.But(
						{
							X : 'REMOVE',
							The : WV.TheP,
							C : Remove
						}),
						I,N
					],U)
					WV.Ap(U,List)
					Set(K,M)
					S.On('',function(E)
					{
						WV.PrevDef(E)
						WV.StopProp(E)
					},WB.SCY).On('',function()
					{
						I.V(S.Name().join('+'))
					},WB.SCH | WB.SCI)
					return R
				},
				Refresh = function()
				{
					if (WR.Eq(SCM[Key] = WR.Reduce(function(D,V){V.G(D)},[],Current),B))
						SCM[Key] = undefined
					WebSocketSendAuth([ActionAuthShortCut,WR.Where(WR.Id,SCM)])
				};
				B = [B.slice(1)]
				SCM[Key] = false
				;(SCC[Key] = function(Q)
				{
					if (!WR.Eq(SCM[Key],Q))
					{
						WR.Each(function(V){SC.Off(V[0],On)},SCM[Key] || B)
						SCM[Key] = Q
						WR.EachU(function(V,F)
						{
							SC.On(V[0],On,V[1])
							Current[F] ?
								Current[F].S(V[0],V[1]) :
								Make(V[0],V[1])
						},Q = Q || B)
						for (;Q.length < Current.length;) WV.Del(Current.pop().R)
					}
				})()
				WV.ApR(
				[
					WV.T(WV.Rock(ClassTitle),Key),
					WV.But(
					{
						X : 'ADD',
						The : WV.TheP,
						C : function(){Make('',WB.SCD)}
					}),
					WV.But(
					{
						X : 'RESTORE',
						The : WV.TheP,
						C : function()
						{
							SCC[Key]()
							Refresh()
						}
					}),
					List
				],V)
			},[
			[
				ShortCutGlobalTabPrev,
				'[',WB.SCD
			],[
				ShortCutGlobalTabNext,
				']',WB.SCD
			],[
				ShortCutGlobalProxy,
				'Alt+p',WB.SCD | WB.SCI
			],[
				ShortCutBrowseFocus,
				'Alt+F1',WB.SCD | WB.SCI
			],[
				ShortCutBrowseSelAll,
				'Ctrl+a',WB.SCD
			],[
				ShortCutBrowseSelClear,
				'Ctrl+Shift+a',WB.SCD
			],[
				ShortCutBrowseHead,
				'h',WB.SCD
			],[
				ShortCutBrowsePrev,
				'j',WB.SCD
			],[
				ShortCutBrowseNext,
				'k',WB.SCD
			],[
				ShortCutBrowseLast,
				'l',WB.SCD
			],[
				ShortCutColdCommit,
				'Enter',WB.SCD
			],[
				ShortCutColdCommitAll,
				'Enter+Ctrl',WB.SCD
			],[
				ShortCutListSelAll,
				'Ctrl+a',WB.SCD
			],[
				ShortCutListSelClear,
				'Esc',WB.SCD
			]])
			WSOnSC = function(Q)
			{
				WR.EachU(function(V,F){V(Q[F])},SCC)
			}
			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R` .`I`{width:10em}' +
						'#`R` .`H`{margin-left:`p`px}' +
						'.`T`{padding:4px `p`px;background:#EBEBEB;font-weight:bold}',
						{
							R : ID,
							I : WV.InpW,
							H : WV.ChoW,
							T : ClassTitle,
							p : Padding
						}
					)
				}
			}
		}],
		['Setting',function(V)
		{
			WSOnSetting = function(Q)
			{

			}
		}]
	])
	RTab.At(0)
	ShortCut.On(ShortCutGlobalTabPrev,RTab.Prev).On(ShortCutGlobalTabNext,RTab.Next)

	WV.Ready(function()
	{
		WV.Ap(Rainbow[0],WV.Body)
		WebSocket ? MakeWebSocket(true) : WebSocketNoti('No WebSocket supported')

		Top.CrabSave = CrabSave = {}
		CrabSave.Site = function(Q)
		{
			var V = Q(
			{
				Req : function(Q,H)
				{
					Q = WW.IsObj(Q) ? Q : {url : Q}
					Q.Cookie = V.Cookie
					return WX.Provider(function(O)
					{
						var T = WW.Key(),U;
						if (WebSocketSendAuth([ActionAuthApi,T,Q]))
						{
							WSOnApi[T] = function(B)
							{
								WR.Del(T,WSOnApi)
								T = false
								if (B[2] && H) O.D(B.slice(2)).F()
								else if (B[2] && /^2/.test(B[2])) O.D(B[3]).F()
								else O.E(B.slice(2))
							}
							U = WW.To(Timeout,function()
							{
								WR.Del(T,WSOnApi)
								O.E('Timeout')
							})
						}
						else T = WW.Throw(Online ? 'Unauthorized' : 'Offline')
						return function()
						{
							T && WebSocketSendAuth([ActionAuthApi,T,false])
							U && U.F()
						}
					})
				}
			},WW,WC,WR,WX);
			V.Cookie || V.Sign && (V.Cookie = V.ID)
			WW.IsStr(V.Min) && (V.Min = V.Min.split(' '))
			WR.Each(function(B){SiteMap[WR.Up(B)] = SiteMap[B] = V},
				[V.ID].concat(V.Name || [],V.Alias ? V.Alias.split(' ') : []))
			SiteAll.push(V)
			SiteOnNoti(++SiteCount)
		}
		SiteBegin = WW.Now()
		WW.To(1E3,function(){SiteCount < SiteTotal && SiteOnNoti()})
		SiteTotal = WR.Each(function(V)
		{
			WV.Ap(WV.Attr(WV.A('script'),'src',URLSite + V + '.js'),WV.Head)
		},[
			'BiliBili'
		]).length
		SiteOnNoti()
	})
}()