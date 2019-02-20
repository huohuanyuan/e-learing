/*
 * @Author: chengshanshan 
 * @Date: 2018-09-29 15:20:47 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-12-12 13:57:01
 * @instraction: 阿里视频上传
 */

<template>
  <elms-upload-view @onChange="onChange" :videoList="videoList" :isDisabled="isDisabled" @upload="upload">
    <div slot="fileQueue">
      <ul class="grid" v-for="(item,index) of videoList" :key="item.file.key">
        <li class="name">{{item.file.name}} </li>
        <li class="size">{{item.file.size | formatFileSize}}</li>
        <li class="status">
          <i-progress :percent="progressPercent[item.file.key]" :status="item.state == 'Failure'?'wrong':'normal'"/>
        </li>
        <li class="operate">
          <span v-show="item.state == 'Ready' || item.state =='Failure' ">
            <Icon type="md-remove-circle" size="20" @click.stop="remove(index)" />
          </span>
        </li>
      </ul>
    </div>
  </elms-upload-view>
</template>
<script>
import md5 from "js-md5";
import ElmsUploadView from "components/units/elms-upload-view";
import { VIDEO_RESOURCE_TYPE, MIN_LEARN_TIME } from "common/js/constant.js";
import { ApiPostVideoResoures } from "@/api/set-course-api.js";
import { resCode } from "@/api/code";
export default {
  components: {
    ElmsUploadView
  },
  props: {
    minItems: {
      type: Number,
      default: 1
    },
    maxItems: {
      type: Number,
      default: 30
    },
    partSize: {
      //分片大小默认1M，不能小于100K
      type: Number,
      default: 1048576
    },
    parallel: {
      //并行上传分片个数，默认5
      type: Number,
      default: 5
    },
    retryCount: {
      //网络原因失败时，重新上传次数，默认为3
      type: Number,
      default: 3
    },
    retryDuration: {
      //网络原因失败时，重新上传间隔时间，默认为2秒
      type: Number,
      default: 2
    },
    courseId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      isDisabled: false, //开始上传按钮是否禁用
      videoUploader: null,
      files: "",
      videoList: [], //文件队列
      resourceMap: new Map(), //资源数据保存
      progressPercent: {}, //保存上传进度
      succVideoList: [] //上传成功的viedoList
    };
  },
  methods: {
    onChange(files) {
      let userData = {
        Vod: { UserData: { IsShowWaterMark: "true", Priority: "7" } }
      };
      let reg = /^video/;
      for (var i = 0; i < files.length; i++) {
        //过滤掉非video文件
        if (reg.test(files[i].type)) {
          //设置数据key值
          files[i].key = md5(files[i].name + files[i].size + this.courseId);
          // 添加视频文件到视频上传队列
          this.videoUploader.addFile(
            files[i],
            null,
            null,
            null,
            JSON.stringify(userData)
          );
        }
      }
      //获取上传列表
      this.videoList = this.videoUploader.listFiles();
      // console.log(this.videoList);
    },
    renderPlupload() {
      //文件上传的几种状态：Ready Success Uploading Failure
      this.$nextTick(() => {
        let _this = this;
        // 初始化视频上传工具
        _this.videoUploader = new AliyunUpload.Vod({
          partSize: _this.partSize,
          parallel: _this.parallel,
          retryCount: _this.retryCount,
          retryDuration: _this.retryDuration,
          // 开始上传
          onUploadstarted: function(uploadInfo) {
            //上传方式1, 需要根据uploadInfo.videoId是否有值，调用点播的不同接口获取uploadauth和uploadAddress，如果videoId有值，调用刷新视频上传凭证接口，否则调用创建视频上传凭证接口
            _this.videoUploader.setUploadAuthAndAddress(
              uploadInfo,
              _this.resourceMap.get(uploadInfo.file.key).uploadAuth,
              _this.resourceMap.get(uploadInfo.file.key).uploadAddress
            );

            _this.isDisabled = true;
            //上传方式2
            // videoUploader.setSTSToken(uploadInfo, accessKeyId, accessKeySecret,secretToken);
          },
          // 文件上传成功
          onUploadSucceed: function(uploadInfo) {       
            //从列表中删除已经上传成功的文件
            let _index = "";
            for (let [index, elem] of _this.videoList.entries()) {
              if (elem.file.key == uploadInfo.file.key) {
                _index = index;
                break;
              }
            }

            _this.videoUploader.deleteFile(_index);
            //保存成功状态 上传成功后将文件从保存到succVideoList
            _this.succVideoList.push({
              courseId: _this.courseId,
              key: _this.resourceMap.get(uploadInfo.file.key).key,
              resourceId: _this.resourceMap.get(uploadInfo.file.key).resourceId,
              resourceName: _this.resourceMap.get(uploadInfo.file.key)
                .resourceName,
              resourceOid: _this.resourceMap.get(uploadInfo.file.key)
                .resourceOid,
              resourceType: _this.resourceMap.get(uploadInfo.file.key)
                .resourceType,
              sort: _this.resourceMap.get(uploadInfo.file.key).sort,
              learnTime: MIN_LEARN_TIME
            });
          },
          // 文件上传失败
          onUploadFailed: function(uploadInfo, code, message) {     
            // console.log(
            //   "onUploadFailed: file:" +
            //     uploadInfo.file.name +
            //     ",code:" +
            //     code +
            //     ", message:" +
            //     message
            // );
          },
          // 文件上传进度，单位：字节
          onUploadProgress: function(uploadInfo, totalSize, loadedPercent) {
            // console.log(_this.videoList);
            // console.log(uploadInfo);
            _this.$set(
              _this.progressPercent,
              uploadInfo.file.key,
              Math.ceil(loadedPercent * 100)
            );
          },
          // 上传凭证超时
          onUploadTokenExpired: function(uploadInfo) {
            // console.log("onUploadTokenExpired");
            //上传方式1  实现时，根据uploadInfo.videoId调用刷新视频上传凭证接口重新获取UploadAuth
            // uploader.resumeUploadWithAuth(uploadAuth);
            // 上传方式2 实现时，从新获取STS临时账号用于恢复上传
            // uploader.resumeUploadWithSTSToken(accessKeyId, accessKeySecret, secretToken, expireTime);
            _this.isDisabled = false;
          },
          //全部文件上传结束
          onUploadEnd: function(uploadInfo) {
            //将成功的文件list返回到父组件
            _this.$emit("getSuccVideoList", _this.succVideoList);
            _this.isDisabled = false;
          }
        });
      });
    },
    upload(event) {  
      let _params = [];
      for (let [index, item] of this.videoList.entries()) {
        let _obj = {};
        _obj.courseId = this.courseId;
        _obj.resourceType = VIDEO_RESOURCE_TYPE;
        _obj.resourceName = item.file.name;
        _obj.key = item.file.key;
        _params.push(_obj);
      }
      //获取资源凭证
      if (_params.length > 0) {
        ApiPostVideoResoures(_params).then(res => {
          if (res.code == "success") {
            for (let [index, item] of res.data.entries()) {
              this.resourceMap.set(item.key, item);
            }
            //开始上传
            this.videoUploader.startUpload();
          } else {
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        });
      }
    },
    //将文件从上传队列中移除
    remove(index) {
      this.videoUploader.deleteFile(index);
    },
    //从上传成功的数组中删除（父级调用）
    removeSuccVideoList(resourceOid) {
      this.succVideoList = this.succVideoList.filter((currentValue, i, arr) => {
        return resourceOid != currentValue.resourceOid;
      });
      this.$emit("getSuccVideoList", this.succVideoList);
    }
  },
  filters: {
    formatFileSize(bytes) {
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (bytes === 0) return "n/a";
      let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      if (i === 0) return bytes + " " + sizes[i];
      return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.renderPlupload();
    });
  }
};
</script>
<style lang="scss" scoped>
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
      width: 70%;
    }
    .size {
      width: 10%;
    }
    .status {
      width: 15%;
    }
    .operate {
      width: 5%;
    }
  }
}
</style>

