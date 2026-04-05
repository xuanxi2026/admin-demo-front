<template>
  <div class="notification-container">
    <el-card shadow="hover">
      <div slot="header" class="card-header">
        <span>通知中心</span>
        <el-button style="float: right" @click="refreshNotifications">刷新</el-button>
      </div>

      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="全部通知" name="all">
          <el-table v-loading="loading" :data="filteredNotifications" style="width: 100%">
            <el-table-column label="标题" prop="title" width="200">
              <template #default="{ row }">
                <el-badge v-if="!row.read" is-dot>{{ row.title }}</el-badge>
                <span v-else>{{ row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column label="内容" prop="content">
              <template #default="{ row }"><div class="notification-content">{{ row.content }}</div></template>
            </el-table-column>
            <el-table-column label="发送者" prop="sender" width="120" />
            <el-table-column label="时间" prop="date" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button v-if="!row.read" size="small" type="primary" @click="markAsRead(row)">标为已读</el-button>
                <el-button v-else size="small" @click="markAsUnread(row)">标为未读</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="未读通知" name="unread">
          <el-table v-loading="loading" :data="unreadNotifications" style="width: 100%">
            <el-table-column label="标题" prop="title" width="200">
              <template #default="{ row }"><el-badge is-dot>{{ row.title }}</el-badge></template>
            </el-table-column>
            <el-table-column label="内容" prop="content"><template #default="{ row }"><div class="notification-content">{{ row.content }}</div></template></el-table-column>
            <el-table-column label="发送者" prop="sender" width="120" />
            <el-table-column label="时间" prop="date" width="180" />
            <el-table-column label="操作" width="200"><template #default="{ row }"><el-button size="small" type="primary" @click="markAsRead(row)">标为已读</el-button></template></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="已读通知" name="read">
          <el-table v-loading="loading" :data="readNotifications" style="width: 100%">
            <el-table-column label="标题" prop="title" width="200" />
            <el-table-column label="内容" prop="content"><template #default="{ row }"><div class="notification-content">{{ row.content }}</div></template></el-table-column>
            <el-table-column label="发送者" prop="sender" width="120" />
            <el-table-column label="时间" prop="date" width="180" />
            <el-table-column label="操作" width="120"><template #default="{ row }"><el-button size="small" @click="markAsUnread(row)">标为未读</el-button></template></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <div class="pagination-container">
        <el-pagination background :current-page.sync="currentPage" :page-size.sync="pageSize" :page-sizes="[10, 20, 50, 100]" :total="totalNotifications" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script>
  import { NOTICE_EVENT, emitNoticeChange, fetchPublishedNotifications, setNoticeReadState } from '@/utils/noticeCenter'

  export default {
    name: 'Notification',
    data() {
      return {
        activeTab: 'all',
        currentPage: 1,
        pageSize: 10,
        totalNotifications: 0,
        loading: false,
        notifications: [],
      }
    },
    created() {
      this.refreshNotifications()
      this.$baseEventBus.$on(NOTICE_EVENT, this.handleNoticeChange)
    },
    beforeDestroy() {
      this.$baseEventBus.$off(NOTICE_EVENT, this.handleNoticeChange)
    },
    computed: {
      filteredNotifications() {
        const source = this.resolveTabItems(this.activeTab)
        const start = (this.currentPage - 1) * this.pageSize
        return source.slice(start, start + this.pageSize)
      },
      unreadNotifications() {
        return this.notifications.filter((item) => !item.read)
      },
      readNotifications() {
        return this.notifications.filter((item) => item.read)
      },
    },
    methods: {
      resolveTabItems(tab) {
        if (tab === 'unread') return this.unreadNotifications
        if (tab === 'read') return this.readNotifications
        return this.notifications
      },
      handleTabChange(tab) {
        this.activeTab = tab.name || tab
        this.currentPage = 1
        this.totalNotifications = this.resolveTabItems(this.activeTab).length
      },
      handleSizeChange(val) {
        this.pageSize = val
        this.currentPage = 1
      },
      handleCurrentChange(val) {
        this.currentPage = val
      },
      async markAsRead(notification) {
        const index = this.notifications.findIndex((item) => item.id === notification.id)
        if (index !== -1 && !this.notifications[index].read) {
          await setNoticeReadState(notification.id, true)
          this.notifications[index].read = true
          this.totalNotifications = this.resolveTabItems(this.activeTab).length
          emitNoticeChange(this, { unreadCount: this.unreadNotifications.length })
          this.$baseMessage('已标记为已读', 'success')
        }
      },
      async markAsUnread(notification) {
        const index = this.notifications.findIndex((item) => item.id === notification.id)
        if (index !== -1) {
          await setNoticeReadState(notification.id, false)
          this.notifications[index].read = false
          this.totalNotifications = this.resolveTabItems(this.activeTab).length
          emitNoticeChange(this, { unreadCount: this.unreadNotifications.length })
          this.$baseMessage('已标记为未读', 'success')
        }
      },
      async handleNoticeChange(payload = {}) {
        if (typeof payload.unreadCount === 'number') return
        await this.refreshNotifications({ silent: true })
      },
      async refreshNotifications(options = {}) {
        this.loading = true
        try {
          const { notifications, unreadCount } = await fetchPublishedNotifications()
          this.notifications = notifications
          this.totalNotifications = this.resolveTabItems(this.activeTab).length
          const currentNoticeId = Number(this.$route.query.noticeId)
          if (currentNoticeId) {
            const target = this.notifications.find((item) => item.id === currentNoticeId)
            if (target) await this.markAsRead(target)
          }
          emitNoticeChange(this, { unreadCount })
          if (!options.silent) this.$baseMessage('刷新成功', 'success')
        } catch (error) {
          this.$baseMessage('刷新失败', 'error')
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .notification-content {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
</style>
