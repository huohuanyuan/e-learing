<template>
  <div class="new-course-outer">
    <div class="new-course">
      <!-- 基本信息 -->
      <div class="card" v-show="isCardShow.cardA">
        <h3 class="title">基本信息
        </h3>
        <Form ref="courseForm" :model="courseBase" :rules="courseFormRule" label-position="top">
          <Row :gutter="24">
            <Col span="12">
            <FormItem prop="courseName" label="课程名称">
              <Input type="text" v-model="courseBase.courseName"></Input>
            </FormItem>
            </Col>
            <Col span="6">
            <FormItem prop="availableDay" label="学习天数">
              <InputNumber style="width:100%" v-model="courseBase.availableDay" :min="1" :formatter="value => `${value}天`" :parser="value => value.replace('天', '')"></InputNumber>
            </FormItem>
            </Col>
            <Col span="6">
            <FormItem prop="courseType" label="课程类型">
              <RadioGroup v-model="courseBase.courseType">
                <Radio :label="PUB_COURSE_TYPE">选修课程</Radio>
                <Radio :label="MY_COURSE_TYPE">必修课程</Radio>
              </RadioGroup>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem prop="courseDisplay" label="课程简介">
              <Input type="textarea" v-model="courseBase.courseDisplay"></Input>
            </FormItem>
            </Col>
            <Col span="8" offset="8">
            <FormItem>
              <Button v-if="!isCradCreated.cardA" type="primary" long @click="newCourseSave('courseForm')">下一步</Button>
              <Button v-else type="primary" long @click="modifyCourseSave('courseForm')">保存</Button>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
      <!-- 资源上传 -->
      <div class="card" v-show="isCardShow.cardB">

        <h4 class="title">资源上传</h4>
        <!-- 头像上传 start-->
        <div v-if="viewMode == VIEW_MODE.CARD">
          <Divider>
            <small>课程封面</small>
          </Divider>
          <elms-cover-upload :coverId="coverId" :courseId="courseId" @coverUploaded="coverUploaded"></elms-cover-upload>
        </div>

        <div>
          <Divider v-if="viewMode == VIEW_MODE.CARD">
            <small>资源文件</small>
          </Divider>
          <Tabs>
            <TabPane label="视频上传">
              <elms-aliuploader ref="aliyploader" :courseId="courseId" @getSuccVideoList="getSuccVideoList"></elms-aliuploader>
            </TabPane>
            <TabPane label="PDF上传">
              <elms-plupload ref="plupload" :courseId="courseId" @getSuccFileList="getSuccFileList"></elms-plupload>
            </TabPane>
          </Tabs>
        </div>
        <div v-show="fileSuccList.length>0">
          <p>已添加课程资源
            <small>（双击修改文件名 拖动进行排序）</small>
          </p>
          <elms-split></elms-split>
          <!-- 拖动排序 -->
          <draggable class="list-group" element="ul" v-model="fileSuccList" :options="dragOptions" :move="onMove" @start="isDragging=true" @end="draggend" @change="sortChange">
            <transition-group type="transition" :name="'flip-list'">
              <li class="list-group-item" v-for="(item,index) in fileSuccList" :key="item.resourceId">
                <div class="name">
                  <Icon type="md-videocam" size="16" v-show="item.resourceType == VIDEO_RESOURCE_TYPE" />
                  <Icon type="md-document" size="16" v-show="item.resourceType == FILE_RESOURCE_TYPE" />
                  <elms-input-change :file="item" :index="index" @on-change="nameChange"></elms-input-change>
                </div>
                <span class="del-btn">
                  <!-- <span>学习时间：
                    <InputNumber :min="1" v-model="item.learnTime" @on-change="setLearnTime(item.resourceId,item.learnTime)" :formatter="value => `${value}分钟`" :parser="value => value.replace('分钟', '')" size="small"></InputNumber>
                  </span> -->
                  <Icon type="ios-trash-outline" size="20" color="#707070" @click.stop="deleteSource(item)" />
                </span>
              </li>
            </transition-group>
          </draggable>
        </div>
        <elms-split></elms-split>
        <Row v-show="!isCradCreated.cardB">
          <Col span="8" offset="8">
          <Button type="primary" long @click="toCardB">下一步</Button>
          </Col>
        </Row>
      </div>
      <!-- 考试信息 -->
      <div class="card" v-show="isCardShow.cardC">
        <h4 class="title">考试信息
        </h4>
        <p class="label">
          <label style="padding-right:10px;"> 是否考试</label>
          <i-switch v-model="isExam" @on-change="examStautsChange">
            <span slot="open">是</span>
            <span slot="close">否</span>
          </i-switch>
        </p>
        <div v-show="isExam">
          <!-- <h3 class="label">考题设置</h3> -->
          <elms-set-exam v-for="(examData,index) in examDataList" :examBankList="examBankList" :examData="examData" :listLength="examDataList.length" :index="index" :key="index" @examBankChange="examBankChange" @addRow="addRow" @deleteRow="deleteRow"></elms-set-exam>
          <Form ref="examForm" :model="examForm" inline label-position="left" :label-width="60">
            <FormItem prop="courseName" label="考试时长">
              <InputNumber style="width:100%" size="small" v-model="examForm.examTime" :min="1" :max="720" :formatter="value => `${value} 分钟`" :parser="value => value.replace(' 分钟', '')"></InputNumber>
            </FormItem>
            <FormItem prop="availableDay" label="考试次数">
              <InputNumber style="width:100%" size="small" v-model="examForm.maxTimes" :min="1" :formatter="value => `${value} 次`" :parser="value => value.replace(' 次', '')"></InputNumber>
            </FormItem>
            <FormItem prop="passScore" label="合格率">
              <InputNumber style="width:100%" size="small" v-model="examForm.passScore" :min="1" :max="100" :formatter="value => `${value} %`" :parser="value => value.replace(' %', '')"></InputNumber>
            </FormItem>
          </Form>
        </div>
        <!-- 审核页面按钮 -->
        <Row :gutter="24" v-if="isCheckedShow">
          <Col span="8">
          <Button type="primary" ghost long @click="examSave('examForm')">保存</Button>
          </Col>
          <Col span="8">
          <Button type="error" ghost long @click="courseAudit(0)">拒绝</Button>
          </Col>
          <Col span="8">
          <Button type="info" long @click="courseAudit(1)">通过</Button>
          </Col>
        </Row>
        <div v-if="!isCheckedShow">
          <Row v-if="!isCradCreated.cardB">
            <Col span="8" offset="8">
            <Button type="primary" long @click="examSave('examForm')">保存</Button>
            </Col>
          </Row>
          <Row :gutter="24" v-else>
            <Col span="12">
            <Button type="primary" ghost long @click="examSave('examForm')">保存</Button>
            </Col>
            <Col span="12">
            <Button type="primary" long @click="sendToAdmin">发送至审核</Button>
            </Col>
          </Row>
        </div>
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
  ApiPostCourseCover,
  ApiGetBankExam,
  ApiPostCourseExam,
  ApiGetCourseInfo,
  ApiPutCourseSubmit,
  ApiGetCompanyTree,
  ApiPostCourseRelation,
  ApiPutCourseAudit,
  ApiPostLearnTime
} from "@/api/set-course-api.js";
import { ApiGetSysConfig } from "@/api/system-manage-api.js";
import { resCode } from "@/api/code";
import { courseCoverList, ossImageUrl } from "common/js/util.js";
import ElmsAliuploader from "components/elms-aliupload";
import ElmsPlupload from "components/elms-plupload";
import ElmsSplit from "components/units/elms-split";
import ElmsCoverUpload from "components/units/elms-cover-upload";
import ElmsInputChange from "components/units/elms-input-change";
import ElmsSetExam from "components/elms-set-exam";
import ElmsLearnerSelect from "components/elms-learner-select";
import draggable from "vuedraggable";
import qs from "qs";

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
    ElmsAliuploader,
    ElmsPlupload,
    ElmsSplit,
    ElmsInputChange,
    ElmsSetExam,
    ElmsCoverUpload,
    ElmsLearnerSelect,
    draggable
  },
  data() {
    return {
      VIDEO_RESOURCE_TYPE: VIDEO_RESOURCE_TYPE,
      FILE_RESOURCE_TYPE: FILE_RESOURCE_TYPE,
      PUB_COURSE_TYPE: PUB_COURSE_TYPE,
      MY_COURSE_TYPE: MY_COURSE_TYPE,
      COURSE_SET_TYPE: COURSE_SET_TYPE,
      VIEW_MODE: VIEW_MODE,
      dragOptions: {
        animation: 0,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      },
      courseBase: {
        courseName: "",
        availableDay: 1,
        courseType: 0,
        courseDisplay: "",
        courseStatus: ""
      },
      courseFormRule: {
        courseName: [{ required: true, message: " ", trigger: "blur" }]
      },
      coverId: -1, //新建是coverId默认为0，修改是传入对应值
      isCoverUploaded: false, //标识课程封面是否已上传
      courseId: 0,
      viewMode: VIEW_MODE.CARD, //课程展示形式
      isDragging: false,
      delayedDragging: false,
      videoList: [],
      fileList: [],
      defaultFileList: [], //修改界面保存已经存在的文件list
      isExam: false, //是否考试
      examId: "", //试题id 只有修改界面有此值
      examBankList: [], //题库列表
      isCardShow: {
        //控制三个卡片的显示隐藏
        cardA: true,
        cardB: false,
        cardC: false
      },
      isCradCreated: {
        //标识三个卡片的信息是否已经创建
        cardA: false,
        cardB: false,
        cardC: false
      },
      examDataList: [
        { qbName: "", qbId: null, isNew: true, questionNum: 1, questionSum: 0 }
      ],
      examForm: {
        passScore: 60, //合格率
        maxTimes: 3, //最大考试次数
        examTime: 30 //考试时长
      },
      treeData: [] //部门组织树
    };
  },
  computed: {
    pageType() {
      //新建页面：1  修改页面：0
      return this.$route.params.pageType;
    },
    roleCode() {
      return window.$cookies.get("roleCode");
    },
    isCheckedShow() {
      //可以显示审核按钮的情况
      let _privilege = this.roleCode == USER_ROLE.ADMIN;
      return _privilege && this.courseBase.courseStatus == COURSE_STATUS.REVIEW;
    },
    fileSuccList: {
      get: function() {
        return [...this.defaultFileList, ...this.fileList, ...this.videoList];
      },
      set: function(newValue) {
        console.log(newValue);
        return newValue;
      }
    }
  },
  methods: {
    init() {
      if (this.pageType == COURSE_SET_TYPE.MODIFY_PAGE) {
        //编辑页面初始化视图
        for (let key in this.isCardShow) {
          this.isCardShow[key] = true;
        }
        for (let key in this.isCradCreated) {
          this.isCradCreated[key] = true;
        }
        this.getCourseInfo(this.$route.query.courseId);
        this.getSysConfig();
      } else if (this.pageType == COURSE_SET_TYPE.NEW_PAGE) {
        //新建页面初始化视图
        for (let key in this.isCardShow) {
          this.isCardShow[key] = key == "cardA" ? true : false;
        }
        for (let key in this.isCradCreated) {
          this.isCradCreated[key] = false;
        }
        this.getSysConfig();
      }
    },
    getSysConfig() {
      //请求系统配置
      ApiGetSysConfig().then(res => {
        if (res.code == "success") {
          if (res.data) {
            this.viewMode = res.data.courseShow;
          }
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },
    sortChange({ added, removed, moved }) {
      //排序
      ApiPutResourceSort({
        courseId: moved.element.courseId,
        resourceId: moved.element.resourceId,
        sort: moved.newIndex + 1
      })
        .then(res => {
          if (res.code == "success") {
          } else {
            //请求失败时将移动了的数组恢复
            let nowIndex = moved.newIndex;
            let targetIndex = moved.oldIndex;
            let target = moved.element;
            this.reviveArr(nowIndex, targetIndex, target);
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        })
        .catch(error => {
          let nowIndex = moved.newIndex;
          let targetIndex = moved.oldIndex;
          let target = moved.element;
          this.reviveArr(nowIndex, targetIndex, target);
        });
    },
    //恢复数组的方法
    reviveArr(nowIndex, targetIndex, target) {
      let _arr = [];
      //向后移动：true 向前移动 false
      let flag = targetIndex > nowIndex ? true : false;
      for (let [index, item] of this.fileSuccList.entries()) {
        if (index == targetIndex) {
          if (flag) {
            _arr.push(item);
            _arr.push(target);
          } else {
            _arr.push(target);
            _arr.push(item);
          }
        } else if (index != nowIndex) {
          _arr.push(item);
        }
      }
      this.fileSuccList = _arr;
    },
    draggend() {
      this.isDragging = false;
    },
    //新建课程
    newCourseSave(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          ApiPostNewCourse(this.courseBase).then(res => {
            if (res.code == "success" && res.data.courseId) {
              this.isCradCreated.cardA = true;
              this.isCardShow.cardB = true;
              this.courseId = res.data.courseId;
            } else {
              if (resCode[res.code]) {
                this.$Message.error(resCode[res.code]);
              }
            }
          });
        }
      });
    },
    //修改课程基本信息
    modifyCourseSave(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let _params = { courseId: this.courseId, ...this.courseBase };
          ApiPutCourse(_params).then(res => {
            if (res.code == "success") {
              this.$Message.success("修改成功");
            } else {
              if (resCode[res.code]) {
                this.$Message.error(resCode[res.code]);
              }
            }
          });
        }
      });
    },
    coverUploaded(value) {
      //标识课程封面是否已经上传
      this.isCoverUploaded = value;
    },
    getSuccVideoList(videos) {
      this.videoList = videos;
    },
    getSuccFileList(files) {
      this.fileList = files;
    },
    setLearnTime(id, learnTime) {
      //设置学习时间
      ApiPostLearnTime({
        resourceId: id,
        learnTime: learnTime
      }).then(res => {
        if (res.code == "success") {
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    nameChange(newName, id, index) {
      //修改资源名称
      ApiPutResource({
        resourceId: id,
        resourceName: newName
      }).then(res => {
        if (res.code == "success") {
          this.fileSuccList[index].resourceName = newName;
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    deleteSource(item) {
      //删除课程资源
      ApiDeleteResource({
        resourceId: item.resourceId,
        resourceType: item.resourceType,
        resourceOid: item.resourceOid
      }).then(res => {
        if (res.code == "success") {
          //视图层删除
          this.defaultFileList = this.defaultFileList.filter(
            (currentValue, i, arr) => {
              return item.resourceOid != currentValue.resourceOid;
            }
          );
          this.videoList = this.videoList.filter((currentValue, i, arr) => {
            return item.resourceOid != currentValue.resourceOid;
          });
          this.fileList = this.fileList.filter((currentValue, i, arr) => {
            return item.resourceOid != currentValue.resourceOid;
          });
          //子组件中数据删除
          this.$refs.plupload.removeSuccFileList(item.resourceOid);

          this.$refs.aliyploader.removeSuccVideoList(item.resourceOid);
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    toCardB() {
      //下一步'
      if (!this.isCoverUploaded && this.viewMode == VIEW_MODE.CARD) {
        this.$Message.warning("请选择课程封面");
      } else if (this.fileSuccList.length == 0) {
        this.$Message.warning("请上传课程资源");
      } else {
        //如果是list视图随机一个课程封面提交
        if (this.viewMode == VIEW_MODE.LIST) {
          let _coverList = courseCoverList();
          let _random = Math.floor(Math.random() * _coverList.length);
          ApiPostCourseCover({
            courseId: this.courseId,
            coverId: _coverList[_random].id
          }).then(res => {
            if (res.code == "success") {
              this.isCardShow.cardC = true;
              this.isCradCreated.cardC = true;
            } else {
              if (resCode[res.code]) {
                this.$Message.error(resCode[res.code]);
              }
            }
          });
        } else {
          this.isCardShow.cardC = true;
          this.isCradCreated.cardC = true;
        }
      }
    },
    examStautsChange(val) {
      if (val) {
        //需要考试是请求题库列表
        ApiGetBankExam().then(res => {
          if (res.code == "success") {
            this.examBankList = res.data.map((value, index) => {
              return {
                qbId: value.qbId,
                qbName: value.qbName,
                questionNum: value.questionNum,
                isDisabled: false
              };
            });
          } else {
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        });
      }
    },
    //题库选择
    examBankChange(v, index) {
      this.examDataList[index].qbId = v.value;
      this.examDataList[index].qbName = v.label;
      //设置题目总数
      for (let [i, item] of this.examBankList.entries()) {
        if (v.value == item.qbId) {
          this.$set(this.examDataList[index], "questionSum", item.questionNum);
          break;
        }
      }
    },
    //添加行
    addRow(examData, index) {
      if (!this.examDataList[index].qbId) {
        this.$Message.warning("请选择当前行题库");
      } else {
        this.examDataList[index].isNew = false;
        this.examDataList.push({
          qbName: "",
          qbId: null,
          isNew: true,
          questionNum: 1,
          questionSum: 0
        });
      }
    },
    //删除行
    deleteRow(examData, index) {
      this.examDataList.splice(index, 1);
    },
    //考试信息保存
    examSave(name) {
      if (this.fileSuccList.length == 0) {
        this.$Message.warning("请上传课程资源");
      } else {
        if (this.isExam) {
          this.$refs[name].validate(valid => {
            let _detailList = this.examDataList.map((value, index) => {
              if (value.qbId && value.questionNum > 0) {
                return { qbId: value.qbId, questionNum: value.questionNum };
              }
            });
            let _params = {
              courseId: this.courseId,
              hasExam: true,
              passScore: this.examForm.passScore,
              maxTimes: this.examForm.maxTimes,
              examTime: this.examForm.examTime,
              detailList: _detailList
            };
            if (this.pageType == COURSE_SET_TYPE.MODIFY_PAGE) {
              //修改页面保存考试信息添加examId
              _params.examId = this.examId;
            }
            ApiPostCourseExam(_params).then(res => {
              if (res.code == "success") {
                this.$Message.success("考试信息设置成功");
                this.isCradCreated.cardB = true;
              } else {
                if (resCode[res.code]) {
                  this.$Message.error(resCode[res.code]);
                }
              }
            });
          });
        } else {
          this.isCradCreated.cardB = true;
          this.$Message.success("考试信息设置成功");
        }
      }
    },
    //发送至审核
    sendToAdmin() {
      if (!this.isCoverUploaded && this.viewMode == VIEW_MODE.CARD) {
        this.$Message.warning("没有上传/选择课程封面，无法发送至审核");
      } else if (this.fileSuccList.length == 0) {
        this.$Message.warning("没有上传课程资源，无法发送至审核");
      } else {
        ApiPutCourseSubmit(this.courseId).then(res => {
          if (res.code == "success") {
            this.$Message.success("已发送至审核");
            this.courseBase.courseStatus = COURSE_STATUS.REVIEW;
            this.isCradCreated.cardC = true;
            if (this.roleCode != USER_ROLE.ADMIN) {
              this.$router.push({
                name: "courseInfoView",
                query: { courseId: this.courseId }
              });
            }
          } else {
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        });
      }
    },
    //修改页面获取单个课程信息
    getCourseInfo(courseId) {
      ApiGetCourseInfo(courseId).then(res => {
        if (res.code == "success") {
          this.courseId = res.data.courseId;
          this.courseBase.courseName = res.data.courseName;
          this.courseBase.availableDay = res.data.availableDay;
          this.courseBase.courseDisplay = res.data.courseDisplay;
          this.courseBase.courseType = res.data.courseType;
          this.courseBase.courseStatus = res.data.courseStatus;
          this.defaultFileList = res.data.resources;
          this.coverId = res.data.coverId;
          this.isExam = res.data.hasExam;
          if (this.coverId) {
            this.isCoverUploaded = true; //标志封面已上传
          }

          if (this.isExam) {
            this.examForm.examTime = res.data.examVo.examTime;
            this.examForm.passScore = res.data.examVo.passScore;
            this.examForm.maxTimes = res.data.examVo.maxTimes;
            this.examId = res.data.examVo.examId;
            //需要考试是请求题库列表
            ApiGetBankExam().then(req => {
              if (req.code == "success") {
                this.examBankList = req.data;
                this.examDataList =
                  res.data.examVo.detailList.length > 0
                    ? res.data.examVo.detailList
                    : [
                        {
                          qbName: "",
                          qbId: null,
                          isNew: true,
                          questionNum: 1,
                          questionSum: 0
                        }
                      ];
              }
            });
          }
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    //课程审核
    courseAudit(result) {
      if (this.fileSuccList.length == 0 && result == 1) {
        this.$Message.warning("未上传课程资源，请添加资源文件后进行审核");
      } else {
        ApiPutCourseAudit(this.courseId, qs.stringify({ result: result })).then(
          res => {
            if (res.code == "success") {
              if (result == 0) {
                //审核拒绝
                this.courseBase.courseStatus = COURSE_STATUS.REFUSED;
                this.$Message.error("课程审核被拒绝");
                this.$router.push({ name: "createdCourse" });
              } else if (result == 1) {
                //审核通过
                this.$router.push({
                  name: "courseInfoView",
                  query: { courseId: this.courseId }
                });
              }
            } else {
              if (resCode[res.code]) {
                this.$Message.error(resCode[res.code]);
              }
            }
          }
        );
      }
    },
    //审核界面过去人员组织结构
    getTree() {
      ApiGetCompanyTree(this.courseId).then(res => {
        if (res.code == "success") {
          this.treeData = res.data;
        }
      });
    },
    learnerSave(data) {
      ApiPostCourseRelation(data).then(res => {
        if (res.code == "success") {
          this.$Message.success("设置成功");
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    }
  },
  watch: {
    isDragging(newValue) {
      if (newValue) {
        this.delayedDragging = true;
        return;
      }
      this.$nextTick(() => {
        this.delayedDragging = false;
      });
    },
    //监听examDataList 给题库list添加disable属性
    examDataList(val, oldVal) {
      //保存已添加的题库id list
      let _arr = val.map((value, index) => {
        return value.qbId;
      });
      //已添加的题库 添加disable属性
      this.examBankList = this.examBankList.map((value, index) => {
        return {
          qbId: value.qbId,
          qbName: value.qbName,
          questionNum: value.questionNum,
          isDisabled: _arr.includes(value.qbId)
        };
      });
      if (val.length == 1) {
        val[0].isNew = true;
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style  lang="scss" >
.vertical-center-modal {
  display: flex;
  align-items: center;
  justify-content: center;

  .ivu-modal {
    top: 0;
  }
}
</style>

<style lang="scss" scoped>
@import "../common/css/mixin.scss";
.new-course-outer {
  min-height: 100%;
  background: url("/static/bg_img/new_course_bg.png") 0 0 no-repeat;
  background-size: cover;
  background-attachment: fixed;
}
.new-course {
  @include typeArea();
  padding: 20px;
  .card {
    width: 100%;
    background: #fff;
    padding: 20px;
    border-radius: 10px;
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
}

// 拖动排序 start
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
}
.list-group-item {
  cursor: move;
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e4e4e8;
  margin-bottom: 5px;
  .del-btn,
  .name {
    cursor: pointer;
    display: flex;
    align-items: center;
  }
}

// 拖动排序 end
.label {
  margin: 8px 0;
}
</style>


