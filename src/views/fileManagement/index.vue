<template>
  <div class="fileManagement-container">
    <vab-page-header description="统一文件管理母版，包含公开文件区与私有文件区" :icon="['fas', 'folder-open']" title="文件资源管理" />

    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="公开文件区" name="public">
        <div>
          <el-upload
            style="display: inline-block"
            :action="publicUploadUrl"
            :headers="authHeaders"
            :show-file-list="false"
            :before-upload="(file) => handleBeforeUpload('public', file)"
            :on-progress="handleUploadProgress"
            :on-success="handlePublicUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-button icon="el-icon-upload2" type="primary">上传到公开区</el-button>
          </el-upload>
          <el-button icon="el-icon-delete" style="margin-left: 10px" type="danger" @click="handleBatchDelete('public')">
            批量删除
          </el-button>
        </div>
        <el-table style="margin-top: 16px" :data="publicFiles" @selection-change="handlePublicSelectionChange">
          <el-table-column type="selection" width="48" />
          <el-table-column label="文件名" prop="name" />
          <el-table-column label="大小(字节)" prop="size" width="140" />
          <el-table-column label="更新时间" prop="updatedAt" width="180" />
          <el-table-column label="操作" width="260">
            <template #default="{ row }">
              <el-button icon="el-icon-link" type="text" @click="copyPublicUrl(row)">复制链接</el-button>
              <el-button icon="el-icon-download" type="text" @click="openPublicUrl(row)">下载</el-button>
              <el-button icon="el-icon-delete" type="text" @click="handleDeleteFile('public', row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="私有文件区" name="private">
        <div>
          <el-upload
            style="display: inline-block"
            :action="privateUploadUrl"
            :headers="authHeaders"
            :show-file-list="false"
            :before-upload="(file) => handleBeforeUpload('private', file)"
            :on-progress="handleUploadProgress"
            :on-success="handlePrivateUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-button icon="el-icon-upload2" type="warning">上传到私有区</el-button>
          </el-upload>
          <el-button icon="el-icon-delete" style="margin-left: 10px" type="danger" @click="handleBatchDelete('private')">
            批量删除
          </el-button>
        </div>
        <el-table style="margin-top: 16px" :data="privateFiles" @selection-change="handlePrivateSelectionChange">
          <el-table-column type="selection" width="48" />
          <el-table-column label="文件名" prop="name" />
          <el-table-column label="大小(字节)" prop="size" width="140" />
          <el-table-column label="更新时间" prop="updatedAt" width="180" />
          <el-table-column label="操作" width="220">
            <template #default="{ row }">
              <el-button icon="el-icon-download" type="text" @click="downloadPrivate(row)">后台下载</el-button>
              <el-button icon="el-icon-delete" type="text" @click="handleDeleteFile('private', row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import axios from 'axios'
  import { mapGetters } from 'vuex'
  import { baseURL, tokenName } from '@/config'
  import VabPageHeader from '@/components/VabPageHeader'
  import { deletePrivateFile, deletePublicFile, getPrivateFiles, getPublicFiles } from '@/api/fileManagement'

  export default {
    name: 'FileManagement',
    components: { VabPageHeader },
    data() {
      return {
        activeName: 'public',
        publicFiles: [],
        privateFiles: [],
        publicSelection: [],
        privateSelection: [],
        uploadLoading: null,
      }
    },
    computed: {
      ...mapGetters({
        accessToken: 'user/accessToken',
      }),
      apiOrigin() {
        if (baseURL.startsWith('http')) return baseURL.replace(/\/api\/?$/, '').replace(/\/$/, '')
        return window.location.origin.replace(/\/$/, '')
      },
      publicUploadUrl() {
        return `${this.apiOrigin}/api/fileManagement/public/upload`
      },
      privateUploadUrl() {
        return `${this.apiOrigin}/api/fileManagement/private/upload`
      },
      authHeaders() {
        return {
          [tokenName]: this.accessToken,
        }
      },
    },
    created() {
      this.fetchPublicFiles()
      this.fetchPrivateFiles()
    },
    beforeDestroy() {
      this.closeUploadLoading()
    },
    methods: {
      handlePublicSelectionChange(rows) {
        this.publicSelection = rows || []
      },
      handlePrivateSelectionChange(rows) {
        this.privateSelection = rows || []
      },
      handleBeforeUpload(area, file) {
        const areaName = area === 'public' ? '公开区' : '私有区'
        const fileName = (file && file.name) || '当前文件'
        this.closeUploadLoading()
        this.uploadLoading = this.$baseLoading(0, `正在上传到${areaName}：${fileName}`)
        return true
      },
      handleUploadProgress() {
        if (!this.uploadLoading) {
          this.uploadLoading = this.$baseLoading(0, '文件上传中，请稍候...')
        }
      },
      closeUploadLoading() {
        if (this.uploadLoading && this.uploadLoading.close) {
          this.uploadLoading.close()
        }
        this.uploadLoading = null
      },
      async fetchPublicFiles() {
        try {
          const { data } = await getPublicFiles()
          this.publicFiles = data || []
        } catch (e) {
          this.$baseMessage('公开文件列表刷新失败', 'error')
        }
      },
      async fetchPrivateFiles() {
        try {
          const { data } = await getPrivateFiles()
          this.privateFiles = data || []
        } catch (e) {
          this.$baseMessage('私有文件列表刷新失败', 'error')
        }
      },
      async handlePublicUploadSuccess(response, file) {
        await this.handleUploadSuccess('public', response, file)
      },
      async handlePrivateUploadSuccess(response, file) {
        await this.handleUploadSuccess('private', response, file)
      },
      showUploadResult(title, message) {
        this.$baseAlert(`<div style="line-height: 1.8;">${this.escapeHtml(message)}</div>`, title)
      },
      async handleUploadSuccess(area, response, file) {
        const areaName = area === 'public' ? '公开区' : '私有区'
        const fileName = (file && file.name) || '当前文件'
        if (!response || response.code !== 200) {
          this.closeUploadLoading()
          const reason = (response && response.msg) || '服务端返回异常'
          this.showUploadResult('上传失败', `${fileName} 上传到${areaName}失败：${reason}`)
          return
        }
        if (area === 'public') await this.fetchPublicFiles()
        else await this.fetchPrivateFiles()
        this.closeUploadLoading()
        this.showUploadResult('上传成功', `${fileName} 已上传到${areaName}，列表已自动刷新。`)
      },
      handleUploadError(err, file) {
        this.closeUploadLoading()
        const fileName = (file && file.name) || '当前文件'
        const reason = (err && err.message) || '网络或服务异常'
        this.showUploadResult('上传失败', `${fileName} 上传失败：${reason}`)
      },
      handleDeleteFile(area, row) {
        const areaName = area === 'public' ? '公开区' : '私有区'
        const fileName = (row && row.name) || ''
        if (!fileName) {
          this.$baseMessage('文件名不存在，无法删除', 'error')
          return
        }
        this.$baseConfirm(`确认删除${areaName}文件【${this.escapeHtml(fileName)}】吗？`, '删除确认', async () => {
          try {
            if (area === 'public') await deletePublicFile({ name: fileName })
            else await deletePrivateFile({ name: fileName })
            if (area === 'public') await this.fetchPublicFiles()
            else await this.fetchPrivateFiles()
            this.$baseMessage('删除成功', 'success')
          } catch (e) {
            const reason = this.getDeleteErrorMessage(e)
            this.$baseAlert(`${this.escapeHtml(fileName)} 删除失败：${this.escapeHtml(reason)}`, '删除失败')
          }
        })
      },
      getDeleteErrorMessage(err) {
        const data = err && err.response && err.response.data
        return (data && data.msg) || (err && err.message) || '未知异常'
      },
      showBatchDeleteSummary(areaName, successNames, failedItems, title = '批量删除结果') {
        const successCount = successNames.length
        const failedCount = failedItems.length
        let html = `<div style="line-height: 1.8;">`
        html += `<div>批量删除完成（${areaName}）</div>`
        html += `<div>成功：${successCount} 个，失败：${failedCount} 个</div>`
        if (successCount > 0) {
          html += `<div style="margin-top: 8px;">成功文件：</div>`
          html += `<div>${this.escapeHtml(successNames.join('、'))}</div>`
        }
        if (failedCount > 0) {
          html += `<div style="margin-top: 8px;">失败文件：</div>`
          html += `<div>`
          html += failedItems
            .map((item) => `${this.escapeHtml(item.name)}（${this.escapeHtml(item.reason)}）`)
            .join('<br>')
          html += `</div>`
        }
        html += `</div>`
        this.$baseAlert(html, title)
      },
      async runBatchDelete(area, names) {
        const tasks = names.map(async (name) => {
          const safeName = String(name || '').trim()
          if (!safeName) return { ok: false, name: '未知文件', reason: '文件名缺失' }
          try {
            if (area === 'public') await deletePublicFile({ name: safeName })
            else await deletePrivateFile({ name: safeName })
            return { ok: true, name: safeName }
          } catch (e) {
            return { ok: false, name: safeName, reason: this.getDeleteErrorMessage(e) }
          }
        })
        const results = await Promise.all(tasks)
        const successNames = results.filter((item) => item.ok).map((item) => item.name)
        const failedItems = results.filter((item) => !item.ok)
        if (area === 'public') {
          this.publicSelection = []
          await this.fetchPublicFiles()
        } else {
          this.privateSelection = []
          await this.fetchPrivateFiles()
        }
        return { successNames, failedItems }
      },
      promptRetryFailedItems(area, areaName, failedItems) {
        if (!failedItems || failedItems.length === 0) return
        this.$baseConfirm(
          `检测到${failedItems.length}个文件删除失败，是否一键重试失败项？`,
          '失败项重试',
          async () => {
            const retryNames = failedItems.map((item) => item.name)
            const retryResult = await this.runBatchDelete(area, retryNames)
            this.showBatchDeleteSummary(areaName, retryResult.successNames, retryResult.failedItems, '失败项重试结果')
            if (retryResult.failedItems.length === 0) this.$baseMessage('失败项重试成功', 'success')
            else this.$baseMessage('仍有失败项，请查看结果详情', 'warning')
          }
        )
      },
      handleBatchDelete(area) {
        const areaName = area === 'public' ? '公开区' : '私有区'
        const rows = area === 'public' ? this.publicSelection : this.privateSelection
        if (!rows || rows.length === 0) {
          this.$baseMessage(`请先勾选要删除的${areaName}文件`, 'error')
          return
        }
        this.$baseConfirm(`确认批量删除${rows.length}个${areaName}文件吗？`, '批量删除确认', async () => {
          const names = rows.map((item) => (item && item.name) || '')
          const { successNames, failedItems } = await this.runBatchDelete(area, names)
          this.showBatchDeleteSummary(areaName, successNames, failedItems)
          if (failedItems.length === 0) {
            this.$baseMessage(`已删除${successNames.length}个文件`, 'success')
          } else if (successNames.length > 0) {
            this.$baseMessage(`部分删除成功：${successNames.length}个成功，${failedItems.length}个失败`, 'warning')
          } else {
            this.$baseMessage('批量删除失败，请查看结果详情', 'error')
          }
          this.promptRetryFailedItems(area, areaName, failedItems)
        })
      },
      getPublicDownloadUrl(row) {
        const raw = String((row && row.downloadUrl) || '').trim()
        if (raw) {
          if (/^https?:\/\//i.test(raw)) return raw
          return raw.startsWith('/') ? `${this.apiOrigin}${raw}` : `${this.apiOrigin}/${raw}`
        }
        if (row && row.name) return `${this.apiOrigin}/files/public/${encodeURIComponent(row.name)}`
        return ''
      },
      openPublicUrl(row) {
        const url = this.getPublicDownloadUrl(row)
        if (!url) {
          this.$baseMessage('未找到可用下载链接', 'error')
          return
        }
        window.open(url, '_blank')
      },
      copyByTextarea(text) {
        const input = document.createElement('textarea')
        input.value = text
        input.setAttribute('readonly', 'readonly')
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      },
      escapeHtml(text) {
        return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
      },
      showCopiedUrlPreview(url) {
        const safeUrl = this.escapeHtml(url)
        this.$baseAlert(
          `<div style="word-break: break-all; line-height: 1.8;">
            <div>链接已复制到剪贴板，可直接点击预览：</div>
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>
          </div>`,
          '链接预览'
        )
      },
      async copyPublicUrl(row) {
        const url = this.getPublicDownloadUrl(row)
        if (!url) {
          this.$baseMessage('未找到可用下载链接', 'error')
          return
        }
        try {
          if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url)
          else this.copyByTextarea(url)
          this.$baseMessage('链接已复制', 'success')
          this.showCopiedUrlPreview(url)
        } catch (e) {
          this.$baseMessage(`复制失败，请手动复制：${url}`, 'error')
        }
      },
      async downloadPrivate(row) {
        const url = `${this.apiOrigin}/api/fileManagement/private/download/${encodeURIComponent(row.name)}`
        const response = await axios.get(url, {
          responseType: 'blob',
          headers: this.authHeaders,
        })
        const blob = new Blob([response.data])
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = row.name
        link.click()
        URL.revokeObjectURL(link.href)
      },
    },
  }
</script>
