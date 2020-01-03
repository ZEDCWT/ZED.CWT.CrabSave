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
		) => SiteView) : void
	}
	interface WebTool
	{
		Req(Q : string | WishNS.RequestOption) : WishNS.Provider<string>
		Req(Q : string | WishNS.RequestOption,H : true) : WishNS.Provider<[number | false,string,WishNS.RequestHeader]>
		Api(Q : string | WishNS.RequestOption) : WishNS.Provider<string>
		Head(Q : string | WishNS.RequestOption,K : string,V : string) : WishNS.RequestOption
		Auth() : boolean
		Coke() : string
		CokeU() : any
		Bad(Code? : any,Message : any) : never
		BadR(Q : any) : never
		Num(Q : string) : RegExp
		Word(Q : string) : RegExp
		TL : RegExp | RegExp[]
		UP : RegExp | RegExp[]
		Find : RegExp | RegExp[]
		Size : number
		Pascal(Q : string) : string
		Less(Q : (ID : string) => WishNS.Provider<SiteItem[]>) : (ID : string,Page : number) => WishNS.Provider<SitePage>
		More<U>(Q : (ID : string) => WishNS.Provider<[U[],SitePage]>,S : (O : U[],Page : number,ID : string) => WishNS.Provider<SitePage>) : WishNS.Provider<SitePage>
		More<U,N>(Q : (ID : string) => WishNS.Provider<[U[],N]>,S : (O : U[],Page : number,ID : string) => WishNS.Provider<N>,M : (Q : N,I : U[],P : number) => SitePage) : WishNS.Provider<SitePage>
		SolU(Q : string,S? : string) : string
		DTS(Q : string | number) : string
		High(Q : string) : WishNS.EleContent
		Ah(Title : string,URL : string) : WishNS.Ele
		Progress(Q : string) : any
	}

	interface Setting
	{
		Dir : string
		Fmt : string
		Max : number
		Proxy : boolean
		ProxyURL : boolean
		ProxyView : boolean
		Delay : number
		Merge : string
		MergeExt : string
	}
	interface SettingO
	{
		Dir() : string
		Fmt() : string
		Max() : number
		Proxy() : boolean
		ProxyURL() : boolean
		Delay() : number
	}
}
declare var CrabSave : CrabSaveNS.Web