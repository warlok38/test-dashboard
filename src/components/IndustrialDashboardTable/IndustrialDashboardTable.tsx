'use client'

import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import classNames from 'classnames'

import {
  industrialDashboardStages,
  type DashboardMetric,
  type DashboardStage
} from '@/shared/mocks'
import { formatNumber, formatPercent } from '@/shared/utils/formatNumber'
import styles from './IndustrialDashboardTable.module.css'

type DashboardRow = {
  key: number
  metrics: Record<string, DashboardMetric | undefined>
}

type StagePlanProgress = {
  completed: number
  total: number
}

function getMetricStatus(metric: DashboardMetric): DashboardMetric['status'] {
  if (metric.value === null || metric.plan === null || metric.plan === 0) {
    return 'neutral'
  }

  return metric.status
}

function getStagePlanProgress(stage: DashboardStage): StagePlanProgress {
  return stage.metrics.reduce<StagePlanProgress>(
    (acc, metric) => {
      const status = getMetricStatus(metric)

      if (status === 'neutral') {
        return acc
      }

      acc.total += 1

      if (status === 'success') {
        acc.completed += 1
      }

      return acc
    },
    { completed: 0, total: 0 }
  )
}

function getPlanClassName({ completed, total }: StagePlanProgress) {
  if (total === 0) {
    return styles.planNeutral
  }

  if (completed === 0) {
    return styles.planDanger
  }

  if (completed === total) {
    return styles.planSuccess
  }

  return styles.planWarning
}

function getMetricClassName(status: DashboardMetric['status']) {
  if (status === 'success') {
    return styles.metricSuccess
  }

  if (status === 'danger') {
    return styles.metricDanger
  }

  return styles.metricNeutral
}

function formatNullableNumber(value: number | null, fractionDigits?: number) {
  if (value === null) {
    return '-'
  }

  return formatNumber(value, { fractionDigits })
}

function getMetricProgressPercent(metric: DashboardMetric, status: DashboardMetric['status']) {
  if (status === 'neutral' || metric.value === null || metric.plan === null || metric.plan <= 0) {
    return null
  }

  if (status === 'success') {
    return 100
  }

  return Math.max(0, Math.min((metric.value / metric.plan) * 100, 100))
}

function renderStageHeader(stage: DashboardStage) {
  const progress = getStagePlanProgress(stage)
  const planText = progress.total === 0 ? '0/0' : `${progress.completed}/${progress.total}`

  return (
    <div className={styles.stageHeader}>
      <span className={styles.stageTitle}>{stage.title}</span>
      <span className={classNames(styles.planBadge, getPlanClassName(progress))}>{planText}</span>
    </div>
  )
}

function renderMetric(metric?: DashboardMetric) {
  if (!metric) {
    return <div className={styles.emptyCell} aria-hidden="true" />
  }

  const status = getMetricStatus(metric)
  const progressPercent = getMetricProgressPercent(metric, status)

  return (
    <div className={classNames(styles.metricCell, getMetricClassName(status))}>
      <div className={styles.metricTitle}>{metric.title}</div>
      <div className={styles.metricValue}>
        {formatNullableNumber(metric.value, metric.valueFractionDigits)}
      </div>
      <div className={styles.metricMeta}>
        <span>План: {formatNullableNumber(metric.plan, metric.planFractionDigits)}</span>
        {metric.delta !== null && metric.delta !== 0 && (
          <span className={styles.deltaBadge}>
            {formatPercent(metric.delta, metric.deltaFractionDigits)}
          </span>
        )}
      </div>
      {progressPercent !== null && (
        <div className={styles.metricProgress} aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      )}
    </div>
  )
}

function getRows(stages: DashboardStage[]): DashboardRow[] {
  const rowCount = Math.max(...stages.map((stage) => stage.metrics.length))

  return Array.from({ length: rowCount }, (_, rowIndex) => ({
    key: rowIndex,
    metrics: stages.reduce<DashboardRow['metrics']>((acc, stage) => {
      acc[stage.id] = stage.metrics[rowIndex]

      return acc
    }, {})
  }))
}

const columns: ColumnsType<DashboardRow> = industrialDashboardStages.map((stage) => ({
  key: stage.id,
  dataIndex: ['metrics', stage.id],
  title: renderStageHeader(stage),
  render: renderMetric,
  width: 240
}))

const rows = getRows(industrialDashboardStages)

export function IndustrialDashboardTable() {
  return (
    <section className={styles.dashboard} aria-label="Сводка производственных показателей">
      <Table<DashboardRow>
        className={styles.table}
        columns={columns}
        dataSource={rows}
        pagination={false}
        bordered
        tableLayout="fixed"
        scroll={{ x: 'max-content' }}
      />
    </section>
  )
}
