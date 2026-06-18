export type MiningStageMetricKind = 'bar-line' | 'line'

export type MiningStagePoint = {
  day: string
  month: string
  fact: number
  plan: number
}

export type MiningStageMetric = {
  id: string
  title: string
  unit: string
  kind: MiningStageMetricKind
  detailRoute?: string
  summary: {
    fact: number
    plan: number
  }
  data: MiningStagePoint[]
}

const rockMassData: MiningStagePoint[] = [
  { day: '10', month: 'Май', fact: 296, plan: 323 },
  { day: '11', month: 'Май', fact: 307, plan: 294 },
  { day: '12', month: 'Май', fact: 298, plan: 315 },
  { day: '13', month: 'Май', fact: 315, plan: 342 },
  { day: '14', month: 'Май', fact: 316, plan: 335 },
  { day: '15', month: 'Май', fact: 321, plan: 339 },
  { day: '16', month: 'Май', fact: 308, plan: 348 },
  { day: '17', month: 'Май', fact: 300, plan: 326 },
  { day: '18', month: 'Май', fact: 326, plan: 335 },
  { day: '19', month: 'Май', fact: 313, plan: 333 },
  { day: '20', month: 'Май', fact: 323, plan: 329 },
  { day: '21', month: 'Май', fact: 309, plan: 320 },
  { day: '22', month: 'Май', fact: 324, plan: 316 },
  { day: '23', month: 'Май', fact: 305, plan: 315 },
  { day: '24', month: 'Май', fact: 300, plan: 325 },
  { day: '25', month: 'Май', fact: 326, plan: 302 },
  { day: '26', month: 'Май', fact: 317, plan: 323 },
  { day: '27', month: 'Май', fact: 317, plan: 327 },
  { day: '28', month: 'Май', fact: 308, plan: 320 },
  { day: '29', month: 'Май', fact: 325, plan: 345 },
  { day: '30', month: 'Май', fact: 306, plan: 331 },
  { day: '31', month: 'Май', fact: 338, plan: 347 },
  { day: '1', month: 'Июнь', fact: 278, plan: 321 },
  { day: '2', month: 'Июнь', fact: 297, plan: 288 },
  { day: '3', month: 'Июнь', fact: 324, plan: 295 },
  { day: '4', month: 'Июнь', fact: 322, plan: 316 },
  { day: '5', month: 'Июнь', fact: 305, plan: 312 },
  { day: '6', month: 'Июнь', fact: 279, plan: 298 },
  { day: '7', month: 'Июнь', fact: 323, plan: 313 },
  { day: '8', month: 'Июнь', fact: 295, plan: 321 }
]

const overburdenData: MiningStagePoint[] = [
  { day: '10', month: 'Май', fact: 249, plan: 318 },
  { day: '11', month: 'Май', fact: 281, plan: 290 },
  { day: '12', month: 'Май', fact: 293, plan: 298 },
  { day: '13', month: 'Май', fact: 303, plan: 265 },
  { day: '14', month: 'Май', fact: 273, plan: 285 },
  { day: '15', month: 'Май', fact: 297, plan: 297 },
  { day: '16', month: 'Май', fact: 247, plan: 290 },
  { day: '17', month: 'Май', fact: 247, plan: 303 },
  { day: '18', month: 'Май', fact: 277, plan: 289 },
  { day: '19', month: 'Май', fact: 271, plan: 264 },
  { day: '20', month: 'Май', fact: 321, plan: 291 },
  { day: '21', month: 'Май', fact: 260, plan: 299 },
  { day: '22', month: 'Май', fact: 277, plan: 298 },
  { day: '23', month: 'Май', fact: 257, plan: 284 },
  { day: '24', month: 'Май', fact: 276, plan: 289 },
  { day: '25', month: 'Май', fact: 282, plan: 278 },
  { day: '26', month: 'Май', fact: 303, plan: 303 },
  { day: '27', month: 'Май', fact: 255, plan: 296 },
  { day: '28', month: 'Май', fact: 261, plan: 284 },
  { day: '29', month: 'Май', fact: 311, plan: 341 },
  { day: '30', month: 'Май', fact: 286, plan: 311 },
  { day: '31', month: 'Май', fact: 338, plan: 337 },
  { day: '1', month: 'Июнь', fact: 278, plan: 309 },
  { day: '2', month: 'Июнь', fact: 297, plan: 266 },
  { day: '3', month: 'Июнь', fact: 276, plan: 279 },
  { day: '4', month: 'Июнь', fact: 260, plan: 295 },
  { day: '5', month: 'Июнь', fact: 252, plan: 290 },
  { day: '6', month: 'Июнь', fact: 233, plan: 248 },
  { day: '7', month: 'Июнь', fact: 272, plan: 283 },
  { day: '8', month: 'Июнь', fact: 270, plan: 270 }
]

export const miningStageMetrics: MiningStageMetric[] = [
  {
    id: 'rock-mass',
    title: 'Горная масса',
    unit: 'тыс. м3',
    kind: 'bar-line',
    detailRoute: '/production-stages/mining/rock-mass',
    summary: { fact: 259, plan: 242 },
    data: rockMassData
  },
  {
    id: 'ore',
    title: 'Добыча руды',
    unit: 'тыс. т',
    kind: 'bar-line',
    summary: { fact: 0, plan: 31 },
    data: [
      { day: '10', month: 'Май', fact: 0, plan: 131 },
      { day: '11', month: 'Май', fact: 0, plan: 73 },
      { day: '12', month: 'Май', fact: 31, plan: 31 },
      { day: '13', month: 'Май', fact: 33, plan: 201 },
      { day: '14', month: 'Май', fact: 119, plan: 135 },
      { day: '15', month: 'Май', fact: 66, plan: 106 },
      { day: '16', month: 'Май', fact: 170, plan: 157 },
      { day: '17', month: 'Май', fact: 55, plan: 147 },
      { day: '18', month: 'Май', fact: 136, plan: 118 },
      { day: '19', month: 'Май', fact: 115, plan: 178 },
      { day: '20', month: 'Май', fact: 89, plan: 6 },
      { day: '21', month: 'Май', fact: 48, plan: 133 },
      { day: '22', month: 'Май', fact: 38, plan: 129 },
      { day: '23', month: 'Май', fact: 67, plan: 132 },
      { day: '24', month: 'Май', fact: 68, plan: 80 },
      { day: '25', month: 'Май', fact: 0, plan: 119 },
      { day: '26', month: 'Май', fact: 84, plan: 38 },
      { day: '27', month: 'Май', fact: 39, plan: 170 },
      { day: '28', month: 'Май', fact: 86, plan: 131 },
      { day: '29', month: 'Май', fact: 0, plan: 1 },
      { day: '30', month: 'Май', fact: 51, plan: 51 },
      { day: '31', month: 'Май', fact: 26, plan: 0 },
      { day: '1', month: 'Июнь', fact: 0, plan: 24 },
      { day: '2', month: 'Июнь', fact: 52, plan: 0 },
      { day: '3', month: 'Июнь', fact: 30, plan: 0 },
      { day: '4', month: 'Июнь', fact: 49, plan: 128 },
      { day: '5', month: 'Июнь', fact: 0, plan: 124 },
      { day: '6', month: 'Июнь', fact: 0, plan: 74 },
      { day: '7', month: 'Июнь', fact: 0, plan: 111 },
      { day: '8', month: 'Июнь', fact: 0, plan: 61 }
    ]
  },
  {
    id: 'au-content',
    title: 'Содержание Au',
    unit: 'г/т',
    kind: 'line',
    summary: { fact: 0, plan: 1.9 },
    data: [
      { day: '10', month: 'Май', fact: 0, plan: 2.2 },
      { day: '11', month: 'Май', fact: 0, plan: 1.4 },
      { day: '12', month: 'Май', fact: 1, plan: 1.5 },
      { day: '13', month: 'Май', fact: 2.4, plan: 3 },
      { day: '14', month: 'Май', fact: 2.1, plan: 3.3 },
      { day: '15', month: 'Май', fact: 2.3, plan: 2.7 },
      { day: '16', month: 'Май', fact: 3.2, plan: 3.6 },
      { day: '17', month: 'Май', fact: 2.4, plan: 3.8 },
      { day: '18', month: 'Май', fact: 1.7, plan: 4.2 },
      { day: '19', month: 'Май', fact: 1.7, plan: 3.4 },
      { day: '20', month: 'Май', fact: 2.2, plan: 3.5 },
      { day: '21', month: 'Май', fact: 2.7, plan: 3.2 },
      { day: '22', month: 'Май', fact: 3, plan: 2.5 },
      { day: '23', month: 'Май', fact: 1.9, plan: 2.3 },
      { day: '24', month: 'Май', fact: 4, plan: 3.5 },
      { day: '25', month: 'Май', fact: 0, plan: 2.6 },
      { day: '26', month: 'Май', fact: 2.1, plan: 1.3 },
      { day: '27', month: 'Май', fact: 2.4, plan: 1.7 },
      { day: '28', month: 'Май', fact: 2.4, plan: 1.8 },
      { day: '29', month: 'Май', fact: 1.1, plan: 2.4 },
      { day: '30', month: 'Май', fact: 1.8, plan: 2.1 },
      { day: '31', month: 'Май', fact: 1.4, plan: 1.5 },
      { day: '1', month: 'Июнь', fact: 2.1, plan: 0 },
      { day: '2', month: 'Июнь', fact: 2.9, plan: 0 },
      { day: '3', month: 'Июнь', fact: 3, plan: 0.9 },
      { day: '4', month: 'Июнь', fact: 2.2, plan: 1.8 },
      { day: '5', month: 'Июнь', fact: 0, plan: 3.3 },
      { day: '6', month: 'Июнь', fact: 0, plan: 2.8 },
      { day: '7', month: 'Июнь', fact: 0, plan: 2.4 },
      { day: '8', month: 'Июнь', fact: 0, plan: 1.9 }
    ]
  },
  {
    id: 'overburden',
    title: 'Вскрыша',
    unit: 'тыс. м3',
    kind: 'bar-line',
    detailRoute: '/production-stages/mining/overburden',
    summary: { fact: 233, plan: 231 },
    data: overburdenData
  }
]

export function getMiningStageMetrics() {
  return miningStageMetrics
}
