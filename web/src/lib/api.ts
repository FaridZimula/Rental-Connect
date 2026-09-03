import axios from 'axios';
import { auth } from './firebase';

// In production (Vercel), if VITE_API_URL is not set or still points to localhost,
// we skip backend calls entirely — Supabase is the primary data source.
const rawApiUrl = import.meta.env.VITE_API_URL || '';
const isLocalhost = rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1');
const isProduction = import.meta.env.PROD;

// Use the configured URL; if it's localhost in prod, leave blank so requests fail fast
export const API_BASE = rawApiUrl && !(isProduction && isLocalhost)
  ? rawApiUrl
  : isProduction
    ? '' // No backend configured — all adminApi/propertiesApi calls will fail gracefully via Promise.allSettled
    : 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 8000, // 8s timeout so failed backend calls don't hang the admin dashboard
});

// Attach fresh Firebase ID token on every request
api.interceptors.request.use(async (config) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Firebase token refresh failed (offline, expired, etc.) — proceed without auth header
    console.warn('Could not attach Firebase auth token:', e);
  }
  return config;
});

// On response error log or pass through
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Avoid hard reloading the browser window on 401 to preserve offline/resilient auth session
    return Promise.reject(err);
  },
);

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  /** Sync Firebase user with Postgres backend (called after Firebase login/register) */
  sync: (data: { full_name?: string; phone?: string; role?: string }) =>
    api.post('/auth/sync', data).then((r) => r.data),

  /** Get current user profile */
  me: () => api.get('/auth/me').then((r) => r.data),

  /** Update profile (name, phone) */
  updateProfile: (data: { full_name?: string; phone?: string }) =>
    api.patch('/auth/profile', data).then((r) => r.data),
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
