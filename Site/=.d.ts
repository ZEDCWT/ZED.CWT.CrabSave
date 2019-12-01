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
	}

	interface SiteO
	{
		(Q :
		{
			Req(Q : string | WishNS.RequestOption) : WishNS.RequestOption
			Coke(Q : string | WishNS.RequestOption) : WishNS.RequestOption
			Best<U>(S : string,Q : U[]) : U
		}) : {
			URL(ID : string) : WishNS.Provider<SiteURL>
			Pack?(Q : string) : string | WishNS.RequestOption
		}
	}
	interface SiteURL
	{
		Title? : string
		Up? : string
		Date? : number
		Part : SitePart[]
	}
	interface SitePart
	{
		Index? : number
		Title : string
		URL : string[]
		Size? : number[]
		Ext : string | string[]
	}

	interface SiteAll
	{
		(Q :
		{
			Req(Q : string | WishNS.RequestOption) : WishNS.RequestOption
			Coke(Q : string | WishNS.RequestOption,Q : string) : WishNS.RequestOption
		}) : {
			A : ReturnType<SiteO>[]
			M : {[K : string] : ReturnType<SiteO>[]}
			H(Q : string) : boolean
			D(Q : string) : ReturnType<SiteO>
			P(Q : string) : WishNS.Provider<ReturnType<SiteO>>
		}
	}
}