// API Client - Axios Instance

import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://beta3.christus.com.br:8082';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Basic ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};
    const skipAuthRedirect = config.skipAuthRedirect || false;

    if (error.response?.status === 426) {
      return Promise.resolve(error.response);
    }

    // if (error.response?.status === 404) {
    //   return Promise.resolve(error.response);
    // }

    if (error.response?.status === 401 && !skipAuthRedirect) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('tipo_usuario');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);