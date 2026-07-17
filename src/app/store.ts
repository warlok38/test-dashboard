import { configureStore } from '@reduxjs/toolkit'

import { periodFilterReducer } from '@/features/period-filter'
import { authApi, authReducer } from '@/shared/auth'
import { mainApi } from '@/shared/api'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    periodFilter: periodFilterReducer,
    [authApi.reducerPath]: authApi.reducer,
    [mainApi.reducerPath]: mainApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, mainApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
