import * as THREE from 'three'

export function createRotationAxis(axisHalfHeight: number, visible: boolean) {
  const group = new THREE.Group()
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -axisHalfHeight, 0),
    new THREE.Vector3(0, axisHalfHeight, 0)
  ])
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x59c4f6,
    transparent: true,
    opacity: 0.82
  })
  const markerGeometry = new THREE.SphereGeometry(axisHalfHeight * 0.045, 24, 16)
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x59c4f6 })
  const line = new THREE.Line(lineGeometry, lineMaterial)
  const marker = new THREE.Mesh(markerGeometry, markerMaterial)

  group.add(line)
  group.add(marker)
  setRotationAxisVisibility(group, visible)

  return {
    axis: group,
    marker
  }
}

export function setRotationAxisVisibility(axis: THREE.Object3D | null, visible: boolean) {
  axis?.traverse((child) => {
    child.visible = visible
  })
}

export function setPointScale(marker: THREE.Object3D | null, pointScale: number) {
  marker?.scale.setScalar(pointScale)
}

export function setMarkerY(marker: THREE.Object3D | null, y: number) {
  if (marker) {
    marker.position.y = y
  }
}
