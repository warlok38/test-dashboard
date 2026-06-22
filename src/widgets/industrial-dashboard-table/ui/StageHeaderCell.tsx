import classNames from 'classnames'
import Link from 'next/link'

import { type DashboardStage } from '@/entities/production-stage'

import { getHrefWithQuery, getStagePlanProgress } from '../lib'
import styles from '../IndustrialDashboardTable.module.css'
import { getPlanClassName } from './classNames'

type StageHeaderCellProps = {
  stage: DashboardStage
  queryString: string
}

export function StageHeaderCell({ stage, queryString }: StageHeaderCellProps) {
  const progress = getStagePlanProgress(stage)
  const planText = progress.total === 0 ? '0/0' : `${progress.completed}/${progress.total}`
  const content = (
    <>
      <span className={styles.stageTitle}>{stage.title}</span>
      <span className={classNames(styles.planBadge, getPlanClassName(progress))}>{planText}</span>
    </>
  )

  if (!stage.detailRoute) {
    return <div className={styles.stageHeader}>{content}</div>
  }

  return (
    <Link
      className={classNames(styles.stageHeader, styles.stageHeaderLink)}
      href={getHrefWithQuery(stage.detailRoute, queryString)}
      aria-label={`Открыть страницу стадии: ${stage.title}`}
    >
      {content}
    </Link>
  )
}
