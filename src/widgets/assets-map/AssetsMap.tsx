'use client'

import { MinusOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Popover } from 'antd'
import { type MouseEvent, type PointerEvent, useEffect, useRef, useState } from 'react'

import { ASSET_MAP_MARKERS, ASSET_MAP_REGIONS } from './model/assets-map-layers'
import {
  DEFAULT_MAP_VIEW_BOX,
  MAP_IMAGE_VIEW_BOX,
  MAP_ZOOM_STEP,
  formatViewBox,
  panMapViewBox,
  zoomMapViewBox,
  type MapPoint,
  type MapViewBox
} from './model/assets-map-view'
import styles from './AssetsMap.module.css'

type DragState = {
  pointerId: number
  startClientPoint: MapPoint
  startViewBox: MapViewBox
}

export function AssetsMap() {
  const mapRef = useRef<SVGSVGElement>(null)
  const viewBoxRef = useRef(DEFAULT_MAP_VIEW_BOX)
  const dragMovedRef = useRef(false)
  const suppressNextRegionClickRef = useRef(false)
  const [viewBox, setViewBox] = useState<MapViewBox>(DEFAULT_MAP_VIEW_BOX)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [detail, setDetail] = useState('Деталка')

  useEffect(() => {
    viewBoxRef.current = viewBox
  }, [viewBox])

  useEffect(() => {
    const map = mapRef.current

    if (!map) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        return
      }

      const anchor = getSvgPoint(event.clientX, event.clientY)

      if (!anchor) {
        return
      }

      event.preventDefault()
      setViewBox((currentViewBox) =>
        zoomMapViewBox(currentViewBox, event.deltaY < 0 ? MAP_ZOOM_STEP : 1 / MAP_ZOOM_STEP, anchor)
      )
    }

    map.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      map.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const zoomMap = (zoomFactor: number, anchor?: MapPoint) => {
    setViewBox((currentViewBox) =>
      zoomMapViewBox(currentViewBox, zoomFactor, anchor ?? getViewBoxCenter(currentViewBox))
    )
  }

  const resetMap = () => {
    setViewBox(DEFAULT_MAP_VIEW_BOX)
    setDragState(null)
  }

  const startMapDrag = (event: PointerEvent<SVGElement>) => {
    if (event.button !== 0) {
      return
    }

    const point = getSvgPoint(event.clientX, event.clientY)

    if (!point) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    dragMovedRef.current = false
    setDragState({
      pointerId: event.pointerId,
      startClientPoint: {
        x: event.clientX,
        y: event.clientY
      },
      startViewBox: viewBoxRef.current
    })
  }

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    startMapDrag(event)
  }

  const handlePointerMove = (event: PointerEvent<SVGElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    const map = mapRef.current
    const rect = map?.getBoundingClientRect()

    if (!rect) {
      return
    }

    if (
      Math.abs(event.clientX - dragState.startClientPoint.x) > 3 ||
      Math.abs(event.clientY - dragState.startClientPoint.y) > 3
    ) {
      dragMovedRef.current = true
    }

    setViewBox(
      panMapViewBox(dragState.startViewBox, {
        x:
          (event.clientX - dragState.startClientPoint.x) /
          getRenderedMapScale(rect, dragState.startViewBox),
        y:
          (event.clientY - dragState.startClientPoint.y) /
          getRenderedMapScale(rect, dragState.startViewBox)
      })
    )
  }

  const handlePointerUp = (event: PointerEvent<SVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (dragMovedRef.current) {
      suppressNextRegionClickRef.current = true
      window.setTimeout(() => {
        suppressNextRegionClickRef.current = false
      }, 0)
    }

    setDragState(null)
  }

  const getSvgPoint = (clientX: number, clientY: number) => {
    const svg = mapRef.current
    const matrix = svg?.getScreenCTM()

    if (!svg || !matrix) {
      return null
    }

    const point = svg.createSVGPoint()
    point.x = clientX
    point.y = clientY

    return point.matrixTransform(matrix.inverse())
  }

  return (
    <section className={styles.mapWidget}>
      <div className={styles.mapContent}>
        <div className={styles.mapFrame}>
          <div className={styles.mapControls}>
            <button
              className={styles.mapControlButton}
              title="Уменьшить масштаб"
              type="button"
              onClick={() => zoomMap(1 / MAP_ZOOM_STEP)}
            >
              <MinusOutlined />
            </button>
            <button
              className={styles.mapControlButton}
              title="Увеличить масштаб"
              type="button"
              onClick={() => zoomMap(MAP_ZOOM_STEP)}
            >
              <PlusOutlined />
            </button>
            <button
              className={styles.mapControlButton}
              title="Вернуть масштаб"
              type="button"
              onClick={resetMap}
            >
              <ReloadOutlined />
            </button>
          </div>
          <svg
            ref={mapRef}
            className={`${styles.map} ${dragState ? styles.mapDragging : ''}`}
            preserveAspectRatio="xMidYMid slice"
            viewBox={formatViewBox(viewBox)}
            onPointerCancel={handlePointerUp}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <image
              className={styles.mapBase}
              height={MAP_IMAGE_VIEW_BOX.height}
              href="/assets-map/russia-map-gray.svg"
              width={MAP_IMAGE_VIEW_BOX.width}
              x={MAP_IMAGE_VIEW_BOX.x}
              y={MAP_IMAGE_VIEW_BOX.y}
            />
            <g>
              {ASSET_MAP_REGIONS.map((region) =>
                'path' in region ? (
                  <RegionOverlay
                    key={region.id}
                    detail={region.detail}
                    path={region.path}
                    shouldSuppressSelect={() => suppressNextRegionClickRef.current}
                    onDragStart={startMapDrag}
                    onPointerCancel={handlePointerUp}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onSelect={setDetail}
                  />
                ) : (
                  <RegionOverlay
                    key={region.id}
                    detail={region.detail}
                    sourceId={region.sourceId}
                    shouldSuppressSelect={() => suppressNextRegionClickRef.current}
                    onDragStart={startMapDrag}
                    onPointerCancel={handlePointerUp}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onSelect={setDetail}
                  />
                )
              )}
            </g>
            <g>
              {ASSET_MAP_MARKERS.map((marker) => (
                <Popover key={marker.id} content={marker.tooltip} placement="top" trigger="hover">
                  <g
                    className={styles.markerGroup}
                    onClick={(event) => {
                      event.stopPropagation()
                      setDetail(marker.detail)
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <circle
                      className={styles.marker}
                      cx={marker.point.x}
                      cy={marker.point.y}
                      r="9"
                    />
                  </g>
                </Popover>
              ))}
            </g>
          </svg>
        </div>
        <aside className={styles.detailPanel}>{detail}</aside>
      </div>
    </section>
  )
}

type RegionOverlayProps = {
  detail: string
  onDragStart: (event: PointerEvent<SVGElement>) => void
  onPointerCancel: (event: PointerEvent<SVGElement>) => void
  onPointerMove: (event: PointerEvent<SVGElement>) => void
  onPointerUp: (event: PointerEvent<SVGElement>) => void
  onSelect: (detail: string) => void
  shouldSuppressSelect: () => boolean
  path?: string
  sourceId?: string
}

function RegionOverlay({
  detail,
  onDragStart,
  onPointerCancel,
  onPointerMove,
  onPointerUp,
  onSelect,
  path,
  shouldSuppressSelect,
  sourceId
}: RegionOverlayProps) {
  const commonProps = {
    className: styles.regionOverlay,
    onClick: (event: MouseEvent<SVGElement>) => {
      event.stopPropagation()

      if (shouldSuppressSelect()) {
        return
      }

      onSelect(detail)
    },
    onPointerCancel,
    onPointerDown: onDragStart,
    onPointerMove,
    onPointerUp
  }

  if (path) {
    return <path {...commonProps} d={path} />
  }

  return sourceId ? (
    <use {...commonProps} href={`/assets-map/russia-map-gray.svg#${sourceId}`} />
  ) : null
}

function getRenderedMapScale(rect: DOMRect, viewBox: MapViewBox) {
  return Math.max(rect.width / viewBox.width, rect.height / viewBox.height)
}

function getViewBoxCenter(viewBox: MapViewBox): MapPoint {
  return {
    x: viewBox.x + viewBox.width / 2,
    y: viewBox.y + viewBox.height / 2
  }
}
