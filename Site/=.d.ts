declare module CrabSaveNS
{
	interface SiteView
	{
		Name : string
		Alias? : string[]
		Judge? : RegExp
		Cookie? : boolean
		Map : SiteMap[]
		Hint?(Q : string) : WishNS.Provider<WishNS.EleContent[]>
		IDView?(Q : string) : WishNS.EleContent
		IDURL?(Q : string) : string
	}
	interface SiteMap
	{
		Name : string
		Judge? : RegExp
		View(ID : string,Page : number,Pref? : object) : WishNS.Provider<SitePage>
	}
	interface SitePage
	{
		At? : number
		Page? : number
		Total? : number
		PageSize? : number
		Item : SiteItem[]
		Pref? : WishNS.PrefU<object>
	}
	interface SiteItem
	{
		Index? : number
		ID : string
		Img? : string
		Title? : string
		UP? : string
		UPURL? : string
		Date? : string
		Len? : number | string
		Desc? : string
	}

	interface SiteO
	{
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