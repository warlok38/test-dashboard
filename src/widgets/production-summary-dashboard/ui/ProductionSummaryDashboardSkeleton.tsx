import { DownOutlined } from '@ant-design/icons'
import { Skeleton } from 'antd'

import styles from '../ProductionSummaryDashboard.module.css'

const KPI_SKELETONS = Array.from({ length: 4 }, (_, index) => index)
const DEPOSIT_SKELETONS = Array.from({ length: 2 }, (_, index) => index)
const DEPOSIT_METRIC_SKELETONS = Array.from({ length: 4 }, (_, index) => index)

type ProductionSummaryDashboardSkeletonProps = {
  showDeposits: boolean
}

export function ProductionSummaryDashboardSkeleton({
  showDeposits
}: ProductionSummaryDashboardSkeletonProps) {
  return (
    <>
      <section className={styles.stagePanel} aria-labelledby="mining-loading-title">
        <header className={styles.stageHeader}>
          <div className={styles.stageTitle}>
            <h1 id="mining-loading-title">Добыча</h1>
            <span className={styles.loadingLabel}>Загружаем</span>
          </div>
          <button type="button" className={styles.iconButton} aria-label="Свернуть добычу">
            <DownOutlined />
          </button>
        </header>
        <div className={styles.kpiGrid}>
          {KPI_SKELETONS.map((item) => (
            <article key={item} className={styles.kpiCard}>
              <Skeleton
                active
                paragraph={{ rows: 2, width: ['88%', '52%'] }}
                title={{ width: '64%' }}
              />
            </article>
          ))}
        </div>
      </section>
      {showDeposits && (
        <section className={styles.depositSection} aria-labelledby="deposits-loading-title">
          <div className={styles.depositTitleRow}>
            <h2 id="deposits-loading-title">Месторождения</h2>
            <span className={styles.loadingHint}>Подготавливаем сводку</span>
          </div>
          <div className={styles.depositGrid}>
            {DEPOSIT_SKELETONS.map((deposit) => (
              <article key={deposit} className={styles.depositCard}>
                <header className={styles.depositHeader}>
                  <Skeleton.Button
                    active
                    block
                    size="small"
                    className={styles.depositNameSkeleton}
                  />
                  <Skeleton.Button active size="small" className={styles.depositBadgeSkeleton} />
                </header>
                <div className={styles.depositMetrics}>
                  {DEPOSIT_METRIC_SKELETONS.map((metric) => (
                    <div key={metric} className={styles.depositMetric}>
                      <Skeleton
                        active
                        paragraph={{ rows: 1, width: ['44%'] }}
                        title={{ width: '72%' }}
                      />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
