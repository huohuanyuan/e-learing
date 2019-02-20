/*
 * @Author: chengshanshan 
 * @Date: 2018-09-29 15:20:47 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-12-12 14:13:55
 * @instraction: pdf上传
 */

<template>
  <elms-upload-view @onChange="onChange" @upload="upload" :fileList="fileList" :isDisabled="isDisabled">
    <div slot="fileQueue">
      <ul class="grid" v-for="(item,index) of fileList" :key="index">
        <li class="name">{{item.name}} </li>
        <li class="size">{{item.size | formatFileSize}}</li>
        <li class="status">
          <i-progress :percent="item.percent" :status="item.status == FILE_STATUS.FAILED?'wrong':'normal'" />
        </li>
        <li class="operate">
          <span v-show="item.status == FILE_STATUS.QUEUED || item.status == FILE_STATUS.FAILED">
            <Icon type="md-remove-circle" size="20" @click="remove(item)" />
          </span>

        </li>
      </ul>
    </div>
    <span slot="addBtn">
      <Button class="add-btn" size="small" type="primary" icon="md-add">
        添加文件
        <input ref="addBtn" type="file" required multiple>
      </Button>
    </span>
  </elms-upload-view>
</template>
<script>
import md5 from "js-md5";
import ElmsUploadView from "components/units/elms-upload-view";
import { FILE_RESOURCE_TYPE, MIN_LEARN_TIME } from "common/js/constant.js";
import { ApiGetFileResoures, ApiPostResource } from "@/api/set-course-api.js";
import { resCode } from "@/api/code";
let plupload = require("plupload");

export default {
  components: {
    ElmsUploadView
  },
  props: {
    courseId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      fileList: [], //文件队列
      ossParams: {},
      isDisabled: false,
      options: {
        runtimes: "html5,html4",
        url: "https://m-elms.oss-cn-beijing.aliyuncs.com",
        filters: {
          max_file_size: "100mb",
          // chunk_size: 1048576, //分片大小为1mb
          chunk_size: 0,
          max_retries: 3, //实际导致错误事件之前，将在失败的情况下多次重新上载块
          mime_types: [
            {
              title: "pdf files",
              extensions: "pdf"
            }
          ]
        }
      },
      succFileList: [],
      FILE_STATUS: {
        QUEUED: "", //文件加入上传队列
        UPLOADING: "", //上传中
        FAILED: "", //上传失败
        DONE: "" //上传成功
      }
    };
  },

  methods: {
    renderPlupload() {
      let _this = this;
      this.$nextTick(() => {
        var options = {
          ...this.options,
          browse_button: this.$refs.addBtn
        };
        _this.uploader = new plupload.Uploader({
          ...options,
          init: {
            PostInit: function(uploader) {},
            FilesAdded: function(up, files) {
              _this.fileList = up.files;
            },
            //上传前设置oss参数
            BeforeUpload: function(uploader, file) {
              uploader.setOption("multipart_params", {
                key: `${md5(file.name + file.size + _this.courseId)}.pdf`,
                OSSAccessKeyId: _this.ossParams.accessId,
                signature: _this.ossParams.signature,
                "x-oss-security-token": _this.ossParams.token,
                policy: _this.ossParams.policy,
                success_action_status: "200" //让服务端返回200，不设置则默认返回204
              });
              _this.isDisabled = true;
            },
            UploadProgress: function(up, file) {},
            FileUploaded: function(up, file, result) {
              //oss资源上传成功后请求插入数据库
              if (result.status == 200) {
                let _params = {
                  resourceName: file.name,
                  resourceOid: md5(file.name + file.size + _this.courseId),
                  resourceType: FILE_RESOURCE_TYPE,
                  courseId: _this.courseId
                };
                ApiPostResource(_params).then(res => {               
                  if (res.code == "success") {
                    _this.succFileList.push({
                      ...res.data,
                      ...{ learnTime: MIN_LEARN_TIME }
                    });
                    //上传成功 从上传队列中删除
                    _this.uploader.removeFile(file);
                    //将成功的文件list返回到父组件，渲染到成功list
                    _this.$emit("getSuccFileList", _this.succFileList);
                  } else {
                    file.status = _this.FILE_STATUS.FAILED;
                    if (resCode[res.code]) {
                      this.$Message.error(resCode[res.code]);
                    }
                  }
                });
              }
            },
            UploadComplete: function(up, files) {
              _this.isDisabled = false;
            },
            Error: function(up, err) {
              _this.isDisabled = false;
            }
          }
        });

        _this.uploader.init();
      });
    },
    onChange(files) {
      //添加文件到队列
      for (let i = 0; i < files.length; i++) {
        this.uploader.addFile(files[i]);
      }
    },
    upload() {
      //请求oss参数
      ApiGetFileResoures().then(res => {
        if (res.code == "success") {
          this.ossParams = res.data;
          this.uploader.start(); //开始上传
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    remove(file) {
      //将文件从上传队列中移除
      this.uploader.removeFile(file);
    },
    //从上传成功的数组中删除（父级调用）
    removeSuccFileList(resourceOid) {
      this.succFileList = this.succFileList.filter((currentValue, i, arr) => {
        return resourceOid != currentValue.resourceOid;
      });
      this.$emit("getSuccFileList", this.succFileList);
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
      //保存文件状态值
      this.FILE_STATUS.QUEUED = plupload.QUEUED;
      this.FILE_STATUS.UPLOADING = plupload.UPLOADING;
      this.FILE_STATUS.FAILED = plupload.FAILED;
      this.FILE_STATUS.DONE = plupload.DONE;
    });
  }
};
</script>
<style lang="scss" scoped>
.add-btn {
  position: relative;
  input {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
</style>

