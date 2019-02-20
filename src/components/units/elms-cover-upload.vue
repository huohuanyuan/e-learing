/*
 * @Author: chengshanshan 
 * @Date: 2018-10-23 16:24:07 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-29 14:51:29
 * @instraction:课程封面上传
 */
 <template>
  <div>
    <div class="upload-wrap">
      <div class="view" :style="bgImg">
      </div>
      <div v-show="!isDisabled">
        <Upload :action="UPLOAD_URL" :format="['jpg','jpeg','png']" :show-upload-list="false" :max-size="2048" :data="otherParams" :on-success="handleSuccess">
          <Button> 上传本地图片</Button>
        </Upload>
        <elms-split></elms-split>
        <Button @click="selectCover">选择推荐封面</Button>
      </div>
    </div>
    <Modal v-model="coverModel" title="推荐封面" width="800">
      <Row>
        <Col span="4" v-for="(item,index) in coverList" :key="index">
        <div class="img-cell" @click="selectOne(item.id,index)" :class="{active:item.id == selectCoverId}">
          <img :src="item.url" alt="">
        </div>
        </Col>
      </Row>
      <p slot="footer">
        <Button size="small" type="primary" @click="selectCoverSave" :disabled="isSelected">确定</Button>
        <Button size="small" @click="cancel">取消</Button>
      </p>
    </Modal>

  </div>
</template>
<script>
import { STATIC_STORAGE_URL, DEFAULT_COVER_URL } from "common/js/constant.js";
import { courseCoverList, ossImageUrl } from "common/js/util.js";
import { ApiPostCourseCover } from "@/api/set-course-api.js";
import { resCode } from "@/api/code";
import ElmsSplit from "components/units/elms-split";

export default {
  components: {
    ElmsSplit
  },
  props: {
    courseId: {
      type: Number,
      default: -1
    },
    coverId: {
      type: [Number, String],
      default: -1
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      UPLOAD_URL: STATIC_STORAGE_URL,
      coverList: [],
      coverModel: false,
      selectCoverId: -1,
      isActive: false,
      isSelected: true,
      imgSrc: DEFAULT_COVER_URL
    };
  },
  computed: {
    bgImg() {
      return `background-image:url('${this.imgSrc}')`;
    },
    otherParams() {
      return { key: `m-elms/${this.courseId}.jpg` };
    }
  },
  methods: {
    //上传成功的回调
    handleSuccess() {
      ApiPostCourseCover({
        courseId: this.courseId,
        coverId: this.courseId//上传图片封面coverid就是courseid
      })
        .then(res => {
          if (res.code == "success") {
            //标识课程封面已上传
            this.$emit("coverUploaded", true);  
            this.imgSrc = ossImageUrl(this.courseId)+"?t=" + Math.random();
          } else {
            this.imgSrc = DEFAULT_COVER_URL;
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        })
        .catch(error => {
          this.imgSrc = DEFAULT_COVER_URL;
        });
    },
    selectCover() {
      //打开选择推荐封面model 请请求数据
      this.coverModel = true;
      this.coverList = courseCoverList();
    },
    //选中一个推荐封面
    selectOne(id, index) {
      this.selectCoverId = id;
      this.coverList[index].isActive = true;
      this.isSelected = false;
      this.imgSrc = ossImageUrl(id);
    },
    //推荐封面选择保存
    selectCoverSave() {
      ApiPostCourseCover({
        courseId: this.courseId,
        coverId: this.selectCoverId
      })
        .then(res => {
          if (res.code == "success") {
            //标识课程封面已选择
            this.$emit("coverUploaded", true);
            this.coverModel = false;
            this.imgSrc = ossImageUrl(this.selectCoverId);
          } else {
            this.imgSrc = DEFAULT_COVER_URL;
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        })
        .catch(error => {
          this.imgSrc = ossImageUrl(this.selectCoverId);
        });
    },
    cancel() {
      //取消选择
      if (this.coverId == -1) {
        this.imgSrc = DEFAULT_COVER_URL;
      } else {
        this.imgSrc = ossImageUrl(this.coverId);
      }
      this.coverModel = false;
    }
  },
  watch: {
    coverId: function(val, oldVal) {
      if (val == -1 || !val) {
        this.imgSrc = DEFAULT_COVER_URL;
      } else {
        this.imgSrc = ossImageUrl(this.coverId);
      }
    }
  }
};
</script>

 <style lang="scss" scoped>
.upload-wrap {
  display: flex;
  align-items: center;
  padding: 10px;
  .view {
    width: 215px;
    height: 120px;
    margin-right: 20px;
    border: 1px solid #ddd;
    background-size: 100% 100%;
    border-radius: 10px;
    background-position: 0 0;
    background-repeat: no-repeat;
  }
}
.img-cell {
  height: 80px;
  border-radius: 8px;
  margin: 5px;
  overflow: hidden;
  border: 3px solid transparent;
  transition: all 0.5s linear;
  &:hover {
    border: 3px solid #3399ff;
  }
  &.active {
    border: 3px solid #3399ff;
  }
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
 

