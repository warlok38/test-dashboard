import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { getPeriodByKey, type PeriodKey, shiftProductionDate } from '../lib'

type PeriodScopePayload = {
  periodKey: PeriodKey
  productionDate: string
}

type ShiftPeriodScopePayload = {
  direction: -1 | 1
  productionDate: string
  periodKey: PeriodKey
}

type PeriodFilterState = {
  periodKey: PeriodKey | null
  productionDate: string | null
  committedProductionDate: string | null
  isDirty: boolean
}

const initialState: PeriodFilterState = {
  periodKey: null,
  productionDate: null,
  committedProductionDate: null,
  isDirty: false
}

const periodFilterSlice = createSlice({
  name: 'periodFilter',
  initialState,
  reducers: {
    resetPeriodScope: (state, action: PayloadAction<PeriodScopePayload>) => {
      state.periodKey = action.payload.periodKey
      state.productionDate = action.payload.productionDate
      state.committedProductionDate = action.payload.productionDate
      state.isDirty = false
    },
    setPeriodProductionDate: (state, action: PayloadAction<PeriodScopePayload>) => {
      state.periodKey = action.payload.periodKey
      state.productionDate = action.payload.productionDate
      state.isDirty = true
    },
    shiftPeriodProductionDate: (state, action: PayloadAction<ShiftPeriodScopePayload>) => {
      if (state.periodKey !== action.payload.periodKey && state.periodKey !== null) {
        return
      }

      const productionDate = state.productionDate ?? action.payload.productionDate
      state.periodKey = action.payload.periodKey
      state.productionDate = shiftProductionDate(
        getPeriodByKey(action.payload.periodKey),
        productionDate,
        action.payload.direction
      )
      state.isDirty = true
    },
    commitPeriodProductionDate: (state, action: PayloadAction<PeriodScopePayload>) => {
      if (state.periodKey !== action.payload.periodKey) {
        return
      }

      state.committedProductionDate = action.payload.productionDate
    },
    applyBackendProductionDate: (state, action: PayloadAction<PeriodScopePayload>) => {
      if (state.periodKey !== action.payload.periodKey || state.isDirty) {
        return
      }

      state.productionDate = action.payload.productionDate
      state.committedProductionDate = action.payload.productionDate
    }
  }
})

export const {
  applyBackendProductionDate,
  commitPeriodProductionDate,
  resetPeriodScope,
  shiftPeriodProductionDate,
  setPeriodProductionDate
} = periodFilterSlice.actions
export const periodFilterReducer = periodFilterSlice.reducer
