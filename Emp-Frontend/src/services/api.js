import axios from 'axios'

const localBaseURL = 'http://localhost:8080/api'
const productionBaseURL = 'https://employee-manager-our6.onrender.com/api'

const resolveBaseURL = (value) => {
  if (!value) {
    return null
  }

  const normalized = value.replace(/\/$/, '')

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
}

const baseURL =
  resolveBaseURL(import.meta.env.VITE_API_URL) ||
  resolveBaseURL(import.meta.env.VITE_API_BASE_URL) ||
  (import.meta.env.DEV ? localBaseURL : productionBaseURL)

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
