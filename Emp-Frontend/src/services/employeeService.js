import api from './api'

export const employeeService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/employees', { params })
    return data
  },
  getById: async (id) => {
    const { data } = await api.get(`/employees/${id}`)
    return data
  },
  getMe: async () => {
    const { data } = await api.get('/employees/me')
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/employees', payload)
    return data
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/employees/${id}`, payload)
    return data
  },
  remove: async (id) => {
    const { data } = await api.delete(`/employees/${id}`)
    return data
  },
}
