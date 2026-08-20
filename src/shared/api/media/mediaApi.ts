import { MEDIA_API_BASE_URL } from '../config'
import { createAppApi } from '../lib'
import { MEDIA_API_TAG_TYPES } from './tagTypes'

export const mediaApi = createAppApi({
  reducerPath: 'mediaApi',
  baseUrl: MEDIA_API_BASE_URL,
  tagTypes: MEDIA_API_TAG_TYPES
})
