'use client'

import { type KeyboardEvent, useCallback, useState } from 'react'

import type { ModelAxisBounds, ModelAxisControls } from '@/shared/ui'

import type { MediaModel } from '../../../model'
import {
  areAxisControlsEqual,
  clampAxisControls,
  DEFAULT_AXIS_CONTROLS,
  getDefaultAxisControls
} from '../lib/axis-controls'
import { DEFAULT_MODEL_COLOR, normalizeHexColor } from '../lib/color'
import type { ControlsPanelState } from './overlay'

export function useOverlayState() {
  const [autoRotate, setAutoRotate] = useState(true)
  const [axisBounds, setAxisBounds] = useState<ModelAxisBounds>()
  const [axisControls, setAxisControls] = useState<ModelAxisControls>(DEFAULT_AXIS_CONTROLS)
  const [color, setColor] = useState(DEFAULT_MODEL_COLOR)
  const [colorInput, setColorInput] = useState(DEFAULT_MODEL_COLOR.toUpperCase())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modelResetKey, setModelResetKey] = useState(0)
  const [selectedModel, setSelectedModel] = useState<MediaModel>()
  const [showControls, setShowControls] = useState(true)
  const [showRotationAxis, setShowRotationAxis] = useState(true)
  const colorHex = color.toUpperCase()

  const updateAxisControls = useCallback((nextControls: ModelAxisControls) => {
    setAxisControls((controls) =>
      areAxisControlsEqual(controls, nextControls) ? controls : nextControls
    )
  }, [])

  const updateAxisBounds = useCallback((nextBounds: ModelAxisBounds) => {
    setAxisBounds(nextBounds)
    setAxisControls((controls) => {
      const defaultControls = getDefaultAxisControls(nextBounds)
      const nextControls = areAxisControlsEqual(controls, DEFAULT_AXIS_CONTROLS)
        ? defaultControls
        : controls
      const clampedControls = clampAxisControls(nextControls, nextBounds)

      return areAxisControlsEqual(controls, clampedControls) ? controls : clampedControls
    })
  }, [])

  const resetModelView = useCallback(() => {
    setAxisControls(axisBounds ? getDefaultAxisControls(axisBounds) : DEFAULT_AXIS_CONTROLS)
    setModelResetKey((key) => key + 1)
  }, [axisBounds])

  const updateColor = useCallback((nextColor: string) => {
    const normalizedColor = normalizeHexColor(nextColor)

    if (!normalizedColor) {
      return
    }

    setColor(normalizedColor)
    setColorInput(normalizedColor)
  }, [])

  const commitColorInput = useCallback(() => {
    const normalizedColor = normalizeHexColor(colorInput)

    if (normalizedColor) {
      setColor(normalizedColor)
      setColorInput(normalizedColor)
      return
    }

    setColorInput(colorHex)
  }, [colorHex, colorInput])

  const commitColorInputOnEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }
  }, [])

  const openModel = useCallback((model: MediaModel) => {
    setSelectedModel(model)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedModel(undefined)
  }, [])

  const toggleControls = useCallback(() => {
    setShowControls((isVisible) => !isVisible)
  }, [])

  const controlsPanel: ControlsPanelState = {
    autoRotate,
    axisBounds,
    color,
    colorInput,
    commitColorInput,
    commitColorInputOnEnter,
    onResetModelView: resetModelView,
    onToggleControls: toggleControls,
    setAutoRotate,
    setColorInput,
    setShowRotationAxis,
    showControls,
    showRotationAxis,
    updateColor
  }

  const viewerProps = {
    axisControls,
    autoRotate,
    color,
    onAxisBoundsChange: updateAxisBounds,
    onAxisControlsChange: updateAxisControls,
    resetKey: modelResetKey,
    showRotationAxis
  }

  return {
    closeModal,
    controlsPanel,
    isModalOpen,
    openModel,
    selectedModel,
    viewerProps
  }
}
