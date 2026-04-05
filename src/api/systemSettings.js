import axios from 'axios'
import { baseURL, tokenName } from '@/config'
import store from '@/store'
import { doEdit, getList } from '@/api/configManagement'

export const defaultSettings = {
  site: {
    'site.title': { group: 'site', name: '站点标题', valueType: 'string', configValue: 'Admin Demo' },
    'site.description': { group: 'site', name: '站点描述', valueType: 'string', configValue: '可复用后台管理系统基座' },
    'site.logo': { group: 'site', name: '站点 Logo', valueType: 'string', configValue: '' },
  },
  security: {
    'security.login_captcha': { group: 'security', name: '登录验证码', valueType: 'boolean', configValue: 'false' },
    'security.two_factor_auth': { group: 'security', name: '双重认证', valueType: 'boolean', configValue: 'false' },
    'security.session_timeout': { group: 'security', name: '会话超时', valueType: 'number', configValue: '30' },
    'security.max_login_attempts': { group: 'security', name: '登录失败次数', valueType: 'number', configValue: '5' },
    'security.password_min_length': { group: 'security', name: '密码最小长度', valueType: 'number', configValue: '8' },
  },
  email: {
    'email.smtp_server': { group: 'email', name: 'SMTP服务器', valueType: 'string', configValue: 'smtp.example.com' },
    'email.smtp_port': { group: 'email', name: 'SMTP端口', valueType: 'number', configValue: '587' },
    'email.username': { group: 'email', name: '用户名', valueType: 'string', configValue: 'user@example.com' },
    'email.password': { group: 'email', name: '密码', valueType: 'string', configValue: '' },
    'email.sender_email': { group: 'email', name: '发件人邮箱', valueType: 'string', configValue: 'noreply@example.com' },
  },
}

function resolveGroupDefaults(group) {
  return defaultSettings[group] || {}
}

export async function fetchSettingsByGroup(group) {
  const { data = [] } = await getList({ pageNo: 1, pageSize: 100, group })
  const rows = Array.isArray(data) ? data : []
  const rowMap = rows.reduce((acc, item) => {
    acc[item.configKey] = item
    return acc
  }, {})

  return Object.entries(resolveGroupDefaults(group)).reduce((acc, [key, meta]) => {
    acc[key] = rowMap[key]
      ? {
          id: rowMap[key].id,
          configKey: rowMap[key].configKey,
          configValue: rowMap[key].configValue,
          group: rowMap[key].group,
          name: rowMap[key].name,
          valueType: rowMap[key].valueType,
          remark: rowMap[key].remark || '',
        }
      : {
          id: '',
          configKey: key,
          configValue: meta.configValue,
          group: meta.group,
          name: meta.name,
          valueType: meta.valueType,
          remark: '',
        }
    return acc
  }, {})
}

export function buildSettingsPayload(metaMap, values) {
  return Object.entries(values).map(([key, configValue]) => ({
    id: metaMap[key] ? metaMap[key].id : '',
    configKey: key,
    configValue: String(configValue),
    group: metaMap[key] ? metaMap[key].group : key.split('.')[0],
    name: metaMap[key] ? metaMap[key].name : key,
    valueType: metaMap[key] ? metaMap[key].valueType : 'string',
    remark: metaMap[key] ? metaMap[key].remark || '' : '',
  }))
}

export async function saveSettings(items = []) {
  for (const item of items) {
    await doEdit(item)
  }
}

export function publicUploadEndpoint() {
  const origin = baseURL.startsWith('http')
    ? baseURL.replace(/\/api\/?$/, '').replace(/\/$/, '')
    : window.location.origin.replace(/\/$/, '')
  return `${origin}/api/fileManagement/public/upload`
}

export function uploadHeaders() {
  return {
    [tokenName]: store.getters['user/accessToken'],
  }
}

export async function uploadPublicFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(publicUploadEndpoint(), formData, {
    headers: {
      ...uploadHeaders(),
    },
  })
  return response.data
}
