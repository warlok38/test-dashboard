import {
  type HomeDashboardBusinessUnit,
  type HomeDashboardTrendPoint
} from '@/entities/production-stage/model/types'

export const homeDashboardTrend: HomeDashboardTrendPoint[] = [
  { label: '20 июн', fact: 18.6, plan: 20.1 },
  { label: '21 июн', fact: 36.9, plan: 40.5 },
  { label: '22 июн', fact: 55.1, plan: 61.2 },
  { label: '23 июн', fact: 72.4, plan: 82 },
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
      {
        id: 'rock-mass',
        title: 'Горная масса',
        value: '257.9',
        deltaLabel: '+5.2%',
        status: 'success'
      },
      {
        id: 'ore',
        title: 'Добыча руды',
        value: '8.9',
        deltaLabel: '+5.2%',
        status: 'success'
      },
      {
        id: 'au-content',
        title: 'Содержание Au',
        value: '2.58',
        deltaLabel: '+5.2%',
        status: 'success'
      }
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
      {
        id: 'rock-mass',
        title: 'Горная масса',
        value: '257.9',
        deltaLabel: '+5.2%',
        status: 'success'
      },
      {
        id: 'ore',
        title: 'Добыча руды',
        value: '8.9',
        deltaLabel: '-5.2%',
        status: 'danger'
      },
      {
        id: 'au-content',
        title: 'Содержание Au',
        value: '2.58',
        deltaLabel: '-5.2%',
        status: 'danger'
      }
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
      {
        id: 'rock-mass',
        title: 'Горная масса',
        value: '257.9',
        deltaLabel: '+5.2%',
        status: 'success'
      },
      {
        id: 'ore',
        title: 'Добыча руды',
        value: '8.9',
        deltaLabel: '+5.2%',
        status: 'success'
      },
      {
        id: 'overburden',
        title: 'Вскрыша',
        value: '50.57',
        deltaLabel: '+5.2%',
        status: 'success'
      }
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
      {
        id: 'rock-mass',
        title: 'Горная масса',
        value: '257.9',
        deltaLabel: '+5.2%',
        status: 'success'
      },
      {
        id: 'ore',
        title: 'Добыча руды',
        value: '8.9',
        deltaLabel: '-5.2%',
        status: 'danger'
      },
      {
        id: 'au-content',
        title: 'Содержание Au',
        value: '2.58',
        deltaLabel: '-5.2%',
        status: 'warning'
      }
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
      {
        id: 'rock-mass',
        title: 'Горная масса',
        value: '257.9',
        deltaLabel: '+5.2%',
        status: 'success'
      },
      {
        id: 'ore',
        title: 'Добыча руды',
        value: '8.9',
        deltaLabel: '+5.2%',
        status: 'success'
      },
      {
        id: 'au-content',
        title: 'Содержание Au',
        value: '2.58',
        deltaLabel: '+5.2%',
        status: 'success'
      }
    ]
  }
]
