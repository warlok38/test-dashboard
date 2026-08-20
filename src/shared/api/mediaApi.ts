import { MEDIA_API_BASE_URL } from './config'
import { createAppApi } from './lib'

export const mediaApi = createAppApi({
  reducerPath: 'mediaApi',
  baseUrl: MEDIA_API_BASE_URL
})
