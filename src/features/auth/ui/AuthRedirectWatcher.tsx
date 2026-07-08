'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { selectAuth } from '@/entities/auth'
import { HTTP_ERROR_CODES } from '@/shared/errors'
import { useAppSelector } from '@/shared/store'

import {
  getAuthErrorHref,
  getForbiddenHref,
  getSafeForbiddenReturnPath,
  isAuthErrorPath,
  isForbiddenPath
} from '../lib/redirect'

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
      if (isForbiddenPath(pathname) || isAuthErrorPath(pathname)) {
        router.replace(getSafeForbiddenReturnPath(searchParams.get('from')))
      }

      return
    }

    const authErrorStatus =
      typeof authError?.statusCode === 'number' ? authError.statusCode : undefined
    const isAccessError =
      authErrorStatus === HTTP_ERROR_CODES.Unauthorized ||
      authErrorStatus === HTTP_ERROR_CODES.AccessDenied
    const targetHref = isAccessError
      ? getForbiddenHref(pathname, searchParams)
      : getAuthErrorHref(pathname, searchParams)
    const isTargetPath = isAccessError ? isForbiddenPath(pathname) : isAuthErrorPath(pathname)

    if (isForbiddenPath(pathname) || isAuthErrorPath(pathname)) {
      if (!isTargetPath) {
        router.replace(targetHref)
      }

      return
    }

    router.replace(targetHref)
  }, [authError, isAuthorized, isInitialized, pathname, router, searchParams])

  return null
}
