import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { DEFAULT_ERROR_MESSAGES } from '../consts'
import { HttpErrorType } from '../types'
import { createErrorFromRtkError } from './createErrorFromRtkError'
import { createHttpError } from './createHttpError'

function isFetchBaseQueryErrorLike(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

function isHttpErrorLike(error: unknown): error is HttpErrorType {
  return typeof error === 'object' && error !== null && 'statusCode' in error && 'message' in error
}

export function createErrorFromUnknown(error: unknown): HttpErrorType {
  if (isHttpErrorLike(error)) {
    return error
  }

  if (isFetchBaseQueryErrorLike(error)) {
    return createErrorFromRtkError(error)
  }

  if (error instanceof Error) {
    return createHttpError(undefined, error.message, undefined, error.stack)
  }

  return createHttpError(undefined, DEFAULT_ERROR_MESSAGES.Default)
}
