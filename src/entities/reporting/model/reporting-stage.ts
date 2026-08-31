import type { ReportingStageKey, ReportingStageOption } from './reporting'

export const DEFAULT_REPORTING_STAGE_KEY: ReportingStageKey = 'mining'

export const reportingStageOptions = [
  {
    key: 'mining',
    label: 'Добыча',
    metrics: [
      { key: 'mining-ore', label: 'Руда', uom: 'тыс.т' },
      { key: 'mining-au-grade', label: 'Содержание Au', uom: 'г/т' },
      { key: 'mining-overburden', label: 'Вскрыша', uom: 'тыс.м3' },
      { key: 'mining-rock-mass', label: 'Горная масса', uom: 'тыс.м3' }
    ]
  },
  {
    key: 'drilling-blasting',
    label: 'БВР',
    metrics: [
      { key: 'drilling-volume', label: 'Объем бурения', uom: 'тыс.п.м.' },
      { key: 'drilling-availability', label: 'КТГ' },
      { key: 'drilling-utilization', label: 'КИО' },
      { key: 'drilling-output', label: 'Выход ВГМ с 1 п.м.', uom: 'м3/п.м.' }
    ]
  },
  {
    key: 'excavation',
    label: 'Экскавация',
    metrics: [
      { key: 'excavation-rock-mass', label: 'Горная масса', uom: 'тыс.м3' },
      { key: 'excavation-availability', label: 'КТГ', uom: '%' },
      { key: 'excavation-utilization', label: 'КИО', uom: '%' },
      { key: 'excavation-productivity', label: 'Производительность', uom: 'м3/ч' }
    ]
  },
  {
    key: 'transportation',
    label: 'Транспортировка',
    metrics: [
      { key: 'transportation-cargo-turnover', label: 'Грузооборот', uom: 'тыс.т-км' },
      { key: 'transportation-availability', label: 'КТГ', uom: '%' },
      { key: 'transportation-utilization', label: 'КИО', uom: '%' },
      { key: 'transportation-distance', label: 'Плечо', uom: 'км' }
    ]
  },
  {
    key: 'processing-feed',
    label: 'Подача в переработку',
    metrics: [
      { key: 'processing-feed-zif-ore', label: 'Подача руды на ЗИФ', uom: 'тыс.т' },
      { key: 'processing-feed-zif-au-grade', label: 'Содержание Au', uom: 'г/т' },
      { key: 'processing-feed-stock-ore', label: 'Подача руды на склад', uom: 'тыс.т' },
      { key: 'processing-feed-stock-au-grade', label: 'Содержание Au', uom: 'г/т' }
    ]
  },
  {
    key: 'factory',
    label: 'Фабрика',
    metrics: [
      { key: 'factory-processing', label: 'Переработка', uom: 'тыс.т' },
      { key: 'factory-au-grade', label: 'Содержание Au', uom: 'г/т' },
      { key: 'factory-recovery', label: 'Извлечение', uom: '%' },
      { key: 'factory-au-output', label: 'Выпуск Au', uom: 'кг' }
    ]
  }
] satisfies ReportingStageOption[]

const reportingStageKeys = new Set<ReportingStageKey>(
  reportingStageOptions.map((stage) => stage.key)
)

export function isReportingStageKey(value: string | null): value is ReportingStageKey {
  return Boolean(value && reportingStageKeys.has(value as ReportingStageKey))
}

export function getReportingStage(value: string | null): ReportingStageOption {
  const stageKey = isReportingStageKey(value) ? value : DEFAULT_REPORTING_STAGE_KEY

  return reportingStageOptions.find((stage) => stage.key === stageKey) ?? reportingStageOptions[0]
}
