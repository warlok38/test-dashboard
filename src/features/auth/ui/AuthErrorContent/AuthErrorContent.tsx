'use client'

import { selectAuthError } from '@/shared/auth'
import { DEFAULT_ERROR_MESSAGES, HTTP_ERROR_CODES } from '@/shared/errors'
import { useAppSelector } from '@/shared/hooks'

import { ReloadPageButton } from '../ReloadPageButton'
import styles from './AuthErrorContent.module.css'

export function AuthErrorContent() {
  const authError = useAppSelector(selectAuthError)
  const title = getAuthErrorTitle(authError?.statusCode, authError?.message)

  return (
    <section className={styles.authError}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>
          Не удалось проверить доступ из-за ошибки сервера. Попробуйте перезагрузить страницу или
          обратитесь к администратору, если ошибка повторяется.
        </p>
        <div className={styles.actions}>
          <ReloadPageButton />
        </div>
      </div>
    </section>
  )
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
