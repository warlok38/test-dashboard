import type { PermissionAcl, PermissionAction, PermissionResource } from '../model'

export function hasPermission(
  acl: PermissionAcl | null | undefined,
  resource: PermissionResource,
  action: PermissionAction
) {
  return acl?.[resource] === action
}
