<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="560px" @close="close">
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="配置键" prop="configKey"><el-input v-model.trim="form.configKey" /></el-form-item>
      <el-form-item label="名称" prop="name"><el-input v-model.trim="form.name" /></el-form-item>
      <el-form-item label="分组" prop="group"><el-input v-model.trim="form.group" /></el-form-item>
      <el-form-item label="值类型" prop="valueType">
        <el-select v-model="form.valueType" style="width: 100%">
          <el-option label="string" value="string" />
          <el-option label="number" value="number" />
          <el-option label="boolean" value="boolean" />
        </el-select>
      </el-form-item>
      <el-form-item label="配置值" prop="configValue"><el-input v-model.trim="form.configValue" /></el-form-item>
      <el-form-item label="备注" prop="remark"><el-input v-model.trim="form.remark" :rows="3" type="textarea" /></el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/configManagement'

  export default {
    name: 'ConfigManagementEdit',
    data() {
      return {
        form: { id: '', configKey: '', configValue: '', name: '', group: '', valueType: 'string', remark: '' },
        rules: {
          configKey: [{ required: true, trigger: 'blur', message: '请输入配置键' }],
          name: [{ required: true, trigger: 'blur', message: '请输入配置名称' }],
          group: [{ required: true, trigger: 'blur', message: '请输入配置分组' }],
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
