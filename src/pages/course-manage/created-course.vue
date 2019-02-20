/*
 * @Author: chengshanshan 
 * @Date: 2018-10-23 11:28:39 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-29 14:54:24
 * @instraction:已创建课程
 */
 <template>
  <div>
    <elms-course-list v-for="(item,index) of courseData" :key="index" :viewMode="viewMode" :listData="item" :coverId="item.coverId">
      <template slot="courseName">
        <span @click="viewCourse(item.courseId,item.courseType)">{{item.courseName}}</span>
      </template>
      <template slot="lineA">学习天数：{{item.availableDay}}天</template>
      <template slot="lineB">
        <!-- <span v-show="item.courseStatus == COURSE_STATUS.EDITING" class="btn" style="margin-right:10px" @click="sendToAdmin(item,index)">发送</span> -->
        <span class="btn" style="margin-right:10px" @click="viewCourse(item.courseId,item.courseType)">编辑</span>
        <Poptip confirm title="课程删除后无法恢复，确定要删除吗？" @on-ok="courseRemove(item.courseId)">
          <span class="btn" style="cursor:pointer">删除</span>
        </Poptip>

      </template>
      <div slot="opreate">
        <Button type="primary" ghost size="large" v-show="item.courseStatus == COURSE_STATUS.EDITING" @click="viewCourse(item.courseId,item.courseType)">编辑中</Button>
        <Button type="error" ghost size="large" v-show="item.courseStatus == COURSE_STATUS.REFUSED" @click="viewCourse(item.courseId,item.courseType)">被拒绝</Button>
      </div>
    </elms-course-list>
    <elms-split></elms-split>
    <Page :total="pageTotal" size="small" @on-change="pageChange" v-show="pageTotal>listParams.pageSize">
    </Page>
    <elms-null v-if="isNull">
      <p>非常抱歉，您暂时没有编辑中的课程</p>
    </elms-null>
  </div>
</template>
 <script>
import { ApiGetManageCourseList } from "@/api/course-manage-api.js";
import { ApiPutCourseSubmit, ApiDeleteCourse } from "@/api/set-course-api.js";
import { ApiGetSysConfig } from "@/api/system-manage-api.js";
import { resCode } from "@/api/code";
import { ossImageUrl } from "common/js/util.js";
import {
  COURSE_STATUS,
  COURSE_SET_TYPE,
  VIEW_MODE
} from "common/js/constant.js";
import ElmsCourseList from "components/elms-course-list.vue";
import ElmsSplit from "components/units/elms-split";
import ElmsNull from "components/units/elms-null";
export default {
  components: {
    ElmsCourseList,
    ElmsSplit,
    ElmsNull
  },
  data() {
    return {
      COURSE_STATUS: COURSE_STATUS,
      COURSE_SET_TYPE: COURSE_SET_TYPE,
      courseData: [],
      listParams: {
        status: COURSE_STATUS.EDITING,
        pageNum: 1,
        pageSize: 10
      },
      pageTotal: 0,
      isNull: false,
      viewMode: VIEW_MODE.CARD
    };
  },

  methods: {
    init() {
      ApiGetSysConfig().then(res => {
        if (res.code == "success") {
          if (res.data) {
            this.viewMode = res.data.courseShow;
          }
          this.getList();
        }
      });
    },
    getList() {
      ApiGetManageCourseList(this.listParams).then(res => {
        if (res.code == "success") {
          this.courseData = res.data;
          this.pageTotal = res.total;
          this.isNull = this.courseData.length == 0 ? true : false;
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    pageChange(pageNum) {
      this.listParams.pageNum = pageNum;
      this.getList();
    },
    // sendToAdmin(item, index) {
    //   if (!item.coverId && this.viewMode == VIEW_MODE.CARD) {
    //     this.$Message.warning("没有上传/选择课程封面，无法发送至审核");
    //   } else if (!item.resources || item.resources.length == 0) {
    //     this.$Message.warning("没有上传课程资源，无法发送至审核");
    //   } else {
    //     ApiPutCourseSubmit(item.courseId).then(res => {
    //       if (res.code == "success") {
    //         this.$Message.success("已发送至审核");
    //         if (this.courseData.length == 1) {
    //           this.listParams.pageNum =
    //             this.listParams.pageNum > 1 ? this.listParams.pageNum-- : 1;
    //           this.getList();
    //         } else {
    //           this.getList();
    //         }
    //       } else {
    //         if (resCode[res.code]) {
    //           this.$Message.error(resCode[res.code]);
    //         }
    //       }
    //     });
    //   }
    // },
    viewCourse(courseId, courseType) {
      //查看课程
      this.$router.push({
        name: "courseSet",
        params: { pageType: COURSE_SET_TYPE.MODIFY_PAGE },
        query: { courseId: courseId, courseType: courseType }
      });
    },
    courseRemove(courseId) {
      //课程删除
      ApiDeleteCourse(courseId).then(res => {
        if (res.code == "success") {
          this.$Message.success("课程已删除");

          if (this.courseData.length == 1) {
            this.listParams.pageNum =
              this.listParams.pageNum > 1 ? this.listParams.pageNum-- : 1;
            this.getList();
          } else {
            this.getList();
          }
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
</style>

 
 