import classNames from 'classnames'

import { type HomeDashboardFlowStage } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ProductionFlowProps = {
  stages: HomeDashboardFlowStage[]
}

export function ProductionFlow({ stages }: ProductionFlowProps) {
  return (
    <section className={styles.panel} aria-label="Производственный поток">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Цепочка</span>
          <h2>Производственный поток</h2>
        </div>
      </div>
      <div className={styles.chain}>
        {stages.map((stage) => (
          <article
            key={stage.id}
            className={classNames(styles.chainItem, styles[`status-${stage.status}`])}
          >
            <div className={styles.chainTop}>
              <h3>{stage.title}</h3>
              <strong>{stage.deltaLabel}</strong>
            </div>
            <p>
              Факт / план
              <span>{stage.factPlanLabel}</span>
            </p>
            {stage.reasonTitle ? <p>Причина: {stage.reasonTitle}</p> : null}
          </article>
        ))}
      </div>
    </section>
  )
}
