import * as THREE from 'three'

import { CAMERA_DISTANCE_MULTIPLIER, DEFAULT_CAMERA_DISTANCE } from '../model/viewer'

const AXIS_BOUNDS_PADDING_RATIO = 0.15

function getBoundsPadding(size: number, fallbackSize: number) {
  return (size > 0 ? size : fallbackSize) * AXIS_BOUNDS_PADDING_RATIO
}

export function centerModel(
  object: THREE.Object3D,
  cameraDistanceMultiplier = CAMERA_DISTANCE_MULTIPLIER
) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxSize = Math.max(size.x, size.y, size.z)
  const fallbackSize = maxSize > 0 ? maxSize : DEFAULT_CAMERA_DISTANCE
  const paddingX = getBoundsPadding(size.x, fallbackSize)
  const paddingY = getBoundsPadding(size.y, fallbackSize)
  const paddingZ = getBoundsPadding(size.z, fallbackSize)
  const axisBounds = {
    maxPointScale: 2,
    maxX: box.max.x - center.x + paddingX,
    maxY: box.max.y - center.y + paddingY,
    maxZ: box.max.z - center.z + paddingZ,
    minPointScale: 0.5,
    minX: box.min.x - center.x - paddingX,
    minY: box.min.y - center.y - paddingY,
    minZ: box.min.z - center.z - paddingZ
  }
  const axisHalfHeight = Math.max(Math.abs(axisBounds.minY), Math.abs(axisBounds.maxY))

  object.position.sub(center)

  return {
    axisBounds,
    axisHalfHeight: axisHalfHeight > 0 ? axisHalfHeight : DEFAULT_CAMERA_DISTANCE * 0.75,
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
