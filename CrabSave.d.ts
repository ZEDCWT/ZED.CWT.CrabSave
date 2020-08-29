declare module CrabSaveNS
{
	interface CrabSave
	{
		(Q :
		{
			PortWeb? : number
			Data? : string

			GoogleAPIKey? : string
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
		}) : {
			Init : WishNS.Provider<any>

			New(Q : Pick<Task,'Birth' | 'Site' | 'ID' | 'Title' | 'UP' | 'Root' | 'Format'>) : WishNS.Provider<TaskBriefHot>
			Over(Task : number) : WishNS.Provider<TaskOverview>
			Full(Task : number) : WishNS.Provider<Task>
			Del(Task : number) : WishNS.Provider<any>

			Hot(Row : (Q : TaskBriefHot) => any,Down : (E? : any) => any) : any
			Play(Task : number) : WishNS.Provider<any>
			Pause(Task : number) : WishNS.Provider<any>

			TopNoSize(Count : number,From : number) : WishNS.Provider<Pick<Task,'Row' | 'Site' | 'ID' | 'State' | 'Error' | 'Down'>[]>
			SaveInfo(Task : number,Info : Task) : WishNS.Provider<any>
			SaveSize(Task : number,Part : number,File : number,Size : number) : WishNS.Provider<any>
			FillSize(Task : number) : WishNS.Provider<number>
			NewSize(Task : number,Part : number,File : number,Size : number) : WishNS.Provider<number>
			Err(Task : number,State : number,Date : number) : WishNS.Provider<any>
			TopErr(State : number) : WishNS.Provider<number>
			TopQueue(Count : number,From : number,Online : number[]) : WishNS.Provider<Omit<Task,'Part' | 'Down'>[]>
			TopToDown(Task : number) : WishNS.Provider<Down>
			ViewPart(Task : number,Part : number) : WishNS.Provider<Part>

			SavePlay(Task : number,Part : number,File : number,Play : number) : WishNS.Provider<any>
			SaveConn(Task : number,Part : number,File : number,First : number) : WishNS.Provider<any>
			SavePath(Task : number,Part : number,File : number,Path : string) : WishNS.Provider<any>
			SaveHas(Task : number,Part : number,File : number,Has : number,Take : number) : WishNS.Provider<any>
			SaveTake(Task : number,Part : number,File : number,Take : number) : WishNS.Provider<any>
			SaveDone(Task : number,Part : number,File : number,Date : number) : WishNS.Provider<any>

			Hist(Row : (Q : TaskBriefHist) => any,Down : (E? : any) => any) : any
			Final(Task : number,Done : number) : WishNS.Provider<any>
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
		Task : number
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
		Task : number
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
			ErrT(Task : number,Err : any,State : number,At : number) : any

			Req(Q : string | WishNS.RequestOption) : WishNS.RequestOption

			OnRenew(Task : number) : any
			OnRenewDone(Task : number) : any
			OnInfo(Task : number,Info : Task) : any
			OnTitle(Task : number,Title : string) : any
			OnFile(Task : number,Part : number,File : number,Size : number) : any
			OnSize(Task : number,Size : number,Count : number) : any

			OnPlay(Task : number,Part : number,File : number,Play : number) : any
			OnConn(Task : number,Part : number,File : number,Start : number) : any
			OnPath(Task : number,Part : number,File : number,Path : string) : any
			OnHas(Task : number,Part : number,File : number,Has : [number,number]) : any
			OnTake(Task : number,Part : number,File : number,Take : number) : any
			OnDone(Task : number,Part : number,File : number,Date : number) : any

			OnFinal(Task : number,Done : number) : any

			OnEnd() : any
		}) : {
			Info() : any
			Down() : any
			Del(Task : number) : any
			Renewing() : string[]
			Downloading : Map<number,(H : (Q : number) => string) => string>
			Stop(Task : number) : any

			OnSet() : any
		}
	}
}
declare module 'crabsave'
{
	var CrabSave : CrabSaveNS.CrabSave
	export = CrabSave
}