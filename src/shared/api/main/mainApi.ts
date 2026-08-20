import { createAppApi } from '../lib'
import { API_TAG_TYPES } from './tagTypes'

export const mainApi = createAppApi({
  reducerPath: 'mainApi',
  tagTypes: API_TAG_TYPES
})
