'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	Vimeo = 'https://vimeo.com/',
	VimeoUser = WW.Tmpl(Vimeo,'user',undefined),
	VimeoSearchSugg = WW.Tmpl(Vimeo,'search/autocomplete?q=',undefined),
	FieldClip =
	[
		'uri',
		'name',
		'description',
		'type',
		'duration',
		'created_time',
		'pictures',
		'user.uri',
		'user.name',
		'user.link',
	],
	FieldClipList = WR.Map(WR.Add('clip.'),FieldClip).join(),
	VimeoAPI = 'https://api.vimeo.com/',
	VimeoAPIVideo = WW.Tmpl(VimeoAPI,'videos/',undefined,'?fields=',FieldClip.join()),
	VimeoAPIUserProfileVideo = WW.Tmpl(VimeoAPI,'users/',undefined,'/profile_sections/default/videos?page=',undefined,'&per_page=',O.Size,'&fields=',FieldClipList),
	VimeoAPIFollow = WW.Tmpl(VimeoAPI,'me/following?page=',undefined,'&per_page=',O.Size,'&fields=',
	[
		'uri',
		'name',
		'link',
		'bio',
		'short_bio',
		'created_time',
		'pictures',
		'location_details',
		'last_active_time',
	].join()),
	VimeoAPISearch = WW.Tmpl(VimeoAPI,'search?query=',undefined,'&direction=desc&filter_type=clip&page=',undefined,'&per_page=',O.Size,'&sort=relevance&fields=',FieldClipList),
	Common = function(V)
	{
		V = WC.JTO(V)
		V.error && O.Bad(V.error)
		return V
	},
	SolveConfig = function()
	{
		return O.Req(Vimeo).Map(function(B)
		{
			return O.JOM(/vimeo\.config.*?(?={")/,B)
		})
	},
	LastAPIAt,
	LastAPICoke,
	LastAPIKey,
	MakeAPI = function(Q,T)
	{
		T = O.Coke()
		return (LastAPICoke !== T || 6E5 + LastAPIAt < WW.Now() ?
			SolveConfig().Map(function(B)
			{
				LastAPIAt = WW.Now()
				LastAPICoke = T
				return LastAPIKey = B.api.jwt
			}) :
			WX.Just(LastAPIKey))
			.FMap(function(Key)
			{
				return O.Req(
				{
					URL : Q,
					Head :
					{
						Authorization : 'Jwt ' + Key
					},
					Cookie : false
				})
			})
	},
	LastSlash = function(Q){return Q.replace(/^.*\//,'')},
	SolveClip = function(V)
	{
		return {
			ID : LastSlash(V.uri),
			Img : V.pictures.sizes[1].link,
			Title : V.name,
			UP : V.user.name,
			UPURL : V.user.link,
			Date : new Date(V.created_time),
			Len : V.duration,
			Desc : V.description
		}
	};
	return {
		ID : 'Vimeo',
		Alias : 'VM',
		Judge : /\bVimeo\b/i,
		Min : 'vimeo',
		Sign : function()
		{
			return SolveConfig()
				.Map(WR.Path(['owner','display_name']))
		},
		Map : [
		{
			Name : 'Search',
			Judge : O.Find,
			View : function(ID,Page)
			{
				return MakeAPI(VimeoAPISearch(WC.UE(ID),-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.total,
						Item : WR.Map(SolveClip,WR.Pluck('clip',B.data))
					}
				})
			},
			Hint : function(ID)
			{
				return O.Api(
				{
					URL : VimeoSearchSugg(WC.UE(ID)),
					Head : {'X-Requested-With' : 'XMLHttpRequest'}
				}).Map(function(B)
				{
					B = WC.JTO(B)
					return {
						Item : WR.Map(function(V)
						{
							return [
								V.text,
								WR.Map(function(B)
								{
									return B.highlight ? O.High(B.text) : B.text
								},V.components)
							]
						},B.options)
					}
				})
			}
		},{
			Name : 'Following',
			Judge : O.UP,
			View : function(_,Page)
			{
				return MakeAPI(VimeoAPIFollow(-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.total,
						Item : WR.Map(function(V)
						{
							return {
								Non : true,
								ID : LastSlash(V.link),
								URL : V.link,
								Img : WR.Last(V.pictures.sizes).link,
								UP : V.name,
								UPURL : V.link,
								Desc :
									'Location\n' + WC.OTJ(V.location_details,'\t'),
								More :
								[
									O.Ah('ID ' + LastSlash(V.uri),VimeoUser(LastSlash(V.uri))),
									WV.X('Created ' + WW.StrDate(new Date(V.created_time))),
									WV.X('LastActive ' + WW.StrDate(new Date(V.last_active_time))),
									WV.X(V.bio),
									WV.X(V.short_bio),
								]
							}
						},B.data)
					}
				})
			}
		},{
			Name : 'Video',
			Judge : [O.Num('Video'),/Vimeo\.[^/]+\/(\d+)\b/i],
			View : function(ID)
			{
				return MakeAPI(VimeoAPIVideo(ID)).Map(function(B)
				{
					B = Common(B)
					return {
						Item : [SolveClip(B)]
					}
				})
			}
		},{
			Name : 'User',
			Judge : [O.Word('User'),/Vimeo\.[^/]+\/(\w+)\b/i],
			View : function(ID,Page)
			{
				return MakeAPI(VimeoAPIUserProfileVideo(ID,-~Page)).Map(function(B)
				{
					B = Common(B)
					return {
						Len : B.total,
						Item : WR.Map(SolveClip,WR.Pluck('clip',B.data))
					}
				})
			}
		}],
		IDURL : WR.Add(Vimeo)
	}
})