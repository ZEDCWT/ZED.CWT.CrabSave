'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC} = WW,

PrefixMusic = 'Music',

DouYin = 'https://www.douyin.com/',
DouYinAPI = DouYin + 'aweme/v1/',
DouYinAPIWeb = DouYinAPI + 'web/',
DouYinAPIWebAwemeDetail = DouYinAPIWeb + 'aweme/detail',
DouYinAPIWebMusicDetail = DouYinAPIWeb + 'music/detail';

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	return {
		URL : (Q,Ext) =>
		{
			var
			Common = B =>
			{
				B || WW.Throw('Signature Failure')
				B = WC.JTO(B)
				B.status_code && O.Bad(B)
				return B
			},
			API = (Q,S,B) =>
			{
				var
				QS = WC.QSS(
				{
					aid : 6383,
					device_platform : 'webapp',
					os_version : 12, // download_suffix_logo_addr
					...S,
				}),
				Body = B ? WC.OTJ(B) : null,
				UA = WW.RUA(),
				Now = WW.Now() / 1000,
				EnvEnvCode = 1,
				EnvUBCode = 0,
				EnvCavasFP = WW.Rnd(0x100000000),

				QSMD5MD5 = WC.MD5(WC.MD5(QS)),
				BodyMD5MD5 = WC.MD5(WC.MD5(Body || '')),
				EnvMD5 = WC.MD5(WC.B64S(WC.RC4([EnvEnvCode >> 8,255 & EnvEnvCode,EnvUBCode],UA))),
				Bogus =
				[
					64,
					EnvEnvCode >> 8,
					255 & EnvEnvCode,
					EnvUBCode,
					QSMD5MD5[14], // Critical
					QSMD5MD5[15], // Critical
					BodyMD5MD5[14],
					BodyMD5MD5[15],
					EnvMD5[14], // Critical
					EnvMD5[15], // Critical
					Now >> 24,
					Now >> 16,
					Now >> 8,
					Now >> 0,
					EnvCavasFP >> 24,
					EnvCavasFP >> 16,
					EnvCavasFP >> 8,
					EnvCavasFP >> 0,
				];
				Bogus.push(WR.Reduce(WR.Xor,0,Bogus))
				return Ext.ReqB(O.Coke(
				{
					URL : Q,
					UA : UA,
					Head :
					{
						Referer : DouYin
					},
					QS : QS + '&X-Bogus=' + WC.B64S(
						WC.Con([[2,255],WC.RC4([255],Bogus)]),
						'Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe'),
				})).Map(Common)
			},

			Prefix,ID;

			ID = /^([A-Z]+)(\d+)$/i.exec(Q)
			if (ID)
			{
				Prefix = ID[1]
				ID = ID[2]
			}
			else ID = Q

			if (PrefixMusic === Prefix) return API(DouYinAPIWebMusicDetail,{music_id : ID}).FMap(Music =>
			{
				Music = Music.music_info
				return Ext.ReqH({Med : 'HEAD',URL : Music.play_url.url_list[0]}).Map(H =>
				{
					var
					Part = [];
					Part.push(
					{
						URL : [Music.play_url.url_list[0]],
					})
					return {
						Title : Music.title,
						UP : Music.author,
						Date : H.H['last-modified'],
						Cover : Music.cover_hd.url_list[0],
						Part,
					}
				})
			})

			if (Prefix) return WX.Throw('Unexpected Prefix ' + Prefix)

			return API(DouYinAPIWebAwemeDetail,{aweme_id : ID}).Map(Aweme =>
			{
				var
				Meta = [],
				Cover,
				Part = [];
				Aweme = Aweme.aweme_detail
				Aweme.preview_title === Aweme.desc || Meta.push(Aweme.desc)
				if (Aweme.images)
				{
					Part.push(
					{
						URL : Aweme.images.map(V => V.url_list[0]),
					})
				}
				else
				{
					Cover = Aweme.video.origin_cover.url_list[0]
					Part.push(
					{
						URL : [O.Best('bit_rate',Aweme.video.bit_rate).play_addr.url_list[0]]
					})
				}
				if (Aweme.music?.play_url?.uri)
				{
					Part.push(
					{
						Title : Aweme.music.title,
						URL : [Aweme.music.play_url.url_list[0]],
					})
				}
				return {
					Title : Aweme.preview_title,
					UP : Aweme.author.nickname,
					Date : 1E3 * Aweme.create_time,
					Meta,
					Cover,
					Part,
				}
			})
		}
	}
}