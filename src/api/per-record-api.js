import axios from './https'

//获取课程信息
export const ApiGetperRecord = params => { return axios.get("/learn/record/user",{params:params}).then(res => res.data) };
