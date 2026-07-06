import type { RootState } from '@/shared/store'

export const selectAuth = (state: RootState) => state.auth
export const selectIsAuthorized = (state: RootState) => state.auth.isAuthorized
export const selectIsAuthInitialized = (state: RootState) => state.auth.isInitialized
export const selectIsAuthInitializing = (state: RootState) => state.auth.isInitializing
