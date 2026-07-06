'use client'

import { useCallback } from 'react'

import { authActions, removeToken, selectAuth, setToken, useAuthMutation } from '@/entities/auth'
import { useAppDispatch, useAppSelector } from '@/shared/store'

export function useAuth() {
  const dispatch = useAppDispatch()
  const authState = useAppSelector(selectAuth)
  const [auth] = useAuthMutation()

  const initApp = useCallback(async () => {
    dispatch(authActions.authStarted())

    try {
      const data = await auth().unwrap()

      setToken(data.token)

      dispatch(
        authActions.authSuccess({
          token: data.token,
          userName: data.name,
          userAvatar: data.avatar,
          isAuthorized: true
        })
      )
    } catch {
      removeToken()
      dispatch(authActions.authFailed())
    }
  }, [auth, dispatch])

  return {
    ...authState,
    initApp
  }
}
