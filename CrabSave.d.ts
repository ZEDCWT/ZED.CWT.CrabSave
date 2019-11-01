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
}
declare module 'crabsave'
{
	var CrabSave : CrabSaveNS.CrabSave
	export = CrabSave
}