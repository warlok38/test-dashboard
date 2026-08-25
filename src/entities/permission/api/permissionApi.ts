import { mainApi } from '@/shared/api'

import type { Permission } from '../model'
import { PERMISSION_API_ROUTES } from './consts'

export const permissionApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getPermissions: build.query<Permission, void>({
      query: () => PERMISSION_API_ROUTES.permissions
    })
  })
})

export const { useGetPermissionsQuery } = permissionApi
