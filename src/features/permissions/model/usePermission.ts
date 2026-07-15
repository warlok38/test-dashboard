'use client'

import {
  hasPermission,
  type PermissionAction,
  type PermissionResource,
  useGetPermissionsQuery
} from '@/entities/permission'

export function usePermission(resource: PermissionResource, action: PermissionAction) {
  const { data } = useGetPermissionsQuery()

  return hasPermission(data?.acl, resource, action)
}
