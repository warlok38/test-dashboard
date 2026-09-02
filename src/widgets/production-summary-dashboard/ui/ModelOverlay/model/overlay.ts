import type { KeyboardEvent } from 'react'

import type { ModelAxisBounds } from '@/shared/ui'

export type ControlsPanelState = {
  autoRotate: boolean
  axisBounds?: ModelAxisBounds
  color: string
  colorInput: string
  commitColorInput: () => void
  commitColorInputOnEnter: (event: KeyboardEvent<HTMLInputElement>) => void
  onResetModelView: () => void
  onToggleControls: () => void
  setAutoRotate: (value: boolean) => void
  setColorInput: (value: string) => void
  setShowRotationAxis: (value: boolean) => void
  showControls: boolean
  showRotationAxis: boolean
  updateColor: (value: string) => void
}
