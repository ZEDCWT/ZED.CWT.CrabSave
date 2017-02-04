'use strict'
var
ZED = require('@zed.cwt/zedquery'),

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
SaveOnline = require('../JSONFile')('Online'),
SaveOnlineSave = SaveOnline.Save,
SaveOffline = require('../JSONFile')('Offline'),
SaveOfflineSave = SaveOffline.Save,

NoMoreUseful =
[
	KeyQueue.Active,
	KeyQueue.Running,
	KeyQueue.Root,
	KeyQueue.Format
],

Max = 5,
Current = 0,
Online = [],
OnlineMap = {},
Offline = [],
OfflineHistoryMap = {},
OfflineCardMap = {},
InfoEnd,
InfoNow,

OfflineCardMapUp = function(Q)
{
	OfflineCardMap[Q] ? ++OfflineCardMap[Q] : OfflineCardMap[Q] = 1
},



MaybePause = function(Q)
{
	if (Q[KeyQueue.Running])
	{
		Q[KeyQueue.Running] = Util.F
		--Current
		Bus.emit(EventQueue.Pause,Q)
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
				T[KeyQueue.Running] = Util.T
				++Current
				Bus.emit(T[KeyQueue.Size] < 0 ? EventQueue.FakeRun : EventQueue.Play,T)
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
	InfoNow[KeyQueue.File] = ZED.flatten(ZED.pluck(KeyQueue.URL,InfoNow[KeyQueue.Part])).length
	SaveOnlineSave()
	Bus.emit(EventQueue.InfoGot,InfoNow)
	return Download.Size(InfoNow)
},
DispatchInfoEnd = function()
{
	InfoEnd = InfoNow = Util.F
	DispatchInfo()
},
DispatchInfoError = function(E)
{
console.log(E)
	DispatchInfoEnd()
},
DispatchInfoFinish = function()
{
	SaveOnlineSave()
	Bus.emit(EventQueue.SizeGot,InfoNow)
	InfoNow[KeyQueue.Running] && Bus.emit(EventQueue.Play,InfoNow)
	DispatchInfoEnd()
},
DispatchInfo = function(T,P)
{
	if (InfoEnd && !ZED.has(InfoNow[KeyQueue.Unique],OnlineMap))
	{
		InfoEnd.end()
		InfoEnd = InfoNow = Util.F
	}
	if (!InfoEnd && Online.length)
	{
		//Pick a task, processing one is prior
		T = ZED.find(function(V)
		{
			return (!V[KeyQueue.Part] || V[KeyQueue.Size] < 0) &&
			(
				P = P || V,
				V[KeyQueue.Running]
			)
		},Online) || P
		if (T)
		{
			Bus.emit(EventQueue.Info,T)
			InfoNow = T
			T = T[KeyQueue.Part] ?
				Download.Size(T) :
				Site.Map[T[KeyQueue.Name]][KeySite.URL](T[KeyQueue.ID],T)
					.reduce(ZED.noop)
					.flatMap(DispatchInfoGot)
			InfoEnd = T.start(ZED.noop,DispatchInfoError,DispatchInfoFinish)
		}
	}
},



MakeAction = function(O,H,C,K)
{
	K = K || KeyQueue.Unique
	return function(Q)
	{
		var R = 0,T,F;

		for (F = O.length;F;)
		{
			T = O[--F]
			Q[T[K]] && H(T,F) && ++R
		}
		C && C()
		return R
	}
},



EventOnlineChange = function()
{
	Bus.emit(EventQueue.Change,Online.length)
};

Online = SaveOnline.Data()
ZED.isArray(Online) || (Online = [])
SaveOnline.Replace(Online)
Offline = SaveOffline.Data()
ZED.isArray(Offline) || (Offline = [])
SaveOffline.Replace(Offline)
ZED.each(function(V)
{
	V[KeyQueue.Running] = Util.F
	OnlineMap[V[KeyQueue.Unique]] = V
},Online)
ZED.each(function(V)
{
	OfflineHistoryMap[V[KeyQueue.IDHis]] = V
	OfflineCardMapUp(V[KeyQueue.Unique])
},Offline)

Bus.on(EventDownload.SpeedTotal,function(Q)
{
	Q && SaveOnlineSave()
})
	.on(EventDownload.Finish,function(Q)
	{
		var T;

		if (Q[KeyQueue.Running])
		{
			T = ZED.findIndex(ZED.identical(Q),Online)
			if (0 <= T)
			{
				Online.splice(T,1)
				SaveOnlineSave()
				T = Q[KeyQueue.Unique]
				ZED.delete_(T,OnlineMap)
				--Current
				EventOnlineChange()

				ZED.each(ZED.delete_(ZED.__,Q),NoMoreUseful)
				Offline.unshift(Q)
				SaveOfflineSave()
				OfflineCardMapUp(T)
				Q[KeyQueue.IDHis] = T += '.' + ZED.now() + '.' + ZED.Code.MD5(Math.random()).substr(0,6)
				OfflineHistoryMap[T] = Q
				Q[KeyQueue.Finished] = ZED.now()
				Bus.emit(EventQueue.Finish,Q)
				Dispatch()
			}
		}
	})

module.exports =
{
	Online : Online,
	OnlineMap : OnlineMap,
	Offline : Offline,
	OfflineMap : OfflineHistoryMap,

	Max : function(Q){Max = Q},

	Dispatch : Dispatch,

	HasOnline : function(ID)
	{
		return ZED.has(ID,OnlineMap)
	},
	HasOffline : function(ID)
	{
		return ZED.has(ID,OfflineCardMap)
	},

	//Hot
	IsInfo : function(Q){return InfoNow === Q},

	New : function(Q)
	{
		var Unique = Q[KeySite.Unique];

		if (!ZED.has(Unique,OnlineMap))
		{
			Online.push(OnlineMap[Unique] = ZED.ReduceToObject
			(
				KeyQueue.Created,ZED.now(),
				KeyQueue.Name,Q[KeySite.Name],
				KeyQueue.Unique,Unique,
				KeyQueue.ID,Q[KeySite.ID],
				KeyQueue.Title,Q[KeySite.Title],
				KeyQueue.Active,Util.T,
				KeyQueue.Running,Util.F,
				KeyQueue.Size,-1
			))
			SaveOnlineSave()
			EventOnlineChange()
			Dispatch()
		}
	},
	Play : MakeAction(Online,function(Q)
	{
		return Q[KeyQueue.Active] ?
			Util.F :
			Q[KeyQueue.Active] = Util.T
	},function()
	{
		SaveOnlineSave()
		Dispatch()
	}),
	Pause : MakeAction(Online,function(Q)
	{
		return Q[KeyQueue.Active] &&
		(
			Q[KeyQueue.Active] = Util.F,
			MaybePause(Q),
			Util.T
		)
	},function()
	{
		SaveOnlineSave()
		Dispatch()
	}),
	Remove : MakeAction(Online,function(Q,F)
	{
		InfoNow === Q && (InfoEnd.end(),InfoNow = InfoEnd = Util.F)
		MaybePause(Q)
		Online.splice(F,1)
		ZED.delete_(Q[KeyQueue.Unique],OnlineMap)
		Bus.emit(EventQueue.Remove,Q)
		return Util.T
	},function()
	{
		SaveOnlineSave()
		Dispatch()
		EventOnlineChange()
	}),

	//History
	Bye : MakeAction(Offline,function(Q,F)
	{
		Offline.splice(F,1)
		ZED.delete_(Q[KeyQueue.IDHis],OfflineHistoryMap)
		F = Q[KeyQueue.Unique]
		1 === OfflineCardMap[F] ? ZED.delete_(F,OfflineCardMap) : --OfflineCardMap[F]
		Bus.emit(EventQueue.Bye,Q)
		return Util.T
	},SaveOfflineSave,KeyQueue.IDHis)
}