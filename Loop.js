'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW;

/**@type {CrabSaveNS.Loop}*/
module.exports = Option =>
{
	var
	Setting = Option.Setting,
	DB = Option.DB,

	// Note : Must implement to ignore running resolvers before changing this to greater
	ConfigInfoLimit = 1,
	ConfigRetry = 5E3,

	MakeDelay = (H,W) =>
	{
		var
		Err,Last = WX.EndL(),
		Go = () =>
		{
			Last(Err && WW.To(Math.min(50 + 1E3 * Setting.Delay() + Err - WW.Now(),2100000000),() =>
			{
				Err = null
				W()
			}).F)
		},
		R =
		{
			D : () =>
			{
				H().Now(N =>
				{
					if (null != N && !Err | N < Err)
					{
						Err = N
						Go()
					}
				},E =>
				{
					Option.Err(__filename + ':Y',E)
					WW.To(5E3,R.D)
				})
			},
			S : () => Last && Go(),
			F : () =>
			{
				Err = null
				Go()
			}
		};
		return R
	},

	Pack = (Q,S) => WX.IsP(Q = (Option.Site.D(S).Pack || WR.Id)(Q)) ? Q : Option.Req(Q),
	SolveSize = (Q,S) => WN.ReqH(Pack(Q,S)).Map((H,T) =>
		/^2/.test(H.Code) && (T = +H.H['content-length']) === T ?
			T :
			WW.Throw(['ErrLoopSize',H.W.join('\n')])),
	PartSpecialType =
	{
		Meta : -8000,
		Cover : -7999,
	},
	PartSpecialTypeInv = WR.Inv(PartSpecialType),

	HTTP429Store = new Map,
	HTTP429Prepare = (ID,Proxy,ProxyURL) =>
	{
		var
		Store = HTTP429Store.get(ID),
		Key = Proxy && ProxyURL || false;
		Store || HTTP429Store.set(ID,Store = new Map)
		return [Store,Key]
	},
	HTTP429Check = (ID,Proxy,ProxyURL) =>
	{
		var
		Now = WW.Now(),
		[Store,Key] = HTTP429Prepare(ID,Proxy,ProxyURL),
		Last,
		After;
		Last = Store.get(Key)
		if (Last)
		{
			After = 1E3 * Setting.HTTP429() + Last[0]
			if (Now < After)
				return After
			Store.delete(Key)
			Last[1]()
		}
	},
	HTTP429CandidateLast,HTTP429CandidateCache = [],
	HTTP429Candidate = () =>
	{
		if (HTTP429CandidateLast !== (HTTP429CandidateLast = Setting.ProxyCand()))
		{
			HTTP429CandidateCache = WR.Match(/^.+:\d+$/mg,HTTP429CandidateLast)
		}
		return HTTP429CandidateCache
	},
	HTTP429Record = (ID,Proxy,ProxyURL) =>
	{
		var
		Now = WW.Now(),
		[Store,Key] = HTTP429Prepare(ID,Proxy,ProxyURL),
		Cand,
		CandCurrent,
		CandValid,
		CandCheck = Q => Store.has(Q) || (CandValid = true,Setting.ProxyURLUpdate(Q)),
		F;
		Store.has(Key) || Store.set(Key,
		[
			Now,
			WW.To(1E3,() =>
			{
				if (1E3 * Setting.HTTP429() + Now <= WW.Now())
				{
					Store.delete(Key)
					return false
				}
			},true).F
		])
		if (Proxy &&
			Setting.HTTP429Auto() &&
			Setting.Proxy() &&
			ProxyURL === Setting.ProxyURL())
		{
			Cand = HTTP429Candidate()
			CandCurrent = Cand.indexOf(ProxyURL)
			for (F = CandCurrent;!CandValid && ++F < Cand.length && CandCheck(Cand[F]););
			for (F = 0;!CandValid && F < CandCurrent && CandCheck(Cand[F]);) ++F
		}
	},

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
					var
					SettingProxy = Setting.Proxy(),
					SettingProxyURL = Setting.ProxyURL(),
					HTTP429Param = () =>
					{
						var Group = Option.Site.D(V.Site)?.IDGroup?.(V.ID);
						return [
							V.Site + (Group ? '|' + Group : ''),
							SettingProxy,
							SettingProxyURL,
						]
					},

					ExtReqRec = Option.Site.MakeReqRec(),
					ExtReq = Q => WX.Just().FMap(() =>
					{
						var ExtReqRecOnRes = ExtReqRec.OnReq(Q);
						return WN.ReqU({...Q,AC : true}).Tap(([H,B]) =>
						{
							ExtReqRecOnRes(H,B)
							if (!Q.AC && !/^[23]/.test(H.Code))
								WW.Throw(WW.Err.NetBadStatus(H.Code))
						})
					}),
					Ext =
					{
						ReqU : ExtReq,
						ReqH : Q => ExtReq(Q).Map(V => V[0]),
						ReqB : Q => ExtReq(Q).Map(V => V[1]),
					},
					Run = Option.Site.P(V.Site)
						.FMap(S => S.URL(V.ID,Ext,V))
						.FMap(U =>
						{
							var
							Meta,
							ExtReqMeta,
							Cover,
							Size = 0,
							Part = [],
							Down = [],
							DownPre = WR.Reduce((D,V) => {D[V.Part + ' ' + V.File] = V},{},V.Down),
							SolveExt = Q => (Q = WN.ExtN(Q.replace(/\?.*/,''))) && Q.length < 7 && Q,
							R;
							if (Setting.Meta())
							{
								Meta = U.Meta || ''
								if (WW.IsArr(Meta))
									Meta = Meta.join`\n`
								ExtReqMeta = ExtReqRec.Fill()
								if (ExtReqMeta?.length)
								{
									Meta = Meta ?
										Meta + '\n\n\n' + ExtReqMeta.join`\n` :
										ExtReqMeta.join`\n`
								}
								if (Meta)
								{
									Down.push(
									{
										Part : PartSpecialType.Meta,
										File : 0,
										URL : Meta,
										Ext : '.log',
										Size : 1,
									})
									++Size
								}
							}
							if (Setting.Cover())
							{
								Cover = U.Cover
								if (Cover)
								{
									Down.push(
									{
										Part : PartSpecialType.Cover,
										File : 0,
										URL : Cover,
										Ext : U.CoverExt || SolveExt(Cover) || '.jpg',
										Size : Setting.Size() ? null : 1,
									})
									Setting.Size() ?
										Size = null :
										++Size
								}
							}
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
										Ext : (WW.IsArr(P.Ext) ? P.Ext[G] : P.Ext) ||
											SolveExt(L) || P.ExtDefault || '.mp4',
										Size : L = P.Size && null != P.Size[G] ? P.Size[G] :
											(L = DownPre[F + ' ' + G]) && null != L.Done && null != L.Size ? L.Size :
											Setting.Size() ? null :
											WR.Default(1,L && L.Size)
									})
									Size = null == Size || null == L ?
										null :
										Size + L
								},P.URL)
							},U.Part)
							R =
							{
								Title : U.Title || '',
								UP : U.UP,
								UPAt : WW.IsStr(U.Date) ?
									+new Date(U.Date) :
									WR.Default(WW.Now(),U.Date),
								// Size,
								Part,
								PartTotal : WR.Default(Part.length,U.PartTotal),
								Down,
								Meta,
								Cover,
							}
							WR.All(V => V.URL && WW.IsStr(V.URL),Down) || WW.Throw(['ErrLoopURL',WC.OTJ(R)])
							return DB.SaveInfo(V.Row,R)
								.FMap(() => DB.Full(V.Row))
								.FMap(R =>
								{
									Option.OnInfo(V.Row,R)
									V.Title === R.Title || Option.OnTitle(V.Row,R.Title)
									return null == Size ?
										WX.From(Down)
											.FMapE(W => null == W.Size ?
												SolveSize(W.URL,V.Site)
													.FMap(Z => DB.SaveSize(V.Row,W.Part,W.File,Z)
														.Tap(() => Option.OnFile(V.Row,W.Part,W.File,Z))) :
												WX.Empty)
											.Fin()
											.FMap(() => DB.FillSize(V.Row)) :
										WX.Just(R.Size)
								})
								.Tap(Z => Option.OnSize(V.Row,Down.length,Z))
						}),
					Err429,
					T;

					V.Error && Option.ErrT(V.Row)
					Option.OnRenew(V.Row)

					if (T = HTTP429Check(...HTTP429Param()))
						Run = WX.Throw(Err429 = ['ErrHTTP429',WW.StrDate(T),SettingProxy && SettingProxyURL])
							.Delay(5E2)

					InfoRunning.set(V.Row,Run
						.Now(null,E =>
						{
							var
							At = WW.Now();
							if (Err429 === E ||
								WW.ErrIs(WW.Err.NetBadStatus,E) && 429 === E.Arg[0] ||
								Option.Site.D(V.Site).Is429?.(E))
							{
								HTTP429Record(...HTTP429Param())
							}
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
	/*
		Currently if all info pending tasks are `paused` and `error`, it will not trigger even after some error interval is exceeded
		Let us just treat it as a feature
	*/
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
	FormatNameCountByte = Q => Q < 0x80 ? 1 : Q < 0x0100 ? 2 : 3,
	FormatNameCountChar = () => 1,
	FormatNameSingle = (Format,O,Count,MaxLen) =>
	{
		var
		CouldReduce = new Set(['Title','PartTitle','Up']),
		Split = [],
		MapName = [],
		MapVal = [],
		Len = 0,
		R = '',
		F,G;
		Format.split`|`.forEach((V,F) =>
		{
			if (1 & F)
			{
				MapName.push(V)
				V = WR.Default(V,O[V])
				MapVal.push(V)
			}
			else
			{
				Split.push(V)
			}
			WR.Each(V => Len += Count(V.charCodeAt()),V)
		})
		for (F = MapName.length;MaxLen < Len && F;) if (CouldReduce.has(MapName[--F]))
		{
			G = MapVal[F].length
			for (;MaxLen < Len && G;)
				Len -= Count(MapVal[F].charCodeAt(--G))
			MapVal[F] = MapVal[F].slice(0,G)
		}
		F = G = 0
		for (;F < MapVal.length;++F)
			R += Split[F] + MapVal[F]
		if (F < Split.length) R += Split[F]
		if (MaxLen < Len)
		{
			F = R.length
			for (;MaxLen < Len;)
				Len -= Count(R.charCodeAt(--F))
			R = R.slice(0,F)
		}
		return R
	},
	FormatNameLenShift = new WeakMap,
	FormatName = (Format,O,Count,MaxLen) => Format.split(/([\\\/])/)
		.map((V,F) =>
		{
			var
			ShiftOpt = FormatNameLenShift.get(O),
			CurrentMaxLen = MaxLen;
			if (1 & F)
				return V
			V = V.replace(/\?([^?]+)\?/g,(_,S) =>
			{
				var
				HasHole = 0,
				Plain = '',
				Shift = '';
				S.split('|').forEach((B,G) =>
				{
					if (1 & G)
					{
						if (!O[B])
						{
							++HasHole
							Shift += ShiftOpt?.[B] ?? ''
						}
					}
					else
					{
						Plain += B
					}
				})
				if (HasHole)
					[...Plain + Shift].forEach(V => CurrentMaxLen -= Count(V))
				return HasHole ? '' : S
			})
			return FormatNameSingle(V,O,Count,CurrentMaxLen)
		}).join``,
	SolveFileNameLimit = WX.CacheL(Root =>
	{
		var
		Len = 240,
		Prefix = '~CrabSaveCheck~',
		Unicode = WN.JoinP(Root,Prefix + WR.CHR(...WR.Times(() => WW.Rnd(0x4E00,0x9FFF),Len - Prefix.length))),
		ASCII = WN.JoinP(Root,Prefix + WW.Key(Len - Prefix.length));
		return WN.MD(Root)
			.FP(WN.UW(Unicode,''))
			.FP(WN.Un(Unicode))
			.Map(() => [true,Len])
			.ErrAs(() => WN.UW(ASCII,'')
				.FP(WN.Un(ASCII))
				.Map(() => [false,Len]))
			.ErrAs(() => WX.Just([false,200]))
	}),
	SolveName = (Format,O,Root,Ext) =>
	{
		Ext = Ext || ''
		return SolveFileNameLimit(Root).Map(([IsUnicode,Len]) => WN.JoinP(Root,FormatName
		(
			Format,O,
			IsUnicode ? FormatNameCountChar : FormatNameCountByte,
			Len - Ext.length
		)) + Ext)
	},
	DownloadRunning = new Map,
	DownloadDispatching,DownloadDispatchAgain,
	DownloadDispatchOnErr = WX.EndL(),
	DownloadErrRetry = WW.ErrTmpl('Just Retry'),
	DownloadErrRenew = WW.ErrTmpl('Need To Renew | ',undefined),
	DownloadErrEmpty = WW.ErrTmpl('Received No Bytes'),
	DownloadStatus = new Map,
	DownloadDispatch = () =>
	{
		var Max = Setting.Max();
		if (!DownloadDispatching && DownloadRunning.size < Max)
		{
			DownloadDispatchOnErr()
			DownloadDispatching = true
			DB.TopQueue(Max - DownloadRunning.size,WW.Now() - 1E3 * Setting.Delay(),[...DownloadRunning.keys(),...InfoRunning.keys()]).Now(Q =>
			{
				WR.Each(V =>
				{
					var
					Has = V.Has,
					TaskIsSingleMultiPart =
					{
						BiliBili : ID => /^\d+#\d+$/.test(ID),
					},
					SolvePart = /**@type {WishNS.TypeR<CrabSaveNS.DB>['ViewPart']}*/ (Row,Part) => Part < 0 ?
						TaskIsSingleMultiPart[V.Site]?.(V.ID) ?
							DB.ViewPart(Row,false).Map(WR.Pick(['Total','Part','Title'])) :
							DB.ViewPart(Row,false).Map(V => V ? WR.Pick(['Total'],V) : {}) :
						DB.ViewPart(Row,Part),
					Working,
					EmptyRetry = 0;
					DownloadStatus.set(V.Row,H =>
					{
						H(Working ? Has + Working.Calc().Saved : Has)
						H(Working ? Working.Info.Speed : 0)
					})
					V.Error && Option.ErrT(V.Row)
					DownloadRunning.set(V.Row,WX.TCO(() =>
						DB.TopToDown(V.Row).FMap(Down => Down ?
							SolvePart(V.Row,Down.Part).FMap(Part =>
							{
								var
								Site = Option.Site.D(V.Site),
								UPAt = new Date(V.UPAt),
								NameO =
								{
									Site : V.Site,
									ID : WR.SafeFile(Site.IDView ? Site.IDView(V.ID) : V.ID),
									Title : WR.SafeFile(V.Title || ''),
									Up : WR.SafeFile(V.UP || '[Anonymous]'),
									Date : WW.StrDate(UPAt,WW.DateDotS),
									Y : UPAt.getFullYear(),
									M : WW.Pad02(-~UPAt.getMonth()),
									D : WW.Pad02(UPAt.getDate()),
									H : WW.Pad02(UPAt.getHours()),
									N : WW.Pad02(UPAt.getMinutes()),
									S : WW.Pad02(UPAt.getSeconds()),
									MS : WW.Pad03(UPAt.getMilliseconds()),
									PartIndex : WR.Has('Part',Part) ?
										1 < Part.Total && WR.PadL(Part.Total,Part.Part) :
										'',
									PartTitle : WR.SafeFile(Part.Title || ''),
									FileIndex : 1 < Part.File &&
										Down.ExtCount !== Part.File &&
										WR.PadL(Part.File,Down.File),
									Type : PartSpecialTypeInv[Down.Part],
								},
								SizeChanged;
								FormatNameLenShift.set(NameO,
								{
									PartIndex : 1 < Part.Total && '' + ~-Part.Total,
								})
								return SolveName(V.Format,NameO,V.Root,Down.Ext).FMap(Dest => WN.MakeDir(WN.DirN(Dest)).FMap(() => WX.Provider(O =>
								{
									var
									OnSize = Q =>
									{
										Down.Size === (Down.Size = Q) ||
											NotBigDeal(DB.NewSize(Down.Task,Down.Part,Down.File,Q)
												.Tap(S =>
												{
													Option.OnFile(Down.Task,Down.Part,Down.File,Q)
													Option.OnSize(Down.Task,null,S)
												}))
									},
									LowSpeedCount = 0,
									RefSpeed = Site.RefSpeed ? 1024 * Site.RefSpeed / 1E3 : 0,
									ReqObs = PartSpecialType.Meta === Down.Part ?
										WX.Just(Down.URL) :
										Pack(Down.URL,V.Site),
									Work = WN.Down(
									{
										Req : !WX.IsP(ReqObs) && ReqObs,
										Obs : WX.IsP(ReqObs) && ReqObs,
										Path : Dest,
										Last : Down.Path && WN.JoinP(V.Root,Down.Path),
										Fresh : SizeChanged || !Down.Path,
										Only200 : true,
										ForceRange : WR.Default(true,Site.Range),
										AutoUnlink : true,
										Interval : 1E3
									}).On('Connected',() =>
									{
										Has -= Down.Has
										Down.Has = 0
										Working = Work
										if (null == Down.First) Down.First = Work.Info.Start
										Option.OnConn(Down.Task,Down.Part,Down.File,Down.First)
										NotBigDeal(DB.SaveConn(Down.Task,Down.Part,Down.File,Down.First))
									}).On('Size',OnSize).On('Path',P =>
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
										Option.OnHas(Down.Task,Down.Part,Down.File,Q.Saved,D)
										NotBigDeal(DB.SaveHas(Down.Task,Down.Part,Down.File,Q.Saved,D))
										if (RefSpeed)
										{
											if (Q.Speed < RefSpeed)
											{
												if (DownloadLowSpeedConfCount < ++LowSpeedCount &&
													DownloadLowSpeedTrigger(V.Row))
												{
													OnEnd()
													O.E(DownloadErrRenew('Low Speed'))
												}
											}
											else LowSpeedCount = 0
										}
									}).On('Done',() =>
									{
										var
										Path = WN.JoinP(V.Root,Down.Path),
										Done = WW.Now(),
										Size = Work.Info.Total || Work.Info.Saved;
										if (!Size)
										{
											OnEnd()
											O.E(EmptyRetry ? DownloadErrEmpty() : DownloadErrRetry())
											++EmptyRetry
											NotBigDeal(WN.Stat(Path)
												.FMap(S => S.size ? WX.Empty : WN.Un(Path)))
											return
										}
										OnSize(Size)
										OnEnd()
										Option.OnDone(Down.Task,Down.Part,Down.File,Done)
										DB.SaveDone(Down.Task,Down.Part,Down.File,Done,PartSpecialType.Meta === Down.Part)
											.Now(null,O.E,O.F)
									}).On('Die',E =>
									{
										var
										ShouldRenew = WW.ErrIs(WW.Err.NetBadStatus,E) ||
											WW.ErrIs(WW.Err.ReqCloseBeforeEnd,E) ||
											WW.ErrIs(WW.Err.NetTimeout,E) && (!Working || Work.Info.Begin === Work.Info.Saved) ||
											'ECONNREFUSED' === E?.code;
										SizeChanged = WW.ErrIs(WW.Err.DownSizeChange,E) ||
											WW.ErrIs(WW.Err.NetBadStatus,E) && 416 == E.Arg[0];
										OnEnd()
										SizeChanged || Work.Info.Begin < Work.Info.Saved ?
											O.E(DownloadErrRetry()) :
											ShouldRenew ?
												O.E(DownloadErrRenew(String(E))) :
												O.E(E)
									}),
									OnEnd = () =>
									{
										if (Working)
										{
											Has += Down.Has = Work.Info.Saved
											Working = 0
										}
										if (Work.Info.Begin < Work.Info.Saved)
										{
											Down.Take += WW.Now() - Work.Info.Start
											Option.OnTake(Down.Task,Down.Part,Down.File,Down.Take)
											NotBigDeal(DB.SaveTake(Down.Task,Down.Part,Down.File,Down.Take))
										}
									};
									SizeChanged = false
									++Down.Play
									Option.OnPlay(Down.Task,Down.Part,Down.File,Down.Play)
									NotBigDeal(DB.SavePlay(Down.Task,Down.Part,Down.File,Down.Play))
									return Work.Stop
								}).RetryWhen(E => E.Tap(E =>
								{
									WW.ErrIs(DownloadErrRetry,E) || WW.Throw(E)
								}))))
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
							Next = WW.ErrIs(DownloadErrRenew,E) ? 2 : 1;
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
	DownloadEnd = (Q,SuppressDispatch) =>
	{
		var
		HasChanged,
		Del = Q =>
		{
			DownloadRunning.get(Q)()
			DownloadRunning.delete(Q)
			DownloadStatus.delete(Q)
			HasChanged = true
		};
		WW.IsArr(Q) ?
			DownloadRunning.forEach((_,F) =>
				Q[0] <= F && F < Q[1] && Del(F)) :
			DownloadRunning.has(Q) && Del(Q)
		if (HasChanged)
		{
			SuppressDispatch || DownloadDispatch()
			Option.OnEnd()
		}
	},
	DownloadLowSpeedConfCount = 120,
	DownloadLowSpeedConfTrigger = 2,
	DownloadLowSpeedConfRest = 18E5,
	DownloadLowSpeedRec = new Map,
	DownloadLowSpeedTrigger = ID =>
	{
		var
		T = DownloadLowSpeedRec.get(ID);
		T || DownloadLowSpeedRec.set(ID,T = [0,null])
		return T[0] < DownloadLowSpeedConfTrigger &&
		(
			T[1] && T[1](),
			T[1] = WW.To(DownloadLowSpeedConfRest,() => DownloadLowSpeedRec.delete(ID)).F,
			++T[0]
		)
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
		Stop : (Q,SuppressDispatch) =>
		{
			DownloadEnd(Q,SuppressDispatch)
		},

		OnSet : () =>
		{
			InfoDelay.S()
			DownloadDelay.S()
			DownloadDispatch()
		},
	}
}