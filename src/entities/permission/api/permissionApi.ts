import { API_ROUTES, mainApi } from '@/shared/api'

import type { Permission } from '../model'

export const permissionApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getPermissions: build.query<Permission, void>({
      query: () => API_ROUTES.permissions
    })
  })
})

export const { useGetPermissionsQuery } = permissionApi
