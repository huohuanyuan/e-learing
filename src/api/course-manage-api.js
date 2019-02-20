import axios from './https'

//获取课程管理list  0已创建 1待审核 2已发布
export const ApiGetManageCourseList = params => {return axios.get("course/manage",{params:params}).then(res => res.data) };
//获取学习课程的人员list
export const ApiGetUserList = (id,params) => {return axios.get("/course/user/"+id,{params:params}).then(res => res.data) };
