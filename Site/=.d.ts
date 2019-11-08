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
		ID? : string
		URL(ID : string) : WishNS.Provider<SiteURL>
		Pack?(Q : string) : string | WishNS.RequestOption
	}
	interface SiteURL
	{
		Title? : string
		Author? : string
		Date? : number
		Part : SitePart[]
	}
	interface SitePart
	{
		URL : string[]
		Ext : string | string[]
		Size? : number[]
	}
}