import axios from 'axios'

const localBaseURL = 'http://localhost:8080/api'
const productionBaseURL = 'https://employee-manager-our6.onrender.com/api'

const baseURL = (
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? localBaseURL : productionBaseURL)
).replace(/\/$/, '')

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
