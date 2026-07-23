import { type GraphPoint } from '@/entities/production-summary'

export type GraphTopAnnotationLabel = 'max' | 'min'

export type GraphTopAnnotation = {
  date: string
  delta: number | null
  fact: number
  index: number
  label?: GraphTopAnnotationLabel
}

type EligibleGraphPoint = {
  fact: number
  index: number
  point: GraphPoint
}

const TOP_ANNOTATION_STEP = 5

function getGraphPointDelta(point: Pick<GraphPoint, 'fact' | 'plan'>) {
  const fact = Number(point.fact)
  const plan = Number(point.plan)

  if (!Number.isFinite(fact) || !Number.isFinite(plan) || fact === 0 || plan === 0) {
    return null
  }

  return ((fact - plan) / plan) * 100
}

function isFactVisiblePoint(point: GraphPoint) {
  const fact = point.fact
  const plan = Number(point.plan)

  if (typeof fact !== 'number' || !Number.isFinite(fact)) {
    return false
  }

  return !(fact === 0 && plan === 0)
}

function createAnnotation(
  point: GraphPoint,
  index: number,
  label?: GraphTopAnnotationLabel
): GraphTopAnnotation {
  return {
    date: point.date,
    delta: getGraphPointDelta(point),
    fact: Number(point.fact),
    index,
    label
  }
}

function areNeighborPoints(left: EligibleGraphPoint, right: EligibleGraphPoint) {
  return Math.abs(left.index - right.index) === 1
}

function getRegularAnnotationIndexes(points: EligibleGraphPoint[]) {
  return new Set(
    points.filter((_point, index) => index % TOP_ANNOTATION_STEP === 0).map((point) => point.index)
  )
}

export function getGraphTopAnnotations(data: GraphPoint[]) {
  const points = data
    .map((point, index) => ({ point, index, fact: Number(point.fact) }))
    .filter((point): point is EligibleGraphPoint => isFactVisiblePoint(point.point))

  if (points.length <= 1) {
    return []
  }

  const minPoint = points.reduce((min, point) => (point.fact < min.fact ? point : min))
  const maxPoint = points.reduce((max, point) => (point.fact > max.fact ? point : max))
  const shouldShowMin = points.length >= 4 && minPoint.index !== maxPoint.index
  const shouldShowRegular = points.length >= 6
  const labeledPoints = new Map<number, GraphTopAnnotation>()

  labeledPoints.set(maxPoint.index, createAnnotation(maxPoint.point, maxPoint.index, 'max'))

  if (shouldShowMin && !areNeighborPoints(minPoint, maxPoint)) {
    labeledPoints.set(minPoint.index, createAnnotation(minPoint.point, minPoint.index, 'min'))
  }

  if (!shouldShowRegular) {
    return Array.from(labeledPoints.values()).sort((left, right) => left.index - right.index)
  }

  const regularIndexes = getRegularAnnotationIndexes(points)

  points.forEach((point) => {
    if (!regularIndexes.has(point.index) || labeledPoints.has(point.index)) {
      return
    }

    const hasNeighborLabel = Array.from(labeledPoints.values()).some(
      (annotation) => Math.abs(annotation.index - point.index) === 1
    )

    if (!hasNeighborLabel) {
      labeledPoints.set(point.index, createAnnotation(point.point, point.index))
    }
  })

  return Array.from(labeledPoints.values()).sort((left, right) => left.index - right.index)
}
