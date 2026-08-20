export const MEDIA_API_TAGS = {
  videoRecords: 'VideoRecords',
  videoRecordStream: 'VideoRecordStream'
} as const

export const MEDIA_API_TAG_TYPES = Object.values(MEDIA_API_TAGS)

export type MediaApiTagType = (typeof MEDIA_API_TAG_TYPES)[number]
