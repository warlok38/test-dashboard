import classNames from 'classnames'

import { type HomeDashboardAsset } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type AssetPerformanceTableProps = {
  assets: HomeDashboardAsset[]
}

export function AssetPerformanceTable({ assets }: AssetPerformanceTableProps) {
  return (
    <section className={styles.panel} aria-label="Показатели активов">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Активы</span>
          <h2>Вклад по активам</h2>
        </div>
      </div>
      <div className={styles.businessGrid}>
        {assets.map((asset) => (
          <article
            key={asset.id}
            className={classNames(styles.businessCard, styles[`status-${asset.status}`])}
          >
            <div className={styles.businessHeader}>
              <h3>{asset.title}</h3>
              <strong>{asset.contributionLabel}</strong>
            </div>
            <b>{asset.primaryReasonTitle}</b>
            <dl>
              <div>
                <dt>Золото</dt>
                <dd>{asset.goldLabel}</dd>
              </div>
              <div>
                <dt>Добыча</dt>
                <dd>{asset.oreMinedLabel}</dd>
              </div>
              <div>
                <dt>Переработка</dt>
                <dd>{asset.oreProcessedLabel}</dd>
              </div>
              <div>
                <dt>Извлечение</dt>
                <dd>{asset.recoveryLabel}</dd>
              </div>
              <div>
                <dt>Вклад</dt>
                <dd>{asset.contributionPercent}%</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
