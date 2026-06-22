import { DownOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'

import { getMenuItems } from '../lib'
import styles from '../Breadcrumbs.module.css'
import { type BreadcrumbItem } from '../Breadcrumbs'
import { BreadcrumbContent } from './BreadcrumbContent'

const MOBILE_HISTORY_LABEL = '...'

type MobileBreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export function MobileBreadcrumbs({ items }: MobileBreadcrumbsProps) {
  const currentBreadcrumb = items[items.length - 1]
  const historyBreadcrumbs = items.slice(0, -1)

  return (
    <nav className={styles.mobileBreadcrumbs} aria-label="breadcrumb">
      {historyBreadcrumbs.length > 0 && (
        <>
          <Dropdown
            menu={{ items: getMenuItems(historyBreadcrumbs) }}
            placement="bottomLeft"
            trigger={['click']}
            classNames={{ root: styles.mobileHistoryDropdown }}
          >
            <button
              className={styles.mobileHistoryButton}
              type="button"
              aria-label="Открыть предыдущие разделы"
            >
              <span>{MOBILE_HISTORY_LABEL}</span>
              <DownOutlined />
            </button>
          </Dropdown>
          <span className={styles.mobileSeparator} aria-hidden="true">
            /
          </span>
        </>
      )}
      {currentBreadcrumb && (
        <span className={styles.current} aria-current="page">
          <BreadcrumbContent item={currentBreadcrumb} />
        </span>
      )}
    </nav>
  )
}
