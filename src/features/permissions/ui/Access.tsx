'use client'

import type { ReactNode } from 'react'

import type { PermissionAction, PermissionResource } from '@/entities/permission'

import { usePermission } from '../model'

type AccessProps = {
  action: PermissionAction
  children: ReactNode
  fallback?: ReactNode
  resource: PermissionResource
}

export function Access({ action, children, fallback = null, resource }: AccessProps) {
  const hasAccess = usePermission(resource, action)

  return hasAccess ? children : fallback
}
