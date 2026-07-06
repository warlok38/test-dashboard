export type AuthUser = {
  token: string
  userName: string
  userAvatar: string | null
  isAuthorized: boolean
}

export type AuthState = AuthUser & {
  isInitializing: boolean
  isInitialized: boolean
}

export type AuthResponse = {
  token: string
  name: string
  avatar: string | null
}
