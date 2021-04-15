'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,N : WN} = WW,
SQLite = require('sqlite3');

/**@type {CrabSaveNS.DB}*/
module.exports = Option =>
{
	var
	PathData = Option.PathData,

	DB,

	DBLocked,
	DBLockQueue = [],
	DBGetLock = T => DBLocked ?
		DBLockQueue.push(T = WX.Repeater()) && T :
		WX.Just(0,WX.Sync),
	DBQueue,
	DBGetQueue = () => DBLocked ?
		DBQueue = DBQueue || WX.Repeater() :
		WX.Just(0,WX.Sync),
	DBMake = H => (...Q) => DBGetQueue().FMap(() => H(...Q)),
	Exec,
	Run_,
	Run,
	Get,
	All,
	TransactionEnd = () =>
	{
		DBLocked = false
		if (DBQueue)
		{
			DBQueue.D().F()
			DBQueue = false
		}
		if (DBLockQueue.length)
			DBLockQueue.shift().D().F()
	},
	Transaction = Q => WX.Provider(O =>
	{
		var
		Locked,
		E = DBGetLock()
			.FMap(() =>
			(
				Locked = true,
				DBLocked = true,
				Run_('begin transaction')
			))
			.FMap(() => WX.From(Q)
				.FMapO(1,V => Run_(V[0],V[1]))
				.ErrAs(E => Run_('rollback')
					.Map(() => WW.Throw(E)))
				.Fin()
				.FMap(() => Run_('commit')))
			.Now(null,E =>
			{
				Locked = false
				O.E(E)
				TransactionEnd()
			},() =>
			{
				Locked = false
				O.D().F()
				TransactionEnd()
			})
		return () =>
		{
			E()
			Locked && DBLocked && TransactionEnd()
		}
	}),

	HotBrief = 'Row,Site,ID,Size',
	HistBrief = HotBrief + ',Done',

	NewPending = new Set,
	TaskAdjust = (S,Q) =>
	{
		Q || WW.Throw(['ErrDBNo',S])
		return Q
	};
	return {
		Init : WX.Provider(O =>
		{
			DB = new SQLite.Database(WN.JoinP(PathData,'DB.db'),E =>
			{
				if (E) O.E(E)
				else
				{
					Exec = DBMake(WX.WrapNode(DB.exec,DB)),
					Run_ = WX.WrapNode(DB.run,DB),
					Run = DBMake(Run_),
					Get = DBMake(WX.WrapNode(DB.get,DB)),
					All = DBMake(WX.WrapNode(DB.all,DB)),
					O.D().F()
				}
			})
			DB.serialize()
		})
			.FMap(() => Exec(
			`
				create table if not exists Task
				(
					Row integer primary key autoincrement,
					Birth integer,
					Site text not null,
					ID text not null,
					Title text,
					UP text,
					UPAt integer,
					File integer,
					Size integer,
					Root text,
					Format text,
					-- 0 Paused 1 Online 2 Error
					State integer,
					Error integer not null,
					Done integer
				);
				create table if not exists Part
				(
					Task integer not null,
					Part integer not null,
					Total integer,
					File integer,
					Title text,

					primary key (Task,Part)
				);
				create table if not exists Down
				(
					Task integer not null,
					Part integer not null,
					File integer not null,
					URL text,
					Ext text,
					Size integer,
					Path text,
					Has integer,
					First integer,
					Play integer,
					Take integer,
					Done integer,

					primary key (Task,Part,File)
				);
				insert into SQLite_Sequence(Name,Seq)
					select 'Task',799999999 where not exists(select * from SQLite_Sequence where 'Task' = Name);
				update Task set State = 1 where 2 = State;
				update Task set Error = 0 where 0 <> Error;
			`.replace(/^	{4}/mg,'').trim())),

		New : Q => Get('select Row from Task where Done is null and ? = Site and ? = ID',[Q.Site,Q.ID])
			.FMap(B =>
			{
				var I = Q.Site + ' ' + Q.ID
				B && WW.Throw(['ErrDBHas',I])
				NewPending.has(I) && WW.Throw(['ErrDBAdding',I])
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
						Root,
						Format,
						State,
						Error
					)
					values
					(
						?,?,?,?,?,
						?,?,
						1,0
					)
				`,[
					Q.Birth,
					Q.Site,
					Q.ID,
					Q.Title,
					Q.UP,
					Q.Root,
					Q.Format
				]).Tap(null,
					() => NewPending.delete(I),
					() => NewPending.delete(I))
					.FMap(() => Get(`select ${HotBrief} from Task where Done is null and ? = Site and ? = ID`,[Q.Site,Q.ID]))
					.Tap(B => B || WW.Throw(['ErrDBAddFail',I]))
			}),
		Over : Q => Get(
		`
			select
				Title,File,Size,State,
				Error,
				(select sum(Has) from Down where ? = Task) Has
			from Task where ? = Row
		`,[Q,Q])
			.Map(B => TaskAdjust(Q,B)),
		Full : Q => Get('select * from Task where ? = Row',[Q])
			.FMap(B =>
			{
				TaskAdjust(Q,B)
				return All('select * from Part where ? = Task order by Part',[Q]).FMap(P =>
				{
					B.Part = P
					return All('select * from Down where ? = Task order by Part,File',[Q])
				}).Map(N =>
				{
					B.Down = N
					return B
				})
			}),
		Del : Q => Get('select Done from Task where ? = Row',[Q])
			.FMap(B => Exec(
			`
				begin transaction;
					delete from Task where ${Q = String(Q).replace(/\D/g,'')} = Row;
					delete from Part where ${Q} = Task;
					delete from Down where ${Q} = Task;
				commit
			`).Map(() => B && B.Done)),

		Hot : (Q,S) => DB.each(`select ${HotBrief} from Task where Done is null order by Row`,
			(E,V) => E || Q(V),
			S),
		Play : Q => Run(`update Task set State = 1 where ? = Row and 0 = State and Done is null`,[Q]),
		Pause : Q => Run(`update Task set State = 0,Error = 0 where ? = Row and Done is null`,[Q]),

		TopNoSize : (S,Q) => All(
		`
			select Row,Site,ID,Title,State,Error from Task
			where
				Done is null
				and
				(Size is null or 2 = State)
				and
				Error < ?
			order by Row
			limit ?
		`,[Q,S]).FMap(R => WX.From(R)
			.FMapO(1,V => All('select Part,File,Size,Done from Down where ? = Task order by Part,File',[V.Row])
				.Tap(Down => V.Down = Down))
			.Fin()
			.Map(() => R)),
		SaveInfo : (S,Q) => Transaction(
		[
			[`
				update Task set
					State = case when 2 = State then 1 else State end,
					Title = ?,
					UP = ?,
					UPAt = ?,
					File = ?,
					Size = ?,
					Error = 0
				where ? = Row
			`,[
				Q.Title,
				Q.UP,
				Q.UPAt,
				Q.Down.length,
				Q.Size,
				S
			]],
			...WR.Map(V =>
			[
				`
					insert into Part(Task,Part,Total,File,Title)
						select ?,?,?,?,?
						where not exists(select * from Part where ? = Task and ? = Part)
				`,
				[
					S,V.Part,
					Q.PartTotal,V.File,
					V.Title,
					S,V.Part
				]
			],Q.Part),
			...WR.Map(V =>
			[
				`
					insert into Down(Task,Part,File,Has,Play,Take)
						select ?,?,?,0,0,0
						where not exists(select * from Down where ? = Task and ? = Part and ? = File)
				`,
				[
					S,V.Part,V.File,
					S,V.Part,V.File
				]
			],Q.Down),
			...WR.Map(V =>
			[
				`
					update Down set
						URL = ?,
						Ext = ?,
						Size = ?
					where ? = Task and ? = Part and ? = File and Done is null
				`,
				[
					V.URL,V.Ext,V.Size,
					S,V.Part,V.File
				]
			],Q.Down)
		]),
		SaveSize : (Row,Part,File,Q) => Run(
		`
			update Down set Size = ?
			where ? = Task and ? = Part and ? = File and Done is null
		`,[Q,Row,Part,File]),
		FillSize : Q => Run(
		`
			update Task set
				Size = (select sum(Size) from Down where ? = Task)
			where ? = Row
		`,[Q,Q])
			.FMap(() => Get(`select Size from Task where ? = Row`,[Q]))
			.Map(V => V.Size),
		NewSize : (Row,Part,File,Q) => Transaction(
		[
			[`
				update Down set Size = ?
				where ? = Task and ? = Part and ? = File
			`,[Q,Row,Part,File]],
			[`
				update Task set
					Size = (select sum(Size) from Down where ? = Task)
				where ? = Row
			`,[Row,Row]]
		])
			.FMap(() => Get(`select Size from Task where ? = Row`,[Row]))
			.Map(V => V.Size),
		Err : (Q,S,E) => Run(
		`
			update Task set
				State = case when 0 = State then 0 else ? end,
				Error = ?
			where ? = Row
		`,[S,E,Q]),
		TopErr : S => Get('select Error from Task where ? = State and 0 < Error order by Error limit 1',[S])
			.Map(V => V && V.Error),
		TopQueue : (S,Q,O) => All(
		`
			select
				*,
				(select sum(Has) from Down where T.Row = Task) Has
			from Task T where
				Done is null
				and
				1 = State
				and
				Size is not null
				and
				Error < ?
				and
				Row not in (${O})
			order by Row
			limit ?
		`,[Q,S]),
		TopToDown : Q => Get(
		`
			select * from Down
			where
				? = Task
				and
				Done is null
			order by Part,File
		`,[Q]),
		ViewPart : (Q,S) => Get(
		`
			select * from Part
			where ? = Task and ? = Part
		`,[Q,S]),

		SavePlay : (Q,W,E,S) => Run(
		`
			update Down set Play = ?
			where ? = Task and ? = Part and ? = File
		`,[S,Q,W,E]),
		SaveConn : (Q,W,E,S) => Run(
		`
			update Down set First = ?
			where ? = Task and ? = Part and ? = File and First is null
		`,[S,Q,W,E]),
		SavePath : (Q,W,E,S) => Run(
		`
			update Down set Path = ?
			where ? = Task and ? = Part and ? = File
		`,[S,Q,W,E]),
		SaveHas : (Q,W,E,S,K) => Run(
		`
			update Down set Has = ?,Take = ?
			where ? = Task and ? = Part and ? = File
		`,[S,K,Q,W,E]),
		SaveTake : (Q,W,E,S) => Run(
		`
			update Down set Take = ?
			where ? = Task and ? = Part and ? = File
		`,[S,Q,W,E]),
		SaveDone : (Q,W,E,S) => Run(
		`
			update Down set Done = ?
			where ? = Task and ? = Part and ? = File
		`,[S,Q,W,E]),

		Hist : (Q,S) => DB.each(`select ${HistBrief} from Task where Done is not null order by Done desc,Row`,
			(E,V) => E || Q(V),
			S),
		Final : (Q,S) => Run(
		`
			update Task set
				Error = 0,
				Done = ?
			where ? = Row
		`,[S,Q]),

		Run
	}
}