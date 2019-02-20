/*
 * @Author: chengshanshan 
 * @Date: 2018-10-23 11:24:15 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-12-12 16:10:23
 * @instraction: 课程管理list组件
 */
 <template>
  <div :class="['list-cell',{'card':isCardView},{'list':isListView}]" :title="listData.courseName">
    <div class="first">
      <img v-lazy="imgSrc" alt="" v-if="isCardView">
      <div class="content">
        <h4 class="name">
          <slot name="courseName">
            {{listData.courseName}}
          </slot>
        </h4>
        <p class="msg">
          <slot name="lineA">
          </slot>
        </p>
        <p class="msg">
          <slot name="lineB">
          </slot>
        </p>
      </div>
    </div>
    <div class="second">
      <slot name="opreate"></slot>
    </div>
  </div>
</template>
 <script>
import { ossImageUrl } from "common/js/util.js";
import { DEFAULT_COVER_URL, VIEW_MODE } from "common/js/constant.js";
export default {
  props: {
    listData: {
      type: Object,
      default() {
        return {};
      }
    },
    coverId: {
      type: [String, Number],
      default: null
    },
    viewMode: {
      type: Number,
      default: VIEW_MODE.CARD
    }
  },
  computed: {
    imgSrc() {
      if (this.coverId) {
        return ossImageUrl(this.coverId);
      } else {
        return DEFAULT_COVER_URL;
      }
    },
    isCardView() {
      return this.viewMode == VIEW_MODE.CARD;
    },
    isListView() {
      return this.viewMode == VIEW_MODE.LIST;
    }
  },
  methods: {}
};
</script>
 <style lang="scss" scoped>
@import "../common/css/mixin.scss";
.list-cell {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e4e4;
  .btn {
    cursor: pointer;
    &:hover {
      color: #3399ff;
    }
  }
  .second {
    cursor: pointer;
    flex-shrink: 0;
    .status {
      padding: 10px 25px;
      border: 1px solid #d04545;
      color: #d04545;
      border-radius: 5px;
    }
  }
  .first {
    width: 100%;
    display: flex;
    overflow: hidden;
    img {
      height: 100%;
      width: 200px;
      height: 110px;
      border-radius: 10px;
    }
    .content {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px 20px;
      .name {
        font-size: 16px;
        font-weight: bold;
        color: #303030;
        cursor: pointer;
        @include fontOverflow();
        &:hover {
          color: #3399ff;
        }
      }
      .msg {
        color: #818080;
        font-size: 13px;
      }
    }
  }
  //card 视图
  &.card {
    .first {
      height: 140px;
      padding: 15px;
      .name {
        max-width: 700px;
      }
    }

    .second {
      padding: 15px;
    }
  }
  //list 视图
  &.list {
    .first {
      height: 100px;
      padding: 5px;
      .name {
        max-width: 900px;
      }
    }

    .second {
      padding: 5px;
    }
  }
}
</style>
 
 
 
 
