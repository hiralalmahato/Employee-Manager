import api from './api'

export const departmentService = {
  getAll: async () => {
    const { data } = await api.get('/departments')
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/departments', payload)
    return data
  },
}
