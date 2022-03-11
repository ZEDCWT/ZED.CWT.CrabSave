'use strict'
/*
	Tool to transform NeDB of V0 to SQLite of V1
	Usage : `node __filename ${Path to the directory containing file named Offline}`
*/
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
FS = require('fs'),
PathData = process.argv[2],
DBSQL = require('../DB.SQLite')({PathData}),
DBNe = FS.openSync(WN.JoinP(PathData,'Offline'),'r'),
Buff,BuffRead = Buffer.alloc(1024),
DBNeDone,
Key =
{
	Unique : '3',
	Name : 'Z',
	ID : 'v',
	IDHis : '~',
	Title : 'L',
	Created : 'U',
	Finished : 'w',
	Active : '?',
	Author : ']',
	Date : 'q',
	Part : '<',
	URL : '{',
	Suffix : ':',
	Size : '(',
	Sizes : 'C',
	Done : 'i',
	DoneSum : 'Y',
	Format : 'V',
	Root : 'F',
	Dir : '@',
	File : '`'
},
NameMap =
{
	Bilibili : 'BiliBili'
};
DBSQL.Init
	.FMap(() => WX.TCO(N =>
	{
		var
		R,T;
		T = Buff ? Buff.indexOf(10) : -1
		if (T < 0 && !DBNeDone)
		{
			for (;
				DBNeDone = FS.readSync(DBNe,BuffRead,0,BuffRead.length) < BuffRead.length,
				Buff = Buff ? Buffer.concat([Buff,BuffRead]) : Buffer.from(BuffRead),
				!DBNeDone && !BuffRead.includes(10)
			;);
			T = Buff.indexOf(10)
		}
		if (T < 0) return WX.Just([false])
		R = WC.JTO(Buff.slice(0,T).toString('UTF8'))
		Buff = Buff.slice(-~T)
		T = 0
		R._id && console.log(N,R._id,R[Key.Name],R[Key.ID])
		return R._id ?
			WX.From(
			[
				[`
					insert into Task(Row,Birth,Site,ID,Title,UP,UPAt,File,Size,Root,Format,State,Error,Done)
						values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
				`,[
					R._id,
					R[Key.Created],
					NameMap[R[Key.Name]] || R[Key.Name],
					R[Key.ID],
					R[Key.Title],
					R[Key.Author],
					R[Key.Date],
					R[Key.Sizes].length,
					R[Key.Size],
					R[Key.Dir],
					R[Key.Format],
					0,
					0,
					R[Key.Finished],
				]],
				...WR.MapU((Part,F) => [
				`
					insert into Part(Task,Part,Total,File,Title)
						values(?,?,?,?,?)
				`,[
					R._id,
					F,
					R[Key.Part].length,
					Part[Key.URL].length,
					Part[Key.Title]
				]],R[Key.Part]),
				...WR.Unnest(WR.MapU((Part,F) => WR.MapU((URL,G) => [
				`
					insert into Down(Task,Part,File,URL,Ext,Size,Path,Has)
						values(?,?,?,?,?,?,?,?)
				`,[
					R._id,
					F,
					G,
					URL,
					WW.IsArr(Part[Key.Suffix]) ? Part[Key.Suffix][G] : Part[Key.Suffix],
					R[Key.Sizes][T],
					R[Key.File][T],
					R[Key.Sizes][T++]
				]],Part[Key.URL]),R[Key.Part]))
			]).FMapE(V => DBSQL.Run(V[0],V[1]))
				.Fin()
				.Map(() => [true,-~N]) :
			WX.Just([false])
	},0))
	.Now(null,E => console.log('{ERROR}',E),() => console.log('Done'))