import axios from 'axios';

// In development, uses localhost:5001. In production on Vercel, uses relative /api
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');

const api = axios.create({
  baseURL: API_URL,
});

// Auto-attach authorization token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
