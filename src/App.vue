<template>
  <div id="app">
    <div class="header">
      <elms-header :roleCode="roleCode" :userAvatar="userAvatar" :userName="userName"></elms-header>
    </div>
    <div class="main">
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import ElmsHeader from "components/elms-header";
import { ApiGetUserRole } from "@/api/home-api";
import { USER_ROLE } from "common/js/constant.js";
export default {
  name: "App",
  components: {
    ElmsHeader
  },
  data() {
    return {
      roleCode: "",
      userAvatar: "",
      userName: ""
    };
  },
  created() {
    ApiGetUserRole().then(res => {
      if (res.code == "success") { 
        this.userName = res.data.userName;
        this.userAvatar = res.data.userAvatar;
        this.roleCode = res.data.roleCode;
        this.$cookies.set("roleCode", this.roleCode);
        this.$cookies.set("userId", res.data.userId);
      }
    });
  }
};
</script>

 <style lang="scss" scoped>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height:  100%;
  background: #f5f6f7;
  color: #303030;
}
.header {
  position: fixed;
  top: 0;
  width: 100%;
  height: 60px;
  z-index: 99;
  background: #fff;
  box-shadow: 0 0 5px #eff6fe;
}
.main {
  // width: 1200px;
  height: 100%;
  // margin: 0 auto;
  padding-top: 60px;
  .content {
    height: 100%;
    // padding:20px 40px;
    // background: #fff;
  }
}
</style>


