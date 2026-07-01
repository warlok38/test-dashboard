import { notFound } from 'next/navigation'

import { getGtkNameBySlug } from '@/entities/production-summary'
import { ProductionSummaryDashboard } from '@/widgets'

const DEFAULT_SUMMARY_DATE = '2026-06-26'

type GtkPageProps = {
  params: {
    gtkSlug: string
  }
}

export default function GtkPage({ params }: GtkPageProps) {
  const gtkName = getGtkNameBySlug(params.gtkSlug)

  if (!gtkName) {
    notFound()
  }

  return (
    <ProductionSummaryDashboard
      query={{
        date_from: DEFAULT_SUMMARY_DATE,
        date_to: DEFAULT_SUMMARY_DATE,
        gtk: gtkName
      }}
      title={`ПРОИЗВОДСТВО · ${gtkName} · 26 июня 2026`}
      showGraph
    />
  )
}
