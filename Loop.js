'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,N : WN} = WW;

/**@type {CrabSaveNS.Loop}*/
module.exports = Option =>
{
	var
	SiteAll = Option.Site,
	Setting = Option.Setting,
	DB = Option.DB,

	ConfigInfoLimit = 1,
	ConfigRetry = 5E3,

	MakeDelay = (H,W) =>
	{
		var Err,Last;
		return {
			D : () =>
			{
				H().Now(N =>
				{
					if (null != N && !Err | N < Err)
					{
						Last && clearTimeout(Last)
						Err = N
						Last = setTimeout(W,50 + 1E3 * Setting.Delay() + Err - WW.Now())
					}
				},WW.O)
			},
			S : () =>
			{
				if (Last)
				{
					clearTimeout(Last)
					Last = setTimeout(W,50 + 1E3 * Setting.Delay() + Err - WW.Now())
				}
			},
			F : () =>
			{
				Last && clearTimeout(Last)
				Err = null
			}
		}
	},

	SolveSize = (Q,S) => WN.ReqH(Option.Req((SiteAll.D(S).Pack || WR.Id)(Q))).Map((H,T) =>
		/^2/.test(H.statusCode) && (T = +H.headers['content-length']) === T ?
			T :
			WW.Throw(['ErrLoopSize',H.rawHeaders.join('\n')])),

	InfoRunning = new Map,
	InfoDispatching,InfoDispatchAgain,
	InfoDispatchOnErr = WX.EndL(),
	InfoDispatch = () =>
	{
		if (!InfoDispatching && InfoRunning.size < ConfigInfoLimit)
		{
			InfoDispatchOnErr()
			InfoDispatching = true
			DB.TopNoSize(1,WW.Now() - 1E3 * Setting.Delay()).Now(Q =>
			{
				WR.Each(V =>
				{
					Option.OnRenew(V.Row)
					Option.ErrT(V.Row)
					InfoRunning.set(V.Row,SiteAll.P(V.Site)
						.FMap(S => S.URL(V.ID))
						.FMap(U =>
						{
							var
							Size = 0,
							Part = [],
							Down = [],
							R;
							WR.EachU((P,F) =>
							{
								Part.push(
								{
									Part : F = WR.Default(F,P.Index),
									Title : P.Title || null
								})
								WR.EachU((L,G) =>
								{
									Down.push(
									{
										Part : F,
										File : G,
										URL : L,
										Ext : WW.IsArr(P.Ext) ? P.Ext[G] : P.Ext,
										Size : P.Size ? P.Size[G] : null
									})
									null != Size && P.Size && null != P.Size[G] ?
										Size += P.Size[G] :
										Size = null
								},P.URL)
							},U.Part)
							R =
							{
								Title : U.Title,
								UP : U.Up,
								UPAt : WR.Default(WW.Now(),U.Date),
								Size,
								Part,
								Down
							}
							// Optimize : We could omit full reading and size resolving for downloaded files
							return DB.SaveInfo(V.Row,R)
								.FMap(() => DB.Full(V.Row))
								.Tap(R => Option.OnInfo(V.Row,R))
								.FMap(() => null == Size ?
									WX.From(Down)
										.FMapO(1,W => null == W.Size ?
											SolveSize(W.URL,V.Site)
												.FMap(Z => DB.SaveSize(V.Row,W.Part,W.File,Z)
													.Tap(() => Option.OnFile(V.Row,W.Part,W.File,Z))) :
											WX.Empty)
										.Fin()
										.FMap(() => DB.FillSize(V.Row))
										.Tap(Z => Option.OnSize(V.Row,Z,Down.length)) :
									WX.Empty)
						})
						.Now(null,E =>
						{
							var At = WW.Now();
							DB.Err(V.Row,2,At).Now(null,O =>
							{
								InfoRunning.delete(V.Row)
								Option.OnRenewDone(V.Row)
								Option.Err(__filename,O)
								InfoDispatch()
							},() =>
							{
								InfoRunning.delete(V.Row)
								Option.OnRenewDone(V.Row)
								Option.ErrT(V.Row,E,2,At)
								InfoDispatch()
							})
						},() =>
						{
							InfoRunning.delete(V.Row)
							Option.OnRenewDone(V.Row)
							InfoDispatch()
							DownloadDispatch()
						}))
				},Q)
				InfoDispatching = false
				if (InfoDispatchAgain)
				{
					InfoDispatchAgain = false
					InfoDispatch()
				}
				else
				{
					InfoRunning.size < ConfigInfoLimit ?
						InfoDelay.D() :
						InfoDelay.F()
				}
			},E =>
			{
				InfoDispatching = false
				Option.Err(__filename,E)
				InfoDispatchOnErr(WW.To(ConfigRetry,() =>
				{
					InfoDispatching ||
						InfoDispatch()
				}).F)
			})
		}
		else if (InfoDispatching) InfoDispatchAgain = true
	},
	InfoDelay = MakeDelay(() => DB.TopErr(2),InfoDispatch),



	DownloadDispatch = () =>
	{
	},
	DownloadDelay = MakeDelay(() => DB.TopErr(1),DownloadDispatch);

	return {
		Info : InfoDispatch,
		Del : Q =>
		{
			if (InfoRunning.has(Q))
			{
				InfoRunning.delete(Q)
				InfoDispatch()
			}
		},
		Renewing : () => [...InfoRunning.keys()],

		OnSet : () =>
		{
			InfoDelay.S()
			DownloadDelay.S()
		},
	}
}