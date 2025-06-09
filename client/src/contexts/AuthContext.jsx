import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Set the token in the axios headers before verification
        authService.setAuthToken(token);
        
        // Verify the token
        const userData = await authService.verifyToken(token);
        
        if (isMounted) {
          if (userData && userData.id) {
            setUser(userData);
          } else {
            console.error('Invalid user data received:', userData);
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setUser(null);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password, isAdmin = false) => {
    try {
      // Clear any existing token first
      authService.setAuthToken(null);
      
      // Make the login request
      const data = isAdmin 
        ? await authService.adminLogin(email, password)
        : await authService.login(email, password);
      
      if (!data || !data.token) {
        throw new Error('No token received from server');
      }

      // Set the token in localStorage and axios headers
      authService.setAuthToken(data.token);
      
      // Get the user data from the response or fetch it
      let userData = data.user;
      if (!userData) {
        userData = await authService.verifyToken(data.token);
      }
      
      if (!userData || !userData.id) {
        throw new Error('Invalid user data received');
      }
      
      // Update the user state
      setUser(userData);
      return { success: true };
      
    } catch (error) {
      console.error('Login failed:', error);
      // Clear any partial auth state on failure
      authService.setAuthToken(null);
      setUser(null);
      
      // Extract a user-friendly error message
      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
