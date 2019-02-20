<template>
  <div class="home-outer">
    <div class="home-wrap">
      <div class="my-outer" v-show="isPerShow && isPubShow">
        <!-- 我的课程 -->
        <div class="my-course">
          <h4 class="title">
            <img src="/static/icon/title1-left.png" alt="">
            <span>我的课程</span><img src="/static/icon/title1-right.png" alt=""></h4>
          <div v-if="perCourseList.length>0">
            <!--总数大于10时只渲染前9个 -->
            <div class="course-content" v-if="perCourseTotal>params.pageSize">
              <template v-for='(item,index) in perCourseList'>
                <course-card-outer :viewMode="viewMode" :key="item.mcId">
                  <course-card-inner v-if="index<params.pageSize-1" :viewMode="viewMode" :courseType="MY_COURSE_TYPE" :courseTitle="item.course.courseName" :learnStatus="item.learnStatus" :courseId="item.course.courseId" :endDay="item.endDay" :imgSrc="setSrc(item.course.coverId)">
                  </course-card-inner>
                </course-card-outer>
              </template>
              <course-card-outer :viewMode="viewMode">
                <router-link :to="'/courseList/'+ MY_COURSE_TYPE">
                  <div :class="['view-more',{'card':isCardView},{'list':isListView}]">
                    <Icon type="md-add" />&nbsp;查看更多</span>
                  </div>
                </router-link>
              </course-card-outer>
            </div>
            <!--小于10个时全部渲染 -->
            <div class="course-content" v-else>
              <course-card-outer :viewMode="viewMode" v-for='(item,index) in perCourseList' :key="item.mcId">
                <course-card-inner :courseTitle="item.course.courseName" :viewMode="viewMode" :courseType="MY_COURSE_TYPE" :learnStatus="item.learnStatus" :courseId="item.course.courseId" :endDay="item.endDay" :imgSrc="setSrc(item.course.coverId)">
                </course-card-inner>
              </course-card-outer>
            </div>
          </div>
          <elms-null v-else>
            <p>非常抱歉，您暂时没有可学习的课程</p>
          </elms-null>
        </div>
      </div>
      <!-- 选修课程 -->
      <div class="public-outer" v-show="isPerShow && isPubShow">
        <div class="public-course">
          <h4 class="title"> <img src="/static/icon/title2-left.png" alt="">
            <span>选修课程</span> <img src="/static/icon/title2-right.png" alt=""></h4>
          <!--总数大于10时只渲染前9个 -->
          <div v-if="elecCourseList.length>0">
            <div class="course-content" v-if="elecCourseTotal>params.pageSize">
              <template v-for='(item,index) in elecCourseList'>
                <course-card-outer :viewMode="viewMode" v-if="index<9" :key="item.courseId">
                  <course-card-inner :viewMode="viewMode" :courseType="PUB_COURSE_TYPE" :courseTitle="item.courseName" :courseId="item.courseId" :endDay="item.endDay" :imgSrc="setSrc(item.coverId)" @appendMyCourse="appendMyCourse">
                  </course-card-inner>
                </course-card-outer>
              </template>

              <course-card-outer :viewMode="viewMode">
                <router-link :to="'/courseList/'+PUB_COURSE_TYPE">
                  <div :class="['view-more',{'card':isCardView},{'list':isListView}]">
                    <Icon type="md-add" />&nbsp;查看更多</span>
                  </div>
                </router-link>
              </course-card-outer>
            </div>
            <!--小于10个时全部渲染 -->
            <div class="course-content" v-else>
              <course-card-outer :viewMode="viewMode" v-for='(item,index) in elecCourseList' :key="item.courseId">
                <course-card-inner :courseTitle="item.courseName" :viewMode="viewMode" :courseType="PUB_COURSE_TYPE" :courseId="item.courseId" :endDay="item.endDay" :imgSrc="setSrc(item.coverId)" @appendMyCourse="appendMyCourse">
                </course-card-inner>
              </course-card-outer>
            </div>
          </div>
          <elms-null v-else>
            <p>非常抱歉，当前没有公共课程</p>
          </elms-null>
        </div>
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
import ElmsNull from "components/units/elms-null";
import { resCode } from "@/api/code";
import qs from "qs";
export default {
  components: {
    CourseCardOuter,
    CourseCardInner,
    ElmsNull
  },
  data() {
    return {
      VIEW_MODE: VIEW_MODE,
      MY_COURSE_TYPE: MY_COURSE_TYPE,
      PUB_COURSE_TYPE: PUB_COURSE_TYPE,
      params: {
        pageSize: 10,
        pageNum: 1
      },
      moreSrc: "/static/p_img/p_014.jpg",
      elecCourseList: [],
      elecCourseTotal: 0,
      perCourseList: [],
      perCourseTotal: 0,

      viewMode: VIEW_MODE.CARD,
      isPerShow: false,
      isPubShow: false
    };
  },
  computed: {
    isCardView() {
      return this.viewMode == VIEW_MODE.CARD;
    },
    isListView() {
      return this.viewMode == VIEW_MODE.LIST;
    }
  },
  methods: {
    init() {
      ApiGetSysConfig().then(res => {
        if (res.code == "success") {
          if (res.data) {
            this.viewMode = res.data.courseShow;
          }
          this.getPerCourseList();
          this.getElecCourseList();
        }
      });
      // this.expiredNotice(3);
    },
    getElecCourseList() {
      ApiGetElecCourseList(this.params).then(res => {
        this.isPubShow = true;
        if (res.code == "success") {
          this.elecCourseList = res.data;
          this.elecCourseTotal = res.total;
        }
      });
    },
    getPerCourseList() {
      ApiGetPerCourseList(this.params).then(res => {
        this.isPerShow = true;
        if (res.code == "success") {
          this.perCourseList = res.data;
          this.perCourseTotal = res.total;
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
          this.getPerCourseList();
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    //课程过期提醒
    expiredNotice(num) {
      this.$Notice.warning({
        title: "提示",
        duration: 0,
        top: 160,
        render: h => {
          return h("div", {}, [
            h(
              "p",
              {
                style: {
                  "margin-bottom": "10px"
                }
              },
              `您有${num}个必学课程将要过期，请及时学习!`
            ),
            h(
              "a",
              {
                on: {
                  click: () => {
                    console.log("查看快过期的课程");
                  }
                }
              },
              "点击此处查看详情"
            )
          ]);
        }
      });
    }
  },
  created() {
    this.init();
  }
};
</script>
<style lang="scss" scoped>
@import "../common/css/mixin.scss";
.home-outer {
  min-height: 100%;
  background: #f5f6f7;
  // .home-wrap {
  //   @include typeArea();

  // }
}
.my-outer {
  background: linear-gradient(#eff6fe 10%, #fff 50%);
}
.my-course {
  @include typeArea();
  padding: 15px;
}
.public-outer {
  background: #f5f6f7;
}
.public-course {
  @include typeArea();
  padding: 15px;
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 16px;
  padding: 15px 0;
  font-weight: bold;
  img {
    margin: 0 10px;
  }
}
.course-content {
  @include clearFlot();
}
.view-more {
  &.card {
    width: 212px;
    margin: 0 10px;
    height: 120px;
    margin-top: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    text-align: center;
    line-height: 120px;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
  }
  &.list {
    text-align: center;
  }
}
</style>


