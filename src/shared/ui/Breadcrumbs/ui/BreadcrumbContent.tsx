import { type BreadcrumbItem } from '../Breadcrumbs'
import styles from '../Breadcrumbs.module.css'

type BreadcrumbContentProps = {
  item: BreadcrumbItem
}

export function BreadcrumbContent({ item }: BreadcrumbContentProps) {
  return (
    <span className={styles.content}>
      {/* {item.icon && <span className={styles.icon}>{item.icon}</span>} */}
      <span className={styles.label}>{item.label}</span>
    </span>
  )
}
