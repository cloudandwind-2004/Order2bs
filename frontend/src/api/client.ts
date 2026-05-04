import axios from 'axios';

// Mặc định dùng relative URL '/' → request đi qua nginx proxy trong K8s
// Khi dev local: vite.config.ts proxy '/api' → localhost:8080
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401: redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
