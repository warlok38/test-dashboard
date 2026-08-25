'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

import {
  areAxisControlsEqual,
  clampAxisControls,
  DEFAULT_AXIS_CONTROLS
} from '../lib/axis-controls'
import {
  createRotationAxis,
  setMarkerY,
  setPointScale,
  setRotationAxisVisibility
} from '../lib/axis'
import {
  getAxisDragMode,
  getHorizontalAxisDragControls,
  getVerticalAxisDragControls,
  type AxisDragMode
} from '../lib/axis-drag'
import { createCenteredModelPivot } from '../lib/bounds'
import { getModelLoadProgress } from '../lib/loading'
import { applyModelColor } from '../lib/materials'
import { disposeModelObject } from '../lib/resources'
import { createSceneLights, resizeRenderer } from '../lib/scene'
import { applyAxisTransform } from '../lib/transform'
import {
  AUTO_ROTATE_SPEED,
  INTERACTION_IDLE_DELAY_MS,
  type ModelAxisBounds,
  type ModelAxisControls,
  type ModelLoadState
} from './viewer'

type UseModelViewerSceneParams = {
  axisControls?: ModelAxisControls
  autoRotate: boolean
  cameraDistanceMultiplier?: number
  color?: string
  interactive: boolean
  onAxisBoundsChange?: (bounds: ModelAxisBounds) => void
  onAxisControlsChange?: (controls: ModelAxisControls) => void
  resetKey: number
  showRotationAxis: boolean
  src: string
}

export function useModelViewerScene({
  axisControls,
  autoRotate,
  cameraDistanceMultiplier,
  color,
  interactive,
  onAxisBoundsChange,
  onAxisControlsChange,
  resetKey,
  showRotationAxis,
  src
}: UseModelViewerSceneParams) {
  const axisControlsRef = useRef<ModelAxisControls>(axisControls ?? DEFAULT_AXIS_CONTROLS)
  const autoRotateRef = useRef(autoRotate)
  const applyAxisControlsRef = useRef<((controls: ModelAxisControls) => void) | null>(null)
  const colorRef = useRef(color)
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>()
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const resetViewRef = useRef<(() => void) | null>(null)
  const rotationAxisRef = useRef<THREE.Group | null>(null)
  const rotationMarkerRef = useRef<THREE.Mesh | null>(null)
  const showRotationAxisRef = useRef(showRotationAxis)
  const modelRef = useRef<THREE.Object3D | null>(null)
  const modelDefaultPositionRef = useRef<THREE.Vector3 | null>(null)
  const modelDefaultQuaternionRef = useRef<THREE.Quaternion | null>(null)
  const modelDefaultScaleRef = useRef<THREE.Vector3 | null>(null)
  const modelDefaultWorldMatrixRef = useRef<THREE.Matrix4 | null>(null)
  const modelPivotRef = useRef<THREE.Group | null>(null)
  const onAxisBoundsChangeRef = useRef(onAxisBoundsChange)
  const onAxisControlsChangeRef = useRef(onAxisControlsChange)
  const [loadState, setLoadState] = useState<ModelLoadState>('idle')
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    autoRotateRef.current = autoRotate
  }, [autoRotate])

  useEffect(() => {
    onAxisBoundsChangeRef.current = onAxisBoundsChange
  }, [onAxisBoundsChange])

  useEffect(() => {
    onAxisControlsChangeRef.current = onAxisControlsChange
  }, [onAxisControlsChange])

  useEffect(() => {
    const nextAxisControls = axisControls ?? DEFAULT_AXIS_CONTROLS

    if (areAxisControlsEqual(axisControlsRef.current, nextAxisControls)) {
      return
    }

    axisControlsRef.current = nextAxisControls
    applyAxisControlsRef.current?.(nextAxisControls)
  }, [axisControls])

  useEffect(() => {
    colorRef.current = color
    applyModelColor(modelRef.current, color)
  }, [color])

  useEffect(() => {
    showRotationAxisRef.current = showRotationAxis
    setRotationAxisVisibility(rotationAxisRef.current, showRotationAxis)
  }, [showRotationAxis])

  useEffect(() => {
    resetViewRef.current?.()
  }, [resetKey])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    let isMounted = true
    let isAutoRotatePausedByInteraction = false
    let axisDragMode: AxisDragMode = null
    let axisBounds: ModelAxisBounds | null = null
    const defaultCameraPosition = new THREE.Vector3()
    const defaultTarget = new THREE.Vector3()
    const defaultAxisControls = { ...DEFAULT_AXIS_CONTROLS }
    const defaultModelPivotPosition = new THREE.Vector3()
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    const controls = new OrbitControls(camera, renderer.domElement)
    const loader = new GLTFLoader()
    const horizontalDragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const pointer = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()
    const resizeObserver = new ResizeObserver(() => resizeRenderer(container, camera, renderer))

    raycaster.params.Line = { threshold: 0.25 }

    const setPointerFromEvent = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
    }

    const syncControlsTarget = (targetControls = axisControlsRef.current) => {
      controls.target.set(targetControls.x, targetControls.y, targetControls.z)
      controls.update()
    }

    const setAxisControlsInScene = (controls: ModelAxisControls) => {
      axisControlsRef.current = controls
    }

    const commitAxisControlsChange = () => {
      onAxisControlsChangeRef.current?.(axisControlsRef.current)
    }

    const updateModelPivot = (position: THREE.Vector3, targetY = axisControlsRef.current.y) => {
      applyAxisTransform({
        axis: rotationAxisRef.current,
        defaultModelPivotPosition,
        defaultModelWorldMatrix: modelDefaultWorldMatrixRef.current,
        marker: rotationMarkerRef.current,
        model: modelRef.current,
        pivot: modelPivotRef.current,
        position,
        targetY
      })
    }

    const applyAxisControls = (controls: ModelAxisControls) => {
      const nextControls = clampAxisControls(controls, axisBounds)

      axisControlsRef.current = nextControls
      updateModelPivot(new THREE.Vector3(nextControls.x, 0, nextControls.z), nextControls.y)
      setPointScale(rotationMarkerRef.current, nextControls.pointScale)
      syncControlsTarget(nextControls)

      if (!areAxisControlsEqual(controls, nextControls)) {
        onAxisControlsChangeRef.current?.(nextControls)
      }
    }

    const resetView = () => {
      const model = modelRef.current
      const pivot = modelPivotRef.current
      const defaultModelPosition = modelDefaultPositionRef.current
      const defaultModelQuaternion = modelDefaultQuaternionRef.current
      const defaultModelScale = modelDefaultScaleRef.current

      if (
        !model ||
        !pivot ||
        !defaultModelPosition ||
        !defaultModelQuaternion ||
        !defaultModelScale
      ) {
        return
      }

      axisControlsRef.current = defaultAxisControls
      pivot.position.copy(defaultModelPivotPosition)
      pivot.rotation.set(0, 0, 0)
      model.position.copy(defaultModelPosition)
      model.quaternion.copy(defaultModelQuaternion)
      model.scale.copy(defaultModelScale)
      rotationAxisRef.current?.position.copy(defaultTarget)
      setMarkerY(rotationMarkerRef.current, defaultAxisControls.y)
      setPointScale(rotationMarkerRef.current, defaultAxisControls.pointScale)
      camera.position.copy(defaultCameraPosition)
      controls.target.copy(defaultTarget)
      controls.update()
      onAxisControlsChangeRef.current?.(defaultAxisControls)
    }

    const pauseAutoRotate = () => {
      if (!interactive) {
        return
      }

      isAutoRotatePausedByInteraction = true

      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current)
      }
    }

    const resumeAutoRotateLater = () => {
      if (!interactive) {
        return
      }

      pauseAutoRotate()

      interactionTimerRef.current = setTimeout(() => {
        isAutoRotatePausedByInteraction = false
      }, INTERACTION_IDLE_DELAY_MS)
    }

    const stopAxisDrag = () => {
      if (!axisDragMode) {
        return
      }

      axisDragMode = null
      controls.enabled = true
      syncControlsTarget()
      commitAxisControlsChange()
      resumeAutoRotateLater()
    }

    const getAxisIntersection = (event: PointerEvent) => {
      if (!showRotationAxisRef.current || !rotationAxisRef.current) {
        return null
      }

      setPointerFromEvent(event)
      return raycaster.intersectObjects(rotationAxisRef.current.children, false)[0] ?? null
    }

    const dragHorizontalAxis = (event: PointerEvent) => {
      const point = new THREE.Vector3()

      setPointerFromEvent(event)

      if (!raycaster.ray.intersectPlane(horizontalDragPlane, point)) {
        return
      }

      const nextControls = getHorizontalAxisDragControls(axisControlsRef.current, point, axisBounds)

      updateModelPivot(new THREE.Vector3(nextControls.x, 0, nextControls.z), nextControls.y)
      setAxisControlsInScene(nextControls)
    }

    const dragVerticalMarker = (event: PointerEvent) => {
      const axis = rotationAxisRef.current

      if (!axis) {
        return
      }

      const cameraDistance = camera.position.distanceTo(controls.target)
      const nextControls = getVerticalAxisDragControls(
        axisControlsRef.current,
        event.movementY,
        cameraDistance,
        axisBounds
      )

      axis.position.set(nextControls.x, defaultModelPivotPosition.y, nextControls.z)
      setMarkerY(rotationMarkerRef.current, nextControls.y)
      setAxisControlsInScene(nextControls)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!interactive || !showRotationAxisRef.current || event.button > 2) {
        return
      }

      const intersection = getAxisIntersection(event)

      if (!intersection) {
        return
      }

      event.preventDefault()
      renderer.domElement.setPointerCapture(event.pointerId)
      pauseAutoRotate()
      controls.enabled = false
      axisDragMode = getAxisDragMode(event.button)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (axisDragMode === 'horizontal') {
        event.preventDefault()
        dragHorizontalAxis(event)
        return
      }

      if (axisDragMode === 'vertical') {
        event.preventDefault()
        dragVerticalMarker(event)
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId)
      }

      stopAxisDrag()
    }

    const preventContextMenu = (event: MouseEvent) => {
      if (showRotationAxisRef.current) {
        event.preventDefault()
      }
    }

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableRotate = interactive
    controls.enableZoom = interactive

    scene.add(...createSceneLights())
    container.appendChild(renderer.domElement)
    resizeObserver.observe(container)

    if (interactive) {
      controls.addEventListener('start', pauseAutoRotate)
      controls.addEventListener('end', resumeAutoRotateLater)
      renderer.domElement.addEventListener('contextmenu', preventContextMenu)
      renderer.domElement.addEventListener('pointerdown', onPointerDown)
      renderer.domElement.addEventListener('pointermove', onPointerMove)
      renderer.domElement.addEventListener('pointerup', onPointerUp)
      renderer.domElement.addEventListener('pointercancel', onPointerUp)
    }

    setLoadState('loading')
    setProgress(null)

    loader.load(
      src,
      (gltf) => {
        if (!isMounted) {
          disposeModelObject(gltf.scene)
          return
        }

        const model = gltf.scene
        const {
          axisBounds: modelAxisBounds,
          axisHalfHeight,
          cameraDistance,
          pivot,
          target
        } = createCenteredModelPivot(model, cameraDistanceMultiplier)
        const { axis, marker } = createRotationAxis(axisHalfHeight, showRotationAxisRef.current)

        applyModelColor(model, colorRef.current)
        modelRef.current = model
        modelDefaultPositionRef.current = model.position.clone()
        modelDefaultQuaternionRef.current = model.quaternion.clone()
        modelDefaultScaleRef.current = model.scale.clone()
        modelPivotRef.current = pivot
        rotationAxisRef.current = axis
        rotationMarkerRef.current = marker
        scene.add(pivot)
        scene.add(axis)
        model.updateMatrixWorld(true)
        modelDefaultWorldMatrixRef.current = model.matrixWorld.clone()
        axisBounds = modelAxisBounds
        onAxisBoundsChangeRef.current?.(axisBounds)
        camera.position.set(cameraDistance, cameraDistance * 0.45, cameraDistance)
        camera.lookAt(target)
        controls.target.copy(target)
        controls.update()
        defaultCameraPosition.copy(camera.position)
        defaultTarget.copy(target)
        defaultModelPivotPosition.copy(pivot.position)
        resetViewRef.current = resetView
        applyAxisControlsRef.current = applyAxisControls
        applyAxisControls(axisControlsRef.current)
        setLoadState('ready')
        setProgress(100)
      },
      (event) => {
        if (isMounted) {
          setProgress(getModelLoadProgress(event))
        }
      },
      () => {
        if (isMounted) {
          setLoadState('error')
        }
      }
    )

    const animate = () => {
      frameRef.current = window.requestAnimationFrame(animate)

      if (modelPivotRef.current && autoRotateRef.current && !isAutoRotatePausedByInteraction) {
        modelPivotRef.current.rotation.y += AUTO_ROTATE_SPEED
      }

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      isMounted = false

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
      }

      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current)
      }

      resizeObserver.disconnect()
      controls.removeEventListener('start', pauseAutoRotate)
      controls.removeEventListener('end', resumeAutoRotateLater)
      renderer.domElement.removeEventListener('contextmenu', preventContextMenu)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointercancel', onPointerUp)
      controls.dispose()
      applyAxisControlsRef.current = null
      resetViewRef.current = null

      if (modelPivotRef.current) {
        disposeModelObject(modelPivotRef.current)
        modelPivotRef.current = null
      }

      if (modelRef.current) {
        modelRef.current = null
        modelDefaultPositionRef.current = null
        modelDefaultQuaternionRef.current = null
        modelDefaultScaleRef.current = null
        modelDefaultWorldMatrixRef.current = null
      }

      if (rotationAxisRef.current) {
        disposeModelObject(rotationAxisRef.current)
        rotationAxisRef.current = null
        rotationMarkerRef.current = null
      }

      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [cameraDistanceMultiplier, interactive, src])

  return {
    containerRef,
    loadState,
    progress
  }
}
