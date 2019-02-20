
 <template>
  <div class="per-record-outer">
    <div class="per-record">
      <h2>个人学习记录</h2>
      <elms-split></elms-split>
      <Table :columns="userColumns" :data="reportList" ref="table"></Table>
      <elms-split></elms-split>
      <div class="pages" >
        <Page :total="pageTotal" size="small" show-total show-sizer @on-change="pageChange" @on-page-size-change="pageSizeChange"/>
      </div>
    </div>
  </div>
</template>
<script>
import ElmsSplit from "components/units/elms-split";
import ElmsScoreTable from "components/units/elms-score-table";
import { ApiGetperRecord } from "@/api/per-record-api.js";
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
      reportList: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10
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
          title: "课程",
          key: "courseName"
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
                  if (params.row.examRecordList.length > 0) {
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
    },

    getReportList() {
      ApiGetperRecord(this.pageParams).then(res => {
        if (res.code == "success") {
          this.reportList = res.data;
          this.pageTotal = res.total;
        } else {
          if (resCode[res.code]) {
            this.$Message.error(resCode[res.code]);
          }
        }
      });
    },
    pageChange(pageNum) {
      this.pageParams.pageNum = pageNum;
      this.getReportList();
    },
    pageSizeChange(pageSize){
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = pageSize;
      this.getReportList();
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="scss" scoped>
@import "../common/css/mixin.scss";
.per-record-outer {
  min-height: 100%;
  background: url("/static/bg_img/user_center_bg.png") 0 0 no-repeat;
  background-size: cover;
  background-attachment: fixed;
  padding-top: 20px;
}
.per-record {
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

