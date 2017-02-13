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

Cold = [{
	"C": 1,
	"=": 7964909,
	"S": "http://i0.hdslb.com/bfs/archive/8c596e4c078d3a8adf7484d6858e54451f93ca7f.jpg",
	"O/": "舌尖下的屌丝特别版：模仿印度乡村料理咖喱鸡",
	"Z/": "老虎与马",
	"y/": "2017-01-11T21:12:21.000Z",
	"q": "Bilibili",
	"A": "Bilibili.7964909"
},{
	"C": 1,
	"=": 9,
	"S": "http://i0.hdslb.com/bfs/archive/8c596e4c078d3a8adf7484d6858e54451f93ca7f.jpg",
	"O/": "\u2468",
	"Z/": "BISHI",
	"y/": "2017-01-11T21:12:21.000Z",
	"q": "Bilibili",
	"A": "Bilibili.9"
}],
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
	T = Queue.CardMap[ID]
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
		StatusMap[ID] = Queue.CardMap[ID] ? Card.History : Card.Init
};

Bus.on(EventQueue.Newed,function(R)
{
	var M = {},F;

	for (F = R.length;F;) M[R[--F][KeyQueue.Unique]] = Util.T
	for (F = Cold.length;F;)
	{
		R = Cold[--F][KeySite.Unique]
		if (M[R])
		{
			Cold.splice(F,1)
			ZED.delete_(R,ColdMap)
		}
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
				T = Active[C]
				T && ReleseState(T,C)
				Cold.splice(F,1)
				ZED.delete_(C,ColdMap)
			}
		}
		return R
	},
	CommitAll : function(R,T,F)
	{
		if (F = Cold.length)
		{
			R = {}
			for (;F;)
			{
				T = Cold[--F]
				R[T[KeySite.Unique]] = T
			}
			return Queue.New(R)
		}
		return 0
	}
}