import api from './api'

export const authService = {
  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload)
    return data
  },
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    return data
  },
}
