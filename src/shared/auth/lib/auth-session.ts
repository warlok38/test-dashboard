import type { AuthResponse, AuthUser } from '../model/types'
import { removeToken, setToken } from './token'

export function mapAuthResponseToUser(data: AuthResponse): AuthUser {
  return {
    token: data.token,
    userName: data.name,
    userAvatar: data.avatar,
    isAuthorized: true
  }
}

export function saveAuthSession(data: AuthResponse): AuthUser {
  setToken(data.token)

  return mapAuthResponseToUser(data)
}

export function clearAuthSession() {
  removeToken()
}
