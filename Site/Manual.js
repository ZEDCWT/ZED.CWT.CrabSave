'use strict'
CrabSave.Site(function(O,WW,WC,WR,WX,WV)
{
	return {
		ID : 'Manual',
		Alias : 'Man',
		Judge : /\bM3U8?\b/i,
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
							'Title',
							WV.Inp(
							{
								Inp : R.C('T')
							}).V(Pref.T)
						],[
							'Up',
							WV.Inp(
							{
								Inp : R.C('U')
							}).V(WR.Default('',Pref.U))
						],[
							'Date',
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
		}]
	}
})