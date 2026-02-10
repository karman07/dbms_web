import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/user';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? import.meta.env.VITE_API_BASE_URL : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Let the application handle the 401 error
        // e.g., AuthContext can listen for this or the specific query can fail
      }

      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Forbidden: Insufficient permissions');
      }

      // Return formatted error
      return Promise.reject({
        message: Array.isArray(data.message) ? data.message.join(', ') : data.message,
        statusCode: data.statusCode,
        error: data.error,
      });
    }

    // Network or other errors
    return Promise.reject({
      message: 'Network error. Please check your connection.',
      statusCode: 0,
      error: 'Network Error',
    });
  }
);

export default axiosInstance;
