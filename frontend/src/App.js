import React, { useState, useEffect, createContext, useContext } from "react";
import "./output.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";

// Components
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import StudentRoom from "./components/StudentRoom";
import CompanyRoom from "./components/CompanyRoom";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ChallengePage from "./pages/ChallengePage";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Auth Context for managing authentication state
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, remove it
        sessionStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      sessionStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// API Helper Hook
export const useAPI = () => {
  const { user } = useAuth();

  const makeRequest = async (endpoint, options = {}) => {
    const token = sessionStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          sessionStorage.removeItem('token');
          window.location.href = '/auth';
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  };

  return { makeRequest };
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "student" ? "/student" : "/company"} />;
  }

  return children;
};

// Main App Component
function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [activeRole, setActiveRole] = useState("student");

  // Switcher for login/register roles
  const RoleSwitcher = ({ currentRole, onSwitch }) => (
    <div className="flex justify-center mb-4">
      {["student", "company"].map((role) => (
        <button
          key={role}
          className={`px-4 py-2 rounded mx-1 font-semibold transition 
            ${
              currentRole === role
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }
          `}
          onClick={() => onSwitch(role)}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <AppContent 
          showRegister={showRegister}
          setShowRegister={setShowRegister}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          RoleSwitcher={RoleSwitcher}
        />
      </Router>
    </AuthProvider>
  );
}

// App Content Component (separated to use auth context)
const AppContent = ({ showRegister, setShowRegister, activeRole, setActiveRole, RoleSwitcher }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Enhanced Navbar with Auth Status */}
      <nav className="p-4 bg-white shadow flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/" className="text-blue-600 hover:underline font-medium">Home</Link>
          <Link to="/dashboard" className="text-blue-600 hover:underline font-medium">Dashboard</Link>
          <Link to="/challenge" className="text-blue-600 hover:underline font-medium">Challenge</Link>
          {!user && <Link to="/auth" className="text-blue-600 hover:underline font-medium">Login</Link>}
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, {user.name} ({user.role})
            </span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      <div className="flex-1 flex flex-col items-center p-4">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />
          
          {/* Auth Page */}
          <Route path="/auth" element={
              user ? (
                <Navigate to={user.role === "student" ? "/student" : "/company"} />
              ) : (
                <div className="space-y-6 w-full max-w-4xl mt-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {showRegister ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-600">
                      {showRegister ? 'Join our platform today' : 'Sign in to your account'}
                    </p>
                  </div>

                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-2 block mx-auto"
                    onClick={() => setShowRegister((v) => !v)}
                    aria-label={showRegister ? "Go to Login" : "Go to Register"}
                  >
                    {showRegister ? "Already have an account? Login" : "Need an account? Register"}
                  </button>

                  <RoleSwitcher currentRole={activeRole} onSwitch={setActiveRole} />

                  <div className="flex flex-col items-center md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-4">
                    {showRegister ? (
                      <RegisterForm role={activeRole} />
                    ) : (
                      <LoginForm role={activeRole} />
                    )}
                  </div>
                </div>
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company"
            element={
              <ProtectedRoute requiredRole="company">
                <CompanyRoom />
              </ProtectedRoute>
            }
          />

          {/* Other Protected Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenge"
            element={
              <ProtectedRoute>
                <ChallengePage />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to appropriate page based on auth status */}
          <Route path="*" element={
            user ? 
              <Navigate to={user.role === "student" ? "/student" : "/company"} /> : 
              <Navigate to="/auth" />
          } />
        </Routes>
      </div>
    </div>
  );
};

export default App;