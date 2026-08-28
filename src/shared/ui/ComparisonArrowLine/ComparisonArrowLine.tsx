import classNames from 'classnames'

import styles from './ComparisonArrowLine.module.css'

type ComparisonArrowLineProps = {
  className?: string
  deltas: string[]
}

export function ComparisonArrowLine({ className, deltas }: ComparisonArrowLineProps) {
  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.rail}>
        <svg className={styles.line} preserveAspectRatio="none" viewBox="0 0 100 14">
          <path d="M0 4V10" />
          <path d="M0 4H98.5" />
          <path d="M50 4V10" />
          <path d="M98.5 4V9.8" />
          <path d="M98.5 12.8L95.9 9.4H101.1Z" />
        </svg>
        {deltas.map((delta, index) => (
          <span className={styles.badge} key={`${delta}-${index}`}>
            {delta}
          </span>
        ))}
      </div>
    </div>
  )
}
