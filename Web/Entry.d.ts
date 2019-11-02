declare module CrabSaveNS
{
	interface Web
	{
		Site(Q :
		(
			Q : WebTool,
			W : typeof Wish,
			C : typeof Wish.C,
			R : typeof Wish.R,
			X : typeof Wish.X
		) => CrabSaveNS.SiteView) : void
	}
	interface WebTool
	{
		Req(Q : string | WishNS.RequestOption) : WishNS.Provider<string>
		Req(Q : string | WishNS.RequestOption,H : true) : WishNS.Provider<[number | false,string,WishNS.RequestHeader]>
	}

	interface Setting
	{
		Dir : string
		Fmt : string
		Proxy : boolean
		ProxyURL : boolean
		ProxyView : boolean
		Delay : number
		Merge : string
		MergeExt : string
		Alias : string
	}
}
declare var CrabSave : CrabSaveNS.Web