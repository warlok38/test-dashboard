import { ProductionSummaryDashboard } from '@/widgets'

const DEFAULT_SUMMARY_DATE = '2026-06-26'

export default function Home() {
  return (
    <ProductionSummaryDashboard
      query={{
        date_from: DEFAULT_SUMMARY_DATE,
        date_to: DEFAULT_SUMMARY_DATE
      }}
    />
  )
}
