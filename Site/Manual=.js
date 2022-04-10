'use strict'
var
WW = require('@zed.cwt/wish'),
{C : WC} = WW;

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	return {
		URL : URL =>
		{
			var
			Type = (URL = URL.split('#'))[0],
			Pref = WC.JTOO(URL[2]),
			D;
			URL = URL[1]

			D = new Date(Pref.D)
			D = +D === +D ? +D : WW.Now()

			if ('M' === Type)
			{
				return O.M3U(URL).Map(URL => (
				{
					Title : Pref.T,
					UP : Pref.U,
					Date : D,
					Part : [URL]
				}))
			}

			O.Bad(URL)
		}
	}
}