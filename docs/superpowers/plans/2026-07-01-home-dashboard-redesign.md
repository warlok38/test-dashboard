# Home Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the recommended executive overview homepage from the design spec: top health summary, prioritized attention items, one plan/fact trend chart, production chain, and compact business-unit health cards.

**Architecture:** Keep `src/app/page.tsx` thin and server-first. Add domain aggregation helpers and home summary mock data under `src/entities/production-stage`, then compose the UI in a new `src/widgets/home-dashboard` feature-style widget. Reuse existing tokens, Recharts, Ant Design states, and current production-stage routes.

**Tech Stack:** Next.js App Router, React 18, TypeScript, CSS Modules, Ant Design v6, Recharts, existing FSD-style project structure.

---

## Source Spec

Design spec: `docs/superpowers/specs/2026-07-01-home-dashboard-redesign-design.md`

Recommended option: Variant B, executive overview with exception-first prioritization.

## File Structure

Create:

- `src/entities/production-stage/lib/homeDashboard.ts` - pure aggregation helpers for homepage summary, attention items, production chain, trend points, and business-unit health.
- `src/shared/mocks/production-stage/homeDashboard.ts` - homepage-specific business-unit summaries and trend data that complement existing stage mocks.
- `src/widgets/home-dashboard/HomeDashboard.tsx` - client widget that fetches production stages and renders the homepage state.
- `src/widgets/home-dashboard/HomeDashboard.module.css` - layout and visual styling for the homepage widget.
- `src/widgets/home-dashboard/index.ts` - public widget export.
- `src/widgets/home-dashboard/ui/ExecutiveSummary.tsx` - top summary strip.
- `src/widgets/home-dashboard/ui/AttentionList.tsx` - prioritized problem cards.
- `src/widgets/home-dashboard/ui/PlanFactTrend.tsx` - single compact plan/fact trend chart.
- `src/widgets/home-dashboard/ui/ProductionChain.tsx` - production-stage health chain.
- `src/widgets/home-dashboard/ui/BusinessUnitHealthGrid.tsx` - compact mine/site cards.
- `src/widgets/home-dashboard/ui/index.ts` - internal UI exports.

Modify:

- `src/entities/production-stage/model/types.ts` - add homepage domain types.
- `src/entities/production-stage/lib/index.ts` - export `homeDashboard` helpers.
- `src/entities/production-stage/index.ts` - export homepage types and helpers.
- `src/widgets/index.ts` - export `home-dashboard`.
- `src/app/page.tsx` - render `HomeDashboard` inside the existing shell/header/surface.

Do not modify:

- Existing detailed production-stage pages.
- Existing `industrial-dashboard-table` behavior.
- Existing sidebar/header layout.

## Naming Decisions

Use these exact names to keep tasks aligned:

- Widget: `HomeDashboard`
- Top summary component: `ExecutiveSummary`
- Problems component: `AttentionList`
- Chart component: `PlanFactTrend`
- Chain component: `ProductionChain`
- Business-unit component: `BusinessUnitHealthGrid`
- Main view model function: `getHomeDashboardSummary`
- Home mock constants: `homeDashboardTrend`, `homeDashboardBusinessUnits`

---

### Task 1: Add Homepage Domain Types

**Files:**

- Modify: `src/entities/production-stage/model/types.ts`

- [ ] **Step 1: Add homepage types after `DashboardStage`**

Open `src/entities/production-stage/model/types.ts` and insert the following block immediately after the `DashboardStage` type:

```ts
export type HomeDashboardStatus = 'success' | 'warning' | 'danger' | 'neutral'

export type HomeDashboardMetricDirection = 'higher-is-better' | 'lower-is-better'

export type HomeDashboardSummaryCard = {
  id: string
  title: string
  value: string
  caption: string
  status: HomeDashboardStatus
}

export type HomeDashboardAttentionItem = {
  id: string
  title: string
  metricTitle: string
  factLabel: string
  planLabel: string
  deltaLabel: string
  impact: string
  status: Exclude<HomeDashboardStatus, 'success'>
  href?: string
}

export type HomeDashboardChainItem = {
  id: string
  title: string
  planText: string
  status: HomeDashboardStatus
  worstMetricTitle: string
  worstMetricDeltaLabel: string
  href?: string
}

export type HomeDashboardTrendPoint = {
  label: string
  fact: number
  plan: number
}

export type HomeDashboardBusinessUnit = {
  id: BusinessUnitSlug
  title: string
  status: HomeDashboardStatus
  worstMetricTitle: string
  worstMetricDeltaLabel: string
  contributionLabel: string
  metrics: Array<{
    id: string
    title: string
    value: string
    deltaLabel: string
    status: HomeDashboardStatus
  }>
}

export type HomeDashboardSummary = {
  status: HomeDashboardStatus
  statusTitle: string
  statusDescription: string
  cards: HomeDashboardSummaryCard[]
  attentionItems: HomeDashboardAttentionItem[]
  chain: HomeDashboardChainItem[]
  trend: HomeDashboardTrendPoint[]
  businessUnits: HomeDashboardBusinessUnit[]
}
```

- [ ] **Step 2: Export homepage types from the public barrel**

Modify `src/entities/production-stage/index.ts` so the first export block includes these types:

```ts
export type {
  DashboardMetric,
  DashboardMetricStatus,
  DashboardStage,
  HomeDashboardAttentionItem,
  HomeDashboardBusinessUnit,
  HomeDashboardChainItem,
  HomeDashboardMetricDirection,
  HomeDashboardStatus,
  HomeDashboardSummary,
  HomeDashboardSummaryCard,
  HomeDashboardTrendPoint
} from './model/types'
```

- [ ] **Step 3: Verify TypeScript syntax**

Run:

```powershell
npm.cmd run lint
```

Expected: lint may still fail if the project already has unrelated issues, but there must be no syntax/parser error pointing to `src/entities/production-stage/model/types.ts` or `src/entities/production-stage/index.ts`.

- [ ] **Step 4: Commit**

```powershell
git add src/entities/production-stage/model/types.ts src/entities/production-stage/index.ts
git commit -m "feat(home): add dashboard summary types"
```

---

### Task 2: Add Homepage Mock Data

**Files:**

- Create: `src/shared/mocks/production-stage/homeDashboard.ts`

- [ ] **Step 1: Create mock file**

Create `src/shared/mocks/production-stage/homeDashboard.ts` with this content:

```ts
import { type HomeDashboardBusinessUnit, type HomeDashboardTrendPoint } from '@/entities/production-stage/model/types'

export const homeDashboardTrend: HomeDashboardTrendPoint[] = [
  { label: '20 июн', fact: 18.6, plan: 20.1 },
  { label: '21 июн', fact: 36.9, plan: 40.5 },
  { label: '22 июн', fact: 55.1, plan: 61.2 },
  { label: '23 июн', fact: 72.4, plan: 82.0 },
  { label: '24 июн', fact: 91.3, plan: 102.4 },
  { label: '25 июн', fact: 109.8, plan: 123.6 },
  { label: '26 июн', fact: 128.2, plan: 147.7 }
]

export const homeDashboardBusinessUnits: HomeDashboardBusinessUnit[] = [
  {
    id: 'olimpiada',
    title: 'Олимпиада',
    status: 'success',
    worstMetricTitle: 'Добыча руды',
    worstMetricDeltaLabel: '+5.2%',
    contributionLabel: '+0.8 тыс. т к плану',
    metrics: [
      { id: 'rock-mass', title: 'Горная масса', value: '257.9', deltaLabel: '+5.2%', status: 'success' },
      { id: 'ore', title: 'Добыча руды', value: '8.9', deltaLabel: '+5.2%', status: 'success' },
      { id: 'au-content', title: 'Содержание Au', value: '2.58', deltaLabel: '+5.2%', status: 'success' }
    ]
  },
  {
    id: 'natalka',
    title: 'Наталка',
    status: 'danger',
    worstMetricTitle: 'Содержание Au',
    worstMetricDeltaLabel: '-5.2%',
    contributionLabel: '-1.8 тыс. т к плану',
    metrics: [
      { id: 'rock-mass', title: 'Горная масса', value: '257.9', deltaLabel: '+5.2%', status: 'success' },
      { id: 'ore', title: 'Добыча руды', value: '8.9', deltaLabel: '-5.2%', status: 'danger' },
      { id: 'au-content', title: 'Содержание Au', value: '2.58', deltaLabel: '-5.2%', status: 'danger' }
    ]
  },
  {
    id: 'blagodatnoe',
    title: 'Благодатное',
    status: 'success',
    worstMetricTitle: 'Вскрыша',
    worstMetricDeltaLabel: '+5.2%',
    contributionLabel: '+0.5 тыс. т к плану',
    metrics: [
      { id: 'rock-mass', title: 'Горная масса', value: '257.9', deltaLabel: '+5.2%', status: 'success' },
      { id: 'ore', title: 'Добыча руды', value: '8.9', deltaLabel: '+5.2%', status: 'success' },
      { id: 'overburden', title: 'Вскрыша', value: '50.57', deltaLabel: '+5.2%', status: 'success' }
    ]
  },
  {
    id: 'kuranah',
    title: 'Куранах',
    status: 'warning',
    worstMetricTitle: 'Добыча руды',
    worstMetricDeltaLabel: '-5.2%',
    contributionLabel: '-0.6 тыс. т к плану',
    metrics: [
      { id: 'rock-mass', title: 'Горная масса', value: '257.9', deltaLabel: '+5.2%', status: 'success' },
      { id: 'ore', title: 'Добыча руды', value: '8.9', deltaLabel: '-5.2%', status: 'danger' },
      { id: 'au-content', title: 'Содержание Au', value: '2.58', deltaLabel: '-5.2%', status: 'warning' }
    ]
  },
  {
    id: 'suhoy-log',
    title: 'Сухой лог',
    status: 'success',
    worstMetricTitle: 'Добыча руды',
    worstMetricDeltaLabel: '+5.2%',
    contributionLabel: '+0.3 тыс. т к плану',
    metrics: [
      { id: 'rock-mass', title: 'Горная масса', value: '257.9', deltaLabel: '+5.2%', status: 'success' },
      { id: 'ore', title: 'Добыча руды', value: '8.9', deltaLabel: '+5.2%', status: 'success' },
      { id: 'au-content', title: 'Содержание Au', value: '2.58', deltaLabel: '+5.2%', status: 'success' }
    ]
  }
]
```

- [ ] **Step 2: Run lint**

```powershell
npm.cmd run lint
```

Expected: no lint errors in `src/shared/mocks/production-stage/homeDashboard.ts`.

- [ ] **Step 3: Commit**

```powershell
git add src/shared/mocks/production-stage/homeDashboard.ts
git commit -m "feat(home): add dashboard mock data"
```

---

### Task 3: Add Homepage Aggregation Helpers

**Files:**

- Create: `src/entities/production-stage/lib/homeDashboard.ts`
- Modify: `src/entities/production-stage/lib/index.ts`

- [ ] **Step 1: Create aggregation helper file**

Create `src/entities/production-stage/lib/homeDashboard.ts` with this content:

```ts
import {
  type DashboardMetric,
  type DashboardStage,
  type HomeDashboardAttentionItem,
  type HomeDashboardBusinessUnit,
  type HomeDashboardChainItem,
  type HomeDashboardStatus,
  type HomeDashboardSummary,
  type HomeDashboardSummaryCard,
  type HomeDashboardTrendPoint
} from '../model/types'

const ATTENTION_LIMIT = 4

function formatDelta(delta: number | null): string {
  if (delta === null) {
    return 'нет данных'
  }

  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}%`
}

function formatMetricValue(value: number | null, fractionDigits = 1): string {
  if (value === null) {
    return 'нет данных'
  }

  return value.toLocaleString('ru-RU', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits
  })
}

function getMetricStatus(metric: DashboardMetric): HomeDashboardStatus {
  if (metric.value === null || metric.plan === null || metric.delta === null) {
    return 'neutral'
  }

  if (metric.status === 'danger') {
    return Math.abs(metric.delta) >= 10 ? 'danger' : 'warning'
  }

  if (metric.status === 'success') {
    return 'success'
  }

  return 'neutral'
}

function getWorstMetric(stage: DashboardStage): DashboardMetric | undefined {
  return [...stage.metrics].sort((first, second) => {
    const firstSeverity = first.status === 'danger' ? Math.abs(first.delta ?? 0) : -1
    const secondSeverity = second.status === 'danger' ? Math.abs(second.delta ?? 0) : -1
    return secondSeverity - firstSeverity
  })[0]
}

function getStageStatus(stage: DashboardStage): HomeDashboardStatus {
  const statuses = stage.metrics.map(getMetricStatus)

  if (statuses.includes('danger')) {
    return 'danger'
  }

  if (statuses.includes('warning')) {
    return 'warning'
  }

  if (statuses.every((status) => status === 'success')) {
    return 'success'
  }

  return 'neutral'
}

function getAttentionImpact(stage: DashboardStage, metric: DashboardMetric): string {
  if (stage.id === 'processing-feed') {
    return 'Влияет на выполнение плана переработки'
  }

  if (stage.id === 'transport') {
    return 'Возможное узкое место логистики'
  }

  if (stage.id === 'mining') {
    return 'Риск недопоставки в следующий передел'
  }

  return 'Требуется проверка причины отклонения'
}

function getAttentionItems(stages: DashboardStage[]): HomeDashboardAttentionItem[] {
  return stages
    .flatMap((stage) =>
      stage.metrics.map((metric) => ({
        stage,
        metric,
        status: getMetricStatus(metric)
      }))
    )
    .filter((item) => item.status === 'danger' || item.status === 'warning' || item.status === 'neutral')
    .sort((first, second) => Math.abs(second.metric.delta ?? 0) - Math.abs(first.metric.delta ?? 0))
    .slice(0, ATTENTION_LIMIT)
    .map(({ stage, metric, status }) => ({
      id: `${stage.id}-${metric.id}`,
      title: stage.title,
      metricTitle: metric.title,
      factLabel: formatMetricValue(metric.value, metric.valueFractionDigits ?? 1),
      planLabel: formatMetricValue(metric.plan, metric.planFractionDigits ?? 1),
      deltaLabel: formatDelta(metric.delta),
      impact: getAttentionImpact(stage, metric),
      status: status === 'success' ? 'warning' : status,
      href: metric.detailRoute ?? stage.detailRoute
    }))
}

function getSummaryCards(stages: DashboardStage[], attentionItems: HomeDashboardAttentionItem[]): HomeDashboardSummaryCard[] {
  const metrics = stages.flatMap((stage) => stage.metrics)
  const normalCount = metrics.filter((metric) => getMetricStatus(metric) === 'success').length
  const criticalCount = metrics.filter((metric) => getMetricStatus(metric) === 'danger').length
  const missingCount = metrics.filter((metric) => metric.value === null || metric.plan === null).length
  const worstItem = attentionItems[0]

  return [
    {
      id: 'normal-kpi',
      title: 'KPI в норме',
      value: `${normalCount}/${metrics.length}`,
      caption: 'по производственному контуру',
      status: criticalCount > 0 ? 'warning' : 'success'
    },
    {
      id: 'critical-kpi',
      title: 'Критично',
      value: String(criticalCount),
      caption: 'требуют внимания сегодня',
      status: criticalCount > 0 ? 'danger' : 'success'
    },
    {
      id: 'largest-gap',
      title: 'Макс. отклонение',
      value: worstItem?.deltaLabel ?? '0%',
      caption: worstItem ? worstItem.metricTitle : 'отклонений нет',
      status: worstItem?.status ?? 'success'
    },
    {
      id: 'missing-data',
      title: 'Нет данных',
      value: String(missingCount),
      caption: 'показателей без факта/плана',
      status: missingCount > 0 ? 'neutral' : 'success'
    }
  ]
}

function getChain(stages: DashboardStage[]): HomeDashboardChainItem[] {
  return stages.map((stage) => {
    const worstMetric = getWorstMetric(stage)
    const status = getStageStatus(stage)

    return {
      id: stage.id,
      title: stage.title,
      planText: `${stage.plan.completed}/${stage.plan.total}`,
      status,
      worstMetricTitle: worstMetric?.title ?? 'Нет показателей',
      worstMetricDeltaLabel: worstMetric ? formatDelta(worstMetric.delta) : 'нет данных',
      href: stage.detailRoute
    }
  })
}

export function getHomeDashboardSummary(
  stages: DashboardStage[],
  trend: HomeDashboardTrendPoint[],
  businessUnits: HomeDashboardBusinessUnit[]
): HomeDashboardSummary {
  const attentionItems = getAttentionItems(stages)
  const cards = getSummaryCards(stages, attentionItems)
  const hasCritical = attentionItems.some((item) => item.status === 'danger')

  return {
    status: hasCritical ? 'danger' : attentionItems.length > 0 ? 'warning' : 'success',
    statusTitle: hasCritical ? 'Есть критичные отклонения' : attentionItems.length > 0 ? 'Есть отклонения' : 'Все в норме',
    statusDescription:
      attentionItems[0] !== undefined
        ? `Основной риск: ${attentionItems[0].title}, ${attentionItems[0].metricTitle.toLowerCase()}`
        : 'Производственный контур идет по плану',
    cards,
    attentionItems,
    chain: getChain(stages),
    trend,
    businessUnits
  }
}
```

- [ ] **Step 2: Export helper**

Modify `src/entities/production-stage/lib/index.ts` to include:

```ts
export * from './homeDashboard'
export * from './miningStageMetrics'
export * from './productionStageDetails'
export * from './queryFilters'
export * from './routes'
```

- [ ] **Step 3: Run lint**

```powershell
npm.cmd run lint
```

Expected: no lint errors in `src/entities/production-stage/lib/homeDashboard.ts`.

- [ ] **Step 4: Commit**

```powershell
git add src/entities/production-stage/lib/homeDashboard.ts src/entities/production-stage/lib/index.ts
git commit -m "feat(home): derive dashboard summary data"
```

---

### Task 4: Scaffold Home Dashboard Widget

**Files:**

- Create: `src/widgets/home-dashboard/HomeDashboard.tsx`
- Create: `src/widgets/home-dashboard/HomeDashboard.module.css`
- Create: `src/widgets/home-dashboard/index.ts`
- Create: `src/widgets/home-dashboard/ui/index.ts`
- Modify: `src/widgets/index.ts`

- [ ] **Step 1: Create temporary UI barrel**

Create `src/widgets/home-dashboard/ui/index.ts`:

```ts
export {}
```

- [ ] **Step 2: Create initial widget**

Create `src/widgets/home-dashboard/HomeDashboard.tsx`:

```tsx
'use client'

import { Alert, Empty, Skeleton } from 'antd'

import {
  getHomeDashboardSummary,
  getProductionStageFiltersFromSearchParams,
  useGetProductionStagesQuery
} from '@/entities/production-stage'
import {
  homeDashboardBusinessUnits,
  homeDashboardTrend
} from '@/shared/mocks/production-stage/homeDashboard'

import styles from './HomeDashboard.module.css'

export function HomeDashboard() {
  const { data: stages = [], error, isLoading } = useGetProductionStagesQuery(
    getProductionStageFiltersFromSearchParams(new URLSearchParams())
  )

  if (isLoading) {
    return (
      <section className={styles.dashboard} aria-label="Главная сводка производства">
        <Skeleton active paragraph={{ rows: 10 }} title={false} />
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.dashboard} aria-label="Главная сводка производства">
        <Alert showIcon type="error" message="Не удалось загрузить главную сводку" />
      </section>
    )
  }

  if (stages.length === 0) {
    return (
      <section className={styles.dashboard} aria-label="Главная сводка производства">
        <Empty description="Нет данных для главной сводки" />
      </section>
    )
  }

  const summary = getHomeDashboardSummary(stages, homeDashboardTrend, homeDashboardBusinessUnits)

  return (
    <section className={styles.dashboard} aria-label="Главная сводка производства">
      <div className={styles.placeholder}>
        <h1>{summary.statusTitle}</h1>
        <p>{summary.statusDescription}</p>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create initial CSS**

Create `src/widgets/home-dashboard/HomeDashboard.module.css`:

```css
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
  padding: var(--space-5);
}

.placeholder {
  padding: var(--space-5);
  border: var(--border-width-hairline) solid var(--palette-border-soft);
  border-radius: var(--radius-5);
  background: var(--color-bg-card);
}

.placeholder h1 {
  color: var(--color-text-strong);
  font-size: var(--font-size-xl);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.placeholder p {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

@media (--screen-small) {
  .dashboard {
    padding: var(--space-3);
  }
}
```

- [ ] **Step 4: Export widget**

Create `src/widgets/home-dashboard/index.ts`:

```ts
export { HomeDashboard } from './HomeDashboard'
```

Modify `src/widgets/index.ts` to add:

```ts
export * from './home-dashboard'
```

- [ ] **Step 5: Run lint**

```powershell
npm.cmd run lint
```

Expected: no errors in the new `home-dashboard` files.

- [ ] **Step 6: Commit**

```powershell
git add src/widgets/home-dashboard src/widgets/index.ts
git commit -m "feat(home): scaffold dashboard widget"
```

---

### Task 5: Add Executive Summary UI

**Files:**

- Create: `src/widgets/home-dashboard/ui/ExecutiveSummary.tsx`
- Modify: `src/widgets/home-dashboard/ui/index.ts`
- Modify: `src/widgets/home-dashboard/HomeDashboard.tsx`
- Modify: `src/widgets/home-dashboard/HomeDashboard.module.css`

- [ ] **Step 1: Create component**

Create `src/widgets/home-dashboard/ui/ExecutiveSummary.tsx`:

```tsx
import classNames from 'classnames'

import { type HomeDashboardSummary } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ExecutiveSummaryProps = {
  summary: HomeDashboardSummary
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <section className={classNames(styles.summary, styles[`status-${summary.status}`])}>
      <div className={styles.summaryLead}>
        <span className={styles.summaryEyebrow}>Производственный контур</span>
        <h1>{summary.statusTitle}</h1>
        <p>{summary.statusDescription}</p>
      </div>
      <div className={styles.summaryCards}>
        {summary.cards.map((card) => (
          <article key={card.id} className={classNames(styles.summaryCard, styles[`status-${card.status}`])}>
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <p>{card.caption}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Export component**

Modify `src/widgets/home-dashboard/ui/index.ts`:

```ts
export { ExecutiveSummary } from './ExecutiveSummary'
```

- [ ] **Step 3: Render component**

Modify imports in `src/widgets/home-dashboard/HomeDashboard.tsx`:

```tsx
import { ExecutiveSummary } from './ui'
```

Replace the placeholder return content with:

```tsx
return (
  <section className={styles.dashboard} aria-label="Главная сводка производства">
    <ExecutiveSummary summary={summary} />
  </section>
)
```

- [ ] **Step 4: Replace placeholder CSS with summary CSS**

Remove `.placeholder` styles from `HomeDashboard.module.css` and add:

```css
.summary {
  display: grid;
  grid-template-columns: minmax(18rem, 0.9fr) minmax(0, 1.4fr);
  gap: var(--space-5);
  padding: var(--space-5);
  border: var(--border-width-hairline) solid var(--palette-border-soft);
  border-left: var(--border-width-strong) solid var(--status-color);
  border-radius: var(--radius-5);
  background: var(--color-bg-card);
}

.summaryLead {
  min-width: 0;
}

.summaryEyebrow {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.summaryLead h1 {
  margin-top: var(--space-2);
  color: var(--color-text-strong);
  font-size: var(--font-size-xl);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.summaryLead p {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.summaryCards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}

.summaryCard {
  min-width: 0;
  padding: var(--space-4);
  border: var(--border-width-hairline) solid var(--palette-border-soft);
  border-radius: var(--radius-5);
  background: var(--palette-status-neutral-bg);
}

.summaryCard span,
.summaryCard p {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1.25;
}

.summaryCard strong {
  display: block;
  margin-top: var(--space-2);
  color: var(--status-color);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0;
}

.summaryCard p {
  margin-top: var(--space-2);
}

.status-success {
  --status-color: var(--color-kpi-delta-positive);
  --status-bg: var(--palette-status-success-bg);
}

.status-warning {
  --status-color: var(--palette-status-warning);
  --status-bg: var(--palette-status-warning-bg);
}

.status-danger {
  --status-color: var(--color-kpi-delta-negative);
  --status-bg: var(--palette-status-danger-bg);
}

.status-neutral {
  --status-color: var(--color-kpi-neutral);
  --status-bg: var(--palette-status-neutral-bg);
}

@media (--screen-medium) {
  .summary {
    grid-template-columns: 1fr;
  }

  .summaryCards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (--screen-small) {
  .summary {
    padding: var(--space-4);
  }

  .summaryCards {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run lint**

```powershell
npm.cmd run lint
```

Expected: no lint errors in `ExecutiveSummary.tsx`.

- [ ] **Step 6: Commit**

```powershell
git add src/widgets/home-dashboard
git commit -m "feat(home): add executive summary"
```

---

### Task 6: Add Attention List and Trend Chart

**Files:**

- Create: `src/widgets/home-dashboard/ui/AttentionList.tsx`
- Create: `src/widgets/home-dashboard/ui/PlanFactTrend.tsx`
- Modify: `src/widgets/home-dashboard/ui/index.ts`
- Modify: `src/widgets/home-dashboard/HomeDashboard.tsx`
- Modify: `src/widgets/home-dashboard/HomeDashboard.module.css`

- [ ] **Step 1: Create attention list**

Create `src/widgets/home-dashboard/ui/AttentionList.tsx`:

```tsx
import Link from 'next/link'
import classNames from 'classnames'

import { type HomeDashboardAttentionItem } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type AttentionListProps = {
  items: HomeDashboardAttentionItem[]
}

export function AttentionList({ items }: AttentionListProps) {
  return (
    <section className={styles.panel} aria-labelledby="attention-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Приоритет</span>
          <h2 id="attention-title">Требуют внимания</h2>
        </div>
      </div>
      <div className={styles.attentionList}>
        {items.map((item) => {
          const content = (
            <article className={classNames(styles.attentionCard, styles[`status-${item.status}`])}>
              <div className={styles.attentionHeader}>
                <div>
                  <span>{item.title}</span>
                  <h3>{item.metricTitle}</h3>
                </div>
                <strong>{item.status === 'danger' ? 'Критично' : item.status === 'neutral' ? 'Нет данных' : 'Отклонение'}</strong>
              </div>
              <div className={styles.attentionMetric}>
                <span>Факт / план</span>
                <b>
                  {item.factLabel} / {item.planLabel}
                </b>
              </div>
              <div className={styles.attentionFooter}>
                <strong>{item.deltaLabel}</strong>
                <p>{item.impact}</p>
              </div>
            </article>
          )

          if (!item.href) {
            return <div key={item.id}>{content}</div>
          }

          return (
            <Link key={item.id} href={item.href} className={styles.cardLink}>
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create trend chart**

Create `src/widgets/home-dashboard/ui/PlanFactTrend.tsx`:

```tsx
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { type HomeDashboardTrendPoint } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type PlanFactTrendProps = {
  data: HomeDashboardTrendPoint[]
}

export function PlanFactTrend({ data }: PlanFactTrendProps) {
  const lastPoint = data[data.length - 1]
  const hasGap = lastPoint !== undefined && lastPoint.fact < lastPoint.plan

  return (
    <section className={styles.panel} aria-labelledby="trend-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Динамика</span>
          <h2 id="trend-title">План-факт накопительно</h2>
        </div>
        {lastPoint && <span className={styles.trendBadge}>{hasGap ? 'Отставание' : 'По плану'}</span>}
      </div>
      <div className={styles.trendChart} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="var(--palette-dashboard-grid-border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={48} />
            <Tooltip />
            <Legend verticalAlign="top" height={28} />
            {hasGap && (
              <ReferenceArea
                x1={data[Math.max(data.length - 3, 0)]?.label}
                x2={lastPoint.label}
                fill="var(--palette-status-danger-bg)"
              />
            )}
            <Line type="monotone" dataKey="plan" name="План" stroke="var(--color-kpi-plan)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fact" name="Факт" stroke="var(--color-kpi-fact)" strokeWidth={3} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Export components**

Modify `src/widgets/home-dashboard/ui/index.ts`:

```ts
export { AttentionList } from './AttentionList'
export { ExecutiveSummary } from './ExecutiveSummary'
export { PlanFactTrend } from './PlanFactTrend'
```

- [ ] **Step 4: Render two-column insight grid**

Modify imports in `HomeDashboard.tsx`:

```tsx
import { AttentionList, ExecutiveSummary, PlanFactTrend } from './ui'
```

Modify the success return:

```tsx
return (
  <section className={styles.dashboard} aria-label="Главная сводка производства">
    <ExecutiveSummary summary={summary} />
    <div className={styles.insightGrid}>
      <AttentionList items={summary.attentionItems} />
      <PlanFactTrend data={summary.trend} />
    </div>
  </section>
)
```

- [ ] **Step 5: Add CSS**

Append to `HomeDashboard.module.css`:

```css
.insightGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.8fr);
  gap: var(--space-5);
}

.panel {
  min-width: 0;
  padding: var(--space-5);
  border: var(--border-width-hairline) solid var(--palette-border-soft);
  border-radius: var(--radius-5);
  background: var(--color-bg-card);
}

.panelHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.panelEyebrow {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.panelHeader h2 {
  margin-top: var(--space-1);
  color: var(--color-text-strong);
  font-size: var(--font-size-lg);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.attentionList {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.cardLink {
  display: block;
  color: inherit;
  outline: none;
}

.cardLink:hover .attentionCard,
.cardLink:focus-visible .attentionCard {
  background: var(--palette-accent-wash);
}

.attentionCard {
  min-height: 12rem;
  padding: var(--space-4);
  border: var(--border-width-hairline) solid var(--palette-border-soft);
  border-left: var(--border-width-strong) solid var(--status-color);
  border-radius: var(--radius-5);
  background: var(--color-bg-card);
  transition: background 160ms ease;
}

.attentionHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.attentionHeader span,
.attentionMetric span {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1.25;
}

.attentionHeader h3 {
  margin-top: var(--space-1);
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0;
}

.attentionHeader strong,
.trendBadge {
  flex: 0 0 auto;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-5);
  color: var(--status-color);
  font-size: var(--font-size-xs);
  font-weight: 800;
  line-height: 1;
  background: var(--status-bg);
}

.attentionMetric {
  margin-top: var(--space-4);
}

.attentionMetric b {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-text-strong);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.1;
}

.attentionFooter {
  margin-top: var(--space-4);
}

.attentionFooter strong {
  color: var(--status-color);
  font-size: var(--font-size-lg);
  font-weight: 800;
  line-height: 1.1;
}

.attentionFooter p {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1.35;
}

.trendBadge {
  --status-color: var(--palette-status-warning);
  --status-bg: var(--palette-status-warning-bg);
}

.trendChart {
  width: 100%;
  height: 19rem;
}

@media (--screen-medium) {
  .insightGrid {
    grid-template-columns: 1fr;
  }
}

@media (--screen-tablet) {
  .attentionList {
    grid-template-columns: 1fr;
  }
}

@media (--screen-small) {
  .panel {
    padding: var(--space-4);
  }
}
```

- [ ] **Step 6: Run lint and build**

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands complete successfully.

- [ ] **Step 7: Commit**

```powershell
git add src/widgets/home-dashboard
git commit -m "feat(home): add attention cards and trend chart"
```

---

### Task 7: Add Production Chain and Business Unit Health

**Files:**

- Create: `src/widgets/home-dashboard/ui/ProductionChain.tsx`
- Create: `src/widgets/home-dashboard/ui/BusinessUnitHealthGrid.tsx`
- Modify: `src/widgets/home-dashboard/ui/index.ts`
- Modify: `src/widgets/home-dashboard/HomeDashboard.tsx`
- Modify: `src/widgets/home-dashboard/HomeDashboard.module.css`

- [ ] **Step 1: Create production chain**

Create `src/widgets/home-dashboard/ui/ProductionChain.tsx`:

```tsx
import Link from 'next/link'
import classNames from 'classnames'

import { type HomeDashboardChainItem } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ProductionChainProps = {
  items: HomeDashboardChainItem[]
}

export function ProductionChain({ items }: ProductionChainProps) {
  return (
    <section className={styles.panel} aria-labelledby="chain-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Цепочка</span>
          <h2 id="chain-title">Производственный поток</h2>
        </div>
      </div>
      <div className={styles.chain}>
        {items.map((item) => {
          const content = (
            <article className={classNames(styles.chainItem, styles[`status-${item.status}`])}>
              <div className={styles.chainTop}>
                <h3>{item.title}</h3>
                <strong>{item.planText}</strong>
              </div>
              <p>{item.worstMetricTitle}</p>
              <span>{item.worstMetricDeltaLabel}</span>
            </article>
          )

          if (!item.href) {
            return <div key={item.id}>{content}</div>
          }

          return (
            <Link key={item.id} href={item.href} className={styles.cardLink}>
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create business-unit grid**

Create `src/widgets/home-dashboard/ui/BusinessUnitHealthGrid.tsx`:

```tsx
import classNames from 'classnames'

import { type HomeDashboardBusinessUnit } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type BusinessUnitHealthGridProps = {
  units: HomeDashboardBusinessUnit[]
}

export function BusinessUnitHealthGrid({ units }: BusinessUnitHealthGridProps) {
  return (
    <section className={styles.panel} aria-labelledby="business-units-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Месторождения</span>
          <h2 id="business-units-title">Состояние по активам</h2>
        </div>
      </div>
      <div className={styles.businessGrid}>
        {units.map((unit) => (
          <article key={unit.id} className={classNames(styles.businessCard, styles[`status-${unit.status}`])}>
            <div className={styles.businessHeader}>
              <h3>{unit.title}</h3>
              <strong>{unit.status === 'danger' ? 'Критично' : unit.status === 'warning' ? 'Отклонение' : 'В норме'}</strong>
            </div>
            <p>
              {unit.worstMetricTitle}: <span>{unit.worstMetricDeltaLabel}</span>
            </p>
            <b>{unit.contributionLabel}</b>
            <dl>
              {unit.metrics.map((metric) => (
                <div key={metric.id}>
                  <dt>{metric.title}</dt>
                  <dd className={styles[`status-${metric.status}`]}>
                    {metric.value} <span>{metric.deltaLabel}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Export components**

Modify `src/widgets/home-dashboard/ui/index.ts`:

```ts
export { AttentionList } from './AttentionList'
export { BusinessUnitHealthGrid } from './BusinessUnitHealthGrid'
export { ExecutiveSummary } from './ExecutiveSummary'
export { PlanFactTrend } from './PlanFactTrend'
export { ProductionChain } from './ProductionChain'
```

- [ ] **Step 4: Render components**

Modify imports in `HomeDashboard.tsx`:

```tsx
import {
  AttentionList,
  BusinessUnitHealthGrid,
  ExecutiveSummary,
  PlanFactTrend,
  ProductionChain
} from './ui'
```

Modify the success return:

```tsx
return (
  <section className={styles.dashboard} aria-label="Главная сводка производства">
    <ExecutiveSummary summary={summary} />
    <div className={styles.insightGrid}>
      <AttentionList items={summary.attentionItems} />
      <PlanFactTrend data={summary.trend} />
    </div>
    <ProductionChain items={summary.chain} />
    <BusinessUnitHealthGrid units={summary.businessUnits} />
  </section>
)
```

- [ ] **Step 5: Add CSS**

Append to `HomeDashboard.module.css`:

```css
.chain {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-3);
}

.chainItem {
  min-height: 9rem;
  padding: var(--space-4);
  border: var(--border-width-hairline) solid var(--palette-border-soft);
  border-top: var(--border-width-strong) solid var(--status-color);
  border-radius: var(--radius-5);
  background: var(--color-bg-card);
  transition: background 160ms ease;
}

.chainTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.chainTop h3,
.businessHeader h3 {
  min-width: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0;
}

.chainTop strong {
  flex: 0 0 auto;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-5);
  color: var(--status-color);
  font-size: var(--font-size-xs);
  font-weight: 800;
  line-height: 1;
  background: var(--status-bg);
}

.chainItem p,
.businessCard p {
  margin-top: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1.35;
}

.chainItem span,
.businessCard p span {
  display: inline-block;
  margin-top: var(--space-2);
  color: var(--status-color);
  font-size: var(--font-size-sm);
  font-weight: 800;
  line-height: 1.15;
}

.businessGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
}

.businessCard {
  min-width: 0;
  padding: var(--space-4);
  border: var(--border-width-hairline) solid var(--palette-border-soft);
  border-left: var(--border-width-strong) solid var(--status-color);
  border-radius: var(--radius-5);
  background: var(--color-bg-card);
}

.businessHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.businessHeader strong {
  flex: 0 0 auto;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-5);
  color: var(--status-color);
  font-size: var(--font-size-xs);
  font-weight: 800;
  line-height: 1;
  background: var(--status-bg);
}

.businessCard > b {
  display: block;
  margin-top: var(--space-3);
  color: var(--status-color);
  font-size: var(--font-size-sm);
  font-weight: 800;
  line-height: 1.2;
}

.businessCard dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.businessCard dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1.25;
}

.businessCard dd {
  margin-top: var(--space-1);
  color: var(--status-color);
  font-size: var(--font-size-sm);
  font-weight: 800;
  line-height: 1.15;
}

.businessCard dd span {
  display: block;
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
}

@media (--screen-medium) {
  .chain {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .businessGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (--screen-tablet) {
  .chain {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (--screen-small) {
  .chain,
  .businessGrid,
  .businessCard dl {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Run lint and build**

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands complete successfully.

- [ ] **Step 7: Commit**

```powershell
git add src/widgets/home-dashboard
git commit -m "feat(home): add production chain and assets"
```

---

### Task 8: Wire Homepage Route

**Files:**

- Modify: `src/app/page.tsx`
- Modify: `src/app/page.module.css`

- [ ] **Step 1: Replace placeholder page content**

Modify `src/app/page.tsx` to:

```tsx
import { Suspense } from 'react'

import { PageShell, PageSurface } from '@/shared/ui'
import { ContentHeader, homeBreadcrumbIcon, HomeDashboard } from '@/widgets'

export default function Home() {
  return (
    <PageShell>
      <ContentHeader
        breadcrumbs={[{ label: 'Главная', icon: homeBreadcrumbIcon }]}
        showBusinessUnitFilter={false}
        showDateFilter={false}
      />
      <PageSurface variant="constrained">
        <Suspense fallback={null}>
          <HomeDashboard />
        </Suspense>
      </PageSurface>
    </PageShell>
  )
}
```

- [ ] **Step 2: Remove unused page CSS**

Delete all content from `src/app/page.module.css` or remove the file only if no imports reference it. Because the new `page.tsx` no longer imports `styles`, the file can remain empty or be deleted. Prefer leaving it empty only if the project expects the file to exist.

- [ ] **Step 3: Run lint and build**

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands complete successfully and no unused import remains in `src/app/page.tsx`.

- [ ] **Step 4: Commit**

```powershell
git add src/app/page.tsx src/app/page.module.css
git commit -m "feat(home): render redesigned dashboard"
```

---

### Task 9: Visual QA and Final Verification

**Files:**

- No required code changes unless QA finds layout issues.

- [ ] **Step 1: Start dev server**

Run:

```powershell
npm.cmd run dev
```

Expected: Next.js starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 2: Inspect desktop viewport**

Open `http://localhost:3000` at a desktop width.

Confirm:

- top summary is visible without scrolling;
- "Требуют внимания" and the trend chart are visible near the top;
- production chain appears below the insight grid;
- business-unit cards are compact and not duplicating the full detailed table;
- no text overlaps inside cards or badges.

- [ ] **Step 3: Inspect narrow viewport**

Open the same route at a mobile/narrow width.

Confirm:

- summary cards stack cleanly;
- attention cards are single-column;
- chart is below attention cards;
- production chain is vertical or two-column without overflow;
- no horizontal page scroll.

- [ ] **Step 4: Run final commands**

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands complete successfully.

- [ ] **Step 5: Commit QA fixes if any**

If QA required CSS/code changes:

```powershell
git add src
git commit -m "fix(home): polish dashboard responsive layout"
```

If no changes were required, do not create an empty commit.

---

## Self-Review Checklist

- The plan implements the recommended Variant B from the design spec.
- `src/app/page.tsx` stays thin and server-first.
- Client logic lives inside `src/widgets/home-dashboard/HomeDashboard.tsx`.
- Domain calculations live in `src/entities/production-stage/lib/homeDashboard.ts`.
- No new dependencies are introduced.
- Recharts is reused for the single plan/fact trend chart.
- Existing detail routes remain unchanged.
- Existing production-stage table and detail pages remain unchanged.
- Lint and build are required before final handoff.

## Execution Options

Plan complete. Recommended execution mode is subagent-driven because the tasks are independent enough to review in slices:

1. Domain data and helpers.
2. Widget scaffold and summary.
3. Attention/chart.
4. Chain/business-unit sections.
5. Route wiring and QA.
