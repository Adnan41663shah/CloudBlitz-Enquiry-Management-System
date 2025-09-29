import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Enquiry API
export const enquiryAPI = {
  create: (data: { customerName: string; email: string; phone: string; message: string }) =>
    api.post('/enquiries', data),
  getAll: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/enquiries', { params }),
  getById: (id: string) => api.get(`/enquiries/${id}`),
  update: (id: string, data: { status?: string; assignedTo?: string }) =>
    api.put(`/enquiries/${id}`, data),
  delete: (id: string) => api.delete(`/enquiries/${id}`),
  assign: (id: string, data: { assignedTo: string }) =>
    api.post(`/enquiries/${id}/assign`, data),
  unassign: (id: string) => api.post(`/enquiries/${id}/unassign`),
  getStaffList: () => api.get('/enquiries/staff/list'),
};

// User API
export const userAPI = {
  create: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/users', data),
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/users', { params }),
  update: (id: string, data: { name?: string; email?: string; password?: string; role?: string }) =>
    api.put(`/users/${id}`, data),
  updateRole: (id: string, data: { role: string }) =>
    api.put(`/users/${id}/role`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export default api;
