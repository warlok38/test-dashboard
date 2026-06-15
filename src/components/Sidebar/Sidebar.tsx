import styles from './Sidebar.module.css'

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Навигация приложения">
      <div className={styles.header}>
        <div className={styles.logoMark} aria-hidden="true">
          <span />
        </div>
        <div className={styles.brand}>
          <span className={styles.title}>COOL DASHBOARD</span>
          <span className={styles.subtitle}>Production Monitor</span>
        </div>
      </div>

      <div className={styles.body} />

      <div className={styles.footer} />
    </aside>
  )
}
