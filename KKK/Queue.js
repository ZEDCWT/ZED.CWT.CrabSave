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
Wait = 180000,

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
CardMapUp = function(Q)
{
	CardMap[Q] ? ++CardMap[Q] : CardMap[Q] = 1
},
OnlineCount = 80000000 - 1,
Loaded = 0,
OnlineDB = DB('Online',function(S)
{
	OnlineDB.Each(function(V,U)
	{
		S = V._id
		U = V[KeyQueue.Unique]
		Online.push(U)
		OnlineMap[U] = Util.T
		V[KeyQueue.Active] && (ActiveMap[U] = Util.T)
	})
	OnlineCount < S && (OnlineCount = S)
	++Loaded
	Bus.emit(EventQueue.First,Online.length)
},KeyQueue.Unique),
OnlineData = OnlineDB.Data,
OnlineUpdate = Observable.wrapNode(OnlineData.update,OnlineData),
OfflineDB = DB('Offline',function(S)
{
	OfflineDB.EachRight(function(V)
	{
		S || (S = V._id)
		Offline.push(V[KeyQueue.IDHis])
		OfflineMap[V[KeyQueue.IDHis]] = Util.T
		CardMapUp(V[KeyQueue.Unique])
	})
	OnlineCount < S && (OnlineCount = S)
	++Loaded
	Bus.emit(EventQueue.First)
},KeyQueue.IDHis),
OfflineData = OfflineDB.Data,



NewMap = {},
New = function(Q)
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
	if (R.length) OnlineData.insert(R,function(E)
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
				ActiveMap[T] =
				OnlineMap[T] = Util.T
			}
			Bus.emit(EventQueue.Change,Online.length)
			Bus.emit(EventQueue.Newed,R)
			Dispatch()
		}
	})
	return R.length
},
Convert = function(Q,M,O,S,J)
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
MakeIn = function(Q,K,R)
{
	R = {}
	R[K || KeyQueue.Unique] = {$in : Q}
	return R
},
PlayMap = {},
Play = function(Q)
{
	var R = Convert(Q,PlayMap,OnlineMap,ActiveMap,1),F;
	R.length && OnlineData.update(MakeIn(R),QuerySetActiveTrue,DBAllowMulti,function(E)
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
			Bus.emit(EventQueue.Played,R)
			Dispatch()
		}
	})
	return R.length
},
PauseMap = {},
InnerPause = function(Q)
{
	--Current
	ZED.delete_(Q,Running)
	Download.Pause(Q)
},
ClearDebuff = function(M,T,F)
{
	for (F = ReinfoQueue.length;F;) if (M[T = ReinfoQueue[--F]])
	{
		ReinfoQueue.splice(F,1)
		ZED.delete_(T,ReinfoMap)
	}
	for (F = DispatchInfoPreemptive.length;F;)
		if (M[T = DispatchInfoPreemptive[--F]])
			DispatchInfoPreemptive.splice(F,1)
},
Pause = function(Q)
{
	var R = Convert(Q,PauseMap,OnlineMap,ActiveMap,0),M,T,F;

	R.length && OnlineData.update(MakeIn(R),QuerySetActiveFalse,DBAllowMulti,function(E)
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
			Bus.emit(EventQueue.Paused,R)
			Dispatch()
		}
	})
	return R.length
},
RemoveMap = {},
Remove = function(Q)
{
	var R = Convert(Q,RemoveMap),M,T,F;
	R.length && OnlineData.remove(MakeIn(R),DBAllowMulti,function(E)
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
			OnlineDB.Each(function(V){Online.push(V[KeyQueue.Unique])})
			Bus.emit(EventQueue.Change,Online.length)
				.emit(EventQueue.Removed,R)
			Dispatch()
		}
	})
	return R.length
},

ReinfoMap = {},
ReinfoQueue = [],
ReinfoLook = function(R,C,T,F)
{
	R = []
	for (F = ReinfoQueue.length;F;)
	{
		T = ReinfoQueue[--F]
		C = ReinfoMap[T] + Wait - ZED.now()
		if (0 < C) Bus.emit(EventQueue.ReinfoLook,T,C / 1000)
		else
		{
			Bus.emit(EventQueue.ReinfoLook,0)
			ZED.delete_(T,ReinfoMap)
			ReinfoQueue.splice(F,1)
			R.push(T)
		}
	}
	for (F = 0;F < R.length;++F) DispatchInfoPreemptive.push(R[F])
	F && (InfoNow || DispatchInfo())
},
Reinfo = function(Q)
{
	var
	ID = Q[KeyQueue.Unique];

	ReinfoMap[ID] || OnlineData.update({_id : Q._id},Q,function(E)
	{
		if (E) DownError(Q,E)
		else
		{
			ReinfoMap[ID] = ZED.now()
			ReinfoQueue.push(ID)
			InnerPause(ID)
			Bus.emit(EventQueue.Reinfo,ID,Wait / 1000)
		}
	})
},
DownError = function()
{
	console.log('DERROR',arguments)
},

FinishQueue = [],
Finishing,
Finish = function(Q,T,F)
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
		OfflineData.insert(Q,function(E)
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
					CardMapUp(T[KeyQueue.Unique])
				}
				Bus.emit(EventQueue.FHis)
				OnlineData.remove({_id : {$in : ZED.pluck('_id',Q)}},DBAllowMulti,function(E)
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
						OnlineDB.Each(function(V){Online.push(V[KeyQueue.Unique])})
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
HRemove = function(Q)
{
	var R = Convert(Q,HRemoveMap,OfflineMap),T,F;
	R.length && OfflineData.remove(MakeIn(R,KeyQueue.IDHis),DBAllowMulti,function(E)
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
				T = T.replace(/\.\d+\.[A-Z0-9]+$/,'')
				1 === CardMap[T] ? ZED.delete_(T,CardMap) : --CardMap[T]
				R[F] = T
			}
			Offline.length = 0
			OfflineDB.EachRight(function(V){Offline.push(V[KeyQueue.IDHis])})
			Bus.emit(EventQueue.HRemoved,R)
		}
	})
	return R.length
},



Current = 0,
Running = {},
Dispatching,
DispatchRequired,
DispatchSort = {_id : 1},
Dispatch = function(T,F)
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
			F = F.concat(ZED.keys(ReinfoMap),DispatchInfoPreemptive)
			F.length && (T[KeyQueue.Unique] = {$nin : F})
			OnlineData.find(T).sort(DispatchSort).limit(Max - Current).exec(function(E,Q)
			{
				Dispatching = Util.F
				if (!E) for (F = 0;F < Q.length;++F)
				{
					T = Q[F]
					++Current
					Running[T[KeyQueue.Unique]] = Util.T
					ZED.isNull(T[KeyQueue.Size]) || Download.Play(T)
					Bus.emit(EventQueue.Processing,T)
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
			OnlineData.find(T).sort(DispatchSort).skip(Max).exec(function(E,Q)
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
DispatchInfoGot = function(Q)
{
	Q[KeyQueue.Unique] = InfoNow
	if (Q[KeyQueue.Sizes]) Q[KeyQueue.Size] = ZED.Sum(Q[KeyQueue.Sizes])
	if (!Q[KeyQueue.Done])
	{
		Q[KeyQueue.Done] = ZED.repeat(0,ZED.reduce(function(D,V)
		{
			return D + V[KeyQueue.URL].length
		},0,Q[KeyQueue.Part]))
		Q[KeyQueue.DoneSum] = 0
	}
	if (!Q[KeyQueue.File]) Q[KeyQueue.File] = ZED.map(ZED.always(''),Q[KeyQueue.Done])
	return OnlineUpdate(ZED.objOf(KeyQueue.Unique,InfoNow),{$set : Q}).flatMap(function()
	{
		Bus.emit(EventQueue.InfoGot,Q)
		return Q[KeyQueue.Sizes] ?
		(
			Bus.emit(EventQueue.SizeGot,Q),
			Observable.empty()
		) : Download.Size(Q,InfoSite).flatMap(function(S)
		{
			ZED.Merge(Q,S)
			return OnlineUpdate(ZED.objOf(KeyQueue.Unique,InfoNow),{$set : S})
		}).tap(function()
		{
			Bus.emit(EventQueue.SizeGot,Q)
		})
	})
},
DispatchInfoEnd = function()
{
	InfoNow = InfoEnd = Util.F
	Dispatch()
},
DispatchInfoError = function(E)
{
	Util.Debug('Queue',E)
	DispatchInfoEnd()
},
DispatchInfoFinish = function()
{
	if (Running[InfoNow] && !Download.Active[InfoNow])
		OnlineData.findOne(ZED.objOf(KeyQueue.Unique,InfoNow),function(E,Q)
		{
			if (E) Util.Debug('Queue',E)
			else Download.Play(Q)
		})
	DispatchInfoEnd()
},
DispatchInfoRefreshLast,
DispatchInfoRefresh = function(Q)
{
	var
	Part = DispatchInfoRefreshLast[KeyQueue.Part],
	Done = DispatchInfoRefreshLast[KeyQueue.Done],
	URL,
	New = Q[KeyQueue.Part],
	I = -1,F,Fa;

	for (F = -1;++F < Part.length;)
	{
		URL = Part[F][KeyQueue.URL]
		for (Fa = -1;++Fa < URL.length;)
			Done[++I] || (URL[Fa] = New[F][KeyQueue.URL][Fa])
	}

	return OnlineUpdate(ZED.objOf(KeyQueue.Unique,InfoNow),{$set : ZED.objOf(KeyQueue.Part,Part)}).tap(function()
	{
		Bus.emit(EventQueue.Queuing,DispatchInfoRefreshLast)
		DispatchInfoRefreshLast = Util.F
	})
},
DispatchInfoPreemptive = [],
DispatchInfo = function(T)
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
			OnlineData.findOne(ZED.objOf(KeyQueue.Unique,DispatchInfoPreemptive.shift()),function(E,Q)
			{
				Infoing = Util.F
				if (E) Util.Debug('Queue',E)
				else
				{
					InfoNow = Q[KeyQueue.Unique]
					DispatchInfoRefreshLast = Q
					Bus.emit(EventQueue.Refresh,Q)
					InfoEnd = Site.Map[Q[KeyQueue.Name]][KeySite.URL](Q[KeyQueue.ID],Q)
						.flatMap(DispatchInfoRefresh)
						.start(ZED.noop,DispatchInfoError,DispatchInfoFinish)
				}
			})
		else
			OnlineData.find(QueryNoSize).sort(DispatchSort).limit(1).exec(function(E,Q)
			{
				Infoing = Util.F
				if (E) Util.Debug('Queue',E)
				else if (Q.length)
				{
					Q = Q[0]
					InfoNow = Q[KeyQueue.Unique]
					T = Q[KeyQueue.Part]
					Bus.emit(T ? EventQueue.InfoGot : EventQueue.Info,Q)
					InfoSite = Site.Map[Q[KeyQueue.Name]]
					T = T ?
						Download.Size(Q,InfoSite) :
						InfoSite[KeySite.URL](Q[KeyQueue.ID],Q)
							.flatMap(DispatchInfoGot)
					InfoEnd = T.start(ZED.noop,DispatchInfoError,DispatchInfoFinish)
				}
			})
	}
};

Bus.on(EventDownload.Save,function(Q)
{
	OnlineData.update({_id : Q._id},Q)
})
	.on(EventDownload.Error,DownError)
	.on(EventDownload.Finish,Finish)
	.on(EventDownload.Reinfo,Reinfo)

Util.Look(ReinfoLook)

module.exports =
{
	Online : Online,
	OnlineMap : OnlineMap,
	ActiveMap : ActiveMap,
	Offline : Offline,
	OfflineMap : OfflineMap,
	CardMap : CardMap,

	ReinfoMap : ReinfoMap,

	Max : function(Q){return Util.U === Q ? Max : Max = Number(Q)},
	Wait : function(Q){return Util.U === Q ? Wait : Wait = 1000 * Q},

	Dispatch : Dispatch,

	//Hot
	IsInfo : function(Q){return InfoNow === Q},
	IsRunning : function(Q){return Running[Q]},

	Info : function(Q,C)
	{
		return OnlineData.findOne(ZED.objOf(KeyQueue.Unique,Q),C)
	},
	New : New,
	Play : Play,
	Pause : Pause,
	Remove : Remove,

	//History
	Finish : Finish,
	HInfo : function(Q,C)
	{
		return OfflineData.findOne(ZED.objOf(KeyQueue.IDHis,Q),C)
	},
	HRemove : HRemove
}