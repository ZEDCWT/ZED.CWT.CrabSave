'use strict'
var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,
Downloader = require('@zed.cwt/downloader'),

Config = require('../Config'),
Util = require('./Util'),
Bus = Util.Bus,
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
KeySetting = Key.Setting,
Event = require('./Event'),
EventQueue = Event.Queue,
EventDownload = Event.Download,
SiteMap = require('./Site').Map,
Setting = require('./Setting'),

Path = require('path'),

Active = {},

Download = function(Q)
{
	var
	Target = SiteMap[Q[KeyQueue.Name]],
	Part = Q[KeyQueue.Part],
	PL = Part.length,
	URL,UL,
	Size = Q[KeyQueue.Sizes],
	Done = Q[KeyQueue.Done],

	I = -1,

	D,T = Util.T,F = -1,Fa;

	for (;T && ++F < PL;)
	{
		URL = Part[F][KeyQueue.URL]
		UL = URL.length
		for (Fa = -1;T && ++Fa < UL;)
			T = Size[++I] && Size[I] <= Done[I]
	}

	if (T)
	{
		ZED.delete_(Q[KeyQueue.Unique],Active)
		Bus.emit(EventDownload.Finish,Q)
	}
	else
	{
		Part = Part[F]
		URL = Target[KeySite.Pack](URL[Fa],Q)


		D = new Date(Q[KeyQueue.Date])
		T =
		{
			Author : ZED.SafeFileName(Q[KeyQueue.Author]),
			Date : ZED.DateToString('%YYYY%.%MM%.%DD%.%HH%.%NN%.%SS%',D),
			Title : ZED.SafeFileName(Q[KeyQueue.Title])
		}
		ZED.each(function(V)
		{
			T[V] = ZED.DateToString('%' + V + '%',D)
		},['YYYY','MM','DD','HH','NN','SS'])
		if (1 < PL) T.PartIndex = Util.PadTo(PL,F)
		if (Part[KeyQueue.Title]) T.PartTitle = Part[KeyQueue.Title]
		if (1 < UL) T.FileIndex = Util.PadTo(UL,Fa)
		if (!Q[KeyQueue.Format]) Q[KeyQueue.Format] = Setting.Data(KeySetting.Name)
		T = ZED.Replace
		(
			Q[KeyQueue.Format].replace(/\?([^?]+)\?/g,function(Q,S)
			{
				return ZED.all(function(Q)
				{
					return ZED.has(Q.substr(1,Q.length - 2),T)
				},Q.match(/\|[^|]+\|/)) ? S : ''
			}),
			'|',
			T
		) + Part[KeyQueue.Suffix]
		if (!Q[KeyQueue.Root]) Q[KeyQueue.Root] = Setting.Data(KeySetting.Dir)
		T = Path.join(Q[KeyQueue.Root],T)
		if (!Q[KeyQueue.Dir])
		{
			Q[KeyQueue.Dir] = Path.dirname(T)
			Bus.emit(EventDownload.Dir,Q)
		}
console.log(T)
		F = ZED.Timer(
		{
			Time : T = 10000 || 120000,
			Max : 500,
			Show : function(P)
			{
				Done[I] = Math.floor(Size[I] * P.Past / T)
			},
			End : function()
			{
				Done[I] = Size[I]
				Download(Q)
			}
		})
		Active[Q[KeyQueue.Unique]] =
		{
			Stop : function()
			{
				F()
			},
			Speed : function(){return ZED.Rnd(100,1000)}
		}
	}
},

Play = function(Q)
{
	Active[Q[KeyQueue.Unique]] || Download(Q)
},
Pause = function(Q)
{
	Q = Q[KeyQueue.Unique]
	if (Active[Q])
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
		var
		Pack = SiteMap[Q[KeyQueue.Name]][KeySite.Pack],
		URL = ZED.flatten(ZED.pluck(KeyQueue.URL,Q[KeyQueue.Part])),
		Size = 0,
		Sizes = Array(URL.length);

		return Observable.from(URL)
			.flatMapOnline(1,function(V,F)
			{
				return Util.RequestHead(Pack(V,Q))
					.tap(function(H)
					{
						if (200 !== H.statusCode)
						{

						}
						H = Number(H.headers['content-length'])
						Size += H
						Sizes[F] = H
						Bus.emit(EventDownload.Size,Q,H,F)
					})
			})
			.tap(ZED.noop,ZED.noop,function()
			{
				Q[KeyQueue.Size] = Size
				Q[KeyQueue.Sizes] = Sizes
				Q[KeyQueue.Done] = ZED.repeat(0,Sizes.length)
			})
	}
}