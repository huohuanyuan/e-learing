import axios from './https'

//新建课程
export const ApiPostNewCourse = params => { return axios.post("/course", params).then(res => res.data) };
//修改课程

export const ApiPutCourse = params => { return axios.put("/course", params).then(res => res.data) };
//删除课程
export const ApiDeleteCourse = params => { return axios.delete("/course/"+params).then(res => res.data) };

//获取文件上传资源凭证
export const ApiGetFileResoures = params => { return axios.get("/course/fileResoures", { params: params }).then(res => res.data) };
//获取视频上传资源凭证
export const ApiPostVideoResoures = params => { return axios.post("/course/voideResoures", params).then(res => res.data) };
//oss资源上传成功后请求插入数据库
export const ApiPostResource = params => { return axios.post("/course/resource", params).then(res => res.data) };
//删除课程资源
export const ApiDeleteResource = params => { return axios.delete("/course/resource", { params: params }).then(res => res.data) };
//修改课程资源
export const ApiPutResource = params => { return axios.put("/course/resource", params).then(res => res.data) };
//资源排序
export const ApiPutResourceSort = params => { return axios.put("/course/resource/sort", params).then(res => res.data) };
//题库列表获取
export const ApiGetBankExam = params => { return axios.get("/bank/exam", { params: params }).then(res => res.data) };
//设置考试信息
export const ApiPostCourseExam = params => { return axios.put("/exam/course",  params ).then(res => res.data) };
//修改课程封面
export const ApiPostCourseCover = params => { return axios.post("/course/cover", params).then(res => res.data) };
//设置每个章节学习时间
export const ApiPostLearnTime = params => { return axios.put("/course/resource/time",  params ).then(res => res.data) };


//修改页面获取单个课程信息
export const ApiGetCourseInfo = params => { return axios.get("/course/manage/"+params).then(res => res.data) };
//提交到课程审核
export const ApiPutCourseSubmit = params => { return axios.put("/course/submit/"+params ).then(res => res.data) };
//获取公司成员树机构
export const ApiGetCompanyTree = params => { return axios.get("/course/company/tree/"+params ).then(res => res.data) };
//获取部门下员工
export const ApiGetMembers = params => { return axios.get("/course/company/user/"+params ).then(res => res.data) };
//获取课程已指定的人员列表
export const ApiGetSelectedMembers = params => { return axios.get("/course/rel/user/"+params ).then(res => res.data) };

//审核课程
export const ApiPutCourseAudit = (params1,params2) => { return axios.put("/course/audit/"+params1 ,params2).then(res => res.data) };

//提交课程学习人员

export const ApiPostCourseRelation = params => { return axios.post("/course/rel", params).then(res => res.data) };

