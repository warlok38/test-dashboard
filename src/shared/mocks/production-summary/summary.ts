import { type AlarmSummaryResponse } from '@/entities/production-summary'

const details = [
  {
    gtk_or_zif: 'Олимпиада',
    plan_value: 271.74,
    fact_value: 257.9,
    deviation_pct: 5.2,
    severity: 'info'
  },
  {
    gtk_or_zif: 'Наталка',
    plan_value: 111.89,
    fact_value: 77.89,
    deviation_pct: -5.2,
    severity: 'critical'
  },
  {
    gtk_or_zif: 'Благодатное',
    plan_value: 81.89,
    fact_value: 86.15,
    deviation_pct: 5.2,
    severity: 'info'
  },
  {
    gtk_or_zif: 'Куранах',
    plan_value: 36.84,
    fact_value: 34.92,
    deviation_pct: -5.2,
    severity: 'warning'
  },
  {
    gtk_or_zif: 'Сухой Лог',
    plan_value: 12.99,
    fact_value: 13.67,
    deviation_pct: 5.2,
    severity: 'info'
  }
]

function getMockProblemSeverity(gtkOrZif: string) {
  if (gtkOrZif === 'Наталка') {
    return 'critical'
  }

  if (gtkOrZif === 'Куранах') {
    return 'warning'
  }

  return 'info'
}

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
            plan_value:
              item.gtk_or_zif === 'Наталка' || item.gtk_or_zif === 'Куранах' ? 9.39 : 8.46,
            fact_value: 8.9,
            deviation_pct:
              item.gtk_or_zif === 'Наталка' || item.gtk_or_zif === 'Куранах' ? -5.2 : 5.2,
            severity: getMockProblemSeverity(item.gtk_or_zif)
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
            deviation_pct:
              item.gtk_or_zif === 'Наталка' || item.gtk_or_zif === 'Куранах' ? -5.2 : 5.2,
            severity: getMockProblemSeverity(item.gtk_or_zif)
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
