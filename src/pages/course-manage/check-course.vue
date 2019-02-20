/*
 * @Author: chengshanshan 
 * @Date: 2018-10-23 11:28:39 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-27 14:39:07
 * @instraction:待审核课程
 */
  <template>
  <div>
    <elms-course-list v-for="(item,index) of courseData" :key="index" :viewMode="viewMode" :listData="item" :coverId="item.coverId">
      <template slot="courseName">
        <span @click="viewCourse(item.courseId,item.courseType)">{{item.courseName}}</span>
      </template>
      <template slot="lineA">学习天数：{{item.availableDay}}天</template>
      <template slot="opreate">
        <Button type="error" ghost size="large" @click="viewCourse(item.courseId,item.courseType)">
          去审核
        </Button>
      </template>
    </elms-course-list>
    <Page :total="pageTotal" size="small" @on-change="pageChange" v-show="pageTotal>listParams.pageSize">
    </Page>
    <elms-null v-if="isNull">
      <p>非常抱歉，您暂时没有审核中的课程</p>
    </elms-null>
  </div>
</template>
  <script>
import { ApiGetManageCourseList } from "@/api/course-manage-api.js";
import { ApiGetSysConfig } from "@/api/system-manage-api.js";
import { resCode } from "@/api/code";
import {
  COURSE_STATUS,
  COURSE_SET_TYPE,
  VIEW_MODE,
  USER_ROLE
} from "common/js/constant.js";
import { ossImageUrl } from "common/js/util.js";
import ElmsCourseList from "components/elms-course-list.vue";
import ElmsNull from "components/units/elms-null";
export default {
  components: {
    ElmsCourseList,
    ElmsNull
  },
  data() {
    return {
      courseData: [],
      listParams: {
        status: COURSE_STATUS.REVIEW,
        pageNum: 1,
        pageSize: 10
      },
      pageTotal: 0,
      isNull: false,
      viewMode: VIEW_MODE.CARD
    };
  },
  computed:{
      roleCode(){
      return window.$cookies.get("roleCode");
    },
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
    viewCourse(courseId, courseType) {
      // 1.审核界面培训师不可编辑，管理员可以编辑
      if (this.roleCode == USER_ROLE.TRAINER) {
        this.$router.push({
          name: "courseInfoView",
          query: { courseId: courseId }
        });
      } else {
        this.$router.push({
          name: "courseSet",
          params: { pageType: COURSE_SET_TYPE.MODIFY_PAGE },
          query: { courseId: courseId, courseType: courseType }
        });
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>
 