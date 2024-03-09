declare module CrabSaveNS
{
	interface CrabSave
	{
		(Q :
		{
			PortWeb? : number
			Data? : string

			GoogleAPIKey? : string

			UnsafeExport? : boolean
		}) : {
			/**Express.Router*/
			Exp(Express? : object) : object
			/**WS.on('connection')*/
			Soc : Function
		}
	}

	type TaskBriefHot = Pick<Task,'Row' | 'Site' | 'ID' | 'Size'>
	type TaskBriefHist = TaskBriefHot & Pick<Task,'Done'>
	type TaskOverview = Pick<Task,'Title' | 'File' | 'Size' | 'Has' | 'State' | 'Error'>
	interface DB
	{
		(Q :
		{
			PathData : string
			Debug : boolean
		}) : {
			Init : WishNS.Provider<any>

			New(Task : Pick<Task,'Birth' | 'Site' | 'ID' | 'Title' | 'UP' | 'Root' | 'Format'>) : WishNS.Provider<TaskBriefHot>
			Over(Row : number) : WishNS.Provider<TaskOverview>
			Full(Row : number) : WishNS.Provider<Task>
			Del(Row : number) : WishNS.Provider<any>

			Count() : WishNS.Provider<number>
			Brief(Row : number,Limit : number) : WishNS.Provider<TaskBriefHist[]>

			Play(Row : number) : WishNS.Provider<any>
			Pause(Row : number) : WishNS.Provider<any>

			TopNoSize(Count : number,From : number) : WishNS.Provider<Pick<Task,'Row' | 'Site' | 'ID' | 'State' | 'Error' | 'Down'>[]>
			SaveInfo(Row : number,Info : Omit<Task,'Size'> &
			{
				Meta? : string
				Cover? : string
			}) : WishNS.Provider<any>
			SaveSize(Row : number,Part : number,File : number,Size : number) : WishNS.Provider<any>
			FillSize(Row : number) : WishNS.Provider<number>
			NewSize(Row : number,Part : number,File : number,Size : number) : WishNS.Provider<number>
			Err(Row : number,State : number,Date : number) : WishNS.Provider<any>
			TopErr(State : number) : WishNS.Provider<number>
			TopQueue(Count : number,From : number,Online : number[]) : WishNS.Provider<Omit<Task,'Part' | 'Down'>[]>
			TopToDown(Row : number) : WishNS.Provider<Down &
			{
				ExtCount : number
			}>
			ViewPart(Row : number,Part : number | false) : WishNS.Provider<Part>

			SavePlay(Row : number,Part : number,File : number,Play : number) : WishNS.Provider<any>
			SaveConn(Row : number,Part : number,File : number,First : number) : WishNS.Provider<any>
			SavePath(Row : number,Part : number,File : number,Path : string) : WishNS.Provider<any>
			SaveHas(Row : number,Part : number,File : number,Has : number,Take : number) : WishNS.Provider<any>
			SaveTake(Row : number,Part : number,File : number,Take : number) : WishNS.Provider<any>
			SaveDone(Row : number,Part : number,File : number,Done : number,ResetURL : boolean) : WishNS.Provider<any>

			Final(Row : number,Done : number) : WishNS.Provider<any>

			Vacuum() : WishNS.Provider<any>
			Stat() : WishNS.Provider<import('fs').Stats?>

			Site :
			{
				[K : string] : <U,N>(Q : U) => WishNS.Provider<N>
			}
		}
	}
	interface Task
	{
		/** Unique ID, ascending order as inserted */
		Row : number
		/** Created date */
		Birth : number
		/** Site ID */
		Site : string
		/** Video ID */
		ID : string
		/** Title */
		Title : string
		/** Uploader */
		UP? : string
		/** Uploaded date */
		UPAt? : number
		/** Files count */
		File? : number
		/** Totol size in Byte */
		Size? : number
		/** Downloaded size in Byte */
		Has? : number
		/** Root directory, determined on creation */
		Root? : string
		/** File name format, determined on creation */
		Format? : string
		/** 0 : Paused. 1 : Running. 2 : Need to refresh info */
		State? : 0 | 1 | 2
		/** Error occured date */
		Error? : number
		/** Completed date */
		Done? : number
		/** Part info */
		Part? : Part[]
		/** Specially used when saving infomation */
		PartTotal? : number
		/** Download info */
		Down? : Down[]
	}
	interface Part
	{
		/** Row ID of Task */
		Row : number
		/** Part index of the task */
		Part : number
		/** Total part count */
		Total : number
		/** Count of files of the part */
		File : number
		/** Title of the part */
		Title? : string
	}
	interface Down
	{
		/** Row ID of Task */
		Row : number
		/** Part index of the task */
		Part : number
		/** File index of the part */
		File : number
		/** Download link */
		URL : string
		/** File name extension */
		Ext : string
		/** Size in Byte */
		Size? : number
		/** Path for saving */
		Path? : string
		/** Downloaded Byte */
		Has? : number
		/** First run date */
		First? : number
		/** Count of requesting times. Including pause & play and auto retrying */
		Play? : number
		/** Total download time in ms */
		Take? : number
		/** Completed date */
		Done? : number
	}

	interface Loop
	{
		(Q :
		{
			Setting : SettingO
			Site : ReturnType<SiteAll>
			DB : ReturnType<DB>
			Err(File : string,Err : any) : any
			ErrT(Row : number,Err : any,State : number,At : number) : any

			Req(Q : string | WishNS.RequestOption) : WishNS.RequestOption

			OnRenew(Row : number) : any
			OnRenewDone(Row : number) : any
			OnInfo(Row : number,Info : Task) : any
			OnTitle(Row : number,Title : string) : any
			OnFile(Row : number,Part : number,File : number,Size : number) : any
			OnSize(Row : number,File : number,Size : number) : any

			OnPlay(Row : number,Part : number,File : number,Play : number) : any
			OnConn(Row : number,Part : number,File : number,Start : number) : any
			OnPath(Row : number,Part : number,File : number,Path : string) : any
			OnHas(Row : number,Part : number,File : number,Has : number,Take : number) : any
			OnTake(Row : number,Part : number,File : number,Take : number) : any
			OnDone(Row : number,Part : number,File : number,Date : number) : any

			OnFinal(Row : number,Done : number) : any

			OnEnd() : any
		}) : {
			Info() : void
			Down() : void
			Del(Row : number) : void
			Renewing() : number[]
			Downloading : Map<number,(H : (Q : number) => any) => void>
			Stop(Row : number,SuppressDispatch? : boolean) : void

			OnSet() : void
		}
	}
}
declare module 'crabsave'
{
	var CrabSave : CrabSaveNS.CrabSave
	export = CrabSave
}