import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Components
import ProtectedRoute from './ProtectedRoute';
import RoleSwitcher from './RoleSwitcher';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import StudentRoom from './StudentRoom';
import CompanyRoom from './CompanyRoom';

// Pages
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import ChallengePage from '../pages/ChallengePage';
import SubmissionsPage from '../pages/SubmissionsPage';

// Dashboard Route Handler - redirects to appropriate dashboard
const DashboardRoute = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <Navigate to={user.role === "student" ? "/student" : "/company"} />;
};

// Auth Page Component
const AuthPage = ({ showRegister, setShowRegister, activeRole, setActiveRole, RoleSwitcher }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.role === "student" ? "/student" : "/company"} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {showRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {showRegister ? 'Join our platform today' : 'Sign in to your account'}
          </p>
        </div>

        <button
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition mb-4 font-medium"
          onClick={() => setShowRegister((v) => !v)}
          aria-label={showRegister ? "Go to Login" : "Go to Register"}
        >
          {showRegister ? "Already have an account? Login" : "Need an account? Register"}
        </button>

        <RoleSwitcher currentRole={activeRole} onSwitch={setActiveRole} />

        <div className="mt-6">
          {showRegister ? (
            <RegisterForm role={activeRole} />
          ) : (
            <LoginForm role={activeRole} />
          )}
        </div>
      </div>
    </div>
  );
};

// App Routes Component
const AppRoutes = ({ showRegister, setShowRegister, activeRole, setActiveRole }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      
      {/* Auth Page */}
      <Route 
        path="/auth" 
        element={
          <AuthPage 
            showRegister={showRegister}
            setShowRegister={setShowRegister}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            RoleSwitcher={RoleSwitcher}
          />
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

      {/* Student-specific Routes */}
      <Route
        path="/submissions"
        element={
          <ProtectedRoute requiredRole="student">
            <SubmissionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <div className="container mx-auto px-6 py-8">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Leaderboard</h1>
                <p className="text-gray-600 mb-4">See how you rank among other talented developers.</p>
                <div className="text-yellow-600">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="text-gray-500">Leaderboard feature coming soon...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div className="container mx-auto px-6 py-8">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Profile Settings</h1>
                <p className="text-gray-600 mb-4">Manage your account information and preferences.</p>
                <div className="text-gray-600">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-500">Profile management feature coming soon...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Company-specific routes */}
      <Route
        path="/create-challenge"
        element={
          <ProtectedRoute requiredRole="company">
            <div className="container mx-auto px-6 py-8">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Create New Challenge</h1>
                <p className="text-gray-600 mb-4">Design coding challenges to discover talented developers.</p>
                <div className="text-green-600">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500">Challenge creation feature coming soon...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions-review"
        element={
          <ProtectedRoute requiredRole="company">
            <div className="container mx-auto px-6 py-8">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Review Submissions</h1>
                <p className="text-gray-600 mb-4">Evaluate and score student submissions for your challenges.</p>
                <div className="text-purple-600">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-gray-500">Submission review feature coming soon...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
};

export default AppRoutes;