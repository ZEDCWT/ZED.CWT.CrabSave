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

	// Note : Must implement to ignore running resolvers before changing this to greater
	ConfigInfoLimit = 1,
	ConfigRetry = 5E3,

	MakeDelay = (H,W) =>
	{
		var
		Err,Last,
		Go = () =>
		{
			Last && clearTimeout(Last)
			Last = Err && setTimeout(W,Math.min(50 + 1E3 * Setting.Delay() + Err - WW.Now(),2100000000))
		};
		return {
			D : () =>
			{
				H().Now(N =>
				{
					if (null != N && !Err | N < Err)
					{
						Err = N
						Go()
					}
				},WW.O)
			},
			S : () => Last && Go(),
			F : () =>
			{
				Err = null
				Go()
			}
		}
	},

	Pack = (Q,S) => Option.Req((SiteAll.D(S).Pack || WR.Id)(Q)),
	SolveSize = (Q,S) => WN.ReqH(Pack(Q,S)).Map((H,T) =>
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
					V.Error && Option.ErrT(V.Row)
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
									File : P.URL.length,
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
								PartTotal : WR.Default(Part.length,U.PartTotal),
								Down
							}
							// Optimize : We could omit full reading and size resolving for downloaded files
							return DB.SaveInfo(V.Row,R)
								.FMap(() => DB.Full(V.Row))
								.Tap(R =>
								{
									Option.OnInfo(V.Row,R)
									V.Title === R.Title || Option.OnTitle(V.Row,R.Title)
								})
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
									(
										Option.OnSize(V.Row,Size,Down.length),
										WX.Empty
									))
						})
						.Now(null,E =>
						{
							var At = WW.Now();
							InfoRunning.set(V.Row,DB.Err(V.Row,2,At).Now(null,O =>
							{
								InfoRunning.delete(V.Row)
								Option.OnRenewDone(V.Row)
								Option.Err(__filename + ':IE',O)
								InfoDispatch()
							},() =>
							{
								InfoRunning.delete(V.Row)
								Option.OnRenewDone(V.Row)
								Option.ErrT(V.Row,E,2,At)
								InfoDispatch()
							}))
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
				Option.Err(__filename + ':I',E)
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
	InfoEnd = Q =>
	{
		if (InfoRunning.has(Q))
		{
			InfoRunning.get(Q)()
			InfoRunning.delete(Q)
			InfoDispatch()
		}
	},



	NotBigDeal = Q => Q.Now(null,E => Option.Err(__filename + ':B',E)),

	DownloadRunning = new Map,
	DownloadDispatching,DownloadDispatchAgain,
	DownloadDispatchOnErr = WX.EndL(),
	DownloadErrRetry = new Error('Just Retry'),
	DownloadErrRenew = new Error('Need To Renew'),
	DownloadStatus = new Map,
	DownloadDispatch = () =>
	{
		var Max = Setting.Max();
		if (!DownloadDispatching && DownloadRunning.size < Max)
		{
			DownloadDispatchOnErr()
			DownloadDispatching = true
			DB.TopQueue(Max - DownloadRunning.size,WW.Now() - 1E3 * Setting.Delay(),[...DownloadRunning.keys()]).Now(Q =>
			{
				WR.Each(V =>
				{
					var
					Has = V.Has,
					Working;
					DownloadStatus.set(V.Row,H => ' ' + H(Working ? Has + Working.Calc().Saved : Has) +
						' ' + H(Working ? Working.Info.Speed : 0))
					V.Error && Option.ErrT(V.Row)
					DownloadRunning.set(V.Row,WX.TCO(() =>
						DB.TopToDown(V.Row).FMap(Down => Down ?
							DB.ViewPart(V.Row,Down.Part).FMap(Part =>
							{
								var
								UPAt = new Date(V.UPAt),
								NameO =
								{
									ID : WR.SafeFile(V.ID),
									Title : WR.SafeFile(V.Title) || '[Untitled]',
									Up : WR.SafeFile(V.UP),
									Date : WW.StrDate(UPAt,WW.DateDotS),
									Y : UPAt.getFullYear(),
									M : WW.Pad02(-~UPAt.getMonth()),
									D : WW.Pad02(UPAt.getDate()),
									H : WW.Pad02(UPAt.getHours()),
									N : WW.Pad02(UPAt.getMinutes()),
									S : WW.Pad02(UPAt.getSeconds()),
									MS : WW.Pad03(UPAt.getMilliseconds()),
									PartIndex : 1 < Part.Total && WR.PadU(Down.Part,Part.Total),
									PartTitle : WR.SafeFile(Part.Title || ''),
									FileIndex : 1 < Part.File && WR.PadU(Down.File,Part.File),
								},
								Name = WW.Fmt
								(
									V.Format.replace(/\?([^?]+)\?/g,
										(Q,S) => WW.MR((D,V) => D && NameO[V[1]],true,/\|([^|]+)\|/,Q) ? S : ''),
									NameO,'|'
								) + (Down.Ext || ''),
								Dest = WN.JoinP(V.Root,Name);
								return WX.Provider(O =>
								{
									var
									Work = WN.Download(
									{
										Req : Pack(Down.URL,V.Site),
										Path : Dest,
										Last : Down.Path && WN.JoinP(V.Root,Down.Path),
										Fresh : !Down.Path,
										Only200 : true,
										ForceRange : true,
										Interval : 1E3
									}).On('Connected',() =>
									{
										Has -= Down.Has
										Down.Has = 0
										Working = Work
										if (null == Down.First) Down.First = Work.Info.Start
										Option.OnConn(Down.Task,Down.Part,Down.File,Down.First)
										NotBigDeal(DB.SaveConn(Down.Task,Down.Part,Down.File,Down.First))
									}).On('Path',P =>
									{
										P = WN.RelP(V.Root,P)
										if (P !== Down.Path)
										{
											Down.Path = P
											Option.OnPath(Down.Task,Down.Part,Down.File,P)
											NotBigDeal(DB.SavePath(Down.Task,Down.Part,Down.File,P))
										}
									}).On('Data',Q =>
									{
										var D = Down.Take + WW.Now() - Work.Info.Start
										Option.OnHas(Down.Task,Down.Part,Down.File,[Q.Saved,D])
										NotBigDeal(DB.SaveHas(Down.Task,Down.Part,Down.File,Q.Saved,D))
									}).On('Done',() =>
									{
										var Done = WW.Now();
										OnEnd()
										Option.OnDone(Down.Task,Down.Part,Down.File,Done)
										DB.SaveDone(Down.Task,Down.Part,Down.File,Done)
											.Now(null,O.E,O.F)
									}).On('Die',E =>
									{
										OnEnd()
										;/Status not satisfied/.test(E) ?
											O.E(DownloadErrRenew) :
											Work.Info.Begin < Work.Info.Saved ?
												O.E(DownloadErrRetry) :
												O.E(E)
									}),
									OnEnd = () =>
									{
										Has += Down.Has = Work.Info.Saved
										Working = 0
										if (Work.Info.Begin < Work.Info.Saved)
										{
											Down.Take += WW.Now() - Work.Info.Start
											Option.OnTake(Down.Task,Down.Part,Down.File,Down.Take)
											NotBigDeal(DB.SaveTake(Down.Task,Down.Part,Down.File,Down.Take))
										}
									};
									++Down.Play
									Option.OnPlay(Down.Task,Down.Part,Down.File,Down.Play)
									NotBigDeal(DB.SavePlay(Down.Task,Down.Part,Down.File,Down.Play))
									return Work.Stop
								}).RetryWhen(E => E.Tap(E =>
								{
									E === DownloadErrRetry || WW.Throw(E)
								}))
							}).Fin().Map(() => [true]) :
							WX.Just([false])))
						.FMap(() =>
						{
							var Done = WW.Now();
							return DB.Final(V.Row,Done)
								.Tap(() => Option.OnFinal(V.Row,Done))
						})
						.Now(null,E =>
						{
							var
							At = WW.Now(),
							Next = DownloadErrRenew === E ? 2 : 1;
							DownloadRunning.set(V.Row,DB.Err(V.Row,Next,At).Now(null,O =>
							{
								DownloadRunning.delete(V.Row)
								DownloadStatus.delete(V.Row)
								Option.OnEnd()
								Option.Err(__filename + ':DE',O)
								DownloadDispatch()
							},() =>
							{
								DownloadRunning.delete(V.Row)
								DownloadStatus.delete(V.Row)
								Option.OnEnd()
								Option.ErrT(V.Row,E,Next,At)
								DownloadDispatch()
								2 === Next && InfoDispatch()
							}))
						},() =>
						{
							DownloadRunning.delete(V.Row)
							DownloadStatus.delete(V.Row)
							Option.OnEnd()
							DownloadDispatch()
						}))
				},Q)
				DownloadDispatching = false
				if (DownloadDispatchAgain)
				{
					DownloadDispatchAgain = false
					DownloadDispatch()
				}
				else
				{
					DownloadRunning.size < Setting.Max() ?
						DownloadDelay.D() :
						DownloadDelay.F()
				}
			},E =>
			{
				DownloadDispatching = false
				Option.Err(__filename + ':D',E)
				DownloadDispatchOnErr(WW.To(ConfigRetry,() =>
				{
					DownloadDispatching ||
						DownloadDispatch()
				}).F)
			})
		}
		else
		{
			if (Max < DownloadRunning.size)
			{
				WR.EachU((V,F) =>
				{
					if (Max <= F)
					{
						V[1]()
						DownloadRunning.delete(V[0])
						DownloadStatus.delete(V[0])
					}
				},DownloadRunning)
				Option.OnEnd()
			}
			if (DownloadDispatching) DownloadDispatchAgain = true
		}
	},
	DownloadDelay = MakeDelay(() => DB.TopErr(1),DownloadDispatch),
	DownloadEnd = Q =>
	{
		if (DownloadRunning.has(Q))
		{
			DownloadRunning.get(Q)()
			DownloadRunning.delete(Q)
			DownloadStatus.delete(Q)
			DownloadDispatch()
			Option.OnEnd()
		}
	};

	return {
		Info : InfoDispatch,
		Down : DownloadDispatch,
		Del : Q =>
		{
			InfoEnd(Q)
			DownloadEnd(Q)
		},
		Renewing : () => [...InfoRunning.keys()],
		Downloading : DownloadStatus,
		Stop : Q =>
		{
			DownloadEnd(Q)
		},

		OnSet : () =>
		{
			InfoDelay.S()
			DownloadDelay.S()
			DownloadDispatch()
		},
	}
}