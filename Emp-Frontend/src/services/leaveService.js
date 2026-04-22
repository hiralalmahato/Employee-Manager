import api from './api'

export const leaveService = {
  apply: async (payload) => {
    const { data } = await api.post('/leaves', payload)
    return data
  },
  getAll: async () => {
    const { data } = await api.get('/leaves')
    return data
  },
  getMine: async () => {
    const { data } = await api.get('/leaves/me')
    return data
  },
  approve: async (id, payload) => {
    const { data } = await api.patch(`/leaves/${id}/approve`, payload)
    return data
  },
  reject: async (id, payload) => {
    const { data } = await api.patch(`/leaves/${id}/reject`, payload)
    return data
  },
}
