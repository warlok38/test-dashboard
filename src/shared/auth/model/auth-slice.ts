import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { HttpErrorType } from '@/shared/errors'

import type { AuthState, AuthUser } from './types'

const initialState: AuthState = {
  token: '',
  userName: '',
  userAvatar: null,
  isAuthorized: false,
  isInitializing: false,
  isInitialized: false,
  authError: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStarted: (state) => {
      state.isInitializing = true
      state.authError = null
    },
    authSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.token = action.payload.token
      state.userName = action.payload.userName
      state.userAvatar = action.payload.userAvatar
      state.isAuthorized = action.payload.isAuthorized
      state.isInitializing = false
      state.isInitialized = true
      state.authError = null
    },
    authFailed: (state, action: PayloadAction<HttpErrorType | undefined>) => {
      state.token = ''
      state.userName = ''
      state.userAvatar = null
      state.isAuthorized = false
      state.isInitializing = false
      state.isInitialized = true
      state.authError = action.payload ?? null
    }
  }
})

export const authActions = authSlice.actions
export const authReducer = authSlice.reducer
