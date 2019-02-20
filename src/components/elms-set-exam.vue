/*
 * @Author: chengshanshan 
 * @Date: 2018-10-23 11:21:20 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-22 13:59:00
 * @instraction:课程设置试题组件
 */

<template>
  <div class="exam-cell">
    <Row :gutter="48">
      <Col span="12">
      <div class="exam-bank">
        <label style="padding-right:10px;"> 题库选择</label>
        <Select :disabled="!examData.isNew" size="small" filterable label-in-value @on-change="onChange" v-model="examData.qbId">
          <Option v-for="(examBank,index) in examBankList" :value="examBank.qbId" :key="index" :disabled="examBank.isDisabled">{{examBank.qbName}}</Option>
        </Select>       
      </div>
      </Col>
      <Col span="8"> 
      <label style="padding-right:10px;">题目数量</label>
      <InputNumber :min="1" :max="max" size="small" v-model="examData.questionNum"></InputNumber>
      <span v-show="max>0">/{{max}}</span>
      </Col>
      <Col span="4" >
      <span class="elms-icon" v-show="showDelete" @click="deleteRow">
        <Icon type="ios-remove-circle" size="20" />
      </span>
      <span class="elms-icon" v-show="showAdd" @click="addRow">
        <Icon type="ios-add-circle" size="20" />
      </span>

      </Col>
    </Row>
  </div>
</template>
<script>
export default {
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number
    },
    listLength: {
      type: Number,
      default: 1
    },
    examData: {
      type: Object,
      default() {
        return {
          qbName: "",
          qbId: null,
          isNew: true,
          questionNum: 1,
          questionSum: 0
        };
      }
    },
    examBankList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  computed: {
    max() {
      return this.examData.questionSum ? this.examData.questionSum : 0;
    },
    showDelete() {
      return this.index != 0 || this.listLength != 1;
    },
    showAdd() {
      return this.index == this.listLength - 1;
    }
  },
  methods: {
    onChange(v) {
      //题库选择
      this.$emit("examBankChange", v, this.index);
    },
    deleteRow() {
      //删除行
      this.$emit("deleteRow", this.examData, this.index);
    },
    addRow() {
      //添加行
      this.$emit("addRow", this.examData, this.index);
    }
  }
};
</script>
<style lang="scss" scoped>
.exam-cell {
  margin: 15px 0;
}
.exam-bank {
  display: flex;
  label {
    flex-shrink: 0;
  }
}
.elms-icon {
  display: inline-block;
  cursor: pointer;
  padding: 0 2px;
}
</style>


