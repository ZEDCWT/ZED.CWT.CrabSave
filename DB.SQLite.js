'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,N : WN} = WW,
SQLite = require('sqlite3');

/**@type {CrabSaveNS.DB}*/
module.exports = Option =>
{
	var
	OptionEnableWAL = false,
	WhenEnableWAL = Q => OptionEnableWAL ? Q : '',

	PathData = Option.PathData,
	PathDB = WN.JoinP(PathData,'DB.db'),

	DB,

	DBMtx = WX.Mtx(),
	DBMake = H => (...Q) => DBMtx(() => WX.Just(null,WX.Sync)).FP(H(...Q)),
	Exec,
	Run_,
	Run,
	Get,
	All,
	Transaction = Q => DBMtx(() => Run_('begin transaction')
		.FMap(() => WX.From(Q)
		.FMapE(V => Run_(V[0],V[1]))
		.ErrAs(E => Run_('rollback')
			.Map(() => WW.Throw(E)))
		.Fin()
		.FMap(() => Run_('commit')))),

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
			DB = new SQLite.Database(PathDB,E =>
			{
				var
				WrapCount = 0,
				WrapOnLog,
				Wrap = H =>
				{
					var
					Count = 0,
					R = WX.WrapNode(DB[H],DB);
					return (...Q) => WX.P(O =>
					{
						var
						Prefix,
						Log = (...Q) =>
						{
							WrapOnLog ||= WN.RollLog(
							{
								Pre : WN.JoinP(Option.PathData,'DBPerf/DBPerf'),
							})
							Prefix ||= `[${WrapCount++}] ${H} {${Count++}}`
							WrapOnLog(WW.StrDate(),WW.Tick(),'|',Prefix,...Q)
						},
						Begin = WW.Now();
						Option.Debug && Log(WW.C.OTJ(Q,{Apos : 9}))
						return R(...Q)
							.Tap(B => Option.Debug && Log(WW.Now() - Begin,WW.StrMS(WW.Now() - Begin),WW.Tag(B)),
								E => Option.Debug && Log(WW.Now() - Begin,WW.StrMS(WW.Now() - Begin),E))
							.Now(O)
					})
				}
				if (E) O.E(E)
				else
				{
					Exec = DBMake(Wrap('exec')),
					Run_ = Wrap('run'),
					Run = DBMake(Run_),
					Get = DBMake(Wrap('get')),
					All = DBMake(Wrap('all')),
					O.D().F()
				}
			})
			DB.serialize()
		})
			.FMap(() => Exec(
			`
				pragma Journal_Mode = ${OptionEnableWAL ? 'WAL' : 'TRUNCATE'};
				${WhenEnableWAL('pragma Synchronous = NORMAL;')}

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
					-- 0 Paused 1 Online 2 Error 3 Done
					State integer,
					Error integer not null,
					Done integer
				);
				-- Maybe too much? --
				create index if not exists TaskSiteID on Task(Site,ID);
				create index if not exists TaskState on Task(State);
				create index if not exists TaskDone on Task(Done);
				create index if not exists TaskSize on Task(Size);
				create index if not exists TaskError on Task(Error);
				-- --
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
				update Task set State = 1 where 2 = State and Done is null;
				update Task set State = 3 where 3 <> State and Done is not null;
				update Task set Error = 0 where 0 <> Error;
			`.replace(/^	{4}/mg,'').trim())),

		New : Task => Get('select Row from Task where Done is null and ? = Site and ? = ID',[Task.Site,Task.ID])
			.FMap(B =>
			{
				var I = Task.Site + ' ' + Task.ID
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
					Task.Birth,
					Task.Site,
					Task.ID,
					Task.Title,
					Task.UP,
					Task.Root,
					Task.Format
				]).Tap(null,
					() => NewPending.delete(I),
					() => NewPending.delete(I))
					.FMap(() => Get(`select ${HotBrief} from Task where Done is null and ? = Site and ? = ID`,[Task.Site,Task.ID]))
					.Tap(B => B || WW.Throw(['ErrDBAddFail',I]))
			}),
		Over : Row => Get(
		`
			select
				Title,UP,File,Size,State,
				Error,
				(select sum(Has) from Down where ? = Task) Has
			from Task where ? = Row
		`,[Row,Row])
			.Map(B => TaskAdjust(Row,B)),
		Full : Row => Get('select * from Task where ? = Row',[Row])
			.FMap(B =>
			{
				TaskAdjust(Row,B)
				return All('select * from Part where ? = Task order by Part',[Row]).FMap(P =>
				{
					B.Part = P
					return All('select * from Down where ? = Task order by Part,File',[Row])
				}).Map(N =>
				{
					B.Down = N
					return B
				})
			}),
		Del : Row => Get('select Done from Task where ? = Row',[Row])
			.FMap(B => Transaction(
			[
				['delete from Task where ? = Row',[Row]],
				['delete from Part where ? = Task',[Row]],
				['delete from Down where ? = Task',[Row]],
			]).Map(() => B && B.Done)),

		Count : () => Get('select count(*) Count from Task')
			.Map(V => V.Count),
		Brief : (Row,Limit) => All(
		`
			select ${HistBrief} from Task
			where ? < Row
			order by Row
			limit ?
		`,[Row,Limit]),

		Play : Row => Run(`update Task set State = 1 where ? = Row and 0 = State and Done is null`,[Row]),
		Pause : Row => Run(`update Task set State = 0,Error = 0 where ? = Row and Done is null`,[Row]),
		PlayRange : (RowMinIncluded,RowMaxExcluded) => Run(`update Task set State = 1 where ? <= Row and Row < ? and 0 = State and Done is null`,[RowMinIncluded,RowMaxExcluded]),
		PauseRange : (RowMinIncluded,RowMaxExcluded) => Run(`update Task set State = 0,Error = 0 where ? <= Row and Row < ? and Done is null`,[RowMinIncluded,RowMaxExcluded]),

		TopNoSize : (Count,From) => All(
		`
			select * from Task
			where
				Done is null
				and
				(Size is null or 2 = State)
				and
				Error < ?
			order by
				(case when 0 = State then 1 else 0 end),
				Row
			limit ?
		`,[From,Count]).FMap(R => WX.From(R)
			.FMapE(V => All('select Part,File,Size,Done from Down where ? = Task order by Part,File',[V.Row])
				.Tap(Down => V.Down = Down))
			.Fin()
			.Map(() => R)),
		SaveInfo : (Row,Info) => Transaction(
		[
			[`
				update Task set
					State = case when 2 = State then 1 else State end,
					Title = ?,
					UP = ?,
					UPAt = ?,
					File = ?,
					-- Size = ?,
					Error = 0
				where ? = Row
			`,[
				Info.Title,
				Info.UP,
				Info.UPAt,
				Info.Down.length,
				// Q.Size,
				Row
			]],
			...WR.Map(V =>
			[
				`
					insert into Part(Task,Part,Total,File,Title)
						select ?,?,?,?,?
						where not exists(select * from Part where ? = Task and ? = Part)
				`,
				[
					Row,V.Part,
					Info.PartTotal,V.File,
					V.Title,
					Row,V.Part
				]
			],Info.Part),
			...WR.Map(V =>
			[
				`
					insert into Down(Task,Part,File,Has,Play,Take)
						select ?,?,?,0,0,0
						where not exists(select * from Down where ? = Task and ? = Part and ? = File)
				`,
				[
					Row,V.Part,V.File,
					Row,V.Part,V.File
				]
			],Info.Down),
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
					Row,V.Part,V.File
				]
			],Info.Down),
			[`
				update Task set
					Size = (select sum(Size) from Down where ? = Task)
				where ? = Row
			`,[Row,Row]],
		]),
		SaveSize : (Row,Part,File,Size) => Run(
		`
			update Down set Size = ?
			where ? = Task and ? = Part and ? = File and Done is null
		`,[Size,Row,Part,File]),
		FillSize : Row => Run(
		`
			update Task set
				Size = (select sum(Size) from Down where ? = Task)
			where ? = Row
		`,[Row,Row])
			.FMap(() => Get(`select Size from Task where ? = Row`,[Row]))
			.Map(V => V.Size),
		NewSize : (Row,Part,File,Size) => Transaction(
		[
			[`
				update Down set Size = ?
				where ? = Task and ? = Part and ? = File
			`,[Size,Row,Part,File]],
			[`
				update Task set
					Size = (select sum(Size) from Down where ? = Task)
				where ? = Row
			`,[Row,Row]]
		])
			.FMap(() => Get(`select Size from Task where ? = Row`,[Row]))
			.Map(V => V.Size),
		Err : (Row,State,Date) => Run(
		`
			update Task set
				State = case when 0 = State then 0 else ? end,
				Error = ?
			where ? = Row
		`,[State,Date,Row]),
		TopErr : State => Get('select Error from Task where ? = State and 0 < Error order by Error limit 1',[State])
			.Map(V => V && V.Error),
		TopQueue : (Count,From,Online) => All(
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
				Row not in (${Online})
			order by Row
			limit ?
		`,[From,Count]),
		TopToDown : Row => Get(
		`
			select
				*,
				(select count(distinct Ext) from Down where D.Task = Task and D.Part = Part) ExtCount
			from Down D
			where
				? = Task
				and
				Done is null
			order by Part,File
		`,[Row]),
		ViewPart : (Row,Part) => false === Part ?
			Get(`select * from Part where ? = Task`,[Row]) :
			Get(
			`
				select * from Part
				where ? = Task and ? = Part
			`,[Row,Part]),

		SavePlay : (Row,Part,File,Play) => Run(
		`
			update Down set Play = ?
			where ? = Task and ? = Part and ? = File
		`,[Play,Row,Part,File]),
		SaveConn : (Row,Part,File,First) => Run(
		`
			update Down set First = ?
			where ? = Task and ? = Part and ? = File and First is null
		`,[First,Row,Part,File]),
		SavePath : (Row,Part,File,Path) => Run(
		`
			update Down set Path = ?
			where ? = Task and ? = Part and ? = File
		`,[Path,Row,Part,File]),
		SaveHas : (Row,Part,File,Has,Take) => Run(
		`
			update Down set Has = ?,Take = ?
			where ? = Task and ? = Part and ? = File
		`,[Has,Take,Row,Part,File]),
		SaveTake : (Row,Part,File,Take) => Run(
		`
			update Down set Take = ?
			where ? = Task and ? = Part and ? = File
		`,[Take,Row,Part,File]),
		SaveDone : (Row,Part,File,Done,ResetURL) => Run(
		`
			update Down set
				${ResetURL ? 'URL = null,' : ''}
				Done = ?
			where ? = Task and ? = Part and ? = File
		`,[Done,Row,Part,File]),

		/*
			Previously we leave the `State` as is
			Forcing it scan the whole history part whenever querying `TopErr`, `TopQueue`
			Which is REALLY bad...
			For record, with about 12E5 history tasks, a `Top` query may take 800ms
		*/
		Final : (Row,Done) => Run(
		`
			update Task set
				State = 3,
				Error = 0,
				Done = ?
			where ? = Row
		`,[Done,Row]),

		Vacuum : () => Exec(`
			vacuum;
			${WhenEnableWAL('pragma WAL_CheckPoint(Truncate)')}
		`),
		Stat : () => WN.Exist(PathDB),

		Site :
		{
			BiliBiliCID : ID => All(
			`
				select ID,URL from Task,Down D
				where
					Row = Task and
					Site = 'BiliBili' and
					? <= ID and ID < ? and
					0 <= Part and
					0 = D.File
			`,[String(ID),ID + '$'])
				.Map(B => WR.Reduce((D,V) =>
				{
					V = WW.MF(/#(\d+$)/,V.ID) ||
						WW.MF(/\/(\d+)[-_][\d\w-]+\.\w+\?/,V.URL)
					V && (D[V] = -~D[V])
				},{},B)),
		},

		Run
	}
}