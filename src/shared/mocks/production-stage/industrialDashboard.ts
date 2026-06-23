import { type DashboardStage } from '@/entities/production-stage/model/types'

export const industrialDashboardStages: DashboardStage[] = [
  {
    id: 'mining',
    title: 'Добыча',
    detailRoute: '/production-stages/mining',
    plan: {
      completed: 2,
      total: 4
    },
    metrics: [
      {
        id: 'mining-rock-mass',
        title: 'Горная масса, тыс. м3',
        value: 312.8,
        plan: 298.5,
        delta: 4.8,
        detailRoute: '/production-stages/mining/rock-mass',
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'success'
      },
      {
        id: 'mining-ore',
        title: 'Добыча руды, тыс. т',
        value: 18.4,
        plan: 24.1,
        delta: -23.7,
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'danger'
      },
      {
        id: 'mining-au-content',
        title: 'Содержание Au, г/т',
        value: 1.42,
        plan: 1.85,
        delta: -23.2,
        valueFractionDigits: 2,
        planFractionDigits: 2,
        status: 'danger'
      },
      {
        id: 'mining-overburden',
        title: 'Вскрыша, тыс. м3',
        value: 276.3,
        plan: 268.9,
        delta: 2.7,
        detailRoute: '/production-stages/mining/overburden',
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'success'
      }
    ]
  },
  {
    id: 'drilling-blasting',
    title: 'БВР',
    plan: {
      completed: 3,
      total: 3
    },
    metrics: [
      {
        id: 'drilling-volume',
        title: 'Объём бурения, тыс. п.м',
        value: 14.2,
        plan: 12.8,
        delta: 10.9,
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'success'
      },
      {
        id: 'drilling-kio',
        title: 'КИО бур. оборудования, %',
        value: 78.4,
        plan: 72,
        delta: 8.9,
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'success'
      },
      {
        id: 'drilling-ktg',
        title: 'КТГ бур. оборудования, %',
        value: 91.2,
        plan: 88.5,
        delta: 3.1,
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'success'
      }
    ]
  },
  {
    id: 'excavation',
    title: 'Экскавация',
    plan: {
      completed: 3,
      total: 3
    },
    metrics: [
      {
        id: 'excavation-kio',
        title: 'КИО экскаваторов, %',
        value: 82.1,
        plan: 79,
        delta: 3.9,
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'success'
      },
      {
        id: 'excavation-ktg',
        title: 'КТГ экскаваторов, %',
        value: 89.7,
        plan: 87.2,
        delta: 2.9,
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'success'
      },
      {
        id: 'excavation-productivity',
        title: 'Производительность, м3/ч',
        value: 1240,
        plan: 1180,
        delta: 5.1,
        status: 'success'
      }
    ]
  },
  {
    id: 'transport',
    title: 'Транспортировка',
    plan: {
      completed: 0,
      total: 3
    },
    metrics: [
      {
        id: 'transport-cargo',
        title: 'Грузооборот, тыс. т-км',
        value: 4820,
        plan: 5100,
        delta: -5.5,
        status: 'danger'
      },
      {
        id: 'transport-kio',
        title: 'КИО самосвалов, %',
        value: 64.3,
        plan: 71,
        delta: -9.4,
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'danger'
      },
      {
        id: 'transport-ktg',
        title: 'КТГ самосвалов, %',
        value: null,
        plan: null,
        delta: null,
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'danger'
      }
    ]
  },
  {
    id: 'processing-feed',
    title: 'Подача в переработку',
    plan: {
      completed: 1,
      total: 2
    },
    metrics: [
      {
        id: 'processing-ore-volume',
        title: 'Объём руды, тыс. т',
        value: 16.9,
        plan: 22.5,
        delta: -24.9,
        valueFractionDigits: 1,
        planFractionDigits: 1,
        status: 'danger'
      },
      {
        id: 'processing-au-content',
        title: 'Содержание Au, г/т',
        value: 1.67,
        plan: 1.55,
        delta: 7.7,
        valueFractionDigits: 2,
        planFractionDigits: 2,
        status: 'success'
      }
    ]
  }
]
