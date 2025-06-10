import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useMatch } from 'react-router-dom';
import { 
  FiMenu, 
  FiX, 
  FiUsers, 
  FiUser, 
  FiSettings, 
  FiHome, 
  FiLogOut,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 1024; // lg breakpoint

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link 
              to="/admin" 
              className={`text-xl font-bold text-gray-800 whitespace-nowrap ${
                collapsed ? 'hidden' : 'block'
              }`}
            >
              Admin Panel
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {collapsed ? (
                <FiChevronRight className="h-6 w-6" />
              ) : (
                <FiChevronLeft className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <item.icon 
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  />
                  <span className={collapsed ? 'hidden' : 'block'}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              <div className={`flex items-center ${collapsed ? 'hidden' : 'flex'}`}>
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {user?.role || 'Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  collapsed ? 'mx-auto' : ''
                }`}
                title="Logout"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="flex-1 flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
              <div className="ml-4 flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Site
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
