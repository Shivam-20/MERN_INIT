import api from './api';

const API_URL = '/api/v1/users';

// Get all users (admin only)
export const getUsers = async () => {
  const response = await api.get(API_URL);
  // Backend returns { status: 'success', data: { users: [...] } }
  // Extract the users array from the nested structure
  return response.data?.data?.users || [];
};

// Get all users (admin only) - with proper response structure
export const getAllUsers = async () => {
  try {
    const response = await api.get(API_URL);
    return {
      success: true,
      data: response.data?.data?.users || []
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch users'
    };
  }
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
  try {
    const response = await api.patch(`${API_URL}/updateMe`, userData);
    return {
      success: true,
      data: response.data?.data?.user || response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update profile'
    };
  }
};

// Update user password
export const updatePassword = async (passwordData) => {
  try {
    const response = await api.patch(`${API_URL}/updateMyPassword`, {
      currentPassword: passwordData.currentPassword,
      password: passwordData.newPassword,
      passwordConfirm: passwordData.newPassword,
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update password'
    };
  }
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

// Admin: Update user status
export const updateUserStatus = async (id, active) => {
  try {
    const response = await api.patch(`${API_URL}/${id}`, { active });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update user status'
    };
  }
};

// Admin: Delete user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete user'
    };
  }
};

// Default export with all functions
const userService = {
  getUsers,
  getAllUsers,
  createUser,
  getCurrentUser,
  getUser,
  updateProfile,
  updatePassword,
  deleteAccount,
  updateUser,
  updateUserStatus,
  deleteUser
};

export default userService;
