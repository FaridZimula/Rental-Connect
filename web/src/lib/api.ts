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
      window.location.href = '/hostel-owner/login';
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
    role: 'buyer' | 'owner';
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

// ── Leads ─────────────────────────────────────────────────────────────────────

export const leadsApi = {
  create: (propertyId: string, message?: string) =>
    api.post('/leads', { property_id: propertyId, buyer_message: message }).then((r) => r.data),

  unlock: (leadId: string) => api.post(`/leads/${leadId}/unlock`).then((r) => r.data),

  get: (leadId: string) => api.get(`/leads/${leadId}`).then((r) => r.data),

  myLeads: () => api.get('/leads/buyer/my').then((r) => r.data),

  ownerLeads: () => api.get('/leads/owner/incoming').then((r) => r.data),
};

// ── Credits & Payments ────────────────────────────────────────────────────────

export const creditsApi = {
  balance: () => api.get('/credits/balance').then((r) => r.data),
  transactions: () => api.get('/credits/transactions').then((r) => r.data),
};

export const paymentsApi = {
  initiateCreditPurchase: (bundle: '5' | '10' | '20') =>
    api.post('/payments/credits/initiate', { bundle }).then((r) => r.data),

  initiateFeature: (propertyId: string, tier: '7day' | '30day') =>
    api.post('/payments/feature/initiate', { property_id: propertyId, tier }).then((r) => r.data),
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
  analytics: () => api.get('/admin/analytics').then((r) => r.data),
  users: (page = 1) => api.get('/admin/users', { params: { page } }).then((r) => r.data),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};
