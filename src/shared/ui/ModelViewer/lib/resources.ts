import * as THREE from 'three'

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  const materials = Array.isArray(material) ? material : [material]

  materials.forEach((item) => item.dispose())
}

export function disposeModelObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh

    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    if (mesh.material) {
      disposeMaterial(mesh.material)
    }
  })
}
