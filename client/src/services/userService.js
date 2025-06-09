import api from './api';

const API_URL = '/api/v1/users';

/**
 * User Service
 * Provides functions for user management including admin operations
 */

// ==================== USER PROFILE ====================

/**
 * Get current user profile
 * @returns {Promise<Object>} User data
 */
const getCurrentUser = async () => {
  const response = await api.get(`${API_URL}/me`);
  return response.data;
};

/**
 * Update user profile
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user data
 */
const updateProfile = async (userData) => {
  const response = await api.patch(`${API_URL}/updateMe`, userData);
  return response.data;
};

/**
 * Delete current user account
 * @returns {Promise<Object>} Response data
 */
const deleteProfile = async () => {
  const response = await api.delete(`${API_URL}/deleteMe`);
  return response.data;
};

/**
 * Update user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<Object>} Response data
 */
const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
  const response = await api.patch(`${API_URL}/updateMyPassword`, {
    currentPassword,
    password: newPassword,
    passwordConfirm: confirmPassword,
  });
  return response.data;
};

/**
 * Delete current user account
 * @returns {Promise<Object>} Response data
 */
export const deleteAccount = async () => {
  const response = await api.delete(`${API_URL}/deleteMe`);
  return response.data;
};

// ==================== ADMIN OPERATIONS ====================

/**
 * Get all users (admin only)
 * @param {Object} params - Query parameters (page, limit, sort, fields, etc.)
 * @returns {Promise<Object>} Paginated list of users
 */
export const getUsers = async (params = {}) => {
  const response = await api.get(API_URL, { params });
  return response.data;
};

/**
 * Get user by ID (admin only)
 * @param {string} id - User ID
 * @returns {Promise<Object>} User data
 */
export const getUser = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user data
 */
export const createUser = async (userData) => {
  const response = await api.post(API_URL, userData);
  return response.data;
};

/**
 * Update user by ID (admin only)
 * @param {string} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (id, userData) => {
  const response = await api.patch(`${API_URL}/${id}`, userData);
  return response.data;
};

/**
 * Delete user by ID (admin only)
 * @param {string} id - User ID
 * @returns {Promise<Object>} Response data
 */
export const deleteUser = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Toggle user active status (admin only)
 * @param {string} id - User ID
 * @param {boolean} active - Whether to activate or deactivate
 * @returns {Promise<Object>} Updated user data
 */
export const toggleUserActiveStatus = async (id, active = false) => {
  const response = await api.patch(`${API_URL}/${id}/toggle-active`, { active });
  return response.data;
};

/**
 * Update user role (admin only)
 * @param {string} id - User ID
 * @param {string} role - New role (user, admin)
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserRole = async (id, role) => {
  const response = await api.patch(`${API_URL}/${id}/role`, { role });
  return response.data;
};
