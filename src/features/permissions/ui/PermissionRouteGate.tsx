'use client'

import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import {
  hasPermission,
  type PermissionAction,
  type PermissionResource,
  useGetPermissionsQuery
} from '@/entities/permission'

type PermissionRouteGateProps = {
  action: PermissionAction
  children: ReactNode
  fallback?: 'not-found' | ReactNode
  resource: PermissionResource
}

export function PermissionRouteGate({
  action,
  children,
  fallback = 'not-found',
  resource
}: PermissionRouteGateProps) {
  const { data } = useGetPermissionsQuery()
  const hasAccess = hasPermission(data?.acl, resource, action)

  if (hasAccess) {
    return children
  }

  if (fallback === 'not-found') {
    notFound()
  }

  return fallback
}
