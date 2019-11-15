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
	RegExp = Top.RegExp,

	ActionWebShortCut = 'SC',
	ActionWebError = 'Err',
	ActionAuthHello = 'Hell',
	ActionAuthToken = 'Toke',
	ActionAuthCookie = 'Coke',
	ActionAuthShortCut = 'SC',
	ActionAuthSetting = 'Set',
	ActionAuthApi = 'Api',

	Padding = 20,
	PaddingHalf = Padding / 2,
	SizeHeader = 40,
	SizeFooter = 40,
	SizeCardWidth = 200,
	PageSize = 30,

	Href = location.href.replace(/[?#].*/,'').replace(/^http/,'ws'),
	URLSite = 'Site/',
	URLApi = 'Api/',

	ErrorS = function(E){return '{Error} ' + (WW.IsObj(E) && E.stack || E)},
	DTS = function(Q){return WW.StrDate(Q,WW.DateColS)},

	ClassTitleSplit = WW.Key(),
	ClassMargin = WW.Key(),
	ClassPadding = WW.Key(),
	ClassHighLight = WW.Key(),
	ClassSingle = WW.Key(),
	MakeHigh = function(V)
	{
		return WV.T(WV.Rock(ClassHighLight,'span'),V)
	},
	MakeSingle = function()
	{
		return WV.T(WV.Rock(ClassSingle),'\xA0')
	},

	CrabSave = Top.CrabSave,

	Rainbow = WV.Div(2,1,null,[0,SizeFooter]),
	RMain = WV.Div(2,2,['10%'],[SizeHeader,'100%'],true),
	RTab = WV.Split({Pan : [null,RMain[3],RMain[4]],Main : true}),
	Noti = WV.Noti({Top : RMain[0]}),
	NotiAuth = Noti.O(),
	NotiNewToken = Noti.O(),
	CookieMap = {},
	ShortCut = WW.Bus(),
	ShortCutGeneralTabPrev = 'General.TabPrev',
	ShortCutGeneralTabNext = 'General.TabNext',
	ShortCutGeneralProxy = 'General.Proxy',
	ShortCutGeneralFocus = 'General.FocusKeywordInput',
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
	Setting = {},
	BrowserOnProgress,

	IDCombine = function(Site,ID)
	{
		return Site.ID + '|' + ID
	},
	IsCold,
	BrowserUpdate,
	ColdAdd,
	ColdDel,
	IsHot,
	IsHistory,

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
		Q = WW.IsObj(Q) ? Q : SiteMap[Q]
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
		'body{height:100%;font-size:14px;overflow:hidden}' +
		'.`N` .`B`{padding-top:0;padding-bottom:0;vertical-align:top}' +

		'#`M`{position:relative;overflow:hidden}' +
		'#`T`{min-width:100px;text-align:center;line-height:`h`px;font-weight:bold}' +
		'#`C`{position:relative}' +
		'.`S`{position:absolute;left:-2px;top:10%;width:2px;height:80%;background:#BBB}' +
		'.`G`{margin:`p`px 0}' +
		'.`P`{padding:`p`px}' +
		'.`H`{color:#2672EC}' +
		'.`F`>.`H`{color:inherit}' +
		'.`I`{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
		'',
		{
			h : SizeHeader,

			F : WV.Foc,
			N : WV.NotiW,
			B : WV.ButW,

			M : WV.ID(RMain[0]),
			T : WV.ID(RMain[1]),
			C : WV.ID(RMain[2]),
			S : ClassTitleSplit,
			G : ClassMargin,
			P : ClassPadding,
			H : ClassHighLight,
			I : ClassSingle,

			p : Padding
		}
	))

	RTab.Add(
	[
		['Browser',function(V,_,K)
		{
			var
			ClassBrief = WW.Key(),
			ClassList = WW.Key(),
			ClassCard = WW.Key(),
			ClassCardClick = WW.Key(),
			ClassCardBar = WW.Key(),

			GoKeyWord,
			GoSite,GoAction,GoID,
			GoPref,GoPrefAction,
			Go = function()
			{
				var
				Q = Keyword.V(),
				S = GoSolve(Q);
				if (WW.IsArr(S))
				{
					Jump(0,S[0],S[1],S[2],Q)
					Keyword.Foc()
				}
				else Noti.S(S)
			},
			GoSolve = function(Q)
			{
				var Site,Action,ID,T;
				if (T = Q.match(/^\s*([A-Z\u2E80-\u9FFF\uAC00-\uD7FF\uF900-\uFAFF]+)(?:\s+([^]*))?$/i))
				{
					if (!WR.Has(Site = WR.Up(T[1]),SiteMap)) return 'Unknown site `' + T[1] + '`'
					Site = SiteMap[Site]
					T = T[2] || ''
				}
				else
				{
					T = Q
					Site = WR.Find(function(V){return V.Judge.test(Q)},SiteAll)
					if (!Site) return 'Unable to parse `' + Q + '`'
				}
				Action = WR.Find(function(V)
				{
					return WR.Any(function(B)
					{
						B = B.exec(T)
						ID = B && B[1 in B ? 1 : 0]
						return B
					},V.Judge)
				},Site.Map)
				return Action ?
					[Site,Action,WR.Trim(ID),Q.slice(0,-ID.length)] :
					'Unable to resolve `' + T + '` in site `' + SiteSolveName(Site) + '`'
			},

			Bar = [],
			BarMap = {},
			BarNone = 0,
			BarCold = 1,
			BarHot = 2,
			BarHistory = 3,
			MakeBar = function(Site,Q,V)
			{
				var
				ID = IDCombine(Site,Q.ID),
				B = WV.Rock(ClassCardBar),
				State,
				Reload = function()
				{
					var
					Next = IsHot(ID) ? BarHot :
						IsCold(ID) ? BarCold :
						IsHistory(ID) ? BarHistory :
						BarNone;
					if (Next !== State)
					{
						WV.ClsR(V,WV.Foc)
						WV.ClsR(V,WV.Alt)
						State = Next
						if (BarNone === State)
						{
							WV.T(B,'Add')
						}
						else if (BarCold === State)
						{
							WV.T(B,'Cold')
							WV.ClsA(V,WV.Foc)
						}
						else if (BarHot === State)
						{
							WV.T(B,'Hot')
							WV.ClsA(V,WV.Foc)
						}
						else if (BarHistory === State)
						{
							WV.T(B,'History')
							WV.ClsA(V,WV.Alt)
						}
					}
				},
				Add = function()
				{
					ColdAdd(ID,Site,Q)
				},
				Del = function()
				{
					ColdDel(ID)
				};
				WV.Pre(B,V)
				WV.On('click',function()
				{
					if (BarNone === State || BarHistory === State)
						Add()
					else if (BarCold === State)
						Del()
				},V)
				Reload()
				Bar.push(
				{
					R : Reload,
					A : Add,
					D : Del
				})
				BarMap[ID] ?
					BarMap[ID].push(WR.Last(Bar)) :
					BarMap[ID] = [WR.Last(Bar)]
			},

			JumpEnd = WX.EndL(),
			Jump = function(Q,Site,Action,ID,Key)
			{
				var N = WW.Now();
				if (!Key)
				{
					Site = GoSite
					Action = GoAction
					ID = GoID
					Key = GoKeyWord
				}
				if (Action)
				{
					if (!BriefKeywordOn) BriefKeywordOn = WV.Con(Brief,BriefKeyword.R)
					BriefKeyword.K(Key)
						.S(SiteSolveName(Site))
						.A(Action.Name)
						.I(ID)
						.U('Loading...')
					JumpEnd(Action.View(ID,Q,Action === GoPrefAction ? GoPref : undefined).Now(function(/**@type {CrabSaveNS.SitePage}*/S)
					{
						WV.Clear(List)
						Bar.length = 0
						BarMap = {}
						S.Size = S.Size || PageSize
						WR.EachU(function(V,F)
						{
							var
							IDView = V.View || (V.Non ? V.ID : Site.IDView(V.ID)),
							URL = V.URL || false !== V.URL && Site.IDURL && Site.IDURL(V.ID),
							Click = WV.Rock(ClassCardClick),
							Img;
							WV.Ap(WV.Con(WV.Rock(ClassCard + ' ' + WV.S4,'fieldset'),
							[
								WV.Con(WV.A('legend'),
								[
									V.Index = WR.Default(S.Size * Q + F,V.Index),
									' | ',
									URL ? WV.Ah(IDView,URL,V.Title) : IDView
								]),
								WV.Con(Click,
								[
									V.Img && WV.Attr
									(
										Img = WV.A('img'),
										'src',
										Setting.ProxyView ?
											URLApi + V.Img :
											V.Img
									)
								]),
								WW.IsNum(V.Len) ?
									WV.X(WW.StrS(V.Len)) :
									WW.IsStr(V.Len) &&
										WV.X(/^\d+(:\d+){1,2}$/.test(V.Len) ?
											WW.StrS(WR.Reduce(function(D,V){return 60 * D - -V},0,V.Len.split(':'))) :
											V.Len),
								V.TitleView ?
									WV.Con(WV.Rock(WV.FmtW),V.TitleView) :
									!!V.Title && WV.T(WV.Rock(WV.FmtW),V.Title),
								WV.X(V.UPURL ?
									WV.Ah(V.UP,V.UPURL) :
									V.UP),
								!!V.Date && WV.X(WW.IsStr(V.Date) ? V.Date : DTS(V.Date)),
								!!V.More && WV.Con(WV.Rock(WV.FmtW),V.More)
							]),List)
							V.Non || MakeBar(Site,V,Click)
							V.Non && Img && URL && WV.On('click',function()
							{
								Keyword.V(URL)
								Go()
							},Img)
						},S.Item)
						BriefKeyword.U(WW.Fmt
						(
							'`F`~`T`. Item `L`/`U`. Page `A`/`P`. `M`s',
							{
								F : S.Item.length && S.Item[0].Index,
								T : S.Item.length && WR.Last(S.Item).Index,
								L : S.Item.length,
								U : S.Len = WR.Default(S.Item.length,S.Len),
								A : S.At = WR.Default(Q,S.At),
								P : S.Max = WR.Default(Math.ceil(S.Len / (S.Size || PageSize)) || 1,S.Max),
								M : WR.ToFix(3,(WW.Now() - N) / 1E3)
							}
						))
						PagerT.At(S.At,S.Max)
						PagerB.At(S.At,S.Max)
						GoSite = Site
						GoAction = Action
						GoID = ID
						GoKeyWord = Key
						if (S.Pref)
						{
							if (GoPrefAction !== Action)
							{
								GoPrefAction = Action
								N = S.Pref(function()
								{
									Jump(PagerT.At())
								})
								WV.Con(Pref,N.R)
								GoPref = N.O
							}
						}
						else
						{
							GoPrefAction = null
							GoPref = null
							WV.Clear(Pref)
						}
					},function(E)
					{
						BriefKeyword.U(ErrorS(E))
					}))
				}
				return false
			},

			KeywordCache = WW.Key(),
			KeywordHintLoad = WV.Fmt('Loading suggestions for `K`\n`E`'),
			KeywordHint = WV.Fmt('Suggestions for `K`\n[`M`ms `T`] `D`'),
			HintErr,HintCurrent,
			Hint = function(S)
			{
				var K,B,C;
				HintErr = false
				if (WW.IsArr(S = GoSolve(S)) && S[1].Hint)
				{
					C = HintCurrent = WW.Key()
					K = SiteSolveName(S[0]) + ' ' + S[1].Name + ' ' + S[2]
					B = WW.Now()
					KeywordHintLoad.K(K).E('')
					Keyword.Hint(undefined,KeywordHintLoad.R)
						.Drop()
					;(S[1][KeywordCache] || (S[1][KeywordCache] = WX.CacheM(S[1].Hint)))
						(S[2])
						.Now(function(V)
						{
							if (HintCurrent === C)
							{
								KeywordHint.K(K).T(V.Item.length)
									.M(WW.Now() - B)
									.D(V.Desc || '')
								Keyword.Hint(undefined,KeywordHint.R)
									.Drop(WR.Map(function(V)
									{
										return WW.IsArr(V) ?
											[S[3] + V[0],V[1],0] :
											[S[3] + V,V,0]
									},V.Item),false)
							}
						},function(E)
						{
							if (HintCurrent === C)
							{
								HintErr = true
								KeywordHintLoad.E(ErrorS(E))
							}
						})
				}
				else
				{
					HintCurrent = false
					Keyword.Hint(undefined,null)
						.Drop()
				}
			},
			Keyword = WV.Inp(
			{
				Hint : 'Keyword',
				Right : WV.But({X : '\u2192',The : WV.TheP,U : WV.StopProp,C : Go}).R,
				Any : true,
				Non : true,
				Ent : Go,
				EntD : Go,
				Inp : Hint,
				Foc : function()
				{
					HintErr && Hint(Keyword.V())
				}
			}),
			Brief = WV.Rock(ClassBrief + ' ' + ClassMargin),
			BriefKeywordOn,
			BriefKeyword = WV.Fmt
			(
				'Keyword `|K|`\n' +
				'|S| |A| |I|\n' +
				'|U|',
				null,null,'|'
			),
			Pref = WV.Rock(),
			List = WV.Rock(ClassList + ' ' + ClassMargin),
			PagerT = WV.Page({Inp : Jump}),
			PagerB = WV.Page({Inp : Jump});

			WV.On('click',function(E,T)
			{
				if (T = WV.Attr(E.target,'href'))
				{
					WV.PrevDef(E)
					Keyword.V(T)
					Go()
				}
			},List)

			WV.ApR([Keyword,Brief,PagerT,Pref,List,PagerB],WV.ClsA(V,ClassPadding))

			ShortCut.On(ShortCutGeneralFocus,function()
			{
				RTab.At(K)
				Keyword.Foc(true)
			})
			ShortCutOnPage(K,ShortCutBrowseSelAll,function()
			{
				WR.Each(function(V){V.A()},Bar)
			})
			ShortCutOnPage(K,ShortCutBrowseSelClear,function()
			{
				WR.Each(function(V){V.D()},Bar)
			})
			ShortCutOnPage(K,ShortCutBrowseHead,PagerT.Head)
			ShortCutOnPage(K,ShortCutBrowsePrev,PagerT.Prev)
			ShortCutOnPage(K,ShortCutBrowseNext,PagerT.Next)
			ShortCutOnPage(K,ShortCutBrowseLast,PagerT.Last)

			BrowserUpdate = function(Q)
			{
				WR.Each(function(V)
				{
					WR.Has(V,BarMap) &&
						WR.Each(function(B){B.R()},BarMap[V])
				},Q)
			}
			BrowserOnProgress = function(Q)
			{
				BriefKeyword.U('Loading... ' + Q)
			}

			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`>.`I`{line-height:34px;font-weight:bold}' +
						'#`R`>.`I` .`D`{line-height:normal}' +
						'#`R`>.`I` input{padding-left:6px}' +
						'#`R`>.`I` .`B`{padding:0;min-width:60px}' +
						'.`E`{padding:`h`px;`e`}' +
						'.`L`{margin-left:-`l`px;margin-right:-`l`px;text-align:center}' +
						'.`C`' +
						'{' +
							'display:inline-block;' +
							'margin:`l`px;' +
							'padding:`h`px;' +
							'width:`c`px;' +
							'text-align:left;' +
							'text-align:start;' +
							'word-break:break-all' +
						'}' +
						'.`C` legend{font-weight:bold}' +
						'.`K`{cursor:pointer}' +
						'.`S`{color:#F7F7F7;font-weight:bold;text-align:center}' +
						'.`K`:hover .`S`,.`S`.`A`{background:rgba(102,175,224,.7)}' +
						'.`K`.`O` .`S`{background:#66AFE0}' +
						'.`C` img{width:100%;max-height:`m`px}',
						{
							R : ID,
							I : WV.InpW,
							D : WV.InpD,
							B : WV.ButW,
							A : WV.Alt,
							O : WV.Foc,

							p : Padding,
							h : PaddingHalf,
							l : PaddingHalf / 2,

							E : ClassBrief,
							e : WV.Exp('box-shadow','inset 0 0 3px 2px rgba(0,0,0,.2)'),
							L : ClassList,
							C : ClassCard,
							K : ClassCardClick,
							S : ClassCardBar,
							c : SizeCardWidth,
							m : 2 * SizeCardWidth
						}
					)
				}
			}
		}],
		['Cold',function(V,_,K)
		{
			var
			Cold = [],
			ColdMap = {},
			FillSingle = function(Q,W,A)
			{
				WV.Con(Q,A ?
					[W,MakeHigh(' @ '),A] :
					W)
				WV.Ti(Q,A ? W + ' @ ' + A : W)
			},
			List = WV.List(
			{
				Data : Cold,
				Pan : V,
				Sel : true,
				Make : function(V,S)
				{
					var
					ID = MakeSingle(),
					Title = MakeSingle();
					WV.ApA([ID,Title],V)
					return {
						U : function(V)
						{
							FillSingle(ID,V.I,V.S)
							FillSingle(Title,V.T,V.U)
						}
					}
				}
			});

			ShortCutOnPage(K,ShortCutListSelAll,List.SelAll)
			ShortCutOnPage(K,ShortCutListSelClear,List.SelClr)

			IsCold = function(ID){return WR.Has(ID,ColdMap)}
			ColdAdd = function(ID,Site,/**@type {CrabSaveNS.SiteItem}*/Q)
			{
				if (!IsCold(ID))
				{
					List.Push(ColdMap[ID] =
					{
						S : Site.ID,
						I : Q.ID,
						T : Q.Title,
						U : Q.UP
					})
					BrowserUpdate([ID])
				}
			}
			ColdDel = function(ID,T)
			{
				if (IsCold(ID))
				{
					T = Cold.indexOf(ColdMap[ID])
					WR.Del(ID,ColdMap)
					~T && List.Splice(T,1)
					BrowserUpdate([ID])
				}
			}
			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R` .`I`{padding:`h`px}',
						{
							R : ID,
							I : WV.ListI,

							h : PaddingHalf
						}
					)
				},
				Show : List.In,
				HideP : List.Out
			}
		}],
		['Hot',function(V,_,K)
		{
			var
			Hot = [],
			HotMap = {},
			List = WV.List(
			{
				Data : Hot,
				Pan : V,
				Sel : true,
				Make : function(V,S)
				{
					return {
						U : function(V)
						{

						}
					}
				}
			});

			ShortCutOnPage(K,ShortCutListSelAll,List.SelAll)
			ShortCutOnPage(K,ShortCutListSelClear,List.SelClr)

			IsHot = function(ID){return WR.Has(ID,HotMap)}

			return {
				Show : List.In,
				HideP : List.Out
			}
		}],
		['History',function(V,_,K)
		{
			var
			History = [],
			HistoryMap = {},
			List = WV.List(
			{
				Data : History,
				Pan : V,
				Sel : true,
				Make : function(V,S)
				{
					return {
						U : function(V)
						{

						}
					}
				}
			});

			ShortCutOnPage(K,ShortCutListSelAll,List.SelAll)
			ShortCutOnPage(K,ShortCutListSelClear,List.SelClr)

			IsHistory = function(ID){return WR.Has(ID,HistoryMap)}

			return {
				Show : List.In,
				HideP : List.Out
			}
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
			Site = WV.Inp(
			{
				Hint : '<Select A Site>',
				Stat : true,
				Inp : function(V)
				{
					Site.Stat(SiteMap[V] && WW.IsArr(SiteMap[V].Min) ? SiteMap[V].Min.join(', ') : '')
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
				Row : 8,
				The : WV.TheS,
				Stat : true,
				Inp : function(){Cookie.Stat(undefined,Cookie.V().length)},
				Ent : function(_,K){K.ctrlKey && CookieSave.C()}
			}).Off().Stat('',0),
			CookieSaving,
			CookieEnd = WX.EndL(),
			CookieCheckNoti = Noti.O(),
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
							WC.CokeS(WR.Pick(SiteMap[CookieSaving].Min,WC.CokeP(T,WR.Id)),WR.Id)
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
					CookieCheckNoti('Checking if signed in @' + SiteSolveName(K))
					CookieEnd(SiteMap[K].Sign().Now(function(Q)
					{
						if (Q && WW.IsStr(Q))
							CookieCheckNoti('Signed in as ' + Q + '@' + SiteSolveName(K))
						else CookieCheckNoti('Not Signed in @' + SiteSolveName(K))
						CookieCheckNoti(false)
					},function(E)
					{
						CookieCheckNoti('Not signed in @' + SiteSolveName(K) + '\n' + ErrorS(E))
						CookieCheckNoti(false)
					}))
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
						InpU : Update,
						Esc : false
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
						I.In() && I.V(S.Name().join('+'))
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
				ShortCutGeneralTabPrev,
				'[',WB.SCD
			],[
				ShortCutGeneralTabNext,
				']',WB.SCD
			],[
				ShortCutGeneralProxy,
				'Alt+p',WB.SCD | WB.SCI
			],[
				ShortCutGeneralFocus,
				'`',WB.SCD
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
			var
			SetD = {},SetC = {},
			PC,
			Key = function(Q){return PC = Pref.C(Q),Q},
			Pref = WV.Pref(
			{
				O : Setting,
				C : function()
				{
					WebSocketSendAuth([ActionAuthSetting,WR.WhereU(function(V,F){return V !== SetD[F]},Setting)])
				}
			}),
			OptionProxy;
			WR.Each(function(V)
			{
				var
				Key = V[1],
				Default = WR.Default('',V[3]);
				Pref.S([[V[0],V[2]]])
				'' === Default || V[2].V(Setting[Key] = SetD[Key] = Default,true)
				SetC[Key] = function(Q)
				{
					if (Setting[Key] !== (Q = undefined === Q ? Default : Q))
					{
						V[2].V(Setting[Key] = Q,true)
					}
				}
			},[
			[
				'Download destination',
				Key('Dir'),
				WV.Inp(
				{
					Hint : 'Full path of the directory to save downloaded files',
					InpU : PC
				})
			],[
				'File name format',
				Key('Fmt'),
				WV.Inp(
				{
					InpU : PC
				})
			],[
				'Downloader proxy',
				Key('Proxy'),
				OptionProxy = WV.Cho(
				{
					Set : [[false,'Disabled'],[true,'Enabled']],
					Inp : PC
				}),
				false
			],[
				'Proxy URL',
				Key('ProxyURL'),
				WV.Inp(
				{
					Hint : 'Host:Port',
					InpU : PC
				})
			],[
				'Image proxy',
				Key('ProxyView'),
				WV.Cho(
				{
					Set : [[false,'No proxy'],[true,'Use downloader proxy']],
					Inp : PC
				}),
				false
			],[
				'Retry delay after download error (in seconds)',
				Key('Delay'),
				WV.Inp(
				{
					Yep : WV.InpYZ,
					InpU : PC
				}),
				20
			],[
				'Merge command',
				Key('Merge'),
				WV.Inp(
				{
					Row : 6,
					InpU : PC
				}),
				''
			],[
				'Alias',
				Key('Alias'),
				WV.Inp(
				{
					Row : 8,
					Hint : '[Original Author Name A]\n' +
						'[Replacement For Author Name A]\n' +
						'[Original Author Name B]\n' +
						'[Replacement For Author Name B]\n' +
						'...',
					InpU : PC
				})
			]])
			WV.Ap(Pref.R,V)
			WSOnSetting = function(Q)
			{
				WR.EachU(function(V,F){V(Q[F])},SetC)
			}
			ShortCut.On(ShortCutGeneralProxy,function(V)
			{
				OptionProxy.V(V = !OptionProxy.V())
				Noti.S(V ? 'Proxy enabled' : 'Proxy disabled')
			})
			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`{padding:0 `p`px}',
						{
							R : ID,
							p : Padding
						}
					)
				}
			}
		}]
	])
	RTab.At(0)
	ShortCut.On(ShortCutGeneralTabPrev,RTab.Prev).On(ShortCutGeneralTabNext,RTab.Next)

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
						var T = WW.Key();
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
						}
						else T = WW.Throw(Online ? 'Unauthorized' : 'Offline')
						return function()
						{
							T && WebSocketSendAuth([ActionAuthApi,T,false])
						}
					})
				},
				Api : function(Q)
				{
					return WB.ReqB(URLApi + WC.UE(WW.IsObj(Q) ? WC.OTJ(Q) : Q))
				},
				Head : function(Q,K,V)
				{
					Q = WW.IsObj(Q) ? Q : {url : Q}
					;(Q.headers || (Q.headers = {}))[K] = V
					return Q
				},
				Auth : function()
				{
					return !!Cipher
				},
				Coke : function()
				{
					return CookieMap[V.Cookie] || ''
				},
				Bad : function(Q,S)
				{
					WW.Throw(null == S ? Q : '[' + Q + '] ' + S)
				},
				BadR : function(Q)
				{
					WW.Throw('Bad response ' + (WW.IsObj(Q) ? WC.OTJ(Q) : Q))
				},
				Num : function(Q)
				{
					return RegExp('\\b(?:' + Q + ')(?![A-Z])\\D*(\\d+)','i')
				},
				Word : function(Q)
				{
					return RegExp('\\b(?:' + Q + ')[\\s/=]+([^&?#\\s]+)','i')
				},
				TL :
				[
					/^$/,
					/\b(?:Dynamic|Sub|Subscri(?:be|ption)|Timeline|TL)\b/i,
					/\b(?:Top|Repo)\b/i
				],
				UP : /\b(?:Up|Uploader|Fo|Follow|Following)\b/i,
				Find : /^(?:\?|Find|Search)\s+(?!\s)(.+)$/i,
				Size : PageSize,
				Pascal : function(Q)
				{
					return Q.replace(/[A-Z]?[a-z]+/g,function(V)
					{
						return V.charAt(0).toUpperCase() + V.slice(1)
					})
				},
				Less : function(Q)
				{
					/**@type {CrabSaveNS.SiteItem[]}*/
					var Cache;
					return function(ID,Page)
					{
						return (Page && Cache ? WX.Just(Cache) : Q(ID)).Map(function(V)
						{
							var C = Math.ceil(V.length / PageSize);
							Cache = V
							return {
								At : Page < C ? Page : Page = C && ~-C,
								Max : C,
								Len : V.length,
								Size : PageSize,
								Item : V.slice(Page * PageSize,-~Page * PageSize)
							}
						})
					}
				},
				More : function(Q,S,M)
				{
					var
					Cache,Count,Len,
					Finalize = function(V,P)
					{
						if (!WR.Has('Len',V)) V.Len = Len
						if (!WR.Has('Max',V)) V.Max = Cache.length
						P = WR.Sum(Count.slice(0,P))
						WR.Each(function(B)
						{
							if (!WR.Has('Index',B)) B.Index = P++
						},V.Item)
					};
					M = M || WR.Id
					return function(ID,Page)
					{
						return Cache && Page ?
							S(Cache,Page,ID).Map(function(V)
							{
								V = M(V)
								Len += V.Item.length - (0 | Count[Page])
								Count[Page] = V.Item.length
								Finalize(V,Page)
								return V
							}) :
							Q(ID).Map(function(V)
							{
								Cache = V[0]
								V = M(V[1])
								Count = [Len = V.Item.length]
								Finalize(V,Page)
								return V
							})
					}
				},
				SolU : function(Q,S)
				{
					if (WR.StartW('//',Q))
						Q = 'http:' + Q
					if (WR.StartW('/',Q))
						Q = WW.MU(/^[^/]+\/\/[^/]+/,S) + Q
					return Q
				},
				DTS : DTS,
				High : MakeHigh,
				Ah : function(Q,S)
				{
					return WV.X(WV.Ah(Q,S))
				},
				Progress : BrowserOnProgress
			},WW,WC,WR,WX,WV);
			if (!WW.IsNum(SiteMap[V.ID])) return
			V.Judge || (V.Judge = /(?!)/)
			V.Cookie || V.Sign && (V.Cookie = V.ID)
			WW.IsStr(V.Min) && (V.Min = V.Min.split(' '))
			WR.Each(function(B){B.Judge = WW.IsArr(B.Judge) ? B.Judge : B.Judge ? [B.Judge] : []},V.Map)
			V.IDView || (V.IDView = WR.Id)
			SiteAll[SiteMap[V.ID]] = V
			WR.Each(function(B){SiteMap[WR.Up(B)] = SiteMap[B] = V},
				[V.ID].concat(V.Name || [],V.Alias ? V.Alias.split(' ') : []))
			SiteOnNoti(++SiteCount)
		}
		SiteBegin = WW.Now()
		WW.To(1E3,function(){SiteCount < SiteTotal && SiteOnNoti()})
		SiteTotal = WR.EachU(function(V,F)
		{
			WV.Ap(WV.Attr(WV.A('script'),'src',URLSite + V + '.js'),WV.Head)
			SiteMap[V] = F
		},[
			'BiliBili',
			'YouTube',
			'NicoNico'
		]).length
		SiteOnNoti()
	})
}()