import { Switch } from 'antd'

import { POINT_SCALE_PERCENT_STEP } from '../lib/axis-controls'
import type { ControlsPanelState } from '../model/overlay'
import styles from '../ModelOverlay.module.css'
import { AxisSliderControl } from './AxisSliderControl'
import { ColorControl } from './ColorControl'

type ControlsPanelProps = {
  state: ControlsPanelState
}

export function ControlsPanel({ state }: ControlsPanelProps) {
  const {
    autoRotate,
    axisBounds,
    axisInputs,
    axisSliderControls,
    color,
    colorInput,
    commitAxisInput,
    commitAxisInputOnEnter,
    commitColorInput,
    commitColorInputOnEnter,
    commitPointScaleInput,
    onResetModelView,
    onToggleControls,
    setAutoRotate,
    setAxisInputs,
    setColorInput,
    setShowRotationAxis,
    showControls,
    showRotationAxis,
    updateAxisCoordinate,
    updateAxisSliderDraft,
    updateColor,
    updatePointScale,
    updatePointScaleSliderDraft
  } = state
  const xMax = axisBounds?.maxX ?? 1
  const xMin = axisBounds?.minX ?? -1
  const pointScaleMax = (axisBounds?.maxPointScale ?? 2) * 100
  const pointScaleMin = (axisBounds?.minPointScale ?? 0.5) * 100
  const yMax = axisBounds?.maxY ?? 1
  const yMin = axisBounds?.minY ?? -1
  const zMax = axisBounds?.maxZ ?? 1
  const zMin = axisBounds?.minZ ?? -1

  return (
    <div className={styles.controlsStack}>
      {showControls ? (
        <div className={styles.controlsPanel}>
          <label className={styles.controlRow}>
            <span className={styles.controlLabel}>Автовращение</span>
            <Switch size="small" checked={autoRotate} onChange={setAutoRotate} />
          </label>
          <ColorControl
            color={color}
            colorInput={colorInput}
            onColorChange={updateColor}
            onColorInputBlur={commitColorInput}
            onColorInputChange={setColorInput}
            onColorInputKeyDown={commitColorInputOnEnter}
          />
          <label className={styles.controlRow}>
            <span className={styles.controlLabel}>Ось и точка</span>
            <Switch size="small" checked={showRotationAxis} onChange={setShowRotationAxis} />
          </label>
          {showRotationAxis ? (
            <>
              <AxisSliderControl
                disabled={!axisBounds}
                inputValue={axisInputs.pointScale}
                label="Размер точки"
                max={pointScaleMax}
                min={pointScaleMin}
                step={POINT_SCALE_PERCENT_STEP}
                value={axisSliderControls.pointScale * 100}
                onBlur={commitPointScaleInput}
                onChange={updatePointScaleSliderDraft}
                onChangeComplete={updatePointScale}
                onInputChange={(value) =>
                  setAxisInputs((inputs) => ({ ...inputs, pointScale: value }))
                }
                onKeyDown={commitAxisInputOnEnter}
              />
              <AxisSliderControl
                disabled={!axisBounds}
                inputValue={axisInputs.x}
                label="X"
                max={xMax}
                min={xMin}
                step={0.01}
                value={axisSliderControls.x}
                onBlur={() => commitAxisInput('x')}
                onChange={(value) => updateAxisSliderDraft('x', value)}
                onChangeComplete={(value) => updateAxisCoordinate('x', value)}
                onInputChange={(value) => setAxisInputs((inputs) => ({ ...inputs, x: value }))}
                onKeyDown={commitAxisInputOnEnter}
              />
              <AxisSliderControl
                disabled={!axisBounds}
                inputValue={axisInputs.y}
                label="Y"
                max={yMax}
                min={yMin}
                step={0.01}
                value={axisSliderControls.y}
                onBlur={() => commitAxisInput('y')}
                onChange={(value) => updateAxisSliderDraft('y', value)}
                onChangeComplete={(value) => updateAxisCoordinate('y', value)}
                onInputChange={(value) => setAxisInputs((inputs) => ({ ...inputs, y: value }))}
                onKeyDown={commitAxisInputOnEnter}
              />
              <AxisSliderControl
                disabled={!axisBounds}
                inputValue={axisInputs.z}
                label="Z"
                max={zMax}
                min={zMin}
                step={0.01}
                value={axisSliderControls.z}
                onBlur={() => commitAxisInput('z')}
                onChange={(value) => updateAxisSliderDraft('z', value)}
                onChangeComplete={(value) => updateAxisCoordinate('z', value)}
                onInputChange={(value) => setAxisInputs((inputs) => ({ ...inputs, z: value }))}
                onKeyDown={commitAxisInputOnEnter}
              />
              <div className={styles.controlRow}>
                <button className={styles.defaultButton} type="button" onClick={onResetModelView}>
                  По умолчанию
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
      <button className={styles.controlsToggleButton} type="button" onClick={onToggleControls}>
        {showControls ? 'Скрыть настройки' : 'Показать настройки'}
      </button>
    </div>
  )
}
