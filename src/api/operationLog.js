import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/operationLog/getList',
    method: 'post',
    data,
  })
}
