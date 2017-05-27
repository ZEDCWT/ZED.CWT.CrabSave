'use strict'
var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Util = require('./Util'),
Bus = Util.Bus,
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Event = require('./Event'),
EventQueue = Event.Queue,
EventDownload = Event.Download,
Lang = require('./Lang'),
Site = require('./Site'),
Download = require('./Download'),
DB = require('./DB'),

Max = 5,
WaitDisplay = 180,
Wait = 1000 * WaitDisplay,

DBAllowMulti = {multi : Util.T},
DBExistFalse = {$exists : Util.F},
QueryNoSize = ZED.objOf(KeyQueue.Size,DBExistFalse),
QuerySetActiveTrue = {$set : ZED.objOf(KeyQueue.Active,Util.T)},
QuerySetActiveFalse = {$set : ZED.objOf(KeyQueue.Active,Util.F)},

Online = [],
OnlineMap = {},
ActiveMap = {},
Offline = [],
OfflineMap = {},
CardMap = {},
CardMapUp = Q => CardMap[Q] ? ++CardMap[Q] : CardMap[Q] = 1,
OnSizeMap = {},
OffSizeMap = {},
OnlineCount = 80000000 - 1,
Loaded = 0,
OnlineDB = DB('Online',() =>
{
	OnlineDB.Each((V,U) =>
	{
		OnlineCount < V._id && (OnlineCount = V._id)
		U = V[KeyQueue.Unique]
		Online.push(U)
		OnlineMap[U] = Util.T
		V[KeyQueue.Active] && (ActiveMap[U] = Util.T)
		OnSizeMap[U] = V[KeyQueue.Size]
	})
	++Loaded
	Bus.emit(EventQueue.First,Online.length)
},[[KeyQueue.Unique,Util.T]]),
OnlineData = OnlineDB.Data,
OnlineUpdate = Observable.wrapNode(OnlineData.update,OnlineData),
OfflineDB = DB('Offline',() =>
{
	OfflineDB.EachRight((V,U) =>
	{
		OnlineCount < V._id && (OnlineCount = V._id)
		U = V[KeyQueue.IDHis]
		Offline.push(U)
		OfflineMap[U] = Util.T
		CardMapUp(V[KeyQueue.Unique])
		OffSizeMap[U] = V[KeyQueue.Size]
	},KeyQueue.Finished)
	++Loaded
	Bus.emit(EventQueue.First)
},[[KeyQueue.IDHis,Util.T],[KeyQueue.Finished,Util.F]]),
OfflineData = OfflineDB.Data,



NewMap = {},
New = (Q,X) =>
{
	var R = [],C,T,F;
	if (2 !== Loaded) return 0
	for (F = 0;F < Q.length;++F)
	{
		T = Q[F]
		C = T[KeySite.Unique]
		if (!NewMap[C] && !OnlineMap[C])
		{
			NewMap[C] = Util.T
			R.push(ZED.ReduceToObject
			(
				{_id : ++OnlineCount},
				KeyQueue.Unique,C,
				KeyQueue.Name,T[KeySite.Name],
				KeyQueue.ID,T[KeySite.ID],
				KeyQueue.Title,T[KeySite.Title],
				KeyQueue.Created,ZED.now(),
				KeyQueue.Active,Util.T
			))
		}
	}
	if (R.length) OnlineData.insert(R,E =>
	{
		if (E)
		{
			Bus.emit(EventQueue.ENew,E)
			for (F = R.length;F;) ZED.delete_(R[--F][KeyQueue.Unique],NewMap)
		}
		else
		{
			for (F = 0;F < R.length;++F)
			{
				T = R[F][KeyQueue.Unique]
				Online.push(T)
				ZED.delete_(T,NewMap)
				ZED.delete_(T,OnSizeMap)
				ActiveMap[T] =
				OnlineMap[T] = Util.T
			}
			Bus.emit(EventQueue.Change,Online.length)
			Bus.emit(EventQueue.Newed,R,X)
			Dispatch()
		}
	})
	return R.length
},
Convert = (Q,M,O,S,J) =>
{
	var R = [],T,F;
	O = O || OnlineMap
	for (F in Q)
	{
		T = Q[F]
		if (T && O[T] && !M[T] && (!S || (J ^ S[T])))
		{
			M[T] = Util.T
			R.push(T)
		}
	}
	return R
},
MakeIn = (Q,K,R) =>
(
	R = {},
	R[K || KeyQueue.Unique] = {$in : Q},
	R
),
PlayMap = {},
Play = (Q,X) =>
{
	var R = Convert(Q,PlayMap,OnlineMap,ActiveMap,1),F;
	R.length && OnlineData.update(MakeIn(R),QuerySetActiveTrue,DBAllowMulti,E =>
	{
		if (E)
		{
			Bus.emit(EventQueue.EAction,Lang.Restart,E)
			for (F = R.length;F;) ZED.delete_(R[--F],PlayMap)
		}
		else
		{
			for (F = R.length;F;)
			{
				ZED.delete_(R[--F],PlayMap)
				ActiveMap[R[F]] = Util.T
			}
			Bus.emit(EventQueue.Played,R,X)
			Dispatch()
		}
	})
	return R.length
},
PauseMap = {},
InnerPause = Q =>
{
	if (Running[Q])
	{
		--Current
		ZED.delete_(Q,Running)
	}
	Download.Pause(Q)
},
ClearDebuff = (M,T,F) =>
{
	for (F = ReinfoQueue.length;F;) if (M[T = ReinfoQueue[--F]])
	{
		ReinfoQueue.splice(F,1)
		ZED.delete_(T,ReinfoMap)
	}
	for (F = ErrorQueue.length;F;) if (M[T = ErrorQueue[--F]])
	{
		ErrorQueue.splice(F,1)
		ZED.delete_(T,ErrorMap)
	}
	for (F = DispatchInfoPreemptive.length;F;)
		if (M[T = DispatchInfoPreemptive[--F]])
			DispatchInfoPreemptive.splice(F,1)
},
Pause = (Q,X) =>
{
	var R = Convert(Q,PauseMap,OnlineMap,ActiveMap,0),M,T,F;

	R.length && OnlineData.update(MakeIn(R),QuerySetActiveFalse,DBAllowMulti,E =>
	{
		if (E)
		{
			Bus.emit(EventQueue.EAction,Lang.Pause,E)
			for (F = R.length;F;) ZED.delete_(R[--F],PauseMap)
		}
		else
		{
			M = {}
			for (F = R.length;F;)
			{
				T = R[--F]
				M[T] = Util.T
				ZED.delete_(T,PauseMap)
				ZED.delete_(T,ActiveMap)
				Q = Download.Active[T]
				if (Q)
				{
					Q = Q.Q
					Q[KeyQueue.Active] = Util.F
					OnlineData.update({_id : Q._id},Q)
					Bus.emit(EventQueue.PauseShow,Q)
				}
				Running[T] && InnerPause(T)
			}
			ClearDebuff(M)
			Bus.emit(EventQueue.Paused,R,X)
			Dispatch()
		}
	})
	return R.length
},
RemoveMap = {},
Remove = (Q,X) =>
{
	var R = Convert(Q,RemoveMap),M,T,F;
	R.length && OnlineData.remove(MakeIn(R),DBAllowMulti,E =>
	{
		if (E)
		{
			Bus.emit(EventQueue.EAction,Lang.Remove,E)
			for (F = R.length;F;) ZED.delete_(R[--F],RemoveMap)
		}
		else
		{
			M = {}
			for (F = R.length;F;)
			{
				T = R[--F]
				M[T] = Util.T
				ZED.delete_(T,RemoveMap)
				ZED.delete_(T,OnlineMap)
				Running[T] && InnerPause(T)
			}
			ClearDebuff(M)
			Online.length = 0
			OnlineDB.Each(V => Online.push(V[KeyQueue.Unique]))
			Bus.emit(EventQueue.Change,Online.length)
				.emit(EventQueue.Removed,R,X)
			Dispatch()
		}
	})
	return R.length
},

ReinfoMap = {},
ReinfoQueue = [],
ReinfoLook = (R,C,T,F) =>
{
	R = []
	for (F = ReinfoQueue.length;F;)
	{
		T = ReinfoQueue[--F]
		C = ReinfoMap[T] + Wait - ZED.now()
		if (0 < C) Bus.emit(EventQueue.ReinfoLook,T,C / 1000)
		else
		{
			Bus.emit(EventQueue.RRefresh,T)
			ZED.delete_(T,ReinfoMap)
			ReinfoQueue.splice(F,1)
			R.push(T)
		}
	}
	for (F = 0;F < R.length;++F) DispatchInfoPreemptive.push(R[F])
	F && (InfoNow || DispatchInfo())
},
ReinfoUpdate = ID =>
{
	ReinfoMap[ID] = ZED.now()
	ReinfoQueue.push(ID)
	InnerPause(ID)
	Bus.emit(EventQueue.Reinfo,ID,WaitDisplay)
	Dispatch()
},
Reinfo = (Q,ID) =>
{
	ID = Q[KeyQueue.Unique]
	ReinfoMap[ID] || OnlineData.update
	(
		{_id : Q._id},Q,
		E => E ? Error(Q,E) : ReinfoUpdate(ID)
	)
},
ErrorMap = {},
ErrorQueue = [],
ErrorLook = (R,C,T,F) =>
{
	for (F = R = ErrorQueue.length;F;)
	{
		T = ErrorQueue[--F]
		C = ErrorMap[T] + Wait - ZED.now()
		if (0 < C) Bus.emit(EventQueue.ErrorLook,T,C / 1000)
		else
		{
			Bus.emit(EventQueue.ErrorEnd,T)
			ZED.delete_(T,ErrorMap)
			ErrorQueue.splice(F,1)
		}
	}
	R === ErrorQueue.length || Dispatch()
},
ErrorOn = (ID,E,J) =>
{
	Util.Debug(__filename,E)
	ErrorMap[ID] = ZED.now()
	ErrorQueue.push(ID)
	InnerPause(ID)
	Dispatch()
	Bus.emit(EventQueue.Error,ID,WaitDisplay,J)
},
Error = (Q,E,ID) =>
{
	ID = Q[KeyQueue.Unique]
	ErrorMap[ID] || OnlineData.update({_id : Q._id},Q,EE =>
	{
		ErrorOn(ID,E)
		EE && Util.Debug(__filename,EE)
	})
},

FinishQueue = [],
Finishing,
Finish = (Q,T,F) =>
{
	if (Q)
	{
		Q[KeyQueue.IDHis] = Q[KeyQueue.Unique] + '.' + ZED.now() + '.' + ZED.Code.MD5(Math.random()).substr(0,8)
		Q[KeyQueue.Finished] = ZED.now()
		ZED.delete_(KeyQueue.Active,Q)
		ZED.delete_(KeyQueue.Format,Q)
		ZED.delete_(KeyQueue.Root,Q)
		FinishQueue.unshift(Q)
	}
	if (!Finishing && FinishQueue.length)
	{
		Finishing = Util.T
		Q = FinishQueue
		FinishQueue = []
		OfflineData.insert(Q,E =>
		{
			if (E)
			{
				Finishing = Util.F
				Bus.emit(EventQueue.EFinish,E)
			}
			else
			{
				for (F = Q.length;F;)
				{
					T = Q[--F]
					Offline.unshift(T[KeyQueue.IDHis])
					OfflineMap[T[KeyQueue.IDHis]] = Util.T
					OffSizeMap[T[KeyQueue.IDHis]] = T[KeyQueue.Size]
					CardMapUp(T[KeyQueue.Unique])
				}
				Bus.emit(EventQueue.FHis)
				OnlineData.remove({_id : {$in : ZED.pluck('_id',Q)}},DBAllowMulti,E =>
				{
					Finishing = Util.F
					if (E) Bus.emit(EventQueue.EFinish,E)
					else
					{
						for (F = Q.length;F;)
						{
							T = Q[--F][KeyQueue.Unique]
							Running[T] && --Current
							ZED.delete_(T,Running)
							ZED.delete_(T,OnlineMap)
							Bus.emit(EventQueue.Finish,Q[F])
						}
						Online.length = 0
						OnlineDB.Each(V => Online.push(V[KeyQueue.Unique]))
						Bus.emit(EventQueue.Change,Online.length)
							.emit(EventQueue.FHot)
						Finish()
						Dispatch()
					}
				})
			}
		})
	}
},
HRemoveMap = {},
HRemove = (Q,X) =>
{
	var R = Convert(Q,HRemoveMap,OfflineMap),T,F;
	R.length && OfflineData.remove(MakeIn(R,KeyQueue.IDHis),DBAllowMulti,E =>
	{
		if (E)
		{
			Bus.emit(EventQueue.EHRemove,E)
			for (F = R.length;F;) ZED.delete_(R[--F],HRemoveMap)
		}
		else
		{
			for (F = R.length;F;)
			{
				T = R[--F]
				ZED.delete_(T,HRemoveMap)
				ZED.delete_(T,OfflineMap)
				//ZED.delete_(T,OffSizeMap)
				T = T.replace(/\.\d+\.[\dA-Z]+$/,'')
				1 === CardMap[T] ? ZED.delete_(T,CardMap) : --CardMap[T]
				R[F] = T
			}
			Offline.length = 0
			OfflineDB.EachRight(V => Offline.push(V[KeyQueue.IDHis]),KeyQueue.Finished)
			Bus.emit(EventQueue.HRemoved,R,X)
		}
	})
	return R.length
},



Current = 0,
Running = {},
Dispatching,
DispatchRequired,
DispatchSort = {_id : 1},
Dispatch = (T,F) =>
{
	if (Dispatching) DispatchRequired = Util.T
	else
	{
		DispatchRequired = Util.F
		if (Current < Max)
		{
			Dispatching = Util.T
			T = {}
			T[KeyQueue.Active] = Util.T
			F = Current ? ZED.keys(Running) : []
			F = F.concat(ReinfoQueue,ErrorQueue,DispatchInfoPreemptive)
			InfoNow && F.push(InfoNow)
			F.length && (T[KeyQueue.Unique] = {$nin : F})
			OnlineData.find(T).sort(DispatchSort).limit(Max - Current).exec((E,Q) =>
			{
				Dispatching = Util.F
				if (!E) for (F = 0;F < Q.length;++F)
				{
					T = Q[F]
					++Current
					Running[T[KeyQueue.Unique]] = Util.T
					ZED.isNull(T[KeyQueue.Size]) ||
					(
						Bus.emit(EventQueue.Processing,T),
						Download.Play(T)
					)
				}
				DispatchRequired && Dispatch()
			})
		}
		else if (Max < Current)
		{
			Dispatching = Util.T
			T = {}
			T[KeyQueue.Active] = Util.T
			T[KeyQueue.Unique] = {$in : ZED.keys(Running)}
			OnlineData.find(T).sort(DispatchSort).skip(Max).exec((E,Q) =>
			{
				Dispatching = Util.F
				if (!E) for (F = 0;F < Q.length;++F)
				{
					T = Q[F]
					InnerPause(T[KeyQueue.Unique])
					Bus.emit(EventQueue.Queuing,T)
				}
				DispatchRequired && Dispatch()
			})
		}
	}
	DispatchInfo()
},
Infoing,
InfoNow,
InfoSite,
InfoEnd,
InfoIsSizing,
DispatchInfoGot = Q =>
{
	Q[KeyQueue.Unique] = InfoNow
	if (Q[KeyQueue.Sizes])
	{
		Q[KeyQueue.Size] = ZED.Sum(Q[KeyQueue.Sizes])
		OnSizeMap[InfoNow] = Q[KeyQueue.Size]
	}
	if (!Q[KeyQueue.Done])
	{
		Q[KeyQueue.Done] = ZED.repeat(0,ZED.reduce((D,V) => D + V[KeyQueue.URL].length,0,Q[KeyQueue.Part]))
		Q[KeyQueue.DoneSum] = 0
	}
	if (!Q[KeyQueue.File]) Q[KeyQueue.File] = ZED.map(ZED.always(''),Q[KeyQueue.Done])
	return OnlineUpdate(ZED.objOf(KeyQueue.Unique,InfoNow),{$set : Q})
		.flatMap(() =>
		(
			Bus.emit(EventQueue.InfoGot,Q),
			Q[KeyQueue.Sizes] ?
			(
				Bus.emit(EventQueue.SizeGot,Q),
				Observable.empty()
			) : (
				InfoIsSizing = Util.T,
				Download.Size(Q,InfoSite).tap(S =>
				{
					OnSizeMap[InfoNow] = S[KeyQueue.Size]
					Bus.emit(EventQueue.SizeGot,ZED.Merge(Q,S))
				}).flatMap(DispatchSizeGot)
			)
		))
},
DispatchSizeGot = S => OnlineUpdate(ZED.objOf(KeyQueue.Unique,InfoNow),{$set : S}),
DispatchInfoEnd = () =>
{
	InfoNow = InfoEnd = InfoIsSizing = Util.F
	Dispatch()
},
DispatchInfoError = E =>
{
	if (Util.OReinfo === E) ReinfoUpdate(InfoNow)
	else ErrorOn(InfoNow,E,Util.T)
	DispatchInfoEnd()
},
DispatchInfoFinish = () =>
{
	if (Running[InfoNow] && !Download.Active[InfoNow])
		OnlineData.findOne(ZED.objOf(KeyQueue.Unique,InfoNow),(E,Q) =>
		{
			if (E) Util.Debug(__filename,E)
			else
			{
				Bus.emit(EventQueue.Processing,Q)
				Download.Play(Q)
			}
		})
	DispatchInfoEnd()
},
DispatchInfoRefreshLast,
DispatchInfoRefresh = Q =>
{
	var
	Part = DispatchInfoRefreshLast[KeyQueue.Part],
	Done = DispatchInfoRefreshLast[KeyQueue.Done],
	Sizes = DispatchInfoRefreshLast[KeyQueue.Sizes],
	URL,
	New = Q[KeyQueue.Part],
	I = -1,F,Fa;

	for (F = -1;++F < Part.length;)
	{
		URL = Part[F][KeyQueue.URL]
		for (Fa = -1;++Fa < URL.length;)
			(Sizes && Sizes[++I] <= Done[I]) || (URL[Fa] = New[F][KeyQueue.URL][Fa])
	}

	return OnlineUpdate
	(
		ZED.objOf(KeyQueue.Unique,InfoNow),
		{$set : ZED.objOf(KeyQueue.Part,Part)}
	).flatMap
	(
		() => Sizes ?
			Observable.empty() :
			Download.Size(DispatchInfoRefreshLast,InfoSite).tap(S =>
			{
				OnSizeMap[InfoNow] = S[KeyQueue.Size]
				Bus.emit(EventQueue.SizeGot,ZED.Merge(DispatchInfoRefreshLast,S))
			}).flatMap(DispatchSizeGot)
	).tap(Util.N,Util.N,() =>
	{
		Bus.emit(EventQueue.Queuing,DispatchInfoRefreshLast[KeyQueue.Unique])
		DispatchInfoRefreshLast = Util.F
	})
},
DispatchInfoPreemptive = [],
DispatchInfo = T =>
{
	if (InfoEnd && !OnlineMap[InfoNow])
	{
		InfoEnd.end()
		InfoNow = InfoEnd = Util.F
	}
	if (!Infoing && !InfoNow)
	{
		Infoing = Util.T
		if (DispatchInfoPreemptive.length)
			OnlineData.findOne
			(
				ZED.objOf(KeyQueue.Unique,InfoNow = DispatchInfoPreemptive.shift()),
				(E,Q) =>
				{
					Infoing = Util.F
					if (E)
					{
						InfoNow = Util.F
						Util.Debug(__filename,E)
					}
					else
					{
						InfoNow = Q[KeyQueue.Unique]
						DispatchInfoRefreshLast = Q
						Bus.emit(EventQueue.Refresh,Q)
						InfoSite = Site.Map[Q[KeyQueue.Name]]
						InfoEnd = InfoSite[KeySite.URL](Q[KeyQueue.ID],Q)
							.flatMap(DispatchInfoRefresh)
							.start(ZED.noop,DispatchInfoError,DispatchInfoFinish)
					}
				}
			)
		else
		{
			if (ReinfoQueue.length || ErrorQueue.length)
			{
				T = {}
				T[KeyQueue.Size] = DBExistFalse
				T[KeyQueue.Unique] =
				{
					$nin : ReinfoQueue.length ?
						ErrorQueue.length ?
							ReinfoQueue.concat(ErrorQueue) :
							ReinfoQueue :
						ErrorQueue
				}
			}
			else T = QueryNoSize
			OnlineData.find(T).sort(DispatchSort).limit(1).exec((E,Q) =>
			{
				Infoing = Util.F
				if (E) Util.Debug(__filename,E)
				else if (Q.length)
				{
					Q = Q[0]
					InfoNow = Q[KeyQueue.Unique]
					T = Q[KeyQueue.Part]
					Bus.emit(T ? EventQueue.InfoGot : EventQueue.Info,Q)
					InfoSite = Site.Map[Q[KeyQueue.Name]]
					T = T ? (
						InfoIsSizing = Util.T,
						Download.Size(Q,InfoSite).tap(S =>
						{
							S[KeyQueue.Unique] = InfoNow
							OnSizeMap[InfoNow] = S[KeyQueue.Size]
							Bus.emit(EventQueue.SizeGot,S)
						}).flatMap(DispatchSizeGot)
					) : InfoSite[KeySite.URL](Q[KeyQueue.ID],Q)
						.flatMap(DispatchInfoGot)
					InfoEnd = T.start(ZED.noop,DispatchInfoError,DispatchInfoFinish)
				}
			})
		}
	}
};

Bus.on(EventDownload.Save,Q => OnlineData.update({_id : Q._id},Q))
	.on(EventDownload.Error,Error)
	.on(EventDownload.Reinfo,Reinfo)
	.on(EventDownload.Finish,Finish)

Util.Look(ReinfoLook)
Util.Look(ErrorLook)

module.exports =
{
	Online : Online,
	OnlineMap : OnlineMap,
	ActiveMap : ActiveMap,
	Offline : Offline,
	OfflineMap : OfflineMap,
	CardMap : CardMap,
	OnSizeMap : OnSizeMap,
	OffSizeMap : OffSizeMap,

	ReinfoMap : ReinfoMap,
	ErrorMap : ErrorMap,

	Max : Q => Util.U === Q ? Max : Max = Number(Q),
	Wait : Q => Util.U === Q ? Wait : Wait = 1000 * (WaitDisplay = Number(Q)),

	Dispatch : Dispatch,

	//Hot
	IsInfo : (Q,J) => InfoNow === Q && (J ^ !DispatchInfoRefreshLast),
	IsSize : Q => InfoNow === Q && InfoIsSizing,
	IsReadyRefresh : Q => 0 <= DispatchInfoPreemptive.indexOf(Q),
	IsRunning : Q => Running[Q],

	Info : (Q,C) => OnlineData.findOne(ZED.objOf(KeyQueue.Unique,Q),C),
	New : New,
	Play : Play,
	Pause : Pause,
	Remove : Remove,

	//History
	Finish : Finish,
	HInfo : (Q,C) => OfflineData.findOne(ZED.objOf(KeyQueue.IDHis,Q),C),
	HRemove : HRemove
}