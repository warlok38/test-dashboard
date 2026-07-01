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
          <h2>Активы / месторождения</h2>
        </div>
      </div>
      <div className={styles.assetTable} role="table" aria-label="Показатели по активам">
        <div className={styles.assetTableHead} role="row">
          <span role="columnheader">Актив</span>
          <span role="columnheader">Статус</span>
          <span role="columnheader">Золото</span>
          <span role="columnheader">Руда добыта</span>
          <span role="columnheader">Руда переработана</span>
          <span role="columnheader">Извлечение</span>
          <span role="columnheader">Причина</span>
          <span role="columnheader">Вклад</span>
        </div>
        {assets.map((asset) => (
          <div key={asset.id} className={styles.assetTableRow} role="row">
            <strong role="cell">{asset.title}</strong>
            <span
              role="cell"
              className={classNames(styles.statusPill, styles[`status-${asset.status}`])}
            >
              {getStatusLabel(asset.status)}
            </span>
            <span role="cell">{asset.goldLabel}</span>
            <span role="cell">{asset.oreMinedLabel}</span>
            <span role="cell">{asset.oreProcessedLabel}</span>
            <span role="cell">{asset.recoveryLabel}</span>
            <span role="cell">{asset.primaryReasonTitle}</span>
            <span role="cell">{asset.contributionLabel}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function getStatusLabel(status: HomeDashboardAsset['status']) {
  const statusLabels: Record<HomeDashboardAsset['status'], string> = {
    danger: 'Критично',
    neutral: 'Нет данных',
    success: 'В норме',
    warning: 'Отклонение'
  }

  return statusLabels[status]
}
