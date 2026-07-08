import type { HttpErrorType } from '@/shared/errors'

export type AuthUser = {
  token: string
  userName: string
  userAvatar: string | null
  isAuthorized: boolean
}

export type AuthState = AuthUser & {
  isInitializing: boolean
  isInitialized: boolean
  authError: HttpErrorType | null
}

export type AuthResponse = {
  token: string
  name: string
  avatar: string | null
}
