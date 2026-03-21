import axios from 'axios'
import { store } from '../store'
import { logout } from '../store/slices/authSlice'

const api = axios.create({
 baseURL: 'https://bharatbloodbank.onrender.com/api'||'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 → auto logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
