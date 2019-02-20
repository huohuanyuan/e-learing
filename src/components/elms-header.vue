<template>
  <div class="wrap">
    <ul class="left">
      <li class="logo">

      </li>
      <router-link tag="li" class="cell" to="/home">首页</router-link>
      <router-link tag="li" class="cell" to="/courseManage" v-if="hasCourseMange">课程管理</router-link>
      <router-link tag="li" class="cell" :to="{name:'courseSet',params:{pageType:1}}" v-if="hasNewMange">新建课程</router-link>
      <router-link tag="li" class="cell" to="/questionBank" v-if="hasQuestionBank">题库</router-link>
      <router-link tag="li" class="cell" to="/learnReport" v-if="hasLearnHistory">培训记录</router-link>
      <router-link tag="li" class="cell" to="/systemManage" v-if="hasSystemManage">系统设置</router-link>
    </ul>
    <div class="right">
      <Poptip trigger="hover">
        <div class="dropdown-rel">
          <Avatar icon="ios-person" style="margin-right:10px"  :src="userAvatar"/> 
          {{userName}}
        </div>
        <div slot="content">
          <div class="dropdown-panel">
            <div class="avatar-box">
              <Avatar icon="ios-person" size="large" :src="userAvatar" />
  
              <div class="info">
                <p>{{userName}}</p>
                <!-- <p class="num">已学课程：56</p> -->
              </div>
            </div>
            <router-link tag="div" class="btn" to="/perLearnRecord">
              学习记录
            </router-link>
            <div class="out-btn">
              <a  @click="logout">安全退出</a>
            </div>
          </div>
        </div>

      </Poptip>
    </div>
  </div>
</template>
<script>
import {
  MY_COURSE_TYPE,
  PUB_COURSE_TYPE,
  USER_ROLE,
  DOMAIN_IPMS
} from "common/js/constant.js";
export default {
  props: {
    roleCode: {
      type: String,
      default: ""
    },
    userAvatar: {
      type: String,
      default: ""
    },
    userName: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      MY_COURSE_TYPE: MY_COURSE_TYPE,
      USER_ROLE: USER_ROLE
     
    };
  },
  computed: {
    hasCourseMange() {
      return (
        this.roleCode == USER_ROLE.ADMIN || this.roleCode == USER_ROLE.TRAINER
      );
    },
    hasNewMange() {
      return (
        this.roleCode == USER_ROLE.ADMIN || this.roleCode == USER_ROLE.TRAINER
      );
    },
    hasQuestionBank() {
      return (
        this.roleCode == USER_ROLE.ADMIN || this.roleCode == USER_ROLE.TRAINER
      );
    },
    hasLearnHistory() {
      return (
        this.roleCode == USER_ROLE.ADMIN || this.roleCode == USER_ROLE.TRAINER
      );
    },
    hasSystemManage() {
      return this.roleCode == USER_ROLE.ADMIN;
    }
  },
  methods:{
    logout(){
      window.location.href=DOMAIN_IPMS;
      this.$cookies.remove('roleCode')

    }
  }
};
</script>

<style lang="scss" scoped>
.wrap {
  height: 100%;
  width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  margin: 0 auto;
  .left {
    height: 100%;
    display: flex;
    align-items: center;
    .logo {
      background: url("/static/bg_img/e-learning.png") 0 0 no-repeat;
      background-size: contain;
      width: 280px;
      height: 70%;
    }
    .cell {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 25px;
      color: #303030;
      font-size: 14px;
      cursor: pointer;
      &.router-link-active {
        border-top: 3px solid #2d8cf0;
        border-bottom: 3px solid #2d8cf0;
        background: #ebf5ff;
        color: #2d8cf0;
      }
    }
  }
  .right {
    line-height: 100%;
  }
}
//下拉面板style

.dropdown-panel {
  width: 220px;
  background: #fff;
  .btn {
    height: 35px;
    line-height: 35px;
    background: #f5f7f8;
    text-align: center;
    color: #303030;
    margin-bottom: 10px;
    cursor: pointer;
    &:hover {
      box-shadow: 0 0 6px #f5f7f8;
      color: #2d8cf0;
    }
  }
  .out-btn {
    padding-top: 5px;
    text-align: center;
    cursor: pointer;
  }
}
.avatar-box {
  display: flex;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 10px;
  color: #303030;
  .info {
    padding-left: 10px;
    .num {
      margin-top: 8px;
      color: #818080;
    }
  }
}
</style>

