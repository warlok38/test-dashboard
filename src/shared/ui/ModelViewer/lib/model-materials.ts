import * as THREE from 'three'

function getMeshMaterials(mesh: THREE.Mesh) {
  if (Array.isArray(mesh.material)) {
    return mesh.material
  }

  return mesh.material ? [mesh.material] : []
}

export function applyModelColor(object: THREE.Object3D | null, color?: string) {
  if (!object || !color) {
    return
  }

  object.traverse((child) => {
    const mesh = child as THREE.Mesh

    getMeshMaterials(mesh).forEach((material) => {
      if ('color' in material && material.color instanceof THREE.Color) {
        material.color.set(color)
        material.needsUpdate = true
      }
    })
  })
}
