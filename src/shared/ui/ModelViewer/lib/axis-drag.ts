import * as THREE from 'three'

import type { ModelAxisBounds, ModelAxisControls } from '../model/viewer'
import { clampNumber } from './axis-controls'

export type AxisDragMode = 'horizontal' | 'vertical' | null

export function getAxisDragMode(button: number): AxisDragMode {
  if (button === 0) {
    return 'horizontal'
  }

  if (button === 2) {
    return 'vertical'
  }

  return null
}

export function getHorizontalAxisDragControls(
  controls: ModelAxisControls,
  point: THREE.Vector3,
  bounds: ModelAxisBounds | null
) {
  return {
    ...controls,
    x: bounds ? clampNumber(point.x, bounds.minX, bounds.maxX) : point.x,
    z: bounds ? clampNumber(point.z, bounds.minZ, bounds.maxZ) : point.z
  }
}

export function getVerticalAxisDragControls(
  controls: ModelAxisControls,
  movementY: number,
  cameraDistance: number,
  bounds: ModelAxisBounds | null
) {
  const nextY = controls.y + movementY * cameraDistance * -0.0025

  return {
    ...controls,
    y: bounds ? clampNumber(nextY, bounds.minY, bounds.maxY) : nextY
  }
}
