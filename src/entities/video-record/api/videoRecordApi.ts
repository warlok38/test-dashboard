import { mediaApi } from '@/shared/api'

import type {
  VideoRecord,
  VideoRecordListParams,
  VideoRecordStreamParams,
  VideoRecordStreamResponse
} from '../model/types'
import { VIDEO_RECORD_API_ROUTES } from './routes'
import { VIDEO_RECORD_API_TAGS, VIDEO_RECORD_API_TAG_TYPES } from './tagTypes'

const videoRecordApiWithTags = mediaApi.enhanceEndpoints({
  addTagTypes: VIDEO_RECORD_API_TAG_TYPES
})

export const videoRecordApi = videoRecordApiWithTags.injectEndpoints({
  endpoints: (build) => ({
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
    })
  })
})

export const { useGetVideoRecordStreamQuery, useGetVideoRecordsQuery } = videoRecordApi
