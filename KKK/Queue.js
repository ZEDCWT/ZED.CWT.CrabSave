'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Key = require('./Key').Queue,
Event = require('./Event').Queue,

NoMoreUseful =
[
	Key.Active,
	Key.Running
],

Bus = ZED.Emitter(),

Max = 5,
Current = 0,
Online = [],
OnlineMap = {},
Offline = [],
OfflineMap = {},

MakeMap = function(Q,S)
{
	ZED.each(function(V){S[V[Key.ID]] = V},Q)
},



Dispatch = function(T,F)
{
	if (Current < Max)
	{
		for (F = 0;Current < Max && F < Online.length;++F)
		{
			T = Online[F]
			if (T[Key.Active] && !T[Key.Running])
			{
				T[Key.Running] = true
				++Current
				Bus.emit(Event.Play,T)
			}
		}
	}
	else if (Max < Current)
	{
		for (F = Online.length;Max < Current && F;)
		{
			T = Online[--F]
			if (T[Key.Running])
			{
				T[Key.Running] = false
				--Current
				Bus.emit(Event.Pause,T)
			}
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
			Q[T[Key.Unique]] && H(T,F)
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
	Bus : Bus,
	Online : Online,
	OnlineMap : OnlineMap,
	Offline : Offline,
	OfflineMap : OfflineMap,

	Recover : function(Q,S)
	{
		Online = Q
		Offline = S
		ZED.each(function(V){V[Key.Running] = false},Q)
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
				Key.Name,Name,
				Key.Unique,Unique,
				Key.ID,ID,
				Key.Title,Title,
				Key.Info,false,
				Key.Active,true,
				Key.Running,false,
				Key.Author,'',
				Key.Date,'',
				Key.Suffix,'',
				Key.Size,0,
				Key.Part,[]
			))
			EventOnlineChange()
			Dispatch()
		}
	},
	Play : MakeAction(Online,function(Q)
	{
		Q[Key.Active] = true
	},Dispatch),
	Pause : MakeAction(Online,function(Q)
	{
		Q[Key.Active] = false
	},Dispatch),
	Remove : MakeAction(Online,function(Q,F)
	{
		Bus.emit(Event.Pause,Q)
		Online.splice(F,1)
		ZED.delete_(Q[Key.Unique],OnlineMap)
		Bus.emit(Event.Remove,Q)
	},EventOnlineChange)
}