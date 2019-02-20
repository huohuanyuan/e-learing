/*
 * @Author: chengshanshan 
 * @Date: 2018-11-19 16:20:24 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-29 13:11:50
 * @instruction：培训记录页面查看历史考试成绩组件
 */

<template>
    <Table :columns="columns" :data="scoreList" size="small" :height="200">

    </Table>
</template>
<script>
export default {
  props: {
    scoreList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      columns: [
        {
          title: "考试时间",
          key: "createdTime",
          width: 100,
          align: "center"
        },
        {
          title: "正确率",
          key: "examScore",
          width: 80,
          align: "center",
          render:(h,params) => {
            return h("span",{},params.row.examScore+"%")
          }
        }
      ]
    };
  }
};
</script>

