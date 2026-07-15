'use client'

import type { ReactNode } from 'react'

import {
  hasPermission,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  useGetPermissionsQuery
} from '@/entities/permission'

type ServiceAccessGateProps = {
  children: ReactNode
}

export function ServiceAccessGate({ children }: ServiceAccessGateProps) {
  const { data } = useGetPermissionsQuery()
  const hasServiceAccess = hasPermission(
    data?.acl,
    PERMISSION_RESOURCES.ServiceAccess,
    PERMISSION_ACTIONS.R
  )

  return hasServiceAccess ? children : null
}
