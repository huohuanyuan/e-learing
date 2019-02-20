/*
 * @Author: chengshanshan 
 * @Date: 2018-10-23 11:28:39 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-22 13:43:07
 * @instraction:已通过课程
 */
 <template>
  <div>
    <elms-course-list v-for="(item,index) of courseData" :key="index" :viewMode="viewMode" :listData="item" :coverId="item.coverId">
      <template slot="courseName" @click="viewCourse(item.courseId,item.courseType)">
        <span @click="viewCourse(item.courseId,item.courseType)">{{item.courseName}}</span>
      </template>
      <template slot="lineA">学习天数：{{item.availableDay}}天

      </template>
      <template slot="lineB">

      </template>
      <!-- <Button slot="opreate" @click="toLearnerList(item.courseId,item.courseName)">查看学习人员</Button> -->
    </elms-course-list>
    <Page :total="pageTotal" size="small" @on-change="pageChange" v-show="pageTotal>listParams.pageSize">

    </Page>
    <elms-null v-if="isNull">
      <p>非常抱歉，您暂时没有已通过的课程</p>
    </elms-null>
  </div>
</template>
  <script>
import { ApiGetManageCourseList } from "@/api/course-manage-api.js";
import { ApiGetSysConfig } from "@/api/system-manage-api.js";
import { resCode } from "@/api/code";
import { ossImageUrl } from "common/js/util.js";
import { COURSE_STATUS, COURSE_SET_TYPE,VIEW_MODE } from "common/js/constant.js";
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
        status: COURSE_STATUS.PUBLISHED,
        pageNum: 1,
        pageSize: 10
      },
      pageTotal: 0,
      isNull: false,
      viewMode:VIEW_MODE.CARD
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
    viewCourse(courseId, courseType) {
      //查看课程
      this.$router.push({
        name: "courseInfoView",     
        query: { courseId: courseId }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>