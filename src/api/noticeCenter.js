import request from '@/utils/request'

export function getNoticeCenterList(data = {}) {
  return request({
    url: '/noticeCenter/getList',
    method: 'post',
    data: {
      pageNo: 1,
      pageSize: 50,
      ...data,
    },
  })
}

export function markNoticeRead(noticeId) {
  return request({
    url: '/noticeCenter/markRead',
    method: 'post',
    data: { noticeId },
  })
}

export function markNoticeUnread(noticeId) {
  return request({
    url: '/noticeCenter/markUnread',
    method: 'post',
    data: { noticeId },
  })
}
