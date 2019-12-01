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

	SolveSize = (Q,S) => WN.ReqH((SiteAll.D(S).Pack || WR.Id)(Q)).Map((H,T) =>
		/^2/.test(H.statusCode) && (T = +H.headers['content-length']) === T ?
			T :
			WW.Throw('Failed to resolve size\n' + H.rawHeaders.join('\n'))),

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
							DB.Err(V.Row,2,WW.Now()).Now(null,O =>
							{
								Option.Err(__filename,O)
								InfoRunning.delete(V.Row)
								InfoDispatch()
							},() =>
							{
								Option.ErrT(V.Row,E)
								InfoRunning.delete(V.Row)
								InfoDispatch()
							})
						},() =>
						{
							InfoRunning.delete(V.Row)
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
		else InfoDispatchAgain = true
	},



	DownloadDispatch = () =>
	{
	};

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
	}
}