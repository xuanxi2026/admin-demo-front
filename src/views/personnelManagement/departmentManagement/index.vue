<template>
  <div class="departmentManagement-container">
    <vab-page-header description="组织与部门管理，沉淀跨项目通用的组织树配置能力" :icon="['fas', 'sitemap']" title="部门管理" />
    <el-row>
      <el-col :lg="4" :md="8" :sm="24" :xl="4" :xs="24">
        <el-tree :data="treeData" :default-expanded-keys="['root']" node-key="id" :props="defaultProps" @node-click="handleNodeClick" />
      </el-col>
      <el-col :lg="20" :md="16" :sm="24" :xl="20" :xs="24">
        <vab-query-form>
          <vab-query-form-top-panel :span="12">
            <el-button icon="el-icon-plus" type="primary" @click="handleEdit()">添加</el-button>
          </vab-query-form-top-panel>
        </vab-query-form>
        <el-table
          v-loading="listLoading"
          border
          :data="list"
          row-key="id"
          default-expand-all
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :element-loading-text="elementLoadingText"
        >
          <el-table-column label="部门名称" prop="name" min-width="180" />
          <el-table-column label="部门编码" prop="code" min-width="160" />
          <el-table-column label="负责人" prop="leader" width="140" />
          <el-table-column label="联系电话" prop="phone" width="150" />
          <el-table-column label="状态" prop="status" width="100" />
          <el-table-column label="排序" prop="sort" width="90" />
          <el-table-column label="备注" prop="remark" min-width="180" />
          <el-table-column label="更新时间" prop="datatime" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="text" @click="handleEdit(row)">编辑</el-button>
              <el-button type="text" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <edit ref="edit" :tree-options="departmentOptions" @fetch-data="reloadAll" />
  </div>
</template>

<script>
  import { doDelete, getList, getTree } from '@/api/departmentManagement'
  import Edit from './components/DepartmentManagementEdit'
  import VabPageHeader from '@/components/VabPageHeader'

  export default {
    name: 'DepartmentManagement',
    components: { Edit, VabPageHeader },
    data() {
      return {
        data: [],
        list: [],
        listLoading: true,
        elementLoadingText: '正在加载...',
        timeOutID: null,
        defaultProps: { children: 'children', label: 'label' },
      }
    },
    computed: {
      treeData() {
        return this.data
      },
      departmentOptions() {
        const result = [{ label: '顶级部门', value: 0 }]
        const walk = (nodes = []) => {
          nodes.forEach((item) => {
            if (item.id !== 'root') result.push({ label: item.label, value: Number(item.id) })
            walk(item.children || [])
          })
        }
        walk(this.data)
        return result
      },
    },
    created() {
      this.reloadAll()
    },
    beforeDestroy() {
      clearTimeout(this.timeOutID)
    },
    methods: {
      async fetchTreeData() {
        try {
          const { data } = await getTree()
          this.data = data || []
        } catch (error) {
          this.$baseMessage('部门树加载失败，请检查后端接口是否已启动', 'error')
        }
      },
      async fetchData() {
        this.listLoading = true
        try {
          const { data } = await getList({ pageNo: 1, pageSize: 100 })
          this.list = data || []
        } catch (error) {
          this.$baseMessage('部门列表加载失败，请检查后端接口是否已启动', 'error')
        } finally {
          this.timeOutID = setTimeout(() => {
            this.listLoading = false
          }, 300)
        }
      },
      async reloadAll() {
        await this.fetchTreeData()
        await this.fetchData()
      },
      handleNodeClick() {
        this.fetchData()
      },
      handleEdit(row) {
        this.$refs.edit.showEdit(row)
      },
      handleDelete(row) {
        this.$baseConfirm('你确定要删除当前项吗', null, async () => {
          const { msg } = await doDelete({ ids: row.id })
          this.$baseMessage(msg, 'success')
          this.reloadAll()
        })
      },
    },
  }
</script>
