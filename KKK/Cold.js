'use strict'
var
ZED = require('@zed.cwt/zedquery'),

Util = require('./Util'),
Bus = Util.Bus,
Key = require('./Key'),
KeySite = Key.Site,
KeyQueue = Key.Queue,
Event = require('./Event'),
EventCold = Event.Cold,
EventQueue = Event.Queue,
Lang = require('./Lang'),
L = Lang.L,
DOM = require('./DOM'),
Card = DOM.Card,
Queue = require('./Queue'),

Prefix = DOM.NoSelect + ' ' + Card.R + ' ',

LangMap = ZED.ReduceToObject
(
	Card.Init,L(Lang.Select),
	Card.Cold,L(Lang.Cold),
	Card.Hot,L(Lang.Hot),
	Card.History,L(Lang.History)
),

Cold = [],
ColdMap = {},
StatusMap = {},
Active = {},

Select = function(ID,J,R)
{
	if (Card.Init === StatusMap[ID] || (J && Card.History === StatusMap[ID]))
	{
		StateTo(ID,Card.Cold,R = Active[ID])
		Cold.push(ColdMap[ID] = R[1])
	}
},
ReleseState = function(ID,R)
{
	StateTo(ID,Queue.CardMap[ID] ? Card.History : Card.Init,R)
},
Unselect = function(ID,R,T)
{
	if (Card.Cold === StatusMap[ID])
	{
		R = Active[ID]
		ReleseState(ID,R)
		R = R[1][KeySite.Unique]
		T = ZED.findIndex(function(V)
		{
			return V[KeySite.Unique] === R
		},Cold)
		T < 0 ||
		(
			Cold.splice(T,1),
			ZED.delete_(ID,ColdMap)
		)
	}
},

ChangeCount = function()
{
	Bus.emit(EventCold.Change,Cold.length)
},

StateTo = function(ID,S,R)
{
	R = R || Active[ID]
	R && R[0].attr(DOM.cls,Prefix + S).text(LangMap[S])
	StatusMap[ID] = S
};

Bus.on(EventQueue.Newed,function(R,M,F)
{
	M = {}
	for (F = R.length;F;) M[R[--F][KeyQueue.Unique]] = Util.T
	for (F = Cold.length;F;)
	{
		R = Cold[--F][KeySite.Unique]
		if (M[R])
		{
			StateTo(R,Card.Hot)
			Cold.splice(F,1)
			ZED.delete_(R,ColdMap)
		}
	}
	ChangeCount()
}).on(EventQueue.Removed,function(R,T,F)
{
	for (F = R.length;F;)
	{
		T = R[--F]
		StatusMap[T] && StateTo(T,Queue.CardMap[T] ? Card.History : Card.Init)
	}
}).on(EventQueue.Finish,function(Q)
{
	StateTo(Q[KeyQueue.Unique],Card.History)
}).on(EventQueue.HRemoved,function(R,T,F)
{
	for (F = R.length;F;)
	{
		T = R[--F]
		StatusMap[T] && StateTo(T,Queue.CardMap[T] ? Card.History : Card.Init)
	}
})

module.exports =
{
	Cold : Cold,
	Map : ColdMap,

	Reset : function(){Active = {}},
	New : function(Target,O,R,S,ID)
	{
		ID = O[KeySite.Unique]
		S = StatusMap[ID]
		if (!S)
		{
			StatusMap[ID] = S = Queue.OnlineMap[ID] ?
				Card.Hot :
				Queue.CardMap[ID] ?
					Card.History :
					Card.Init
		}
		R = ZED.jQuery(DOM.div).attr(DOM.cls,Prefix + S).text(L(LangMap[S]))
		Active[ID] = [R,O]
		return R
	},
	Click : function(ID)
	{
		var State = StatusMap[ID];
		ZED.ClearSelection()
		Card.Cold === State ?
			Unselect(ID) :
			Card.Hot === State || Select(ID,Util.T)
		ChangeCount()
	},
	SelAll : function()
	{
		ZED.EachKey(Active,Select)
		ChangeCount()
	},
	UnAll : function()
	{
		ZED.EachKey(Active,Unselect)
		ChangeCount()
	},
	Commit : Queue.New,
	CommitMany : function(Q,X,R,F)
	{
		R = []
		for (F = 0;F < Cold.length;++F)
			Q[Cold[F][KeySite.Unique]] && R.push(Cold[F])
		return Queue.New(R,X)
	},
	CommitAll : function(X){return Cold.length ? Queue.New(Cold,X) : 0},
	Remove : function(Q,R,C,T,F)
	{
		R = 0
		for (F = Cold.length;F;)
		{
			T = Cold[--F]
			C = T[KeySite.Unique]
			if (Q[C])
			{
				++R
				ReleseState(C)
				Cold.splice(F,1)
				ZED.delete_(C,ColdMap)
			}
		}
		ChangeCount()
		return R
	}
}