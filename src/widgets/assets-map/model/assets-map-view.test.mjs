import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DEFAULT_MAP_VIEW_BOX,
  DEFAULT_MAP_ZOOM,
  MAP_IMAGE_VIEW_BOX,
  MAP_ZOOM_STEP,
  formatViewBox,
  getMapViewBoxForZoom,
  panMapViewBox,
  zoomMapViewBox
} from './assets-map-view.ts'

describe('assets map view settings', () => {
  it('uses the maximum zoomed out state as the initial map viewport', () => {
    assert.equal(formatViewBox(MAP_IMAGE_VIEW_BOX), '0 0 1650 1000')
    assert.equal(formatViewBox(DEFAULT_MAP_VIEW_BOX), '0 0 1650 1000')
    assert.equal(formatViewBox(getMapViewBoxForZoom(DEFAULT_MAP_ZOOM)), '0 0 1650 1000')
  })

  it('zooms around an anchor point', () => {
    const nextViewBox = zoomMapViewBox(DEFAULT_MAP_VIEW_BOX, MAP_ZOOM_STEP, {
      x: 1092.5,
      y: 555
    })

    assert.equal(nextViewBox.width < DEFAULT_MAP_VIEW_BOX.width, true)
    assert.equal(nextViewBox.height < DEFAULT_MAP_VIEW_BOX.height, true)
    assert.equal(nextViewBox.x > DEFAULT_MAP_VIEW_BOX.x, true)
    assert.equal(nextViewBox.y > DEFAULT_MAP_VIEW_BOX.y, true)
  })

  it('zooms out until the full source map width is visible', () => {
    let nextViewBox = DEFAULT_MAP_VIEW_BOX

    for (let step = 0; step < 20; step += 1) {
      nextViewBox = zoomMapViewBox(nextViewBox, 1 / MAP_ZOOM_STEP, {
        x: 1092.5,
        y: 555
      })
    }

    assert.equal(nextViewBox.width, MAP_IMAGE_VIEW_BOX.width)
    assert.equal(nextViewBox.height, MAP_IMAGE_VIEW_BOX.height)
    assert.equal(nextViewBox.x, MAP_IMAGE_VIEW_BOX.x)
    assert.equal(nextViewBox.y, MAP_IMAGE_VIEW_BOX.y)
  })

  it('keeps panning inside the source map bounds', () => {
    const nextViewBox = panMapViewBox(DEFAULT_MAP_VIEW_BOX, {
      x: -2000,
      y: -2000
    })

    assert.equal(nextViewBox.x + nextViewBox.width <= MAP_IMAGE_VIEW_BOX.width, true)
    assert.equal(nextViewBox.y + nextViewBox.height <= MAP_IMAGE_VIEW_BOX.height, true)
  })
})
