<template>
  <div class="list-outer">
    <div class="list-wrap">
      <h4 class="title">
        <img v-show="listType==MY_COURSE_TYPE" src="/static/icon/title1-left.png" alt="">
        <img v-show="listType==PUB_COURSE_TYPE" src="/static/icon/title1-left.png" alt="">
        <span>{{title}}</span>
        <img v-show="listType==MY_COURSE_TYPE" src="/static/icon/title1-right.png" alt="">
        <img v-show="listType==PUB_COURSE_TYPE" src="/static/icon/title1-right.png" alt="">
      </h4>
      </h4>
      <div class="courser-content">
        <course-card-outer :viewMode="viewMode" v-for='(item,index) in courseList' :key="item.courseId">
          <course-card-inner :viewMode="viewMode" :courseTitle="item.courseName" :courseType="listType" :courseStatus="item.courseStatus" :courseId="item.courseId" :endDay="item.endDay" :imgSrc="setSrc(item.coverId)" @appendMyCourse="appendMyCourse">
          </course-card-inner>
        </course-card-outer>
      </div>
      <div class="bottom">
        <Page :total="courseTotal" size="small" show-total :page-size="params.pageSize" />
      </div>
    </div>

  </div>
</template>
<script>
import CourseCardInner from "components/course-card-inner";
import CourseCardOuter from "components/course-card-outer";
import {
  ApiGetElecCourseList,
  ApiGetPerCourseList,
  ApiPostAppendCourse
} from "@/api/home-api.js";
import { ApiGetSysConfig } from "@/api/system-manage-api.js";
import { ossImageUrl } from "common/js/util.js";
import {
  MY_COURSE_TYPE,
  PUB_COURSE_TYPE,
  VIEW_MODE
} from "common/js/constant.js";
import { resCode } from "@/api/code";
import qs from "qs";
export default {
  components: {
    CourseCardInner,
    CourseCardOuter
  },
  data() {
    return {
      VIEW_MODE: VIEW_MODE,
      MY_COURSE_TYPE: MY_COURSE_TYPE,
      PUB_COURSE_TYPE: PUB_COURSE_TYPE,
      params: {
        pageSize: 30,
        pageNum: 1
      },
      courseList: [],
      courseTotal: 0,
      listType: 0,
      viewMode: VIEW_MODE.CARD
    };
  },
  computed: {
    title() {
      if (this.listType == PUB_COURSE_TYPE) {
        return "选修课程";
      } else if (this.listType == MY_COURSE_TYPE) {
        return "我的课程";
      }
    }
  },
  methods: {
    init() {
      ApiGetSysConfig().then(res => {
        if (res.code == "success") {
          if (res.data) {
            this.viewMode = res.data.courseShow;
          }
          this.listType = Number(this.$route.params.listType);
          if (this.listType == this.MY_COURSE_TYPE) {
            this.getPerCourseList();
          } else if (this.listType == this.PUB_COURSE_TYPE) {
            this.getElecCourseList();
          }
        }
      });
    },
    getElecCourseList() {
      ApiGetElecCourseList(this.params).then(res => {
        if (res.code == "success") {
          this.courseList = res.data;
          this.courseTotal = res.total;
        }
      });
    },
    getPerCourseList() {
      ApiGetPerCourseList(this.params).then(res => {
        if (res.code == "success") {
          this.courseList = res.data.map((value, index) => {
            return { ...value.course, ...{ endDay: value.endDay } };
          });
          this.courseTotal = res.total;
        }
      });
    },
    setSrc(coverId) {
      return ossImageUrl(coverId);
    },
    //公共课程加入我的课程
    appendMyCourse(courseId) {
      ApiPostAppendCourse(qs.stringify({ courseId: courseId })).then(res => {
        if (res.code == "success") {
          this.$Message.success("该课程已加入我的课程");
          this.getElecCourseList();
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="scss" scoped>
@import "../common/css/mixin.scss";
.list-outer {
  min-height: 100%;
  background: #f5f6f7;
  .list-wrap {
    @include typeArea();
    padding: 40px;
    background: #fff;
  }
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 16px;
  padding: 15px 0;
  font-weight: bold;
  img {
    margin: 0 10px;
  }
}
.courser-content {
  @include clearFlot();
}
.bottom {
  margin: 20px 0;
  text-align: center;
}
</style>

