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
		Req(Q : string | WebReq) : WishNS.Provider<string>
		Req(Q : string | WebReq,H : true) : WishNS.Provider<[number | false,string,WishNS.ReqH['H']]>
		Api(Q : WishNS.ReqAccept) : WishNS.Provider<string>
		Head(Q : WishNS.ReqAccept,K : string,V : string) : WishNS.ReqO
		Auth() : boolean
		Coke() : string
		CokeU() : any
		CokeC<U>(Q : () => WishNS.Provider<U>) : () => WishNS.Provider<U>
		Bad(Code? : any,Message : any) : never
		BadR(Q : any) : never
		Num(Q : string) : RegExp
		Word(Q : string) : RegExp
		TL : RegExp | RegExp[]
		UP : RegExp | RegExp[]
		Find : RegExp | RegExp[]
		Size : number
		Pascal(Q : string) : string
		NoRel(Q : string) : WishNS.EleContent
		Less(Q : (ID : string) => WishNS.Provider<SiteItem[]>) : (ID : string,Page : number) => WishNS.Provider<SitePage>
		More<U,N>
		(
			Q : (ID : string,I : U[]) => WishNS.Provider<N>,
			S : (I : U[],Page : number,ID : string) => WishNS.Provider<N>,
			M : (Q : N,I : U[],Page : number) => [U,SitePage]
		) : WishNS.Provider<SitePage>
		SolU(Q : string,S? : string) : string
		DTS(Q : string | number) : string
		High(Q : string) : WishNS.EleContent
		Ah(Title : string,URL : string) : WishNS.Ele
		Text(Q : string,Trim? : boolean) : string
		Progress(Q : string) : any
	}
	interface WebReq extends WishNS.ReqO
	{
		Cookie? : any
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