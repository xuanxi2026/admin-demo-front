/**
 * @description 导出默认网路配置
 **/
const isLocalDev =
  typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')

const runtimeApiBase = typeof window !== 'undefined' ? window.__VAB_API_BASE_URL__ : ''

const network = {
  // 本地开发默认直连8889；也可在 index.html 注入 window.__VAB_API_BASE_URL__ 覆盖
  baseURL: runtimeApiBase || (isLocalDev ? 'http://127.0.0.1:8889/api' : '/api'),
  //配后端数据的接收方式application/json;charset=UTF-8或者application/x-www-form-urlencoded;charset=UTF-8
  contentType: 'application/json;charset=UTF-8',
  //消息框消失时间
  messageDuration: 3000,
  //最长请求时间
  requestTimeout: 15000,
  //操作正常code，支持String、Array、int多种类型
  successCode: [200, 0],
  //登录失效code
  invalidCode: 40102,
  //无权限code
  noPermissionCode: 40301,
}
module.exports = network
