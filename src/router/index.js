import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import {
  routers
} from './router';
import { PRIVILEGE_LIST } from "common/js/constant.js";
Vue.use(Router)

export const router = new Router({
  mode: 'history',
  routes: routers
})

router.beforeEach((to,from,next) => {
  let _userRole = window.$cookies.get("roleCode");
   if(to.meta.requireAuth){//需要权限验证的页面
      if(PRIVILEGE_LIST[_userRole].includes(to.name)){
        next()
      }else{
        next({name:from.name})
      }
   }else{
     next()
   }
   if (to.matched.length === 0) { //如果未匹配到路由
    from.name ? next({
      name: from.name
    }) : next('/home'); 
  }
})