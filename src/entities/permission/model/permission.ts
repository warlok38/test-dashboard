import type { ValueOf } from '@/shared/types'

import type { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from './permission.constants'

export type PermissionAction = ValueOf<typeof PERMISSION_ACTIONS>
export type PermissionResource = ValueOf<typeof PERMISSION_RESOURCES> | (string & {})

export type PermissionAcl = {
  [key: string]: PermissionAction
}

export type Permission = {
  acl: PermissionAcl
  user: string
}
