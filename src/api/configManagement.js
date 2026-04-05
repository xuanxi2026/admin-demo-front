import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/configManagement/getList',
    method: 'post',
    data,
  })
}

export function doEdit(data) {
  return request({
    url: '/configManagement/doEdit',
    method: 'post',
    data,
  })
}

export function doDelete(data) {
  return request({
    url: '/configManagement/doDelete',
    method: 'post',
    data,
  })
}
