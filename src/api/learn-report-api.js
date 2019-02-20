import axios from './https'
import qs from 'qs'
//获取报表
export const ApiGetReportList = params => {return axios.post("/learn/record",params).then(res => res.data) };
//获取部门list
export const ApiGetDeptList = params => {return axios.get("/dept/select",{params:params}).then(res => res.data) };

//获取课程list
export const ApiGetCourseList = params=> {return axios.get("/course/select",{params:params}).then(res => res.data) };

//获取用户list
export const ApiGetUserList = params=> {return axios.get("/course/user",{params:params}).then(res => res.data) };

//导出excel报表
export const ApiGetExcelReport = params => { return axios.get("/learn/record/excel",{
    params:params,
    paramsSerializer: function(params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
    },
    responseType: 'blob'
}).then(res => res.data) };

export const ApiGetPdfReport = params => { return axios.get("/learn/record/pdf",{
    params:params,
    paramsSerializer: function(params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
    },
    responseType: 'blob'
}).then(res => res.data) };
