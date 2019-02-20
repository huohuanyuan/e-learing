import axios from './https'

//获取公开课程
export const ApiGetElecCourseList = params => {return axios.get("course/elective", { params: params }).then(res => res.data) };

//获取我的课程
export const ApiGetPerCourseList = params => {return axios.get("course/personal", { params: params }).then(res => res.data) };

//加入我的课程
export const ApiPostAppendCourse = params => {return axios.post("course/rel/elective", params).then(res => res.data) };

export const ApiGetUserRole = params => {return axios.get("/user", { params: params }).then(res => res.data) };
