/*
 * @Author: chengshanshan 
 * @Date: 2018-10-11 10:52:11 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-22 16:18:11
 * @instraction:双击修改名称组件
 */
<template>
  <span class="change-wrap">
    <span v-if="!editing" @dblclick="edit">{{file.resourceName}}</span>
    <Input type="text" ref="input" size="small" v-else v-model.trim="name" autofocus @on-blur="save" @on-keydown.enter="editClose"></Input>
  </span>
</template>
<script>
export default {
  data() {
    return {
      name: this.file.resourceName,
      editing: false
    };
  },
  props: {
    file: {
      type: Object,
      default() {
        return {};
      }
    },
    index: {
      type: Number,
      default: 0
    }
  },
  methods: {
    edit() {
      this.editing = true;
      this.$nextTick(function() {
        this.$refs.input.focus();
      });
    },
    editClose() {
      this.editing = false;
    },
    save() {
      this.editing = false;
      this.$emit("on-change", this.name, this.file.resourceId, this.index);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../../common/css/mixin.scss";
.change-wrap {
  padding: 0 5px;
  max-width: 800px;
  @include fontOverflow();
}
</style>