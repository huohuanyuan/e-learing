<template>
  <div class="course-inifo-outer">
    <div class="course-inifo">
      <!-- 基本信息 -->
      <div class="card">
        <h3 class="title">基本信息
        </h3>
        <ul>
          <li class="list">
            <label>课程名称:</label>
            <span>{{courseBase.courseName}}</span>
          </li>
          <li class="list">
            <label>学习时间:</label>
            <span>{{courseBase.availableDay}}天</span>
          </li>

          <li class="list">
            <label>课程类型:</label>
            <RadioGroup v-model="courseBase.courseType">
              <Radio :label="PUB_COURSE_TYPE" disabled>选修课程</Radio>
              <Radio :label="MY_COURSE_TYPE" disabled>必修课程</Radio>
            </RadioGroup>
          </li>
          <li class="list">
            <label>是否考试:</label>
            <RadioGroup v-model="courseBase.isExam">
              <Radio :label="1" disabled>是</Radio>
              <Radio :label="0" disabled>否</Radio>
            </RadioGroup>
          </li>
          <li class="list" v-if="viewMode == VIEW_MODE.CARD">
            <label>课程封面:</label>
            <img :src="coverUrl" alt="">
          </li>
          <li class="list" v-show="courseBase.courseDisplay!=''">
            <label>课程简介:</label>
            <span>{{courseBase.courseDisplay}}</span>
          </li>

        </ul>

      </div>
      <!-- 资源上传 -->
      <div class="card" v-show="fileSuccList.length>0">
        <h3 class="title">课程资源
        </h3>
        <Table :columns="filelColumns" :data="fileSuccList" size="small"></Table>

      </div>
      <!-- 考试信息 -->
      <div class="card" v-show="courseBase.isExam==1">
        <h4 class="title">考试信息
        </h4>

        <Table :columns="examColumns" :data="examDataList" size="small"></Table>
        <elms-split></elms-split>
        <Row>
          <Col span="8">
          <label>考试时长:</label>
          <span>{{examForm.examTime}} 分钟</span>
          </Col>
          <Col span="8">
          <label>考试次数:</label>
          <span>{{examForm.maxTimes}} 次</span>
          </Col>
          <Col span="8">
          <label>合格率:</label>
          <span>{{examForm.passScore}} %</span>
          </Col>
        </Row>

      </div>
      <!-- 审核页面 指定人员 -->
      <div class="card" v-show="isCardShow.cardD">
        <p class="title">指定人员</p>
        <elms-learner-select :courseId="courseId" :treeData="treeData" :defaultSelectedMem="selectedMembers" :treeLoading="treeLoading" @learnerSave="learnerSave"></elms-learner-select>
      </div>
    </div>
  </div>
</template>
<script>
import {
  ApiPostNewCourse,
  ApiPutCourse,
  ApiGetFileResoures,
  ApiPostVideoResoures,
  ApiDeleteResource,
  ApiPutResource,
  ApiPutResourceSort,
  ApiGetBankExam,
  ApiPostCourseExam,
  ApiGetCourseInfo,
  ApiPutCourseSubmit,
  ApiGetCompanyTree,
  ApiPostCourseRelation,
  ApiPutCourseAudit,
  ApiGetSelectedMembers
} from "@/api/set-course-api.js";
import { ApiGetSysConfig } from "@/api/system-manage-api.js";
import { resCode } from "@/api/code";

import ElmsSplit from "components/units/elms-split";

import ElmsLearnerSelect from "components/elms-learner-select";
import draggable from "vuedraggable";
import qs from "qs";
import { courseCoverList, ossImageUrl } from "common/js/util.js";
import {
  VIDEO_RESOURCE_TYPE,
  FILE_RESOURCE_TYPE,
  PUB_COURSE_TYPE,
  MY_COURSE_TYPE,
  COURSE_SET_TYPE,
  USER_ROLE,
  VIEW_MODE,
  COURSE_STATUS
} from "common/js/constant.js";

export default {
  components: {
    ElmsSplit,

    ElmsLearnerSelect
  },
  data() {
    return {
      VIDEO_RESOURCE_TYPE: VIDEO_RESOURCE_TYPE,
      FILE_RESOURCE_TYPE: FILE_RESOURCE_TYPE,
      PUB_COURSE_TYPE: PUB_COURSE_TYPE,
      MY_COURSE_TYPE: MY_COURSE_TYPE,
      COURSE_SET_TYPE: COURSE_SET_TYPE,
      VIEW_MODE: VIEW_MODE,
      isCardShow: {
        cardD: false
      },
      courseBase: {
        courseName: "",
        availableDay: 1,
        courseType: 0,
        courseDisplay: ""
      },
      viewMode: VIEW_MODE.CARD,
      coverId: "",
      courseId: 0,
      filelColumns: [
        {
          title: "资源",
          key: "resourceName",
          render: (h, params) => {
            let _type = "";
            if (params.row.resourceType == VIDEO_RESOURCE_TYPE) {
              _type = "md-videocam";
            } else if (params.row.resourceType == FILE_RESOURCE_TYPE) {
              _type = "md-document";
            }
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  "align-items": "center"
                }
              },
              [
                h("Icon", {
                  props: {
                    type: _type,
                    size: 16
                  }
                }),
                h(
                  "span",
                  {
                    style: {
                      "padding-left": "5px"
                    }
                  },
                  params.row.resourceName
                )
              ]
            );
          }
        }
      ],
      fileSuccList: [],

      examColumns: [
        {
          title: "题库",
          key: "qbName"
        },
        {
          title: "题数",
          key: "questionNum"
        }
      ],
      examDataList: [],
      examForm: {
        passScore: 60, //合格率
        maxTimes: 3, //最大考试次数
        examTime: 30 //考试时长
      },
      treeLoading: false,
      treeData: [], //部门组织树
      selectedMembers: [] //已经选中的课程学习人员
    };
  },
  computed: {
    courseType() {
      //课程类型 公共课程不需要指定学习人员
      return this.$route.query.courseType;
    },
    coverUrl() {
      return ossImageUrl(this.coverId);
    }
  },
  methods: {
    init() {
      ApiGetSysConfig().then(res => {
        if (res.code == "success") {
          if (res.data) {
            this.viewMode = res.data.courseShow;
          }

          this.getCourseInfo(this.$route.query.courseId);
          this.getSelectedMembers(this.$route.query.courseId);
        }
      });
    },
    //获取单个课程信息
    getCourseInfo(courseId) {
      ApiGetCourseInfo(courseId).then(res => {
        if (res.code == "success") {
          this.courseId = res.data.courseId;
          this.courseBase.courseName = res.data.courseName;
          this.courseBase.availableDay = res.data.availableDay;
          this.courseBase.courseDisplay = res.data.courseDisplay;
          this.courseBase.courseType = res.data.courseType;
          this.courseBase.isExam = res.data.hasExam ? 1 : 0;
          this.courseBase.courseStatus = res.data.courseStatus;
          this.fileSuccList = res.data.resources;
          this.coverId = res.data.coverId;
          if (
            this.courseBase.courseType == MY_COURSE_TYPE &&
            this.courseBase.courseStatus == COURSE_STATUS.PUBLISHED
          ) {
            this.isCardShow.cardD = true;
            this.getTree(this.courseId);
          }
          if (this.courseBase.isExam == 1) {
            this.examForm.examTime = res.data.examVo.examTime;
            this.examForm.passScore = res.data.examVo.passScore;
            this.examForm.maxTimes = res.data.examVo.maxTimes;
            this.examId = res.data.examVo.examId;
            this.examDataList = res.data.examVo.detailList;
          }
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },

    //审核界面获取人员组织结构
    getTree(courseId) {
      ApiGetCompanyTree(courseId).then(res => {
        this.treeLoading = true;
        if (res.code == "success") {
          this.treeData = res.data;
          this.treeLoading = false;
        }
      });
    },
    //获取已选中的人员
    getSelectedMembers(courseId) {
      ApiGetSelectedMembers(courseId).then(res => {
        if (res.code == "success") {
          this.selectedMembers = res.data;
        }
      });
    },
    learnerSave(data) {
      ApiPostCourseRelation(data)
        .then(res => {
          if (res.code == "success") {
            this.$Message.success("设置成功");
          } else {
            this.getTree(this.courseId);
            this.getSelectedMembers(this.courseId);
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        })
        .catch(error => {
          this.getTree(this.courseId);
          this.getSelectedMembers(this.courseId);
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
.course-inifo-outer {
  min-height: 100%;
  background: url("/static/bg_img/new_course_bg.png") 0 0 no-repeat;
  background-size: cover;
  background-attachment: fixed;
}
.course-inifo {
  @include typeArea();
  padding: 20px;
  .card {
    width: 100%;
    background: #fff;
    padding: 20px;
    margin-bottom: 20px;
  }
  .title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 15px;
    .iconfont {
      float: right;
      font-size: 24px;
      cursor: pointer;
    }
  }
  .list {
    display: flex;
    padding: 5px;
    line-height: 20px;
    label {
      margin-right: 5px;
      flex-shrink: 0;
    }
    img {
      width: 150px;
      height: 110px;
      border-radius: 8px;
    }
  }
}
</style>
