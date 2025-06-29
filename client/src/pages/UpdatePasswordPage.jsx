import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import userService from '../services/userService';
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaShieldAlt, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft
} from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const UpdatePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      const result = await userService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (result.success) {
        setSuccess('Password updated successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(result.message || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              icon={<FaArrowLeft />}
              className="mr-4"
            >
              Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Change Password
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Update your account password to keep it secure
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center">
            <FaExclamationTriangle className="mr-2 text-red-500" />
            {error}
          </div>
        )}

        {/* Password Update Form */}
        <Card title="Update Password" subtitle="Enter your current and new password">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="relative">
              <Input
                label="Current Password"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChange={handleChange}
                icon={<FaLock />}
                required
                size="lg"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <Input
                label="New Password"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                icon={<FaLock />}
                required
                size="lg"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<FaLock />}
                required
                size="lg"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center">
                  <FaCheckCircle className="mr-2 text-blue-600" size={12} />
                  At least 6 characters long
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="mr-2 text-blue-600" size={12} />
                  Different from your current password
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="mr-2 text-blue-600" size={12} />
                  Both new password fields must match
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={<FaShieldAlt />}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.location.href = '/profile'}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Tips */}
        <Card title="Security Tips" subtitle="Best practices for password security" className="mt-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <FaShieldAlt className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>Use a strong, unique password that you don't use elsewhere</span>
            </div>
            <div className="flex items-start">
              <FaShieldAlt className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>Consider using a password manager to generate and store secure passwords</span>
            </div>
            <div className="flex items-start">
              <FaShieldAlt className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>Enable two-factor authentication if available for additional security</span>
            </div>
            <div className="flex items-start">
              <FaShieldAlt className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>Never share your password with anyone, including support staff</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default UpdatePasswordPage;
