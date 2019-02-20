import axios from 'axios'
import {
  DOMAIN_IPMS
} from "common/js/constant.js";
import iview from 'iview'
// axios.defaults.baseURL = 'http://192.168.1.25:10000/elms/';//测试
axios.defaults.baseURL = 'https://gateway.m-clinical.cn/elms';

axios.interceptors.request.use(function (config) {
  config.headers.Authorization = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJNLUNsaW5pY2FsLmNuIiwiY29tcGFueSI6MiwiZXhwIjoxNTQ1OTMwNTIxLCJpYXQiOjE1NDU5MDA1MjEsImVuZ19hYmJyIjoiTU9ZSSIsInVzZXJJZCI6IjUzNCIsImVtYWlsIjoiaXRsaWJvQG0tY2xpbmljYWwuY24ifQ.StvHuzGrqYRpJDe-m90XnWF2c9PbqOF2uV2dS0diX-Q'
  // if (window.$cookies.get("token")) {
  //   config.headers.Authorization = window.$cookies.get("token")//将接口返回的token信息配置到接口请求中
  // }
  return config;
}, function (error) {
  return Promise.reject(error);
});

/** 
* 拦截响应response， 并做一些错误处理
*/
axios.interceptors.response.use((response) => {
  let varData = response.data;
  if (varData) {
    switch (varData.code) {
      case 'success':
        //处理相关业务
        return response;
      default:
    }
    return response;
  }
  // 根据返回的code值来做不同的处理（和后端约定）
}, (err) => {
  if (err && err.response) {
    switch (err.response.status) {
      case 400:
        iview.Message.error('参数错误');
        break
      case 401:
        window.location.href = DOMAIN_IPMS;
        break
      case 403:
        iview.Message.error('拒绝访问');
        break;
      case 404:
        iview.Message.error('请求地址出错');
        break;
      case 408:
        iview.Message.error('请求超时');
        break;
      case 500:
        iview.Message.error('服务器内部错误');
        break;

      case 501:
        iview.Message.error('服务器内部错误');
        // err.message = '服务未实现'
        break;
      case 502:
        iview.Message.error('网关错误');
        // err.message = '网关错误'
        break;
      case 503:
        iview.Message.error('服务不可用');
        break;
      case 504:
        iview.Message.error('请求超时');
        // err.message = '网关超时'
        break;
      case 505:
        iview.Message.error('HTTP版本不受支持');
        // err.message = 'HTTP版本不受支持'
        break;
      default:
        iview.Message.error('未知错误');
    };

  }
  return Promise.reject(err)
})


export default axios;

