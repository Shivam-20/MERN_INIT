import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import userService from '../services/userService';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendar, 
  FaShieldAlt, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await userService.updateProfile(formData);
      if (result.success) {
        updateUser(result.data);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      user: { color: 'bg-blue-100 text-blue-800', icon: <FaUser /> },
      admin: { color: 'bg-purple-100 text-purple-800', icon: <FaShieldAlt /> }
    };
    
    const config = roleConfig[role] || roleConfig.user;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1 capitalize">{role}</span>
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account information and preferences
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card title="Personal Information" subtitle="Update your profile details">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    icon={<FaUser />}
                    disabled={!isEditing}
                    required
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<FaEnvelope />}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  {isEditing ? (
                    <div className="flex space-x-3">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        icon={<FaSave />}
                      >
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        icon={<FaTimes />}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                      icon={<FaEdit />}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            <Card title="Account Information" subtitle="Your account details">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Role</span>
                  </div>
                  {getRoleBadge(user?.role)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <FaCalendar className="text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Status</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaCheckCircle className="mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Quick Actions" subtitle="Common profile actions">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => window.location.href = '/update-password'}
                  icon={<FaShieldAlt />}
                >
                  Change Password
                </Button>
                
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => window.location.href = '/dashboard'}
                  icon={<FaUser />}
                >
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
