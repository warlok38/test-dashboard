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
          <h2>События периода</h2>
        </div>
      </div>
      <div className={styles.eventList}>
        {events.map((event) => (
          <article
            key={event.id}
            className={classNames(styles.eventRow, styles[`status-${event.status}`])}
          >
            <time>{event.timeLabel}</time>
            <div>
              <h3>{event.assetTitle}</h3>
              <p>{event.title}</p>
            </div>
            <strong>{event.durationLabel}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
