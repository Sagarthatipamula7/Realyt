import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('realyt_client_token') || localStorage.getItem('realyt_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function signupRequest(email, password, name = null) {
  return api.post('/auth/signup', { email, password, name }).then((response) => response.data);
}

export function loginRequest(email, password) {
  return api.post('/auth/login', { email, password }).then((response) => response.data);
}

export function adminLoginRequest(email, password) {
  return api.post('/auth/admin/login', { email, password }).then((response) => response.data);
}

export function submitEditorApplicationApi(payload) {
  return api.post('/editor-applications', payload).then((response) => response.data);
}

export function sendOtpRequest(email) {
  return api.post('/auth/send-otp', { email }).then((response) => response.data);
}

export function verifyOtpRequest(email, code) {
  return api.post('/auth/verify-otp', { email, code }).then((response) => response.data);
}

export default api;
