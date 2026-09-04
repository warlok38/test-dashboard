import { Switch } from 'antd'

import type { ControlsPanelState } from '../model/overlay'
import styles from '../ModelOverlay.module.css'
import { ColorControl } from './ColorControl'

type ControlsPanelProps = {
  state: ControlsPanelState
}

export function ControlsPanel({ state }: ControlsPanelProps) {
  const {
    autoRotate,
    color,
    colorInput,
    commitColorInput,
    commitColorInputOnEnter,
    onResetModelView,
    onToggleControls,
    setAutoRotate,
    setColorInput,
    setShowRotationAxis,
    showControls,
    showRotationAxis,
    updateColor
  } = state

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
            <div className={styles.controlRow}>
              <button className={styles.defaultButton} type="button" onClick={onResetModelView}>
                По умолчанию
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <button className={styles.controlsToggleButton} type="button" onClick={onToggleControls}>
        {showControls ? 'Скрыть настройки' : 'Показать настройки'}
      </button>
    </div>
  )
}
