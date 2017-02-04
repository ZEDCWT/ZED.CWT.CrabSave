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
	Card.Init,Lang.Select,
	Card.Cold,Lang.Cold,
	Card.Hot,Lang.Hot,
	Card.History,Lang.History
),

Cold = [],
ColdMap = {},
StatusMap = {},
Active = {},

Select = function(ID,J,R)
{
	if (Card.Init === StatusMap[ID] || (J && Card.History === StatusMap[ID]))
	{
		R = Active[ID]
		R[0].attr(DOM.cls,Prefix + (StatusMap[ID] = Card.Cold)).text(L(Lang.Cold))
		Cold.push(ColdMap[ID] = R[1])
	}
},
ReleseState = function(R,ID,T)
{
	T = Queue.HasOffline(ID)
	R[0].attr(DOM.cls,Prefix + (StatusMap[ID] = T ? Card.History : Card.Init))
		.text(L(T ? Lang.History : Lang.Select))
},
Unselect = function(ID,R,T)
{
	if (Card.Cold === StatusMap[ID])
	{
		R = Active[ID]
		ReleseState(R,ID)
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

Commit = function(Q,ID,R)
{
	ID = Q[KeySite.Unique]
	R = Active[ID]
	R && R[0].attr(DOM.cls,Prefix + (StatusMap[ID] = Card.Hot)).text(L(Lang.Hot))
	Queue.New(Q)
},
Remove = function(Q,ID)
{
	ID = Q[KeySite.Unique]
	Q = Active[ID]
	Q && ReleseState(Q,ID)
},

MakeAction = ZED.curry(function(H,Q)
{
	var R = 0,T,F;

	for (F = Cold.length;F;)
	{
		T = Cold[--F]
		if (Q[T[KeySite.Unique]])
		{
			++R
			H(T)
			Cold.splice(F,1)
			ZED.delete_(T[KeySite.Unique],ColdMap)
		}
	}
	ChangeCount()
	return R
}),

ChangeCount = function()
{
	Bus.emit(EventCold.Change,Cold.length)
},

RefreshState = function(ID,R)
{
	ID = ID[KeyQueue.Unique]
	R = Active[ID]
	R ?
		ReleseState(R,ID) :
		StatusMap[ID] = Queue.HasOffline(ID) ? Card.History : Card.Init
};

Bus.on(EventQueue.Remove,RefreshState)
	.on(EventQueue.Finish,RefreshState)
	.on(EventQueue.Bye,RefreshState)

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
			StatusMap[ID] = S = Queue.HasOnline(ID) ?
				Card.Hot :
				Queue.HasOffline(ID) ?
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
	Commit : MakeAction(Commit),
	Remove : MakeAction(Remove),
	CommitAll : function(R)
	{
		if (R = Cold.length)
		{
			ZED.each(function(V)
			{
				Commit(V)
				ZED.delete_(V[KeySite.Unique],ColdMap)
			},Cold)
			Cold.length = 0
			ChangeCount()
		}
		return R
	}
}