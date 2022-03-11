'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	var
	MangledURL =
	[
		'b23.tv',
		't.cn',
		'url.cn'
	],
	WrappedURL =
	[
		['link.zhihu','target']
	];
	return {
		ID : 'Manual',
		Alias : 'Man',
		Judge : RegExp(WR.Unnest(
		[
			'\\bM3U8?\\b',
			WR.Map(WR.SafeRX,MangledURL),
			WR.Map(WR.SafeRX,WR.Pluck(0,WrappedURL))
		]).join('|'),'i'),
		Map : [
		{
			Name : 'M3U8',
			Judge :
			[
				/\w+:\/\/[^/]+\/\S+\.M3U8?\S*/i,
				/\bM3U8?\b\s+(\S+)/i
			],
			View : function(URL,ID,Pref)
			{
				var D;
				URL = URL.split('#')
				Pref = WW.Merge(true,WC.JTOO(URL[1]),Pref)
				URL = URL[0]
				ID = URL.replace(/\?.*/,'').replace(/.*\//,'')

				Pref.T = Pref.T || ID
				D = new Date(Pref.D)
				if (+D !== +D)
					(D = new Date).setMilliseconds(0)
				Pref.D = +D

				URL += '#' + WC.OTJ(Pref)
				return WX.Just(
				{
					Item : [
					{
						ID : 'M#' + URL,
						View : ID,
						URL : URL,
						Title : Pref.T,
						UP : Pref.U,
						Date : D
					}],
					Pref : function(I)
					{
						var
						R = WV.Pref({C : I});
						R.S([
						[
							O.SA('GenTitle'),
							WV.Inp(
							{
								Inp : R.C('T')
							}).V(Pref.T)
						],[
							O.SA('DetUp'),
							WV.Inp(
							{
								Inp : R.C('U')
							}).V(WR.Default('',Pref.U))
						],[
							O.SA('DetDate'),
							WV.Inp(
							{
								Inp : R.C('D'),
								Map : function(V)
								{
									return +new Date(V)
								}
							}).V(WW.StrDate(D,D.getMilliseconds() ? WW.DateISO : WW.DateISOS))
						]])
						return R
					}
				})
			}
		},{
			Name : 'MangledURL',
			Judge :
			[
				RegExp('(?:\\w+://)?[^/]*(?:' +
					WR.Map(WR.SafeRX,MangledURL).join('|') +
					')[^/]*/.+','i')
			],
			View : function(ID)
			{
				/^\w+:\/\//.test(ID) || (ID = 'https://' + ID)
				return O.Req(ID,true).Map(function(B)
				{
					B = B[2]
					B = B.location
					return {
						Item : [
						{
							Non : true,
							ID : ID,
							URL : ID,
							UP : B,
							UPURL : B
						}]
					}
				})
			}
		},{
			Name : 'WrappedURL',
			Judge :
			[
				RegExp('(?:\\w+://)?[^/]*(?:' + WR.Map(function(V)
				{
					return WR.SafeRX(V[0]) + '.*[?&]' + WR.SafeRX(V[1]) + '='
				},WrappedURL) + ').+','i')
			],
			View : function(ID)
			{
				var T = WR.Find(function(V)
				{
					return ~ID.indexOf(V[0])
				},WrappedURL);
				return WX.Just(
				{
					Item : [
					{
						Non : true,
						ID : ID,
						URL : ID,
						UP : T = WC.QSP(ID)[T[1]],
						UPURL : T
					}]
				})
			}
		}]
	}
})