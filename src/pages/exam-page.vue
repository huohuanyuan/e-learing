<template>
  <div class="examination-wrap">
    <div class="examination-div">
      <Row :gutter="16">
        <Col span="16">
        <div class="examination-top">
          <h2> {{courseName}} </h2>
          <div class="operating">
            <div class="left">
              <span> 共 {{ examInfo.questionNum}} 题 </span>
              <span class="time">
                {{countDownTime | countDownForamt}}
              </span>
              <div>
                <Button type="primary" @click="previousFun" :disabled="currQtIndex==0" size="small">
                  <Icon type="ios-arrow-back"></Icon>
                  上一题
                </Button>
                <Button type="primary" @click="nextQuestionFun" :disabled="currQtIndex+1 == examInfo.questionNum" size="small">
                  下一题
                  <Icon type="ios-arrow-forward"></Icon>
                </Button>
              </div>
            </div>
            <Button type="primary" @click="exemModalFun"> 交卷 </Button>
          </div>
        </div>
        <div class="question-content">
          <p class="title">{{currQtIndex+1}}.&nbsp;[{{ currQuestion.qtType | questionType}}]&nbsp;{{currQuestion.qtDetail}} </p>
          <div class="question-item" v-if="currQuestion.qtType == TEST_TYPE.RADIO">
            <RadioGroup v-model="currRadioAnswer" @on-change="answerSave">
              <Radio :label="item.answerCode" :checked.native="item.isAnswer" v-for=" (item , index ) in currQuestion.questionItems" :key="item.answerCode">
                {{optionOrder[index]}}.&nbsp;{{ item.qiDetail }}
              </Radio>
            </RadioGroup>
          </div>
          <div class="question-item" v-else>
            <CheckboxGroup v-model="currMutliAnswer" @on-change="answerSave">
              <Checkbox :label="item.answerCode" v-for=" (item , index ) in currQuestion.questionItems" :key="index">
                {{optionOrder[index]}}.&nbsp;{{ item.qiDetail }}
              </Checkbox>
            </CheckboxGroup>
          </div>
        </div>
        </Col>
        <Col span="8">
        <div class="examination-right">
          <h2> 答题卡 </h2>
          <div class="items" v-for="(item , index ) in answerSheetList" :key="index" :class="{ active: index === currQtIndex, answer:item.isAnswer }" @click="selectIndex(item.value)">
            {{ item.value +1 }}
          </div>
        </div>
        </Col>
      </Row>
      <!--  点击确认提交 -->
      <Modal v-model="exemModal" width="360">
        <p slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle"></Icon>
          <span> 提交确认！</span>
        </p>
        <div style="text-align:center">
          <p> 对于本次测评，确定是否交卷？</p>
        </div>
        <div slot="footer">
          <Button type="primary"  long @click="postExamCommit"> 确认 </Button>
        </div>
      </Modal>
    </div>
  </div>

</template>

<script>
import {
  ApiGetExamTextStart,
  ApiGetExamQuestion,
  ApiPostExamCommit
} from "@/api/examination-api";
import { resCode } from "@/api/code";
import qs from "qs";
import { getEN } from "common/js/util.js";
import { TEST_TYPE } from "common/js/constant.js";
import md5 from "js-md5";
import moment from "moment";
export default {
  data() {
    return {
      exemModal: false,
      isNewExam: true, //标志是不是新的考试（考试异常退出的情况）
      examDuration: {
        //考试时间参数
        examTime: "", //考试时长
        startTime: "" //开始答题时间
      },
      countDownTime: "",
      _interval: "", //定时器
      answerSheetList: [], //答题卡
      currQtIndex: 0, //当前题号
      TEST_TYPE: TEST_TYPE,
      optionOrder: [], //选项题号A/B/C/D
      currQuestion: {}, //题目信息
      examInfo: {}, //考试信息
      currRadioAnswer: "", //单选答案
      currMutliAnswer: [], //单选答案
      currQuestionType: "", //试题类型 单选 多选
      examAnswer: new Map()
    };
  },
  computed: {
    courseName() {
      return this.$route.query.courseName;
    },
    examId() {
      return this.$route.query.examId;
    },
    mcId() {
      return this.$route.query.mcId;
    },
    examAnswerKey() {
      //标识考试答案唯一键
      return md5(
        this.$cookies.get("userId") + this.$route.query.examId + "answer"
      );
    },
    examTimeKey() {
      //标识考试时间唯一键
      return md5(
        this.$cookies.get("userId") + this.$route.query.examId + "time"
      );
    }
  },
  methods: {
    init() {
      this.optionOrder = getEN();
      if (localStorage.getItem(this.examAnswerKey)) {
        //本地已经存在当前考试的答案，解析为map 保存到examAnswer
        let _arr = JSON.parse(localStorage.getItem(this.examAnswerKey));
        for (let elem of _arr.values()) {
          this.examAnswer.set(elem[0], elem[1]);
        }
      } else {
        this.examAnswer = new Map();
      }
      //判断当前考试的考试时间是否已经到期
      if (localStorage.getItem(this.examTimeKey)) {
        this.isNewExam = false;
        this.examDuration = JSON.parse(localStorage.getItem(this.examTimeKey));
        const examStart = this.examDuration.startTime;
        const examTime = this.examDuration.examTime;
        const examEndTime = moment().add(examTime * 60, "seconds"); //考试应该结束的时间
        //判断考试时间是否到期
        if (moment().isBefore(examEndTime)) {
          //当前时间在考试应该结束时间之前，计算倒计时的起点
          let _t = moment(moment()).diff(examStart, "seconds"); //当前时间减去考试开始时间 单位 s
          let _countDownTime = examTime * 60 - _t; //考试剩余时间 单位 s
          const end = moment().add(_countDownTime, "seconds"); //结束时间 moment对象
          const now = moment();
          this.countDownTime = moment(end - now).subtract(8, "hour"); //时区问题 减去8
        } else {
          //如果已经到期
          localStorage.removeItem(this.examTimeKey);
          localStorage.removeItem(this.examAnswerKey);
          this.isNewExam = true;
        }
      }
      this.getExamTextStart();
    },
    // 获取开始考试信息
    getExamTextStart() {
      ApiGetExamTextStart(this.examId, { mcId: this.mcId }).then(res => {
        if (res.code == "success") {
          this.examInfo.passScore = res.data.passScore;
          this.examInfo.questionNum = res.data.questionNum;
          this.examInfo.mcId = res.data.mcId;
          if (this.isNewExam) {
            this.examDuration.startTime = moment(new Date());
            this.examDuration.examTime = res.data.examTime;
            const end = moment().add(
              this.examDuration.examTime * 60,
              "seconds"
            ); //结束时间
            const now = moment();
            this.countDownTime = moment(end - now).subtract(8, "hour"); //时区问题 减去8
            localStorage.setItem(
              this.examTimeKey,
              JSON.stringify(this.examDuration)
            );
          }
          //开始倒计时
          this.countDown();
          this.currQuestion = res.data.questionVo;
          this.currQtIndex = 0;
          //生成答题卡
          this.answerSheetList = Array.from(
            Array(this.examInfo.questionNum),
            (v, k) => {
              return {
                isAnswer: false,
                value: k
              };
            }
          );
            //判断当前这道题是否已填写答案，如果填写则置入正确值
          if (this.examAnswer.has(this.currQtIndex)) {
            let _obj = this.examAnswer.get(this.currQtIndex);
            this.answerSheetList[this.currQtIndex].isAnswer = true;
            if (_obj.qtType == TEST_TYPE.RADIO) {
              this.currRadioAnswer = _obj.answer;
            } else if (_obj.qtType == TEST_TYPE.MULTI) {
              this.currMutliAnswer = _obj.answer;
            }
          }
        } else if (res.code == "max_exam_count") {
          this.$Modal.warning({
            title: "提示",
            content: "考试次数已达到上限，无法继续考试",
            onOk: () => {
              this.$router.go(-1); //返回上一层
            }
          });
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },

    // 获取考试指定题目
    getExamQuestion(index) {
      ApiGetExamQuestion(this.examId, index).then(res => {
        if (res.code == "success") {
          this.currRadioAnswer = "";
          this.currMutliAnswer = [];
          this.currQuestion = res.data;
          //判断当前这道题是否已填写答案，如果填写则置入正确值
          if (this.examAnswer.has(this.currQtIndex)) {
            let _obj = this.examAnswer.get(this.currQtIndex);
            this.answerSheetList[this.currQtIndex].isAnswer = true;
            if (_obj.qtType == TEST_TYPE.RADIO) {
              this.currRadioAnswer = _obj.answer;
            } else if (_obj.qtType == TEST_TYPE.MULTI) {
              this.currMutliAnswer = _obj.answer;
            }
          }
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    //保存答案
    answerSave() {
      //保存答案 题号为map的key
      let _answer = "";
      if (this.currQuestion.qtType == TEST_TYPE.RADIO) {
        _answer = this.currRadioAnswer;
        //标识到答题卡
        this.answerSheetList[this.currQtIndex].isAnswer = _answer
          ? true
          : false;
      } else if (this.currQuestion.qtType == TEST_TYPE.MULTI) {
        _answer = this.currMutliAnswer;
        //标识到答题卡
        this.answerSheetList[this.currQtIndex].isAnswer =
          _answer.length > 0 ? true : false;
      }
      if (this.examAnswer.has(this.currQtIndex)) {
        this.examAnswer.get(this.currQtIndex).answer = _answer;
      } else {
        this.examAnswer.set(this.currQtIndex, {
          answer: _answer,
          qtType: this.currQuestion.qtType
        });
      }
      //保存到本地
      localStorage.setItem(this.examAnswerKey, JSON.stringify(this.examAnswer));
    },
    //下一题
    nextQuestionFun() {
      this.currQtIndex++;
      this.getExamQuestion(this.currQtIndex);
    },
    //上一题
    previousFun() {
      if (this.currQtIndex == 0) {
        return false;
      }
      this.currQtIndex--;
      this.getExamQuestion(this.currQtIndex);
    },
    // 点击答题卡
    selectIndex(index) {
      this.currQtIndex = index;
      this.getExamQuestion(this.currQtIndex);
    },
    exemModalFun() {
      this.exemModal = true;
    },
    //计算剩余时间
    countDown() {
      this._interval = setInterval(() => {
        //时间递减1秒
        this.countDownTime = moment(this.countDownTime).subtract(1, "seconds");
        //倒计时结束
        if (moment(this.countDownTime).format("HHmmss") == "000000") {
          //清除定时器
          clearInterval(this._interval);
          //提交试卷
          this.postExamCommit();
        }
      }, 1000);
    },
    // 点击交卷
    postExamCommit() {
      let subTime = moment().diff(this.examDuration.startTime, "minute"); //考试时间
      let _answerList = new Array(this.examInfo.questionNum).fill(0); //初始化保存答案的数组
      //遍历答案map
      for (let item of this.examAnswer.entries()) {
        let key = item[0];
        let value = item[1];
        if (value.qtType == TEST_TYPE.RADIO) {
          _answerList[key] = value.answer;
        } else if (value.qtType == TEST_TYPE.MULTI) {
          _answerList[key] = eval(value.answer.join("+"));
        }
      }
      let _data = {
        answerList: _answerList,
        examTime: subTime,
        examId: this.examId,
        mcId: this.mcId
      };
      ApiPostExamCommit(_data).then(res => {
        if (res.code == "success") {
          this.exemModal = false;
          this.exemTotal = res.data;
          this.instance();
          localStorage.removeItem(this.examTimeKey);
          localStorage.removeItem(this.examAnswerKey);
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    // 显示成绩
    instance() {
      let content = `<p>本次的考试合格率为 ${this.exemTotal} %</p>`;
      this.$Modal.success({
        title: "评估报告",
        content: content,
        onOk: () => {
          this.$router.push({ name: "home" });
        }
      });
    }
  },
  filters: {
    questionType(value) {
      if (value == TEST_TYPE.RADIO) {
        return "单选";
      } else if (value == TEST_TYPE.MULTI) {
        return "多选";
      }
    },
    countDownForamt(value) {
      if (moment.isMoment(value)) {
        return moment(value).format("HH时mm分ss秒");
      } else {
        return "--时--分--秒";
      }
    }
  },
  mounted() {
    this.init();
  },
  //组件销毁时清除定时器
  destroyed() {
    clearInterval(this._interval);
  }
};
</script>

<style lang="scss">
@import "../common/css/mixin.scss";
.examination-div {
  font-size: 14px;
  @include typeArea();
  padding: 20px;
  .examination-top {
    padding: 15px;
    background: #fff;
    border-radius: 5px;
    h2 {
      margin-bottom: 10px;
    }
    .operating {
      display: flex;
      justify-content: space-between;
      .left {
        display: flex;
        justify-content: flex-start;
        .time {
          padding: 0 10px;
        }
      }
    }
  }
  .question-content {
    margin-top: 20px;
    background: #fff;
    border-radius: 5px;
    padding: 15px;
    font-size: 14px;
    .title {
      font-size: 16px;
    }
    .question-item {
      margin: 15px;
      .ivu-checkbox-group-item,
      .ivu-radio-group-item {
        width: 100%;
        font-size: 14px;
        border-radius: 2px;
        padding: 12px 20px 13px;
        background: #fff;
        cursor: pointer;
      }
      .ivu-radio-group-item:hover,
      .ivu-checkbox-group-item:hover {
        background: #f3f3f3;
        text-decoration: none;
      }
      .selected {
        border-color: #2d8cf0;
        background: #fff;
      }
      .selected:hover {
        border-color: #2d8cf0;
        background: #fff;
      }
    }
    .save-p {
      padding: 10px;
      background: #f5f7f8;
      position: relative;
      .ivu-btn-default {
        position: absolute;
        right: 10px;
        top: 5px;
        color: #57a3f3;
        background-color: #fff;
        border-color: #57a3f3;
      }
    }
    .ivu-radio-group {
      width: 100%;
    }
  }
  .examination-right {
    padding: 15px;
    background: #fff;
    border-radius: 5px;
    .items {
      width: 40px;
      height: 40px;
      display: inline-block;
      line-height: 40px;
      border-radius: 5px;
      text-align: center;
      cursor: pointer;
      margin: 5px;
    }
    .items:hover {
      background: #f5f7f8;
    }
    .answer {
      background: #2d8cf0 !important;
      color: #fff;
    }
    h2 {
      margin-bottom: 15px;
    }
    ul {
      li {
        float: left;
      }
    }
    .active {
      background: #f5f7f8;
    }
  }
}
</style>


