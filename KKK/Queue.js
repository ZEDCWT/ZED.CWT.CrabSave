var
ZED = require('@zed.cwt/zedquery'),

Key = require('./Key'),
KeyQueue = Key.Queue,
Event = require('./Event').Queue,

NoMoreUseful =
[
	KeyQueue.Active,
	KeyQueue.Running
],

Bus = ZED.Emitter(),

Max = 5,
Current = 0,
Online = [],
OnlineMap = {},
Offline = [],
OfflineMap = {},

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
		{
			T = Online[--F]
			if (T[KeyQueue.Running])
			{
				T[KeyQueue.Running] = false
				--Current
				Bus.emit(Event.Pause,T)
			}
		}
	}
},

MakeMap = function(Q,S)
{
	ZED.each(function(V)
	{
		S[V[KeyQueue.ID]] = V
	},Q)
};

module.exports =
{
	Bus : Bus,

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
	Online : function(){return Online},
	Offline : function(){return Offline},
	Max : function(Q){Max = Q},

	HasOnline : function(ID)
	{
		return ZED.has(ID,OnlineMap)
	},
	HasOffline : function(ID)
	{
		return ZED.has(ID,OfflineMap)
	},

	//Append a new task
	Push : function(Q)
	{
		var ID = Q[KeyQueue.ID];

		if (!ZED.find(function(V){return ID === V[KeyQueue.ID]},Online))
		{
			Bus.emit(Event.Refresh)
			Dispatch()
		}
	},
	//A task is done
	Done : function(Q)
	{
		var T;

		T = ZED.indexOf(Q,Online)
		if (0 <= T)
		{
			Online.splice(T,1)
			ZED.each(ZED.delete_(ZED.__,Q),NoMoreUseful)
			Offline.unshift(Q)
			Bus.emit(Event.Refresh)
			Dispatch()
		}
	},
	//J | true Online, false Offline
	Pop : function(Q,S,J)
	{
		var
		U = J ? Online : Offline,
		L = Q.length,
		T,F,Fa;

		if (J) for (F = L;F;) Bus.emit(Event.Stop,U[--F],S)
		for (F = U.length;F && L;)
		{
			T = U[--F]
			for (Fa = L;Fa;)
			{
				if (T === Q[--Fa])
				{
					--L
					U.splice(Fa,1)
				}
			}
		}
		Bus.emit(Event.Refresh)
	},

	Play : function(Q)
	{
		ZED.each(function(V)
		{
			V[KeyQueue.Active] = true
		},ZED.isArray(Q) ? Q : [Q])
		Dispatch()
	},
	Pause : function(Q)
	{
		ZED.each(function(V)
		{
			V[KeyQueue.Running] && Bus.emit(Event.Pause,V)
			V[KeyQueue.Active] = V[KeyQueue.Running] = false
		},ZED.isArray(Q) ? Q : [Q])
		Dispatch()
	}
}