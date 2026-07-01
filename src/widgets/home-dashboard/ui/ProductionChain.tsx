import classNames from 'classnames'
import Link from 'next/link'

import { type HomeDashboardChainItem } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ProductionChainProps = {
  items: HomeDashboardChainItem[]
}

export function ProductionChain({ items }: ProductionChainProps) {
  return (
    <section className={styles.panel} aria-labelledby="chain-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Цепочка</span>
          <h2 id="chain-title">Производственный поток</h2>
        </div>
      </div>
      <div className={styles.chain}>
        {items.map((item) => {
          const content = (
            <article className={classNames(styles.chainItem, styles[`status-${item.status}`])}>
              <div className={styles.chainTop}>
                <h3>{item.title}</h3>
                <strong>{item.planText}</strong>
              </div>
              <p>{item.worstMetricTitle}</p>
              <span>{item.worstMetricDeltaLabel}</span>
            </article>
          )

          if (!item.href) {
            return <div key={item.id}>{content}</div>
          }

          return (
            <Link key={item.id} href={item.href} className={styles.cardLink}>
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
