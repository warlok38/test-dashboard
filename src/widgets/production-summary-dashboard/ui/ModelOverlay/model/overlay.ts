import type { Dispatch, KeyboardEvent, SetStateAction } from 'react'

import type { ModelAxisBounds, ModelAxisControls } from '@/shared/ui'

export type AxisCoordinateKey = 'x' | 'y' | 'z'

export type AxisInputs = {
  pointScale: string
  x: string
  y: string
  z: string
}

export type ControlsPanelState = {
  autoRotate: boolean
  axisBounds?: ModelAxisBounds
  axisInputs: AxisInputs
  axisSliderControls: ModelAxisControls
  color: string
  colorInput: string
  commitAxisInput: (key: AxisCoordinateKey) => void
  commitAxisInputOnEnter: (event: KeyboardEvent<HTMLInputElement>) => void
  commitColorInput: () => void
  commitColorInputOnEnter: (event: KeyboardEvent<HTMLInputElement>) => void
  commitPointScaleInput: () => void
  onResetModelView: () => void
  onToggleControls: () => void
  setAutoRotate: (value: boolean) => void
  setAxisInputs: Dispatch<SetStateAction<AxisInputs>>
  setColorInput: (value: string) => void
  setShowRotationAxis: (value: boolean) => void
  showControls: boolean
  showRotationAxis: boolean
  updateAxisCoordinate: (key: AxisCoordinateKey, value: number) => void
  updateAxisSliderDraft: (key: AxisCoordinateKey, value: number) => void
  updateColor: (value: string) => void
  updatePointScale: (percent: number) => void
  updatePointScaleSliderDraft: (percent: number) => void
}
