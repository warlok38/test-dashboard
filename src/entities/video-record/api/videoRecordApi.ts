import { MEDIA_API_TAGS, mediaApi } from '@/shared/api'

import type {
  VideoRecord,
  VideoRecordListParams,
  VideoRecordStreamParams,
  VideoRecordStreamResponse
} from '../model/types'
import { VIDEO_RECORD_API_ROUTES } from './routes'

export const videoRecordApi = mediaApi.injectEndpoints({
  endpoints: (build) => ({
    getVideoRecords: build.query<VideoRecord[], VideoRecordListParams>({
      query: (params) => ({
        url: VIDEO_RECORD_API_ROUTES.list,
        params
      }),
      providesTags: [MEDIA_API_TAGS.videoRecords]
    }),
    getVideoRecordStream: build.query<VideoRecordStreamResponse, VideoRecordStreamParams>({
      query: ({ objectGuid, siteSlug, stream }) => ({
        url: `${VIDEO_RECORD_API_ROUTES.stream}/${siteSlug}/${objectGuid}/${stream}`
      }),
      providesTags: [MEDIA_API_TAGS.videoRecordStream]
    })
  })
})

export const { useGetVideoRecordStreamQuery, useGetVideoRecordsQuery } = videoRecordApi
