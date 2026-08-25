'use client'

import { type KeyboardEvent } from 'react'
import { Slider } from 'antd'

import styles from '../ModelOverlay.module.css'

type AxisSliderControlProps = {
  disabled?: boolean
  inputValue: string
  label: string
  max: number
  min: number
  onBlur: () => void
  onChange: (value: number) => void
  onChangeComplete: (value: number) => void
  onInputChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  step: number
  value: number
}

const SLIDER_TOOLTIP = { formatter: null }

export function AxisSliderControl({
  disabled,
  inputValue,
  label,
  max,
  min,
  onBlur,
  onChange,
  onChangeComplete,
  onInputChange,
  onKeyDown,
  step,
  value
}: AxisSliderControlProps) {
  return (
    <div className={styles.sliderControlRow}>
      <span className={styles.controlLabel}>{label}</span>
      <div className={styles.sliderControl}>
        <Slider
          className={styles.axisSlider}
          disabled={disabled}
          max={max}
          min={min}
          step={step}
          tooltip={SLIDER_TOOLTIP}
          value={value}
          onChange={(nextValue) => {
            if (typeof nextValue === 'number') {
              onChange(nextValue)
            }
          }}
          onChangeComplete={(nextValue) => {
            if (typeof nextValue === 'number') {
              onChangeComplete(nextValue)
            }
          }}
        />
        <input
          className={styles.axisInput}
          disabled={disabled}
          spellCheck={false}
          value={inputValue}
          onBlur={onBlur}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  )
}
