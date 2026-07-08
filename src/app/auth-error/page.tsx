import { AuthErrorContent } from '@/features/auth/ui/AuthErrorContent'
import { PageShell, PageSurface } from '@/shared/ui'

import styles from './page.module.css'

export default function AuthErrorPage() {
  return (
    <PageShell>
      <PageSurface variant="constrained">
        <AuthErrorContent
          className={styles.authError}
          contentClassName={styles.content}
          titleClassName={styles.title}
          descriptionClassName={styles.description}
          actionsClassName={styles.actions}
        />
      </PageSurface>
    </PageShell>
  )
}
