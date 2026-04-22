import api from './api'

export const attendanceService = {
  mark: async (payload) => {
    const { data } = await api.post('/attendance', payload)
    return data
  },
  getByEmployee: async (employeeId) => {
    const { data } = await api.get(`/attendance/employee/${employeeId}`)
    return data
  },
  getByDate: async (date) => {
    const { data } = await api.get('/attendance', { params: { date } })
    return data
  },
}
