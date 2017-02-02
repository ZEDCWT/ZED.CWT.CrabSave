'use strict'
var
ZED = require('@zed.cwt/zedquery'),
Downloader = require('@zed.cwt/downloader'),

Config = require('../Config'),
Util = require('./Util'),
Bus = Util.Bus,
Key = require('./Key').Queue,
Event = require('./Event'),
EventQueue = Event.Queue,
EventDownload = Event.Download,
Site = require('./Site'),

Active = {},

Download = function(Q)
{
	var
	Target = Site.Map[Q[Key.Name]],
	Part = Q[Key.Part],
	URL,
	Size = Q[Key.Sizes],
	Done = Q[Key.Done],

	I = 0,

	T = Util.T,F = 0,Fa;

	for (;T && F < Part.length;++F)
	{
		URL = Part[F][Key.URL]
		for (Fa = 0;T && Fa < URL.length;++I,++Fa)
			T = Size[I] && Size[I] <= Done[I]
	}

	if (T) Bus.emit(EventDownload.Finish,Q)
	else
	{
		Part = Target
		URL = URL[Fa]

		F = ZED.Timer(
		{
			Time : T = 10000,
			Max : 500,
			Show : function(P)
			{
				Done[I] = Math.floor(Size[I] * P.Past / T)
			},
			End : function()
			{
				Download(Q)
			}
		})
		Active[Q[Key.Unique]] =
		{
			Stop : function()
			{
				console.log('STOPPED',Q,I)
				F()
			},
			Speed : function(){return ZED.Rnd(100000,1000000)}
		}
	}
},

Play = function(Q)
{
	Active[Q[Key.Unique]] || Download(Q)
},
Pause = function(Q)
{
	Q = Q[Key.Unique]
	if (!Active[Q])
	{
		Active[Q].Stop()
		ZED.delete_(Q,Active)
	}
};

Bus.on(EventQueue.Play,Play)
	.on(EventQueue.Pause,Pause)

setInterval(function(R)
{
	R = 0
	ZED.Each(Active,function(F,V)
	{
		R += (V = 1000 * V.Speed())
		Bus.emit(EventDownload.Speed,V,F)
	})
	Bus.emit(EventDownload.SpeedTotal,R)
},Config.Speed)

module.exports =
{
	Active : Active,

	Size : function(Q)
	{
		return ZED.Observable.create(function(O)
		{

			var
			URL = ZED.reduce(function(D,V){return D.concat(V[Key.URL])},[],Q[Key.Part]),
			Size = 0,
			Sizes = Array(URL.length);

			setTimeout(function()
			{
				for (var F = 0;F < Sizes.length;++F)
				{
					var T = ZED.Rnd(7000000,100000000)
					Size += T
					Sizes[F] = T
					Bus.emit(EventDownload.Size,Q,T,F)
				}
				Q[Key.Size] = Size
				Q[Key.Sizes] = Sizes
				Q[Key.Done] = ZED.repeat(0,Sizes.length)
				O.data().finish()
			},1000)
		})
	}
}