export const PERMISSION_ACTIONS = {
  R: 'R',
  C: 'C',
  W: 'W',
  D: 'D'
} as const

export const PERMISSION_RESOURCES = {
  ServiceAccess: 'serviceAccess'
} as const

export type ValueOf<T> = T[keyof T]

export type PermissionAction = ValueOf<typeof PERMISSION_ACTIONS>
export type PermissionResource = ValueOf<typeof PERMISSION_RESOURCES> | (string & {})

export type PermissionAcl = {
  [key: string]: PermissionAction
}

export type Permission = {
  acl: PermissionAcl
  user: string
}
