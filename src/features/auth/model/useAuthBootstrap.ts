'use client'

import { useCallback } from 'react'

import { authActions, clearAuthSession, saveAuthSession, useAuthMutation } from '@/entities/auth'
import { createErrorFromUnknown } from '@/shared/errors'
import { useAppDispatch } from '@/shared/store'

export function useAuthBootstrap() {
  const dispatch = useAppDispatch()
  const [auth] = useAuthMutation()

  const bootstrapAuth = useCallback(async () => {
    dispatch(authActions.authStarted())

    try {
      const data = await auth().unwrap()

      dispatch(authActions.authSuccess(saveAuthSession(data)))
    } catch (error) {
      clearAuthSession()
      dispatch(authActions.authFailed(createErrorFromUnknown(error)))
    }
  }, [auth, dispatch])

  return {
    bootstrapAuth
  }
}
