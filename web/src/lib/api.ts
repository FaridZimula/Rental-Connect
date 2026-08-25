import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rc_token');
      localStorage.removeItem('rc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'tenant' | 'landlord';
  }) => api.post('/auth/register', data).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  me: () => api.get('/auth/me').then((r) => r.data),
};

// ── Properties ────────────────────────────────────────────────────────────────

export const propertiesApi = {
  list: (params?: Record<string, any>) =>
    api.get('/properties', { params }).then((r) => r.data),

  get: (id: string) => api.get(`/properties/${id}`).then((r) => r.data),

  create: (data: Record<string, any>) =>
    api.post('/properties', data).then((r) => r.data),

  update: (id: string, data: Record<string, any>) =>
    api.patch(`/properties/${id}`, data).then((r) => r.data),

  toggleAvailability: (id: string) =>
    api.patch(`/properties/${id}/availability`).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/properties/${id}`).then((r) => r.data),

  myProperties: () => api.get('/properties/owner/my').then((r) => r.data),

  uploadImage: (propertyId: string, file: File, isPrimary = false) => {
    const form = new FormData();
    form.append('image', file);
    return api
      .post(`/properties/${propertyId}/images?primary=${isPrimary}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};

// ── Inquiries ─────────────────────────────────────────────────────────────────

export const inquiriesApi = {
  create: (data: { property_id: string; message: string; viewing_date?: string }) =>
    api.post('/inquiries', data).then((r) => r.data),

  myInquiries: () => api.get('/inquiries/my-inquiries').then((r) => r.data),

  landlordInquiries: () => api.get('/inquiries/landlord-inquiries').then((r) => r.data),

  respond: (id: string, response: string) =>
    api.patch(`/inquiries/${id}/respond`, { response }).then((r) => r.data),
};

// ── Reports / Flags ───────────────────────────────────────────────────────────

export const reportsApi = {
  create: (data: { property_id: string; reason: string; details?: string }) =>
    api.post('/reports', data).then((r) => r.data),

  myReports: () => api.get('/reports/my-reports').then((r) => r.data),

  adminAll: (status?: string) =>
    api.get('/reports/admin/all', { params: { status } }).then((r) => r.data),

  resolve: (id: string, status: string, admin_notes?: string) =>
    api.patch(`/reports/${id}/resolve`, { status, admin_notes }).then((r) => r.data),
};

// ── Favorites ─────────────────────────────────────────────────────────────────

export const favoritesApi = {
  list: () => api.get('/favorites').then((r) => r.data),
  add: (propertyId: string) => api.post(`/favorites/${propertyId}`).then((r) => r.data),
  remove: (propertyId: string) => api.delete(`/favorites/${propertyId}`).then((r) => r.data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  pending: () => api.get('/admin/properties/pending').then((r) => r.data),
  approve: (id: string) => api.post(`/admin/properties/${id}/approve`).then((r) => r.data),
  reject: (id: string, reason: string) =>
    api.post(`/admin/properties/${id}/reject`, { reason }).then((r) => r.data),
  suspend: (id: string, reason: string) =>
    api.post(`/admin/properties/${id}/suspend`, { reason }).then((r) => r.data),
  toggleUserActive: (id: string) =>
    api.patch(`/admin/users/${id}/toggle-active`).then((r) => r.data),
  analytics: () => api.get('/admin/analytics').then((r) => r.data),
  users: (page = 1) => api.get('/admin/users', { params: { page } }).then((r) => r.data),
  auditLogs: (page = 1) => api.get('/admin/audit-logs', { params: { page } }).then((r) => r.data),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};
