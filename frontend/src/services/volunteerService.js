import api from './api.js'

export const volunteerService = {
  getProfile: () => api.get('/volunteer/profile'),
  updateProfile: (payload) => api.put('/volunteer/profile', payload),
  uploadIdProof: (payload) => api.post('/volunteer/upload-id', payload),
  getEvents: (params) => api.get('/volunteer/events', { params }),
  getMyEvents: () => api.get('/volunteer/my-events'),
  applyForEvent: (eventId) => api.post(`/volunteer/events/${eventId}/apply`),
  withdrawFromEvent: (eventId) => api.delete(`/volunteer/events/${eventId}/withdraw`),
}

export default volunteerService
