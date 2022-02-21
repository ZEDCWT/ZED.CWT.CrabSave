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
		SA(Q : string,S? : any[]) : string
		Req(Q : string | WebReq) : WishNS.Provider<string>
		Req(Q : string | WebReq,H : true) : WishNS.Provider<[number | false,string,WishNS.ReqH['H']]>
		API(Q : WishNS.ReqAccept) : WishNS.Provider<string>
		API(Q : WishNS.ReqAccept,H : true) : WishNS.Provider<[object,string,XMLHttpRequest]>
		Head<U extends keyof WishNS.ReqHead>(Q : WishNS.ReqAccept,K : U,V : string) : WishNS.ReqO
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
		JOM(S : RegExp,Q : string) : object
		NoRel(Q : string) : WishNS.EleContent
		Less(H : (ID : string) => WishNS.Provider<SiteItem[]>) : (ID : string,Page : number) => WishNS.Provider<SitePage>
		Less<U>
		(
			H : (ID : string) => WishNS.Provider<U[]>,
			ItemMap : (Q : U[],ID : string) => WishNS.Provider<SiteItem[]>
		) : (ID : string,Page : number) => WishNS.Provider<SitePage>
		More<U,N>
		(
			Q : (ID : string,I : U[]) => WishNS.Provider<N>,
			S : (I : U[],Page : number,ID : string) => WishNS.Provider<N>,
			M : (Q : N,I : U[],Page : number) => [U,SitePage]
		) : WishNS.Provider<SitePage>
		Walk(Q : object,H : (V : object,F : string) => boolean) : void
		SolU(Q : string,S? : string) : string
		DTS(Q : string | number) : string
		High(Q : string) : WishNS.EleContent
		RepCon(Q : string,S : {[K : string] : (Q : string) => WishNS.EleContent}) : WishNS.EleContent
		Ah(Title : string,URL : string) : WishNS.Ele
		Img(URL : WishNS.ReqAccept) : WishNS.Ele
		Text(Q : string) : string
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
		Size : boolean
		Meta : boolean
		Cover : boolean
		// NonAV : boolean // Front end only
	}
	interface SettingO
	{
		Dir() : string
		Fmt() : string
		Max() : number
		Proxy() : boolean
		ProxyURL() : boolean
		Delay() : number
		Size() : boolean
		Meta() : boolean
		Cover() : boolean
	}
}
declare var CrabSave : CrabSaveNS.Web