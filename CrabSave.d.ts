declare module CrabSaveNS
{
	interface CrabSave
	{
		(Q :
		{
			PortWeb? : number
			Data? : string
		}) : {
			/**Express.Router*/
			Exp(Express? : object) : object
			/**WS.on('connection')*/
			Soc : Function
		}
	}

	type TaskBriefHot = Pick<Task,'Row' | 'Site' | 'ID' | 'Size'>
	type TaskBriefHist = TaskBriefHot & Pick<Task,'Done'>
	type TaskOverview = Pick<Task,'Title' | 'File' | 'Size' | 'Has' | 'State'>
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

			TopNoSize(Count : number,From : number) : WishNS.Provider<Pick<Task,'Row' | 'Site' | 'ID' | 'State'>[]>
			SaveInfo(Row : number,Info : Task) : WishNS.Provider<any>
			SaveSize(Row : number,Part : number,File : number,Size : number) : WishNS.Provider<any>
			FillSize(Row : number) : WishNS.Provider<number>
			Err(Row : number,State : number,Date : number) : WishNS.Provider<any>

			Hist(Row : (Q : TaskBriefHist) => any,Down : (E? : any) => any) : any
			Done(Task : number) : WishNS.Provider<any>
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
		/** Completed date */
		Done? : number
		/** Part info */
		Part? : Part[]
		/** Download info */
		Down? : Down[]
	}
	interface Part
	{
		/** Row ID of Task */
		Task : number
		/** Part index of the task */
		Part : number
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
	}

	interface Loop
	{
		(Q :
		{
			Setting : SettingO
			Site : ReturnType<SiteAll>
			DB : ReturnType<DB>
			Err(File : string,Err : any) : any
			ErrT(Row : number,Err : any) : any

			OnRenew(Row : number) : any
			OnInfo(Row : number,Info : Task) : any
			OnFile(Row : number,Part : number,File : number,Size : number) : any
			OnSize(Row : number,Size : number,Count : number) : any
		}) : {
			Info() : any
			Del(Task : number) : any
			Renewing() : string[]
		}
	}
}
declare module 'crabsave'
{
	var CrabSave : CrabSaveNS.CrabSave
	export = CrabSave
}