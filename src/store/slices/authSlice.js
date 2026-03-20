import { createSlice } from '@reduxjs/toolkit'

const stored = localStorage.getItem('bbb_auth')
const initial = stored ? JSON.parse(stored) : { token: null, user: null }

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: initial.token, user: initial.user, loading: false },
  reducers: {
    setCredentials(state, { payload }) {
      state.token = payload.token
      state.user  = payload.user
      localStorage.setItem('bbb_auth', JSON.stringify({ token: payload.token, user: payload.user }))
    },
    logout(state) {
      state.token = null
      state.user  = null
      localStorage.removeItem('bbb_auth')
    },
    setLoading(state, { payload }) { state.loading = payload },
  },
})

export const { setCredentials, logout, setLoading } = authSlice.actions
export const selectAuth    = (s) => s.auth
export const selectUser    = (s) => s.auth.user
export const selectToken   = (s) => s.auth.token
export const selectRole    = (s) => s.auth.user?.role
export const isLoggedIn    = (s) => !!s.auth.token
export default authSlice.reducer
