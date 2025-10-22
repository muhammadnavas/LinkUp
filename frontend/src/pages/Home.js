import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublicStats } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    topStudents: [],
    activeCompanies: [],
    totalStudents: 0,
    totalCompanies: 0,
    totalChallenges: 0,
    completedSubmissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getPublicStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default stats if API fails
    } finally {
      setLoading(false);
    }
  };

  const getRankBadgeStyles = (rank) => {
    switch (rank) {
      case 1:
        return {
          container: "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200",
          badge: "bg-yellow-500",
          points: "text-yellow-600"
        };
      case 2:
        return {
          container: "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200",
          badge: "bg-gray-400",
          points: "text-gray-600"
        };
      case 3:
        return {
          container: "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200",
          badge: "bg-orange-400",
          points: "text-orange-600"
        };
      default:
        return {
          container: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200",
          badge: "bg-blue-400",
          points: "text-blue-600"
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
            Welcome to <span className="text-blue-600">LinkUp</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Bridging the gap between talented students and innovative companies. 
            Showcase your skills through coding challenges and get noticed by top employers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <button 
                  onClick={() => navigate('/auth')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                >
                  Get Started
                </button>
                <Link
                  to="/leaderboard"
                  className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg text-center"
                >
                  View Leaderboard
                </Link>
              </>
            ) : (
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-4">
                  Welcome back, <span className="font-semibold text-blue-600">{user.name}</span>! 
                  Use the navigation above to access your dashboard and features.
                </p>
                <Link
                  to={user.role === 'student' ? '/student' : '/company'}
                  className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center hover:shadow-xl transition">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Coding Challenges</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Solve real-world coding problems posted by companies looking for talent. 
              Showcase your programming skills and problem-solving abilities.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center hover:shadow-xl transition">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Skill Assessment</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Get your solutions reviewed and scored by industry professionals. 
              Receive valuable feedback to improve your coding skills.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center hover:shadow-xl transition">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Career Opportunities</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Connect directly with hiring companies. Top performers get noticed 
              and invited for interviews at leading tech companies.
            </p>
          </div>
        </div>

        {/* Public Leaderboards Section */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {/* Top Students Leaderboard */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-600">🏆 Top Students</h3>
              <Link
                to="/leaderboard"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                // Loading state
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border animate-pulse">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats.topStudents && stats.topStudents.length > 0 ? (
                // Actual data
                stats.topStudents.map((student) => {
                  const styles = getRankBadgeStyles(student.rank);
                  return (
                    <div key={student._id} className={`flex items-center space-x-4 p-3 rounded-lg border ${styles.container}`}>
                      <div className={`w-8 h-8 ${styles.badge} text-white rounded-full flex items-center justify-center font-bold text-sm`}>
                        {student.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{student.name}</div>
                        <div className="text-sm text-gray-600">@{student.username}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${styles.points}`}>{student.totalPoints || 0} pts</div>
                        <div className="text-xs text-gray-500">{student.challengesCompleted || 0} challenges</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // No data state
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No students yet</p>
                  <p className="text-gray-400 text-xs">Be the first to compete!</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Join {!user ? 'now' : 'the competition'} to see your name here!
              </p>
            </div>
          </div>

          {/* Top Companies Leaderboard */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-600">🏢 Active Companies</h3>
              <Link
                to="/leaderboard?type=companies"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                // Loading state
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border animate-pulse">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats.activeCompanies && stats.activeCompanies.length > 0 ? (
                // Actual data
                stats.activeCompanies.map((company) => {
                  const styles = getRankBadgeStyles(company.rank);
                  
                  return (
                    <div key={company._id} className={`flex items-center space-x-4 p-3 rounded-lg border ${styles.container}`}>
                      <div className={`w-8 h-8 ${styles.badge} text-white rounded-full flex items-center justify-center font-bold text-sm`}>
                        {company.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{company.name}</div>
                        <div className="text-sm text-gray-600">Active Company</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${styles.points}`}>{company.challengeCount} challenges</div>
                        <div className="text-xs text-gray-500">Active now</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // No data state
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No companies yet</p>
                  <p className="text-gray-400 text-xs">Companies will appear here when they create challenges</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Companies looking for top talent right now
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-12">How LinkUp Works</h2>
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* For Students */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-6">For Students</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Browse Challenges</h4>
                    <p className="text-gray-600 text-sm">Explore coding challenges posted by companies across various difficulties and technologies</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Submit Solutions</h4>
                    <p className="text-gray-600 text-sm">Write and submit your best code solutions via GitHub repositories</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Get Reviewed</h4>
                    <p className="text-gray-600 text-sm">Receive scores and detailed feedback from company reviewers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Climb the Leaderboard</h4>
                    <p className="text-gray-600 text-sm">Earn points and compete with peers to showcase your skills</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Companies */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-purple-600 mb-6">For Companies</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Post Challenges</h4>
                    <p className="text-gray-600 text-sm">Create coding challenges relevant to your hiring needs and technology stack</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Review Submissions</h4>
                    <p className="text-gray-600 text-sm">Evaluate student solutions, provide scores and constructive feedback</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Identify Talent</h4>
                    <p className="text-gray-600 text-sm">Discover skilled developers through their actual code and problem-solving approach</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Hire the Best</h4>
                    <p className="text-gray-600 text-sm">Connect with top performers and build your development team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6 sm:mb-8">Platform Statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {loading ? (
                  <div className="h-9 bg-blue-200 rounded animate-pulse mx-auto w-16"></div>
                ) : (
                  `${stats.totalStudents || 0}+`
                )}
              </div>
              <div className="text-gray-600">Active Students</div>
              <div className="text-sm text-gray-500 mt-1">Growing every day</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {loading ? (
                  <div className="h-9 bg-purple-200 rounded animate-pulse mx-auto w-16"></div>
                ) : (
                  `${stats.totalCompanies || 0}+`
                )}
              </div>
              <div className="text-gray-600">Partner Companies</div>
              <div className="text-sm text-gray-500 mt-1">From startups to enterprises</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {loading ? (
                  <div className="h-9 bg-purple-200 rounded animate-pulse mx-auto w-16"></div>
                ) : (
                  `${stats.totalChallenges || 0}+`
                )}
              </div>
              <div className="text-gray-600">Active Challenges</div>
              <div className="text-sm text-gray-500 mt-1">Real-world problems to solve</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {loading ? (
                  <div className="h-9 bg-orange-200 rounded animate-pulse mx-auto w-16"></div>
                ) : (
                  `${stats.completedSubmissions || 0}+`
                )}
              </div>
              <div className="text-gray-600">Completed Solutions</div>
              <div className="text-sm text-gray-500 mt-1">Solutions reviewed and scored</div>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6 sm:mb-8">Why Choose LinkUp?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Real-time Scoring</h4>
                <p className="text-gray-600 text-sm">Get immediate feedback on your submissions with detailed scoring</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Competitive Leaderboard</h4>
                <p className="text-gray-600 text-sm">Track your progress and compete with other developers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Skill-based Matching</h4>
                <p className="text-gray-600 text-sm">Companies find developers with the exact skills they need</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Tagged Challenges</h4>
                <p className="text-gray-600 text-sm">Filter by technology, difficulty, and company to find perfect matches</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">GitHub Integration</h4>
                <p className="text-gray-600 text-sm">Submit solutions directly from your GitHub repositories</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Deadline Management</h4>
                <p className="text-gray-600 text-sm">Clear deadlines and time management for all challenges</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 rounded-xl shadow-lg p-8 sm:p-12 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
            Join thousands of students and companies already using LinkUp to connect talent with opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <button 
                  onClick={() => navigate('/auth')}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
                >
                  Sign Up Now
                </button>
                <Link
                  to="/leaderboard"
                  className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition shadow-lg text-center"
                >
                  View Leaderboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={user.role === 'student' ? '/student' : '/company'}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg text-center"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition shadow-lg text-center"
                >
                  View Profile
                </Link>
              </>
            )}
          </div>
          
          {/* Quick Stats in CTA */}
          <div className="mt-8 pt-8 border-t border-blue-400 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold">Easy to Start</div>
              <div className="text-sm opacity-80">No setup required</div>
            </div>
            <div>
              <div className="text-lg font-bold">Real Projects</div>
              <div className="text-sm opacity-80">Industry-relevant</div>
            </div>
            <div>
              <div className="text-lg font-bold">Expert Review</div>
              <div className="text-sm opacity-80">Professional feedback</div>
            </div>
            <div>
              <div className="text-lg font-bold">Career Growth</div>
              <div className="text-sm opacity-80">Direct connections</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}