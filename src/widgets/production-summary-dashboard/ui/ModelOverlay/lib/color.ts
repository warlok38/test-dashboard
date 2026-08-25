export const DEFAULT_MODEL_COLOR = '#7C786E'

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

export function normalizeHexColor(value: string) {
  const trimmedValue = value.trim()
  const hexValue = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`

  return HEX_COLOR_PATTERN.test(hexValue) ? hexValue.toUpperCase() : null
}
