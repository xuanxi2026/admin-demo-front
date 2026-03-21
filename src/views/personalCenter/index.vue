<template>
  <div class="personalCenter-container">
    <vab-page-header description="可更新昵称、手机号、邮箱、简介等个人信息" :icon="['fas', 'user-cog']" title="个人中心" />

    <el-row :gutter="20">
      <el-col :lg="16" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover">
          <div slot="header">
            <span>个人信息替换</span>
          </div>
          <el-form ref="profileForm" :model="form" :rules="rules" label-width="96px">
            <el-form-item label="用户名">
              <el-input v-model="form.username" disabled />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model.trim="form.nickname" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model.trim="form.phone" maxlength="11" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model.trim="form.email" />
            </el-form-item>
            <el-form-item label="头像地址" prop="avatar">
              <el-input v-model.trim="form.avatar" />
            </el-form-item>
            <el-form-item label="个人简介" prop="bio">
              <el-input v-model.trim="form.bio" :rows="4" type="textarea" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">保存资料</el-button>
              <el-button @click="fetchProfile">重置为服务端数据</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="8" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover">
          <div slot="header">
            <span>模板资源预览</span>
          </div>
          <div class="resource-box">
            <img alt="cover" class="cover-img" src="@/assets/mynb.jpg" />
            <el-image class="qr-img" fit="cover" src="https://gcore.jsdelivr.net/gh/zxwk1998/image/avatar/avatar_1.png" />
            <el-button class="img-btn" type="success">模板按钮样式</el-button>
          </div>
        </el-card>
        <el-card class="google-card" shadow="hover">
          <div slot="header">
            <span>Google Authenticator</span>
          </div>
          <p class="tips">当前状态：{{ form.googleBound ? '已绑定' : '未绑定' }}</p>
          <el-button class="img-btn" type="primary" @click="handleGoogleSetup">生成绑定二维码</el-button>
          <el-image v-if="google.qrCodeBase64" class="qr-img" fit="contain" :src="google.qrCodeBase64" />
          <el-input v-model.trim="google.code" maxlength="6" placeholder="输入谷歌验证码" />
          <el-row :gutter="10" style="margin-top: 10px">
            <el-col :span="12">
              <el-button class="img-btn" type="success" @click="handleGoogleBind">确认绑定</el-button>
            </el-col>
            <el-col :span="12">
              <el-button class="img-btn" type="danger" @click="handleGoogleUnbind">解除绑定</el-button>
            </el-col>
          </el-row>
          <div class="tips" v-if="permissions.length">当前权限：{{ permissions.join(', ') }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { bindGoogleAuth, getMyPermissions, getProfile, setupGoogleAuth, unbindGoogleAuth, updateProfile } from '@/api/user'
  import VabPageHeader from '@/components/VabPageHeader'

  export default {
    name: 'PersonalCenter',
    components: {
      VabPageHeader,
    },
    data() {
      return {
        form: {
          username: '',
          nickname: '',
          phone: '',
          email: '',
          avatar: '',
          bio: '',
          googleBound: false,
        },
        permissions: [],
        google: {
          qrCodeBase64: '',
          code: '',
        },
        rules: {
          nickname: [{ required: true, trigger: 'blur', message: '请输入昵称' }],
          phone: [{ required: true, trigger: 'blur', message: '请输入手机号' }],
          email: [{ required: true, trigger: 'blur', message: '请输入邮箱' }],
        },
      }
    },
    created() {
      this.fetchProfile()
      this.fetchPermissions()
    },
    methods: {
      async fetchProfile() {
        const { data } = await getProfile()
        this.form = Object.assign({}, this.form, data)
      },
      async fetchPermissions() {
        const { data } = await getMyPermissions()
        this.permissions = data || []
      },
      handleSubmit() {
        this.$refs.profileForm.validate(async (valid) => {
          if (!valid) return
          const { msg } = await updateProfile(this.form)
          this.$baseMessage(msg || '更新成功', 'success')
        })
      },
      async handleGoogleSetup() {
        const { data } = await setupGoogleAuth()
        this.google.qrCodeBase64 = data.qrCodeBase64
      },
      async handleGoogleBind() {
        if (!this.google.code) return this.$baseMessage('请先输入验证码', 'error')
        const { msg } = await bindGoogleAuth({ code: this.google.code })
        this.$baseMessage(msg, 'success')
        this.fetchProfile()
      },
      async handleGoogleUnbind() {
        if (!this.google.code) return this.$baseMessage('请输入当前验证码以解绑', 'error')
        const { msg } = await unbindGoogleAuth({ code: this.google.code })
        this.$baseMessage(msg, 'success')
        this.fetchProfile()
      },
    },
  }
</script>

<style lang="scss" scoped>
  .resource-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;

    .cover-img {
      width: 100%;
      border-radius: 8px;
    }

    .qr-img {
      width: 120px;
      height: 120px;
      border-radius: 8px;
    }

    .img-btn {
      width: 100%;
    }
  }

  .google-card {
    margin-top: 20px;
  }

  .tips {
    color: #909399;
    font-size: 12px;
    margin: 8px 0;
  }
</style>
