import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { getPeriodByShift, shiftProductionDate } from '../lib'

type PeriodScopePayload = {
  shift: number
  productionDate: string
}

type ShiftPeriodScopePayload = {
  direction: -1 | 1
  productionDate: string
  shift: number
}

type PeriodFilterState = {
  shift: number | null
  productionDate: string | null
  committedProductionDate: string | null
  isDirty: boolean
}

const initialState: PeriodFilterState = {
  shift: null,
  productionDate: null,
  committedProductionDate: null,
  isDirty: false
}

const periodFilterSlice = createSlice({
  name: 'periodFilter',
  initialState,
  reducers: {
    resetPeriodScope: (state, action: PayloadAction<PeriodScopePayload>) => {
      state.shift = action.payload.shift
      state.productionDate = action.payload.productionDate
      state.committedProductionDate = action.payload.productionDate
      state.isDirty = false
    },
    setPeriodProductionDate: (state, action: PayloadAction<PeriodScopePayload>) => {
      state.shift = action.payload.shift
      state.productionDate = action.payload.productionDate
      state.isDirty = true
    },
    shiftPeriodProductionDate: (state, action: PayloadAction<ShiftPeriodScopePayload>) => {
      if (state.shift !== action.payload.shift && state.shift !== null) {
        return
      }

      const productionDate = state.productionDate ?? action.payload.productionDate
      state.shift = action.payload.shift
      state.productionDate = shiftProductionDate(
        getPeriodByShift(action.payload.shift),
        productionDate,
        action.payload.direction
      )
      state.isDirty = true
    },
    commitPeriodProductionDate: (state, action: PayloadAction<PeriodScopePayload>) => {
      if (state.shift !== action.payload.shift) {
        return
      }

      state.committedProductionDate = action.payload.productionDate
    },
    applyBackendProductionDate: (state, action: PayloadAction<PeriodScopePayload>) => {
      if (state.shift !== action.payload.shift || state.isDirty) {
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
