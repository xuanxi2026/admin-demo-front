<template>
  <div class="personalCenter-container">
    <vab-page-header description="维护当前登录用户的个人信息、安全设置和双重认证状态" :icon="['fas', 'user-circle']" title="个人中心" />

    <el-row :gutter="20">
      <el-col :lg="16" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover">
          <div slot="header"><span>基本资料</span></div>
          <el-form ref="profileForm" :model="form" :rules="rules" label-width="96px">
            <el-form-item label="用户名">
              <el-input v-model="form.username" disabled />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model.trim="form.nickname" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model.trim="form.phone" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model.trim="form.email" />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model.trim="form.bio" :rows="4" type="textarea" />
            </el-form-item>
            <el-form-item label="头像">
              <el-upload :action="uploadAction" :headers="uploadHeaders" :show-file-list="false" :before-upload="beforeImageUpload" :on-success="handleAvatarSuccess">
                <img v-if="form.avatar" :src="form.avatar" class="avatar-preview" alt="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button :loading="savingProfile" type="primary" @click="handleSubmit">保存资料</el-button>
              <el-button @click="fetchProfile">重载</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :lg="8" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover">
          <div slot="header"><span>账户概览</span></div>
          <div class="summary-item"><div class="summary-label">当前用户</div><div class="summary-value">{{ form.username || '-' }}</div></div>
          <div class="summary-item"><div class="summary-label">昵称</div><div class="summary-value">{{ form.nickname || '-' }}</div></div>
          <div class="summary-item"><div class="summary-label">邮箱</div><div class="summary-value">{{ form.email || '-' }}</div></div>
          <div class="summary-item"><div class="summary-label">双重认证</div><div class="summary-value">{{ form.googleBound ? '已绑定' : '未绑定' }}</div></div>
          <div class="summary-item"><div class="summary-label">角色</div><div class="summary-value">{{ roleText }}</div></div>
          <div class="summary-item"><div class="summary-label">权限数量</div><div class="summary-value">{{ form.permissionCodes.length }}</div></div>
          <div class="summary-item"><div class="summary-label">创建时间</div><div class="summary-value">{{ formatDateTime(form.createdAt) }}</div></div>
          <div class="summary-item"><div class="summary-label">更新时间</div><div class="summary-value">{{ formatDateTime(form.updatedAt) }}</div></div>
        </el-card>

        <el-card class="google-card" shadow="hover">
          <div slot="header"><span>Google 双重认证</span></div>
          <p class="tips">当前状态：{{ form.googleBound ? '已绑定' : '未绑定' }}</p>
          <el-button type="primary" @click="handleGoogleSetup">生成绑定二维码</el-button>
          <el-image v-if="google.qrCodeBase64" class="qr-img" fit="contain" :src="google.qrCodeBase64" />
          <div v-if="google.secret" class="tips">密钥：{{ google.secret }}</div>
          <el-input v-model.trim="google.code" maxlength="6" placeholder="输入谷歌验证码" style="margin-top: 10px" />
          <el-row :gutter="10" style="margin-top: 10px">
            <el-col :span="12">
              <el-button type="success" style="width: 100%" @click="handleGoogleBind">确认绑定</el-button>
            </el-col>
            <el-col :span="12">
              <el-button type="danger" style="width: 100%" @click="handleGoogleUnbind">解除绑定</el-button>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="google-card" shadow="hover">
          <div slot="header"><span>密码安全</span></div>
          <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="90px">
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input v-model.trim="passwordForm.currentPassword" show-password type="password" />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model.trim="passwordForm.newPassword" show-password type="password" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model.trim="passwordForm.confirmPassword" show-password type="password" />
            </el-form-item>
            <el-form-item>
              <el-button :loading="changingPassword" type="primary" @click="submitPasswordChange">修改密码</el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { bindGoogleAuth, changePassword, getProfile, setupGoogleAuth, unbindGoogleAuth, updateProfile } from '@/api/user'
  import { publicUploadEndpoint, uploadHeaders as buildUploadHeaders } from '@/api/systemSettings'
  import VabPageHeader from '@/components/VabPageHeader'

  export default {
    name: 'PersonalCenter',
    components: { VabPageHeader },
    data() {
      return {
        savingProfile: false,
        changingPassword: false,
        form: {
          username: '',
          nickname: '',
          phone: '',
          email: '',
          avatar: '',
          bio: '',
          googleBound: false,
          roles: [],
          permissionCodes: [],
          createdAt: '',
          updatedAt: '',
        },
        google: {
          qrCodeBase64: '',
          secret: '',
          code: '',
        },
        passwordForm: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
        rules: {
          nickname: [{ required: true, trigger: 'blur', message: '请输入昵称' }],
          email: [{ type: 'email', trigger: 'blur', message: '请输入正确邮箱' }],
        },
        passwordRules: {
          currentPassword: [{ required: true, trigger: 'blur', message: '请输入当前密码' }],
          newPassword: [{ required: true, trigger: 'blur', message: '请输入新密码' }, { min: 6, trigger: 'blur', message: '新密码至少 6 位' }],
          confirmPassword: [
            { required: true, trigger: 'blur', message: '请再次输入新密码' },
            {
              validator: (rule, value, callback) => {
                if (value !== this.passwordForm.newPassword) callback(new Error('两次输入的新密码不一致'))
                else callback()
              },
              trigger: 'blur',
            },
          ],
        },
      }
    },
    computed: {
      uploadAction() {
        return publicUploadEndpoint()
      },
      uploadHeaders() {
        return buildUploadHeaders()
      },
      roleText() {
        return this.form.roles && this.form.roles.length ? this.form.roles.join(' / ') : '-'
      },
    },
    created() {
      this.fetchProfile()
    },
    methods: {
      async fetchProfile() {
        const { data } = await getProfile()
        this.form = Object.assign({}, this.form, data || {})
      },
      formatDateTime(value) {
        if (!value) return '-'
        return new Date(value).toLocaleString('zh-CN', { hour12: false })
      },
      beforeImageUpload(file) {
        const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isImage) this.$baseMessage('仅支持 JPG/PNG/WebP 图片', 'error')
        if (!isLt2M) this.$baseMessage('图片大小不能超过 2MB', 'error')
        return isImage && isLt2M
      },
      handleAvatarSuccess(response) {
        if (response.code === 200 && response.data && response.data.downloadUrl) {
          this.form.avatar = response.data.downloadUrl
          this.$baseMessage('头像上传成功', 'success')
        } else {
          this.$baseMessage(response.msg || '头像上传失败', 'error')
        }
      },
      handleSubmit() {
        this.$refs.profileForm.validate(async (valid) => {
          if (!valid) return false
          this.savingProfile = true
          try {
            const { msg } = await updateProfile({
              nickname: this.form.nickname,
              phone: this.form.phone,
              email: this.form.email,
              avatar: this.form.avatar,
              bio: this.form.bio,
            })
            this.$baseMessage(msg || '更新成功', 'success')
            await this.fetchProfile()
          } finally {
            this.savingProfile = false
          }
        })
      },
      async handleGoogleSetup() {
        const { data } = await setupGoogleAuth()
        this.google.qrCodeBase64 = data.qrCodeBase64
        this.google.secret = data.secret
      },
      async handleGoogleBind() {
        if (!this.google.code) return this.$baseMessage('请先输入验证码', 'error')
        const { msg } = await bindGoogleAuth({ code: this.google.code })
        this.$baseMessage(msg, 'success')
        this.google.code = ''
        this.google.qrCodeBase64 = ''
        this.google.secret = ''
        this.fetchProfile()
      },
      async handleGoogleUnbind() {
        if (!this.google.code) return this.$baseMessage('请输入当前验证码以解绑', 'error')
        const { msg } = await unbindGoogleAuth({ code: this.google.code })
        this.$baseMessage(msg, 'success')
        this.google.code = ''
        this.fetchProfile()
      },
      resetPasswordForm() {
        this.passwordForm = this.$options.data().passwordForm
        this.$refs.passwordForm && this.$refs.passwordForm.clearValidate()
      },
      submitPasswordChange() {
        this.$refs.passwordForm.validate(async (valid) => {
          if (!valid) return false
          this.changingPassword = true
          try {
            const { msg } = await changePassword({
              currentPassword: this.passwordForm.currentPassword,
              newPassword: this.passwordForm.newPassword,
            })
            this.$baseMessage(msg || '密码修改成功', 'success')
            this.resetPasswordForm()
          } finally {
            this.changingPassword = false
          }
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  .avatar-preview {
    width: 96px;
    height: 96px;
    object-fit: cover;
    border-radius: 12px;
  }

  .avatar-uploader-icon {
    width: 96px;
    height: 96px;
    line-height: 96px;
    text-align: center;
    border: 1px dashed #dcdfe6;
    border-radius: 12px;
  }

  .summary-item {
    margin-bottom: 16px;
  }

  .summary-label {
    font-size: 12px;
    color: #909399;
  }

  .summary-value {
    margin-top: 4px;
    font-size: 15px;
    color: #303133;
  }

  .google-card {
    margin-top: 20px;
  }

  .tips {
    color: #909399;
    font-size: 12px;
    margin: 8px 0;
    word-break: break-all;
  }

  .qr-img {
    width: 200px;
    height: 200px;
    margin-top: 12px;
  }
</style>
