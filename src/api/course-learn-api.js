import axios from './https'

//获取课程信息
export const ApiGetCourseLearnInfo = params => { return axios.get("/course/"+params).then(res => res.data) };
//获取资源播放凭证

export const ApiGetResourceParams = params => { return axios.post("/course/resource/play",params).then(res => res.data) };

//添加课程评论
export const ApiPostCourseComment = params => { return axios.post("/course/comment",params).then(res => res.data) };
//获取评论list
export const ApiGetCourseComments = (params1,params2) => { return axios.get("/course/comment/"+params1,{params:params2}).then(res => res.data) };
//标记章节已完成
export const ApiPutChapterComplete = params => { return axios.put("/course/personal/detail/complete/"+params).then(res => res.data) };
//是否需要电子签名
export const ApiGetSignRequire = params => { return axios.get("/course/sign/require/"+params).then(res => res.data) };
//电子签名
export const ApiPostSign = params => { return axios.post("/course/sign",params).then(res => res.data) };
