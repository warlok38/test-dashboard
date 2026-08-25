import * as THREE from 'three'

type ApplyAxisTransformParams = {
  axis: THREE.Object3D | null
  defaultModelPivotPosition: THREE.Vector3
  defaultModelWorldMatrix: THREE.Matrix4 | null
  marker: THREE.Object3D | null
  model: THREE.Object3D | null
  pivot: THREE.Object3D | null
  position: THREE.Vector3
  targetY: number
}

export function applyAxisTransform({
  axis,
  defaultModelPivotPosition,
  defaultModelWorldMatrix,
  marker,
  model,
  pivot,
  position,
  targetY
}: ApplyAxisTransformParams) {
  if (!model || !pivot || !defaultModelWorldMatrix) {
    return
  }

  pivot.position.set(position.x, defaultModelPivotPosition.y, position.z)
  pivot.updateMatrixWorld(true)

  const modelLocalMatrix = pivot.matrixWorld.clone().invert().multiply(defaultModelWorldMatrix)
  modelLocalMatrix.decompose(model.position, model.quaternion, model.scale)

  if (axis) {
    axis.position.set(position.x, defaultModelPivotPosition.y, position.z)
  }

  if (marker) {
    marker.position.y = targetY
  }
}
