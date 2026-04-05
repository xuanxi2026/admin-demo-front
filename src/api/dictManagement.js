import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/dictManagement/getList',
    method: 'post',
    data,
  })
}

export function doEdit(data) {
  return request({
    url: '/dictManagement/doEdit',
    method: 'post',
    data,
  })
}

export function doDelete(data) {
  return request({
    url: '/dictManagement/doDelete',
    method: 'post',
    data,
  })
}
