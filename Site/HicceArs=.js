'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

HicceArs = 'https://www.hiccears.com/',
HicceArsContent = WW.Tmpl(HicceArs,'contents/',undefined),
HicceArsContentPage = WW.Tmpl(HicceArs,'contents/',undefined,'/',undefined),
HicceArsUser = HicceArs + 'p/';

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	SolveSectionWithHeadKey = '"section-header">';
	return {
		URL : (Q,Ext) =>
		{
			return Ext.ReqB(O.Coke(HicceArsContent(Q))).FMap(B =>
			{
				var
				Title,
				UP,
				At,
				Meta = [],
				Cover,
				Part = [],
				Task = [],
				PicCount,
				C,T;
				B = B.split(SolveSectionWithHeadKey)
				if (1 === B.length)
				{
					B = B[0].split('post-open">')[1]
					B || WW.Throw('Unable to resolve the content')
					Cover = WN.JoinU(HicceArs,WW.MF(/src="([^"]+)/,B))
					;/\/\d{4,}(-\d\d){2}\//.test(Cover) || WW.Throw('Unable to resolve the date')
					Task.push(() => Ext.ReqH(O.Req({URL : Cover,Enc : false})).Map(B =>
					{
						At = B.H['last-modified']
					}))
					Title = WC.HED(WW.MF(/open-title">([^<]+)/,B))
					Meta.push(O.Text(WW.MF(/open-paragraph">([^]+?)<\/p><div/,B)))
					UP = WW.MF(/open-title">[^]+?href="\/p\/([^/"]+)/,B)
					Task.push(() => Ext.ReqB(O.Coke(HicceArsUser + UP)).Map(B =>
					{
						B = B.split('profile-header">').pop()
						UP = WC.HED(WW.MF(/description-title">(?:<[^>]+>)*([^<]+)/,B))
					}))
					if (T = WW.MF(/open-paragraph" id[^>]+>([^]+?)<\/p><div/,B))
						Meta.push(
							'',
							'',
							'==== Preview ====',
							O.Text(T))
				}
				else
				{
					B = B[1]
					Title = WR.Trim(WC.HED(WW.MF(/section-title">([^<]+)/,B)))
					if (T = WW.MU(/sidebar-box">[^]+?id="leaveCommentModal"/,B))
					{
						if (C = /content-author"[^<>]+href="\/p\/([^"]+)[^>]+>([^<]+)</.exec(T))
						{
							UP = WR.Trim(WC.HED(C[2]))
						}
						WW.MR((T,V) =>
						{
							T = WR.Match(/[^<>]+(?=<)/g,V)
							if (2 === T.length)
							{
								if (/Created/.test(T[0]))
									At = T[1]
								else if (/Picture/.test(T[0]))
									PicCount = +WW.MU(/\d+/,T[1])
							}
						},null,/information-line">[^]+?<\/div/g,T)
					}
					if (T = B.match(/<a[^>]+"album-preview"[^]+?<\/a/g))
						WR.Each(V => Part.push(
						{
							Title : WC.HED(WW.MF(/preview-title">([^<]+)/,V)),
							URL : [WN.JoinU(HicceArs,WW.MF(/src="([^"]+)/,V))]
						}),T)
					else
					{
						if (!PicCount)
							At ?
								PicCount = 1 :
								WW.Throw('No Image Found')
						Task.push(() => WX.Range(0,WR.Ceil(PicCount / 9))
							.FMapE(V => V ? Ext.ReqB(O.Coke(HicceArsContentPage(Q,-~V))) : WX.Just(B))
							.Reduce((D,V) => WW.MR((D,V) =>
							{
								D.push(WN.JoinU(HicceArs,WW.MF(/href="([^"]+)/,V)).replace(/preview.*$/,'download'))
								return D
							},D,/<a[^>]+"photo-preview[^]+?>/g,V),[])
							.Map(B =>
							{
								Part.push({URL : B,Ext : '.jpg'})
							}))
					}
					if (T = WW.MU(/slider-panel">[^]+?slider-panel-roster">/,B))
					{
						WW.Throw('Purchase Required')
					}
					WW.MR((T,V) =>
					{
						T = WW.MF(/box-title">([^<]+)/,V)
						// TODO. Solve images in the preview box
						V = O.Text(V.split('box-content">').pop())
						switch (T)
						{
							case 'Description' :
								Meta.push(V)
								break
							case 'Preview' :
								Meta.push(
									'',
									'',
									'==== Preview ====',
									V)
								break
						}
					},null,/widget-box">[^]+?(?=<\/div)/g,B)
				}
				return WX.From(Task).FMapE(V => V()).Fin().Map(() => (
				{
					Title,
					UP,
					Date : +new Date(At),
					Meta,
					Cover,
					Part,
				}))
			})
		},
		Pack : Q => O.Coke(Q),
	}
}