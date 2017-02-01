'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Bus = require('./Util').Bus,
Key = require('./Key').Queue,
Event = require('./Event'),
EventQueue = Event.Queue,
EventDownload = Event.Download,
Queue = require('./Queue');

Bus.on(EventQueue.Play,function(Q)
{
}).on(EventQueue.Pause,function(Q)
{
})

module.exports =
{
	Size : function(Q)
	{
		return ZED.Observable.create(function(O)
		{

			var
			URL = ZED.reduce(function(D,V){return D.concat(V[Key.URL])},[],Q[Key.Part]),
			Size = 0,
			Sizes = Array(URL.length);

			var R = setTimeout(function()
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

			return function()
			{
				console.log('suspend','SIZE')
			}
		})
	}
}