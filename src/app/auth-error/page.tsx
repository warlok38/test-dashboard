import { AuthErrorContent } from '@/features/auth'
import { PageShell, PageSurface } from '@/shared/ui'

export default function AuthErrorPage() {
  return (
    <PageShell>
      <PageSurface variant="constrained">
        <AuthErrorContent />
      </PageSurface>
    </PageShell>
  )
}
