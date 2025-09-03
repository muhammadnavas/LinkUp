import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Components
import CompanyRoom from './CompanyRoom';
import LoginForm from './LoginForm';
import ProtectedRoute from './ProtectedRoute';
import RegisterForm from './RegisterForm';
import RoleSwitcher from './RoleSwitcher';
import StudentRoom from './StudentRoom';

// Pages
import ChallengePage from '../pages/ChallengePage';
import CreateChallengePage from '../pages/CreateChallengePage';
import EditChallengePage from '../pages/EditChallengePage';
import Home from '../pages/Home';
import LeaderboardPage from '../pages/LeaderboardPage';
import ProfilePage from '../pages/ProfilePage';
import SubmissionsPage from '../pages/SubmissionsPage';
import SubmissionsReviewPage from '../pages/SubmissionsReviewPage';

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
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />


// Company-specific routes
      <Route
        path="/create-challenge"
        element={
          <ProtectedRoute requiredRole="company">
            <CreateChallengePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-challenge/:challengeId"
        element={
          <ProtectedRoute requiredRole="company">
            <EditChallengePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges/:challengeId/submissions"
        element={
          <ProtectedRoute requiredRole="company">
            <SubmissionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions/:submissionId/review"
        element={
          <ProtectedRoute requiredRole="company">
            <SubmissionsReviewPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
};

export default AppRoutes;