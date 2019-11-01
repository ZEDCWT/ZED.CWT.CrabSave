declare module CrabSaveNS
{
	interface Web
	{
		Site(Q : (Q : WebTool) => CrabSaveNS.SiteView) : void
	}
	interface WebTool
	{
		Req(Q : string | WishNS.RequestOption,H? : boolean) : WishNS.Provider<string>
	}
}
declare var CrabSave : CrabSaveNS.Web