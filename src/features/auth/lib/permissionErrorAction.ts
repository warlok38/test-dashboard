export type PermissionErrorAction = 'redirect-forbidden' | 'show-error' | 'stay-forbidden'

export function getPermissionErrorAction(
  isAccessError: boolean,
  isForbiddenPage: boolean
): PermissionErrorAction {
  if (isForbiddenPage && isAccessError) {
    return 'stay-forbidden'
  }

  return isAccessError ? 'redirect-forbidden' : 'show-error'
}
