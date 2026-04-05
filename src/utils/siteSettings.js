import { title as defaultTitle } from '@/config'
import { fetchSettingsByGroup } from '@/api/systemSettings'

export const SITE_SETTINGS_KEY = 'admin-demo-site-settings-vue2'
export const SITE_SETTINGS_EVENT = 'site-settings:updated'

export function readSiteSettings() {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    return {}
  }
}

export function getRuntimeTitle() {
  return readSiteSettings().siteName || window.$baseTitle || defaultTitle
}

export function getRuntimeLogo() {
  return readSiteSettings().logo || ''
}

export function getRuntimeDescription() {
  return readSiteSettings().description || ''
}

function syncMetaDescription(description = '') {
  if (typeof document === 'undefined') return
  let meta = document.querySelector('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', description || '可复用后台管理系统基座')
}

export function applySiteSettings(vm, settings = {}) {
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings))
  window.$baseTitle = settings.siteName || defaultTitle
  syncMetaDescription(settings.description)
  if (vm && vm.$baseEventBus) vm.$baseEventBus.$emit(SITE_SETTINGS_EVENT, settings)
}

export async function refreshSiteSettings(vm) {
  const meta = await fetchSettingsByGroup('site')
  const settings = {
    siteName: meta['site.title'] && meta['site.title'].configValue ? meta['site.title'].configValue : defaultTitle,
    description: meta['site.description'] && meta['site.description'].configValue ? meta['site.description'].configValue : '',
    logo: meta['site.logo'] && meta['site.logo'].configValue ? meta['site.logo'].configValue : '',
  }
  applySiteSettings(vm, settings)
  return settings
}
