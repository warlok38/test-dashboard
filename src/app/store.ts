import { configureStore } from '@reduxjs/toolkit'

import { periodFilterReducer } from '@/features/period-filter'
import { authApi, authReducer } from '@/shared/auth'
import { mainApi, mediaApi } from '@/shared/api'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    periodFilter: periodFilterReducer,
    [authApi.reducerPath]: authApi.reducer,
    [mainApi.reducerPath]: mainApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, mainApi.middleware, mediaApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
