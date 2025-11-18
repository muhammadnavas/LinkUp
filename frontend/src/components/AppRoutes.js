import { useEffect } from 'react';
import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate
} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Components
import LoginForm from './LoginForm';
import ProtectedRoute from './ProtectedRoute';
import RegisterForm from './RegisterForm';
import RoleSwitcher from './RoleSwitcher';

// Pages
import ChallengePage from '../pages/ChallengePage';
import ChallengesManagePage from '../pages/ChallengesManagePage';
import ChallengesPage from '../pages/ChallengesPage';
import CompanyDashboard from '../pages/CompanyDashboard';
import CompanySubmissionsPage from '../pages/CompanySubmissionsPage';
import CreateChallengePage from '../pages/CreateChallengePage';
import EditChallengePage from '../pages/EditChallengePage';
import Home from '../pages/Home';
import LeaderboardPage from '../pages/LeaderboardPage';
import ProfilePage from '../pages/ProfilePage';
import PublicChallengePage from '../pages/PublicChallengePage';
import StudentDashboard from '../pages/StudentDashboard';
import SubmissionsPage from '../pages/SubmissionsPage';
import SubmissionsReviewPage from '../pages/SubmissionsReviewPage';
import UserProfilePage from '../pages/UserProfilePage';

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
  const location = useLocation();
  const navigate = useNavigate();

  // Check if there's a return URL from the location state
  const returnTo = location.state?.returnTo;

  useEffect(() => {
    if (user && returnTo) {
      // If user logs in and there's a return URL, navigate there
      navigate(returnTo, { replace: true });
    } else if (user) {
      // Otherwise redirect to appropriate dashboard
      navigate(user.role === "student" ? "/student" : "/company", { replace: true });
    }
  }, [user, returnTo, navigate]);

  if (user) {
    return null; // Don't render anything while redirecting
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
      
      {/* Public Challenge View - accessible without authentication */}
      <Route path="/public/challenge/:id" element={<PublicChallengePage />} />
      
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

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <ChallengesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <ProtectedRoute requiredRole="student">
            <SubmissionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/review-submissions"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanySubmissionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={<LeaderboardPage />}
      />

      {/* Company Routes */}
      <Route
        path="/company"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-challenges"
        element={
          <ProtectedRoute requiredRole="company">
            <ChallengesManagePage />
          </ProtectedRoute>
        }
      />

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

      {/* Challenge Routes */}
      <Route
        path="/challenge/:id"
        element={
          <ProtectedRoute>
            <ChallengePage />
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

      {/* Common Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Dashboard Route - redirects to role-specific dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRoute />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
};

export default AppRoutes;