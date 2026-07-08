import type { AuthState } from './types'

type StateWithAuth = {
  auth: AuthState
}

export const selectAuth = (state: StateWithAuth) => state.auth
export const selectIsAuthorized = (state: StateWithAuth) => state.auth.isAuthorized
export const selectIsAuthInitialized = (state: StateWithAuth) => state.auth.isInitialized
export const selectIsAuthInitializing = (state: StateWithAuth) => state.auth.isInitializing
export const selectAuthError = (state: StateWithAuth) => state.auth.authError
