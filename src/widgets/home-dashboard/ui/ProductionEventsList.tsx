import classNames from 'classnames'

import { type HomeDashboardEvent } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ProductionEventsListProps = {
  events: HomeDashboardEvent[]
}

export function ProductionEventsList({ events }: ProductionEventsListProps) {
  return (
    <section className={styles.panel} aria-label="Производственные события">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>События</span>
          <h2>Последние события</h2>
        </div>
      </div>
      <div className={styles.attentionList}>
        {events.map((event) => (
          <article
            key={event.id}
            className={classNames(styles.attentionCard, styles[`status-${event.status}`])}
          >
            <div className={styles.attentionHeader}>
              <div>
                <span>
                  {event.timeLabel} · {event.assetTitle}
                </span>
                <h3>{event.title}</h3>
              </div>
              <strong>{event.durationLabel}</strong>
            </div>
            <div className={styles.attentionFooter}>
              <p>
                {event.linkedDeviationId ? 'Связано с отклонением' : 'Без связанного отклонения'}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
