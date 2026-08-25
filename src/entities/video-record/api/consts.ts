export const VIDEO_RECORD_API_ROUTES = {
  cameras: '/cameras/list',
  keep: '/watch/keep',
  list: '/records/list',
  stop: '/watch/stop',
  stream: '/watch'
} as const

export const VIDEO_RECORD_API_TAGS = {
  cameras: 'VideoCameras',
  records: 'VideoRecords',
  stream: 'VideoRecordStream'
} as const

export const VIDEO_RECORD_API_TAG_TYPES = Object.values(VIDEO_RECORD_API_TAGS)
