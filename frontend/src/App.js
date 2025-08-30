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
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
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

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
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

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
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
    localStorage.removeItem('token');
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

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
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

// Dashboard Route Handler - redirects to appropriate dashboard
const DashboardRoute = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Redirect to role-specific room instead of generic dashboard
  return <Navigate to={user.role === "student" ? "/student" : "/company"} />;
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
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Enhanced Navbar with Auth Status */}
      <nav className="p-4 bg-white shadow flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/" className="text-blue-600 hover:underline font-medium">Home</Link>
          {user && (
            <>
              <Link 
                to={user.role === 'student' ? '/student' : '/company'} 
                className="text-blue-600 hover:underline font-medium"
              >
                {user.role === 'student' ? 'Challenges' : 'Manage'}
              </Link>
              {user.role === 'student' && (
                <Link to="/submissions" className="text-blue-600 hover:underline font-medium">
                  My Submissions
                </Link>
              )}
            </>
          )}
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

      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          
          {/* Auth Page */}
          <Route path="/auth" element={
              user ? (
                <Navigate to={user.role === "student" ? "/student" : "/company"} />
              ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="space-y-6 w-full max-w-md">
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

                    <div className="mt-4">
                      {showRegister ? (
                        <RegisterForm role={activeRole} />
                      ) : (
                        <LoginForm role={activeRole} />
                      )}
                    </div>
                  </div>
                </div>
              )
            }
          />

          {/* Role-specific Main Routes */}
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

          {/* Challenge Routes */}
          <Route
            path="/challenge/:id"
            element={
              <ProtectedRoute>
                <ChallengePage />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Route - redirects to role-specific rooms */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRoute />
              </ProtectedRoute>
            }
          />

          {/* Additional Protected Routes */}
          <Route
            path="/submissions"
            element={
              <ProtectedRoute requiredRole="student">
                <div className="p-6 text-center">
                  <h1 className="text-2xl font-bold mb-4">My Submissions</h1>
                  <p className="text-gray-600">Submissions page coming soon...</p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <div className="p-6 text-center">
                  <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
                  <p className="text-gray-600">Leaderboard coming soon...</p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="p-6 text-center">
                  <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
                  <p className="text-gray-600">Profile page coming soon...</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Company-specific routes */}
          <Route
            path="/create-challenge"
            element={
              <ProtectedRoute requiredRole="company">
                <div className="p-6 text-center">
                  <h1 className="text-2xl font-bold mb-4">Create New Challenge</h1>
                  <p className="text-gray-600">Challenge creation page coming soon...</p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/submissions-review"
            element={
              <ProtectedRoute requiredRole="company">
                <div className="p-6 text-center">
                  <h1 className="text-2xl font-bold mb-4">Review Submissions</h1>
                  <p className="text-gray-600">Submission review page coming soon...</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
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