const FORBIDDEN_PATH = '/forbidden'

export function isForbiddenPath(pathname: string) {
  return pathname === FORBIDDEN_PATH || pathname.startsWith(`${FORBIDDEN_PATH}/`)
}

export function getCurrentPathWithSearch(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString()

  return query ? `${pathname}?${query}` : pathname
}

export function getForbiddenHref(pathname: string, searchParams: URLSearchParams) {
  const currentPath = getCurrentPathWithSearch(pathname, searchParams)

  if (isForbiddenPath(pathname)) {
    return FORBIDDEN_PATH
  }

  return `${FORBIDDEN_PATH}?from=${encodeURIComponent(currentPath)}`
}

export function getSafeForbiddenReturnPath(from: string | null) {
  if (!from || !from.startsWith('/') || from.startsWith('//') || isForbiddenPath(from)) {
    return '/'
  }

  return from
}
