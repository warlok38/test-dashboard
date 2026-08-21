export type VideoRecord = {
  id: string
  name: string
  record_date: string
  code: string
  is_active: boolean
  site: string
  storage: {
    id: string
    name: string
    type: string
  }
  media_server: {
    id: number
    name: string
    slug: string
  }
}

export type VideoCamera = {
  id: string
  name: string
  code: string
  is_active: boolean
  site: string
  media_server: {
    id: number
    name: string
    slug: string
  }
}

export type VideoRecordListParams = {
  site_slug: string
}

export type VideoCameraListParams = {
  site_slug: string
}

export type VideoRecordStreamType = 'live' | 'preview'

export type VideoRecordStreamParams = {
  objectGuid: string
  siteSlug: string
  stream: VideoRecordStreamType
}

export type VideoRecordStreamResponse = {
  stream_url: string
  keep_alive_url: string
  stop_url: string
  keep_alive_seconds: number
}

export type VideoWatchSessionParams = {
  session: string
}
