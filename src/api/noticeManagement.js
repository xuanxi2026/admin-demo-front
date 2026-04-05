import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/noticeManagement/getList',
    method: 'post',
    data,
  })
}

export function doEdit(data) {
  return request({
    url: '/noticeManagement/doEdit',
    method: 'post',
    data,
  })
}

export function doDelete(data) {
  return request({
    url: '/noticeManagement/doDelete',
    method: 'post',
    data,
  })
}

export function getPublishedNotices(data = {}) {
  return getList({
    pageNo: 1,
    pageSize: 20,
    status: 'published',
    ...data,
  })
}
