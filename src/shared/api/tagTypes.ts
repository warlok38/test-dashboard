export const API_TAGS = {
  gtk: 'Gtk',
  summary: 'Summary',
  graph: 'Graph'
} as const

export const API_TAG_TYPES = Object.values(API_TAGS)

export type ApiTagType = (typeof API_TAG_TYPES)[number]
