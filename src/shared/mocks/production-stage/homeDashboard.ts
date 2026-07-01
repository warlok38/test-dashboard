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
