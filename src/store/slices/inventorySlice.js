import { createSlice } from '@reduxjs/toolkit'

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: { allBanks: [], lastFetched: null },
  reducers: {
    setAllBanks(state, { payload }) {
      state.allBanks   = payload
      state.lastFetched = Date.now()
    },
  },
})

export const { setAllBanks } = inventorySlice.actions
export const selectAllBanks = (s) => s.inventory.allBanks
export default inventorySlice.reducer
