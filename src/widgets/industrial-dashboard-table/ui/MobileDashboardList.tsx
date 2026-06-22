import { Collapse } from 'antd'
import type { CollapseProps } from 'antd'

import { type DashboardStage } from '@/entities/production-stage'

import styles from '../IndustrialDashboardTable.module.css'
import { MobileMetric } from './MobileMetric'
import { MobileStageExtra } from './MobileStageExtra'
import { MobileStageLabel } from './MobileStageLabel'

type MobileDashboardListProps = {
  defaultActiveKeys: string[]
  queryString: string
  stages: DashboardStage[]
}

export function MobileDashboardList({
  defaultActiveKeys,
  queryString,
  stages
}: MobileDashboardListProps) {
  const items: CollapseProps['items'] = stages.map((stage) => ({
    key: stage.id,
    label: <MobileStageLabel stage={stage} />,
    extra: <MobileStageExtra stage={stage} queryString={queryString} />,
    children: (
      <div className={styles.mobileMetricList}>
        {stage.metrics.map((metric) => (
          <div key={metric.id}>
            <MobileMetric metric={metric} queryString={queryString} />
          </div>
        ))}
      </div>
    )
  }))

  return (
    <section className={styles.mobileDashboard} aria-label="Сводка производственных показателей">
      <Collapse
        className={styles.mobileStageList}
        items={items}
        defaultActiveKey={defaultActiveKeys}
        bordered={false}
      />
    </section>
  )
}
