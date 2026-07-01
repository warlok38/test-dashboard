# GTK Summary Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Figma-matched planning dashboard with `/gtk`, `/summary`, `/graph`, sidebar-based GTK navigation, all-mode home page, and short GTK detail routes.

**Architecture:** Add a focused `production-summary` entity for new backend contracts and mapping helpers. Rework the app shell/sidebar/header/footer to match the Figma frame, then compose one shared dashboard widget used by `/` and short GTK routes. Keep route files thin and keep data transforms in entity helpers, not UI components.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Redux Toolkit Query, Ant Design v6, Recharts, CSS Modules, existing FSD-style project structure.

---

## Source Spec

Spec: `docs/superpowers/specs/2026-07-01-home-dashboard-redesign-design.md`

Figma: file `rOZ3WvbM5SnMVfqylOZPY8`, node `492:2285`

Branch: `feat/gtk-summary-dashboard`

## Scope Check

The spec covers one cohesive feature: the new planning dashboard shell, home page, GTK detail route, and data contracts. The work can be implemented as one plan because each task builds toward one user-visible route family and shares the same `production-summary` entity.

## File Structure

Create:

- `src/entities/production-summary/model/types.ts` - backend contract types and view model types.
- `src/entities/production-summary/model/gtk.ts` - temporary GTK name/slug dictionaries.
- `src/entities/production-summary/api/productionSummaryApi.ts` - RTK Query endpoints for `/gtk`, `/summary`, `/graph`.
- `src/entities/production-summary/lib/summary.ts` - mining stage lookup, KPI health counts, GTK grouping.
- `src/entities/production-summary/lib/format.ts` - numeric/date/deviation formatting.
- `src/entities/production-summary/lib/index.ts` - helper barrel.
- `src/entities/production-summary/index.ts` - public entity API.
- `src/shared/mocks/production-summary/summary.ts` - mock summary response.
- `src/shared/mocks/production-summary/graph.ts` - mock graph response.
- `src/shared/mocks/production-summary/gtk.ts` - mock GTK names.
- `src/widgets/app-footer/AppFooter.tsx` - bottom footer from Figma.
- `src/widgets/app-footer/AppFooter.module.css` - footer styles.
- `src/widgets/app-footer/index.ts` - footer export.
- `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.tsx` - shared dashboard composition.
- `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.module.css` - dashboard layout styles.
- `src/widgets/production-summary-dashboard/ui/CollapsibleStagePanel.tsx` - stage panel shell.
- `src/widgets/production-summary-dashboard/ui/DepositGrid.tsx` - home deposits grid.
- `src/widgets/production-summary-dashboard/ui/GraphPanel.tsx` - detail graph panel.
- `src/widgets/production-summary-dashboard/ui/KpiCard.tsx` - KPI card.
- `src/widgets/production-summary-dashboard/ui/StaticStagePanel.tsx` - static "widget in progress" panels.
- `src/widgets/production-summary-dashboard/ui/index.ts` - widget UI barrel.
- `src/widgets/production-summary-dashboard/index.ts` - public widget export.
- `src/app/[gtkSlug]/page.tsx` - short GTK detail route.

Modify:

- `src/shared/api/routes.ts` - add `/gtk`, `/summary`, `/graph`.
- `src/shared/api/tagTypes.ts` - add summary tags.
- `src/shared/mocks/api/mockBaseQuery.ts` - add mock handlers for new routes.
- `src/entities/index.ts` - export `production-summary`.
- `src/widgets/index.ts` - export `app-footer` and `production-summary-dashboard`.
- `src/widgets/app-layout/Layout.tsx` - include footer and Figma shell structure.
- `src/widgets/app-layout/Layout.module.css` - match fixed topbar/sidebar/main/footer layout.
- `src/widgets/header/Header.tsx` - Figma topbar brand and greeting.
- `src/widgets/header/Header.module.css` - Figma topbar styles.
- `src/widgets/sidebar/Sidebar.tsx` - date block and dynamic GTK nav.
- `src/widgets/sidebar/sidebarConfig.ts` - replace old production menu with home/settings constants and dynamic helpers.
- `src/widgets/sidebar/Sidebar.module.css` - Figma sidebar spacing/colors/states.
- `src/app/page.tsx` - render home dashboard.
- `src/app/page.module.css` - remove obsolete home-page styles or leave empty.

Do not modify:

- Existing `/production-stages` routes except indirectly through shared layout.
- Existing `production-stage` entity behavior.
- `DATA_SOURCE` setting unless specifically testing mocks.

---

### Task 1: Add Production Summary Entity Types and GTK Mapper

**Files:**

- Create: `src/entities/production-summary/model/types.ts`
- Create: `src/entities/production-summary/model/gtk.ts`
- Create: `src/entities/production-summary/index.ts`
- Modify: `src/entities/index.ts`

- [ ] **Step 1: Create contract and view model types**

Create `src/entities/production-summary/model/types.ts`:

```ts
export type SummarySeverity = 'critical' | 'warning' | 'info' | string

export type GtkName = string

export type GtkSlug = 'olimpiada' | 'blagodatnoe' | 'natalka' | 'kuranah' | 'suhoy-log'

export type SummaryQuery = {
  date_from: string
  date_to: string
  gtk?: string
}

export type SummaryIndicatorDetail = {
  gtk_or_zif: string
  plan_value: number
  fact_value: number
  deviation_pct: number
  severity: SummarySeverity
}

export type SummaryIndicatorCard = {
  indicator_name: string
  plan_value: number
  fact_value: number
  deviation_pct: number
  severity: SummarySeverity
  measure_unit: string
  details: SummaryIndicatorDetail[]
}

export type StageSummary = {
  display_name: string
  critical: number
  warning: number
  info: number
  cards: SummaryIndicatorCard[]
}

export type AlarmSummaryResponse = {
  production_date_from: string
  production_date_to: string
  shift: number
  total_critical: number
  total_warning: number
  total_incidents: number
  by_stage: Record<string, StageSummary>
}

export type GraphQuery = {
  indicator: string
  date?: string
  date_from?: string
  date_to?: string
  gtk: string
}

export type GraphPoint = {
  date: string
  fact: number | null
  plan: number | null
}

export type DepositMetricView = {
  id: string
  title: string
  unit: string
  factValue: number
  planValue: number
  deviationPct: number
  severity: SummarySeverity
}

export type DepositSummaryView = {
  name: string
  slug?: GtkSlug
  href?: string
  status: SummarySeverity
  statusLabel: string
  metrics: DepositMetricView[]
}
```

- [ ] **Step 2: Add temporary GTK mapper**

Create `src/entities/production-summary/model/gtk.ts`:

```ts
import { type GtkSlug } from './types'

export const GTK_SLUG_BY_NAME = {
  Олимпиада: 'olimpiada',
  Благодатное: 'blagodatnoe',
  Наталка: 'natalka',
  Куранах: 'kuranah',
  'Сухой Лог': 'suhoy-log'
} as const satisfies Record<string, GtkSlug>

export const GTK_NAME_BY_SLUG = {
  olimpiada: 'Олимпиада',
  blagodatnoe: 'Благодатное',
  natalka: 'Наталка',
  kuranah: 'Куранах',
  'suhoy-log': 'Сухой Лог'
} as const satisfies Record<GtkSlug, keyof typeof GTK_SLUG_BY_NAME>

export function getGtkSlugByName(name: string): GtkSlug | undefined {
  return GTK_SLUG_BY_NAME[name as keyof typeof GTK_SLUG_BY_NAME]
}

export function getGtkNameBySlug(slug: string): string | undefined {
  return GTK_NAME_BY_SLUG[slug as GtkSlug]
}

export function getGtkHrefByName(name: string): string | undefined {
  const slug = getGtkSlugByName(name)

  return slug ? `/${slug}` : undefined
}

export function isKnownGtkSlug(slug: string): slug is GtkSlug {
  return slug in GTK_NAME_BY_SLUG
}
```

- [ ] **Step 3: Export the entity**

Create `src/entities/production-summary/index.ts`:

```ts
export {
  getGtkHrefByName,
  getGtkNameBySlug,
  getGtkSlugByName,
  GTK_NAME_BY_SLUG,
  GTK_SLUG_BY_NAME,
  isKnownGtkSlug
} from './model/gtk'
export type {
  AlarmSummaryResponse,
  DepositMetricView,
  DepositSummaryView,
  GraphPoint,
  GraphQuery,
  GtkName,
  GtkSlug,
  StageSummary,
  SummaryIndicatorCard,
  SummaryIndicatorDetail,
  SummaryQuery,
  SummarySeverity
} from './model/types'
```

Modify `src/entities/index.ts`:

```ts
export * from './business-unit'
export * from './production-stage'
export * from './production-summary'
```

- [ ] **Step 4: Run verification**

Run:

```powershell
npm.cmd run lint
```

Expected: no parser/type errors in `src/entities/production-summary/model`.

- [ ] **Step 5: Commit**

```powershell
git add src/entities/production-summary src/entities/index.ts
git commit -m "feat(summary): add gtk summary types"
```

---

### Task 2: Add RTK Query Endpoints and Mock Data

**Files:**

- Create: `src/entities/production-summary/api/productionSummaryApi.ts`
- Create: `src/shared/mocks/production-summary/gtk.ts`
- Create: `src/shared/mocks/production-summary/summary.ts`
- Create: `src/shared/mocks/production-summary/graph.ts`
- Modify: `src/shared/api/routes.ts`
- Modify: `src/shared/api/tagTypes.ts`
- Modify: `src/shared/mocks/api/mockBaseQuery.ts`
- Modify: `src/entities/production-summary/index.ts`

- [ ] **Step 1: Add API routes and tags**

Modify `src/shared/api/routes.ts` so `API_ROUTES` includes:

```ts
export const API_ROUTES = {
  businessUnits: '/business-units',
  gtk: '/gtk',
  summary: '/summary',
  graph: '/graph',
  productionStages: '/production-stages',
  productionStageMetrics: (stageSlug: string) => `/production-stages/${stageSlug}/metrics`,
  productionMetricDetail: (stageSlug: string, metricSlug: string) =>
    `/production-stages/${stageSlug}/metrics/${metricSlug}`,
  productionMetricComments: (stageSlug: string, metricSlug: string) =>
    `/production-stages/${stageSlug}/metrics/${metricSlug}/comments`
} as const
```

Modify `src/shared/api/tagTypes.ts`:

```ts
export const API_TAGS = {
  businessUnits: 'BusinessUnits',
  gtk: 'Gtk',
  summary: 'Summary',
  graph: 'Graph',
  productionStages: 'ProductionStages',
  productionStageMetrics: 'ProductionStageMetrics',
  productionMetricDetail: 'ProductionMetricDetail',
  productionMetricComments: 'ProductionMetricComments'
} as const
```

- [ ] **Step 2: Create RTK Query endpoints**

Create `src/entities/production-summary/api/productionSummaryApi.ts`:

```ts
import { API_ROUTES, API_TAGS, mainApi } from '@/shared/api'

import {
  type AlarmSummaryResponse,
  type GraphPoint,
  type GraphQuery,
  type GtkName,
  type SummaryQuery
} from '../model/types'

export const productionSummaryApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getGtk: build.query<GtkName[], void>({
      query: () => API_ROUTES.gtk,
      providesTags: [API_TAGS.gtk]
    }),
    getSummary: build.query<AlarmSummaryResponse, SummaryQuery>({
      query: (params) => ({
        url: API_ROUTES.summary,
        params
      }),
      providesTags: [API_TAGS.summary]
    }),
    getGraph: build.query<GraphPoint[], GraphQuery>({
      query: (params) => ({
        url: API_ROUTES.graph,
        params
      }),
      providesTags: [API_TAGS.graph]
    })
  })
})

export const { useGetGtkQuery, useGetSummaryQuery, useGetGraphQuery } = productionSummaryApi
```

Modify `src/entities/production-summary/index.ts` to export hooks:

```ts
export {
  productionSummaryApi,
  useGetGraphQuery,
  useGetGtkQuery,
  useGetSummaryQuery
} from './api/productionSummaryApi'
```

- [ ] **Step 3: Add mock GTK data**

Create `src/shared/mocks/production-summary/gtk.ts`:

```ts
export const gtkNames = ['Олимпиада', 'Наталка', 'Благодатное', 'Куранах', 'Сухой Лог']
```

- [ ] **Step 4: Add mock summary data**

Create `src/shared/mocks/production-summary/summary.ts` with the backend-shaped sample:

```ts
import { type AlarmSummaryResponse } from '@/entities/production-summary'

const details = [
  { gtk_or_zif: 'Олимпиада', plan_value: 271.74, fact_value: 257.9, deviation_pct: 5.2, severity: 'info' },
  { gtk_or_zif: 'Наталка', plan_value: 111.89, fact_value: 77.89, deviation_pct: -5.2, severity: 'critical' },
  { gtk_or_zif: 'Благодатное', plan_value: 81.89, fact_value: 86.15, deviation_pct: 5.2, severity: 'info' },
  { gtk_or_zif: 'Куранах', plan_value: 36.84, fact_value: 34.92, deviation_pct: -5.2, severity: 'warning' },
  { gtk_or_zif: 'Сухой Лог', plan_value: 12.99, fact_value: 13.67, deviation_pct: 5.2, severity: 'info' }
]

export const summaryMock: AlarmSummaryResponse = {
  production_date_from: '2026-06-26',
  production_date_to: '2026-06-26',
  shift: 3,
  total_critical: 2,
  total_warning: 1,
  total_incidents: 3,
  by_stage: {
    mining: {
      display_name: 'Добыча',
      critical: 1,
      warning: 0,
      info: 3,
      cards: [
        {
          indicator_name: 'Горная масса',
          plan_value: 523.3,
          fact_value: 550.5,
          deviation_pct: 5.2,
          severity: 'info',
          measure_unit: 'тыс. м3',
          details
        },
        {
          indicator_name: 'Добыча руды',
          plan_value: 19.4,
          fact_value: 18.4,
          deviation_pct: -5.2,
          severity: 'critical',
          measure_unit: 'тыс. т',
          details: details.map((item) => ({
            ...item,
            plan_value: item.gtk_or_zif === 'Наталка' || item.gtk_or_zif === 'Куранах' ? 9.39 : 8.46,
            fact_value: 8.9,
            deviation_pct: item.gtk_or_zif === 'Наталка' || item.gtk_or_zif === 'Куранах' ? -5.2 : 5.2,
            severity: item.gtk_or_zif === 'Наталка' ? 'critical' : item.gtk_or_zif === 'Куранах' ? 'warning' : 'info'
          }))
        },
        {
          indicator_name: 'Содержание Au',
          plan_value: 1.35,
          fact_value: 1.42,
          deviation_pct: 5.2,
          severity: 'info',
          measure_unit: 'г/т',
          details: details.map((item) => ({
            ...item,
            plan_value: 2.45,
            fact_value: 2.58,
            deviation_pct: item.gtk_or_zif === 'Наталка' || item.gtk_or_zif === 'Куранах' ? -5.2 : 5.2,
            severity: item.gtk_or_zif === 'Наталка' ? 'critical' : item.gtk_or_zif === 'Куранах' ? 'warning' : 'info'
          }))
        },
        {
          indicator_name: 'Вскрыша',
          plan_value: 450.5,
          fact_value: 473.9,
          deviation_pct: 5.2,
          severity: 'info',
          measure_unit: 'тыс. м3',
          details: details.map((item) => ({
            ...item,
            plan_value: 48.07,
            fact_value: 50.57,
            deviation_pct: 5.2,
            severity: 'info'
          }))
        }
      ]
    }
  }
}
```

- [ ] **Step 5: Add mock graph data**

Create `src/shared/mocks/production-summary/graph.ts`:

```ts
import { type GraphPoint } from '@/entities/production-summary'

export const graphMock: GraphPoint[] = [
  { date: '2026-06-20', fact: 0, plan: 0 },
  { date: '2026-06-21', fact: 82, plan: 78 },
  { date: '2026-06-22', fact: 161, plan: 156 },
  { date: '2026-06-23', fact: 244, plan: 234 },
  { date: '2026-06-24', fact: 326, plan: 312 },
  { date: '2026-06-25', fact: 431, plan: 420 },
  { date: '2026-06-26', fact: 550.5, plan: 523.3 }
]
```

- [ ] **Step 6: Wire mock handlers**

Modify imports in `src/shared/mocks/api/mockBaseQuery.ts`:

```ts
import { graphMock } from '@/shared/mocks/production-summary/graph'
import { gtkNames } from '@/shared/mocks/production-summary/gtk'
import { summaryMock } from '@/shared/mocks/production-summary/summary'
```

Add handlers before old production-stage handlers:

```ts
if (method === 'GET' && url === API_ROUTES.gtk) {
  return { data: gtkNames }
}

if (method === 'GET' && url === API_ROUTES.summary) {
  return { data: summaryMock }
}

if (method === 'GET' && url === API_ROUTES.graph) {
  return { data: graphMock }
}
```

- [ ] **Step 7: Run verification**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands pass. If build fails due to the new dynamic route conflicting with static routes, defer that fix to Task 8 where the route is added.

- [ ] **Step 8: Commit**

```powershell
git add src/shared/api src/entities/production-summary src/shared/mocks
git commit -m "feat(summary): connect summary endpoints"
```

---

### Task 3: Add Summary Helpers and Formatting

**Files:**

- Create: `src/entities/production-summary/lib/format.ts`
- Create: `src/entities/production-summary/lib/summary.ts`
- Create: `src/entities/production-summary/lib/index.ts`
- Modify: `src/entities/production-summary/index.ts`

- [ ] **Step 1: Add formatting helpers**

Create `src/entities/production-summary/lib/format.ts`:

```ts
export function formatSummaryNumber(value: number | null | undefined, fractionDigits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  return value.toLocaleString('ru-RU', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits
  })
}

export function formatDeviation(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '- к плану'
  }

  const sign = value > 0 ? '+' : ''

  return `${sign}${formatSummaryNumber(value, 1)}% к плану`
}

export function formatFooterCount(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : String(value)
}
```

- [ ] **Step 2: Add summary helpers**

Create `src/entities/production-summary/lib/summary.ts`:

```ts
import { getGtkHrefByName, getGtkSlugByName } from '../model/gtk'
import {
  type AlarmSummaryResponse,
  type DepositSummaryView,
  type StageSummary,
  type SummaryIndicatorCard,
  type SummarySeverity
} from '../model/types'

const PROBLEM_SEVERITIES = new Set(['critical', 'warning'])

export function getSeverityRank(severity: SummarySeverity) {
  if (severity === 'critical') {
    return 2
  }

  if (severity === 'warning') {
    return 1
  }

  return 0
}

export function getStatusLabel(severity: SummarySeverity) {
  if (severity === 'critical') {
    return 'Критично'
  }

  if (severity === 'warning') {
    return 'Отклонение'
  }

  return 'В норме'
}

export function getMiningStage(summary: AlarmSummaryResponse | undefined): StageSummary | undefined {
  if (!summary) {
    return undefined
  }

  return (
    summary.by_stage.mining ??
    Object.values(summary.by_stage).find((stage) => stage.display_name === 'Добыча')
  )
}

export function getStageHealthText(stage: StageSummary | undefined) {
  if (!stage || stage.cards.length === 0) {
    return '0/0'
  }

  const healthyCount = stage.cards.filter((card) => !PROBLEM_SEVERITIES.has(card.severity)).length

  return `${healthyCount}/${stage.cards.length}`
}

export function getFirstStageIndicator(stage: StageSummary | undefined) {
  return stage?.cards[0]?.indicator_name
}

export function groupCardsByDeposit(cards: SummaryIndicatorCard[]): DepositSummaryView[] {
  const deposits = new Map<string, DepositSummaryView>()

  cards.forEach((card) => {
    card.details.forEach((detail) => {
      const existing = deposits.get(detail.gtk_or_zif)
      const severity =
        !existing || getSeverityRank(detail.severity) > getSeverityRank(existing.status)
          ? detail.severity
          : existing.status

      const metrics = [
        ...(existing?.metrics ?? []),
        {
          id: card.indicator_name,
          title: card.indicator_name === 'Содержание Au' ? 'Содержание' : card.indicator_name,
          unit: card.measure_unit,
          factValue: detail.fact_value,
          planValue: detail.plan_value,
          deviationPct: detail.deviation_pct,
          severity: detail.severity
        }
      ]

      deposits.set(detail.gtk_or_zif, {
        name: detail.gtk_or_zif,
        slug: getGtkSlugByName(detail.gtk_or_zif),
        href: getGtkHrefByName(detail.gtk_or_zif),
        status: severity,
        statusLabel: getStatusLabel(severity),
        metrics
      })
    })
  })

  return Array.from(deposits.values())
}
```

- [ ] **Step 3: Export helpers**

Create `src/entities/production-summary/lib/index.ts`:

```ts
export * from './format'
export * from './summary'
```

Modify `src/entities/production-summary/index.ts`:

```ts
export * from './lib'
```

- [ ] **Step 4: Run verification**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands pass.

- [ ] **Step 5: Commit**

```powershell
git add src/entities/production-summary
git commit -m "feat(summary): add dashboard data helpers"
```

---

### Task 4: Rework Header, Sidebar, Footer, and App Layout

**Files:**

- Create: `src/widgets/app-footer/AppFooter.tsx`
- Create: `src/widgets/app-footer/AppFooter.module.css`
- Create: `src/widgets/app-footer/index.ts`
- Modify: `src/widgets/app-layout/Layout.tsx`
- Modify: `src/widgets/app-layout/Layout.module.css`
- Modify: `src/widgets/header/Header.tsx`
- Modify: `src/widgets/header/Header.module.css`
- Modify: `src/widgets/sidebar/Sidebar.tsx`
- Modify: `src/widgets/sidebar/sidebarConfig.ts`
- Modify: `src/widgets/sidebar/Sidebar.module.css`
- Modify: `src/widgets/index.ts`

- [ ] **Step 1: Create footer component**

Create `src/widgets/app-footer/AppFooter.tsx`:

```tsx
import Link from 'next/link'

import { formatFooterCount } from '@/entities/production-summary'

import styles from './AppFooter.module.css'

const requestStats = {
  today: 0,
  week: 14,
  total: 25
}

const userStats = {
  today: 0,
  week: 6,
  total: 10
}

function StatGroup({ title, stats }: { title: string; stats: typeof requestStats }) {
  return (
    <div className={styles.statGroup}>
      <strong>{title}</strong>
      <span>Сегодня: <b>{formatFooterCount(stats.today)}</b></span>
      <span>За неделю: <b>{formatFooterCount(stats.week)}</b></span>
      <span>Всего: <b>{formatFooterCount(stats.total)}</b></span>
    </div>
  )
}

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="Сервисы">
        <Link href="/">Цифровой ЗИФ</Link>
        <Link href="/">Сервис LLM</Link>
      </nav>
      <div className={styles.stats}>
        <StatGroup title="Запросов" stats={requestStats} />
        <span className={styles.divider} aria-hidden="true" />
        <StatGroup title="Пользователей" stats={userStats} />
      </div>
    </footer>
  )
}
```

Create `src/widgets/app-footer/index.ts`:

```ts
export { AppFooter } from './AppFooter'
```

- [ ] **Step 2: Add footer styles**

Create `src/widgets/app-footer/AppFooter.module.css`:

```css
.footer {
  flex: 0 0 2rem;
  min-height: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 0 1.25rem;
  color: #111;
  background: #fff;
  font-size: 0.9375rem;
  line-height: 1.1;
}

.links,
.stats,
.statGroup {
  display: flex;
  align-items: center;
}

.links {
  gap: 1rem;
}

.links a {
  color: #111;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}

.stats {
  gap: 1.25rem;
  margin-left: auto;
}

.statGroup {
  gap: 0.75rem;
  white-space: nowrap;
}

.statGroup strong,
.statGroup b {
  font-weight: 700;
}

.divider {
  width: 1px;
  height: 1.0625rem;
  background: #d8d8d8;
}

@media (--screen-tablet) {
  .footer {
    align-items: flex-start;
    flex-direction: column;
    min-height: auto;
    padding: var(--space-3) var(--space-4);
  }

  .stats {
    flex-wrap: wrap;
    margin-left: 0;
  }
}
```

- [ ] **Step 3: Update layout to include footer**

Modify `src/widgets/app-layout/Layout.tsx`:

```tsx
import { Suspense, type ReactNode } from 'react'
import { AppFooter } from '@/widgets/app-footer'
import { Header } from '@/widgets/header'
import { Sidebar, SidebarProvider } from '@/widgets/sidebar'
import styles from './Layout.module.css'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className={styles.layout}>
        <Header />
        <section className={styles.contentArea}>
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>
          <div className={styles.contentColumn}>
            <main className={styles.mainContent} data-main-content-scroll>
              {children}
            </main>
            <AppFooter />
          </div>
        </section>
      </div>
    </SidebarProvider>
  )
}
```

- [ ] **Step 4: Update header component**

Modify `src/widgets/header/Header.tsx`:

```tsx
'use client'

import { useSidebar } from '@/widgets/sidebar'
import styles from './Header.module.css'

export function Header() {
  const { openMobileSidebar } = useSidebar()

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={openMobileSidebar}
        aria-label="Открыть меню"
      >
        <span />
        <span />
        <span />
      </button>

      <div className={styles.brand}>
        <span>ЦИФРОВОЙ</span>
        <strong>ГОК</strong>
      </div>

      <div className={styles.user}>
        <span>Доброе утро, Ярослав Сергеевич</span>
        <span className={styles.avatar} aria-hidden="true" />
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Update sidebar config for static keys**

Modify `src/widgets/sidebar/sidebarConfig.ts` to remove old production menu constants and expose only base keys:

```ts
import { HomeOutlined, SettingOutlined } from '@ant-design/icons'
import type { ComponentType } from 'react'

export const GTK_MENU_KEY = 'gtk-root'

export type SidebarMenuItem = {
  key: string
  label: string
  href?: string
  icon?: ComponentType
  children?: SidebarMenuItem[]
}

export function getSelectedSidebarKey(pathname: string) {
  if (pathname === '/') {
    return '/'
  }

  if (pathname === '/settings') {
    return '/settings'
  }

  return pathname
}

export function getOpenSidebarKeys() {
  return [GTK_MENU_KEY]
}

export const BASE_SIDEBAR_ITEMS: SidebarMenuItem[] = [
  {
    key: '/',
    href: '/',
    label: 'Главная',
    icon: HomeOutlined
  },
  {
    key: GTK_MENU_KEY,
    label: 'Месторождения',
    children: []
  },
  {
    key: '/settings',
    href: '/settings',
    label: 'Настройки',
    icon: SettingOutlined
  }
]
```

- [ ] **Step 6: Update sidebar to fetch GTK names**

Modify `src/widgets/sidebar/Sidebar.tsx` so `SidebarContent` imports and uses:

```tsx
import {
  getGtkHrefByName,
  getGtkSlugByName,
  useGetGtkQuery
} from '@/entities/production-summary'
import { BASE_SIDEBAR_ITEMS, getOpenSidebarKeys, getSelectedSidebarKey, GTK_MENU_KEY } from './sidebarConfig'
```

Inside `SidebarContent`, add:

```tsx
const { data: gtkNames = [] } = useGetGtkQuery()
const sidebarItems = useMemo(
  () =>
    BASE_SIDEBAR_ITEMS.map((item) => {
      if (item.key !== GTK_MENU_KEY) {
        return item
      }

      return {
        ...item,
        children: gtkNames
          .filter((name) => getGtkSlugByName(name))
          .map((name) => ({
            key: getGtkHrefByName(name) ?? name,
            href: getGtkHrefByName(name),
            label: name
          }))
      }
    }),
  [gtkNames]
)
```

Replace all `SIDEBAR_ITEMS` references with `sidebarItems`.

Add the date block before the menu:

```tsx
<div className={styles.dateBlock}>
  <strong>Пятница, 26 июня</strong>
  <span>2026 · 09:14 МСК</span>
</div>
```

- [ ] **Step 7: Update styles**

Adjust CSS to match Figma:

- `Header.module.css`: `2.5rem` high, `#3c3c3c` background, white text, brand left, greeting right, yellow `ГОК`.
- `Sidebar.module.css`: `17.5rem` width if token allows or direct width matching `280px`, date block `68px`, active item yellow `#f6ad21`, expanded GTK section.
- `Layout.module.css`: keep `100dvh`, main content `#f0f0f0`, footer outside scroll under main content.

Use existing CSS variables where they match. Use direct Figma colors only where no token matches.

- [ ] **Step 8: Export footer**

Modify `src/widgets/index.ts`:

```ts
export * from './app-footer'
export * from './app-layout'
export * from './content-header'
export * from './header'
export * from './industrial-dashboard-table'
export * from './mining-stage-overview'
export * from './production-metric-detail'
export * from './sidebar'
```

- [ ] **Step 9: Run verification**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands pass.

- [ ] **Step 10: Commit**

```powershell
git add src/widgets/app-footer src/widgets/app-layout src/widgets/header src/widgets/sidebar src/widgets/index.ts
git commit -m "feat(layout): match planning dashboard shell"
```

---

### Task 5: Build Shared Dashboard UI Components

**Files:**

- Create: `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.module.css`
- Create: `src/widgets/production-summary-dashboard/ui/KpiCard.tsx`
- Create: `src/widgets/production-summary-dashboard/ui/CollapsibleStagePanel.tsx`
- Create: `src/widgets/production-summary-dashboard/ui/StaticStagePanel.tsx`
- Create: `src/widgets/production-summary-dashboard/ui/DepositGrid.tsx`
- Create: `src/widgets/production-summary-dashboard/ui/index.ts`
- Create: `src/widgets/production-summary-dashboard/index.ts`
- Modify: `src/widgets/index.ts`

- [ ] **Step 1: Create KPI card**

Create `src/widgets/production-summary-dashboard/ui/KpiCard.tsx`:

```tsx
import classNames from 'classnames'

import { formatDeviation, formatSummaryNumber, type SummaryIndicatorCard } from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'

type KpiCardProps = {
  card: SummaryIndicatorCard
}

export function KpiCard({ card }: KpiCardProps) {
  return (
    <article className={styles.kpiCard}>
      <div className={styles.metricTitle}>
        <strong>{card.indicator_name}</strong>
        <span>{card.measure_unit}</span>
      </div>
      <b className={styles.metricValue}>{formatSummaryNumber(card.fact_value, card.indicator_name === 'Содержание Au' ? 2 : 1)}</b>
      <span className={classNames(styles.deviation, styles[`severity-${card.severity}`])}>
        {formatDeviation(card.deviation_pct)}
      </span>
    </article>
  )
}
```

- [ ] **Step 2: Create stage panel**

Create `src/widgets/production-summary-dashboard/ui/CollapsibleStagePanel.tsx`:

```tsx
import { DownOutlined } from '@ant-design/icons'

import { getStageHealthText, type StageSummary } from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'
import { KpiCard } from './KpiCard'

type CollapsibleStagePanelProps = {
  stage: StageSummary | undefined
}

export function CollapsibleStagePanel({ stage }: CollapsibleStagePanelProps) {
  return (
    <section className={styles.stagePanel} aria-labelledby="mining-title">
      <header className={styles.stageHeader}>
        <div className={styles.stageTitle}>
          <h1 id="mining-title">{stage?.display_name ?? 'Добыча'}</h1>
          <span>{getStageHealthText(stage)}</span>
        </div>
        <button type="button" className={styles.iconButton} aria-label="Свернуть добычу">
          <DownOutlined />
        </button>
      </header>
      {stage && stage.cards.length > 0 ? (
        <div className={styles.kpiGrid}>
          {stage.cards.map((card) => (
            <KpiCard key={card.indicator_name} card={card} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>Нет данных по добыче</div>
      )}
    </section>
  )
}
```

- [ ] **Step 3: Create static stage panel**

Create `src/widgets/production-summary-dashboard/ui/StaticStagePanel.tsx`:

```tsx
import { DownOutlined } from '@ant-design/icons'

import styles from '../ProductionSummaryDashboard.module.css'

type StaticStagePanelProps = {
  title: string
}

export function StaticStagePanel({ title }: StaticStagePanelProps) {
  return (
    <section className={styles.staticPanel}>
      <div className={styles.stageTitle}>
        <h2>{title}</h2>
        <span className={styles.workBadge}>Виджет в работе</span>
      </div>
      <button type="button" className={styles.iconButton} aria-label={`Раскрыть ${title}`}>
        <DownOutlined />
      </button>
    </section>
  )
}
```

- [ ] **Step 4: Create deposit grid**

Create `src/widgets/production-summary-dashboard/ui/DepositGrid.tsx`:

```tsx
import Link from 'next/link'
import classNames from 'classnames'

import { formatDeviation, formatSummaryNumber, type DepositSummaryView } from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'

type DepositGridProps = {
  deposits: DepositSummaryView[]
}

export function DepositGrid({ deposits }: DepositGridProps) {
  if (deposits.length === 0) {
    return null
  }

  return (
    <section className={styles.depositSection} aria-labelledby="deposits-title">
      <h2 id="deposits-title">Месторождения</h2>
      <div className={styles.depositGrid}>
        {deposits.map((deposit) => {
          const content = (
            <article className={styles.depositCard}>
              <header className={styles.depositHeader}>
                <h3>{deposit.name}</h3>
                <span className={classNames(styles.statusBadge, styles[`severity-${deposit.status}`])}>
                  {deposit.statusLabel}
                </span>
              </header>
              <div className={styles.depositMetrics}>
                {deposit.metrics.map((metric) => (
                  <div key={metric.id} className={styles.depositMetric}>
                    <div className={styles.metricTitle}>
                      <strong>{metric.title}</strong>
                      <span>{metric.unit}</span>
                    </div>
                    <b className={styles.metricValue}>{formatSummaryNumber(metric.factValue, metric.title === 'Содержание' ? 2 : 1)}</b>
                    <span className={classNames(styles.deviation, styles[`severity-${metric.severity}`])}>
                      {formatDeviation(metric.deviationPct)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          )

          return deposit.href ? (
            <Link key={deposit.name} href={deposit.href} className={styles.cardLink}>
              {content}
            </Link>
          ) : (
            <div key={deposit.name}>{content}</div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Add component barrel**

Create `src/widgets/production-summary-dashboard/ui/index.ts`:

```ts
export { CollapsibleStagePanel } from './CollapsibleStagePanel'
export { DepositGrid } from './DepositGrid'
export { KpiCard } from './KpiCard'
export { StaticStagePanel } from './StaticStagePanel'
```

Create `src/widgets/production-summary-dashboard/index.ts`:

```ts
export { ProductionSummaryDashboard } from './ProductionSummaryDashboard'
```

Create `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.module.css` with the class names used by the components:

```css
.dashboard {}
.breadcrumbLine {}
.stagePanel {}
.stageHeader {}
.stageTitle {}
.iconButton {}
.kpiGrid {}
.kpiCard {}
.metricTitle {}
.metricValue {}
.deviation {}
.emptyState {}
.depositSection {}
.depositGrid {}
.depositCard {}
.depositHeader {}
.statusBadge {}
.depositMetrics {}
.depositMetric {}
.cardLink {}
.staticPanel {}
.workBadge {}
.severity-critical {}
.severity-warning {}
.severity-info {}
```

The full CSS is added in Task 6 after the composition exists.

- [ ] **Step 6: Export widget**

Modify `src/widgets/index.ts`:

```ts
export * from './production-summary-dashboard'
```

- [ ] **Step 7: Run verification**

Run:

```powershell
npm.cmd run lint
```

Expected: lint passes or only reports empty CSS as acceptable. If CSS module class-name linting complains about empty classes, add minimal declarations like `display: contents;` only to `.dashboard` and keep the rest for Task 6.

- [ ] **Step 8: Commit**

```powershell
git add src/widgets/production-summary-dashboard src/widgets/index.ts
git commit -m "feat(summary): add dashboard ui primitives"
```

---

### Task 6: Compose Home Dashboard and Match Figma Main Content

**Files:**

- Create: `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.tsx`
- Modify: `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.module.css`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.module.css`

- [ ] **Step 1: Create shared dashboard composition**

Create `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.tsx`:

```tsx
'use client'

import { Alert, Skeleton } from 'antd'

import {
  getMiningStage,
  groupCardsByDeposit,
  useGetSummaryQuery,
  type SummaryQuery
} from '@/entities/production-summary'

import styles from './ProductionSummaryDashboard.module.css'
import { CollapsibleStagePanel, DepositGrid, StaticStagePanel } from './ui'

type ProductionSummaryDashboardProps = {
  query: SummaryQuery
  title?: string
}

export function ProductionSummaryDashboard({ query, title }: ProductionSummaryDashboardProps) {
  const { data: summary, error, isLoading } = useGetSummaryQuery(query)
  const miningStage = getMiningStage(summary)
  const deposits = groupCardsByDeposit(miningStage?.cards ?? [])

  if (isLoading) {
    return (
      <section className={styles.dashboard} aria-label="Сводка производства">
        <Skeleton active paragraph={{ rows: 14 }} title={false} />
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.dashboard} aria-label="Сводка производства">
        <Alert showIcon type="error" message="Не удалось загрузить сводку производства" />
      </section>
    )
  }

  return (
    <section className={styles.dashboard} aria-label="Сводка производства">
      <div className={styles.breadcrumbLine}>
        <span aria-hidden="true" />
        <p>{title ?? 'ПРОИЗВОДСТВО · 26 июня 2026'}</p>
      </div>
      <CollapsibleStagePanel stage={miningStage} />
      <DepositGrid deposits={deposits} />
      <StaticStagePanel title="Минеральные ресурсы" />
      <StaticStagePanel title="Обогащение" />
    </section>
  )
}
```

- [ ] **Step 2: Wire home page**

Modify `src/app/page.tsx`:

```tsx
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
```

Clear `src/app/page.module.css` if it is still imported nowhere. If keeping the file, leave it empty.

- [ ] **Step 3: Replace dashboard CSS with Figma-matched styles**

Modify `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.module.css` with:

```css
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 100%;
  padding: 1.25rem;
  background: #f0f0f0;
}

.breadcrumbLine {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 1.0625rem;
  color: #777;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: uppercase;
}

.breadcrumbLine span {
  width: 1rem;
  height: 1px;
  background: #777;
}

.stagePanel,
.staticPanel,
.depositCard {
  border: 1px solid #dcdcdc;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 14%);
}

.stagePanel {
  padding: 0.75rem 1.25rem 1.25rem;
}

.stageHeader,
.staticPanel,
.depositHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.stageHeader {
  min-height: 2.5rem;
  margin-bottom: 0.75rem;
}

.stageTitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.stageTitle h1,
.stageTitle h2,
.depositSection h2 {
  margin: 0;
  color: #202020;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.stageTitle span,
.workBadge {
  flex: 0 0 auto;
  padding: 0.125rem 0.375rem;
  border-radius: 5px;
  color: #f0a000;
  background: #fff2c7;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.iconButton {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  color: #111;
  background: transparent;
  cursor: pointer;
}

.kpiGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.kpiCard {
  min-height: 6rem;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 5px;
  background: #fff;
}

.metricTitle {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  min-width: 0;
  color: #7d7d7d;
}

.metricTitle strong {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.metricTitle span {
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.2;
}

.metricValue {
  display: block;
  margin-top: 0.25rem;
  color: #ffae16;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
}

.deviation {
  display: block;
  margin-top: 0.125rem;
  color: #008c35;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.2;
}

.severity-critical {
  color: #ff3b30;
}

.severity-warning {
  color: #f0a000;
}

.severity-info {
  color: #008c35;
}

.emptyState {
  padding: 1rem;
  color: #777;
}

.depositSection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.depositGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.cardLink {
  color: inherit;
  text-decoration: none;
}

.depositCard {
  min-height: 14rem;
  padding: 1rem;
}

.depositHeader h3 {
  margin: 0;
  color: #202020;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.statusBadge {
  flex: 0 0 auto;
  padding: 0.125rem 0.375rem;
  border-radius: 5px;
  color: #008c35;
  background: #ddf5e4;
  font-size: 0.8125rem;
  font-weight: 800;
  line-height: 1.15;
}

.statusBadge.severity-critical {
  color: #ff3b30;
  background: #ffe7df;
}

.statusBadge.severity-warning {
  color: #f0a000;
  background: #fff2c7;
}

.depositMetrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1rem;
  margin-top: 1rem;
}

.staticPanel {
  min-height: 4rem;
  padding: 0.75rem 1.25rem;
}

.workBadge {
  font-size: 1rem;
}

@media (max-width: 1200px) {
  .kpiGrid,
  .depositGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .dashboard {
    padding: 1rem;
  }

  .kpiGrid,
  .depositGrid,
  .depositMetrics {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run verification**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands pass and `/` compiles.

- [ ] **Step 5: Commit**

```powershell
git add src/widgets/production-summary-dashboard src/app/page.tsx src/app/page.module.css
git commit -m "feat(summary): render planning dashboard home"
```

---

### Task 7: Add Detail Route and Graph Panel

**Files:**

- Create: `src/widgets/production-summary-dashboard/ui/GraphPanel.tsx`
- Create: `src/app/[gtkSlug]/page.tsx`
- Modify: `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.tsx`
- Modify: `src/widgets/production-summary-dashboard/ProductionSummaryDashboard.module.css`
- Modify: `src/widgets/production-summary-dashboard/ui/index.ts`

- [ ] **Step 1: Create graph panel**

Create `src/widgets/production-summary-dashboard/ui/GraphPanel.tsx`:

```tsx
'use client'

import { Alert, Skeleton } from 'antd'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useGetGraphQuery, type GraphQuery } from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'

type GraphPanelProps = {
  query: GraphQuery | undefined
}

export function GraphPanel({ query }: GraphPanelProps) {
  const { data = [], error, isFetching } = useGetGraphQuery(query as GraphQuery, {
    skip: !query
  })

  return (
    <section className={styles.graphPanel} aria-labelledby="graph-title">
      <header className={styles.graphHeader}>
        <h2 id="graph-title">График</h2>
        {query?.indicator && <span>{query.indicator}</span>}
      </header>
      {!query && <div className={styles.emptyState}>Нет показателя для графика</div>}
      {query && isFetching && <Skeleton active paragraph={{ rows: 6 }} title={false} />}
      {query && error && <Alert showIcon type="error" message="Не удалось загрузить график" />}
      {query && !isFetching && !error && data.length === 0 && (
        <div className={styles.emptyState}>Нет данных для графика</div>
      )}
      {query && !isFetching && !error && data.length > 0 && (
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="plan" name="План" stroke="#8a8a8a" strokeWidth={2} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="fact" name="Факт" stroke="#ffae16" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Export graph panel**

Modify `src/widgets/production-summary-dashboard/ui/index.ts`:

```ts
export { GraphPanel } from './GraphPanel'
```

- [ ] **Step 3: Add optional graph to dashboard composition**

Modify `ProductionSummaryDashboard.tsx` props:

```tsx
type ProductionSummaryDashboardProps = {
  query: SummaryQuery
  title?: string
  showGraph?: boolean
}
```

Import `getFirstStageIndicator` and `GraphPanel`.

Inside component:

```tsx
const firstIndicator = getFirstStageIndicator(miningStage)
const graphQuery =
  showGraph && query.gtk && firstIndicator
    ? {
        indicator: firstIndicator,
        date_from: query.date_from,
        date_to: query.date_to,
        gtk: query.gtk
      }
    : undefined
```

Render `GraphPanel` after `CollapsibleStagePanel`:

```tsx
{showGraph && <GraphPanel query={graphQuery} />}
```

- [ ] **Step 4: Add graph styles**

Append to `ProductionSummaryDashboard.module.css`:

```css
.graphPanel {
  padding: 1rem 1.25rem;
  border: 1px solid #dcdcdc;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 14%);
}

.graphHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.graphHeader h2 {
  margin: 0;
  color: #202020;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.graphHeader span {
  color: #777;
  font-size: 0.875rem;
  font-weight: 700;
}

.chartBox {
  width: 100%;
  height: 20rem;
}
```

- [ ] **Step 5: Add short GTK route**

Create `src/app/[gtkSlug]/page.tsx`:

```tsx
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
```

- [ ] **Step 6: Run verification**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands pass. Confirm `/settings` still resolves to the static route and is not swallowed by `[gtkSlug]`.

- [ ] **Step 7: Commit**

```powershell
git add src/widgets/production-summary-dashboard src/app/[gtkSlug]
git commit -m "feat(summary): add gtk detail graph page"
```

---

### Task 8: Visual QA Against Figma

**Files:**

- Modify only CSS/markup files found by QA.

- [ ] **Step 1: Start dev server**

Run:

```powershell
npm.cmd run dev
```

Expected: Next.js starts on `http://localhost:3000` or the next available port.

- [ ] **Step 2: Inspect desktop home**

Open `/` at about `1994x1018`.

Compare against Figma node `492:2285`:

- topbar height is `40px`;
- sidebar width is `280px`;
- footer height is `32px`;
- content starts with `ПРОИЗВОДСТВО · 26 июня 2026`;
- "Добыча" panel has four KPI cards in one row;
- "Месторождения" grid is 3 columns then 2 cards on the second row;
- "Минеральные ресурсы" and "Обогащение" match collapsed panels;
- no text overlaps or overflows.

- [ ] **Step 3: Inspect desktop detail**

Open `/olimpiada`.

Confirm:

- sidebar selection is `Олимпиада`;
- summary request includes `gtk=Олимпиада` in Network tab if backend is enabled;
- graph panel appears after `Добыча`;
- graph title uses first mining indicator from summary;
- `null` graph values do not draw as zero.

- [ ] **Step 4: Inspect narrow viewport**

Open `/` and `/olimpiada` at mobile/narrow width.

Confirm:

- mobile menu button opens sidebar drawer;
- sidebar date block and GTK links are readable;
- KPI cards stack cleanly;
- deposit cards stack cleanly;
- footer wraps without horizontal scroll.

- [ ] **Step 5: Run final verification**

Stop dev server after QA, then run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands pass.

- [ ] **Step 6: Commit QA fixes**

If QA required changes:

```powershell
git add src
git commit -m "fix(summary): polish planning dashboard layout"
```

If QA required no code changes, do not create an empty commit.

---

## Self-Review Checklist

- The plan implements Figma node `492:2285` as the visual source of truth.
- `/gtk` is used for sidebar names.
- The temporary GTK mapper provides short URL slugs.
- `/summary` without `gtk` powers `/`.
- `/summary` with `gtk` powers short GTK routes.
- `/graph` powers the detail graph using the first mining indicator.
- Header business-unit filter is removed from the new home/detail flow.
- Footer supports `-` for absent future counts via `formatFooterCount`.
- New backend contracts live in `production-summary`, separate from old `production-stage`.
- Existing `/production-stages` routes are not intentionally refactored.
- Lint, build, and visual QA are required before final handoff.

## Execution Options

Plan complete. Recommended execution mode is subagent-driven because tasks are cleanly separable:

1. Entity/API/mocks.
2. Data helpers.
3. Shell/sidebar/footer.
4. Dashboard UI/home.
5. Detail route/graph.
6. Visual QA.
