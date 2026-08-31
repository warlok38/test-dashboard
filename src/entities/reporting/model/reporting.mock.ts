import type {
  ReportingAssetOption,
  ReportingDataset,
  ReportingMetricOption,
  ReportingModeOption
} from './reporting'
import { reportingStageOptions } from './reporting-stage'

export const reportingAssetMockOptions: ReportingAssetOption[] = [
  { key: 'group', label: 'Группа' },
  { key: 'kbe', label: 'КБЕ' },
  { key: 'olimpiada', label: 'Олимпиада' },
  { key: 'blagodatnoe', label: 'Благодатное' },
  { key: 'kuranah', label: 'Куранах' },
  { key: 'suhoy-log-opr', label: 'ОПР Сухого Лога' },
  { key: 'natalka', label: 'Наталка' }
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

function createProductionCardMock(index: number, assetLabel: string) {
  const fact = 142 + index * 4
  const plan = fact + 7
  const forecast = plan - 3

  return {
    id: `production-${index}`,
    title: index % 2 === 0 ? 'Грузооборот' : 'Переработка руды',
    unit: index % 2 === 0 ? 'млн ткм' : 'млн т',
    bars: [
      { label: "Факт 1КВ'25", value: fact, caption: 'Факт' },
      { label: "БП 1КВ'25", value: plan, caption: 'БП' },
      { label: "Факт 1КВ'25", value: forecast, caption: 'Факт' }
    ],
    deltas: ['+42%', '-6%'],
    description: `Выше плана в основном за счет роста показателя на ${assetLabel}: увеличение объемов горных работ и рост среднего плеча транспортировки.`
  }
}

function createOverviewMock(metric: ReportingMetricOption, seed: number, metricIndex: number) {
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

function createDataset(assetKey: ReportingDataset['assetKey'], assetLabel: string, seed: number) {
  return {
    assetKey,
    overviews: reportingMetricMockOptions.map((metric, metricIndex) =>
      createOverviewMock(metric, seed, metricIndex)
    ),
    productionCards: Array.from({ length: 6 }, (_, index) =>
      createProductionCardMock(index + seed, assetLabel)
    )
  } satisfies ReportingDataset
}

export const reportingMockData: ReportingDataset[] = reportingAssetMockOptions.map((asset, index) =>
  createDataset(asset.key, asset.label, index)
)
