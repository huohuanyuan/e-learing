/*
 * @Author: chengshanshan 
 * @Date: 2018-10-26 09:08:58 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-10-26 09:29:15
 * @instraction:pdf在线显示组件
 */

<template>
 <div style="height:400px">
    <iframe :src="url" width="100%" height="100%"></iframe> 
 </div>
        
  
</template>
<script>
export default {
  props:{
      pdfUrl:{
          type:String,        
      }
  },
  computed:{
      url(){
          return `/static/pdf/web/viewer.html?file=${this.pdfUrl}`
      }
  }
 
};
</script>

<style lang="scss" scoped>
</style>


