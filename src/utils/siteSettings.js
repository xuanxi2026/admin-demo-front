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

export function applySiteSettings(vm, settings = {}) {
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings))
  window.$baseTitle = settings.siteName || defaultTitle
  if (vm && vm.$baseEventBus) vm.$baseEventBus.$emit(SITE_SETTINGS_EVENT, settings)
}

export async function refreshSiteSettings(vm) {
  const meta = await fetchSettingsByGroup('site')
  const settings = {
    siteName: meta['site.title'] && meta['site.title'].configValue ? meta['site.title'].configValue : defaultTitle,
    description: meta['site.description'] && meta['site.description'].configValue ? meta['site.description'].configValue : '',
    logo: meta['site.logo'] && meta['site.logo'].configValue ? meta['site.logo'].configValue : '',
    maintenanceMode: String(meta['site.maintenance_mode'] && meta['site.maintenance_mode'].configValue) === 'true',
  }
  applySiteSettings(vm, settings)
  return settings
}
