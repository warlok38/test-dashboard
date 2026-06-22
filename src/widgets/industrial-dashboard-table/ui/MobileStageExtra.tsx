import { ArrowRightOutlined } from '@ant-design/icons'
import Link from 'next/link'

import { type DashboardStage } from '@/entities/production-stage'

import { getHrefWithQuery } from '../lib'
import styles from '../IndustrialDashboardTable.module.css'

type MobileStageExtraProps = {
  queryString: string
  stage: DashboardStage
}

export function MobileStageExtra({ queryString, stage }: MobileStageExtraProps) {
  if (!stage.detailRoute) {
    return null
  }

  return (
    <Link
      className={styles.mobileStageLink}
      href={getHrefWithQuery(stage.detailRoute, queryString)}
      onClick={(event) => event.stopPropagation()}
      aria-label={`Открыть страницу стадии: ${stage.title}`}
    >
      <ArrowRightOutlined />
    </Link>
  )
}
