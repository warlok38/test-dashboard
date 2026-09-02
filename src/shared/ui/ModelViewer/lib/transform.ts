import * as THREE from 'three'

type ApplyAxisTransformParams = {
  axis: THREE.Object3D | null
  defaultModelPivotPosition: THREE.Vector3
  marker: THREE.Object3D | null
  model: THREE.Object3D | null
  pivot: THREE.Object3D | null
  position: THREE.Vector3
  sourceModelWorldMatrix: THREE.Matrix4 | null
  targetY: number
}

export function applyAxisTransform({
  axis,
  defaultModelPivotPosition,
  marker,
  model,
  pivot,
  position,
  sourceModelWorldMatrix,
  targetY
}: ApplyAxisTransformParams) {
  if (!model || !pivot || !sourceModelWorldMatrix) {
    return
  }

  pivot.position.set(position.x, defaultModelPivotPosition.y, position.z)
  pivot.updateMatrixWorld(true)

  const modelLocalMatrix = pivot.matrixWorld.clone().invert().multiply(sourceModelWorldMatrix)
  modelLocalMatrix.decompose(model.position, model.quaternion, model.scale)

  if (axis) {
    axis.position.set(position.x, defaultModelPivotPosition.y, position.z)
  }

  if (marker) {
    marker.position.y = targetY
  }
}
