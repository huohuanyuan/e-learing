/*
 * @Author: chengshanshan 
 * @Date: 2018-09-29 15:20:47 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-22 13:53:13
 * @instraction: 上传文件视图层样式（pdf 和 视频公用）
 */

<template>
  <div>
    <div class="upload-box">
      <ul class="top grid">
        <li class="name">文件名</li>
        <li class="size">大小</li>
        <li class="status">状态</li>
        <li class="operate">&nbsp;&nbsp;&nbsp;</li>
      </ul>
      <div v-if="!itemsAdded" class="dropArea" @ondragover.prevent="onChange" :class="dragging ? 'dropAreaDragging' : ''" @dragenter="dragging=true" @dragend="dragging=false" @dragleave="dragging=false">
        <input type="file" required multiple @change="onChange">        
        <div class="upload-icon" >
          <Icon type="ios-cloud-upload" size="44" />
          <p>点击或者拖拽文件上传</p>
        </div>       
      </div>
       <div v-else class="list">
          <!-- 文件list插槽 -->
          <slot name="fileQueue"></slot>        
        </div>
      <div class="bottom">
        <slot name="addBtn">
          <Button size="small" class="add" type="primary" icon="md-add">
            添加文件
            <input type="file" required multiple @change="onChange">
          </Button>
        </slot>
        <Button @click="upload" size="small" type="success" icon="md-cloud-upload" :disabled="isDisabled">开始上传</Button>

      </div>
    </div>
  </div>
</template>
<script>
import md5 from "js-md5";
export default {
  props: {
    fileList: {
      type: Array,
      default() {
        return [];
      }
    },
    videoList: {
      type: Array,
      default() {
        return [];
      }
    },
    isDisabled:{//开始上传按钮是否禁用
      type:Boolean,
      default:false,
    }
  },
  data() {
    return {
      itemsAdded: false,
      dragging: false,
      fileQueue: []
    };
  },
  methods: {
    onChange(e) {
      let files = e.target.files || e.dataTransfer.files;   
      this.$emit("onChange", files);
    },
    upload(event) {
      this.$emit("upload");
    }
  },
  watch: {
    fileList: {
      handler: function(val, oldVal) {    
        this.itemsAdded = val.length > 0 ? true : false;      
      },
      deep: true
    },
    videoList: {
      handler: function(val, oldVal) {    
        this.itemsAdded = val.length > 0 ? true : false;        
      },
      deep: true
    }
  },


};
</script>
<style lang="scss" scoped>
@import "../../common/css/mixin.scss";
.upload-box {
  position: relative;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  .top {
    border-bottom: 1px solid #ddd;
  }
  .bottom {
    border-top: 1px solid #ddd;
    padding: 5px;
    .add {
      position: relative;
      &:hover {
        cursor: pointer;
      }
      input {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        &:hover {
          cursor: pointer;
        }
      }
    }
  }
  /* Drag and drop */
  .dropArea {
    position: relative;
    width: 100%;
    height: 150px;
    .upload-icon {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    input {
      position: absolute;
      cursor: pointer;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;     
    }
  }
  /* End drag and drop */
  .list {
    height: 150px;
    overflow: auto;
    z-index:10;
    .ivu-icon {
      &:hover {
        cursor: pointer;
      }
    }
  }
  .grid {
    display: flex;
    justify-content: space-between;
    li {
      padding: 5px;
    }
    .name {
      width: 50%;
      @include fontOverflow()

    }
    .size {
      width: 15%;
    }
    .status {
      width: 25%;
    }
    .operate {
      width: 10%;
    }
  }
}
</style>

