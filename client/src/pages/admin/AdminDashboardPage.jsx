import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import userService from '../../services/userService';
import { 
  FaUsers, 
  FaShieldAlt, 
  FaChartLine, 
  FaCog, 
  FaTrash, 
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';
import Card from '../../components/Card';
import Button from '../../components/Button';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    regularUsers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await userService.getAllUsers();
      if (result.success) {
        setUsers(result.data);
        calculateStats(result.data);
      } else {
        setError(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    const total = userList.length;
    const active = userList.filter(u => u.active !== false).length;
    const admins = userList.filter(u => u.role === 'admin').length;
    const regular = userList.filter(u => u.role === 'user').length;

    setStats({
      totalUsers: total,
      activeUsers: active,
      adminUsers: admins,
      regularUsers: regular
    });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await userService.deleteUser(userId);
      if (result.success) {
        setUsers(users.filter(u => u._id !== userId));
        calculateStats(users.filter(u => u._id !== userId));
      } else {
        setError(result.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('An error occurred while deleting user');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const result = await userService.updateUserStatus(userId, !currentStatus);
      if (result.success) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, active: !currentStatus } : u
        ));
        calculateStats(users.map(u => 
          u._id === userId ? { ...u, active: !currentStatus } : u
        ));
      } else {
        setError(result.message || 'Failed to update user status');
      }
    } catch (err) {
      setError('An error occurred while updating user status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      user: { color: 'bg-blue-100 text-blue-800', icon: <FaUsers /> },
      admin: { color: 'bg-purple-100 text-purple-800', icon: <FaShieldAlt /> }
    };
    
    const config = roleConfig[role] || roleConfig.user;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1 capitalize">{role}</span>
      </span>
    );
  };

  const getStatusBadge = (active) => {
    return active ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaUserCheck className="mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaUserTimes className="mr-1" />
        Inactive
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage users and monitor system activity
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center">
            <FaExclamationTriangle className="mr-2 text-red-500" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="primary" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          </Card>

          <Card variant="success" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
              <FaUserCheck className="text-green-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Users</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
          </Card>

          <Card variant="warning" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4">
              <FaShieldAlt className="text-purple-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Admins</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.adminUsers}</p>
          </Card>

          <Card variant="danger" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mx-auto mb-4">
              <FaUserTimes className="text-red-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Inactive</h3>
            <p className="text-3xl font-bold text-red-600">{stats.totalUsers - stats.activeUsers}</p>
          </Card>
        </div>

        {/* Users Table */}
        <Card title="User Management" subtitle="Manage all registered users">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.active !== false)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user._id, user.active !== false)}
                            icon={user.active !== false ? <FaUserTimes /> : <FaUserCheck />}
                          >
                            {user.active !== false ? 'Deactivate' : 'Activate'}
                          </Button>
                          
                          {user._id !== user?._id && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteUser(user._id)}
                              icon={<FaTrash />}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FaUsers className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="System Information" subtitle="Current system status">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">System Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FaCheckCircle className="mr-1" />
                  Online
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Last Updated</span>
                <span className="text-sm text-gray-600">{formatDate(new Date())}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Admin User</span>
                <span className="text-sm text-gray-600">{user?.name}</span>
              </div>
            </div>
          </Card>

          <Card title="Quick Actions" subtitle="Common admin tasks">
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={fetchUsers}
                icon={<FaUsers />}
              >
                Refresh Users
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                icon={<FaChartLine />}
              >
                View Analytics
              </Button>
              
              <Button
                variant="ghost"
                fullWidth
                icon={<FaCog />}
              >
                System Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
