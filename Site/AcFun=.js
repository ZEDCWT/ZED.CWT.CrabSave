'use strict'
var
WW = require('@zed.cwt/wish'),
{C : WC,N : WN} = WW,

AcFun = 'https://www.acfun.cn/',
AcFunVideoView = WW.Tmpl(AcFun,'v/ac',undefined,'?quickViewId=videoInfo_new&ajaxpipe=1'),

CommonQuick = V => WC.JTO(V,{More : true})[0].html;

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	return {
		URL : Q => WN.ReqB(O.Coke(AcFunVideoView(Q))).FMap(B =>
		{
			var
			Part,
			Play;
			B = O.JOM(/Info\s*=(?={)/,CommonQuick(B))
			1 - B.videoList.length && O.Bad('Too many videos ' + WC.OTJ(B.videoList))
			Part = B.videoList[0]
			Play = WC.JTO(B.currentVideoInfo.ksPlayJson).adaptationSet
			1 - Play.length && O.Bad('Unexpected AdaptationSet')
			Play = O.Best('maxBitrate',Play[0].representation)
			return O.M3U(Play.url).Map(URL => (
			{
				Title : B.title,
				Up : B.user.name,
				Date : B.createTimeMillis,
				Part : [
				{
					Title :
					[
						Part.title,
						Part.fileName !== Part.title && Part.fileName
					].filter(V => V && V !== B.title)
						.join('.'),
					...URL
				}]
			}))
		})
	}
}