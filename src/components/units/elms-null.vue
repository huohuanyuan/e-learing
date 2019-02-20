/*
 * @Author: chengshanshan 
 * @Date: 2018-10-31 14:03:54 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-12-12 16:07:50
 * @instraction：页面数据为空时提示
 */

<template>
    <div class="null-box">
        <img src="/static/bg_img/course_null.png" alt="">
        <slot></slot>
    </div>

</template>
<style lang="scss" scoped>
.null-box{
    height: 100%;
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   padding:30px 15px;
   img{
       width:60px;
       height: 60px;
       margin-bottom: 10px;
   }
}
</style>


