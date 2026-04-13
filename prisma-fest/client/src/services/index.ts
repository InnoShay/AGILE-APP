import api from './api';

export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),

  register: (data: { name: string; email: string; password: string; confirmPassword: string; studentId?: string; acceptTerms: boolean }) =>
    api.post('/auth/register', data).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  refreshToken: () =>
    api.post('/auth/refresh-token').then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    api.post(`/auth/reset-password/${token}`, { password, confirmPassword }).then((r) => r.data),
};

export const userService = {
  getMe: () => api.get('/users/me').then((r) => r.data),
  updateMe: (data: any) => api.put('/users/me', data).then((r) => r.data),
  deleteMe: () => api.delete('/users/me').then((r) => r.data),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post('/users/me/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  changePassword: (data: any) => api.put('/users/me/password', data).then((r) => r.data),
  listUsers: (params?: any) => api.get('/users', { params }).then((r) => r.data),
  updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }).then((r) => r.data),
  toggleBan: (id: string) => api.patch(`/users/${id}/ban`).then((r) => r.data),
};

export const eventService = {
  list: (params?: any) => api.get('/events', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/events/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/events', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/events/${id}`).then((r) => r.data),
  cancel: (id: string) => api.patch(`/events/${id}/cancel`).then((r) => r.data),
  getRegistrations: (id: string) => api.get(`/events/${id}/registrations`).then((r) => r.data),
};

export const registrationService = {
  create: (data: { eventId: string; ticketType?: string }) =>
    api.post('/registrations', data).then((r) => r.data),
  getMine: () => api.get('/registrations/mine').then((r) => r.data),
  get: (id: string) => api.get(`/registrations/${id}`).then((r) => r.data),
  checkin: (id: string, qrToken: string) =>
    api.patch(`/registrations/${id}/checkin`, { qrToken }).then((r) => r.data),
};

export const notificationService = {
  getMine: () => api.get('/notifications/mine').then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
};

export const scheduleService = {
  get: () => api.get('/schedule').then((r) => r.data),
  create: (data: any) => api.post('/schedule', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/schedule/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/schedule/${id}`).then((r) => r.data),
};

export const feedbackService = {
  create: (data: { eventId: string; rating: number; comment?: string }) =>
    api.post('/feedback', data).then((r) => r.data),
  getForEvent: (eventId: string) => api.get(`/feedback/event/${eventId}`).then((r) => r.data),
};

export const announcementService = {
  list: () => api.get('/announcements').then((r) => r.data),
  create: (data: any) => api.post('/announcements', data).then((r) => r.data),
  delete: (id: string) => api.delete(`/announcements/${id}`).then((r) => r.data),
};

export const sponsorService = {
  list: () => api.get('/sponsors').then((r) => r.data),
  create: (data: any) => api.post('/sponsors', data).then((r) => r.data),
  delete: (id: string) => api.delete(`/sponsors/${id}`).then((r) => r.data),
};

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview').then((r) => r.data),
  getEventAnalytics: (id: string) => api.get(`/analytics/events/${id}`).then((r) => r.data),
};
