import api from './api';

const API_URL = '/api/v1/auth';

// Set the auth token for requests if it exists
const setAuthToken = (token) => {
  if (token) {
    // Remove any existing 'Bearer ' prefix to avoid duplication
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Get token from localStorage and set it in the headers
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Register a new user
export const register = async (name, email, password, confirmPassword) => {
  const response = await api.post(`${API_URL}/register`, {
    name,
    email,
    password,
    confirmPassword,
  });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
  }
  
  return response.data;
};

// Login user
export const login = async (email, password) => {
  const response = await api.post(`${API_URL}/login`, {
    email,
    password,
  });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
  }
  
  return response.data;
};

// Admin login
export const adminLogin = async (email, password) => {
  const response = await api.post(`${API_URL}/admin/login`, {
    email,
    password,
  });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
  }
  
  return response.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await api.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

// Reset password
export const resetPassword = async (token, password, confirmPassword) => {
  const response = await api.patch(`${API_URL}/reset-password/${token}`, {
    password,
    confirmPassword,
  });
  return response.data;
};

// Verify token
export const verifyToken = async () => {
  const response = await api.get(`${API_URL}/user`);
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
  // Clear any user data from the app state
  window.location.href = '/login';
};

// Update password
export const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
  const response = await api.patch(`${API_URL}/update-password`, {
    currentPassword,
    password: newPassword,
    passwordConfirm: confirmPassword,
  });
  return response.data;
};
