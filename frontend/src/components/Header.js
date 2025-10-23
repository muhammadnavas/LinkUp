import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-6">
        <nav className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="LinkUp Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold text-gray-800">
              Link<span className="text-blue-600">Up</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors hover:text-blue-600 ${
                isActive('/') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
              }`}
            >
              Home
            </Link>

            {user ? (
              <>
                {/* Student Navigation */}
                {user.role === 'student' && (
                  <>
                    <Link 
                      to="/student" 
                      className={`font-medium transition-colors hover:text-blue-600 ${
                        isActive('/student') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/challenges" 
                      className={`font-medium transition-colors hover:text-blue-600 ${
                        isActive('/challenges') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                      }`}
                    >
                      Challenges
                    </Link>
                    <Link 
                      to="/submissions" 
                      className={`font-medium transition-colors hover:text-blue-600 ${
                        isActive('/submissions') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                      }`}
                    >
                      My Submissions
                    </Link>
                    <Link 
                      to="/leaderboard" 
                      className={`font-medium transition-colors hover:text-blue-600 ${
                        isActive('/leaderboard') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                      }`}
                    >
                      Leaderboard
                    </Link>
                  </>
                )}

                {/* Company Navigation */}
                {user.role === 'company' && (
                  <>
                    <Link 
                      to="/company" 
                      className={`font-medium transition-colors hover:text-blue-600 ${
                        isActive('/company') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/manage-challenges" 
                      className={`font-medium transition-colors hover:text-blue-600 ${
                        isActive('/manage-challenges') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                      }`}
                    >
                      My Challenges
                    </Link>
                    <Link 
                      to="/create-challenge" 
                      className={`font-medium transition-colors hover:text-blue-600 ${
                        isActive('/create-challenge') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                      }`}
                    >
                      Create Challenge
                    </Link>
                    <Link 
                      to="/review-submissions" 
                      className={`font-medium transition-colors hover:text-blue-600 ${
                        isActive('/review-submissions') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                      }`}
                    >
                      Review Submissions
                    </Link>
                  </>
                )}

                <Link 
                  to="/profile" 
                  className={`font-medium transition-colors hover:text-blue-600 ${
                    isActive('/profile') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                  }`}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/leaderboard" 
                  className={`font-medium transition-colors hover:text-blue-600 ${
                    isActive('/leaderboard') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                  }`}
                >
                  Leaderboard
                </Link>
                <Link 
                  to="/auth" 
                  className={`font-medium transition-colors hover:text-blue-600 ${
                    isActive('/auth') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700'
                  }`}
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* User Menu (Desktop) */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">{user.name}</div>
                  <div className="text-gray-500 capitalize">{user.role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`md:hidden bg-white border-t border-gray-200 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-6 py-4 space-y-3">
            <Link to="/" className="block text-gray-700 hover:text-blue-600 font-medium">
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  to={user.role === 'student' ? '/student' : '/company'} 
                  className="block text-gray-700 hover:text-blue-600 font-medium"
                >
                  Dashboard
                </Link>
                {user.role === 'student' && (
                  <>
                    <Link to="/challenges" className="block text-gray-700 hover:text-blue-600 font-medium">
                      Challenges
                    </Link>
                    <Link to="/submissions" className="block text-gray-700 hover:text-blue-600 font-medium">
                      My Submissions
                    </Link>
                    <Link to="/leaderboard" className="block text-gray-700 hover:text-blue-600 font-medium">
                      Leaderboard
                    </Link>
                  </>
                )}
                {user.role === 'company' && (
                  <>
                    <Link to="/manage-challenges" className="block text-gray-700 hover:text-blue-600 font-medium">
                      My Challenges
                    </Link>
                    <Link to="/create-challenge" className="block text-gray-700 hover:text-blue-600 font-medium">
                      Create Challenge
                    </Link>
                    <Link to="/review-submissions" className="block text-gray-700 hover:text-blue-600 font-medium">
                      Review Submissions
                    </Link>
                  </>
                )}
                <Link to="/profile" className="block text-gray-700 hover:text-blue-600 font-medium">
                  Profile
                </Link>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-800 mb-1">{user.name}</div>
                  <div className="text-sm text-gray-500 capitalize mb-3">{user.role}</div>
                  <button
                    onClick={logout}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/leaderboard" className="block text-gray-700 hover:text-blue-600 font-medium">
                  Leaderboard
                </Link>
                <Link to="/auth" className="block text-gray-700 hover:text-blue-600 font-medium">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;