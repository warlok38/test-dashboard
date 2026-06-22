import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { type DashboardMetric, type DashboardStage } from '@/entities/production-stage'

import { type DashboardRow } from '../lib'
import styles from '../IndustrialDashboardTable.module.css'
import { MetricCell } from './MetricCell'
import { StageHeaderCell } from './StageHeaderCell'

type DesktopDashboardTableProps = {
  columnWidth: number
  queryString: string
  rows: DashboardRow[]
  stages: DashboardStage[]
}

export function DesktopDashboardTable({
  columnWidth,
  queryString,
  rows,
  stages
}: DesktopDashboardTableProps) {
  const columns: ColumnsType<DashboardRow> = stages.map((stage) => ({
    key: stage.id,
    dataIndex: ['metrics', stage.id],
    title: <StageHeaderCell stage={stage} queryString={queryString} />,
    render: (metric: DashboardMetric | undefined) => (
      <MetricCell metric={metric} queryString={queryString} />
    ),
    width: columnWidth
  }))

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
