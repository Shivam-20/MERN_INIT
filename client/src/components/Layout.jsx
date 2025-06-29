import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDropdown } from '../hooks/useDropdown';
import { 
  FaBars, 
  FaTimes, 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaShieldAlt,
  FaHome,
  FaUserCircle,
  FaCrown,
  FaBell
} from 'react-icons/fa';
import Button from './Button';

const Layout = ({ children, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  
  const { isOpen: isUserMenuOpen, dropdownRef: userMenuRef, toggleDropdown: toggleUserMenu } = useDropdown();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuRef]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <FaHome /> },
    { name: 'Profile', href: '/profile', icon: <FaUserCircle /> },
    ...(user?.role === 'admin' ? [{ name: 'Admin', href: '/admin/dashboard', icon: <FaCrown /> }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <div className="flex-shrink-0 flex items-center sm:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMobileMenu}
                    className="p-2"
                  >
                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                  </Button>
                </div>

                {/* Logo */}
                <div className="flex-shrink-0 flex items-center ml-4 sm:ml-0">
                  <Link to="/dashboard" className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <FaShieldAlt className="text-white text-sm" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Encriptofy
                    </span>
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                  {navigationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) => 
                        `inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Desktop User Menu */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <FaBell />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </Button>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleUserMenu}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    </Button>
                    
                    {/* User Menu Dropdown */}
                    <div 
                      className={`absolute right-0 z-50 mt-2 w-56 rounded-xl bg-white/90 backdrop-blur-xl py-2 shadow-2xl ring-1 ring-black/5 transition-all duration-200 ${
                        isUserMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                      }`} 
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={toggleUserMenu}
                        >
                          <FaUser className="mr-3" />
                          Your Profile
                        </Link>
                        <Link
                          to="/update-password"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={toggleUserMenu}
                        >
                          <FaCog className="mr-3" />
                          Change Password
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-1">
                        <button
                          onClick={() => {
                            toggleUserMenu();
                            handleLogout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <FaSignOutAlt className="mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile User Menu Button */}
                <div className="flex items-center sm:hidden">
                  <div className="relative" ref={userMenuRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleUserMenu}
                      className="p-2"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </Button>
                    
                    {/* Mobile User Menu Dropdown */}
                    <div 
                      className={`absolute right-0 z-50 mt-2 w-48 rounded-xl bg-white/90 backdrop-blur-xl py-2 shadow-2xl ring-1 ring-black/5 transition-all duration-200 ${
                        isUserMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                      }`} 
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={toggleUserMenu}
                        >
                          <FaUser className="mr-3" />
                          Your Profile
                        </Link>
                        <Link
                          to="/update-password"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={toggleUserMenu}
                        >
                          <FaCog className="mr-3" />
                          Change Password
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-1">
                        <button
                          onClick={() => {
                            toggleUserMenu();
                            handleLogout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <FaSignOutAlt className="mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div 
            ref={mobileMenuRef}
            className={`sm:hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <div className="px-4 py-2 space-y-1 bg-white/90 backdrop-blur-xl border-t border-white/20">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 