import type {
  ReportingAssetOption,
  ReportingDataset,
  ReportingKpiSummaryItem,
  ReportingMetricOption,
  ReportingModeOption
} from './reporting'
import { DEFAULT_REPORTING_ASSET_KEY } from './reporting'
import { reportingStageOptions } from './reporting-stage'

export const reportingAssetMockOptions: ReportingAssetOption[] = [
  { key: 'group', label: 'Группа' },
  { key: 'olimpiada', label: 'Олимпиада' },
  { key: 'blagodatnoe', label: 'Благодатное' },
  { key: 'natalka', label: 'Наталка' },
  { key: 'kuranah', label: 'Куранах' },
  { key: 'suhoy-log', label: 'Сухой лог' }
]

export const reportingModeMockOptions: ReportingModeOption[] = [
  { key: 'period', label: 'За период' },
  { key: 'cumulative', label: 'Накопительно' },
  { key: 'forecast', label: 'Прогноз' }
]

export const reportingMetricMockOptions: ReportingMetricOption[] = reportingStageOptions.flatMap(
  (stage) => stage.metrics
)

function getMetricUnit(metric: ReportingMetricOption) {
  return metric.uom ?? ''
}

const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
const emptyMonthlyMock = months.map((month) => ({
  month,
  fact: null,
  plan: null,
  forecast: null
}))

function createMonthlyMock(seed: number) {
  return months.map((month, index) => {
    const base = 3.8 + seed * 0.11 + index * 0.08

    return {
      month,
      fact: Number((base + (index % 3) * 0.16).toFixed(2)),
      plan: Number((base + 0.28).toFixed(2)),
      forecast: Number((base + 0.42 - (index % 2) * 0.12).toFixed(2))
    }
  })
}

function createProductionCardMock(
  metric: ReportingMetricOption,
  index: number,
  assetLabel: string
) {
  const isEmptyMetric = metric.key.startsWith('processing-feed')
  const fact = 142 + index * 4
  const plan = fact + 7
  const forecast = plan - 3

  return {
    id: `production-${metric.key}`,
    metricKey: metric.key,
    title: metric.label,
    unit: getMetricUnit(metric),
    bars: [
      { label: "Факт 1КВ'25", value: isEmptyMetric ? null : fact, caption: 'Факт' },
      { label: "БП 1КВ'25", value: isEmptyMetric ? null : plan, caption: 'БП' },
      { label: "Факт 1КВ'25", value: isEmptyMetric ? null : forecast, caption: 'Факт' }
    ],
    deltas: isEmptyMetric ? [] : ['+42%', '-6%'],
    description: isEmptyMetric
      ? 'Данные по показателю временно отсутствуют.'
      : `Выше плана в основном за счет роста показателя на ${assetLabel}: увеличение объемов горных работ и рост среднего плеча транспортировки.`
  }
}

function createOverviewMock(metric: ReportingMetricOption, seed: number, metricIndex: number) {
  if (metric.key.startsWith('processing-feed')) {
    return {
      metricKey: metric.key,
      unit: getMetricUnit(metric),
      kpis: [
        { label: 'Факт', value: null, caption: 'Авг 2025' },
        { label: 'БП', value: null, caption: 'Авг 2025' },
        { label: 'Факт', value: null, caption: 'Авг 2025' }
      ],
      deltas: [],
      donutValue: null,
      donutUnit: '%',
      breakdown: [],
      monthly: emptyMonthlyMock
    }
  }

  const fact = Number((4.72 + seed * 0.17 + metricIndex * 0.21).toFixed(2))
  const plan = Number((fact + 0.32).toFixed(2))
  const forecast = Number((plan + 0.06).toFixed(2))

  return {
    metricKey: metric.key,
    unit: getMetricUnit(metric),
    kpis: [
      { label: 'Факт', value: fact, caption: 'Авг 2025' },
      { label: 'БП', value: plan, caption: 'Авг 2025' },
      { label: 'Факт', value: forecast, caption: 'Авг 2025' }
    ],
    deltas: [`+${5 + metricIndex}%`, `+${2 + (metricIndex % 2)}%`],
    donutValue: 24 + seed * 1.7 + metricIndex * 0.9,
    donutUnit: '%',
    breakdown: [
      { name: 'О', value: 28 + seed + metricIndex },
      { name: 'Б', value: 22 + metricIndex * 0.4 },
      { name: 'Н', value: 19 },
      { name: 'К', value: 16 - metricIndex * 0.3 },
      { name: 'СЛ', value: 15 - seed * 0.4 }
    ],
    monthly: createMonthlyMock(seed + metricIndex)
  }
}

function createKpiSummaryMock(seed: number): ReportingKpiSummaryItem[] {
  return [
    {
      key: 'ore',
      label: 'Руда',
      value: 4741 + seed * 137,
      unit: 'тыс. т',
      delta: 4 + seed,
      target: 4560 + seed * 120,
      targetLabel: 'Цель'
    },
    {
      key: 'grade',
      label: 'Содержание',
      value: Number((73.54 + seed * 0.68).toFixed(2)),
      unit: 'г/т',
      delta: -2 + seed,
      target: Number((74.1 + seed * 0.6).toFixed(2)),
      targetLabel: 'Цель',
      fractionDigits: 2
    },
    {
      key: 'drilling-volume',
      label: 'Объем бурения',
      value: 201 + seed * 8,
      unit: 'тыс. п. м.',
      delta: 1 + seed,
      target: 198 + seed * 7,
      targetLabel: 'Цель',
      fractionDigits: 1
    },
    {
      key: 'rock-mass',
      label: 'Горная масса',
      value: 853 + seed * 29,
      unit: 'тыс. м3',
      delta: 145 - seed * 7,
      target: 348 + seed * 16,
      targetLabel: 'Цель'
    },
    {
      key: 'cargo-turnover',
      label: 'Грузооборот',
      value: 1096 + seed * 41,
      unit: 'тыс. т-км',
      delta: 38 - seed * 3,
      target: 348 + seed * 20,
      targetLabel: 'Цель'
    },
    {
      key: 'processing-feed-zif',
      label: 'Подача руды на ЗИФ',
      value: 1659 + seed * 52,
      unit: 'тыс. т',
      delta: 38 + seed * 2,
      target: 348 + seed * 18,
      targetLabel: 'Цель'
    },
    {
      key: 'au-grade',
      label: 'Содержание Au',
      value: Number((1.15 + seed * 0.04).toFixed(2)),
      unit: 'г/т',
      delta: null,
      target: 3,
      targetLabel: 'Порог',
      fractionDigits: 2,
      inverseDelta: true
    },
    {
      key: 'au-output',
      label: 'Выпуск Au',
      value: Number((0 + seed * 0.08).toFixed(2)),
      unit: 'кг',
      delta: seed === 0 ? 0 : 3 + seed,
      target: 0,
      targetLabel: 'Цель',
      fractionDigits: 2
    }
  ]
}

function createDataset(assetKey: ReportingDataset['assetKey'], assetLabel: string, seed: number) {
  return {
    assetKey,
    kpiSummary: createKpiSummaryMock(seed),
    overviews: reportingMetricMockOptions.map((metric, metricIndex) =>
      createOverviewMock(metric, seed, metricIndex)
    ),
    productionCards: reportingMetricMockOptions.map((metric, metricIndex) =>
      createProductionCardMock(metric, metricIndex + seed, assetLabel)
    )
  } satisfies ReportingDataset
}

export const reportingMockData: ReportingDataset[] = reportingAssetMockOptions.map((asset, index) =>
  createDataset(asset.key, asset.label, index)
)

export function getReportingDataset(assetKey: string | null): ReportingDataset {
  return (
    reportingMockData.find((dataset) => dataset.assetKey === assetKey) ??
    reportingMockData.find((dataset) => dataset.assetKey === DEFAULT_REPORTING_ASSET_KEY) ??
    reportingMockData[0]
  )
}
