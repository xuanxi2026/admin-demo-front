import { getNoticeCenterList, markNoticeRead, markNoticeUnread } from '@/api/noticeCenter'

export const NOTICE_EVENT = 'notice-center:updated'

export function emitNoticeChange(vm, payload = {}) {
  vm && vm.$baseEventBus && vm.$baseEventBus.$emit(NOTICE_EVENT, payload)
}

export function buildNotifications(rows = []) {
  return rows.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    sender: item.publisher || '系统公告',
    date: item.datatime,
    level: item.level,
    status: item.status,
    read: !!item.read,
    readAt: item.readAt || '',
  }))
}

export async function fetchPublishedNotifications(params = {}) {
  const { data } = await getNoticeCenterList({ pageSize: 50, ...params })
  const notifications = buildNotifications(data || [])
  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
  }
}

export async function setNoticeReadState(noticeId, read) {
  if (read) return markNoticeRead(noticeId)
  return markNoticeUnread(noticeId)
}
