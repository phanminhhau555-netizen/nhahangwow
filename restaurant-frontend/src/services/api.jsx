import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Tự động thêm token vào mỗi request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.authorization = token;
  return config;
});

export default API;