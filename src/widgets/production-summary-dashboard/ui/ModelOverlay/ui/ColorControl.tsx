'use client'

import { type KeyboardEvent } from 'react'
import { ColorPicker } from 'antd'

import styles from '../ModelOverlay.module.css'

type ColorControlProps = {
  color: string
  colorInput: string
  onColorChange: (color: string) => void
  onColorInputBlur: () => void
  onColorInputChange: (value: string) => void
  onColorInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
}

export function ColorControl({
  color,
  colorInput,
  onColorChange,
  onColorInputBlur,
  onColorInputChange,
  onColorInputKeyDown
}: ColorControlProps) {
  return (
    <div className={styles.controlRow}>
      <span className={styles.controlLabel}>Цвет модели</span>
      <div className={styles.colorValue}>
        <input
          className={styles.colorInput}
          maxLength={7}
          spellCheck={false}
          value={colorInput}
          onBlur={onColorInputBlur}
          onChange={(event) => onColorInputChange(event.target.value)}
          onKeyDown={onColorInputKeyDown}
        />
        <ColorPicker
          disabledAlpha
          format="hex"
          value={color}
          onChange={(value) => onColorChange(value.toHexString())}
        >
          <button className={styles.colorButton} type="button">
            <span className={styles.colorSwatch} style={{ backgroundColor: color }} />
          </button>
        </ColorPicker>
      </div>
    </div>
  )
}
