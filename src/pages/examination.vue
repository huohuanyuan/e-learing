<template>
  <div class="examination-wrap">
    <div class="examination-div">
      <Row :gutter="16">
        <Col span="16">

        <div class="examination-top">
          <h2> {{courseName}} </h2>
          <div class="operating">
            <div class="left">
              <span> 共 {{ examination.questionNum}} 题 </span>
              <span class="time">
                <count-down :endTime="endTime" :callback="endCallback"  endText="考试时间结束"  v-if="endTime != 0" @childTimeFun="childValueTime"></count-down>
            
              </span>
              <div>
                <Button type="primary" @click="previousFun" :disabled="number==1" size="small">
                  <Icon type="ios-arrow-back"></Icon>
                  上一题
                </Button>
                <Button type="primary" @click="nextQuestionFun" :disabled="number == examination.questionNum" size="small">
                  下一题
                  <Icon type="ios-arrow-forward"></Icon>
                </Button>
              </div>
            </div>
            <Button type="primary" @click="exemMoadlFun"> 交卷 </Button>
          </div>
        </div>
        <div class="examination-bottom">
          <div>
            <p class="title"> 【 {{ title }} 】{{number}}. {{examination.questionVo.qtDetail}} </p>
            <ul v-if="radioShow">
              <RadioGroup v-model="animal">
                <!-- :class="{ selected:index == current}" -->
                <li v-for=" (item , index ) in examination.questionVo.questionItems" :key="index" @click="clickFun(item,index)">
                  <Radio :label="item.value" :checked.native="item.isAnswer"> </Radio>{{ item.qiDetail }}
                </li>
              </RadioGroup>
            </ul>
            <ul v-else>
              <CheckboxGroup v-model="multichoice" @on-change="checkboxClickFun">
                <Checkbox :label="item.value" :class="{ selected:item.isAnswer}" v-for=" (item , index ) in examination.questionVo.questionItems" :key="index">
                  <span> {{item.value}}</span>
                  <span>{{item.qiDetail}}</span>
                </Checkbox>
              </CheckboxGroup>
            </ul>

            <div class="save-p">
              <!--  单选  -->
              <RadioGroup v-model="animal" v-if="radioShow">
                <span v-for="(item, index) in  examination.questionVo.questionItems" :key="index" @click="clickFun(item,index)">
                  <Radio :label="item.value" v-model="item.isAnswer"> </Radio>
                </span>
              </RadioGroup>
              <!-- 多选 -->
              <CheckboxGroup v-model="multichoice" @on-change="checkboxClickFun" v-else>
                <Checkbox :label="item.value" v-for=" (item , index ) in examination.questionVo.questionItems" :key="index">
                  <span> {{item.value}}</span>
                </Checkbox>
              </CheckboxGroup>

              <Button v-show="number != examination.questionNum" @click="saveFun"> 确定</Button>
            </div>
          </div>
          <div>
          </div>
        </div>

        </Col>
        <Col span="8">
        <div class="examination-right">
          <h2> 答题卡 </h2>
          <div>
            <div class="items" v-for="(item , index ) in questionList" :key="index" :class="{ active: index === number-1, answer:item.answer }" @click="selectIndex(item)">
              {{ item.value }}
            </div>
          </div>
          <Row :gutter="16">
            <Col span="3">
            <div @click="selectIndex(item)"> </div>
            </Col>
          </Row>
        </div>
        </Col>
        </Col>
      </Row>
      <!--  点击确认提交 -->
      <Modal v-model="exemMoadl" width="360">
        <p slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle"></Icon>
          <span> 提交确认！</span>
        </p>
        <div style="text-align:center">
          <p> 对于本次测评，确定是否交卷？</p>
        </div>
        <div slot="footer">
          <Button type="primary" size="large" long @click="postExamCommit"> 确认 </Button>
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
import countDown from "./../components/count-down";

export default {
  components: {
    countDown
  },
  data() {
    return {
      contentTime: "", // 保存倒计时时间
      totalTime: "", // 总时间
      endTime: 0, // 倒计时结束时间
      exemTotal: "",
      exemMoadl: false,
      current: -1, // 记录当前的单选index
      title: "", // 显示单选还是多选
      charList: [], // 保存选项
      animal: "", // 单选答案
      multichoice: [], // 多选答案
      qtId: "", // 保存当前题目id
      radioShow: Boolean,
      number: 1, // 显示当前第几道题
      questionList: [], // 总题数数组
      charCodeList: [], // 保存26个大写字母
      examination: {
        questionNum: "",
        examTime: "",
        questionVo: {
          qtType: "",
          questionItems: []
        }
      },
      submitList: [], // 给后台提交的数据
      correctList: new Map() // 保存正确的数据
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
    }
  },
  methods: {
    // 获取开始考试信息
    getExamTextStart() {
      // 判断是否已经考过试
      if (!localStorage.getItem("examId")) {
        localStorage.setItem("examId", this.examId);
      } else if (localStorage.getItem("examId") != this.examId) {
        //判断上次考试和这次考试是否一样
        localStorage.setItem("examId", this.examId);
        localStorage.removeItem("correctList");
        localStorage.removeItem("questionList");
        localStorage.removeItem("submitList");
        localStorage.removeItem("endTime");
      }
      ApiGetExamTextStart(this.examId, { mcId: this.mcId }).then(res => {
        if (res.code == "success") {
          this.totalTime = res.data.examTime;
          // 保存已经考过试的正确答案
          if (localStorage.getItem("correctList")) {
            let letCorList = JSON.parse(localStorage.getItem("correctList"));
            for (let i = 0; i < letCorList.length; i++) {
              this.correctList.set(letCorList[i][0], letCorList[i][1]);
            }
          }
          // 保存已经考过试的 list 显示侧边 class
          if (localStorage.getItem("questionList")) {
            this.questionList = JSON.parse(
              localStorage.getItem("questionList")
            );
          } else {
            for (let i = 1; i <= res.data.questionNum; i++) {
              this.questionList.push({
                answer: false,
                value: i
              });
              this.submitList.push(0);
            }
          }
          // 保存给后台提交的 数组
          if (localStorage.getItem("submitList")) {
            this.submitList = JSON.parse(localStorage.getItem("submitList"));
          }
          if (localStorage.getItem("endTime")) {
            this.endTime = Number(localStorage.getItem("endTime"));
          } else {
            //  倒计时
            let nowTime = new Date();
            this.startTime = nowTime.getTime();
            this.endTime = this.startTime + res.data.examTime * 60000;
          }
          // this.countdowm(this.endTime);
          if (res.data.questionVo.qtType == 0) {
            this.radioShow = true;
            this.title = "单选";
          } else {
            this.radioShow = false;
            this.title = "多选";
          }

          this.examination = res.data;
          this.charCode();
          this.forMapList(res.data.questionVo.qtId);

          let itemList = res.data.questionVo.questionItems;
          this.qtId = res.data.questionVo.qtId;
          // 给当前的试题 添加属性
          for (let i = 0; i < itemList.length; i++) {
            itemList[i].value = this.charList[i];
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

    // 活动倒计时结束之后的回调方法
    endCallback() {
      this.postExamCommit();
    },
    // 获取26个字母
    charCode() {
      for (var i = 0; i < 25; i++) {
        this.charCodeList.push(String.fromCharCode(65 + i));
      }
      this.charList = this.charCodeList.splice(
        0,
        this.examination.questionVo.questionItems.length
      );
    },
    // 获取考试指定题目
    getExamQuestion(index) {
      this.charList = [];
      this.charCodeList = [];
      this.multichoice = [];
      this.animal = "";
      this.current = -1;
      ApiGetExamQuestion(this.examId, index).then(res => {
        if (res.code == "success") {
          if (res.data.qtType == 0) {
            this.radioShow = true;
            this.title = "单选";
          } else {
            this.radioShow = false;
            this.title = "多选";
          }
          this.examination.questionVo = res.data;
          this.charCode();
          this.forMapList(res.data.qtId);

          let itemList = res.data.questionItems;
          for (let i = 0; i < itemList.length; i++) {
            itemList[i].value = this.charList[i];
          }
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    // 点击确定
    saveFun() {
      if (this.number == this.examination.questionNum) {
        return false;
      } else {
        if (this.radioShow) {
          if (this.animal == "") {
            return false;
          } else {
            // 保存本次的正确答案
            let letList = this.examination.questionVo.questionItems;
            let answerCode;
            for (let i = 0; i < letList.length; i++) {
              if (letList[i].value == this.animal) {
                this.correctList.set(letList[i].qtId, letList[i]);
                answerCode = letList[i].answerCode;
              }
            }
            this.number++;
            let index = this.number - 1;
            let num = this.number - 2;
            this.submitList[num] = answerCode;
            this.getExamQuestion(index);
          }
        } else {
          if (this.multichoice.length == 0) {
            return false;
          } else {
            // 保存本次的正确答案
            let letList = this.examination.questionVo.questionItems;
            this.correctList.set(letList[0].qtId, this.multichoice);
            let answerCode = 0;

            for (var i = 0; i < letList.length; i++) {
              for (var k = 0; k < this.multichoice.length; k++) {
                if (letList[i].value == this.multichoice[k]) {
                  answerCode += letList[i].answerCode;
                }
              }
            }

            this.number++;
            let num = this.number - 2;
            this.submitList[num] = answerCode;
            let index = this.number - 1;
            this.getExamQuestion(index);
          }
        }
      }
    },
    // 点击下一题
    nextQuestionFun() {
      if (this.number == this.examination.questionNum) {
        return false;
      } else {
        if (this.radioShow) {
          // 保存本次数据
          this.number++;
          let index = this.number - 1;
          if (this.animal == "") {
            this.getExamQuestion(index);
          } else {
            let letList = this.examination.questionVo.questionItems;
            let answerCode;
            for (let i = 0; i < letList.length; i++) {
              if (letList[i].value == this.animal) {
                this.correctList.set(letList[i].qtId, letList[i]);
                answerCode = letList[i].answerCode;
              }
            }
            let num = this.number - 2;
            this.submitList[num] = answerCode;
            this.getExamQuestion(index);
          }
        } else {
          if (this.multichoice.length == 0) {
            this.number++;
            let index = this.number - 1;
            this.getExamQuestion(index);
          } else {
            // 保存本次的正确答案
            let letList = this.examination.questionVo.questionItems;
            this.correctList.set(letList[0].qtId, this.multichoice);
            let answerCode = 0;

            for (var i = 0; i < letList.length; i++) {
              for (var k = 0; k < this.multichoice.length; k++) {
                if (letList[i].value == this.multichoice[k]) {
                  answerCode += letList[i].answerCode;
                }
              }
            }
            this.number++;
            let num = this.number - 2;
            this.submitList[num] = answerCode;
            let index = this.number - 1;
            this.getExamQuestion(index);
          }
        }
      }
    },
    // 点击上一题
    previousFun() {
      if (this.number == 1) {
        return false;
      } else {
        if (this.radioShow) {
          this.number--;
          let index = this.number - 1;
          if (this.animal == "") {
            this.getExamQuestion(index);
          } else {
            let letList = this.examination.questionVo.questionItems;
            let answerCode;

            for (let i = 0; i < letList.length; i++) {
              if (letList[i].value == this.animal) {
                this.correctList.set(letList[i].qtId, letList[i]);
                answerCode = letList[i].answerCode;
              }
            }
            let num = this.number - 2;
            this.submitList[num] = answerCode;
            this.getExamQuestion(index);
          }
          // 保存本次的正确答案
        } else {
          if (this.multichoice.length == 0) {
            this.number--;
            let index = this.number - 1;
            this.getExamQuestion(index);
          } else {
            // 保存本次的正确答案
            let letList = this.examination.questionVo.questionItems;
            this.correctList.set(letList[0].qtId, this.multichoice);
            let answerCode = 0;

            for (var i = 0; i < letList.length; i++) {
              for (var k = 0; k < this.multichoice.length; k++) {
                if (letList[i].value == this.multichoice[k]) {
                  answerCode += letList[i].answerCode;
                }
              }
            }
            this.number--;
            let num = this.number - 2;
            this.submitList[num] = answerCode;

            let index = this.number - 1;
            this.getExamQuestion(index);
          }
        }
      }
    },
    // 遍历 map 对象，看本道题是否已经回答
    forMapList(_key) {
      if (this.correctList) {
        if (this.correctList.has(_key)) {
          if (this.radioShow) {
            this.animal = this.correctList.get(_key).value;
          } else {
            this.multichoice = this.correctList.get(_key);
          }
        }
      }
    },
    // 获取子组件传过来的时间
    childValueTime(val) {
      this.contentTime = val;
    },
    // 点击选择题号
    selectIndex(data) {
      if (this.radioShow) {
        // 保存本次的正确答案
        if (this.animal != "") {
          let answerCode = 0;
          let letList = this.examination.questionVo.questionItems;
          for (let i = 0; i < letList.length; i++) {
            if (letList[i].value == this.animal) {
              this.correctList.set(letList[i].qtId, letList[i]);
              answerCode = letList[i].answerCode;
            }
          }
          this.submitList[this.number - 1] = answerCode;
        }
      } else {
        // 保存本次的正确答案
        if (this.multichoice.length == 0) {
        } else {
          let letList = this.examination.questionVo.questionItems;
          this.correctList.set(letList[0].qtId, this.multichoice);
          let answerCode = 0;
          for (var i = 0; i < letList.length; i++) {
            for (var k = 0; k < this.multichoice.length; k++) {
              if (letList[i].value == this.multichoice[k]) {
                answerCode += letList[i].answerCode;
              }
            }
          }
          this.submitList[this.number - 1] = answerCode;
        }
      }
      this.number = data.value;
      this.getExamQuestion(data.value - 1);
    },
    // 点击选择正确答案
    clickFun(data, index) {
      this.animal = data.value;
      // this.current = index;
      data.isAnswer = true;
      this.questionList[this.number - 1].answer = true;
    },
    //
    exemMoadlFun() {
      this.exemMoadl = true;
    },
    // 点击交卷
    postExamCommit() {
      this.bascFun();
      let subTime = Math.ceil(this.totalTime - this.contentTime / 60000);
      let _data = {
        answerList: this.submitList,
        examTime: subTime,
        examId: this.examId,
        mcId: this.mcId
      };
      ApiPostExamCommit(_data).then(res => {
        if (res.code == "success") {
          this.exemMoadl = false;
          this.exemTotal = res.data;
          this.instance();
          localStorage.removeItem("examId");
          localStorage.removeItem("correctList");
          localStorage.removeItem("questionList");
          localStorage.removeItem("submitList");
          localStorage.removeItem("endTime");
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
    },
    // 多选选中正确答案
    checkboxClickFun(arr) {
      if (arr.length > 0) {
        this.questionList[this.number - 1].answer = true;
      } else {
        this.questionList[this.number - 1].answer = false;
      }
    },
    // 提交前和刷新前的公共方法
    bascFun() {
      if (this.radioShow) {
        let answerCode = 0;
        let letList = this.examination.questionVo.questionItems;
        for (let i = 0; i < letList.length; i++) {
          if (letList[i].value == this.animal) {
            this.correctList.set(letList[i].qtId, letList[i]);
            answerCode = letList[i].answerCode;
          }
        }
        this.submitList[this.number - 1] = answerCode;
      } else {
        let letList = this.examination.questionVo.questionItems;
        this.correctList.set(letList[0].qtId, this.multichoice);
        let answerCode = 0;
        for (var i = 0; i < letList.length; i++) {
          for (var k = 0; k < this.multichoice.length; k++) {
            if (letList[i].value == this.multichoice[k]) {
              answerCode += letList[i].answerCode;
            }
          }
        }
        this.submitList[this.number - 1] = answerCode;
      }
    }
  },
  mounted() {
    this.getExamTextStart();
    window.addEventListener("beforeunload", e => {
      this.bascFun();
      localStorage.setItem(
        "correctList",
        JSON.stringify([...this.correctList])
      );
      localStorage.setItem("questionList", JSON.stringify(this.questionList));
      localStorage.setItem("submitList", JSON.stringify(this.submitList));
      localStorage.setItem("endTime", this.endTime);
    });
  }
  // 禁止用户在还未保存修改前突然离开。
  // beforeRouteLeave(to, from, next) {
  //   const answer = window.confirm(
  //     "Do you really want to leave? you have unsaved changes!"
  //   );
  //   if (answer) {
  //     next();
  //   } else {
  //     next(false);
  //   }
  // },
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
  .examination-bottom {
    margin-top: 20px;
    background: #fff;
    border-radius: 5px;
    padding: 15px;
    font-size: 14px;
    .title {
      font-size: 16px;
    }
    ul {
      margin: 15px;
      li,
      .ivu-checkbox-group-item {
        width: 100%;
        font-size: 14px;
        border-radius: 2px;
        padding: 12px 20px 13px;
        background: #fff;
        cursor: pointer;
      }
      li:hover,
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


