declare module CrabSaveNS
{
	interface SiteView
	{
		ID : string
		Name? : string
		Alias? : string
		Judge? : RegExp
		Cookie? : string
		Min? : string | string[] | ((Q : string) => string)
		Sign?() : WishNS.Provider<string>
		Map : SiteMap[]
		IDView?(Q : string) : WishNS.EleContent
		IDURL?(Q : string) : string
	}
	interface SiteMap
	{
		Name : string
		Judge? : RegExp | RegExp[]
		Join? : string
		View(ID : string,Page : number,Pref? : object) : WishNS.Provider<SitePage>
		Hint?(Q : string) : SiteHint
	}
	interface SitePage
	{
		At? : number
		Max? : number
		Len? : number
		Size? : number
		Item : SiteItem[]
		Pref?(OnInput : Function) : WishNS.PrefU<object>
	}
	interface SiteItem
	{
		Non? : boolean
		Index? : number
		ID : string
		View? : WishNS.EleContent
		URL? : string
		Img? : string
		Title? : string
		TitleView? : WishNS.EleContent
		UP? : string
		UPURL? : string
		Date? : string
		Len? : number | string
		Desc? : string
		More? : string
	}
	interface SiteHint
	{
		Item : WishNS.EleValView<string>[]
		Desc? : string
		Jump? : boolean
	}

	interface SiteO
	{
		(Q :
		{
			Cmp() : any
			Cmp(D : any) : any
			Head(Q : string | WishNS.ReqAccept,K : string,V : string,Force? : boolean) : WishNS.ReqAccept
			Req(Q : string | WishNS.ReqAccept) : WishNS.ReqAccept
			Coke(Q : string | WishNS.ReqAccept) : WishNS.ReqAccept
			CokeRaw() : string
			Best<U>(S : string | string[],Q : U[]) : U
			Bad(Q : any) : never
			JOM(S : RegExp,Q : string) : object
			Text(Q : string) : string
			M3U(Q : string) : WishNS.Provider<SitePart>
		}) : {
			URL(ID : string) : WishNS.Provider<SiteURL>
			Pack?(Q : string) : string | WishNS.ReqAccept
		}
	}
	interface SiteURL
	{
		Title? : string
		Up? : string
		Date? : number
		Part : SitePart[]
		/** Specially used when parts count !== Part.length */
		PartTotal? : number
	}
	interface SitePart
	{
		Index? : number
		Title? : string
		URL : string[]
		Size? : number[]
		Ext? : string | string[]
	}

	interface SiteAll
	{
		(Q :
		{
			Cmp : WishNS.JSONU<{}>
			CokeRaw(Q : string) : string
			Head(Q : string | WishNS.ReqAccept,K : string,V : string,Force? : boolean) : WishNS.ReqAccept
			Req(Q : string | WishNS.ReqAccept) : WishNS.ReqAccept
			Coke(Q : string | WishNS.ReqAccept,Q : string) : WishNS.ReqAccept
		}) : {
			A : ReturnType<SiteO>[]
			M : {[K : string] : ReturnType<SiteO>[]}
			H(Q : string) : boolean
			D(Q : string) : ReturnType<SiteO>
			P(Q : string) : WishNS.Provider<ReturnType<SiteO>>
			F() : any
		}
	}
}