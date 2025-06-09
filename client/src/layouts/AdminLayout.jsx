import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUsers, FiUser, FiSettings, FiHome, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePath, setActivePath] = useState('');
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Users', href: '/admin/users', icon: FiUsers },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-blue-600 text-white p-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white focus:outline-none"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <Link to="/admin" className="ml-4 text-xl font-bold">
              Admin Panel
            </Link>
          </div>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-xl font-bold text-gray-800">Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <nav className="p-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      activePath === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 mt-4"
                >
                  <FiLogOut className="mr-3 h-5 w-5" />
                  Sign out
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex lg:flex-col lg:h-screen">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64 bg-white border-r border-gray-200">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        activePath === item.href
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          activePath === item.href ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      {user?.role || 'User'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto p-1 text-gray-400 hover:text-gray-500"
                  title="Sign out"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto focus:outline-none">
            <div className="relative z-0 flex flex-col h-full">
              {/* Top navigation */}
              <div className="bg-white shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                  <h1 className="text-lg font-medium text-gray-900">
                    {navigation.find((item) => item.href === activePath)?.name || 'Dashboard'}
                  </h1>
                  <div className="flex items-center">
                    <Link
                      to="/"
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      View Site
                    </Link>
                  </div>
                </div>
              </div>

              {/* Page content */}
              <main className="flex-1 overflow-y-auto focus:outline-none">
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    {children}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
