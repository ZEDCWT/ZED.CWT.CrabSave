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
Offline = [],

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
			V[Key.Running] = false
		},Q)
		Dispatch()
	},
	Online : function(){return Online},
	Offline : function(){return Offline},
	Max : function(Q){Max = Q},

	//Append a new task
	Push : function(Q)
	{
		var ID = Q[Key.ID];

		if (!ZED.find(function(V){return ID === V[Key.ID]},Online))
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
			V[Key.Active] = true
		},ZED.isArray(Q) ? Q : [Q])
		Dispatch()
	},
	Pause : function(Q)
	{
		ZED.each(function(V)
		{
			V[Key.Running] && Bus.emit(Event.Pause,V)
			V[Key.Active] = V[Key.Running] = false
		},ZED.isArray(Q) ? Q : [Q])
		Dispatch()
	}
}