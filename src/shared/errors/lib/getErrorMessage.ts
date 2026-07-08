import { DEFAULT_ERROR_MESSAGES } from '../consts'
import { createErrorFromUnknown } from './createErrorFromUnknown'

export function getErrorMessage(error: unknown, fallback: string = DEFAULT_ERROR_MESSAGES.Default) {
  const { message } = createErrorFromUnknown(error)

  if (!message || message === DEFAULT_ERROR_MESSAGES.Default) {
    return fallback
  }

  return message
}
