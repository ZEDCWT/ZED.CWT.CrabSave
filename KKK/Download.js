'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Event = require('./Event'),
EventQueue = Event.Queue,
EventDownload = Event.Download,
Queue = require('./Queue'),

Bus = ZED.Emitter();

Queue.Bus.on(EventQueue.Play,function(Q)
{
}).on(EventQueue.Pause,function(Q)
{
})

module.exports =
{
	Bus : Bus
}