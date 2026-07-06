'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { selectAuth } from '@/entities/auth'
import { useAppSelector } from '@/shared/store'

import { getForbiddenHref, getSafeForbiddenReturnPath, isForbiddenPath } from '../lib/redirect'

export function AuthRedirectWatcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthorized, isInitialized } = useAppSelector(selectAuth)

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (isForbiddenPath(pathname)) {
      if (isAuthorized) {
        router.replace(getSafeForbiddenReturnPath(searchParams.get('from')))
      }

      return
    }

    if (!isAuthorized) {
      router.replace(getForbiddenHref(pathname, searchParams))
    }
  }, [isAuthorized, isInitialized, pathname, router, searchParams])

  return null
}
