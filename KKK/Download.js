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
Site = require('./Site'),
Setting = require('./Setting'),

Path = require('path'),

WordPack = function(Q){return '%' + Q + '%'},
WordDateSingle = ['YYYY','MM','DD','HH','NN','SS'],
WordDate = ZED.map(WordPack,WordDateSingle).join('.'),

Active = {},

Start = function(Q,I,At,URL,Done,Size,J,D)
{
	ZED.isObject(URL) || (URL = {url : URL})
	ZED.Merge(Util.F,Util.T,
	{
		timeout : 3E3,
		forever : Util.T
	},URL)
	D = Downloader(
	{
		request : URL,
		path : At,
		thread : 1,
		force : !Done[I],
		interval : Config.Speed,
		only200 : Util.T
	}).on('connected',function()
	{
		J = D.Info.Saved
	}).on('size',function(Q)
	{
		Size[I] = Q
	}).on('path',function(S)
	{
		Q[KeyQueue.File][I] = S
	}).on('data',function(R)
	{
		Done[I] = R.Saved
	}).on('done',function()
	{
		Download(Q)
	}).on('die',function(E)
	{
		if (ZED.isNumber(E))
		{
			Done[I] = 0
			Bus.emit(EventDownload.Reinfo,Q)
		}
		else if (0 <= J && J < D.Info.Saved)
		{
			Util.Debug('Download','Auto restart')
			Start(Q,I,At,URL,Done,Size)
		}
		else
			Bus.emit(EventDownload.Error,Q)
	})
	Active[Q[KeyQueue.Unique]] = D
},

Download = function(Q)
{
	var
	Target = Site.Map[Q[KeyQueue.Name]],
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

		T = Q[KeyQueue.File][I]
		if (!T)
		{
			D = new Date(Q[KeyQueue.Date])
			T =
			{
				Author : ZED.SafeFileName(Q[KeyQueue.Author]),
				Date : ZED.DateToString(WordDate,D),
				Title : ZED.SafeFileName(Q[KeyQueue.Title])
			}
			ZED.each(function(V)
			{
				T[V] = ZED.DateToString(WordPack(V),D)
			},WordDateSingle)
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
			Q[KeyQueue.File][I] = T
		}

		F = Util.mkdirp(Path.dirname(T)).flatMap(function()
		{
			return URL.start ? URL : Observable.just(URL)
		}).start(function(URL)
		{
			Start(Q,I,T,URL,Done,Size)
		},function()
		{
			Bus.emit(EventDownload.Error,Q)
		})
		Active[Q[KeyQueue.Unique]] =
		{
			Stop : ZED.bind_(F.end,F),
			Speed : ZED.always(0)
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
		Pack = Site.Map[Q[KeyQueue.Name]][KeySite.Pack],
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