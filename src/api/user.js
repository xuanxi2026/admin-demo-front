import request from '@/utils/request'
import { encryptedData } from '@/utils/encrypt'
import { loginRSA, tokenName } from '@/config'

export async function login(data) {
  if (loginRSA) {
    data = await encryptedData(data)
  }
  return request({
    url: '/login',
    method: 'post',
    data,
  })
}

export function getUserInfo(accessToken) {
  return request({
    url: '/userInfo',
    method: 'post',
    data: {
      [tokenName]: accessToken,
    },
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post',
  })
}

export function register(data) {
  return request({
    url: '/register',
    method: 'post',
    data,
  })
}

export function getProfile() {
  return request({
    url: '/profile',
    method: 'get',
  })
}

export function updateProfile(data) {
  return request({
    url: '/profile',
    method: 'put',
    data,
  })
}

export function changePassword(data) {
  return request({
    url: '/profile/change-password',
    method: 'post',
    data,
  })
}

export function setupGoogleAuth() {
  return request({
    url: '/auth/google/setup',
    method: 'get',
  })
}

export function bindGoogleAuth(data) {
  return request({
    url: '/auth/google/bind',
    method: 'post',
    data,
  })
}

export function unbindGoogleAuth(data) {
  return request({
    url: '/auth/google/unbind',
    method: 'post',
    data,
  })
}

export function getMyPermissions() {
  return request({
    url: '/rbac/permissions',
    method: 'get',
  })
}
