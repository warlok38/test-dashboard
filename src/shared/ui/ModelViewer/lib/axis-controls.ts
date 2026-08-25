import type { ModelAxisBounds, ModelAxisControls } from '../model/viewer'

export const DEFAULT_AXIS_CONTROLS: ModelAxisControls = {
  pointScale: 1,
  x: 0,
  y: 0,
  z: 0
}

const AXIS_CONTROLS_EPSILON = 0.0001

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function areAxisControlsEqual(left: ModelAxisControls, right: ModelAxisControls) {
  return (
    Math.abs(left.pointScale - right.pointScale) < AXIS_CONTROLS_EPSILON &&
    Math.abs(left.x - right.x) < AXIS_CONTROLS_EPSILON &&
    Math.abs(left.y - right.y) < AXIS_CONTROLS_EPSILON &&
    Math.abs(left.z - right.z) < AXIS_CONTROLS_EPSILON
  )
}

export function clampAxisControls(controls: ModelAxisControls, bounds: ModelAxisBounds | null) {
  if (!bounds) {
    return controls
  }

  return {
    pointScale: clampNumber(controls.pointScale, bounds.minPointScale, bounds.maxPointScale),
    x: clampNumber(controls.x, bounds.minX, bounds.maxX),
    y: clampNumber(controls.y, bounds.minY, bounds.maxY),
    z: clampNumber(controls.z, bounds.minZ, bounds.maxZ)
  }
}
