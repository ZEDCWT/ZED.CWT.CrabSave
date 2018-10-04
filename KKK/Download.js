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
EventDownload = Event.Download,
Site = require('./Site'),
Setting = require('./Setting'),

Path = require('path'),

WordPack = Q => `%${Q}%`,
WordDateSingle = ['YYYY','MM','DD','HH','NN','SS'],
WordDate = ZED.map(WordPack,WordDateSingle).join('.'),

Active = {},

Start = (Q,I,At,URL,Done,Size) =>
{
	var Begin,Down,Dirty;

	ZED.isObject(URL) || (URL = {url : URL})
	Down = Downloader(
	{
		request : Util.ProxyPack(ZED.Merge(Util.F,Util.T,
		{
			forever : Util.T,
			headers : {'User-Agent' : Config.UA}
		},URL)),
		newreq : Util.T,
		path : At,
		last : Q[KeyQueue.File][I] && Path.join(Q[KeyQueue.Dir],Q[KeyQueue.File][I]),
		thread : 1,
		force : !Done[I],
		interval : Config.Speed,
		forcerange : ZED.defaultTo(Util.T,URL.forcerange),
		only200 : Util.T
	}).on('connected',() =>
		Dirty = Begin = Down.Info.Saved
	).on('size',Q =>
	{
		Size[I] = Q
		Down.Dirty = Util.T
	}).on('path',S =>
	{
		S = Path.basename(S)
		Q[KeyQueue.File][I] === S ||
		(
			Q[KeyQueue.File][I] = S,
			Bus.emit(EventDownload.File,Q,S,I),
			Down.Dirty = Util.T
		)
	}).on('data',R =>
	{
		Done[I] = R.Saved
		Q[KeyQueue.DoneSum] = ZED.Sum(Done)
		Dirty || (Begin < R.Saved && (Down.Dirty = Dirty = Util.T))
	}).on('done',() =>
	{
		Down.Dirty = Util.T
		Download(Q)
	}).on('die',E =>
	{
		//Set the downloaded size to 0 in case that the files are seemed downloaded
		if (Size[I] <= Done[I]) Done[I] = 0
		ZED.isNumber(E) ?
			Bus.emit(EventDownload.Reinfo,Q) :
			0 <= Begin && Begin < Down.Info.Saved ?
				Start(Q,I,At,URL,Done,Size) :
				Bus.emit(EventDownload.Error,Q,E)
	})
	Down.Q = Q
	Down.D = () => 0 <= Begin && Begin < Down.Info.Saved
	Active[Q[KeyQueue.Unique]] = Down
},

Alias = {},
MakeFileName = (Q,PL,UL,Part,F,Fa,I,D,T) =>
{
	D = new Date(Q[KeyQueue.Date])
	T = Q[KeyQueue.Author]
	T =
	{
		ID : ZED.SafeFileName(String(Q[KeyQueue.ID])),
		Author : ZED.SafeFileName
		(
			ZED.has(T,Alias) ?
				Alias[T] :
				Q[KeyQueue.Author] || '[Anonymous]'
		),
		Date : ZED.DateToString(WordDate,D),
		Title : ZED.SafeFileName(Q[KeyQueue.Title])
	}
	ZED.each(V => T[V] = ZED.DateToString(WordPack(V),D),WordDateSingle)
	if (1 < PL) T.PartIndex = Util.PadTo(PL,F)
	if (Part[KeyQueue.Title]) T.PartTitle = ZED.SafeFileName(Part[KeyQueue.Title])
	if (1 < UL) T.FileIndex = Util.PadTo(UL,Fa)
	if (!Q[KeyQueue.Format]) Q[KeyQueue.Format] = Setting.Data(KeySetting.Name)
	T = ZED.Replace
	(
		Q[KeyQueue.Format].replace
		(
			/\?([^?]+)\?/g,
			(Q,S) => ZED.all
			(
				Q => ZED.has(Q.substr(1,Q.length - 2),T),
				Q.match(/\|[^|]+\|/)
			) ? S : ''
		),
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
	Q[KeyQueue.File][I] || Bus.emit(EventDownload.File,Q,Q[KeyQueue.File][I] = Path.basename(T),I)
	return T
},
Download = Q =>
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

	if (!Q[KeyQueue.File][0])
	{
		for (;++F < PL;)
		{
			UL = Part[F][KeyQueue.URL].length
			for (Fa = -1;++Fa < UL;) MakeFileName(Q,PL,UL,Part[F],F,Fa,++I)
		}
		D = Util.T
		F = I = -1
	}
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

		T = Util.mkdirp(Q[KeyQueue.Dir])
			.flatMap(() => URL.start ? URL : Observable.just(URL))
			.start
			(
				URL => Start(Q,I,MakeFileName(Q,PL,UL,Part,F,Fa,I),URL,Done,Size),
				E => Bus.emit(EventDownload.Error,Q,E)
			)
		Active[Q[KeyQueue.Unique]] =
		{
			Q : Q,
			Dirty : D,
			Stop : ZED.bind_(T.end,T),
			Speed : ZED.always(0)
		}
	}
},

Play = Q => Active[Q[KeyQueue.Unique]] || Download(Q),
Pause = Q =>
{
	if (Active[Q])
	{
		Active[Q].Stop()
		ZED.delete_(Q,Active)
	}
};

Util.Look(R =>
{
	R = 0
	ZED.Each(Active,(F,V) =>
	{
		R += (F = 1000 * V.Speed())
		Bus.emit(EventDownload.Speed,F,V.Q)
		if (V.Dirty)
		{
			V.Dirty = Util.F
			Bus.emit(EventDownload.Save,V.Q)
		}
	})
	Bus.emit(EventDownload.SpeedTotal,R)
})

module.exports =
{
	Active : Active,

	Size : (Q,At) =>
	{
		var
		Pack = At[KeySite.Pack],
		URL = ZED.flatten(ZED.pluck(KeyQueue.URL,Q[KeyQueue.Part])),
		Size = 0,
		Sizes = Array(URL.length);

		return Util.from(URL)
			.flatMapOnline(1,(V,F) => ((V = Pack(V,Q)).start ? V : Observable.just(V))
				.flatMap(Util.RequestHead)
				.tap(H =>
				{
					if (200 <= H.statusCode && H.statusCode < 300)
					{
						H = Number(H.headers['content-length'])
						Size += H
						Sizes[F] = H || 0
						Bus.emit(EventDownload.Size,Q,H,F)
					}
					else ZED.Throw(Util.OReinfo)
				}))
			.finish()
			.map(() => ZED.ReduceToObject
			(
				KeyQueue.Size,Size || 0,
				KeyQueue.Sizes,Sizes
			))
	},

	Alias : ZED.throttle(Config.Throttle,Q => Alias = ZED.reduce
	(
		(D,V) => {D[V[0]] = V[1]},
		{},
		ZED.splitEvery(2,ZED.filter(ZED.identity,Q.split('\n')))
	)),
	FileName : MakeFileName,

	Play : Play,
	Pause : Pause
}