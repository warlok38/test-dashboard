export type ModelAxisControls = {
  pointScale: number
  x: number
  y: number
  z: number
}

export type ModelAxisBounds = {
  maxPointScale: number
  maxX: number
  maxY: number
  maxZ: number
  minPointScale: number
  minX: number
  minY: number
  minZ: number
}

export type ModelLoadState = 'idle' | 'loading' | 'ready' | 'error'

export const AUTO_ROTATE_SPEED = 0.003
export const CAMERA_DISTANCE_MULTIPLIER = 2.4
export const DEFAULT_CAMERA_DISTANCE = 8
export const INTERACTION_IDLE_DELAY_MS = 5000

export const MODEL_LIGHTING = {
  ambientIntensity: 1.55,
  directionalDistance: 10,
  directionalElevationDeg: 38,
  directionalIntensity: 2.7,
  directionalAzimuthDeg: 42
} as const
