import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/departmentManagement/getList',
    method: 'post',
    data,
  })
}

export function getTree(data = {}) {
  return request({
    url: '/departmentManagement/getTree',
    method: 'post',
    data,
  })
}

export function doEdit(data) {
  return request({
    url: '/departmentManagement/doEdit',
    method: 'post',
    data,
  })
}

export function doDelete(data) {
  return request({
    url: '/departmentManagement/doDelete',
    method: 'post',
    data,
  })
}
