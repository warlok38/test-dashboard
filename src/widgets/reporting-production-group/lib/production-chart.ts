import type { BarConnectorPoint } from './bar-connector-line'

export const PRODUCTION_BAR_SIZE = 60
export const PRODUCTION_CHART_MARGIN = { top: 44, right: 20, left: 20, bottom: 0 } as const

const productionBarColors = ['#c3cfe1', '#cfd0d2', 'var(--color-kpi-fact)'] as const

export function getProductionBarFill(caption: string | undefined, index: number) {
  return productionBarColors[index] ?? (caption === 'БП' ? '#cfd0d2' : 'var(--color-kpi-fact)')
}

export function isSameBarConnectorPoint(left: BarConnectorPoint, right: BarConnectorPoint) {
  return left.x === right.x && left.y === right.y && left.width === right.width
}

export function isBarConnectorPoint(
  point: BarConnectorPoint | undefined
): point is BarConnectorPoint {
  return Boolean(point)
}
