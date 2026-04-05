<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="620px" @close="close">
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="公告标题" prop="title">
        <el-input v-model.trim="form.title" />
      </el-form-item>
      <el-form-item label="公告内容" prop="content">
        <el-input v-model.trim="form.content" :rows="5" type="textarea" />
      </el-form-item>
      <el-form-item label="公告级别" prop="level">
        <el-select v-model="form.level" style="width: 100%">
          <el-option label="普通" value="normal" />
          <el-option label="重要" value="important" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" style="width: 100%">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布人" prop="publisher">
        <el-input v-model.trim="form.publisher" />
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
  import { doEdit } from '@/api/noticeManagement'

  export default {
    name: 'NoticeManagementEdit',
    data() {
      return {
        form: { id: '', title: '', content: '', level: 'normal', status: 'draft', publisher: '', sort: 0, remark: '' },
        rules: {
          title: [{ required: true, trigger: 'blur', message: '请输入公告标题' }],
          content: [{ required: true, trigger: 'blur', message: '请输入公告内容' }],
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
