import api from './api';

const API_URL = '/api/v1/users';

// Get all users (admin only)
export const getUsers = async () => {
  const response = await api.get(API_URL);
  // Backend returns { status: 'success', data: { users: [...] } }
  // Extract the users array from the nested structure
  return response.data?.data?.users || [];
};

// Admin: Create new user
export const createUser = async (userData) => {
  const response = await api.post(API_URL, userData);
  // Backend returns { status: 'success', data: { user: {...} } }
  return response.data?.data?.user || response.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await api.get(`${API_URL}/me`);
  // Backend returns { status: 'success', data: { user: {...} } }
  return response.data?.data?.user || response.data;
};

// Get user by ID
export const getUser = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  // Backend returns { status: 'success', data: { user: {...} } }
  return response.data?.data?.user || response.data;
};

// Update user profile
export const updateProfile = async (userData) => {
  const response = await api.patch(`${API_URL}/updateMe`, userData);
  // Backend returns { status: 'success', data: { user: {...} } }
  return response.data?.data?.user || response.data;
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
