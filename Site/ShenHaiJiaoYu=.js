'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,X : WX,C : WC,N : WN} = WW,

ShenHaiJiaoYu = 'https://www.shenhaiedu.cn/',
ShenHaiJiaoYuDetail = WW.Tmpl(ShenHaiJiaoYu,'sysConfigItem/getDetail/',undefined),
ShenHaiJiaoYuClassVideo = WW.Tmpl(ShenHaiJiaoYu,'classModule/feignVideo/',undefined,'/0/0'),
ShenHaiJiaoYuLessonList = WW.Tmpl(ShenHaiJiaoYu,'commoditynew/getClassTypeLessons/',undefined,'?timeType=yesterday'),
ShenHaiJiaoYuClassRes = WW.Tmpl(ShenHaiJiaoYu,'classTypeResource/findClassResource?kcId=',undefined,'&page=',undefined,'&pageSize=30'),
ShenHaiJiaoYuResLink = WW.Tmpl(ShenHaiJiaoYu,'classTypeResource/getDownloadLink/',undefined),
GenSeeYDKT = 'https://yunduoketang.gensee.com/',
GenSeeYDKTVod = WW.Tmpl(GenSeeYDKT,'sdk/site/sdk/gs/tra/h5/vod?widgetid=&uname=&jsonpcallback=&code=',undefined),
BoKeCCP = 'https://p.bokecc.com/',
BoKeCCPGetVideo = WW.Tmpl(BoKeCCP,'servlet/getvideofile?siteid=',undefined,'&vid=',undefined);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	Common = B =>
	{
		B = WC.JTO(B)
		;(false === B.success || false === B.scheduleAuth) &&
			O.Bad(B.msg || B.message)
		return B
	},
	Detail = WX.CacheL(Q => WN.ReqB(O.Req(ShenHaiJiaoYuDetail(Q)))),
	ResLastID,
	ResLast;

	return {
		URL : Q =>
		{
			var
			S = Q.split('/');

			if (2 === S.length) return Detail(S[0]).FMap(B =>
			{
				B = Common(B)
				return WN.ReqB(O.Coke(ShenHaiJiaoYuLessonList(B.classTypeId)))
			}).FMap(B =>
			{
				var
				Lesson;
				B = Common(B)
				Lesson = B.lessons.find(V => S[1] == V.id)
				Lesson || O.Bad('No such lesson')
				return WN.ReqB(O.Req(Lesson.replayUrlGh + '?nickname=_&token=zs_s_secret_w')).FMap(B =>
				{
					return WN.ReqB(O.Req(GenSeeYDKTVod(WW.MF(/video-vod.*code="([^"]+)/,B))))
				}).FMap(X =>
				{
					X = WW.MF(/xmlUrl[ ='"]+([^'"]+)/,X)
					X || O.Bad('No record data')
					return WN.ReqB(O.Req(X)).FMap(Record =>
						O.M3U(WN.JoinU(X,WW.MF(/hls="([^"]+)/,Record))).Map(M => (
						{
							Title : Lesson.modelName + '.' + Lesson.lessonName +
								'.' + Lesson.teachersName,
							UP : B.classType.name,
							Date : WW.MF(/\bstarttime="([^"]+)/,Record) + '+0800',
							Part : WW.MR((D,V) =>
							{
								var
								Name = WC.HED(WW.MF(/name="([^"]+)/,V));
								WW.MR((_,V) =>
								{
									D.push(
									{
										Title : WW.StrMS(1E3 * WW.MF(/starttimestamp="([^"]+)/,V))
											.replace(/:/g,'.') +
											'.' + Name,
										URL : [WN.JoinU(X,WW.MF(/hls="([^"]+)/,V))]
									})
								},null,/<page.*?>/g,V)
								return D
							},[M],/<document[^]+?<\/document/g,Record)
						})))
				})
			})

			if ('Res' === S[0]) return Detail(S[1]).FMap(Detail =>
			{
				var
				L = ResLastID == S[1] && ResLast.data.find(V => S[2] == V.id);
				Detail = Common(Detail)
				return (L ? WX.Just(L) : WX.TCO((R,I) => WN.ReqB(O.Req(ShenHaiJiaoYuClassRes(S[1],-~I))).Map(V =>
				{
					V = Common(V).data
					ResLastID = S[1]
					ResLast = V
					R = V.data.find(N => S[2] == N.id)
					return [!R && (-~I < V.pageCount || O.Bad('No such resource')),R]
				}))).FMap(Res => WN.ReqB(O.Req(ShenHaiJiaoYuResLink(S[2])))
					.Map(Link => (
					{
						Title : Res.name.replace(RegExp(WR.SafeRX(Res.format) + '$','i'),''),
						UP : Detail.name,
						Date : Res.uploadTime,
						Part : [
						{
							URL : [Common(Link).data],
							Size : [+Res.fileSize],
						}]
					})))
			})

			return WN.ReqB(O.Req(ShenHaiJiaoYuClassVideo(Q))).FMap(B =>
			{
				var
				Chapter,
				Lecture,
				Img;
				B = Common(B).data
				Chapter = B.chapterAndLectrueList.find(V =>
					Lecture = V.videoLectrueVo.find(N => S[2] == N.id))
				Chapter || O.Bad('No such lecture')
				Img = Lecture.video.videoPic
				return WN.ReqH(O.Req(Img)).FMap(H =>
					WN.ReqB(O.Req(BoKeCCPGetVideo(WW.MF(/([^/]+)\/\d+-\d+/,Img),Lecture.video.videoCcId))).Map(N => (
					{
						Title : Chapter.chapterName +
							'.' + WW.Pad02(Lecture.lectureOrder) +
							'.' + Lecture.lectureName,
						UP : B.ct.name,
						Date : H.H['last-modified'],
						Part : [
						{
							URL : [O.Best('quality',WC.JTO(N.replace(/^[^{]*\(|\)\s*$/g,'')).copies)
								.playurl]
						}]
					})))
			})
		}
	}
}