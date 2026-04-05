<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="560px" @close="close">
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="上级部门" prop="parentId">
        <el-select v-model="form.parentId" style="width: 100%">
          <el-option v-for="item in treeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门名称" prop="name">
        <el-input v-model.trim="form.name" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model.trim="form.code" />
      </el-form-item>
      <el-form-item label="负责人" prop="leader">
        <el-input v-model.trim="form.leader" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model.trim="form.phone" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" style="width: 100%">
          <el-option label="enabled" value="enabled" />
          <el-option label="disabled" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model.trim="form.remark" :rows="3" type="textarea" />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/departmentManagement'

  export default {
    name: 'DepartmentManagementEdit',
    props: {
      treeOptions: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        form: { id: '', parentId: 0, name: '', code: '', leader: '', phone: '', status: 'enabled', sort: 0, remark: '' },
        rules: {
          name: [{ required: true, trigger: 'blur', message: '请输入部门名称' }],
          code: [{ required: true, trigger: 'blur', message: '请输入部门编码' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    methods: {
      showEdit(row) {
        this.title = row && row.id ? '编辑' : '添加'
        if (row && row.id) {
          this.form = Object.assign({}, this.form, row, { parentId: Number(row.parentId || 0) })
        }
        this.dialogFormVisible = true
      },
      close() {
        this.$refs.form && this.$refs.form.resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
      },
      save() {
        this.$refs.form.validate(async (valid) => {
          if (!valid) return false
          const { msg } = await doEdit(this.form)
          this.$baseMessage(msg, 'success')
          this.$emit('fetch-data')
          this.close()
        })
      },
    },
  }
</script>
