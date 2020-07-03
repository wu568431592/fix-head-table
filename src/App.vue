<template>
  <div id="app">
    <div class="table">
    <button @click="$router.push('/home')">1</button>
    <div id="table_box" class="table_box">
      <el-table
        v-for="item in [1, 2]"
        :key="item"
        ref="stickyTable"
        v-sticky="{
          top: 0,
          parent: '#table_box'
        }"
        :data="tableData"
        style="width: 100%"
        border
      >
        <el-table-column prop="date" :label="`日期${item}`" width="180">
        </el-table-column>
        <el-table-column prop="name" :label="`姓名${item}`" width="180">
        </el-table-column>
        <el-table-column prop="address" :label="`地址${item}`">
        </el-table-column>
      </el-table>
    </div>
    <el-table
      v-for="item in [3, 4]"
      :key="item"
      ref="stickyTable"
      v-sticky="{
        top: 0
      }"
      :data="tableData"
      style="width: 100%"
      border
    >
      <el-table-column prop="date" :label="`日期${item}`" width="180">
      </el-table-column>
      <el-table-column prop="name" :label="`姓名${item}`" width="180">
      </el-table-column>
      <el-table-column prop="address" :label="`地址${item}`"> </el-table-column>
    </el-table>
  </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: []
    }
  },
  mounted() {
    this.setTableData()
  },
  methods: {
    setTableData() {
      const result = []
      for (let i = 0; i < 20; i++) {
        result.push({
          date: '2016-05-03',
          name: '王小虎' + i,
          address: '上海市普陀区金沙江路 1516 弄' + i
        })
      }
      setTimeout(() => {
        this.tableData = result
      }, 500)
    }
  }
}
</script>

<style lang="less" scoped>
#app{
  box-sizing: border-box;
}
.table {
  width: 100%;
  border: 1px solid #ddd;
  padding: 10px 20px;
  .table_box {
    border: 1px solid red;
    margin-bottom: 20px;
    height: 200px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .el-table {
    margin-bottom: 50px;
    border: 1px solid transparent;
  }
  /deep/ .el-table__header-wrapper {
    th {
      background: rgba(244, 244, 244, 1);
    }
  }
}
</style>

