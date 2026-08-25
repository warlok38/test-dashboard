import * as THREE from 'three'

import { MODEL_LIGHTING } from '../model/viewer'

function getDirectionalLightPosition() {
  const azimuth = THREE.MathUtils.degToRad(MODEL_LIGHTING.directionalAzimuthDeg)
  const elevation = THREE.MathUtils.degToRad(MODEL_LIGHTING.directionalElevationDeg)
  const horizontalDistance = Math.cos(elevation) * MODEL_LIGHTING.directionalDistance

  return new THREE.Vector3(
    Math.sin(azimuth) * horizontalDistance,
    Math.sin(elevation) * MODEL_LIGHTING.directionalDistance,
    Math.cos(azimuth) * horizontalDistance
  )
}

export function createSceneLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, MODEL_LIGHTING.ambientIntensity)
  const directionalLight = new THREE.DirectionalLight(0xffffff, MODEL_LIGHTING.directionalIntensity)

  directionalLight.position.copy(getDirectionalLightPosition())

  return [ambientLight, directionalLight]
}

export function resizeRenderer(
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
