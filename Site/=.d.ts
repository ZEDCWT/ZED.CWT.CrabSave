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
		SignHint? : string
		Sign?() : WishNS.Provider<string>
		Map : SiteMap[]
		IDView?(Q : string) : WishNS.EleContent
		IDURL?(Q : string) : string
	}
	interface SiteMap
	{
		Name : string | string[]
		Judge? : RegExp | RegExp[]
		JudgeVal? : false | RegExp
		JudgeMap?(Q : RegExpExecArray) : string
		Join? : string
		Example? : (string | SiteMapExampleVal | SiteMapExampleSub | SiteMapExampleInp)[]
		View(ID : string,Page : number,Pref? : object) : WishNS.Provider<SitePage>
		Hint?(Q : string) : SiteHint
	}
	interface SiteMapExampleVal
	{
		As : 'Val'
		Val : string
		ID? : string
	}
	interface SiteMapExampleSub
	{
		As : 'Sub'
		Val : string
		ID? : string
	}
	interface SiteMapExampleInp
	{
		As : 'Inp'
		Val : string
		ID? : string
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
		NonAV? : boolean
		Index? : number
		Group? : any
		ID : string
		View? : WishNS.EleContent
		URL? : string | ((Q : string) => string)
		Img? : string | string[]
		Title? : string
		TitleView? : WishNS.EleContent
		UP? : string
		UPURL? : string
		Date? : number | Date | string
		Len? : number | string
		Desc? : string
		More? : string | WishNS.EleContent[]
	}
	interface SiteHint
	{
		Item : WishNS.EleValView<string>[]
		Desc? : string
		Jump? : boolean
	}

	type SiteExtM3U = Pick<SiteExt,'ReqB'>
	type SitePack = (Q : string) => WishNS.DownloadO['Req'] | WishNS.DownloadO['Obs']
	interface SiteO
	{
		(Q :
		{
			Cmp() : any
			Cmp(D : any) : any
			Req(Q : string | WishNS.ReqAccept) : WishNS.ReqAccept
			Coke(Q : string | WishNS.ReqAccept) : WishNS.ReqAccept
			CokeRaw() : string
			Best<U>(S : string | string[],Q : U[]) : U
			Bad(Q : any) : never
			JOM(S : RegExp,Q : string) : object
			Walk(Q : object,H : (V : object,F : string) => boolean) : void
			Text(Q : string,Collect? : {Img? : string[]}) : string
			M3U(Q : string,Ext? : SiteExtM3U,Opt? : OptM3U) : WishNS.Provider<SitePart &
			{
				Raw : WishNS.M3U[]
			}>
			MetaJoin(...Q : (string | string[])[]) : string[]
			Part(Q : (SitePart | WishNS.Provider<SitePart>)[],Ext? : SiteExtM3U,Opt? : OptM3U) : WishNS.Provider<SitePart[]>
			PackM3U(Opt? :
			{
				Pack? : SitePack
				Init?(Base : string,Init : string) : WishNS.Provider<WishNS.Buff>
				Req?(Q : WishNS.ReqAccept) : WishNS.ReqU
			}) : SitePack
			MakePostCache<U>() :
			{
				Set(ID : string,Entry : U,Meta : string[]) : void
				Get(ID : string) : [Entry : U,Meta : string[]] | null
				Fin() : void
			}
		}) : {
			URL(ID : string,Ext : SiteExt) : WishNS.Provider<SiteURL>
			IDView?(Q : string) : string
			Is429?(E : any) : boolean
			Pack? : SitePack
			Range? : boolean
			RefSpeed? : number
			OnReq?(Q : WishNS.ReqO,S? : string,H? : import('http').IncomingHttpHeaders,Meta? : string[]) : any
			OnFin?() : any
		}
	}
	interface SiteExt
	{
		ReqU : WishNS.N['ReqU']
		ReqH : WishNS.N['ReqH']
		ReqB : WishNS.N['ReqB']
	}
	interface SiteURL
	{
		Title? : string
		UP? : string
		Date? : number | string
		Meta? : string
		Cover? : string
		CoverExt? : string
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
		ExtDefault? : string
	}
	interface OptM3U
	{
		ReqB(Q : WishNS.ReqAccept) : string
		Init?(V : WishNS.M3UPropINF) : string
		IV?(V : WishNS.M3UPropINF,F : number) : WishNS.Buff
		Ext? : string
	}

	interface SiteAll
	{
		(Q :
		{
			Cmp : WishNS.JSONU<{}>
			CokeRaw(Q : string) : string
			Req(Q : string | WishNS.ReqAccept) : WishNS.ReqAccept
			Coke(Q : string | WishNS.ReqAccept,Q : string) : WishNS.ReqAccept
		}) : {
			A : ReturnType<SiteO>[]
			M : {[K : string] : ReturnType<SiteO>[]}
			H(Q : string) : boolean
			D(Q : string) : ReturnType<SiteO>
			P(Q : string) : WishNS.Provider<ReturnType<SiteO>>
			F() : any

			MakeReqRec() :
			{
				OnReq(Q : WishNS.ReqAccept) : (H : WishNS.ReqH,B : WishNS.ReqData) => any
				Fill() : string[]
			}
			OnReq(Q : WishNS.ReqO) :
			{
				H(H : import('http').IncomingMessage) : any
				D(Q : Buffer) : any
				E() : any
			} | null
		}
	}
}