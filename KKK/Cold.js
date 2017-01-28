var
ZED = require('@zed.cwt/zedquery'),

Key = require('./Key').Site,
Event = require('./Event').Cold,
Queue = require('./Queue'),
Lang = require('./Lang'),
L = Lang.L,
DOM = require('./DOM'),
Card = DOM.Card,
Prefix = DOM.NoSelect + ' ' + Card.R + ' ',

LangMap = ZED.ReduceToObject
(
	Card.Init,Lang.Select,
	Card.Cold,Lang.Cold,
	Card.Hot,Lang.Hot,
	Card.History,Lang.History
),

Cold = [],
Map = {},
Active,

Bus = ZED.Emitter(),

Add = function(ID,R)
{
	if (Card.Cold !== Map[ID])
	{
		R = Active[ID]
		R[0].attr(DOM.cls,Prefix + (Map[ID] = Card.Cold)).text(L(Lang.Cold))
		Cold.push(R[1])
	}
},
Remove = function(ID,R,T)
{
	if (Card.Cold === Map[ID])
	{
		R = Active[ID]
		T = Queue.HasOffline(ID)
		R[0].attr(DOM.cls,Prefix + (Map[ID] = T ? Card.History : Card.Init))
			.text(L(T ? Lang.History : Lang.Select))
		R = R[1][Key.Unique]
		ZED.Each(Cold,function(F,V)
		{
			return V[Key.Unique] !== R || (Cold.splice(F,1),false)
		})
	}
},

ChangeCount = function()
{
	Bus.emit(Event.Change,Cold.length)
};

module.exports =
{
	Bus : Bus,
	Cold : function(){return Cold},

	Reset : function(){Active = {}},
	New : function(Target,O,R,S,ID)
	{
		ID = O[Key.Unique]
		S = Map[ID]
		if (!S)
		{
			Map[ID] = S = Queue.HasOnline(ID) ?
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
		var State = Map[ID];

		ZED.ClearSelection()
		if (Card.Cold === State) Remove(ID)
		else if (Card.Hot !== State) Add(ID)
		ChangeCount()
	},
	AddAll : function()
	{
		ZED.EachKey(Active,Add)
		ChangeCount()
	},
	RemoveAll : function()
	{
		ZED.EachKey(Active,Remove)
		ChangeCount()
	},
	Commit : function(Q)
	{
		//TODO
		ChangeCount()
	},
	CommitAll : function()
	{
		//TODO
		ChangeCount()
	}
}