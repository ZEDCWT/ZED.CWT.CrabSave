'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Bus = require('./Util').Bus,
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Event = require('./Event').Queue,
Site = require('./Site'),
Download = require('./Download'),

NoMoreUseful =
[
	KeyQueue.Active,
	KeyQueue.Running
],

Max = 5,
Current = 0,
Online = [],
OnlineMap = {},
Offline = [],
OfflineMap = {},
InfoEnd,
InfoNow,

MakeMap = function(Q,S)
{
	ZED.each(function(V){S[V[KeyQueue.ID]] = V},Q)
},



MaybePause = function(Q)
{
	if (Q[KeyQueue.Running])
	{
		Q[KeyQueue.Running] = false
		--Current
		Bus.emit(Event.Pause,Q)
	}
},
Dispatch = function(T,F)
{
	if (Current < Max)
	{
		for (F = 0;Current < Max && F < Online.length;++F)
		{
			T = Online[F]
			if (T[KeyQueue.Active] && !T[KeyQueue.Running])
			{
				T[KeyQueue.Running] = true
				++Current
				Bus.emit(Event.Play,T)
			}
		}
	}
	else if (Max < Current)
	{
		for (F = Online.length;Max < Current && F;)
			MaybePause(Online[--F])
	}
	DispatchInfo()
},
DispatchInfoGot = function()
{
	Bus.emit(Event.InfoGot,InfoNow)
	return Download.Size(InfoNow)
},
DispatchInfoData = function()
{
	Bus.emit(Event.SizeGot,InfoNow)
},
DispatchInfoError = function()
{

	DispatchInfoFinish()
},
DispatchInfoFinish = function()
{
	InfoEnd = InfoNow = false
	DispatchInfo()
},
DispatchInfo = function(T)
{
	if (InfoEnd && !ZED.has(InfoNow[KeyQueue.Unique],OnlineMap))
	{
		InfoEnd.end()
		InfoEnd = InfoNow = false
	}
	if (!InfoEnd && Online.length)
	{
		if (T = ZED.find(function(V){return !V[KeyQueue.Part] || V[KeyQueue.Size] < 0},Online))
		{
			Bus.emit(Event.Info,T)
			InfoNow = T
			T = T[KeyQueue.Part] ?
				Download.Size(T) :
				Site.Map[ZED.toLower(T[KeyQueue.Name])][KeySite.URL](T[KeyQueue.ID],T)
					.flatMap(DispatchInfoGot)
			InfoEnd = T.start(DispatchInfoData,DispatchInfoError,DispatchInfoFinish)
		}
	}
},



MakeAction = function(O,H,C)
{
	return function(Q)
	{
		var T,F;

		for (F = O.length;F;)
		{
			T = O[--F]
			Q[T[KeyQueue.Unique]] && H(T,F)
		}
		C && C()
	}
},



EventOnlineChange = function(J)
{
	Bus.emit(Event.ChangeOnline,Online.length,J)
},
EventOfflineChange = function()
{
	Bus.emit(Event.ChangeOffline,Offline.length)
};

module.exports =
{
	Online : Online,
	OnlineMap : OnlineMap,
	Offline : Offline,
	OfflineMap : OfflineMap,

	Recover : function(Q,S)
	{
		Online = Q
		Offline = S
		ZED.each(function(V)
		{
			V[KeyQueue.Running] = false
		},Q)
		MakeMap(Q,OnlineMap)
		MakeMap(S,OfflineMap)
		Dispatch()
	},
	Max : function(Q)
	{
		Max = Q
		Dispatch()
	},

	HasOnline : function(ID)
	{
		return ZED.has(ID,OnlineMap)
	},
	HasOffline : function(ID)
	{
		return ZED.has(ID,OfflineMap)
	},

	New : function(Name,Unique,ID,Title)
	{
		if (!ZED.has(Unique,OnlineMap))
		{
			Online.push(OnlineMap[Unique] = ZED.ReduceToObject
			(
				KeyQueue.Created,ZED.DateToString(),
				KeyQueue.Name,Name,
				KeyQueue.Unique,Unique,
				KeyQueue.ID,ID,
				KeyQueue.Title,Title,
				KeyQueue.Active,true,
				KeyQueue.Running,false,
				KeyQueue.Size,-1
			))
			EventOnlineChange()
			Dispatch()
		}
	},
	Play : MakeAction(Online,function(Q)
	{
		Q[KeyQueue.Active] = true
	},Dispatch),
	Pause : MakeAction(Online,function(Q)
	{
		Q[KeyQueue.Active] = false
		MaybePause(Q)
	},Dispatch),
	Remove : MakeAction(Online,function(Q,F)
	{
		InfoNow === Q && (InfoEnd.end(),InfoNow = InfoEnd = false)
		MaybePause(Q)
		Online.splice(F,1)
		ZED.delete_(Q[KeyQueue.Unique],OnlineMap)
		Bus.emit(Event.Remove,Q)
	},function()
	{
		Dispatch()
		EventOnlineChange()
	}),

	IsInfo : function(Q){return InfoNow === Q}
}