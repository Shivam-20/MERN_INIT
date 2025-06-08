import api from './api';

const API_URL = '/api/v1/users';

// Get all users (admin only)
export const getUsers = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await api.get(`${API_URL}/me`);
  return response.data;
};

// Get user by ID
export const getUser = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

// Update user profile
export const updateProfile = async (userData) => {
  const response = await api.patch(`${API_URL}/updateMe`, userData);
  return response.data;
};

// Update user password
export const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
  const response = await api.patch(`${API_URL}/updateMyPassword`, {
    currentPassword,
    password: newPassword,
    passwordConfirm: confirmPassword,
  });
  return response.data;
};

// Delete user account
export const deleteAccount = async () => {
  const response = await api.delete(`${API_URL}/deleteMe`);
  return response.data;
};

// Admin: Update user
export const updateUser = async (id, userData) => {
  const response = await api.patch(`${API_URL}/${id}`, userData);
  return response.data;
};

// Admin: Delete user
export const deleteUser = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};
