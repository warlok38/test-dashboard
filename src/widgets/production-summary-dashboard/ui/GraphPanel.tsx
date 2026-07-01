'use client'

import { Alert, Skeleton } from 'antd'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { type GraphQuery, useGetGraphQuery } from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'

type GraphPanelProps = {
  query: GraphQuery | undefined
}

export function GraphPanel({ query }: GraphPanelProps) {
  const {
    data = [],
    error,
    isFetching
  } = useGetGraphQuery(query as GraphQuery, {
    skip: !query
  })

  return (
    <section className={styles.graphPanel} aria-labelledby="graph-title">
      <header className={styles.graphHeader}>
        <h2 id="graph-title">График</h2>
        {query?.indicator && <span>{query.indicator}</span>}
      </header>
      {!query && <div className={styles.emptyState}>Нет показателя для графика</div>}
      {query && isFetching && <Skeleton active paragraph={{ rows: 6 }} title={false} />}
      {query && error && <Alert showIcon type="error" message="Не удалось загрузить график" />}
      {query && !isFetching && !error && data.length === 0 && (
        <div className={styles.emptyState}>Нет данных для графика</div>
      )}
      {query && !isFetching && !error && data.length > 0 && (
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="plan"
                name="План"
                stroke="#8a8a8a"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="fact"
                name="Факт"
                stroke="#ffae16"
                strokeWidth={3}
                dot={{ r: 3 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
