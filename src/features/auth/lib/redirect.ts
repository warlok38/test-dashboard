const FORBIDDEN_PATH = '/forbidden'
const AUTH_ERROR_PATH = '/auth-error'

export function isForbiddenPath(pathname: string) {
  return pathname === FORBIDDEN_PATH || pathname.startsWith(`${FORBIDDEN_PATH}/`)
}

export function isAuthErrorPath(pathname: string) {
  return pathname === AUTH_ERROR_PATH || pathname.startsWith(`${AUTH_ERROR_PATH}/`)
}

export function isAuthStatusPath(pathname: string) {
  return isForbiddenPath(pathname) || isAuthErrorPath(pathname)
}

export function getCurrentPathWithSearch(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString()

  return query ? `${pathname}?${query}` : pathname
}

function getAuthStatusHref(targetPath: string, pathname: string, searchParams: URLSearchParams) {
  const currentPath = getCurrentPathWithSearch(pathname, searchParams)

  if (isAuthStatusPath(pathname) || currentPath === '/') {
    return targetPath
  }

  return `${targetPath}?from=${encodeURIComponent(currentPath)}`
}

export function getForbiddenHref(pathname: string, searchParams: URLSearchParams) {
  return getAuthStatusHref(FORBIDDEN_PATH, pathname, searchParams)
}

export function getAuthErrorHref(pathname: string, searchParams: URLSearchParams) {
  return getAuthStatusHref(AUTH_ERROR_PATH, pathname, searchParams)
}

export function getSafeForbiddenReturnPath(from: string | null) {
  if (!from || !from.startsWith('/') || from.startsWith('//') || isAuthStatusPath(from)) {
    return '/'
  }

  return from
}
