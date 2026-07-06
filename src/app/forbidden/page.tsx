import { PageShell, PageSurface } from '@/shared/ui'

import styles from './page.module.css'

export default function ForbiddenPage() {
  return (
    <PageShell>
      <PageSurface variant="constrained">
        <section className={styles.forbidden}>
          <div className={styles.content}>
            <h1 className={styles.title}>Нет доступа</h1>
            <p className={styles.description}>
              Не удалось подтвердить авторизацию. Обновите страницу или обратитесь к администратору,
              если доступ должен быть открыт.
            </p>
          </div>
        </section>
      </PageSurface>
    </PageShell>
  )
}
