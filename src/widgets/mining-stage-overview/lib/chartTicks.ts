const TREND_Y_AXIS_WIDTH = 40
const TREND_MARGIN_RIGHT = 12
const MIN_X_TICK_GAP = 26

export function getVisibleTickIndexes(pointCount: number, chartWidth: number) {
  if (pointCount <= 2) {
    return new Set(Array.from({ length: pointCount }, (_, index) => index))
  }

  const availableWidth = Math.max(chartWidth - TREND_Y_AXIS_WIDTH - TREND_MARGIN_RIGHT, 0)
  const maxTickCount = Math.max(Math.floor(availableWidth / MIN_X_TICK_GAP), 2)

  if (pointCount <= maxTickCount) {
    return new Set(Array.from({ length: pointCount }, (_, index) => index))
  }

  const lastIndex = pointCount - 1
  const maxInteriorTickCount = Math.max(maxTickCount - 2, 1)
  const step = Math.max(Math.ceil((pointCount - 2) / maxInteriorTickCount), 1)
  const indexes = new Set([0, lastIndex])

  for (let index = step; index < lastIndex; index += step) {
    if (lastIndex - index >= step) {
      indexes.add(index)
    }
  }

  return indexes
}
