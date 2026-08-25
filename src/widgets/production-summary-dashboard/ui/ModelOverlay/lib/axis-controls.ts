import type { ModelAxisBounds, ModelAxisControls } from '@/shared/ui'

import type { AxisCoordinateKey } from '../model/overlay'

export const DEFAULT_AXIS_CONTROLS: ModelAxisControls = {
  pointScale: 1,
  x: 0,
  y: 0,
  z: 0
}

export const POINT_SCALE_PERCENT_STEP = 5

const AXIS_CONTROLS_EPSILON = 0.0001

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function formatCoordinate(value: number) {
  return Number(value.toFixed(2)).toString()
}

export function formatPointScale(value: number) {
  return Math.round(value * 100).toString()
}

export function areAxisControlsEqual(left: ModelAxisControls, right: ModelAxisControls) {
  return (
    Math.abs(left.pointScale - right.pointScale) < AXIS_CONTROLS_EPSILON &&
    Math.abs(left.x - right.x) < AXIS_CONTROLS_EPSILON &&
    Math.abs(left.y - right.y) < AXIS_CONTROLS_EPSILON &&
    Math.abs(left.z - right.z) < AXIS_CONTROLS_EPSILON
  )
}

export function areNumbersEqual(left: number, right: number) {
  return Math.abs(left - right) < AXIS_CONTROLS_EPSILON
}

export function getAxisBoundsRange(bounds: ModelAxisBounds | undefined, key: AxisCoordinateKey) {
  if (!bounds) {
    return null
  }

  switch (key) {
    case 'x':
      return { max: bounds.maxX, min: bounds.minX }
    case 'y':
      return { max: bounds.maxY, min: bounds.minY }
    case 'z':
      return { max: bounds.maxZ, min: bounds.minZ }
  }
}

export function clampAxisControls(controls: ModelAxisControls, bounds: ModelAxisBounds) {
  return {
    pointScale: clampNumber(controls.pointScale, bounds.minPointScale, bounds.maxPointScale),
    x: clampNumber(controls.x, bounds.minX, bounds.maxX),
    y: clampNumber(controls.y, bounds.minY, bounds.maxY),
    z: clampNumber(controls.z, bounds.minZ, bounds.maxZ)
  }
}
