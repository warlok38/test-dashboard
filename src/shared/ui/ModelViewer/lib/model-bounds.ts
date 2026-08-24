import * as THREE from 'three'

import { CAMERA_DISTANCE_MULTIPLIER, DEFAULT_CAMERA_DISTANCE } from '../model/model-viewer'

export function centerModel(
  object: THREE.Object3D,
  cameraDistanceMultiplier = CAMERA_DISTANCE_MULTIPLIER
) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxSize = Math.max(size.x, size.y, size.z)

  object.position.sub(center)

  return {
    cameraDistance: maxSize > 0 ? maxSize * cameraDistanceMultiplier : DEFAULT_CAMERA_DISTANCE,
    target: new THREE.Vector3(0, 0, 0)
  }
}

export function createCenteredModelPivot(
  object: THREE.Object3D,
  cameraDistanceMultiplier?: number
) {
  const pivot = new THREE.Group()
  const view = centerModel(object, cameraDistanceMultiplier)

  pivot.add(object)

  return {
    ...view,
    pivot
  }
}
