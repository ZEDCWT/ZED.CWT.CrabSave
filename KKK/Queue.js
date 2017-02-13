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
Site = require('./Site'),
Download = require('./Download'),
DB = require('./DB'),

Max = 5,
Current = 0,
Running = {},

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
DBCount,
DBOnline = DB('Online',function(Q)
{
	DBOnline.Each(function(V,U)
	{
		DBCount = V._id
		U = V[KeyQueue.Unique]
		Online.push(U)
		OnlineMap[U] = Util.T
		V[KeyQueue.Active] && (ActiveMap[U] = Util.T)
	},Q)
	DBCount ? ++DBCount : DBCount = 80000000
},KeyQueue.Unique),
DBOffline = DB('Offline',function(Q)
{
	DBOnline.EachRight(function(V)
	{
		Offline.push(V[KeyQueue.Unique])
		OfflineMap[V[KeyQueue.IDHis]] = Util.T
		CardMapUp(V[KeyQueue.Unique])
	},Q)
},KeyQueue.IDHis),



NewMap = {},
New = function(Q)
{
	var R = [],C,T,F;
	for (F in Q)
	{
		T = Q[F]
		C = T && T[KeySite.Unique]
		if (C && !NewMap[C] && !OnlineMap[C])
		{
			NewMap[C] = Util.T
			R.push(ZED.ReduceToObject
			(
				{_id : DBCount++},
				KeyQueue.Unique,C,
				KeyQueue.Name,T[KeySite.Name],
				KeyQueue.ID,T[KeySite.ID],
				KeyQueue.Title,T[KeySite.Title],
				KeyQueue.Created,ZED.now(),
				KeyQueue.Active,Util.T
			))
		}
	}
	if (R.length) DBOnline.insert(R).start(function()
	{
		F = R.length
		for (;F;)
		{
			T = R[--F][KeyQueue.Unique]
			Online.push(T)
			ZED.delete_(T,NewMap)
			ActiveMap[T] =
			OnlineMap[T] = Util.T
		}
		Bus.emit(EventQueue.Newed,R)
		Dispatch()
	},function(e)
	{
console.log(e)
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
AllowMulti = {multi : Util.T},
PlayMap = {},
PlayUpdate = {$set : ZED.objOf(KeyQueue.Active,Util.T)},
Play = function(Q)
{
	var R = Convert(Q,PlayMap,OnlineMap,ActiveMap,1),F;
	R.length && DBOnline.update(MakeIn(R),PlayUpdate,AllowMulti).start(function()
	{
		for (F = R.length;F;)
		{
			ZED.delete_(R[--F],PlayMap)
			ActiveMap[R[F]] = Util.T
		}
		Bus.emit(EventQueue.Played,R)
		Dispatch()
	},function(e)
	{
console.log(e)
	})
	return R.length
},
PauseMap = {},
PauseUpdate = {$set : ZED.objOf(KeyQueue.Active,Util.F)},
Pause = function(Q)
{
	var R = Convert(Q,PauseMap,OnlineMap,ActiveMap,0),F;
	R.length && DBOnline.update(MakeIn(R),PauseUpdate,AllowMulti).start(function()
	{
		for (F = R.length;F;)
		{
			ZED.delete_(R[--F],PauseMap)
			ZED.delete_(R[F],ActiveMap)
		}
		Bus.emit(EventQueue.Paused,R)
		Dispatch()
	},function(e)
	{
console.log(e)
	})
	return R.length
},
RemoveMap = {},
Remove = function(Q)
{
	var R = Convert(Q,RemoveMap),T,F;
	R.length && DBOnline.remove(MakeIn(R),AllowMulti).start(function()
	{
		for (F = R.length;F;)
		{
			T = R[--F]
			ZED.delete_(T,RemoveMap)
			ZED.delete_(T,OnlineMap)
		}
		Online.length = 0
		DBOnline.Each(function(V){Online.push(V[KeyQueue.Unique])})
		Bus.emit(EventQueue.Change,Online.length)
		Bus.emit(EventQueue.Removed,R)
		Dispatch()
	},function(e)
	{
console.log(e)
	})
	return R.length
},
HRemoveMap = {},
HRemove = function(Q)
{
	var R = Convert(Q,HRemoveMap,OfflineMap),T,F;
	R.length && DBOffline.remove(MakeIn(R,KeyQueue.IDHis),AllowMulti).start(function()
	{
		for (F = R.length;F;)
		{
			T = R[--F]
			ZED.delete_(T,HRemoveMap)
			ZED.delete_(T,OfflineMap)
		}
		Offline.length = 0
		DBOffline.Each(function(V){Offline.push(V[KeyQueue.IDHis])})
		Bus.emit(EventQueue.HRemoved,R)
	},function(e)
	{
console.log(e)
	})
	return R.length
},



Dispatch = function(T,F)
{
	if (Current < Max)
	{
	}
	else if (Max < Current)
	{
	}
	DispatchInfo()
},
DispatchInfoGot = function()
{
},
DispatchInfoEnd = function()
{
	DispatchInfo()
},
DispatchInfoError = function(E)
{
	Util.Debug('Queue',E)
	DispatchInfoEnd()
},
DispatchInfoFinish = function()
{
	DispatchInfoEnd()
},
DispatchInfo = function(T,P)
{
};

Bus.on(EventDownload.SpeedTotal,function(Q)
{
}).on(EventDownload.Finish,function(Q,T)
{
}).on(EventDownload.Reinfo,function(Q)
{
console.log('REINFO',Q)
}).on(EventDownload.Error,function(Q)
{
console.log('ERROR',Q)
})

module.exports =
{
	Online : Online,
	OnlineMap : OnlineMap,
	ActiveMap : ActiveMap,
	Offline : Offline,
	OfflineMap : OfflineMap,
	CardMap : CardMap,

	Max : function(Q){Max = Number(Q)},

	Dispatch : Dispatch,

	//Hot
	IsInfo : function(Q){return 0 === Q},
	IsRunning : function(Q){return Running[Q]},

	Info : function(Q)
	{
		return DBOnline.get(ZED.objOf(KeyQueue.Unique,Q))
	},

	New : New,
	Play : Play,
	Pause : Pause,
	Remove : Remove,

	//History
	HRemove : HRemove
}