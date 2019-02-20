import axios from './https'

// 题库

// 新建题库
export const ApiPostBank = params => { return axios.post("/bank", params).then(res => res.data) };

// 请求题库列表
export const ApiGetBank = query => { return axios.get("/bank",{ params: query } ).then(res => res.data) };

// 题库的修改
export const ApiPutBank = params => { return axios.put("/bank", params).then(res => res.data) };

// 题库删除
export const ApiDeletBank = params => { return axios.delete("/bank/" + params).then(res => res.data) };

// 获取题库下题目
export const ApiGetBankCon =  (query1, query2) => { return axios.get("/bank/question/" + query1, { params: query2 }).then(res => res.data) };

//新建试题
export const ApiPostQuestion = params => { return axios.post("/question", params).then(res => res.data) };

// 删除 试题
export const ApiDeletQuestion = params => { return axios.delete("/question/" + params).then(res => res.data) };

// 获取试题详情
export const ApiGetQuestion = query => { return axios.get("/question/" + query).then(res => res.data) };

// 修改试题，提交
export const ApiPutQuestion = params => { return axios.put("/question", params).then(res => res.data) };
