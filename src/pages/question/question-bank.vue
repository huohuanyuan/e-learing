<template>
  <div class="question-wrap">
    <div class="question">
      <div class="content">
        <Row :gutter="16">
          <Col :md="8" :sm="12" :xs="24">
          <div class="left-add">
            <Input v-model.trim="newBankForm.qbName" placeholder="新建题库..."></Input>
            <Button type="warning" class="add-btn" @click="postBank"> 新建 </Button>
            <ol>
              <li v-for=" (item, index) in bankData" :key="index" @click="addClassFun(item.qbId)" :class="{'active': item.qbId == active}">
                <div v-if="index != qbNameShow">
                  {{item.qbName }}
                  <span @click.stop="deleteBankModalFun(item)" class="operation"> 删除 </span>
                  <span @click.stop="editBank(item,index)" class="operation"> 修改 </span>
                </div>
                <div v-if="index == qbNameShow">
                  <Input v-model="copyBank.qbName" />
                  <Button type="success" size="small" @click.stop="putBank"> 保存 </Button>
                  <Button type="dashed" size="small" @click.stop="qbNameShowFun"> 取消 </Button>
                </div>
              </li>

            </ol>
            <Page :total="bank.total" size="small" :current="bank.pageNum" :page-size="bank.pageSize" show-sizer show-total @on-change="handlePage" @on-page-size-change='handlePageSize'>
            </Page>
          </div>
          </Col>
          <Col :md="16" :sm="12" :xs="24">
          <p class="p-button">
            <Button type="warning" @click="addQusitonFun" v-show="addQusitonShow"> 新建题目 </Button>
          </p>
          <div>

            <Table stripe :columns="columnsQuestion" :data="questionData"></Table>
            <div class="page">
              <Page :total="question.total" size="small" :current="question.pageNum" :page-size="question.pageSize" show-elevator show-sizer show-total @on-change="questionHandlePage" @on-page-size-change='questionHandlePageSize'>
              </Page>
            </div>
          </div>

          </Col>
        </Row>
      </div>
      <!-- 新建题目的模态框 -->
      <Modal v-model="questionModal" title="新建试题" :mask-closable="false" :width="700" class="new-question">
        <Form ref="newQuestion" :model="newQuestion" :rules="newQuestionInline">
          <FormItem prop="qtDetail">
            <Input v-model.trim="newQuestion.qtDetail" type="textarea" :autosize="{minRows: 3,maxRows: 7}" placeholder="请编辑问题"></Input>
          </FormItem>
          <div>
            <Row :gutter="16" v-for="(item, index) in questionList" :key="index">
              <Col :md="1" :xs="1" class="left">
              <Checkbox v-model.trim="item.isAnswer"> </Checkbox>
              </Col>
              <Col :md="21" :xs="21">
              <FormItem>
                <Input type="textarea" v-model.trim="item.qiDetail" placeholder="选项"></Input>
              </FormItem>
              </Col>
              <Col :md="2" :xs="2" class="left">
              <div @click="removeQiFun(item)" class="remove-qi"> 删除 </div>
              </Col>
            </Row>
            <p class="add-p" @click="addQiFun">
              <Icon type="md-add" /> 增加选项 </p>
          </div>
        </Form>
        <div slot="footer">
          <Button type="primary" long :loading="newLoading" @click="saveQtFun('newQuestion')"> 保存 </Button>
        </div>
      </Modal>
      <!-- 修改试题信息  -->
      <Modal v-model="editQuestionModal" title="修改题库" :mask-closable="false" :width="700" class="new-question">
        <Form ref="editQuestion" :model="editQuestion" :rules="editQuestionInline">
          <FormItem prop="qtDetail">
            <Input v-model.trim="editQuestion.qtDetail" type="textarea" :autosize="{minRows: 3,maxRows: 7}" placeholder="请编辑问题"></Input>
          </FormItem>
          <div>
            <Row :gutter="16" v-for="(item, index) in editQuestionList" :key="index" v-if="item.operateType != 3">
              <Col :md="1" :xs="1" class="left">
              <Checkbox v-model.trim="item.isAnswer"> </Checkbox>
              </Col>
              <Col :md="21" :xs="21">
              <FormItem>
                <Input type="textarea" v-model.trim="item.qiDetail" placeholder="选项"></Input>
              </FormItem>
              </Col>
              <Col :md="2" :xs="2" class="left">
              <div @click="removeQiEditFun(item)" class="remove-qi"> 删除 </div>
              </Col>
            </Row>
            <p class="add-p" @click="addQiEditFun">
              <Icon type="md-add" /> 增加选项 </p>
          </div>
        </Form>
        <div slot="footer">
          <Button type="primary" long :loading="editLoading" @click="putQuestion('editQuestion')"> 保存 </Button>
        </div>
      </Modal>
      <!--  删除 题库 -->
      <Modal v-model="deleteBankModal" width="360">
        <p slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle"></Icon>
          <span> 确认删除！</span>
        </p>
        <div style="text-align:center">
          <p> 此题库删除后，题库下的试题也会删除！</p>
          <p> 是否继续删除？ </p>
        </div>
        <div slot="footer">
          <Button type="error" size="large" long @click="reomveBank"> 删除 </Button>
        </div>
      </Modal>
    </div>
  </div>
</template>
<script>
import qs from "qs";
import {
  ApiPostBank,
  ApiGetBank,
  ApiPutBank,
  ApiDeletBank,
  ApiGetBankCon,
  ApiPostQuestion,
  ApiDeletQuestion,
  ApiGetQuestion,
  ApiPutQuestion
} from "@/api/question-api";
import { resCode } from "@/api/code";
import { shallowCopy } from "@/common/js/util";

// 修改按钮
const editButton = (vm, h, params) => {
  return h(
    "Button",
    {
      props: {
        type: "primary",
        size: "small"
      },
      style: {
        marginRight: "5px"
      },
      on: {
        click: () => {
          vm.editQuestionFun(params.row.qtId);
        }
      }
    },
    "编辑"
  );
};
// 删除按钮
const deleteButton = (vm, h, params) => {
  return h(
    "Poptip",
    {
      props: {
        confirm: true,
        title: "您确定要删除这条数据吗?",
        transfer: true
      },
      on: {
        "on-ok": () => {
          vm.deletQuestion(params.row.qtId);
        }
      }
    },
    [
      h(
        "Button",
        {
          style: {
            marginRight: "5px"
          },
          props: {
            type: "error",
            placement: "top",
            size: "small"
          }
        },
        "删除"
      )
    ]
  );
};
// 查看按钮
const viewButton = (vm, h, params) => {
  return h(
    "Button",
    {
      props: {
        type: "success",
        size: "small"
      },
      style: {
        marginRight: "5px"
      },
      on: {
        click: () => {
          vm.view(params.row.qbId);
        }
      }
    },
    "查看"
  );
};

export default {
  data() {
    return {
      questionList: [
        {
          isAnswer: false,
          qiDetail: "",
          value: 1
        }
      ],
      qbId: "",
      qbNameShow: -1,
      deleteBankModal: false,
      addQusitonShow: false,
      editQuestionModal: false,
      active: "-1", // 题库添加class
      questionModal: false,
      newLoading: false,
      newBankForm: {
        qbName: ""
      },
      copyBank: {
        qbName: "",
        qbId: ""
      },
      bank: {
        total: 0,
        pageNum: 1,
        pageSize: 10
      },
      question: {
        total: 0,
        pageNum: 1,
        pageSize: 10
      },
      bankData: [],
      questionData: [],
      columnsQuestion: [
        {
          title: " ",
          width: 60,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              (function(vm) {
                let _code =
                  (vm.question.pageNum - 1) * vm.question.pageSize +
                  params.index +
                  1;
                return _code;
              })(this)
            );
          }
        },
        {
          title: "题目",
          key: "qtDetail",
          align: "center"
        },
        {
          title: "操作",
          key: "action",
          width: 180,
          align: "center",
          render: (h, params) => {
            return h("div", [
              editButton(this, h, params),
              deleteButton(this, h, params)
            ]);
          }
        }
      ],
      newQuestion: {},
      newQuestionInline: {
        qtDetail: [
          {
            required: true,
            message: " ",
            trigger: "blur"
          }
        ]
      },
      editLoading: false,
      editQuestion: {
        qtDetail: "",
        qtId: ""
      },
      editQuestionList: [], // 修改试题的 data
      editQuestionInline: {
        qtDetail: [
          {
            required: true,
            message: " ",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    // 题库 分页
    handlePage(value) {
      this.bank.pageNum = value;
      this.getBank();
    },
    handlePageSize(value) {
      this.bank.pageSize = value;
      this.getBank();
    },
    // 题目分页
    questionHandlePage(value) {
      this.question.pageNum = value;
      this.getBankCon();
    },
    questionHandlePageSize(value) {
      this.question.pageNum = 1;
      this.question.pageSize = value;
      this.getBankCon();
    },
    // 新建题库点击保存
    postBank() {
      if (this.newBankForm.qbName != "") {
        ApiPostBank(qs.stringify(this.newBankForm)).then(res => {
          if (res.code == "success") {
            this.$Message.success("新建成功!");
            this.newBankForm.qbName = "";
            this.getBank();
          } else {
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        });
      }
    },
    // 点击 题库添加 class
    addClassFun(id) {
      this.active = id;
      this.addQusitonShow = true;
      this.getBankCon();
    },
    // 获取题库下题目
    getBankCon() {
      ApiGetBankCon(this.active, this.question).then(res => {
        if (res.code == "success") {
          this.questionData = res.data;
          this.question.total = res.total;
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    // 请求 题库列表
    getBank() {
      let _data = {
        pageNum: this.bank.pageNum,
        pageSize: this.bank.pageSize
      };
      ApiGetBank(_data).then(res => {
        if (res.code == "success") {
          this.bankData = res.data;
          this.bank.total = res.total;
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    // 删除 题库
    deleteBankModalFun(data) {
      this.deleteBankModal = true;
      this.qbId = data.qbId;
    },
    // 删除 题库
    reomveBank() {
      ApiDeletBank(this.qbId).then(res => {
        if (res.code == "success") {
          this.$Message.success("删除成功!");
          this.deleteBankModal = false;
          if (this.bankData.length == 1) {
            this.bank.pageNum = this.bank.pageNum > 1 ? --this.bank.pageNum : 1;
          }
          this.getBank();
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    // 题库点击修改
    editBank(data, index) {
      this.qbNameShow = index;
      this.copyBank = shallowCopy(data);
    },
    qbNameShowFun() {
      this.qbNameShow = -1;
    },
    // 修改点击保存
    putBank() {
      let _data = {
        qbName: this.copyBank.qbName,
        qbId: this.copyBank.qbId
      };
      if (this.copyBank.qbName != "") {
        ApiPutBank(_data).then(res => {
          if (res.code == "success") {
            this.$Message.success("修改成功!");
            this.qbNameShow = -1;
            this.getBank();
          } else {
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        });
      } else {
        this.$Message.warning("请完善题库信息!");
      }
    },

    // 点击添加 试题
    addQusitonFun() {
      this.questionModal = true;
      this.$refs["newQuestion"].resetFields();
      this.questionList = [
        {
          isAnswer: false,
          qiDetail: "",
          value: 1
        }
      ];
    },
    // 添加 选项
    addQiFun() {
      let popValue;
      if (this.questionList.length > 1) {
        popValue = this.questionList[this.questionList.length - 1].value;
        popValue = popValue * 2;
      } else {
        popValue = this.questionList[0].value * 2;
      }
      let data = {
        isAnswer: false,
        qiDetail: "",
        value: popValue
      };
      this.questionList.push(data);
    },
    // 删除 选项
    removeQiFun(data) {
      if (this.questionList.length > 1) {
        this.questionList = this.questionList.filter(function(item) {
          return item.value != data.value;
        });
      }
    },
    // 保存 新建试题
    saveQtFun(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let questionItems = [];
          let qtType; // 判断是多选还是单选
          let qtTypeList = [];
          for (let i = 0; i < this.questionList.length; i++) {
            let itemData = {};
            itemData.isAnswer = this.questionList[i].isAnswer;
            itemData.qiDetail = this.questionList[i].qiDetail;
            // Math 对象用于执行数学任务，其中的方法pow(x,y)    返回 x 的 y 次幂
            // itemData.answerCode = Math.pow(2, i);
            itemData.answerCode = i;
            questionItems.push(itemData);
            if (this.questionList[i].isAnswer) {
              qtTypeList.push(1);
            }
            if (this.questionList[i].qiDetail == "") {
              this.$Message.warning("请完善选项信息!");
              return false;
            }
          }
          // 判断是 多选 还是单选
          if (qtTypeList.length > 1) {
            qtType = 1;
          } else if (qtTypeList.length == 1) {
            qtType = 0;
          } else {
            this.$Message.warning("请选择正确答案!");
            return false;
          }
          let _data = {
            qbId: this.active,
            qtDetail: this.newQuestion.qtDetail,
            questionItems: questionItems,
            qtType: qtType
          };
          this.newLoading = true;
          ApiPostQuestion(_data)
            .then(res => {
              this.newLoading = false;
              if (res.code == "success") {
                this.$Message.success("新建成功!");
                this.questionModal = false;
                this.getBankCon();
              } else {
                if (resCode[res.code]) {
                  this.$Message.error(resCode[res.code]);
                }
              }
            })
            .catch(error => {
              this.newLoading = false;
            });
        }
      });
    },
    // 删除 试题
    deletQuestion(qtId) {
      ApiDeletQuestion(qtId).then(res => {
        if (res.code == "success") {
          this.$Message.success("删除成功!");
          if (this.questionData.length == 1) {
            this.question.pageNum =
              this.question.pageNum > 1 ? --this.question.pageNum : 1;
          }
          this.getBankCon();
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    // 点击 试题编辑按钮
    editQuestionFun(qtId) {
      this.editQuestionModal = true;
      this.getQuestion(qtId);
    },
    // 请求 试题信息
    getQuestion(qtId) {
      ApiGetQuestion(qtId).then(res => {
        if (res.code == "success") {
          this.editQuestion.qtDetail = res.data.qtDetail;
          this.editQuestion.qtId = res.data.qtId;
          this.editQuestionList = res.data.questionItems;
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    // 修改 模态框的 添加试题
    addQiEditFun() {
      let popValue;
      if (this.editQuestionList.length > 1) {
        popValue = this.editQuestionList[this.editQuestionList.length - 1]
          .value;
        popValue = popValue * 2;
      } else {
        popValue = this.editQuestionList[0].value * 2;
      }
      let data = {
        isAnswer: false,
        qiDetail: "",
        value: popValue
      };
      this.editQuestionList.push(data);
    },
    // 删除 试题 模态框
    removeQiEditFun(data) {
      if (this.editQuestionList.length > 1) {
        for (let i = 0; i < this.editQuestionList.length; i++) {
          if (data.value) {
            this.editQuestionList = this.editQuestionList.filter(function(
              item
            ) {
              return item.value != data.value;
            });
          } else {
            this.editQuestionList = this.editQuestionList.filter(function(
              item
            ) {
              return item.qiId != data.qiId;
            });
          }
        }
      }
    },
    // 修改完成后，提交试题
    putQuestion(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let qtType; // 判断是多选还是单选
          let qtTypeList = [];
          let qiList = []; // 判读是否有选项
          let questionItems = [];
          for (let i = 0; i < this.editQuestionList.length; i++) {
            let itemData = {};
            itemData.isAnswer = this.editQuestionList[i].isAnswer;
            itemData.qiDetail = this.editQuestionList[i].qiDetail;
            itemData.answerCode = i;
            questionItems.push(itemData);
            if (this.editQuestionList[i].isAnswer) {
              qtTypeList.push(1);
            }
            if (this.editQuestionList[i].qiDetail == "") {
              this.$Message.warning("请完善选项信息!");
              return false;
            }
          }
          // 判断是 多选 还是单选
          if (qtTypeList.length > 1) {
            qtType = 1;
          } else if (qtTypeList.length == 1) {
            qtType = 0;
          } else {
            this.$Message.warning("请选择正确答案!");
            return false;
          }
          let _data = {
            qbId: this.active,
            qtId: this.editQuestion.qtId,
            qtDetail: this.editQuestion.qtDetail,
            questionItems: questionItems,
            qtType: qtType
          };
          this.editLoading = true;
          ApiPutQuestion(_data)
            .then(res => {
              this.editLoading = false;
              if (res.code == "success") {
                this.$Message.success("修改成功!");
                this.editQuestionModal = false;
                this.getBankCon();
              } else {
                if (resCode[res.code]) {
                  this.$Message.error(resCode[res.code]);
                }
              }
            })
            .catch(error => {
              this.editLoading = false;
            });
        }
      });
    }
  },
  watch: {
    $route(to, from) {
      this.getBank();
    }
  },
  mounted() {
    this.getBank();
  }
};
</script>
<style lang="scss">
@import "../../common/css/variable.scss";
.question-wrap {
  min-height: 100%;
  background: url(/static/bg_img/new_course_bg.png) 0 0 no-repeat;
  background-size: cover;
  background-attachment: fixed;
}
.question {
  width: 1200px;
  margin: 0 auto;
  min-height: 100%;
  padding: 20px;
  .content {
    padding: 30px;
    background: #fff;
    border-radius: 10px;
  }
  .question-table {
    margin-top: 20px;
  }
  .add-btn {
    float: right;
  }
  .left-add {
    .ivu-input-wrapper {
      width: 72%;
    }
    ol {
      border: 1px solid $border-color;
      margin: 15px 0;
      li {
        padding: 10px;
        border-bottom: 1px solid $border-color;
        cursor: pointer;
      }
      .active {
        background: #f8f8f9;
      }
      li:last-child {
        border-bottom: none;
      }
    }
    .operation {
      float: right;
      margin-left: 5px;
    }
  }
  .p-button {
    text-align: right;
    margin-bottom: 15px;
    height: 32px;
  }
}
.new-question {
  .left {
    margin-top: 15px;
  }
  .add-p {
    margin-left: 30px;
    font-size: 14px;
    cursor: pointer;
    color: #2d8cf0;
  }
  .remove-qi {
    cursor: pointer;
  }
}
</style>


