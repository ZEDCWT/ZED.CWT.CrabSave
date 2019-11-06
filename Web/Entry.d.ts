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
			X : typeof Wish.X,
			B : typeof Wish.B
		) => CrabSaveNS.SiteView) : void
	}
	interface WebTool
	{
		Req(Q : string | WishNS.RequestOption) : WishNS.Provider<string>
		Req(Q : string | WishNS.RequestOption,H : true) : WishNS.Provider<[number | false,string,WishNS.RequestHeader]>
		Api<U extends string | WishNS.RequestOption>(Q : U) : U
		Coke() : string
		Bad(Code? : any,Message : any) : never
		Num(Q : string) : RegExp
		Word(Q : string) : RegExp
		Find : RegExp
		Size : number
		Less(Q : (ID : string) => WishNS.Provider<SiteItem[]>) : (ID : string,Page : number) => WishNS.Provider<SitePage>
		More<U>(Q : (ID : string) => WishNS.Provider<[U[],SitePage]>,S : (ID : string,Page : number,O : U[]) => WishNS.Provider<SitePage>) : WishNS.Provider<SitePage>
		More<U,N>(Q : (ID : string) => WishNS.Provider<[U[],N]>,S : (ID : string,Page : number,O : U[]) => WishNS.Provider<N>,M : (Q : N) => SitePage) : WishNS.Provider<SitePage>
		DTS(Q : string | number) : string
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