export type MapViewBox = {
  x: number
  y: number
  width: number
  height: number
}

export type MapPoint = {
  x: number
  y: number
}

export const MAP_IMAGE_VIEW_BOX = {
  x: 0,
  y: 0,
  width: 1650,
  height: 1000
} satisfies MapViewBox

export const MAP_MAX_ZOOM = 4

export const MAP_ZOOM_STEP = 1.2

const DEFAULT_MAP_VIEW_SIZE = {
  width: 895,
  height: 700
}

const MAX_ZOOMED_OUT_VIEW_SIZE = {
  width: 2250,
  height: 1160
}

export const MAP_MIN_ZOOM = DEFAULT_MAP_VIEW_SIZE.width / MAX_ZOOMED_OUT_VIEW_SIZE.width

export const DEFAULT_MAP_ZOOM = 1

const DEFAULT_MAP_CENTER = {
  x: 1092.5,
  y: 555
} satisfies MapPoint

export const DEFAULT_MAP_VIEW_BOX = getMapViewBoxForZoom(DEFAULT_MAP_ZOOM)

export function formatViewBox(viewBox: MapViewBox) {
  return `${formatViewBoxNumber(viewBox.x)} ${formatViewBoxNumber(viewBox.y)} ${formatViewBoxNumber(viewBox.width)} ${formatViewBoxNumber(viewBox.height)}`
}

export function getMapViewBoxForZoom(zoom: number, center = DEFAULT_MAP_CENTER): MapViewBox {
  const normalizedZoom = clamp(zoom, MAP_MIN_ZOOM, MAP_MAX_ZOOM)
  const width = Math.min(DEFAULT_MAP_VIEW_SIZE.width / normalizedZoom, getMaxViewBoxWidth())
  const height = Math.min(DEFAULT_MAP_VIEW_SIZE.height / normalizedZoom, getMaxViewBoxHeight())

  return constrainMapViewBox({
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height
  })
}

export function zoomMapViewBox(
  viewBox: MapViewBox,
  zoomFactor: number,
  anchor: MapPoint
): MapViewBox {
  const width = clamp(viewBox.width / zoomFactor, getMinViewBoxWidth(), getMaxViewBoxWidth())
  const height = clamp(viewBox.height / zoomFactor, getMinViewBoxHeight(), getMaxViewBoxHeight())
  const widthRatio = width / viewBox.width
  const heightRatio = height / viewBox.height

  return constrainMapViewBox({
    x: anchor.x - (anchor.x - viewBox.x) * widthRatio,
    y: anchor.y - (anchor.y - viewBox.y) * heightRatio,
    width,
    height
  })
}

export function panMapViewBox(viewBox: MapViewBox, delta: MapPoint): MapViewBox {
  return constrainMapViewBox({
    ...viewBox,
    x: viewBox.x - delta.x,
    y: viewBox.y - delta.y
  })
}

function constrainMapViewBox(viewBox: MapViewBox): MapViewBox {
  const minX =
    viewBox.width > MAP_IMAGE_VIEW_BOX.width
      ? MAP_IMAGE_VIEW_BOX.x + MAP_IMAGE_VIEW_BOX.width - viewBox.width
      : MAP_IMAGE_VIEW_BOX.x
  const maxX =
    viewBox.width > MAP_IMAGE_VIEW_BOX.width
      ? MAP_IMAGE_VIEW_BOX.x
      : MAP_IMAGE_VIEW_BOX.x + MAP_IMAGE_VIEW_BOX.width - viewBox.width
  const minY =
    viewBox.height > MAP_IMAGE_VIEW_BOX.height
      ? MAP_IMAGE_VIEW_BOX.y + MAP_IMAGE_VIEW_BOX.height - viewBox.height
      : MAP_IMAGE_VIEW_BOX.y
  const maxY =
    viewBox.height > MAP_IMAGE_VIEW_BOX.height
      ? MAP_IMAGE_VIEW_BOX.y
      : MAP_IMAGE_VIEW_BOX.y + MAP_IMAGE_VIEW_BOX.height - viewBox.height

  return {
    ...viewBox,
    x: clamp(viewBox.x, minX, maxX),
    y: clamp(viewBox.y, minY, maxY)
  }
}

function getMinViewBoxWidth() {
  return DEFAULT_MAP_VIEW_SIZE.width / MAP_MAX_ZOOM
}

function getMinViewBoxHeight() {
  return DEFAULT_MAP_VIEW_SIZE.height / MAP_MAX_ZOOM
}

function getMaxViewBoxWidth() {
  return MAX_ZOOMED_OUT_VIEW_SIZE.width
}

function getMaxViewBoxHeight() {
  return MAX_ZOOMED_OUT_VIEW_SIZE.height
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function formatViewBoxNumber(value: number) {
  const roundedValue = Number(value.toFixed(4))

  return Object.is(roundedValue, -0) ? '0' : String(roundedValue)
}
