'use strict'
CrabSave.Site(function(O,WW,WC,WR)
{
	var
	ShenHaiJiaoYu = 'https://www.shenhaiedu.cn/',
	ShenHaiJiaoYuUser = ShenHaiJiaoYu + 'student/get/account/info',
	ShenHaiJiaoYuPCCourse = WW.Tmpl(ShenHaiJiaoYu,'s/pc/#/course/detail/',undefined,'/',undefined),
	ShenHaiJiaoYuPCVideo = WW.Tmpl(ShenHaiJiaoYu,'s/pc/#/class/type/video/page?moduleId=',undefined,'&classTypeId=',undefined,'&lecId=',undefined),
	ShenHaiJiaoYuMobileCourse = WW.Tmpl(ShenHaiJiaoYu,'course_mobile/queryDetail/',undefined),
	ShenHaiJiaoYuDetail = WW.Tmpl(ShenHaiJiaoYu,'sysConfigItem/getDetail/',undefined),
	ShenHaiJiaoYuLectureList = WW.Tmpl(ShenHaiJiaoYu,'commoditynew/findPcLectrueById?commodityId=',undefined),
	ShenHaiJiaoYuLessonList = WW.Tmpl(ShenHaiJiaoYu,'commoditynew/getClassTypeLessons/',undefined,'?timeType=yesterday'),
	ShenHaiJiaoYuClassVideo = WW.Tmpl(ShenHaiJiaoYu,'classModule/feignVideo/',undefined,'/',undefined,'/0/0/0'),
	ShenHaiJiaoYuClassRes = WW.Tmpl(ShenHaiJiaoYu,'classTypeResource/findClassResource?kcId=',undefined,'&page=',undefined,'&pageSize=',O.Size),

	Common = function(B)
	{
		B = WC.JTO(B)
		;(false === B.success || false === B.scheduleAuth) &&
			O.Bad(B.msg || B.message)
		return B
	};

	return {
		ID : 'ShenHaiJiaoYu',
		Name : '\u6DF1\u6D77\u6559\u80B2',
		Judge : /\bShenHaiEdu\b/i,
		Min : 'cookie_user_',
		Sign : function()
		{
			return O.Req(ShenHaiJiaoYuUser).Map(function(B)
			{
				return Common(B).name
			})
		},
		Map : [
		{
			Name : 'LiveReplay',
			Judge : O.Num('LiveReplay|(?:Query)?Detail(?=.*#LiveReplay)'),
			View : function(ID)
			{
				return O.API(ShenHaiJiaoYuDetail(ID)).FMap(function(Detail)
				{
					Detail = Common(Detail)
					return O.Req(ShenHaiJiaoYuLessonList(Detail.classTypeId)).Map(function(B)
					{
						B = Common(B)
						return {
							Item : WR.Map(function(V)
							{
								return {
									ID : ID + '/' + V.id,
									URL : V.replayUrlGh + '?nickname=_&token=zs_s_secret_w',
									Title : V.modelName + '.' + V.lessonName,
									UP : Detail.name,
									UPURL : ShenHaiJiaoYuPCCourse(Detail.id,Detail.classTypeId),
									Date : V.lessonDate + ' ' + V.lessonTimeStart,
									More : V.teachersName
								}
							},WR.Rev(B.lessons))
						}
					})
				})
			}
		},{
			Name : 'Lecture',
			Judge : O.Num('Lecture|(?:Query)?Detail(?=.*#Lecture)'),
			View : function(ID)
			{
				return O.API(ShenHaiJiaoYuDetail(ID)).FMap(function(Detail)
				{
					Detail = Common(Detail)
					return O.API(ShenHaiJiaoYuLectureList(ID)).FMap(function(B)
					{
						return O.API(ShenHaiJiaoYuClassVideo(Common(B).data[0].moduleId,Detail.classTypeId))
					}).Map(function(B)
					{
						B = Common(B).data
						return {
							Item : WR.Unnest(WR.Map(function(V)
							{
								return WR.Map(function(N)
								{
									return {
										ID : B.module.id + '/' + B.classTypeId + '/' + N.id,
										Img : N.video.videoPic,
										Title : V.chapterName +
											'.' + WW.Pad02(N.lectureOrder) +
											'.' + N.lectureName,
										UP : B.ct.name,
										UPURL : ShenHaiJiaoYuPCCourse(B.comId,B.classTypeId)
									}
								},V.videoLectrueVo)
							},B.chapterAndLectrueList))
						}
					})
				})
			}
		},{
			Name : 'Resource',
			Judge : O.Num('Resource|(?:Query)?Detail(?=.*#Resource)'),
			View : function(ID,Page)
			{
				return O.API(ShenHaiJiaoYuDetail(ID)).FMap(function(Detail)
				{
					Detail = Common(Detail)
					return O.API(ShenHaiJiaoYuClassRes(ID,-~Page)).Map(function(B)
					{
						B = Common(B).data
						return {
							Size : B.pageSize,
							Len : B.rowCount,
							Item : WR.Map(function(V)
							{
								return {
									ID : 'Res/' + ID + '/' + V.id,
									Title : V.name,
									UP : Detail.name,
									UPURL : ShenHaiJiaoYuPCCourse(Detail.id,Detail.classTypeId),
									Date : V.uploadTime,
									More : WR.ToSize(V.fileSize)
								}
							},B.data)
						}
					})
				})
			}
		},{
			Name : 'Course',
			Judge :
			[
				/^\d+$/,
				O.Num('Course|(?:Query)?Detail')
			],
			View : function(ID)
			{
				return O.API(ShenHaiJiaoYuDetail(ID)).Map(function(B)
				{
					var
					URL,
					Base;
					B = Common(B)
					Base =
					{
						Non : true,
						ID : ID + '/' + B.classTypeId,
						Img : B.coverUrl,
						UP : B.name,
						UPURL : URL = ShenHaiJiaoYuPCCourse(ID,B.classTypeId),
						Date : B.cerateTime
					}
					return {
						Item : WR.Map(function(V)
						{
							return WW.Merge(
							{
								URL : URL + '#' + V,
								Title : V
							},Base)
						},[
							'LiveReplay',
							'Lecture',
							'Resource'
						])
					}
				})
			}
		}],
		IDURL : function(V)
		{
			V = V.split('/')
			'Res' === V[0] && V.shift()
			return 3 === V.length ?
				ShenHaiJiaoYuPCVideo(V[0],V[1],V[2]) :
				ShenHaiJiaoYuMobileCourse(V[0])
		}
	}
})