/*
 * @Author: liuhaosheng 
 * @Date: 2018-10-28 15:45:22 
 * @Last Modified by: liuhaosheng
 * @Last Modified time: 2018-11-01 17:00:51
 *  倒计时
 */
<template>
     <span :callback="callback">
        <slot> {{content}} </slot>
    </span>
</template>
<script>
export default {
  data() {
    return {
      content: "",
      secTime:""
    };
  },
  props: {
    endTime: {
      type: Number,
      default: ""
    },
    endText: {
      type: String,
      default: "已结束"
    },
    callback: {
      type: Function,
      default: ""
    }
  },
  mounted() {
    this.countdowm(this.endTime);
  },
  methods: {
    countdowm(timestamp) {
      let self = this;
      let timer = setInterval(function() {
        let nowTime = new Date();
        let t = timestamp - nowTime.getTime();
        if (t > 0) {
          let hour = Math.floor((t / 3600000) % 24);
          let min = Math.floor((t / 60000) % 60);
          let sec = Math.floor((t / 1000) % 60);
          hour = hour < 10 ? "0" + hour : hour;
          min = min < 10 ? "0" + min : min;
          sec = sec < 10 ? "0" + sec : sec;
          let format = "";
          if (hour > 0) {
            format = `${hour}小时${min}分${sec}秒`;
          }
          if (hour <= 0) {
            format = `${min}分${sec}秒`;
          }
          self.content = format;
          self.secTime = timestamp - nowTime.getTime();
          self.$emit('childTimeFun',self.secTime);
        } else {
          clearInterval(timer);
          self.content = self.endText;
          self._callback();
        }
      }, 1000);
    },
    _callback() {
      if (this.callback && this.callback instanceof Function) {
        this.callback(...this);
      }
    }
  }
};
</script>