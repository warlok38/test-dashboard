'use client'

import { selectAuthError } from '@/shared/auth'
import { DEFAULT_ERROR_MESSAGES, HTTP_ERROR_CODES } from '@/shared/errors'
import { useAppSelector } from '@/shared/hooks'

import { ReloadPageButton } from './ReloadPageButton'

type AuthErrorContentProps = {
  className?: string
  contentClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  actionsClassName?: string
}

function getAuthErrorTitle(statusCode: string | number | undefined, message: string | undefined) {
  if (statusCode === HTTP_ERROR_CODES.ServerInternalError) {
    return `${statusCode} ${DEFAULT_ERROR_MESSAGES.ServerInternalError}`
  }

  if (statusCode === HTTP_ERROR_CODES.GatewayTimeout) {
    return `${statusCode} ${DEFAULT_ERROR_MESSAGES.GatewayTimeout}`
  }

  if (typeof statusCode === 'number') {
    return `${statusCode} ${message ?? DEFAULT_ERROR_MESSAGES.Default}`
  }

  return message ?? 'Ошибка авторизации'
}

export function AuthErrorContent({
  actionsClassName,
  className,
  contentClassName,
  descriptionClassName,
  titleClassName
}: AuthErrorContentProps) {
  const authError = useAppSelector(selectAuthError)
  const title = getAuthErrorTitle(authError?.statusCode, authError?.message)

  return (
    <section className={className}>
      <div className={contentClassName}>
        <h1 className={titleClassName}>{title}</h1>
        <p className={descriptionClassName}>
          Не удалось проверить доступ из-за ошибки сервера. Попробуйте перезагрузить страницу или
          обратитесь к администратору, если ошибка повторяется.
        </p>
        <div className={actionsClassName}>
          <ReloadPageButton />
        </div>
      </div>
    </section>
  )
}
