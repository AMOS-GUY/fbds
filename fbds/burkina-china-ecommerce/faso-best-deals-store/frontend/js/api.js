const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  login: (credentials) => this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => this.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/products?${qs}`);
  },
  createOrder: (orderData) => this.request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  uploadProduct: (formData) => this.request('/admin/products', { method: 'POST', body: formData, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
  uploadCsv: (formData) => this.request('/admin/products/csv', { method: 'POST', body: formData, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
};