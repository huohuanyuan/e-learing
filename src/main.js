// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import store from './store';
import {router} from './router/index'
import 'common/css/index.scss';

import 'common/js/aliyun-oss-sdk-5.2.0.min.js'
import 'common/js/aliyun-upload-sdk-1.4.0.min.js'

import iView from 'iview';
import 'iview/dist/styles/iview.css';

import VueLazyload from 'vue-lazyload'
 
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: require('../static/bg_img/default_img.png'),   //请求失败后显示的图片
  loading: require('../static/bg_img/default_img.png'),   //加载的loading过渡图片
  attempt: 1     // 加载图片数量
})



Vue.use(iView);

Vue.use(require('vue-cookies'))

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
