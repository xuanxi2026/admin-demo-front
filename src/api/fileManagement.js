import request from '@/utils/request'

export function getPublicFiles(data = {}) {
  return request({
    url: '/fileManagement/public/list',
    method: 'post',
    data,
  })
}

export function getPrivateFiles(data = {}) {
  return request({
    url: '/fileManagement/private/list',
    method: 'post',
    data,
  })
}

export function deletePublicFile(data) {
  return request({
    url: '/fileManagement/public/delete',
    method: 'post',
    data,
  })
}

export function deletePrivateFile(data) {
  return request({
    url: '/fileManagement/private/delete',
    method: 'post',
    data,
  })
}
