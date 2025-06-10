import api from './api';

const API_URL = '/auth';

// Set the auth token for requests if it exists
export const setAuthToken = (token) => {
  if (token) {
    // Remove any existing Bearer prefix to prevent duplication
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
    localStorage.setItem('token', cleanToken);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Initialize auth token from localStorage on app load
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
    // setAuthToken will handle storing the token and setting headers
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
    // setAuthToken will handle storing the token and setting headers
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
    // setAuthToken will handle storing the token and setting headers
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
export const verifyToken = async (token) => {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Remove 'Bearer ' prefix if it exists
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    
    const response = await api.get(`${API_URL}/user`, {
      headers: { Authorization: `Bearer ${cleanToken}` },
      _skipAuth: true // Skip the auth interceptor for this request
    });
    
    // If we get here, the token is valid and we have user data
    // Return the clean token without Bearer prefix (it will be added by setAuthToken)
    return {
      ...response.data,
      token: cleanToken
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    // Clear the token if verification fails
    setAuthToken(null);
    throw error;
  }
};

// Logout user
export const logout = () => {
  // Clear the token using setAuthToken which handles both localStorage and axios headers
  setAuthToken(null);
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
