import api from './api'

export const payrollService = {
  getAll: async () => {
    const { data } = await api.get('/payroll')
    return data
  },
  generate: async (payload) => {
    const { data } = await api.post('/payroll', payload)
    return data
  },
}
