'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,
Crypto = require('crypto');

/**@type {CrabSaveNS.SiteAll}*/
module.exports = Option =>
{
	var
	All = [],
	SiteMap = {},

	Best = (S,Q) => WR.Reduce(
		(D,V) => !D || (WW.IsArr(S) ? +WR.Path(S,D) < +WR.Path(S,V) : +D[S] < +V[S]) ? V : D,
		null,Q) || {},
	Bad = Q => WW.Throw(['ErrBadRes',WW.IsStr(Q) ? Q : WC.OTJ(Q)]),
	/*
		NicoChannel
			Single Key
			Runtime IV
		NicoNico
			Single Key & IV
			Using MAP & MEDIA
		Twitter
			Multiple Key & IV
	*/
	M3U = (Q,Ext = WN,Opt = {}) =>
	{
		var
		ReqB = Opt.ReqB || (Q => Ext.ReqB(Option.Req(Q)));
		return WX.TCO((Q,I) => I < 10 ? ReqB(Q.URL).FMap(V =>
		{
			var
			B = WC.M3U(V),
			Raw = [...Q.Raw,B],
			Key = new Map;
			if (WW.IsArr(B['STREAM-INF']))
			{
				B = Best([0,'BANDWIDTH'],B['STREAM-INF'])
				B || Bad(V)
				return WX.Just([true,
				{
					URL : WN.JoinU(Q.URL,B[1]),
					Raw,
				}])
			}
			if (WW.IsArr(B.INF))
			{
				B.INF.forEach(V =>
				{
					if (V[3].KEY)
						Key.set(V[3].KEY.URI,null)
				})
				return WX.From([...Key.keys()])
					.FMapE(K => ReqB({URL : K,Enc : 'Base64'})
						.Map(B => Key.set(K,WC.B91S(WC.B64P(B)))))
					.Fin()
					.Map(() => [false,
					{
						URL : B.INF.map((V,F) =>
						[
							WN.JoinU(Q.URL,V[1]),
							...V[3].KEY ?
							[
								Key.get(V[3].KEY.URI),
								V[3].KEY.IV ? WC.B91S(V[3].KEY.IV) :
									Opt.IV ? WC.B91S(Opt.IV(V,F)) :
									'',
							] : [],
							...V[3].MAP ?
							[
								Opt.Init(V),
							] : [],
						].join` `),
						Size : B.INF.length < 4 ? null : WR.RepA(1,B.INF.length),
						Ext : Opt.Ext || '.ts',
						Raw,
					}])
			}
			Bad(V)
		}) : Bad('Too many M3U | ' + Q),
		{
			URL : Q,
			Raw : [],
		})
	};

	WR.Each((V,S) =>
	{
		S = require(`./${V}=`)(
		{
			Cmp : D => Option.Cmp.D(V,D),
			Req : Q => Option.Req(Q),
			Coke : Q => Option.Coke(Option.Req(Q),V),
			CokeRaw : () => Option.CokeRaw(V),
			Best,
			Bad,
			JOM : (S,Q) =>
			(
				S = S.exec(Q),
				WC.JTO(Q.slice(S.index + S[0].length),{More : true})[0]
			),
			Walk : (Q,S) =>
			{
				var
				H = (V,F) =>
				{
					if (WW.IsObj(V))
						S(V,F) || WR.EachU(H,V)
				};
				H(Q)
			},
			Text : (Q,Collect = {}) => WC.HED(Q
				.split(/<br\b[^>]*>|<\/(?:figure|h\d+|p)\b>/)
				.map(V => V.replace(/\s*(\r?\n|\r)\s*/g,' '))
				.join`\n`
				.replace(/<.*?>/g,V =>
				{
					var
					SolveAttr = M =>
					{
						M = V.slice(M.index + M[0].length)
						return /^("|')([^]*?)\1/.exec(M)?.[2] ?? WW.MU(/^\S*/,M)
					},
					T;
					if (T = /^<(?:img|figure)\b.*\bsrc=/.exec(V))
					{
						(Collect.Img || (Collect.Img = [])).push(WC.HED(T = SolveAttr(T)))
						return '{Img} ' + T + ' '
					}
					if (T = /\b(?:alt|title)=/i.exec(V))
						return SolveAttr(T)
					return ''
				}))
				.replace(/.+/g,WR.Trim),
			M3U,
			MetaJoin : (...Q) => Q.filter(V => V && V.length)
				.flatMap((V,F) => F ?
				[
					'',
					WR.RepS('\u2014',63),
					'',
					...WW.IsArr(V) ? V : [V]
				] : V),
			Part : (Q,Ext = WN) => WX.From(Q)
				.FMapE(V => WX.Any(V).FMap(V =>
				{
					if (/\.m3u8?(\?.*)?$/i.test(V.URL[0]))
					{
						1 < V.length && Bad('Unexpected content following M3U')
						return M3U(V.URL[0],Ext)
							.Map(B => ({...V,...B}))
					}
					return WX.Just(V)
				}))
				.Reduce((D,V) => D.push(V) && D,[]),
			PackM3U : (Opt = {}) => Q =>
			{
				var
				Pack = Opt.Pack || WR.Id,
				Req = Opt.Req || (Q => WN.Req(Option.Req(Q))),
				T = Q.split` `,
				Key,IV,Init;

				if (1 === T.length)
					return Pack(Q)

				Q = T[0]
				Key = WC.Buff(WC.B91P(T[1]))
				IV = WC.Buff(WC.B91P(T[2]))
				Init = T[3]

				return (Init ? Opt.Init(Q,Init) : WX.Just()).FMap(Init => WX.P(S =>
				{
					var D = Crypto.createDecipheriv('AES-128-CBC',Key,IV);
					Init && S.D(Init)
					return Req(Pack(
					{
						URL : Q,
						OnD : B => S.D(D.update(B)),
						OnE : () => S.U(D.final()),
					})).On('Err',S.E)
						.End
				}))
			},
		})
		All.push(S)
		SiteMap[S.ID = V] = S
	},[
		'BiliBili',
		'YouTube',
		'NicoNico',

		'AcFun',
		'BSky',
		'DouYin',
		'Facebook',
		'FanBox',
		'Fantia',
		'HicceArs',
		'Instagram',
		'IXiGua',
		'KakuYomu',
		'NicoChannel',
		'Pixiv',
		'ShenHaiJiaoYu',
		'ShonenMagazine',
		'TikTok',
		'Twitter',
		'Vimeo',
		'WeiBo',

		'Manual',
	])
	return {
		A : All,
		M : SiteMap,
		H : Q => WR.Has(Q,SiteMap),
		D : Q => SiteMap[Q],
		P : Q => WR.Has(Q,SiteMap) ? WX.Just(SiteMap[Q]) : WX.Throw(['ErrUnkSite',Q]),
		F : () =>
		{
			WR.EachU((_,F) => WR.Del(require.resolve(`./${F}=`),require.cache),SiteMap)
			WR.Del(__filename,require.cache)
		}
	}
}