'use strict'
var
WW = require('@zed.cwt/wish'),
{X : WX,N : WN} = WW,
SQLite = require('sqlite3');

/**@type {CrabSaveNS.DB}*/
module.exports = Option =>
{
	var
	PathData = Option.PathData,

	DBInit = WX.Repeater(),
	DB = new SQLite.Database(WN.JoinP(PathData,'DB.db'),E =>
	{
		E ?
			DBInit.E(E) :
			DBInit.F()
	}),

	Exec = WX.WrapNode(DB.exec,DB),
	Run = WX.WrapNode(DB.run,DB),
	Get = WX.WrapNode(DB.get,DB),
	All = WX.WrapNode(DB.all,DB),

	HotBrief = 'Row,Site,ID,Size',
	HistBrief = HotBrief + ',Done',

	NewPending = new Set,
	TaskAdjust = Q =>
	{
		if (Q)
		{
			if ('Part' in Q)
				Q.Part = WW.IsStr(Q.Part) ?
					Q.Part.split(' ').map(Number) :
					[]
		}
		else WW.Throw('Not exists')
		return Q
	};

	return {
		Init : DBInit.Fin()
			.FMap(() => Exec(
			`
				create table if not exists Task
				(
					Row integer primary key autoincrement,
					Birth integer,
					Site text not null,
					ID text not null,
					Title text not null,
					UP text,
					UPAt integer,
					Part text,
					Size integer,
					Root text,
					Format text,
					State integer,
					Done integer unique
				);
				create table if not exists Down
				(
					Task integer not null,
					Part integer not null,
					URL text,
					Ext text,
					Size integer,
					Path text,
					Has integer,
					First integer,
					Play integer,
					Take integer,

					primary key (Task,Part)
				);
				insert into SQLite_Sequence(Name,Seq)
					select 'Task',799999999 where not exists(select * from SQLite_Sequence where 'Task' = Name);
			`.replace(/^	{4}/mg,'').trim())),

		New : Q => Get('select Row from Task where Done is null and ? = Site and ? = ID',[Q.Site,Q.ID])
			.FMap(B =>
			{
				var I = Q.Site + ' ' + Q.ID
				B && WW.Throw('Hot list already contains ' + I)
				NewPending.has(I) && WW.Throw('Already added ' + I)
				NewPending.add(I)
				return Run(
				`
					insert into Task
					(
						Birth,
						Site,
						ID,
						Title,
						UP,
						State
					)
					values(?,?,?,?,?,1)
				`,[
					Q.Birth,
					Q.Site,
					Q.ID,
					Q.Title,
					Q.UP
				]).Tap(null,
					() => NewPending.delete(I),
					() => NewPending.delete(I))
					.FMap(() => Get(`select ${HotBrief} from Task where ? = Site and ? = ID`,[Q.Site,Q.ID]))
					.Tap(B => B || WW.Throw('Unknown error occured while adding ' + I))
			}),
		Over : Q => Get('select Title,Part,Size,State from Task where ? = Row',[Q])
			.Map(TaskAdjust),
		Full : Q => Get('select * from Task where ? = Row order by Part',[Q])
			.FMap(B =>
			{
				TaskAdjust(B)
				return All('select * from Down where ? = Task ',[Q]).Map(N =>
				{
					B.Down = N
					return B
				})
			}),
		Del : Q => Exec(
		`
			begin transaction;
				delete from Task where ? = ID;
				delete from Down where ? = Task;
			commit
		`,[Q,Q]),

		Hot : (Q,S) => DB.each(`select ${HotBrief} from Task where Done is null order by Row`,
			(E,V) => E || Q(V),
			S),
		Play : Q => Run(`update Task set State = 1 where ? = Row`,[Q]),
		Pause : Q => Run(`update Task set State = 0 where ? = Row`,[Q]),

		Hist : (Q,S) => DB.each(`select ${HistBrief} from Task where Done is not null order by Done desc`,
			(E,V) => E || Q(V),
			S),
	}
}