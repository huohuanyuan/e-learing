/*
 * @Author: chengshanshan 
 * @Date: 2018-10-23 11:23:19 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-12-12 15:24:21
 * @instarciotn:单个课程显示组件 支持card 和 list两种视图
 */

<template>
  <div @click="cardClick" :title="courseTitle">
    <!-- card 视图 -->
    <div v-if="viewMode == VIEW_MODE.CARD" class="course-card">
      <div class="course-tag" v-if="learnStatus != -1">
        <elms-tag :learnStatus='learnStatus'></elms-tag>
      </div>
      <div class="course-card-top">
        <!--我的课程封面 -->
        <div class="course-banner" v-if="courseType == MY_COURSE_TYPE">
          <div class="img-up">
            <img v-lazy="imgSrc">
          </div>
          <div class="img-mid">
            <img v-lazy="imgSrc">
          </div>
          <div class="img-down">
            <img v-lazy="imgSrc">
          </div>
        </div>
        <!-- 公共课程封面 -->
        <div class="pub-banner" v-if="courseType == PUB_COURSE_TYPE">
          <img v-lazy="imgSrc">
          <div class="join-btn" @click="appendMyCourse">
            加入我的课程
          </div>
        </div>
      </div>
      <div class="course-card-content">
        <p class="course-card-label">
          {{courseTitle}}
        </p>
        <p v-show="endDay">
          截止日期:{{endDay}}
        </p>

      </div>

    </div>
    <!-- list 视图 -->
    <div v-if="viewMode == VIEW_MODE.LIST" class="course-list">
      <div class="course-name">
        <span class="name"> {{courseTitle}}</span>

        <div class="course-tag" v-if="learnStatus != -1">
          <elms-tag :learnStatus='learnStatus' size="small"></elms-tag>
        </div>

      </div>
      <div class="right">
        <p class="end-time" v-show="endDay"> 截止日期:{{endDay}}</p>
        <Button v-if="courseType == PUB_COURSE_TYPE" type="primary" size="small" @click="appendMyCourse">加入我的课程</Button>
      </div>

    </div>

  </div>
</template>
<script>
import ElmsTag from "components/units/elms-tag";

import {
  DEFAULT_COVER_URL,
  PUB_COURSE_TYPE,
  MY_COURSE_TYPE,
  VIEW_MODE
} from "common/js/constant.js";
export default {
  components: {
    ElmsTag
  },
  props: {
    viewMode: {
      type: Number,
      default: VIEW_MODE.CARD
    },
    courseType: {
      type: Number,
      default: -1
    },
    imgSrc: {
      type: [String, Number],
      default: DEFAULT_COVER_URL
    },
    courseTitle: {
      type: String,
      default: ""
    },
    learnStatus: {
      type: [String, Boolean, Number],
      default: -1
    },
    endDay: {
      type: String,
      default: ""
    },
    courseId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      VIEW_MODE: VIEW_MODE,
      PUB_COURSE_TYPE: PUB_COURSE_TYPE,
      MY_COURSE_TYPE: MY_COURSE_TYPE
    };
  },
  computed: {
    bgImage() {
      return `background-image:url('${this.imgSrc}')`;
    }
  },
  methods: {
    cardClick() {
      //我的课程 跳转到学习页面
      if (this.courseType == MY_COURSE_TYPE) {
        this.$router.push({
          name: "learnPage",
          params: { courseId: this.courseId }
        });
      }
    },
    appendMyCourse() {
      //加入我的课程
      this.$emit("appendMyCourse", this.courseId);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../common/css/mixin.scss";
.course-card {
  position: relative;
  width: 212px;
  margin: 0 10px;
  height: 195px;
  padding-top: 15px;
  .course-tag {
    position: absolute;
    right: 0;
    top: 4px;
    z-index: 9;
    transition: all 0.3s;
  }
  .course-card-top {
    position: relative;
    height: 120px;

    .course-banner {
      width: 100%;
      height: 100%;

      .img-up,
      .img-mid,
      .img-down {
        position: absolute;
        background-size: cover;
        background-position: center;
        border-radius: 8px;
        transition: all 0.3s;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .img-up {
        position: relative;
        top: 0;
        left: 0;
        width: 212px;
        height: 120px;
        z-index: 3;
        overflow: hidden;
      }
      .img-mid {
        top: 4px;
        left: 4px;
        width: 204px;
        height: 120px;
        z-index: 2;
        opacity: 0.4;
      }
      .img-down {
        top: 8px;
        left: 8px;
        width: 196px;
        height: 120px;
        opacity: 0.2;
        z-index: 1;
      }
    }
    .pub-banner {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      .join-btn {
        position: absolute;
        bottom: -30px;
        width: 212px;
        line-height: 30px;
        text-align: center;
        color: #fff;
        background: rgba(0, 0, 0, 0.6);
        transition: all 0.3s;
      }
    }
  }
  .course-card-content {
    padding: 12px 8px;
    .course-card-label {
      color: #303030;
      font-size: 13px;
      line-height: 20px;
      max-height: 40px;
      @include fontOverflow();
    }
  }
  &:hover {
    cursor: pointer;
    .course-tag {
      top: -4px;
    }
    .course-card-top {
      .course-banner {
        .img-up {
          top: -8px;
          left: 0;
          width: 212px;
        }
        .img-mid {
          top: 0;
          left: 8px;
          width: 196px;
        }
        .img-down {
          top: 8px;
          left: 16px;
          width: 180px;
        }
      }
      .join-btn {
        bottom: 0;
      }
    }
    .course-card-label {
      color: #2d8cf0;
    }
  }
}
.course-list {
  width: 100%;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  .course-name {
    display: flex;
    position: relative;
    max-width: 900px;
    .name {
      @include fontOverflow();
      font-size: 14px;
    }

    .course-tag {
      position: absolute;
      top: -5px;
      right: -30px;
      z-index: 10;
    }
  }
  .right {
    width: 130px;
    flex-shrink: 0;
  }
}
</style>



