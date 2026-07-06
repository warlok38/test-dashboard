import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AuthState, AuthUser } from './types'

const initialState: AuthState = {
  token: '',
  userName: '',
  userAvatar: null,
  isAuthorized: false,
  isInitializing: false,
  isInitialized: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStarted: (state) => {
      state.isInitializing = true
    },
    authSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.token = action.payload.token
      state.userName = action.payload.userName
      state.userAvatar = action.payload.userAvatar
      state.isAuthorized = action.payload.isAuthorized
      state.isInitializing = false
      state.isInitialized = true
    },
    authFailed: (state) => {
      state.token = ''
      state.userName = ''
      state.userAvatar = null
      state.isAuthorized = false
      state.isInitializing = false
      state.isInitialized = true
    }
  }
})

export const authActions = authSlice.actions
export const authReducer = authSlice.reducer
