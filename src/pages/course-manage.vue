/*
 * @Author: chengshanshan 
 * @Date: 2018-10-25 08:50:38 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-29 10:32:05
 * @instraction:课程管理
 */

<template>
  <div class="manage-outer">
    <div class="manage-wrap">
      <h2 class="title">全部课程管理</h2>
      <div class="content">
        <ul class="tab">
          <router-link tag="li" :to="{name:'createdCourse'}">编辑中</router-link>
          <router-link tag="li" :to="{name:'checkCourse'}">审核中</router-link>
          <router-link tag="li" :to="{name:'publishCourse'}">已通过</router-link>
        </ul>
        <div>
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

</script>
<style lang="scss" scoped>
@import "../common/css/mixin.scss";
.manage-outer {
  min-height: 100%;
  background: url("/static/bg_img/manage_bg.png") 0 0 no-repeat;
  background-size: cover;
  background-attachment: fixed;
}
.manage-wrap {
  @include typeArea();
  padding: 20px;
  .title {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 10px;
    font-weight: bold;
  }
  .tab {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
    li {
      margin-right: 20px;
      padding: 10px 15px;
      margin-bottom: -1px;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      &.router-link-active {
        color: #3399ff;
        border-bottom: 2px solid #3399ff;
      }
    }
  }
  .content {
    background: #fff;
    border-radius: 10px;
    padding: 20px 30px;
  }
}
</style>


