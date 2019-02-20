
 <template>
  <div class="user-manage">

    <Row :gutter="24">
      <Col span="6">
      <div class="s-select-wrapper">
        <label>员工</label>
        <AutoComplete clearable v-model="searchParams.userName" :data="userList" placeholder="输入员工姓名查找"></AutoComplete>

      </div>
      </Col>
      <Col span="6">

      <div class="s-select-wrapper">
        <label>部门</label>
        <Select v-model="searchParams.deptId" filterable multiple>
          <Option v-for="item in deptList" :value="item.deptId" :key="item.deptId">{{ item.deptName }}</Option>
        </Select>
      </div>

      </Col>
      <Col span="6">
      <div class="s-select-wrapper">
        <label>课程</label>
        <Select v-model="searchParams.courseId" filterable multiple>
          <Option v-for="item in courseList" :value="item.courseId" :key="item.courseId">{{ item.courseName }}</Option>
        </Select>
      </div>

      </Col>
      <Col span="6">
      <Button type="primary" @click="getReportList">
        查询</Button>
      <Button @click="rest">
        重置</Button>
      <Dropdown @on-click="exportData">
        <Button type="info">
          导出报表
          <Icon type="ios-arrow-down"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem name="PDF">PDF</DropdownItem>
          <DropdownItem name="EXCEL">EXCEL</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      </Col>
    </Row>
    <elms-split></elms-split>
    <elms-split></elms-split>

    <Table :columns="userColumns" :data="reportList" ref="table"></Table>
    <elms-split></elms-split>
    <div class="pages">
      <Page :total="pageTotal" size="small" show-total @on-change="pageChange" />
    </div>
  </div>
</template>
<script>
import ElmsSplit from "components/units/elms-split";
import ElmsScoreTable from "components/units/elms-score-table";
import {
  ApiGetReportList,
  ApiGetDeptList,
  ApiGetCourseList,
  ApiGetUserList,
  ApiGetExcelReport,
  ApiGetPdfReport
} from "@/api/learn-report-api.js";
import { resCode } from "@/api/code";
import { COURSE_LEARN_STATUS } from "common/js/constant.js";
import qs from "qs";
export default {
  components: {
    ElmsSplit,
    ElmsScoreTable
  },
  data() {
    return {
      userList: [],
      deptList: [],
      courseList: [],
      reportList: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10
      },
      searchParams: {
        userName: "",
        deptId: [],
        courseId: []
      },
      pageTotal: 0,
      userColumns: [
        {
          title: "序号",
          width: 60,
          render: (h, params) => {
            return h(
              "div",
              (function(vm) {
                let _code =
                  (vm.pageParams.pageNum - 1) * vm.pageParams.pageSize +
                  params.index +
                  1;
                return _code;
              })(this)
            );
          }
        },
        {
          title: "用户名",
          key: "userName"
        },
        {
          title: "课程",
          key: "courseName"
        },
        {
          title: "部门",
          key: "deptName"
        },
        {
          title: "状态",
          key: "learnStatus",
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.learnStatus == COURSE_LEARN_STATUS.NOT_START
                ? "未开始"
                : params.row.learnStatus == COURSE_LEARN_STATUS.UNDER_WAY
                  ? "进行中"
                  : params.row.learnStatus == COURSE_LEARN_STATUS.FINISHED
                    ? "已学完"
                    : ""
            );
          }
        },
        // {
        //   title: "学习时长",
        //   key: "learnTime"
        // },
        {
          title: "正确率",
          key: "examScore",
          align: "center",
          renderHeader: (h, params) => {
            return (
              "div",
              {},
              [h("p", {}, "正确率"), h("small", "(历史考试最高正确率)")]
            );
          },
          render: (h, params) => {
            return (
              "div",
              {},
              [
                h(
                  "span",
                  {
                    style: {
                      padding: "0 10px"
                    }
                  },
                  (() => {
                    if (params.row.examScore == 0 || params.row.examScore) {
                      return params.row.examScore;
                    } else {
                      return "--";
                    }
                  })()
                ),
                (() => {
                  if (params.row.examRecordList.length > 1) {
                    return h("Poptip", {}, [
                      h(
                        "a",
                        {
                          color: "#2d8cf0",
                          "text-decoration": "underline"
                        },
                        "更多"
                      ),
                      h(
                        "div",
                        {
                          slot: "content"
                        },
                        [
                          h(ElmsScoreTable, {
                            props: {
                              scoreList: params.row.examRecordList
                            }
                          })
                        ]
                      )
                    ]);
                  }
                })()
              ]
            );
          }
        }
      ]
    };
  },

  methods: {
    init() {
      this.getReportList();
      this.getDeptList();
      this.getCourseList();
    },
    getDeptList() {
      ApiGetDeptList().then(res => {
        if (res.code == "success") {
          this.deptList = res.data;
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    getCourseList() {
      ApiGetCourseList().then(res => {
        if (res.code == "success") {
          this.courseList = res.data;
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },

    getReportList() {
      ApiGetReportList({ ...this.pageParams, ...this.searchParams }).then(
        res => {
          if (res.code == "success") {
            this.reportList = res.data;
            this.pageTotal = res.total;
          } else {
            if (resCode[res.code]) {
              this.$Message.error(resCode[res.code]);
            }
          }
        }
      );
    },
    pageChange(pageNum) {
      this.pageParams.pageNum = pageNum;
      this.getReportList();
    },
    rest() {
      //清除筛选条件
      this.searchParams.userName = "";
      this.searchParams.deptId = [];
      this.searchParams.courseId = [];
      this.getReportList();
    },
    //导出报表
    exportData(name) {
      if (name == "EXCEL") {
        ApiGetExcelReport(this.searchParams).then(res => {
          this.download(res, "xlsx");
        });
      } else if (name == "PDF") {
        ApiGetPdfReport(this.searchParams).then(res => {
          this.download(res, "pdf");
        });
      }
    },
    download(data, _type) {
      if (!data) {
        return;
      }
      let url = window.URL.createObjectURL(new Blob([data]));
      let link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", `report.${_type}`);
      document.body.appendChild(link);
      link.click();
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="scss" scoped>
@import "../common/css/mixin.scss";
.user-manage {
  background: #fff;
  @include typeArea();
  padding: 40px;
  .title {
    display: flex;
    justify-content: space-between;
  }
}
.s-select-wrapper {
  display: flex;
  align-items: center;
  label {
    width: 40px;
  }
}
</style>

