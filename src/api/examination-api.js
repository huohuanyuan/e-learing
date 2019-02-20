import axios from './https'

// 考试 

// 获取开始考试信息
export const ApiGetExamTextStart = (query1,query2) => { return axios.get("/exam/test/start/" + query1,{params:query2}).then(res => res.data) };

// 获取考试指定题目 query1:examId query2:题号
export const ApiGetExamQuestion =(query1,query2)  => { return axios.get("/exam/test/question/" + query1+"/"+query2).then(res => res.data) };

// 提交试卷
export const ApiPostExamCommit = params => { return axios.post("/exam/test/commit", params).then(res => res.data) };
