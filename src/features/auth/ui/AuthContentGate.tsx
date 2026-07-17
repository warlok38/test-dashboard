'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  hasPermission,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  useGetPermissionsQuery
} from '@/entities/permission'
import { selectAuth } from '@/shared/auth'
import { HTTP_ERROR_CODES, getHttpErrorStatus } from '@/shared/errors'
import { useAppSelector } from '@/shared/hooks'
import {
  getAuthErrorHref,
  getForbiddenHref,
  getSafeForbiddenReturnPath,
  isAuthStatusPath,
  isAuthErrorPath,
  isForbiddenPath
} from '@/shared/routing'

import { AuthLoadingIndicator } from './AuthLoadingIndicator'

type AuthContentGateProps = {
  children: ReactNode
}

export function AuthContentGate({ children }: AuthContentGateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthorized, isInitialized, isInitializing } = useAppSelector(selectAuth)
  const isAuthStatusPage = isAuthStatusPath(pathname)
  const isForbiddenPage = isForbiddenPath(pathname)
  const shouldLoadPermissions = isInitialized && isAuthorized && !isAuthErrorPath(pathname)
  const {
    data: permissions,
    error: permissionsError,
    isError: isPermissionsError,
    isFetching: isPermissionsFetching,
    isLoading: isPermissionsLoading
  } = useGetPermissionsQuery(undefined, {
    skip: !shouldLoadPermissions
  })
  const hasServiceAccess = hasPermission(
    permissions?.acl,
    PERMISSION_RESOURCES.ServiceAccess,
    PERMISSION_ACTIONS.R
  )
  const shouldBlockProtectedContent = isInitialized && !isAuthorized && !isAuthStatusPage
  const isWaitingForPermissions = !permissions && (isPermissionsLoading || isPermissionsFetching)
  const shouldBlockPermissionsError = isPermissionsError && !isForbiddenPage
  const shouldRedirectFromForbidden = Boolean(permissions && hasServiceAccess && isForbiddenPage)
  const shouldRedirectToForbidden = Boolean(permissions && !hasServiceAccess && !isForbiddenPage)
  const shouldBlockForPermissionDecision =
    shouldLoadPermissions &&
    (isWaitingForPermissions ||
      shouldBlockPermissionsError ||
      shouldRedirectFromForbidden ||
      shouldRedirectToForbidden)
  const isContentBlocked =
    !isInitialized || shouldBlockProtectedContent || shouldBlockForPermissionDecision
  const loadingText = getLoadingText(isInitialized, isInitializing)

  useEffect(() => {
    if (!shouldLoadPermissions) {
      return
    }

    if (isPermissionsError) {
      const status = getHttpErrorStatus(permissionsError)

      if (isForbiddenPage && isAccessErrorStatus(status)) {
        return
      }

      const href = isAccessErrorStatus(status)
        ? getForbiddenHref(pathname, searchParams)
        : getAuthErrorHref(pathname, searchParams)

      router.replace(href)

      return
    }

    if (shouldRedirectFromForbidden) {
      router.replace(getSafeForbiddenReturnPath(searchParams.get('from')))

      return
    }

    if (shouldRedirectToForbidden) {
      router.replace(getForbiddenHref(pathname, searchParams))
    }
  }, [
    isForbiddenPage,
    isPermissionsError,
    pathname,
    permissionsError,
    router,
    searchParams,
    shouldRedirectFromForbidden,
    shouldRedirectToForbidden,
    shouldLoadPermissions
  ])

  if (isContentBlocked) {
    return <AuthLoadingIndicator text={loadingText} />
  }

  return children
}

function isAccessErrorStatus(status: number | undefined) {
  return status === HTTP_ERROR_CODES.AccessDenied || status === HTTP_ERROR_CODES.Unauthorized
}

function getLoadingText(isInitialized: boolean, isInitializing: boolean) {
  if (isInitialized) {
    return 'Проверяем доступ...'
  }

  return isInitializing ? 'Авторизация...' : 'Загружаем интерфейс...'
}
