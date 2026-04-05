<template>
  <div class="operationLog-container">
    <vab-page-header description="操作日志管理，记录后台关键变更动作，便于排查和复盘" :icon="['fas', 'clipboard-list']" title="操作日志" />
    <vab-query-form>
      <vab-query-form-right-panel :span="24">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item><el-input v-model.trim="queryForm.module" clearable placeholder="模块名" /></el-form-item>
          <el-form-item><el-input v-model.trim="queryForm.keyword" clearable placeholder="操作人/目标/详情/动作" /></el-form-item>
          <el-form-item><el-button icon="el-icon-search" type="primary" @click="queryData">查询</el-button></el-form-item>
        </el-form>
      </vab-query-form-right-panel>
    </vab-query-form>
    <el-table v-loading="listLoading" :data="list" :element-loading-text="elementLoadingText">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="模块" prop="module" width="120" />
      <el-table-column label="动作" prop="action" width="150" />
      <el-table-column label="操作人" prop="operator" width="120" />
      <el-table-column label="目标" prop="target" min-width="140" />
      <el-table-column label="请求 ID" prop="requestId" min-width="220" />
      <el-table-column label="IP" prop="ip" width="140" />
      <el-table-column label="详情" prop="detail" min-width="220" />
      <el-table-column label="时间" prop="datatime" width="180" />
    </el-table>
    <el-pagination background :current-page="queryForm.pageNo" :layout="layout" :page-size="queryForm.pageSize" :total="total" @current-change="handleCurrentChange" @size-change="handleSizeChange" />
  </div>
</template>

<script>
  import { getList } from '@/api/operationLog'
  import VabPageHeader from '@/components/VabPageHeader'

  export default {
    name: 'OperationLog',
    components: { VabPageHeader },
    data() {
      return {
        list: [],
        listLoading: true,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0,
        elementLoadingText: '正在加载...',
        queryForm: { pageNo: 1, pageSize: 10, module: '', keyword: '' },
        timeOutID: null,
      }
    },
    created() {
      this.fetchData()
    },
    beforeDestroy() {
      clearTimeout(this.timeOutID)
    },
    methods: {
      handleSizeChange(val) {
        this.queryForm.pageSize = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.queryForm.pageNo = val
        this.fetchData()
      },
      queryData() {
        this.queryForm.pageNo = 1
        this.fetchData()
      },
      async fetchData() {
        this.listLoading = true
        try {
          const { data, totalCount } = await getList(this.queryForm)
          this.list = data || []
          this.total = totalCount || 0
        } catch (error) {
          this.$baseMessage('操作日志加载失败，请检查后端接口是否已启动', 'error')
        } finally {
          this.timeOutID = setTimeout(() => {
            this.listLoading = false
          }, 300)
        }
      },
    },
  }
</script>
