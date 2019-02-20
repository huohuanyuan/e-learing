/*
 * @Author: chengshanshan 
 * @Date: 2018-10-25 16:22:05 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-12-06 14:36:30
 * @instraction:课程学习页面
 */

<template>
  <div class="learn-outer">
    <div class="learn-wrap">
      <Row :gutter="24">
        <Col span="18">
        <!-- 课程查看 start -->
        <div>
          <!-- 视频播放 -->
          <elms-aliplayer ref="player" v-show="currentResource.type===VIDEO_RESOURCE_TYPE" :vid="player.vid" :playauth="player.playauth"></elms-aliplayer>
          <!-- pdf在线显示 -->
          <elms-pdf-view v-show="currentResource.type===FILE_RESOURCE_TYPE" :pdfUrl="pdfUrl"></elms-pdf-view>
          <div class="course-t">
            <span class="name">{{courseName}}</span>
            <span class="time">
              {{operationTime}}
            </span>
          </div>
        </div>
        <!-- 课程查看 end -->
        <!-- 课程简介 -->
        <div class="c-display" v-show="courseDisplay != ''">
          <p class="title">课程简介</p>
          <div class="content">
            {{courseDisplay}}
          </div>
        </div>
        <!-- 评论start -->
        <div class="talk-wrap" v-if="sysConfig.courseDiscuss">
          <div class="talk">
            <Input type="textarea" :rows="2" v-model.trim="comment"></Input>
            <Button style="margin-left:10px" @click="postComment">发表</br>评论</Button>
          </div>
          <div class="talk-area">
            <p class="title">提问讨论区</p>
            <ul>
              <li class="talk-cell" v-for="(item,index) of commentList">
                <Avatar style="flex-shrink:0" size="large" icon="ios-person" :src="item.userAvatar" />
                <div class="content">
                  <p class="name">
                    {{item.creatorName}}</p>
                  <elms-split></elms-split>
                  <p class="info">{{item.commentDetail}}</p>
                  <p class="time">{{item.createdTime | timeFormat}}</p>
                </div>
              </li>
            </ul>
            <div class="page" >
              <Page :total="commentPageTotal" size="small" @on-change="pageChange"></Page>
            </div>
          </div>
        </div>
        <!-- 评论end -->
        </Col>
        <!-- 章节信息 -->
        <Col span="6">
        <div class="section">
          <p class="title">课程章节</p>
          <ul class="list">
            <li v-for="(item,index) of resourceList" :key="index" :class="{active:currentResource.id==item.resourceId}" @click="changeSource(item)">
              <span class="s-name">{{index+1}}.&nbsp;{{item.resourceName}}</span>
              <span class="s-operation">
                <Icon type="ios-flag" size="22" color="#19be6b" v-if="item.status == SEC_STUDY_STATUS.FINISH" />
                <Icon title="标记已学完" type="ios-flag-outline" size="22" color="#ed4014" v-else @click.stop="signFinish(item.mcdId,index)" />
              </span>
            </li>
          </ul>
          <elms-split></elms-split>
          <elms-split></elms-split>
          <Button v-if="isExam" long type="info" @click="toExam" :disabled="courseLearnStatus != COURSE_LEARN_STATUS.FINISHED">我要答题</Button>
        </div>
        </Col>
      </Row>
    </div>
    <!-- 电子签名框 -->
    <Modal v-model="signModel" title="课程已学完，请进行电子签名" width="400px">
      <elms-split></elms-split>
      <elms-split></elms-split>
      <Form ref="signForm" :model="signForm" :rules="signFormRule">
        <FormItem prop="password">
          <Input type="password" v-model="signForm.password">
          <Icon type="ios-lock-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="signSubmit('signForm')">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import md5 from "js-md5";
import ElmsAliplayer from "components/units/elms-aliplayer";
import ElmsPdfView from "components/units/elms-pdf-view";
import ElmsSplit from "components/units/elms-split";
import {
  VIDEO_RESOURCE_TYPE,
  FILE_RESOURCE_TYPE,
  SEC_STUDY_STATUS,
  COURSE_LEARN_STATUS
} from "common/js/constant.js";
import { resCode } from "@/api/code";
import moment from "moment";
import {
  ApiGetCourseLearnInfo,
  ApiGetResourceParams,
  ApiPostCourseComment,
  ApiGetCourseComments,
  ApiPutChapterComplete,
  ApiGetSignRequire,
  ApiPostSign
} from "@/api/course-learn-api.js";
import { ApiGetSysConfig } from "@/api/system-manage-api.js";
export default {
  components: {
    ElmsAliplayer,
    ElmsPdfView,
    ElmsSplit
  },
  data() {
    return {
      VIDEO_RESOURCE_TYPE: VIDEO_RESOURCE_TYPE,
      FILE_RESOURCE_TYPE: FILE_RESOURCE_TYPE,
      SEC_STUDY_STATUS: SEC_STUDY_STATUS,
      COURSE_LEARN_STATUS: COURSE_LEARN_STATUS,
      currentResource: {
        type: "", //当前播放资源类型
        id: ""
      },
      resourceList: [], //课程章节列表
      courseId: "",
      courseName: "",
      mcId: "",
      isExam: false, //是否需要考试
      examId: "", //试题id
      courseLearnStatus: "", //课程学习状态
      operationTime: "", //创建时间
      courseDisplay: "", //课程简介
      player: {
        vid: "",
        playauth: ""
      },
      pdfUrl: "",
      comment: "", //评论
      commentList: [],
      commentParams: {
        pageNum: 1,
        pageSize: 10
      },
      commentPageTotal: 0,
      sysConfig: {
        courseDiscuss: true, //是否显示讨论区
        signature: false //是否需要电子签名
      },
      signModel: false,
      signForm: {
        password: ""
      },
      signFormRule: {
        password: [{ required: true, message: " ", trigger: "blur" }]
      },
      signChapterIndex:"",//记录签字章节数组下标，用于设置标记状态
    };
  },
  methods: {
    init() {
      this.courseId = this.$route.params.courseId;
      ApiGetSysConfig().then(res => {
        if (res.code == "success") {
          if (res.data) {
            this.sysConfig.courseDiscuss =
              res.data.courseDiscuss == 1 ? true : false;
            this.sysConfig.signature = res.data.signature == 1 ? true : false;
          }
          this.getCourseInfo();
          if (this.sysConfig.courseDiscuss) {
            this.getCommentList();
          }
        }
      });
    },
    // 点击跳转到考试页面
    toExam() {
      this.$router.push({
        path: "/examPage",
        name: "examPage",
        query: {
          courseName: this.courseName,
          mcId: this.mcId,
          examId: this.examId //当前要考试的 id
        }
      });
    },
    getCourseInfo() {
      //获取课程信息
      ApiGetCourseLearnInfo(this.courseId).then(res => {
        if (res.code == "success") {
          this.resourceList = res.data.resources;
          this.courseName = res.data.courseName;
          this.mcId = res.data.mcId;
          this.courseName = res.data.courseName;
          this.isExam = res.data.hasExam;
          this.examId = res.data.examId;
          this.operationTime = res.data.operationTime;
          this.courseLearnStatus = res.data.learnStatus;
          this.courseDisplay = res.data.courseDisplay;

          //默认查看第一个资源课程
          if (this.resourceList.length > 0) {
            this.currentResource.type = this.resourceList[0].resourceType;
            this.currentResource.id = this.resourceList[0].resourceId;
          }
          //获取资源参数
          this.getResourceParams({
            resourceOid: this.resourceList[0].resourceOid,
            resourceType: this.resourceList[0].resourceType
          });
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    //切换播放资源
    changeSource(source) {
      this.currentResource.type = source.resourceType;
      this.currentResource.id = source.resourceId;
      this.getResourceParams({
        resourceOid: source.resourceOid,
        resourceType: source.resourceType
      });
    },
    //请求aliplayer 参数
    getResourceParams(param) {
      ApiGetResourceParams(param).then(res => {
        if (res.code == "success") {
          if (res.data.isVideo) {
            //如果是视频资源
            this.player.vid = res.data.videoId;
            this.player.playauth = res.data.playAuth;
            //重载player
            if (this.currentResource.type === VIDEO_RESOURCE_TYPE) {
              const player = this.$refs.player;
              player && player.reloadPlayer();
            }
          } else {
            this.pdfUrl = res.data.fileViewURL;
          }
        }
      });
    },
    //提交评论
    postComment() {
      if (this.comment != "") {
        ApiPostCourseComment({
          courseId: this.courseId,
          commentDetail: this.comment
        }).then(res => {
          if (res.code == "success") {
            this.comment = "";
            this.getCommentList();
            this.$Message.success("发表成功");
          } else {
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        });
      }
    },
    //获取评论list
    getCommentList() {
      ApiGetCourseComments(this.courseId, this.commentParams).then(res => {
        if (res.code == "success") {
          this.commentList = res.data;
          this.commentPageTotal = res.total;
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    pageChange(num) {
      this.commentParams.pageNum = num;
      this.getCommentList();
    },
    signFinish(mcdId, index) {
      if (this.sysConfig.signature) {
        //系统配置是需要电子签名，先判断当前章节是否需要电子签名
        this.isSignRequire(mcdId, index);
      } else {
        //否则直接标记完成
        this.chapterComplete(mcdId, index);
      }
    },
    //标记章节完成前先请求是否需要电子签名（系统配置了电子签名且当前章节是课程的最后一个章节，则需要进行电子签名）
    isSignRequire(mcdId, index) {
      ApiGetSignRequire(mcdId).then(res => {
        if ((res.code = "success")) {
          if (res.data) {
            this.$refs["signForm"].resetFields();
            this.signModel = true; //true false
            this.signForm.mcdId = mcdId;
            this.signForm.courseId = this.courseId;
            this.signForm.mcId = this.mcId;
            this.signChapterIndex = index; //记录章节数组下标，用于设置标记状态
          } else {
            this.chapterComplete(mcdId, index);
          }
        }
      });
    },
    //标记章节已完成 index:章节数组下标
    chapterComplete(mcdId, index) {
      ApiPutChapterComplete(mcdId).then(res => {
        if (res.code == "success") {
          this.$set(
            this.resourceList[index],
            "status",
            SEC_STUDY_STATUS.FINISH
          );
          if (this.isExam) {
            let _secStatus = this.resourceList.filter((curVal, index) => {
              return curVal.status != SEC_STUDY_STATUS.FINISH;
            });
            //_secStatus == 0 说明所有课程都标记学完，打开我要答题按钮
            if (_secStatus.length == 0) {
              this.courseLearnStatus = COURSE_LEARN_STATUS.FINISHED;
            }
          }
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    //电子签名提交
    signSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.signForm.password = md5(this.signForm.password);
          ApiPostSign(this.signForm).then(res => {
            if (res.code == "success") {
              this.$set(
                this.resourceList[this.signChapterIndex],
                "status",
                SEC_STUDY_STATUS.FINISH
              );
              this.signModel = false;
              this.courseLearnStatus = COURSE_LEARN_STATUS.FINISHED;
            } else {
              if (resCode[res.code]) {
                this.$Message.error(resCode[res.code]);
              }
            }
          });
        }
      });
    }
  },
  filters: {
    timeFormat: function(value) {
      if (!value) {
        return "";
      } else {
        return moment(value).format("YYYY-MM-DD HH:mm:ss");
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="scss" scoped>
@import "../common/css/mixin.scss";
.learn-outer {
  min-height: 100%;
  background: #fff;
}
.learn-wrap {
  @include typeArea();
}
.course-t {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #fff;
  box-shadow: 0 0 10px rgba(225, 225, 225, 0.8);
  .name {
    font-size: 15px;
    font-weight: bold;
  }
  .time {
    color: #818080;
    font-size: 13px;
  }
}
.section {
  .title {
    background: #dbdbdb;
    padding: 0 10px;
    line-height: 32px;
  }
  .list {
    line-height: 32px;
    padding: 0 10px;
    background: #f5f7f8;
    li {
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      &:hover {
        color: #3399ff;
      }
      &.active {
        color: #3399ff;
      }
      .s-name {
        @include fontOverflow();
      }
      .s-operation {
        width: 20px;
        flex-shrink: 0;
      }
    }
  }
}
.talk-wrap {
  margin-top: 20px;
  .talk {
    display: flex;
  }
  .talk-area {
    margin-top: 20px;
    .title {
      line-height: 30px;
      font-size: 16px;
      padding: 10px;
      margin-bottom: 20px;
      border-bottom: 1px solid #dbdbdb;
    }
  }
  .page {
    text-align: right;
    margin-top: 20px;
  }
  .talk-cell {
    padding: 0 10px;
    margin-bottom: 10px;
    display: flex;
    .content {
      width: 100%;
      margin-left: 20px;
      border-bottom: 1px solid #dbdbdb;
      .name {
        font-size: 13px;
        color: #3a4a5a;
        font-weight: bold;
      }
      .info {
        font-size: 13px;
        color: #303030;
        line-height: 20px;
      }
      .time {
        color: #818080;
        padding: 10px 0;
      }
    }
  }
}
.c-display {
  padding: 20px 0;
  .title {
    line-height: 30px;
    font-size: 16px;
    padding: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid #dbdbdb;
  }
  .content {
    text-indent: 30px;
  }
}
</style>


