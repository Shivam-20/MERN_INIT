import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDropdown } from '../hooks/useDropdown';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <div className="flex-shrink-0 flex items-center sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-expanded="false"
                  onClick={toggleMobileMenu}
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <svg
                    className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                  Encriptofy
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => 
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive 
                        ? 'border-blue-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                  end
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) => 
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive 
                        ? 'border-blue-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  Profile
                </NavLink>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      id="user-menu-button"
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="true"
                      onClick={toggleUserMenu}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </button>
                    <div 
                      className={`absolute right-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${isUserMenuOpen ? 'block' : 'hidden'}`} 
                      role="menu" 
                      aria-orientation="vertical" 
                      aria-labelledby="user-menu-button" 
                      tabIndex="-1"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        tabIndex="-1"
                        id="user-menu-item-0"
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/update-password"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        tabIndex="-1"
                        id="user-menu-item-1"
                      >
                        Change Password
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        tabIndex="-1"
                        id="user-menu-item-2"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <div className="sm:hidden bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center">
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={toggleUserMenu}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>
              {/* Mobile user menu dropdown */}
              <div 
                className={`absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${isUserMenuOpen ? 'block' : 'hidden'}`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="mobile-user-menu-button"
                tabIndex="-1"
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  tabIndex="-1"
                  onClick={() => {
                    toggleUserMenu();
                    setMobileMenuOpen(false);
                  }}
                >
                  Your Profile
                </Link>
                <Link
                  to="/update-password"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  tabIndex="-1"
                  onClick={() => {
                    toggleUserMenu();
                    setMobileMenuOpen(false);
                  }}
                >
                  Change Password
                </Link>
                <button
                  onClick={() => {
                    logout();
                    toggleUserMenu();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  tabIndex="-1"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 sm:py-10">
        <header className="hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    User Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Personal details and account settings.
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Full name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user?.name || 'Not provided'}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user?.email}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Account type</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Account actions</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-2">
                        <div>
                          <Link
                            to="/profile"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit Profile →
                          </Link>
                        </div>
                        <div>
                          <Link
                            to="/update-password"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Change Password →
                          </Link>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Your Dashboard</h2>
                <p className="text-gray-600">
                  You are logged in as {user?.email} ({user?.role})
                </p>
                {user?.role === 'admin' && (
                  <div className="mt-4">
                    <Link
                      to="/admin/dashboard"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Go to Admin Dashboard →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile menu */}
      <div 
        ref={mobileMenuRef}
        className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}
      >
        <div className="pt-2 pb-3 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => 
              `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`
            }
            end
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => 
              `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Profile
          </NavLink>
          <NavLink
            to="/update-password"
            className={({ isActive }) => 
              `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Change Password
          </NavLink>
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            Sign out
          </button>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
