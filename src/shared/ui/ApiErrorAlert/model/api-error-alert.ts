import { useEffect, useRef, useState, type ReactNode } from 'react'

import { getErrorMessage, getHttpErrorStatus } from '@/shared/errors'

import {
  formatDevPayload,
  getRetryPromise,
  isAbortLikeError,
  isRetryHandle,
  type ApiErrorRetryHandle
} from '../lib/api-error-alert'

export type ApiErrorRetryResult = void | PromiseLike<unknown> | ApiErrorRetryHandle

export type ApiErrorAlertProps = {
  error: unknown
  title?: ReactNode
  description?: ReactNode
  onRetry?: () => ApiErrorRetryResult
  retryText?: string
  endpointPath?: string
}

type UseApiErrorAlertParams = Pick<ApiErrorAlertProps, 'endpointPath' | 'error' | 'onRetry'>

export function useApiErrorAlert({ endpointPath, error, onRetry }: UseApiErrorAlertParams) {
  const [displayError, setDisplayError] = useState(error)
  const [isDevModalOpen, setIsDevModalOpen] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isRetryFailed, setIsRetryFailed] = useState(false)
  const retryResultRef = useRef<ApiErrorRetryHandle | null>(null)
  const retryRequestIdRef = useRef(0)
  const isRetryAbortRequestedRef = useRef(false)
  const message = getErrorMessage(displayError)
  const displayedEndpointPath = endpointPath ?? 'Неизвестно'
  const statusCode = getHttpErrorStatus(error)
  const devPayload = formatDevPayload(error)
  const canAbortRetry = Boolean(retryResultRef.current?.abort)

  useEffect(() => {
    if (!isAbortLikeError(error)) {
      setDisplayError(error)
    }
  }, [error])

  const handleRetry = () => {
    if (!onRetry) {
      return
    }

    if (isRetrying) {
      const abortRetry = retryResultRef.current?.abort

      if (abortRetry) {
        isRetryAbortRequestedRef.current = true
        abortRetry('Retry cancelled by user')
        retryResultRef.current = null
        setIsRetrying(false)
      }

      return
    }

    let retryResult: ApiErrorRetryResult

    try {
      retryResult = onRetry()
    } catch {
      setIsRetryFailed(true)
      return
    }

    if (!isRetryHandle(retryResult)) {
      return
    }

    const retryPromise = getRetryPromise(retryResult)
    const retryRequestId = retryRequestIdRef.current + 1

    retryRequestIdRef.current = retryRequestId
    retryResultRef.current = retryResult
    isRetryAbortRequestedRef.current = false
    setIsRetryFailed(false)
    setIsRetrying(true)

    retryPromise
      .catch(() => {
        if (!isRetryAbortRequestedRef.current) {
          setIsRetryFailed(true)
        }
      })
      .finally(() => {
        if (retryRequestIdRef.current === retryRequestId) {
          retryResultRef.current = null
          setIsRetrying(false)
        }
      })
  }

  const handleRetryAnimationEnd = () => {
    setIsRetryFailed(false)
  }

  return {
    canAbortRetry,
    devPayload,
    endpointPath: displayedEndpointPath,
    handleRetry,
    handleRetryAnimationEnd,
    isDevModalOpen,
    isRetryFailed,
    isRetrying,
    message,
    openDevModal: () => setIsDevModalOpen(true),
    closeDevModal: () => setIsDevModalOpen(false),
    statusCode
  }
}
