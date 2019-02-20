/*
 * @Author: chengshanshan 
 * @Date: 2018-11-16 10:41:07 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-12-25 16:56:53
 * @instraction:课程列表展示外层样式 支持card模式和list模式
 */
<template>
    <div :class="['cell',{'cell-card':isCardView},{'cell-list':isListView}]">
        <slot></slot>
    </div>
</template>
<script>
import { VIEW_MODE } from "common/js/constant.js";
export default {
  data() {
    return {
      VIEW_MODE: VIEW_MODE
    };
  },
  props: {
    viewMode: {
      type: Number,
      default: VIEW_MODE.CARD
    }
  },
  computed: {
    isCardView() {
      return this.viewMode == VIEW_MODE.CARD;
    },
    isListView() {
      return this.viewMode == VIEW_MODE.LIST;
    }
  }
};
</script>
<style lang="scss" scoped>
.cell {
  &.cell-card {
    float: left;
    
  }
  &.cell-list {
    padding: 15px 10px;
    border-bottom: 1px solid #ddd;
    transition: all 0.3s linear;
    &:hover {
      background: #f0faff;
    }
  
  }
}
</style>


