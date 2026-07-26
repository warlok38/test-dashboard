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
  getForbiddenHref,
  getSafeForbiddenReturnPath,
  isAuthStatusPath,
  isAuthErrorPath,
  isForbiddenPath
} from '@/shared/routing'
import { ApiErrorAlert, PageShell, PageSurface } from '@/shared/ui'

import { getPermissionErrorAction } from '../lib'
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
    isLoading: isPermissionsLoading,
    refetch: refetchPermissions
  } = useGetPermissionsQuery(undefined, {
    skip: !shouldLoadPermissions
  })
  const hasServiceAccess = hasPermission(
    permissions?.acl,
    PERMISSION_RESOURCES.ServiceAccess,
    PERMISSION_ACTIONS.R
  )
  const permissionsErrorStatus = getHttpErrorStatus(permissionsError)
  const permissionErrorAction = isPermissionsError
    ? getPermissionErrorAction(isAccessErrorStatus(permissionsErrorStatus), isForbiddenPage)
    : null
  const shouldBlockProtectedContent = isInitialized && !isAuthorized && !isAuthStatusPage
  const isWaitingForPermissions = !permissions && (isPermissionsLoading || isPermissionsFetching)
  const shouldBlockPermissionsError =
    permissionErrorAction !== null && permissionErrorAction !== 'stay-forbidden'
  const shouldRedirectFromForbidden = Boolean(
    !isPermissionsError && permissions && hasServiceAccess && isForbiddenPage
  )
  const shouldRedirectToForbidden = Boolean(
    !isPermissionsError && permissions && !hasServiceAccess && !isForbiddenPage
  )
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
      if (permissionErrorAction === 'redirect-forbidden') {
        router.replace(getForbiddenHref(pathname, searchParams))
      }

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
    permissionErrorAction,
    permissionsError,
    router,
    searchParams,
    shouldRedirectFromForbidden,
    shouldRedirectToForbidden,
    shouldLoadPermissions
  ])

  if (permissionErrorAction === 'show-error') {
    return (
      <PageShell>
        <PageSurface variant="constrained" style={{ padding: 'var(--space-4)' }}>
          <ApiErrorAlert
            error={permissionsError}
            title="Не удалось проверить доступ"
            endpoint="permissions"
            onRetry={refetchPermissions}
          />
        </PageSurface>
      </PageShell>
    )
  }

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
