import { Alert, type AlertProps } from 'antd'

import { getErrorMessage } from '@/shared/errors'

type ApiErrorAlertProps = {
  error: unknown
  title: string
  type?: AlertProps['type']
}

export function ApiErrorAlert({ error, title, type = 'error' }: ApiErrorAlertProps) {
  const description = getErrorMessage(error)

  return <Alert showIcon type={type} message={title} description={description} />
}
