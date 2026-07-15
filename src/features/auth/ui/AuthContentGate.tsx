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
import { HTTP_ERROR_CODES } from '@/shared/errors'
import { useAppSelector } from '@/shared/hooks'
import { getAuthErrorHref, getForbiddenHref } from '@/shared/routing'

import { isAuthStatusPath } from '../lib/redirect'
import { AuthLoadingIndicator } from './AuthLoadingIndicator'

type AuthContentGateProps = {
  children: ReactNode
}

function getRtkErrorStatus(error: unknown) {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status?: unknown }).status
  }

  return undefined
}

function getLoadingText(isInitialized: boolean, isInitializing: boolean) {
  if (isInitialized) {
    return 'Проверяем доступ...'
  }

  return isInitializing ? 'Авторизация...' : 'Загружаем интерфейс...'
}

export function AuthContentGate({ children }: AuthContentGateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthorized, isInitialized, isInitializing } = useAppSelector(selectAuth)
  const isAuthStatusPage = isAuthStatusPath(pathname)
  const shouldLoadPermissions = isInitialized && isAuthorized && !isAuthStatusPage
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
  const shouldCheckPermissions =
    shouldLoadPermissions &&
    ((!permissions && (isPermissionsLoading || isPermissionsFetching)) ||
      isPermissionsError ||
      !hasServiceAccess)
  const isContentBlocked = !isInitialized || shouldBlockProtectedContent || shouldCheckPermissions
  const loadingText = getLoadingText(isInitialized, isInitializing)

  useEffect(() => {
    if (!shouldLoadPermissions) {
      return
    }

    if (isPermissionsError) {
      const status = getRtkErrorStatus(permissionsError)
      const href =
        status === HTTP_ERROR_CODES.AccessDenied || status === HTTP_ERROR_CODES.Unauthorized
          ? getForbiddenHref(pathname, searchParams)
          : getAuthErrorHref(pathname, searchParams)

      router.replace(href)

      return
    }

    if (permissions && !hasServiceAccess) {
      router.replace(getForbiddenHref(pathname, searchParams))
    }
  }, [
    hasServiceAccess,
    isPermissionsError,
    pathname,
    permissions,
    permissionsError,
    router,
    searchParams,
    shouldLoadPermissions
  ])

  if (isContentBlocked) {
    return <AuthLoadingIndicator text={loadingText} />
  }

  return children
}
