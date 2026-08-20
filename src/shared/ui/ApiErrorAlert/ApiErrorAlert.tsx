'use client'

import {
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { Button, Modal, theme } from 'antd'
import classNames from 'classnames'

import { useApiErrorAlert, type ApiErrorAlertProps } from './model/api-error-alert'

import styles from './ApiErrorAlert.module.css'

export type { ApiErrorAlertProps } from './model/api-error-alert'

export function ApiErrorAlert({
  error,
  title,
  description,
  onRetry,
  retryText = 'Повторить запрос',
  endpointPath
}: ApiErrorAlertProps) {
  const { token } = theme.useToken()
  const {
    canAbortRetry,
    closeDevModal,
    devPayload,
    endpointPath: displayedEndpointPath,
    handleRetry,
    handleRetryAnimationEnd,
    isDevModalOpen,
    isRetryFailed,
    isRetrying,
    message,
    openDevModal,
    statusCode
  } = useApiErrorAlert({ endpointPath, error, onRetry })

  return (
    <div className={styles.root}>
      <CloseCircleFilled className={styles.icon} style={{ color: token.colorError }} />
      <div className={styles.content}>
        <div className={styles.title}>{title ?? message}</div>
        {description ? <div className={styles.description}>{description}</div> : null}
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.actionButton}
          icon={<ExclamationCircleOutlined />}
          size="small"
          type="text"
          title="Инфо для разработчика"
          onClick={openDevModal}
        />
        {onRetry ? (
          <Button
            className={classNames(styles.actionButton, {
              [styles.retryButton]: isRetrying,
              [styles.retryButtonAbortable]: isRetrying && canAbortRetry,
              [styles.retryButtonFailed]: isRetryFailed
            })}
            icon={
              isRetrying ? (
                <span className={styles.retryIconWrap}>
                  <LoadingOutlined className={styles.retryLoadingIcon} />
                  <CloseOutlined className={styles.retryAbortIcon} />
                </span>
              ) : (
                <ReloadOutlined />
              )
            }
            size="small"
            type="text"
            title={isRetrying && canAbortRetry ? 'Прервать выполнение запроса' : retryText}
            onAnimationEnd={handleRetryAnimationEnd}
            onClick={handleRetry}
          />
        ) : null}
      </div>
      <Modal
        title="Технические детали ошибки"
        open={isDevModalOpen}
        destroyOnHidden
        footer={null}
        centered
        onCancel={closeDevModal}
      >
        <dl className={styles.devDetails}>
          {statusCode !== undefined ? (
            <>
              <dt>Код ошибки</dt>
              <dd>{statusCode}</dd>
            </>
          ) : null}
          <dt>Endpoint</dt>
          <dd>{displayedEndpointPath}</dd>
          {devPayload ? (
            <>
              <dt>Payload</dt>
              <dd>
                <pre className={styles.devPayload}>{devPayload}</pre>
              </dd>
            </>
          ) : null}
        </dl>
      </Modal>
    </div>
  )
}
