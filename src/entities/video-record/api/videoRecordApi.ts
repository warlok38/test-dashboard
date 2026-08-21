import { mediaApi } from '@/shared/api'

import type {
  VideoCamera,
  VideoCameraListParams,
  VideoRecord,
  VideoRecordListParams,
  VideoRecordStreamParams,
  VideoRecordStreamResponse,
  VideoWatchSessionParams
} from '../model/types'
import { VIDEO_RECORD_API_ROUTES } from './routes'
import { VIDEO_RECORD_API_TAGS, VIDEO_RECORD_API_TAG_TYPES } from './tagTypes'

const videoRecordApiWithTags = mediaApi.enhanceEndpoints({
  addTagTypes: VIDEO_RECORD_API_TAG_TYPES
})

export const videoRecordApi = videoRecordApiWithTags.injectEndpoints({
  endpoints: (build) => ({
    getVideoCameras: build.query<VideoCamera[], VideoCameraListParams>({
      query: (params) => ({
        url: VIDEO_RECORD_API_ROUTES.cameras,
        params
      }),
      providesTags: [VIDEO_RECORD_API_TAGS.cameras]
    }),
    getVideoRecords: build.query<VideoRecord[], VideoRecordListParams>({
      query: (params) => ({
        url: VIDEO_RECORD_API_ROUTES.list,
        params
      }),
      providesTags: [VIDEO_RECORD_API_TAGS.records]
    }),
    getVideoRecordStream: build.query<VideoRecordStreamResponse, VideoRecordStreamParams>({
      query: ({ objectGuid, siteSlug, stream }) => ({
        url: `${VIDEO_RECORD_API_ROUTES.stream}/${siteSlug}/${objectGuid}/${stream}`
      }),
      providesTags: [VIDEO_RECORD_API_TAGS.stream]
    }),
    keepVideoWatchSession: build.mutation<void, VideoWatchSessionParams>({
      query: (params) => ({
        url: VIDEO_RECORD_API_ROUTES.keep,
        params
      })
    }),
    stopVideoWatchSession: build.mutation<void, VideoWatchSessionParams>({
      query: (params) => ({
        url: VIDEO_RECORD_API_ROUTES.stop,
        params
      })
    })
  })
})

export const {
  useGetVideoCamerasQuery,
  useGetVideoRecordStreamQuery,
  useGetVideoRecordsQuery,
  useKeepVideoWatchSessionMutation,
  useStopVideoWatchSessionMutation
} = videoRecordApi
