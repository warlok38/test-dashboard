export function formatDevPayload(payload: unknown) {
  if (payload === undefined) {
    return undefined
  }

  if (typeof payload === 'string') {
    return payload
  }

  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
}

function getErrorField(error: unknown, field: string) {
  if (!error || typeof error !== 'object' || !(field in error)) {
    return undefined
  }

  const value = (error as Record<string, unknown>)[field]

  return typeof value === 'string' ? value : undefined
}

export function isAbortLikeError(error: unknown) {
  const name = getErrorField(error, 'name')?.toLowerCase()
  const code = getErrorField(error, 'code')?.toLowerCase()
  const message = getErrorField(error, 'message')?.toLowerCase()
  const fetchError = getErrorField(error, 'error')?.toLowerCase()
  const errorText = [name, code, message, fetchError].filter(Boolean).join(' ')

  return errorText.includes('abort') || errorText.includes('cancel')
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return Boolean(
    value && typeof value === 'object' && 'then' in value && typeof value.then === 'function'
  )
}

export type ApiErrorRetryHandle = PromiseLike<unknown> & {
  abort?: (reason?: string) => void
  unwrap?: () => Promise<unknown>
}

export function isRetryHandle(value: unknown): value is ApiErrorRetryHandle {
  return isPromiseLike(value)
}

export function getRetryPromise(retryResult: ApiErrorRetryHandle) {
  if ('unwrap' in retryResult && typeof retryResult.unwrap === 'function') {
    return retryResult.unwrap()
  }

  return Promise.resolve(retryResult)
}
