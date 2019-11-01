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

	ActionWebError = 'Err',
	ActionAuthHello = 'Hell',
	ActionAuthToken = 'Toke',
	ActionAuthApi = 'Api',

	SizeHeader = 40,
	SizeFooter = 40,
	Timeout = 1E4,

	Href = location.href.replace(/[?#].*/,'').replace(/^http/,'ws'),
	URLSite = 'Site/',
	URLApi = 'Api/',

	ClassTitleSplit = WW.Key(),
	ClassMargin = WW.Key(),

	CrabSave = Top.CrabSave,

	Rainbow = WV.Div(2,1,null,[0,SizeFooter]),
	RMain = WV.Div(2,2,['10%'],[SizeHeader,'100%'],true),
	RTab = WV.Split({Pan : [null,RMain[3],RMain[4]],Main : true}),
	Noti = WV.Noti({Top : RMain[0]}),
	NotiAuth = Noti.O(),
	NotiNewToken = Noti.O(),
	ShortCut = WB.SC(),

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
			Q = Q.data
			if (!Q.charCodeAt(0))
			{
				Q = WC.JTOO(WC.U16S(Decipher.D(WC.B91P(Q))))
				if (!WW.IsArr(Q) || !WW.IsArr(Q = Q[1])) return Suicide()
				switch (Q[0])
				{
					case ActionAuthHello :
						NotiAuth('Authorized!')
						NotiAuth(false)
						break
					case ActionAuthToken :
						NotiNewToken(Q[1])
						NotiNewToken(false)
						break

					case ActionAuthApi :
						WR.Has(Q[1],WSOnApi) && WSOnApi[Q[1]](Q)
						break
				}
				return
			}
			Q = WC.JTOO(Q)
			switch (Q[0])
			{
				case ActionWebError :
					Noti.S(['Error | ',Q[1],' | ',Q[2]])
					break
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

	SiteAll = [],
	SiteMap = {},
	SiteBegin,SiteCount = 0,SiteTotal,
	SiteNoti = Noti.O(),
	SiteOnNoti = function()
	{
		WW.Now() - SiteBegin < 1000 ||
			SiteNoti(['Loading site scripts... ',SiteCount,' / ',SiteTotal,' ',(WW.Now() - SiteBegin),'ms'])
		SiteCount < SiteTotal ||
		(
			WR.Del('Site',CrabSave),
			SiteNoti(false)
		)
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
		'.`G`{margin:20px 0}' +
		'',
		{
			h : SizeHeader,

			N : WV.NotiW,
			B : WV.ButW,

			M : WV.ID(RMain[0]),
			T : WV.ID(RMain[1]),
			C : WV.ID(RMain[2]),
			S : ClassTitleSplit,
			G : ClassMargin
		}
	))

	RTab.Add(
	[
		['Browse',function(V)
		{
			var
			Padding = 10,

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
			BriefW = WV.Rock(ClassBrief),
			Brief = WV.Rock(),
			List = WV.Rock(ClassList),
			PagerT = WV.Page(),
			PagerB = WV.Page();

			WV.Ap(Brief,BriefW)
			WV.ApR([PagerT,PagerB],List)
			WV.ApR([Keyword,BriefW,List],V)

			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`>.`I`{margin:`p`px 0;padding:0 `p`px;line-height:34px}' +
						'#`R`>.`I` input{padding-left:6px}' +
						'#`R`>.`I` .`B`{padding:0;min-width:60px}' +
						'.`E`{position:relative;margin:`p`px;padding:`p`px;`e`}' +
						'.`L`{margin:`p`px}',
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
			RToken = WV.Rock(WV.S6 + ' ' + ClassMargin),
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
			});
			WebSocketNotAuthed = function()
			{
				WebSocketNotAuthedNoti(['Unable to perform when unauthorized',WV.But(
				{
					X : 'Enter Token',
					The : WV.TheP,
					C : function()
					{
						WebSocketNotAuthedNoti(false)
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
			WV.Ap(RToken,V)
			return {
				CSS : function(ID)
				{
					return WW.Fmt
					(
						'#`R`{text-align:center}' +
						'#`R`>div{margin-left:auto;margin-right:auto;padding:20px;max-width:26em}' +
						'#`R` .`I`{margin:20px 0}',
						{
							R : ID,
							I : WV.InpW,
							T : WV.TabT,
							M : WV.FmtW
						}
					)
				},
				Hide : function(){Token.V('').Fresh(),TokenNew.V('').Fresh()}
			}
		}],
		['ShortCut',function()
		{

		}],
		['Setting',function()
		{

		}]
	])
	RTab.At(0)

	ShortCut.On('[',RTab.Prev)
		.On(']',RTab.Next)

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
			})
			WR.Each(function(B){SiteMap[WR.Up(B)] = V},[V.Name].concat(V.Alias || []))
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