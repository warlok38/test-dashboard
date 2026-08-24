'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

import { createCenteredModelPivot } from '../lib/model-bounds'
import { applyModelColor } from '../lib/model-materials'
import { disposeModelObject } from '../lib/model-resources'
import { getModelLoadProgress } from '../lib/loading-progress'
import { AUTO_ROTATE_SPEED, INTERACTION_IDLE_DELAY_MS, type ModelLoadState } from './model-viewer'

type UseModelViewerSceneParams = {
  autoRotate: boolean
  cameraDistanceMultiplier?: number
  color?: string
  interactive: boolean
  src: string
}

function createSceneLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.4)

  directionalLight.position.set(4, 6, 8)

  return [ambientLight, directionalLight]
}

function resizeRenderer(
  container: HTMLDivElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) {
  const { clientHeight, clientWidth } = container

  if (!clientHeight || !clientWidth) {
    return
  }

  camera.aspect = clientWidth / clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(clientWidth, clientHeight)
}

export function useModelViewerScene({
  autoRotate,
  cameraDistanceMultiplier,
  color,
  interactive,
  src
}: UseModelViewerSceneParams) {
  const autoRotateRef = useRef(autoRotate)
  const colorRef = useRef(color)
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>()
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const modelRef = useRef<THREE.Object3D | null>(null)
  const modelPivotRef = useRef<THREE.Group | null>(null)
  const [loadState, setLoadState] = useState<ModelLoadState>('idle')
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    autoRotateRef.current = autoRotate
  }, [autoRotate])

  useEffect(() => {
    colorRef.current = color
    applyModelColor(modelRef.current, color)
  }, [color])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    let isMounted = true
    let isAutoRotatePausedByInteraction = false
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    const controls = new OrbitControls(camera, renderer.domElement)
    const loader = new GLTFLoader()
    const resizeObserver = new ResizeObserver(() => resizeRenderer(container, camera, renderer))

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
        const { cameraDistance, pivot, target } = createCenteredModelPivot(
          model,
          cameraDistanceMultiplier
        )

        applyModelColor(model, colorRef.current)
        modelRef.current = model
        modelPivotRef.current = pivot
        scene.add(pivot)
        camera.position.set(cameraDistance, cameraDistance * 0.45, cameraDistance)
        camera.lookAt(target)
        controls.target.copy(target)
        controls.update()
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
      controls.dispose()

      if (modelPivotRef.current) {
        disposeModelObject(modelPivotRef.current)
        modelPivotRef.current = null
      }

      if (modelRef.current) {
        modelRef.current = null
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
