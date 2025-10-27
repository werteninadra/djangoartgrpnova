import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        // Verify user is still authenticated via session
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/auth/verify/', {
            withCredentials: true,  // Important for session cookies
            headers: {
              'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1] || ''
            }
          });
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (verifyError) {
          console.error('Session verification failed:', verifyError);
          // Session is invalid, clear storage
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Token refresh mechanism (not needed for session auth)
  const refreshToken = async () => {
    // For session-based auth, we don't need token refresh
    return Promise.resolve();
  };

  // Login function
  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', { username, password });

      // First get CSRF token
      await axios.get('http://127.0.0.1:8000/api/auth/csrf-token/', {
        withCredentials: true
      });

      // Login with CSRF token
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        username,
        password
      }, {
        withCredentials: true,  // Important for session cookies
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1] || ''
        }
      });

      console.log('Login response:', response.data);

      const { user: userData } = response.data;
      const newToken = 'dummy-token'; // Since we're using session auth, not JWT

      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de la connexion';
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/auth/logout/', {}, {
        withCredentials: true  // Important for session cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Check if user is admin or curator (for protected features)
  const isAdminOrCurator = () => {
    return hasAnyRole(['admin', 'curator']);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    hasRole,
    hasAnyRole,
    isAdminOrCurator
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};