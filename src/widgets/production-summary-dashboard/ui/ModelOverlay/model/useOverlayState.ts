'use client'

import { type KeyboardEvent, useCallback, useEffect, useState } from 'react'

import type { ModelAxisBounds, ModelAxisControls } from '@/shared/ui'

import type { MediaModel } from '../../../model'
import {
  areAxisControlsEqual,
  areNumbersEqual,
  clampAxisControls,
  clampNumber,
  DEFAULT_AXIS_CONTROLS,
  formatCoordinate,
  formatPointScale,
  getAxisBoundsRange
} from '../lib/axis-controls'
import { DEFAULT_MODEL_COLOR, normalizeHexColor } from '../lib/color'
import type { AxisCoordinateKey, AxisInputs, ControlsPanelState } from './overlay'

export function useOverlayState() {
  const [autoRotate, setAutoRotate] = useState(true)
  const [axisBounds, setAxisBounds] = useState<ModelAxisBounds>()
  const [axisControls, setAxisControls] = useState<ModelAxisControls>(DEFAULT_AXIS_CONTROLS)
  const [axisInputs, setAxisInputs] = useState<AxisInputs>({
    pointScale: formatPointScale(DEFAULT_AXIS_CONTROLS.pointScale),
    x: formatCoordinate(DEFAULT_AXIS_CONTROLS.x),
    y: formatCoordinate(DEFAULT_AXIS_CONTROLS.y),
    z: formatCoordinate(DEFAULT_AXIS_CONTROLS.z)
  })
  const [axisSliderControls, setAxisSliderControls] =
    useState<ModelAxisControls>(DEFAULT_AXIS_CONTROLS)
  const [color, setColor] = useState(DEFAULT_MODEL_COLOR)
  const [colorInput, setColorInput] = useState(DEFAULT_MODEL_COLOR.toUpperCase())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modelResetKey, setModelResetKey] = useState(0)
  const [selectedModel, setSelectedModel] = useState<MediaModel>()
  const [showControls, setShowControls] = useState(true)
  const [showRotationAxis, setShowRotationAxis] = useState(true)
  const colorHex = color.toUpperCase()

  useEffect(() => {
    const nextAxisInputs = {
      pointScale: formatPointScale(axisControls.pointScale),
      x: formatCoordinate(axisControls.x),
      y: formatCoordinate(axisControls.y),
      z: formatCoordinate(axisControls.z)
    }

    setAxisInputs((inputs) =>
      inputs.pointScale === nextAxisInputs.pointScale &&
      inputs.x === nextAxisInputs.x &&
      inputs.y === nextAxisInputs.y &&
      inputs.z === nextAxisInputs.z
        ? inputs
        : nextAxisInputs
    )
    setAxisSliderControls((controls) =>
      areAxisControlsEqual(controls, axisControls) ? controls : axisControls
    )
  }, [axisControls])

  const updateAxisControls = useCallback((nextControls: ModelAxisControls) => {
    setAxisControls((controls) =>
      areAxisControlsEqual(controls, nextControls) ? controls : nextControls
    )
  }, [])

  const updateAxisBounds = useCallback((nextBounds: ModelAxisBounds) => {
    setAxisBounds(nextBounds)
    setAxisControls((controls) => {
      const clampedControls = clampAxisControls(controls, nextBounds)

      return areAxisControlsEqual(controls, clampedControls) ? controls : clampedControls
    })
    setAxisSliderControls((controls) => {
      const clampedControls = clampAxisControls(controls, nextBounds)

      return areAxisControlsEqual(controls, clampedControls) ? controls : clampedControls
    })
  }, [])

  const resetModelView = useCallback(() => {
    setAxisControls(DEFAULT_AXIS_CONTROLS)
    setModelResetKey((key) => key + 1)
  }, [])

  const updateAxisCoordinate = useCallback((key: AxisCoordinateKey, value: number) => {
    setAxisControls((controls) =>
      areNumbersEqual(controls[key], value)
        ? controls
        : {
            ...controls,
            [key]: value
          }
    )
  }, [])

  const updateAxisSliderDraft = useCallback((key: AxisCoordinateKey, value: number) => {
    setAxisSliderControls((controls) =>
      areNumbersEqual(controls[key], value)
        ? controls
        : {
            ...controls,
            [key]: value
          }
    )
    setAxisInputs((inputs) => ({
      ...inputs,
      [key]: formatCoordinate(value)
    }))
  }, [])

  const updatePointScale = useCallback((percent: number) => {
    const pointScale = percent / 100

    setAxisControls((controls) =>
      areNumbersEqual(controls.pointScale, pointScale)
        ? controls
        : {
            ...controls,
            pointScale
          }
    )
  }, [])

  const updatePointScaleSliderDraft = useCallback((percent: number) => {
    const pointScale = percent / 100

    setAxisSliderControls((controls) =>
      areNumbersEqual(controls.pointScale, pointScale)
        ? controls
        : {
            ...controls,
            pointScale
          }
    )
    setAxisInputs((inputs) => ({
      ...inputs,
      pointScale: formatPointScale(pointScale)
    }))
  }, [])

  const commitAxisInput = useCallback(
    (key: AxisCoordinateKey) => {
      const value = Number(axisInputs[key])
      const boundsRange = getAxisBoundsRange(axisBounds, key)

      if (!Number.isFinite(value) || !boundsRange) {
        setAxisInputs((inputs) => ({
          ...inputs,
          [key]: formatCoordinate(axisControls[key])
        }))
        return
      }

      updateAxisCoordinate(key, clampNumber(value, boundsRange.min, boundsRange.max))
    },
    [axisBounds, axisControls, axisInputs, updateAxisCoordinate]
  )

  const commitPointScaleInput = useCallback(() => {
    const value = Number(axisInputs.pointScale)
    const min = axisBounds ? axisBounds.minPointScale * 100 : 50
    const max = axisBounds ? axisBounds.maxPointScale * 100 : 200

    if (!Number.isFinite(value)) {
      setAxisInputs((inputs) => ({
        ...inputs,
        pointScale: formatPointScale(axisControls.pointScale)
      }))
      return
    }

    updatePointScale(clampNumber(value, min, max))
  }, [axisBounds, axisControls.pointScale, axisInputs.pointScale, updatePointScale])

  const commitAxisInputOnEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }
  }, [])

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
    axisInputs,
    axisSliderControls,
    color,
    colorInput,
    commitAxisInput,
    commitAxisInputOnEnter,
    commitColorInput,
    commitColorInputOnEnter,
    commitPointScaleInput,
    onResetModelView: resetModelView,
    onToggleControls: toggleControls,
    setAutoRotate,
    setAxisInputs,
    setColorInput,
    setShowRotationAxis,
    showControls,
    showRotationAxis,
    updateAxisCoordinate,
    updateAxisSliderDraft,
    updateColor,
    updatePointScale,
    updatePointScaleSliderDraft
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
