/*
 * @Author: chengshanshan 
 * @Date: 2018-10-11 15:11:01 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-12-04 18:27:03
 * @instraction:系统使用的常量
 */

//平台域名
export const DOMAIN_IPMS = "https://ipms.m-clinical.cn"//部署
// export const DOMAIN_IPMS = "http://www.pingtai.com:8085"//测试用

// export const LEARN_STATUS = new Map([[0,"未开始"],[1,"进行中"],[2,"已结束"]]);//学习状态
 export const COURSE_LEARN_STATUS = {//课程学习状态
     NOT_START:0,//未开始
     UNDER_WAY:1,//进行中
     FINISHED:2,//已学完
 };
// export const COURSE_STATUS = new Map([[0,"编辑中"],[1,"审核中"],[2,"被拒绝"],[3,"已发布"]]);//课程状态
export const COURSE_STATUS={
    EDITING:0,//编辑中
    REVIEW:1,//审核中
    REFUSED:2,//被拒绝
    PUBLISHED:3,//已发布
}
export const VIDEO_RESOURCE_TYPE = 0;//视频资源类型
export const FILE_RESOURCE_TYPE = 1;//文件资源类型(pdf)
export const STATIC_STORAGE_URL = 'https://m-clinical-image.oss-cn-beijing.aliyuncs.com';//课程封面存储路径
export const DEFAULT_COVER_URL = "/static/bg_img/img_bg.png";//默认课程封面
export const MY_COURSE_TYPE = 0;//我的课程
export const PUB_COURSE_TYPE = 1;//公共课程
export const COURSE_SET_TYPE={
    MODIFY_PAGE:0,//修改页面
    NEW_PAGE:1,//新建页面
}
export const SEC_STUDY_STATUS = {//章节学习状态
    FINISH:1,//已学习
    UN_FINISH:0,//未学习
}
export const USER_ROLE = {//系统角色
    ADMIN:'ADMIN',//管理员
    TRAINER:'TRAINER',//培训师
    STAFF:'STAFF',//员工
}
//课程列表查看视图模式
export const VIEW_MODE ={
    CARD:1,
    LIST:0
}
//各个角色可以进入的页面list
export const PRIVILEGE_LIST = {
    ADMIN:["courseManage","createdCourse","publishCourse","checkCourse","courseSet","courseInfoView","questionBank","learnReport","systemManage"],
    TRAINER:["courseManage","createdCourse","publishCourse","checkCourse","courseSet","courseInfoView","questionBank","learnReport"],
    STAFF:[]
}
//章节最小学习时长
export const MIN_LEARN_TIME = 30

export const TEST_TYPE = {
    RADIO:0,//单选
    MULTI:1,//多选

}
