import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiUserPlus, FiSettings, FiBarChart2 } from 'react-icons/fi';
import { getUsers } from '../../services/userService';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getUsers({ limit: 1000 }); // Get all users for stats
        const totalUsers = data.users.length;
        const activeUsers = data.users.filter(user => user.active).length;
        const adminUsers = data.users.filter(user => user.role === 'admin').length;
        
        setStats({
          totalUsers,
          activeUsers,
          adminUsers,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <FiUsers className="h-6 w-6 text-blue-500" />,
      link: '/admin/users',
      linkText: 'View all users',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <FiUserPlus className="h-6 w-6 text-green-500" />,
      link: '/admin/users?status=active',
      linkText: 'View active users',
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: <FiSettings className="h-6 w-6 text-purple-500" />,
      link: '/admin/users?role=admin',
      linkText: 'View admins',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <Link
                  to={stat.link}
                  className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {stat.linkText}
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/users/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
              <FiUserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Add New User</h3>
              <p className="text-sm text-gray-500">Create a new user account</p>
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
              <FiUsers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">View and manage all users</p>
            </div>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
              <FiSettings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Site Settings</h3>
              <p className="text-sm text-gray-500">Configure site preferences</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity - Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <FiBarChart2 className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2">Recent activity will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
