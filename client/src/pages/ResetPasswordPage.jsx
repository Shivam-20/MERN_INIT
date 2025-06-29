import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid reset token');
    }
  }, [token]);

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, formData.password, formData.confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="relative z-10 w-full max-w-md">
          <Card variant="glass" className="backdrop-blur-xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FaExclamationTriangle className="text-red-600 text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              The password reset link is invalid or has expired.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/forgot-password')}
            >
              Request New Reset Link
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Encriptofy
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Reset your password</p>
          <p className="text-gray-500 text-sm">Enter your new password below</p>
        </div>

        {/* Reset Password Card */}
        <Card variant="glass" className="backdrop-blur-xl">
          {success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Reset Successfully</h2>
              <p className="text-gray-600 mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
                  <FaExclamationTriangle className="mr-2 text-red-500" />
                  {error}
                </div>
              )}

              {/* Reset Password Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                  <Input
                    label="New Password"
                    name="password"
                    type={showPasswords.password ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={handleChange}
                    icon={<FaLock />}
                    required
                    size="lg"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    {showPasswords.password ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>

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
                      Both password fields must match
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Remember your password?{' '}
                  <Link 
                    to="/login" 
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Secure password reset powered by Encriptofy
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
