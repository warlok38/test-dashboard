# Home Dashboard Production Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current homepage with a Production Cockpit that shows plan execution, production deviations, likely causes, affected assets, and drill-down entry points.

**Architecture:** Keep `src/app/page.tsx` thin and reuse the existing `src/widgets/home-dashboard` boundary. Move the homepage domain contract toward cockpit-specific data types and pure view-model helpers in `src/entities/production-stage`, with realistic mock data in `src/shared/mocks/production-stage`. Build the UI as composable widget components styled in one CSS module, guided by the user's Muzli/Zajno references rather than the generated prototype image.

**Tech Stack:** Next.js App Router, React 18, TypeScript, CSS Modules, Ant Design v6, Recharts, Redux Toolkit Query, existing Feature-Sliced project structure.

---

## Source Inputs

- Design spec: `docs/superpowers/specs/2026-07-01-home-dashboard-production-cockpit-design.md`
- Existing homepage implementation: `src/widgets/home-dashboard`
- Existing domain API/mocks: `src/entities/production-stage`, `src/shared/mocks/production-stage`
- Visual direction: the user's Muzli/Zajno dashboard screenshots and URL reference. Use the generated mockup only as a composition sanity check, not as a pixel target.

## UX Direction

The homepage should feel like a modern light SaaS analytics dashboard:

- soft off-white workspace;
- white rounded cards;
- compact status/delta pills;
- one dominant plan-fact chart;
- lists and tables with lightweight row separators;
- semantic status colors only;
- no strategic "resource base" block in the first version;
- no abstract "bottlenecks" widget unless backed by reason data.

The product story should be:

1. "Are we on plan?"
2. "Which production KPI is off?"
3. "Which asset is responsible?"
4. "What likely caused it?"
5. "Where do I click next?"

## MVP Scope

Implement in this first production-cockpit iteration:

- `ProductionKpiStrip`;
- `PlanFactChart`;
- `DeviationReasonsList`;
- `AssetPerformanceTable`;
- `ProductionEventsList`;
- partial `ProductionFlow` only if it fits below the first screen without crowding;
- loading, empty, and error states matching the new layout.

Defer:

- dark/operator mode;
- forecasts;
- editable thresholds;
- full event drill-down;
- strategic reserves/resources widgets;
- exact pixel match to the generated mockup.

## File Structure

Modify:

- `src/entities/production-stage/model/types.ts` - replace/extend old home summary types with cockpit domain types.
- `src/entities/production-stage/index.ts` - export new cockpit types/helpers.
- `src/entities/production-stage/lib/homeDashboard.ts` - derive a cockpit view model from mock/source data.
- `src/entities/production-stage/lib/index.ts` - keep helper exports.
- `src/shared/mocks/production-stage/homeDashboard.ts` - replace old generic homepage mocks with cockpit mocks.
- `src/widgets/home-dashboard/HomeDashboard.tsx` - compose cockpit widgets and route state.
- `src/widgets/home-dashboard/HomeDashboard.module.css` - rebuild layout and visual treatment.
- `src/widgets/home-dashboard/ui/index.ts` - export new UI components.
- `src/app/page.tsx` - keep route thin; only adjust header copy/filter visibility if needed.

Create:

- `src/widgets/home-dashboard/ui/ProductionKpiStrip.tsx`
- `src/widgets/home-dashboard/ui/PlanFactChart.tsx`
- `src/widgets/home-dashboard/ui/DeviationReasonsList.tsx`
- `src/widgets/home-dashboard/ui/AssetPerformanceTable.tsx`
- `src/widgets/home-dashboard/ui/ProductionEventsList.tsx`
- `src/widgets/home-dashboard/ui/ProductionFlow.tsx`
- `src/widgets/home-dashboard/ui/PeriodControls.tsx`

Remove or replace:

- `src/widgets/home-dashboard/ui/ExecutiveSummary.tsx`
- `src/widgets/home-dashboard/ui/AttentionList.tsx`
- `src/widgets/home-dashboard/ui/PlanFactTrend.tsx`
- `src/widgets/home-dashboard/ui/BusinessUnitHealthGrid.tsx`
- old `ProductionChain.tsx`, unless it is rewritten into `ProductionFlow`.

---

### Task 1: Replace Homepage Domain Contract

**Files:**

- Modify: `src/entities/production-stage/model/types.ts`
- Modify: `src/entities/production-stage/index.ts`

- [ ] **Step 1: Add cockpit types**

Add these types after `HomeDashboardStatus` and before detailed metric types. Keep `HomeDashboardStatus` if it is already used elsewhere.

```ts
export type HomeDashboardReasonType =
  | 'downtime'
  | 'kio'
  | 'ktg'
  | 'maintenance'
  | 'mill-constraint'
  | 'logistics'
  | 'grade'
  | 'data'
  | 'unclassified'

export type HomeDashboardMetricDirection = 'higher-is-better' | 'lower-is-better'

export type HomeDashboardKpi = {
  id: string
  title: string
  value: string
  unit?: string
  caption: string
  deltaLabel: string
  status: HomeDashboardStatus
  href?: string
}

export type HomeDashboardTrendMetric = 'gold' | 'ore-mined' | 'ore-processed' | 'recovery' | 'au-grade'

export type HomeDashboardTrendPoint = {
  label: string
  fact: number
  plan: number
  event?: HomeDashboardReasonType
}

export type HomeDashboardTrend = {
  activeMetric: HomeDashboardTrendMetric
  tabs: Array<{
    id: HomeDashboardTrendMetric
    label: string
  }>
  unit: string
  factTotal: string
  planTotal: string
  deltaTotal: string
  status: HomeDashboardStatus
  points: HomeDashboardTrendPoint[]
}

export type HomeDashboardDeviation = {
  id: string
  assetTitle: string
  stageTitle: string
  metricTitle: string
  factPlanLabel: string
  deltaLabel: string
  reasonType: HomeDashboardReasonType
  reasonTitle: string
  impactLabel: string
  status: Exclude<HomeDashboardStatus, 'success'>
  href?: string
}

export type HomeDashboardAsset = {
  id: BusinessUnitSlug
  title: string
  status: HomeDashboardStatus
  goldLabel: string
  oreMinedLabel: string
  oreProcessedLabel: string
  recoveryLabel: string
  primaryReasonTitle: string
  contributionLabel: string
  contributionPercent: number
  href?: string
}

export type HomeDashboardFlowStage = {
  id: string
  title: string
  factPlanLabel: string
  deltaLabel: string
  status: HomeDashboardStatus
  reasonTitle?: string
  href?: string
}

export type HomeDashboardEvent = {
  id: string
  timeLabel: string
  assetTitle: string
  title: string
  durationLabel: string
  status: HomeDashboardStatus
  linkedDeviationId?: string
  href?: string
}

export type HomeDashboardPeriodControls = {
  periodLabel: string
  shiftLabel: string
  assetLabel: string
  updatedAtLabel: string
}

export type HomeDashboardSummary = {
  title: string
  subtitle: string
  controls: HomeDashboardPeriodControls
  kpis: HomeDashboardKpi[]
  trend: HomeDashboardTrend
  deviations: HomeDashboardDeviation[]
  assets: HomeDashboardAsset[]
  flow: HomeDashboardFlowStage[]
  events: HomeDashboardEvent[]
}
```

- [ ] **Step 2: Remove superseded old home types**

Remove these old types if no file uses them after the new components are planned:

```ts
HomeDashboardSummaryCard
HomeDashboardAttentionItem
HomeDashboardChainItem
HomeDashboardBusinessUnit
```

If TypeScript reports usage during implementation, keep a compatibility export only until the affected component is replaced in the next task.

- [ ] **Step 3: Update public exports**

Update the type export block in `src/entities/production-stage/index.ts` to include the new cockpit types:

```ts
export type {
  DashboardMetric,
  DashboardMetricStatus,
  DashboardStage,
  HomeDashboardAsset,
  HomeDashboardDeviation,
  HomeDashboardEvent,
  HomeDashboardFlowStage,
  HomeDashboardKpi,
  HomeDashboardMetricDirection,
  HomeDashboardPeriodControls,
  HomeDashboardReasonType,
  HomeDashboardStatus,
  HomeDashboardSummary,
  HomeDashboardTrend,
  HomeDashboardTrendMetric,
  HomeDashboardTrendPoint
} from './model/types'
```

- [ ] **Step 4: Run type/lint check**

Run:

```powershell
npm.cmd run lint
```

Expected at this stage: lint may fail because old UI components still reference removed home types. If so, note the exact affected files and continue to Task 2/4 where they are replaced. There must be no parser error in `types.ts`.

- [ ] **Step 5: Commit**

```powershell
git add src/entities/production-stage/model/types.ts src/entities/production-stage/index.ts
git commit -m "feat(home): define production cockpit types"
```

---

### Task 2: Replace Homepage Mock Data

**Files:**

- Modify: `src/shared/mocks/production-stage/homeDashboard.ts`

- [ ] **Step 1: Replace generic mocks with cockpit mocks**

Replace the file with mock data shaped around production KPIs, deviations, assets, flow, and events.

```ts
import { type HomeDashboardSummary } from '@/entities/production-stage/model/types'

export const homeDashboardSummaryMock: HomeDashboardSummary = {
  title: 'Производственная сводка',
  subtitle: '26 июня 2026 · смена 1',
  controls: {
    periodLabel: 'Сутки',
    shiftLabel: 'Смена 1',
    assetLabel: 'Все активы',
    updatedAtLabel: 'Обновлено 09:14 МСК'
  },
  kpis: [
    {
      id: 'gold-produced',
      title: 'Золото произведено',
      value: '8.24',
      unit: 'тыс. унц',
      caption: 'к плану за сутки',
      deltaLabel: '-4.1%',
      status: 'danger'
    },
    {
      id: 'ore-mined',
      title: 'Руда добыта',
      value: '98.0',
      unit: 'тыс. т',
      caption: 'к плану за сутки',
      deltaLabel: '-6.2%',
      status: 'danger'
    },
    {
      id: 'ore-processed',
      title: 'Руда переработана',
      value: '50.5',
      unit: 'тыс. т',
      caption: 'к плану за сутки',
      deltaLabel: '+1.7%',
      status: 'success'
    },
    {
      id: 'recovery',
      title: 'Извлечение',
      value: '84.2',
      unit: '%',
      caption: 'к плану за сутки',
      deltaLabel: '-1.1 п.п.',
      status: 'warning'
    },
    {
      id: 'au-grade',
      title: 'Содержание Au',
      value: '1.42',
      unit: 'г/т',
      caption: 'в переработанной руде',
      deltaLabel: '-3.4%',
      status: 'warning'
    },
    {
      id: 'health',
      title: 'KPI в норме',
      value: '11 / 16',
      caption: 'по производственному контуру',
      deltaLabel: '3 критично',
      status: 'danger'
    }
  ],
  trend: {
    activeMetric: 'gold',
    unit: 'тыс. унц',
    factTotal: '8.24',
    planTotal: '8.60',
    deltaTotal: '-0.36',
    status: 'danger',
    tabs: [
      { id: 'gold', label: 'Золото' },
      { id: 'ore-mined', label: 'Руда добыта' },
      { id: 'ore-processed', label: 'Руда переработана' },
      { id: 'recovery', label: 'Извлечение' },
      { id: 'au-grade', label: 'Au' }
    ],
    points: [
      { label: '00:00', fact: 0.0, plan: 0.0 },
      { label: '04:00', fact: 1.2, plan: 1.35 },
      { label: '08:00', fact: 2.7, plan: 2.85, event: 'downtime' },
      { label: '12:00', fact: 4.1, plan: 4.3 },
      { label: '16:00', fact: 5.7, plan: 5.95, event: 'mill-constraint' },
      { label: '20:00', fact: 7.0, plan: 7.2 },
      { label: '24:00', fact: 8.24, plan: 8.6 }
    ]
  },
  deviations: [
    {
      id: 'natalka-ore-processed',
      assetTitle: 'Наталка',
      stageTitle: 'Переработка',
      metricTitle: 'Руда переработана',
      factPlanLabel: '42.1 / 46.0 тыс. т',
      deltaLabel: '-8.5%',
      reasonType: 'mill-constraint',
      reasonTitle: 'Ограничение фабрики',
      impactLabel: '-0.42 тыс. унц',
      status: 'danger'
    },
    {
      id: 'kuranah-au-grade',
      assetTitle: 'Куранах',
      stageTitle: 'Добыча',
      metricTitle: 'Содержание Au',
      factPlanLabel: '1.31 / 1.42 г/т',
      deltaLabel: '-7.7%',
      reasonType: 'grade',
      reasonTitle: 'Качество руды',
      impactLabel: '-0.18 тыс. унц',
      status: 'warning'
    },
    {
      id: 'olimpiada-kio-trucks',
      assetTitle: 'Олимпиада',
      stageTitle: 'Транспорт',
      metricTitle: 'КИО самосвалов',
      factPlanLabel: '64.3 / 71.0%',
      deltaLabel: '-6.7 п.п.',
      reasonType: 'downtime',
      reasonTitle: 'Простой',
      impactLabel: '-0.12 тыс. унц',
      status: 'warning'
    },
    {
      id: 'blagodatnoe-ktg-data',
      assetTitle: 'Благодатное',
      stageTitle: 'Ремонт',
      metricTitle: 'КТГ фабрики',
      factPlanLabel: 'нет данных',
      deltaLabel: '--',
      reasonType: 'data',
      reasonTitle: 'Источник данных',
      impactLabel: 'Проверить',
      status: 'neutral'
    }
  ],
  assets: [
    {
      id: 'olimpiada',
      title: 'Олимпиада',
      status: 'success',
      goldLabel: '3.18 тыс. унц',
      oreMinedLabel: '32.4 тыс. т',
      oreProcessedLabel: '15.6 тыс. т',
      recoveryLabel: '86.1%',
      primaryReasonTitle: 'В норме',
      contributionLabel: '+0.08 тыс. унц',
      contributionPercent: 16
    },
    {
      id: 'natalka',
      title: 'Наталка',
      status: 'danger',
      goldLabel: '1.82 тыс. унц',
      oreMinedLabel: '24.8 тыс. т',
      oreProcessedLabel: '12.4 тыс. т',
      recoveryLabel: '82.4%',
      primaryReasonTitle: 'Ограничение фабрики',
      contributionLabel: '-0.42 тыс. унц',
      contributionPercent: -42
    },
    {
      id: 'blagodatnoe',
      title: 'Благодатное',
      status: 'success',
      goldLabel: '1.36 тыс. унц',
      oreMinedLabel: '16.2 тыс. т',
      oreProcessedLabel: '8.7 тыс. т',
      recoveryLabel: '85.0%',
      primaryReasonTitle: 'В норме',
      contributionLabel: '+0.03 тыс. унц',
      contributionPercent: 6
    },
    {
      id: 'kuranah',
      title: 'Куранах',
      status: 'warning',
      goldLabel: '0.74 тыс. унц',
      oreMinedLabel: '10.1 тыс. т',
      oreProcessedLabel: '5.2 тыс. т',
      recoveryLabel: '80.9%',
      primaryReasonTitle: 'Качество руды',
      contributionLabel: '-0.18 тыс. унц',
      contributionPercent: -18
    },
    {
      id: 'suhoy-log',
      title: 'Сухой Лог',
      status: 'neutral',
      goldLabel: '1.14 тыс. унц',
      oreMinedLabel: '14.5 тыс. т',
      oreProcessedLabel: '8.6 тыс. т',
      recoveryLabel: 'нет данных',
      primaryReasonTitle: 'Источник данных',
      contributionLabel: '--',
      contributionPercent: 0
    }
  ],
  flow: [
    {
      id: 'rock-mass',
      title: 'Горная масса',
      factPlanLabel: '318 / 306 тыс. м3',
      deltaLabel: '+3.9%',
      status: 'success'
    },
    {
      id: 'ore-mined',
      title: 'Руда добыта',
      factPlanLabel: '98.0 / 104.5 тыс. т',
      deltaLabel: '-6.2%',
      status: 'danger',
      reasonTitle: 'КИО транспорта'
    },
    {
      id: 'transport',
      title: 'Транспорт',
      factPlanLabel: '64.3 / 71.0%',
      deltaLabel: '-6.7 п.п.',
      status: 'warning',
      reasonTitle: 'Простой'
    },
    {
      id: 'ore-processed',
      title: 'Руда переработана',
      factPlanLabel: '50.5 / 49.7 тыс. т',
      deltaLabel: '+1.7%',
      status: 'success'
    },
    {
      id: 'recovery',
      title: 'Извлечение',
      factPlanLabel: '84.2 / 85.3%',
      deltaLabel: '-1.1 п.п.',
      status: 'warning'
    },
    {
      id: 'gold',
      title: 'Золото',
      factPlanLabel: '8.24 / 8.60 тыс. унц',
      deltaLabel: '-4.1%',
      status: 'danger'
    }
  ],
  events: [
    {
      id: 'event-natalka-mill',
      timeLabel: '09:05',
      assetTitle: 'Наталка',
      title: 'Ограничение фабрики',
      durationLabel: '42 мин',
      status: 'danger',
      linkedDeviationId: 'natalka-ore-processed'
    },
    {
      id: 'event-olimpiada-truck',
      timeLabel: '08:20',
      assetTitle: 'Олимпиада',
      title: 'Простой самосвала',
      durationLabel: '18 мин',
      status: 'warning',
      linkedDeviationId: 'olimpiada-kio-trucks'
    },
    {
      id: 'event-blagodatnoe-data',
      timeLabel: '07:40',
      assetTitle: 'Благодатное',
      title: 'Нет данных по КТГ',
      durationLabel: 'требует проверки',
      status: 'neutral',
      linkedDeviationId: 'blagodatnoe-ktg-data'
    }
  ]
}
```

- [ ] **Step 2: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: the mock file itself has no TypeScript/lint errors. Component errors from old imports are acceptable until Task 4.

- [ ] **Step 3: Commit**

```powershell
git add src/shared/mocks/production-stage/homeDashboard.ts
git commit -m "feat(home): add production cockpit mock data"
```

---

### Task 3: Simplify View-Model Helper

**Files:**

- Modify: `src/entities/production-stage/lib/homeDashboard.ts`

- [ ] **Step 1: Replace old aggregation helper**

For the MVP, avoid premature inference from old stage cards. Return the cockpit mock summary through a small pure helper so the UI has a stable interface.

```ts
import { type HomeDashboardSummary } from '../model/types'

export function getHomeDashboardSummary(summary: HomeDashboardSummary): HomeDashboardSummary {
  return summary
}

export function getHomeDashboardHasCritical(summary: HomeDashboardSummary): boolean {
  return (
    summary.kpis.some((kpi) => kpi.status === 'danger') ||
    summary.deviations.some((deviation) => deviation.status === 'danger') ||
    summary.assets.some((asset) => asset.status === 'danger')
  )
}
```

This is intentionally simple. The next backend/API integration can replace the mock source with real data without changing UI components.

- [ ] **Step 2: Verify exports**

Open `src/entities/production-stage/lib/index.ts` and keep:

```ts
export * from './homeDashboard'
export * from './miningStageMetrics'
export * from './productionStageDetails'
export * from './queryFilters'
export * from './routes'
```

- [ ] **Step 3: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: no parser errors in `homeDashboard.ts`.

- [ ] **Step 4: Commit**

```powershell
git add src/entities/production-stage/lib/homeDashboard.ts src/entities/production-stage/lib/index.ts
git commit -m "feat(home): expose production cockpit summary"
```

---

### Task 4: Recompose HomeDashboard Shell

**Files:**

- Modify: `src/widgets/home-dashboard/HomeDashboard.tsx`
- Modify: `src/widgets/home-dashboard/ui/index.ts`

- [ ] **Step 1: Replace old widget imports**

Replace old UI imports with the new cockpit components:

```tsx
import { Alert, Empty, Skeleton } from 'antd'

import { getHomeDashboardSummary } from '@/entities/production-stage'
import { homeDashboardSummaryMock } from '@/shared/mocks/production-stage/homeDashboard'

import styles from './HomeDashboard.module.css'
import {
  AssetPerformanceTable,
  DeviationReasonsList,
  PeriodControls,
  PlanFactChart,
  ProductionEventsList,
  ProductionFlow,
  ProductionKpiStrip
} from './ui'
```

- [ ] **Step 2: Replace component body**

Use the existing API state only if it is still required for app-level loading. For MVP cockpit mocks, render the mock summary directly so visual and UX work can proceed independently from backend shape.

```tsx
export function HomeDashboard() {
  const summary = getHomeDashboardSummary(homeDashboardSummaryMock)

  if (!summary) {
    return (
      <section className={styles.dashboard} aria-label="Главная сводка производства">
        <Empty description="Нет данных для производственной сводки" />
      </section>
    )
  }

  return (
    <section className={styles.dashboard} aria-label="Главная сводка производства">
      <div className={styles.header}>
        <div>
          <h1>{summary.title}</h1>
          <p>
            {summary.subtitle} · {summary.controls.updatedAtLabel}
          </p>
        </div>
        <PeriodControls controls={summary.controls} />
      </div>

      <ProductionKpiStrip items={summary.kpis} />

      <div className={styles.primaryGrid}>
        <PlanFactChart trend={summary.trend} />
        <DeviationReasonsList items={summary.deviations} />
      </div>

      <ProductionFlow items={summary.flow} />

      <div className={styles.secondaryGrid}>
        <AssetPerformanceTable assets={summary.assets} />
        <ProductionEventsList events={summary.events} />
      </div>
    </section>
  )
}
```

Remove unused `useSearchParams`, `useGetProductionStagesQuery`, `Alert`, and `Skeleton` imports if they are not used. Keep `Alert`/`Skeleton` only if you retain API loading in this task.

- [ ] **Step 3: Update UI barrel**

Set `src/widgets/home-dashboard/ui/index.ts` to:

```ts
export { AssetPerformanceTable } from './AssetPerformanceTable'
export { DeviationReasonsList } from './DeviationReasonsList'
export { PeriodControls } from './PeriodControls'
export { PlanFactChart } from './PlanFactChart'
export { ProductionEventsList } from './ProductionEventsList'
export { ProductionFlow } from './ProductionFlow'
export { ProductionKpiStrip } from './ProductionKpiStrip'
```

- [ ] **Step 4: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: lint fails only because the new UI component files do not exist yet. There must be no unused import errors in `HomeDashboard.tsx`.

- [ ] **Step 5: Commit**

Commit after Task 5 creates the missing UI files, so this task can remain uncommitted for one task boundary.

---

### Task 5: Add Cockpit UI Components

**Files:**

- Create: `src/widgets/home-dashboard/ui/PeriodControls.tsx`
- Create: `src/widgets/home-dashboard/ui/ProductionKpiStrip.tsx`
- Create: `src/widgets/home-dashboard/ui/PlanFactChart.tsx`
- Create: `src/widgets/home-dashboard/ui/DeviationReasonsList.tsx`
- Create: `src/widgets/home-dashboard/ui/ProductionFlow.tsx`
- Create: `src/widgets/home-dashboard/ui/AssetPerformanceTable.tsx`
- Create: `src/widgets/home-dashboard/ui/ProductionEventsList.tsx`

- [ ] **Step 1: Add PeriodControls**

```tsx
import { type HomeDashboardPeriodControls } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type PeriodControlsProps = {
  controls: HomeDashboardPeriodControls
}

export function PeriodControls({ controls }: PeriodControlsProps) {
  return (
    <div className={styles.periodControls} aria-label="Параметры периода">
      <span>{controls.periodLabel}</span>
      <span>{controls.shiftLabel}</span>
      <span>{controls.assetLabel}</span>
    </div>
  )
}
```

- [ ] **Step 2: Add ProductionKpiStrip**

```tsx
import classNames from 'classnames'

import { type HomeDashboardKpi } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ProductionKpiStripProps = {
  items: HomeDashboardKpi[]
}

export function ProductionKpiStrip({ items }: ProductionKpiStripProps) {
  return (
    <section className={styles.kpiStrip} aria-label="Ключевые показатели производства">
      {items.map((item) => (
        <article key={item.id} className={classNames(styles.kpiCard, styles[`status-${item.status}`])}>
          <div className={styles.kpiHeader}>
            <span>{item.title}</span>
            <strong>{item.deltaLabel}</strong>
          </div>
          <b>
            {item.value}
            {item.unit && <small>{item.unit}</small>}
          </b>
          <p>{item.caption}</p>
        </article>
      ))}
    </section>
  )
}
```

- [ ] **Step 3: Add PlanFactChart**

```tsx
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { type HomeDashboardTrend } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type PlanFactChartProps = {
  trend: HomeDashboardTrend
}

export function PlanFactChart({ trend }: PlanFactChartProps) {
  const lastPoint = trend.points[trend.points.length - 1]
  const gapStart = trend.points[Math.max(trend.points.length - 3, 0)]

  return (
    <section className={styles.panel} aria-labelledby="plan-fact-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Динамика</span>
          <h2 id="plan-fact-title">План-факт производства</h2>
        </div>
        <div className={styles.chartTotals}>
          <span>План {trend.planTotal}</span>
          <span>Факт {trend.factTotal}</span>
          <strong>{trend.deltaTotal}</strong>
        </div>
      </div>
      <div className={styles.metricTabs} role="tablist" aria-label="Метрика графика">
        {trend.tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === trend.activeMetric ? styles.metricTabActive : styles.metricTab}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend.points} margin={{ top: 18, right: 18, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="var(--home-grid)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={44} />
            <Tooltip />
            {lastPoint && gapStart && (
              <ReferenceArea x1={gapStart.label} x2={lastPoint.label} fill="var(--home-danger-wash)" />
            )}
            <Line type="monotone" dataKey="plan" name="План" stroke="var(--home-plan)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fact" name="Факт" stroke="var(--home-fact)" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Add DeviationReasonsList**

```tsx
import classNames from 'classnames'

import { type HomeDashboardDeviation } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type DeviationReasonsListProps = {
  items: HomeDashboardDeviation[]
}

export function DeviationReasonsList({ items }: DeviationReasonsListProps) {
  return (
    <section className={styles.panel} aria-labelledby="deviations-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Проблемы</span>
          <h2 id="deviations-title">Отклонения и причины</h2>
        </div>
      </div>
      <div className={styles.deviationList}>
        {items.map((item) => (
          <article key={item.id} className={classNames(styles.deviationRow, styles[`status-${item.status}`])}>
            <div>
              <h3>
                {item.assetTitle} · {item.stageTitle}
              </h3>
              <p>{item.metricTitle}</p>
              <span>{item.factPlanLabel}</span>
            </div>
            <div className={styles.deviationMeta}>
              <strong>{item.deltaLabel}</strong>
              <b>{item.reasonTitle}</b>
              <small>{item.impactLabel}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Add ProductionFlow**

```tsx
import classNames from 'classnames'

import { type HomeDashboardFlowStage } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ProductionFlowProps = {
  items: HomeDashboardFlowStage[]
}

export function ProductionFlow({ items }: ProductionFlowProps) {
  return (
    <section className={styles.panel} aria-labelledby="flow-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Поток</span>
          <h2 id="flow-title">Производственный поток</h2>
        </div>
      </div>
      <div className={styles.flow}>
        {items.map((item) => (
          <article key={item.id} className={classNames(styles.flowItem, styles[`status-${item.status}`])}>
            <h3>{item.title}</h3>
            <p>{item.factPlanLabel}</p>
            <strong>{item.deltaLabel}</strong>
            {item.reasonTitle && <span>{item.reasonTitle}</span>}
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Add AssetPerformanceTable**

```tsx
import classNames from 'classnames'

import { type HomeDashboardAsset } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type AssetPerformanceTableProps = {
  assets: HomeDashboardAsset[]
}

export function AssetPerformanceTable({ assets }: AssetPerformanceTableProps) {
  return (
    <section className={styles.panel} aria-labelledby="assets-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Активы</span>
          <h2 id="assets-title">Активы / месторождения</h2>
        </div>
      </div>
      <div className={styles.assetTable} role="table" aria-label="Показатели по активам">
        <div className={styles.assetTableHead} role="row">
          <span role="columnheader">Актив</span>
          <span role="columnheader">Статус</span>
          <span role="columnheader">Золото</span>
          <span role="columnheader">Руда добыта</span>
          <span role="columnheader">Руда переработана</span>
          <span role="columnheader">Извлечение</span>
          <span role="columnheader">Причина</span>
          <span role="columnheader">Вклад</span>
        </div>
        {assets.map((asset) => (
          <div key={asset.id} className={styles.assetTableRow} role="row">
            <strong role="cell">{asset.title}</strong>
            <span role="cell" className={classNames(styles.statusPill, styles[`status-${asset.status}`])}>
              {asset.status === 'danger'
                ? 'Критично'
                : asset.status === 'warning'
                  ? 'Отклонение'
                  : asset.status === 'neutral'
                    ? 'Нет данных'
                    : 'В норме'}
            </span>
            <span role="cell">{asset.goldLabel}</span>
            <span role="cell">{asset.oreMinedLabel}</span>
            <span role="cell">{asset.oreProcessedLabel}</span>
            <span role="cell">{asset.recoveryLabel}</span>
            <span role="cell">{asset.primaryReasonTitle}</span>
            <span role="cell">{asset.contributionLabel}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Add ProductionEventsList**

```tsx
import classNames from 'classnames'

import { type HomeDashboardEvent } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ProductionEventsListProps = {
  events: HomeDashboardEvent[]
}

export function ProductionEventsList({ events }: ProductionEventsListProps) {
  return (
    <section className={styles.panel} aria-labelledby="events-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>События</span>
          <h2 id="events-title">События периода</h2>
        </div>
      </div>
      <div className={styles.eventList}>
        {events.map((event) => (
          <article key={event.id} className={classNames(styles.eventRow, styles[`status-${event.status}`])}>
            <time>{event.timeLabel}</time>
            <div>
              <h3>{event.assetTitle}</h3>
              <p>{event.title}</p>
            </div>
            <strong>{event.durationLabel}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 8: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: new components compile. If lint flags old component files as unused but still present, remove them in Task 6.

- [ ] **Step 9: Commit**

```powershell
git add src/widgets/home-dashboard src/entities/production-stage src/shared/mocks/production-stage/homeDashboard.ts
git commit -m "feat(home): compose production cockpit widgets"
```

---

### Task 6: Rebuild Visual System CSS

**Files:**

- Modify: `src/widgets/home-dashboard/HomeDashboard.module.css`

- [ ] **Step 1: Replace old CSS with cockpit layout**

Rewrite the module around the new component class names. Keep status classes and use local CSS variables so this iteration does not require global token changes.

```css
.dashboard {
  --home-bg: #f4f4f1;
  --home-card: #ffffff;
  --home-border: rgba(35, 35, 35, 0.08);
  --home-shadow: 0 18px 45px rgba(25, 25, 25, 0.06);
  --home-text: #202020;
  --home-muted: #7b7b7b;
  --home-green: #37b878;
  --home-red: #e65a54;
  --home-amber: #f5aa24;
  --home-neutral: #8d8d8d;
  --home-green-bg: #e8f8ef;
  --home-red-bg: #fdeceb;
  --home-amber-bg: #fff4dc;
  --home-neutral-bg: #f1f1f1;
  --home-grid: rgba(32, 32, 32, 0.08);
  --home-plan: #c8c6bd;
  --home-fact: #37b878;
  --home-danger-wash: rgba(230, 90, 84, 0.08);

  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
  max-width: 100%;
  padding: var(--space-5);
  color: var(--home-text);
  background: var(--home-bg);
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-5);
}

.header h1 {
  color: var(--home-text);
  font-size: clamp(1.75rem, 2vw, 2.25rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0;
}

.header p {
  margin-top: var(--space-2);
  color: var(--home-muted);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.periodControls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
}

.periodControls span,
.metricTab,
.metricTabActive {
  border: var(--border-width-hairline) solid var(--home-border);
  border-radius: 999px;
  background: var(--home-card);
  color: var(--home-text);
  font-size: var(--font-size-xs);
  font-weight: 800;
  line-height: 1;
}

.periodControls span {
  padding: 0.75rem 1rem;
}

.kpiStrip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--space-3);
}

.kpiCard,
.panel {
  min-width: 0;
  border: var(--border-width-hairline) solid var(--home-border);
  border-radius: 1.25rem;
  background: var(--home-card);
  box-shadow: var(--home-shadow);
}

.kpiCard {
  --status-color: var(--home-neutral);
  --status-bg: var(--home-neutral-bg);

  padding: var(--space-4);
}

.kpiHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.kpiHeader span,
.panelEyebrow {
  color: var(--home-muted);
  font-size: var(--font-size-xs);
  font-weight: 800;
  line-height: 1.25;
}

.kpiHeader strong,
.statusPill,
.chartTotals strong,
.deviationMeta b {
  flex: 0 0 auto;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  color: var(--status-color);
  font-size: var(--font-size-xs);
  font-weight: 900;
  line-height: 1;
  background: var(--status-bg);
}

.kpiCard b {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  margin-top: var(--space-4);
  color: var(--home-text);
  font-size: clamp(1.45rem, 2vw, 2rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0;
}

.kpiCard small,
.kpiCard p {
  color: var(--home-muted);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.kpiCard p {
  margin-top: var(--space-2);
}

.primaryGrid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(24rem, 0.75fr);
  gap: var(--space-5);
}

.secondaryGrid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(22rem, 0.65fr);
  gap: var(--space-5);
}

.panel {
  overflow: hidden;
  padding: var(--space-5);
}

.panelHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.panelHeader h2 {
  margin-top: var(--space-1);
  color: var(--home-text);
  font-size: var(--font-size-lg);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: 0;
}

.chartTotals {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  color: var(--home-muted);
  font-size: var(--font-size-xs);
  font-weight: 800;
}

.metricTabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.metricTab,
.metricTabActive {
  padding: 0.55rem 0.75rem;
  cursor: pointer;
}

.metricTabActive {
  border-color: rgba(245, 170, 36, 0.45);
  background: var(--home-amber-bg);
}

.chart {
  width: 100%;
  height: 22rem;
}

.deviationList,
.eventList {
  display: flex;
  flex-direction: column;
}

.deviationRow,
.eventRow {
  --status-color: var(--home-neutral);
  --status-bg: var(--home-neutral-bg);

  display: grid;
  gap: var(--space-3);
  padding: var(--space-4) 0;
  border-top: var(--border-width-hairline) solid var(--home-border);
}

.deviationRow {
  grid-template-columns: minmax(0, 1fr) auto;
}

.deviationRow:first-child,
.eventRow:first-child {
  border-top: 0;
  padding-top: 0;
}

.deviationRow h3,
.eventRow h3,
.flowItem h3 {
  color: var(--home-text);
  font-size: var(--font-size-sm);
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: 0;
}

.deviationRow p,
.deviationRow span,
.eventRow p,
.flowItem p,
.flowItem span {
  margin-top: var(--space-1);
  color: var(--home-muted);
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1.3;
}

.deviationMeta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
  text-align: right;
}

.deviationMeta strong,
.flowItem strong {
  color: var(--status-color);
  font-size: var(--font-size-sm);
  font-weight: 900;
}

.deviationMeta small {
  color: var(--home-muted);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.flow {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--space-3);
}

.flowItem {
  --status-color: var(--home-neutral);
  --status-bg: var(--home-neutral-bg);

  min-width: 0;
  padding: var(--space-4);
  border: var(--border-width-hairline) solid var(--home-border);
  border-top: 0.25rem solid var(--status-color);
  border-radius: 1rem;
  background: var(--status-bg);
}

.flowItem strong {
  display: block;
  margin-top: var(--space-3);
}

.assetTable {
  min-width: 48rem;
}

.assetTableHead,
.assetTableRow {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr 1fr 1fr 1.1fr 0.9fr 1.2fr 1fr;
  gap: var(--space-3);
  align-items: center;
}

.assetTableHead {
  padding-bottom: var(--space-3);
  color: var(--home-muted);
  font-size: var(--font-size-xs);
  font-weight: 900;
}

.assetTableRow {
  padding: var(--space-3) 0;
  border-top: var(--border-width-hairline) solid var(--home-border);
  color: var(--home-text);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.assetTableRow strong {
  font-size: var(--font-size-sm);
  font-weight: 900;
}

.eventRow {
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
}

.eventRow time {
  color: var(--home-muted);
  font-size: var(--font-size-xs);
  font-weight: 900;
}

.eventRow strong {
  color: var(--status-color);
  font-size: var(--font-size-xs);
  font-weight: 900;
}

.status-success {
  --status-color: var(--home-green);
  --status-bg: var(--home-green-bg);
}

.status-warning {
  --status-color: var(--home-amber);
  --status-bg: var(--home-amber-bg);
}

.status-danger {
  --status-color: var(--home-red);
  --status-bg: var(--home-red-bg);
}

.status-neutral {
  --status-color: var(--home-neutral);
  --status-bg: var(--home-neutral-bg);
}

@media (--screen-medium) {
  .kpiStrip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .primaryGrid,
  .secondaryGrid {
    grid-template-columns: 1fr;
  }

  .flow {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (--screen-tablet) {
  .header {
    flex-direction: column;
  }

  .periodControls {
    justify-content: flex-start;
  }

  .kpiStrip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .assetTable {
    overflow-x: auto;
  }
}

@media (--screen-small) {
  .dashboard {
    padding: var(--space-3);
  }

  .kpiStrip,
  .flow {
    grid-template-columns: 1fr;
  }

  .panel,
  .kpiCard {
    border-radius: 1rem;
  }

  .deviationRow {
    grid-template-columns: 1fr;
  }

  .deviationMeta {
    align-items: flex-start;
    text-align: left;
  }

  .chart {
    height: 18rem;
  }
}
```

- [ ] **Step 2: Remove old UI files**

Delete superseded files after the new components compile:

```text
src/widgets/home-dashboard/ui/ExecutiveSummary.tsx
src/widgets/home-dashboard/ui/AttentionList.tsx
src/widgets/home-dashboard/ui/PlanFactTrend.tsx
src/widgets/home-dashboard/ui/BusinessUnitHealthGrid.tsx
src/widgets/home-dashboard/ui/ProductionChain.tsx
```

- [ ] **Step 3: Run lint and build**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both pass.

- [ ] **Step 4: Commit**

```powershell
git add src/widgets/home-dashboard
git commit -m "style(home): apply production cockpit visual system"
```

---

### Task 7: Preserve Route and Navigation Behavior

**Files:**

- Modify: `src/app/page.tsx`

- [ ] **Step 1: Keep route thin**

Use the existing shell and surface. Only adjust visible copy/filter behavior if it conflicts with the new cockpit header.

Target shape:

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

- [ ] **Step 2: Confirm no old CSS import remains**

Run:

```powershell
rg -n "page.module.css|ExecutiveSummary|AttentionList|PlanFactTrend|BusinessUnitHealthGrid|ProductionChain" src/app src/widgets/home-dashboard
```

Expected: no old homepage component references remain.

- [ ] **Step 3: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: pass.

- [ ] **Step 4: Commit**

```powershell
git add src/app/page.tsx src/widgets/home-dashboard
git commit -m "feat(home): wire production cockpit homepage"
```

---

### Task 8: UX QA and Responsive Verification

**Files:**

- Modify only if QA finds issues: `src/widgets/home-dashboard/HomeDashboard.module.css`

- [ ] **Step 1: Start dev server**

Run:

```powershell
npm.cmd run dev
```

Expected: Next.js starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 2: Desktop QA**

Open `/` at desktop width and check:

- first screen prioritizes KPI strip, plan-fact chart, deviations, and assets;
- the screen does not feel like the generated prototype was copied literally;
- visual rhythm matches the supplied Muzli/Zajno references: soft cards, readable numbers, compact pills;
- no nested card piles;
- deviation rows show reasons clearly;
- chart is the dominant element;
- `Активы / месторождения` is readable as a table;
- no text overlap in Russian labels.

- [ ] **Step 3: Mobile QA**

Open `/` at a narrow width and check:

- header controls wrap without horizontal scroll;
- KPI cards stack or form a clean two-column grid;
- deviation list appears before less critical lower sections;
- chart remains readable;
- asset table scrolls horizontally inside its panel rather than forcing page overflow;
- no page-level horizontal scroll.

- [ ] **Step 4: Accessibility QA**

Check manually:

- all sections have accessible labels/headings;
- tab buttons are buttons, not inert text;
- semantic color is supported by text labels;
- table-like asset block has understandable labels;
- focus states are visible enough on controls and links.

- [ ] **Step 5: Final verification**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both pass.

- [ ] **Step 6: Commit QA fixes**

If CSS or component fixes were needed:

```powershell
git add src/widgets/home-dashboard src/app/page.tsx
git commit -m "fix(home): polish production cockpit layout"
```

If no fixes were needed, do not create an empty commit.

---

## Self-Review Checklist

- The plan implements Production Cockpit, not the old section-card homepage.
- The generated mockup is treated as a reference, not a pixel target.
- Visual direction follows the user's Muzli/Zajno screenshots.
- `Ресурсная база` is not in MVP.
- `Отклонения и причины` is backed by reason data.
- `ProductionFlow` is included as a secondary section, not the main value proposition.
- `src/app/page.tsx` remains thin.
- New domain types live in `entities`.
- UI composition lives in `widgets`.
- Mock data lives in `shared/mocks`.
- Lint, build, desktop QA, and mobile QA are required before handoff.

## Execution Options

Plan complete. Recommended execution mode is subagent-driven because this change is easiest to review in slices:

1. Domain contract and mock data.
2. Widget composition and UI components.
3. CSS visual system.
4. Route cleanup and QA.

Use inline execution only if we want tighter control in this same thread.
