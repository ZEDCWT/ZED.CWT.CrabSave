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
			V : typeof Wish.V
		) => CrabSaveNS.SiteView) : void
	}
	interface WebTool
	{
		Req(Q : string | WishNS.RequestOption) : WishNS.Provider<string>
		Req(Q : string | WishNS.RequestOption,H : true) : WishNS.Provider<[number | false,string,WishNS.RequestHeader]>
		Api(Q : string | WishNS.RequestOption) : WishNS.Provider<string>
		Head(Q : string | WishNS.RequestOption,K : string,V : string) : WishNS.RequestOption
		Auth() : boolean
		Coke() : string
		Bad(Code? : any,Message : any) : never
		Num(Q : string) : RegExp
		Word(Q : string) : RegExp
		TL : RegExp
		UP : RegExp
		Find : RegExp
		Size : number
		Less(Q : (ID : string) => WishNS.Provider<SiteItem[]>) : (ID : string,Page : number) => WishNS.Provider<SitePage>
		More<U>(Q : (ID : string) => WishNS.Provider<[U[],SitePage]>,S : (ID : string,Page : number,O : U[]) => WishNS.Provider<SitePage>) : WishNS.Provider<SitePage>
		More<U,N>(Q : (ID : string) => WishNS.Provider<[U[],N]>,S : (ID : string,Page : number,O : U[]) => WishNS.Provider<N>,M : (Q : N) => SitePage) : WishNS.Provider<SitePage>
		DTS(Q : string | number) : string
		High(Q : string) : WishNS.EleContent
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