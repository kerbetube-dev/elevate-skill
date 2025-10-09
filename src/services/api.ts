import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL =  'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  detail?: string;
}

// Helper function for handling API errors
export const handleApiError = (error: any): string => {
  console.log("API error:", error);
  return error.message;
  // Handle different error response structures from backend
  if (error.response?.data) {
    const data = error.response.data;

    // Handle nested error structure: {"detail": {"message": "error message"}}
    if (data.detail && typeof data.detail === 'object' && data.detail.message) {
      return data.detail.message;
    }

    // Handle direct detail field
    if (data.detail && typeof data.detail === 'string') {
      return data.detail;
    }

    // Handle direct message field
    if (data.message) {
      return data.message;
    }

    // Handle error array (sometimes used in validation errors)
    if (Array.isArray(data) && data.length > 0) {
      return data[0].message || data[0].msg || 'Validation error occurred';
    }
  }

  // Handle network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (error.code === 'ETIMEDOUT') {
    return 'Request timed out. Please try again.';
  }

  // Handle axios error messages
  if (error.message) {
    // Clean up common axios error messages
    if (error.message.includes('Network Error')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};