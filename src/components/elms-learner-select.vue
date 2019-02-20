<template>
  <div>
    <div class="tree-content">
      <div class="tree-wrap">
        <h5>部门</h5>
        <div class="content">
          <div class="spin-container" v-if="treeLoading">
            <Spin size="large" fix></Spin>
          </div>
          <div class="tree-content" v-else>
            <Tree ref="tree" :data="treeData" show-checkbox @on-check-change="checkedNodes" @on-select-change="selectNodes"></Tree>
          </div>
        </div>
      </div>
      <div class="list-wrap">
        <h5>
          <span>成员</span>
        </h5>
        <div class="content">
          <div class="spin-container" v-if="menberLoading">
            <Spin size="large" fix></Spin>
          </div>

          <div v-else>
            <label v-for="(item,index) of currentMembers" :key="item.userId" class="cell">
              <span class="checkbox-box" :class="{checked:item.checked}">
                <span class="checkbox-inner"></span>
                <input type="checkbox" value="item.userId" :checked="item.checked" @click="clickCheckbox(item,index)">
              </span>
              <span>{{item.username}}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="member">
        <h5>已选择</h5>
        <div class="content">
          <div class="spin-container" v-if="treeLoading">
            <Spin size="large" fix></Spin>
          </div>
          <div v-else>
            <Tag v-for="(item,index) of this.selectedUserList" :key="item.userId" :name="item.userId" color="primary" closable @on-close="memberClose">{{item.username}}</Tag>
            <Tag v-for="(item,index) of this.treeCheckedNodes" :key="item.deptId" :name="item.deptId" color="success">{{item.deptName}}</Tag>

          </div>

        </div>
      </div>
    </div>
    <elms-split></elms-split>
    <Row>
      <Col span="8" offset="8">
      <Button type="primary" long @click="learnerSave">保存</Button>
      </Col>
    </Row>
  </div>

</template>
<script>
import { ApiGetMembers } from "@/api/set-course-api.js";
import ElmsSplit from "components/units/elms-split";
export default {
  components: {
    ElmsSplit
  },
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
    courseId: {
      type: Number,
      default: -1
    },
    defaultSelectedMem: {
      type: Array,
      default: () => []
    },
    treeLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentMembers: [],
      treeCheckedNodes: [],
      selectedUserList: [],
      menberLoading: false
    };
  },

  methods: {
    checkedNodes() {
      this.treeCheckedNodes = this.$refs.tree.getCheckedNodes();
    },
    clickCheckbox(value, index) {
      if (value.hasOwnProperty("checked")) {
        this.currentMembers[index].checked = !value.checked;
      } else {
        this.currentMembers[index].checked = true;
      }
      if (this.currentMembers[index].checked) {
        this.selectedUserList.push(this.currentMembers[index]);
      } else {
        this.selectedUserList = this.selectedUserList.filter(
          (curVal, i, arr) => {
            return curVal.userId != this.currentMembers[index].userId;
          }
        );
      }
    },
    //点击部门请求部门下员工
    selectNodes() {
      let selectNodes = this.$refs.tree.getSelectedNodes();
      this.menberLoading = true;
      ApiGetMembers(selectNodes[0].deptId)
        .then(res => {
          if (res.code == "success") {
            this.currentMembers = res.data;
            this.menberLoading = false;
            let _selectedIds = this.selectedUserList.map((value, index) => {
              return value.userId;
            });
            for (let [index, item] of this.currentMembers.entries()) {
              if (_selectedIds.includes(item.userId)) {
                this.currentMembers[index].checked = true;
              }
            }
          } else {
            this.currentMembers = [];
          }
        })
        .catch(error => {
          this.currentMembers = [];
        });
    },
    //成员标签删除
    memberClose(event, name) {
      this.selectedUserList = this.selectedUserList.filter((curVal, i, arr) => {
        return curVal.userId != name;
      });
      for (let [index, item] of this.currentMembers.entries()) {
        if (item.userId == name) {
          this.currentMembers[index].checked = false;
        }
      }
    },

    learnerSave() {
      //指定学习成员保存
      if (
        this.treeCheckedNodes.length > 0 ||
        this.selectedUserList.length > 0
      ) {
        //整理数据 type：0：用户 1：部门
        let _users = this.selectedUserList.map((value, index) => {
          return {
            courseId: this.courseId,
            objectId: value.userId,
            objectType: 0
          };
        });
        let _depts = this.treeCheckedNodes.map((value, index) => {
          return {
            courseId: this.courseId,
            objectId: value.deptId,
            objectType: 1
          };
        });
        //提交
        this.$emit("learnerSave", [..._users, ..._depts]);
      }
    }
  }, 
  watch: {
    treeData: function(val, oldVal) {
      this.$nextTick(function() {
          this.treeCheckedNodes = this.$refs.tree.getCheckedNodes();
   
        });
    },
    defaultSelectedMem: function(val, oldVal) {
      this.selectedUserList = this.defaultSelectedMem;
    }
  }
};
</script>

<style lang="scss" scoped>
.tree-content {
  display: flex;
  .content {
    height: 400px;
    overflow: auto;
    padding: 10px;
    .spin-container {
      position: relative;
      height: 370px;
    }
  }
  h5 {
    line-height: 30px;
    padding: 0 10px;
    border-bottom: 1px solid #e4e4e8;
  }
  .tree-wrap {
    width: 30%;
    border: 1px solid #e4e4e8;
  }
  .list-wrap {
    width: 25%;
    border: 1px solid #e4e4e8;
    margin-left: -1px;
    .cell {
      display: inline-block;
      padding: 2px 5px;
    }
  }
  .member {
    width: 50%;
    border: 1px solid #e4e4e8;
    margin-left: -1px;
  }
  //checkbox 样式
  .checkbox-box {
    display: inline-block;
    vertical-align: middle;
    white-space: nowrap;
    cursor: pointer;
    line-height: 1;
    position: relative;
    &.checked {
      .checkbox-inner {
        border-color: #2d8cf0;
        background-color: #2d8cf0;
        &:after {
          content: "";
          display: table;
          width: 4px;
          height: 8px;
          position: absolute;
          top: 1px;
          left: 4px;
          border: 2px solid #fff;
          border-top: 0;
          border-left: 0;
          -webkit-transform: rotate(45deg) scale(1);
          transform: rotate(45deg) scale(1);
          transition: all 0.2s ease-in-out;
        }
      }
    }
    .checkbox-inner {
      display: inline-block;
      width: 14px;
      height: 14px;
      position: relative;
      top: 0;
      left: 0;
      border: 1px solid #dcdee2;
      border-radius: 2px;
      background-color: #fff;
      transition: border-color 0.2s ease-in-out,
        background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

      &:after {
        content: "";
        display: table;
        width: 4px;
        height: 8px;
        position: absolute;
        top: 1px;
        left: 4px;
        border: 2px solid #fff;
        border-top: 0;
        border-left: 0;
        -webkit-transform: rotate(45deg) scale(0);
        transform: rotate(45deg) scale(0);
        transition: all 0.2s ease-in-out;
      }
    }

    input {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      cursor: pointer;
      opacity: 0;
    }
  }
}
</style>


