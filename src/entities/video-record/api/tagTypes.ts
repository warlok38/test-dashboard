export const VIDEO_RECORD_API_TAGS = {
  cameras: 'VideoCameras',
  records: 'VideoRecords',
  stream: 'VideoRecordStream'
} as const

export const VIDEO_RECORD_API_TAG_TYPES = Object.values(VIDEO_RECORD_API_TAGS)
