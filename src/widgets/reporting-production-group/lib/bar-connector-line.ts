export type BarConnectorPoint = {
  x: number
  y: number
  width: number
}

export type BarConnectorSegment = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export function getBarConnectorSegments(points: BarConnectorPoint[]): BarConnectorSegment[] {
  return points.slice(0, -1).map((point, index) => {
    const nextPoint = points[index + 1]

    return {
      x1: point.x + point.width,
      y1: point.y,
      x2: nextPoint.x,
      y2: nextPoint.y
    }
  })
}
