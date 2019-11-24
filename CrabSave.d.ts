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
	type TaskOverview = Pick<Task,'Title' | 'Part' | 'Size' | 'State'>
	interface DB
	{
		(Q :
		{
			PathData : string
		}) : {
			Init : WishNS.Provider<any>

			New(Q : Pick<Task,'Birth' | 'Site' | 'ID' | 'Title' | 'UP'>) : WishNS.Provider<TaskBriefHot>
			Over(Task : number) : WishNS.Provider<TaskOverview>
			Full(Task : number) : WishNS.Provider<Task>
			Del(Task : number) : WishNS.Provider<any>

			Hot(Row : (Q : TaskBriefHot) => any,Down : (E? : any) => any) : any
			Play(Task : number) : WishNS.Provider<any>
			Pause(Task : number) : WishNS.Provider<any>
			URL(Task : number,Part : number,URL : string) : WishNS.Provider<any>
			Size(Task : number,Part : number,Size : number) : WishNS.Provider<any>
			Prog(Task : number,Part : number,Has : number) : WishNS.Provider<any>

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
		/** Part map, each for files number in a part */
		Part? : number[]
		/** Totol size in Byte */
		Size? : number
		/** Root directory, determined on creation */
		Root? : string
		/** File name format, determined on creation */
		Format? : string
		/** 0 : Paused. 1 : Pending */
		State? : number
		/** Completed date */
		Done? : number
		/** Download info */
		Down? : Down[]
	}
	interface Down
	{
		/** Row ID of Task */
		Task : number
		/** Part index */
		Part : number
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
}
declare module 'crabsave'
{
	var CrabSave : CrabSaveNS.CrabSave
	export = CrabSave
}