import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Skip adding auth header if _skipAuth is true
    if (config._skipAuth) {
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure we don't duplicate the Bearer prefix
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = authToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip if this is a retry or a special request
    if (originalRequest._retry || originalRequest._skipAuth) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // If this is a login request, just reject it
      if (originalRequest.url.includes('/login') || originalRequest.url.includes('/admin/login')) {
        return Promise.reject(error);
      }
      
      // Mark this request as retried to prevent infinite loops
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear auth state
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
