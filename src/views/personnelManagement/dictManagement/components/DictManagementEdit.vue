<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="520px" @close="close">
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="字典类型" prop="dictType"><el-input v-model.trim="form.dictType" /></el-form-item>
      <el-form-item label="标签" prop="label"><el-input v-model.trim="form.label" /></el-form-item>
      <el-form-item label="值" prop="value"><el-input v-model.trim="form.value" /></el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" style="width: 100%">
          <el-option label="enabled" value="enabled" />
          <el-option label="disabled" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort"><el-input-number v-model="form.sort" :min="0" style="width: 100%" /></el-form-item>
      <el-form-item label="备注" prop="remark"><el-input v-model.trim="form.remark" :rows="3" type="textarea" /></el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/dictManagement'

  export default {
    name: 'DictManagementEdit',
    data() {
      return {
        form: { id: '', dictType: '', label: '', value: '', status: 'enabled', sort: 0, remark: '' },
        rules: {
          dictType: [{ required: true, trigger: 'blur', message: '请输入字典类型' }],
          label: [{ required: true, trigger: 'blur', message: '请输入标签' }],
          value: [{ required: true, trigger: 'blur', message: '请输入值' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    methods: {
      showEdit(row) {
        this.title = row && row.id ? '编辑' : '添加'
        if (row && row.id) this.form = Object.assign({}, this.form, row)
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
