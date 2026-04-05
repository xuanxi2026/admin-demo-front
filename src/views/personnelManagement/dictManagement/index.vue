<template>
  <div class="dictManagement-container">
    <vab-page-header description="系统字典管理，沉淀跨项目复用的状态、枚举和值域配置" :icon="['fas', 'book']" title="字典管理" />
    <vab-query-form>
      <vab-query-form-left-panel :span="12">
        <el-button icon="el-icon-plus" type="primary" @click="handleEdit()">添加</el-button>
        <el-button icon="el-icon-delete" type="danger" @click="handleDelete()">批量删除</el-button>
      </vab-query-form-left-panel>
      <vab-query-form-right-panel :span="12">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item><el-input v-model.trim="queryForm.dictType" clearable placeholder="字典类型" /></el-form-item>
          <el-form-item><el-input v-model.trim="queryForm.keyword" clearable placeholder="标签/值/类型" /></el-form-item>
          <el-form-item><el-button icon="el-icon-search" type="primary" @click="queryData">查询</el-button></el-form-item>
        </el-form>
      </vab-query-form-right-panel>
    </vab-query-form>
    <el-table v-loading="listLoading" :data="list" :element-loading-text="elementLoadingText" @selection-change="setSelectRows">
      <el-table-column type="selection" />
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="字典类型" prop="dictType" min-width="140" />
      <el-table-column label="标签" prop="label" min-width="120" />
      <el-table-column label="值" prop="value" min-width="120" />
      <el-table-column label="状态" prop="status" width="100" />
      <el-table-column label="排序" prop="sort" width="90" />
      <el-table-column label="备注" prop="remark" min-width="180" />
      <el-table-column label="修改时间" prop="datatime" min-width="160" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background :current-page="queryForm.pageNo" :layout="layout" :page-size="queryForm.pageSize" :total="total" @current-change="handleCurrentChange" @size-change="handleSizeChange" />
    <edit ref="edit" @fetch-data="fetchData" />
  </div>
</template>

<script>
  import { doDelete, getList } from '@/api/dictManagement'
  import Edit from './components/DictManagementEdit'
  import VabPageHeader from '@/components/VabPageHeader'

  export default {
    name: 'DictManagement',
    components: { Edit, VabPageHeader },
    data() {
      return {
        list: [],
        listLoading: true,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0,
        selectRows: [],
        elementLoadingText: '正在加载...',
        queryForm: { pageNo: 1, pageSize: 10, dictType: '', keyword: '' },
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
      setSelectRows(val) {
        this.selectRows = val
      },
      handleEdit(row) {
        this.$refs.edit.showEdit(row)
      },
      handleDelete(row) {
        const ids = row && row.id ? row.id : this.selectRows.map((item) => item.id).join(',')
        if (!ids) return this.$baseMessage('未选中任何行', 'error')
        this.$baseConfirm('你确定要删除选中项吗', null, async () => {
          const { msg } = await doDelete({ ids })
          this.$baseMessage(msg, 'success')
          this.fetchData()
        })
      },
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
          this.$baseMessage('字典列表加载失败，请检查后端接口是否已启动', 'error')
        } finally {
          this.timeOutID = setTimeout(() => {
            this.listLoading = false
          }, 300)
        }
      },
    },
  }
</script>
