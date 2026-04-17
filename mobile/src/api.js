import axios from 'axios'
import { getToken } from './auth'

const BACKEND_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://bienestarapp-backend.onrender.com').replace(/\/api$/, '')
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`
})

// Add token to every request automatically
api.interceptors.request.use(
  async (config) => {
    const token = await getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
