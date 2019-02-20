/*
 * @Author: chengshanshan 
 * @Date: 2018-11-19 16:18:57 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-23 11:12:29
 * @instrction：公司层面设置信息
 */

<template>
  <div class="system-manage">
    <Form ref="manageForm" :model="manageForm" :label-width="150">
      <FormItem prop="signature" label="是否签名">
        <RadioGroup v-model="manageForm.signature">
          <Radio :label="1">是</Radio>
          <Radio :label="0">否</Radio>

        </RadioGroup>
      </FormItem>
      <FormItem prop="courseShow" label="课程展示形式">
        <RadioGroup v-model="manageForm.courseShow">
          <Radio :label="1">卡片</Radio>
          <Radio :label="0">列表</Radio>

        </RadioGroup>
      </FormItem>
      <FormItem prop="courseDiscuss" label="是否开放课程讨论">
        <RadioGroup v-model="manageForm.courseDiscuss">
          <Radio :label="1">是</Radio>
          <Radio :label="0">否</Radio>

        </RadioGroup>
      </FormItem>
      <FormItem prop="emailNotice" label="课程学习邮件提醒">
        <RadioGroup v-model="manageForm.emailNotice">
          <Radio :label="1">开通</Radio>
          <Radio :label="0">关闭</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem prop="noticeDay" label="邮件提醒天数" v-if="manageForm.emailNotice == 1">
        <InputNumber :min="1" v-model="manageForm.noticeDay" :formatter="value => `${value}天`" :parser="value => value.replace('天', '')"></InputNumber>
        <p class="tip">(在培训期内，给临近{{manageForm.noticeDay}}天还未进行学习（培训）的员工，发邮件通知，并抄送他/她的上级)</p>
      </FormItem>
      <FormItem v-show="isShow">
        <Button type="primary" v-if="isNew" @click="newConfig('manageForm')">保存</Button>
        <Button type="info" v-else @click="modifyConfig('manageForm')">保存</Button>
      </FormItem>
    </Form>
  </div>
</template>
<script>
import {
  ApiGetSysConfig,
  ApiPutSysConfig,
  ApiPostSysConfig
} from "@/api/system-manage-api.js";
import { resCode } from "@/api/code";
export default {
  data() {
    return {
      isShow: false,
      isNew: false, //标记是新建还是修改
      manageForm: {
        signature: 0,
        courseShow: 1,
        courseDiscuss: 1,
        emailNotice: 0,
        noticeDay: 3
      },
      ruleValidate: {
        signature: [
          {
            required: true,
            message: "请选择是否进行电子签名",
            trigger: "change"
          }
        ],
        courseShow: [
          { required: true, message: "请选择课程展示形式", trigger: "change" }
        ],
        courseDiscuss: [
          {
            required: true,
            message: "请选择是否开放课程讨论",
            trigger: "change"
          }
        ],
        emailNotice: [
          {
            required: true,
            message: "请选择是否开通邮件提醒功能",
            trigger: "change"
          }
        ],
        noticeDay: [
          {
            required: true,
            message: "请设置发送邮件的时间",
            trigger: "change"
          }
        ]
      }
    };
  },
  methods: {
    init() {
      this.getSysConfig();
    },
    getSysConfig() {
      ApiGetSysConfig().then(res => {
        if (res.code == "success") {
          this.isShow = true;
          if (!res.data) {
            this.isNew = true;
          } else {
            this.isNew = false;
            this.manageForm.signature = res.data.signature;
            this.manageForm.courseShow = res.data.courseShow;
            this.manageForm.courseDiscuss = res.data.courseDiscuss;
            this.manageForm.emailNotice = res.data.emailNotice;
            this.manageForm.noticeDay = res.data.noticeDay;
          }
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    newConfig(name) {
      ApiPostSysConfig(this.manageForm).then(res => {
        if (res.code == "success") {
          this.$Message.success("设置成功");
          this.getSysConfig();
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    modifyConfig(name) {
      ApiPutSysConfig(this.manageForm).then(res => {
        if (res.code == "success") {
          this.$Message.success("设置成功");
          this.getSysConfig();
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
.system-manage {
  background: #fff;
  @include typeArea();
  padding: 40px;
  .tip {
    color: #ccc;
  }
}
</style>

