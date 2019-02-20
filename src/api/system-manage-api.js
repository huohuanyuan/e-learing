import axios from './https'
//获取设置信息
export const ApiGetSysConfig = query => { return axios.get("/sys/config",{ params: query } ).then(res => res.data) };
//修改设置信息
export const ApiPutSysConfig = params => { return axios.put("/sys/config", params ).then(res => res.data) };

//新建设置信息
export const ApiPostSysConfig = params => { return axios.post("/sys/config", params ).then(res => res.data) };
