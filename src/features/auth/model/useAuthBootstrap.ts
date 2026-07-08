'use client'

import { useCallback } from 'react'

import {
  authActions,
  clearAuthSession,
  createAuthUserFromToken,
  saveAuthSession,
  useAuthMutation
} from '@/shared/auth'
import { KERB_TOKEN, isDevelopmentRunMode } from '@/shared/constants'
import { createErrorFromUnknown, createHttpError } from '@/shared/errors'
import { useAppDispatch } from '@/shared/hooks'

export function useAuthBootstrap() {
  const dispatch = useAppDispatch()
  const [auth] = useAuthMutation()

  const bootstrapAuth = useCallback(async () => {
    dispatch(authActions.authStarted())

    if (isDevelopmentRunMode) {
      if (!KERB_TOKEN) {
        dispatch(
          authActions.authFailed(
            createHttpError(undefined, 'KERB_TOKEN is not configured for development run mode')
          )
        )

        return
      }

      dispatch(authActions.authSuccess(createAuthUserFromToken(KERB_TOKEN)))

      return
    }

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
