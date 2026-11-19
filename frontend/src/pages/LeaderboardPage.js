// src/pages/LeaderboardPage.js
import { motion } from 'framer-motion';
import { Award, Building2, Calendar, Crown, Medal, Star, TrendingUp, Trophy, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getLeaderboard, getPublicLeaderboard, getPublicStats, getUserProfile } from '../api';
import { useAuth } from '../contexts/AuthContext';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('all'); // all, monthly, weekly
  const [activeTab, setActiveTab] = useState('students'); // students, companies

  // Check URL parameters to set initial tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const type = urlParams.get('type');
    if (type === 'companies') {
      setActiveTab('companies');
    }
  }, [location]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'students') {
        // Fetch student leaderboard
        let leaderboardResponse;
        if (user) {
          // Use authenticated endpoint for logged-in users
          leaderboardResponse = await getLeaderboard(timeframe);
        } else {
          // Use public endpoint for non-logged-in users
          leaderboardResponse = await getPublicLeaderboard(timeframe, 100);
        }
        
        setLeaderboard(leaderboardResponse.data || leaderboardResponse);
        
        // Only fetch user data if logged in
        if (user) {
          try {
            const userResponse = await getUserProfile();
            setCurrentUser(userResponse.data || userResponse);
          } catch (userError) {
            // Don't set error for user profile failure when not logged in
          }
        }
      } else {
        // Fetch companies data
        const statsResponse = await getPublicStats();
        if (statsResponse.success) {
          setCompanies(statsResponse.data.activeCompanies || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user, timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData, timeframe, activeTab]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">#{rank}</span>;
    }
  };

  const getRankBackground = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-white';
    }
  };

  const getCurrentUserRank = () => {
    if (!currentUser) return null;
    const userIndex = leaderboard.findIndex(user => user._id === currentUser._id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-purple-50 to-blue-100 py-6 sm:py-8">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 shrink-0" />
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-gray-900">
              {activeTab === 'students' ? 'Student Leaderboard' : 'Active Companies'}
            </h1>
          </div>
          <p className="max-w-2xl mx-auto text-gray-600 text-base sm:text-lg leading-relaxed">
            {activeTab === 'students' 
              ? 'Compete with fellow student developers and showcase your coding skills'
              : 'Companies creating challenges and looking for talent'
            }
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 min-w-0"
        >
          <div className="flex w-full min-w-0 gap-1 bg-gray-100 rounded-lg p-1 mb-5 sm:mb-6">
            <button
              onClick={() => {
                setActiveTab('students');
                navigate('/leaderboard');
              }}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center ${
                activeTab === 'students'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Students
            </button>
            <button
              onClick={() => {
                setActiveTab('companies');
                navigate('/leaderboard?type=companies');
              }}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center ${
                activeTab === 'companies'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Companies
            </button>
          </div>

          {/* Timeframe Filter - only show for students */}
          {activeTab === 'students' && (
            <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3">
              <div className="flex items-center mb-0">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Ranking Period:</span>
              </div>
              <div className="grid grid-cols-3 w-full sm:w-auto gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'monthly', label: 'This Month' },
                  { value: 'weekly', label: 'This Week' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeframe(option.value)}
                    className={`min-w-0 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm whitespace-nowrap font-medium transition-colors ${
                      timeframe === option.value
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Company User Message */}
        {currentUser && currentUser.role === 'company' && activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg mb-8"
          >
            <div className="flex items-center">
              <Award className="w-6 h-6 mr-3" />
              <div>
                <h3 className="font-semibold">Company Dashboard</h3>
                <p className="text-sm">As a company user, you can view the student leaderboard to scout talent, but you don't participate in the points competition.</p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        
        {/* Current User Stats */}
        {currentUser && currentUser.role === 'student' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 mb-8 text-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold break-words">{currentUser.username}</h3>
                  <p className="text-purple-100">Your Current Standing</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {getCurrentUserRank() ? `#${getCurrentUserRank()}` : 'Unranked'}
                </div>
                <p className="text-purple-100">Global Rank</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-purple-400">
              <div className="text-center">
                <div className="text-2xl font-bold">{currentUser.totalPoints || 0}</div>
                <p className="text-purple-100 text-sm">Total Points</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentUser.challengesCompleted || 0}</div>
                <p className="text-purple-100 text-sm">Challenges</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(currentUser.averageScore || 0)}</div>
                <p className="text-purple-100 text-sm">Avg Score</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Student-specific content */}
        {activeTab === 'students' && (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex justify-center items-end gap-2 sm:gap-4 overflow-x-auto px-1">
              {/* Second Place */}
              <div className="text-center min-w-0 flex-1 max-w-[10rem]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-lg p-6 h-32 flex flex-col justify-end"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                    <Medal className="w-8 h-8 text-gray-500" />
                  </div>
                </motion.div>
                <div className="bg-white rounded-b-lg p-4 shadow-lg">
                  <h3 className="font-bold text-gray-900">{leaderboard[1].username}</h3>
                  <p className="text-gray-600 text-sm">{leaderboard[1].totalPoints} pts</p>
                </div>
              </div>

              {/* First Place */}
              <div className="text-center min-w-0 flex-1 max-w-[10rem]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-lg p-6 h-40 flex flex-col justify-end"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                    <Crown className="w-10 h-10 text-yellow-500" />
                  </div>
                </motion.div>
                <div className="bg-white rounded-b-lg p-4 shadow-lg">
                  <h3 className="font-bold text-gray-900 text-lg">{leaderboard[0].username}</h3>
                  <p className="text-gray-600">{leaderboard[0].totalPoints} pts</p>
                  <div className="text-yellow-500 text-sm font-medium">👑 Champion</div>
                </div>
              </div>

              {/* Third Place */}
              <div className="text-center min-w-0 flex-1 max-w-[10rem]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-lg p-6 h-24 flex flex-col justify-end"
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-7 h-7 text-amber-600" />
                  </div>
                </motion.div>
                <div className="bg-white rounded-b-lg p-4 shadow-lg">
                  <h3 className="font-bold text-gray-900">{leaderboard[2].username}</h3>
                  <p className="text-gray-600 text-sm">{leaderboard[2].totalPoints} pts</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Complete Rankings</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
                <p className="text-gray-600">Complete challenges to appear on the leaderboard!</p>
              </div>
            ) : (
              leaderboard.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors min-w-0 ${
                    currentUser && user._id === currentUser._id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        index < 3 ? getRankBackground(index + 1) : 'bg-gray-100'
                      }`}>
                        {getRankIcon(index + 1)}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex flex-wrap items-center gap-1 min-w-0 break-words">
                          <Link 
                            to={`/profile/${user._id}`}
                            className="hover:text-purple-600 transition-colors break-all"
                          >
                            {user.username}
                          </Link>
                          {currentUser && user._id === currentUser._id && (
                            <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                              You
                            </span>
                          )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 text-xs sm:text-sm mt-1">
                          <span className="flex items-center min-w-0">
                            <Calendar className="w-4 h-4 mr-1" />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                          {user.role === 'company' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                              Company
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto sm:ml-auto">
                      <div className="grid grid-cols-3 gap-2 sm:gap-6 w-full sm:w-auto items-start">
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">
                            {user.totalPoints || 0}
                          </div>
                          <p className="text-gray-500 text-xs sm:text-sm">Points</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-semibold text-gray-900">
                            {user.challengesCompleted || 0}
                          </div>
                          <p className="text-gray-500 text-xs sm:text-sm">Completed</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-yellow-500">
                            <Star className="w-4 h-4 mr-1" />
                            <span className="font-semibold">
                              {Math.round(user.averageScore || 0)}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs sm:text-sm">Avg Score</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  {user.achievements && user.achievements.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.achievements.slice(0, 3).map((achievement, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                        >
                          🏆 {achievement}
                        </span>
                      ))}
                      {user.achievements.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{user.achievements.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {leaderboard.length}
            </div>
            <p className="text-gray-600">Total Participants</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {leaderboard.reduce((sum, user) => sum + (user.challengesCompleted || 0), 0)}
            </div>
            <p className="text-gray-600">Total Completions</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {leaderboard.length > 0 
                ? Math.round(leaderboard.reduce((sum, user) => sum + (user.averageScore || 0), 0) / leaderboard.length)
                : 0
              }
            </div>
            <p className="text-gray-600">Avg Community Score</p>
          </div>
        </motion.div>
          </>
        )}

        {/* Companies content */}
        {activeTab === 'companies' && (
          <>
            {/* Companies List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Active Companies</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {companies.length === 0 ? (
                  <div className="p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Companies Yet</h3>
                    <p className="text-gray-600">Companies will appear here when they create challenges!</p>
                  </div>
                ) : (
                  companies.map((company, index) => (
                    <motion.div
                      key={company._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 sm:p-6 hover:bg-gray-50 transition-colors min-w-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex flex-wrap items-center gap-1 min-w-0 break-words">
                              <Link 
                                to={`/profile/${company._id}`}
                                className="hover:text-purple-600 transition-colors"
                              >
                                {company.name}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 text-xs sm:text-sm mt-1">
                              <span className="flex items-center">
                                <Trophy className="w-4 h-4 mr-1" />
                                Active Company
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full sm:w-auto sm:ml-auto">
                          <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full sm:w-auto">
                            <div className="text-center">
                              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                                {company.challengeCount}
                              </div>
                              <p className="text-gray-500 text-sm">Challenges</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg sm:text-xl font-semibold text-gray-900">
                                #{company.rank}
                              </div>
                              <p className="text-gray-500 text-sm">Rank</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Company Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {companies.length}
                </div>
                <p className="text-gray-600">Active Companies</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {companies.reduce((sum, company) => sum + (company.challengeCount || 0), 0)}
                </div>
                <p className="text-gray-600">Total Challenges</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {companies.length > 0 
                    ? Math.round(companies.reduce((sum, company) => sum + (company.challengeCount || 0), 0) / companies.length)
                    : 0
                  }
                </div>
                <p className="text-gray-600">Avg Challenges per Company</p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;