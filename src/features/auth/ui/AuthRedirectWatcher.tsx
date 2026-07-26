'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { selectAuth } from '@/shared/auth'
import { HTTP_ERROR_CODES } from '@/shared/errors'
import { useAppSelector } from '@/shared/hooks'

import {
  getAuthErrorHref,
  getForbiddenHref,
  getSafeForbiddenReturnPath,
  isAuthErrorPath,
  isForbiddenPath
} from '@/shared/routing'

export function AuthRedirectWatcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { authError, isAuthorized, isInitialized } = useAppSelector(selectAuth)

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (isAuthorized) {
      const shouldLeaveAuthErrorPage = isAuthErrorPath(pathname)

      if (shouldLeaveAuthErrorPage) {
        router.replace(getSafeForbiddenReturnPath(searchParams.get('from')))
      }

      return
    }

    const authErrorStatus =
      typeof authError?.statusCode === 'number' ? authError.statusCode : undefined
    const isAccessError =
      authErrorStatus === HTTP_ERROR_CODES.Unauthorized ||
      authErrorStatus === HTTP_ERROR_CODES.AccessDenied
    const isAuthStatusPage = isForbiddenPath(pathname) || isAuthErrorPath(pathname)
    const targetHref = isAccessError
      ? getForbiddenHref(pathname, searchParams)
      : getAuthErrorHref(pathname, searchParams)
    const isAlreadyOnTargetStatusPage = isAccessError
      ? isForbiddenPath(pathname)
      : isAuthErrorPath(pathname)

    if (isAuthStatusPage) {
      if (!isAlreadyOnTargetStatusPage) {
        router.replace(targetHref)
      }

      return
    }

    router.replace(targetHref)
  }, [authError, isAuthorized, isInitialized, pathname, router, searchParams])

  return null
}
