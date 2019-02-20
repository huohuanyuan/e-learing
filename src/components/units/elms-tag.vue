/*
 * @Author: chengshanshan 
 * @Date: 2018-10-23 09:23:14 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-21 17:07:05
 * @instrction：课程card 状态tag
 */

<template>
  <div :class="wrapClasses">
    <img :src="innerHtml" />
  </div>
</template>

<script>
import { COURSE_LEARN_STATUS } from "common/js/constant.js";
const prefixCls = "elms-tag";
export default {
  props: {
    size: {
      type: String,
      default: "default"
    },
    learnStatus: {
      type: [String, Boolean, Number],
      default: -1
    }
  },
  computed: {
    wrapClasses() {
      return [
        `${prefixCls}`,
        {
          [`${prefixCls}-${this.size}`]: !!this.size,
          new: this.learnStatus == COURSE_LEARN_STATUS.NOT_START ? true : false,
          pro: this.learnStatus == COURSE_LEARN_STATUS.UNDER_WAY ? true : false,
          end: this.learnStatus == COURSE_LEARN_STATUS.FINISHED ? true : false
        }
      ];
    },
    innerHtml() {
      switch (this.learnStatus) {
        case COURSE_LEARN_STATUS.UNDER_WAY: //进行中
          return "/static/icon/learning.png";
          break;
        case COURSE_LEARN_STATUS.FINISHED: //已结束
          return "/static/icon/end.png";
          break;
        case COURSE_LEARN_STATUS.NOT_START: //未学习
          return "/static/icon/new.png";
          break;
        default:
          return "";
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.elms-tag {
  width: 40px;
  height: 20px;
  &.elms-tag-small {
    width: 27px;
    height: 15px;
  }
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
