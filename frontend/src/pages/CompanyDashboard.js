import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChallenges, getCompanySubmissions } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalChallenges: 0,
    totalSubmissions: 0,
    pendingReviews: 0,
    reviewedChallenges: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is actually a company before fetching company data
      if (!user || user.role !== 'company') {
        setError('Access denied. Please log in as a company.');
        setLoading(false);
        return;
      }

      // Fetch company's challenges
      const challengesRes = await getChallenges();
      let companyChallenges = [];
      if (challengesRes.success) {
        // Filter challenges created by this company (compare as strings)
        companyChallenges = challengesRes.data.filter(challenge => {
          const ownerId = typeof challenge.companyId === 'object'
            ? challenge.companyId?._id
            : challenge.companyId;
          return ownerId && String(ownerId) === String(user.id);
        });
      }

      // Fetch company submissions directly
      const submissionsRes = await getCompanySubmissions('all', 1, 50);
      let allSubmissions = [];
      if (submissionsRes.success) {
        allSubmissions = submissionsRes.data || [];

        // Load every page so dashboard totals and reviewed-challenge counts are accurate.
        const totalPages = submissionsRes.pagination?.totalPages || 1;
        for (let page = 2; page <= totalPages; page += 1) {
          const pageRes = await getCompanySubmissions('all', page, 50);
          if (pageRes.success && Array.isArray(pageRes.data)) {
            allSubmissions = allSubmissions.concat(pageRes.data);
          }
        }
      }

      // Calculate reviewed challenges (challenges that have at least one reviewed submission)
      const challengesWithReviews = new Set();
      allSubmissions.forEach(submission => {
        if (submission.status === 'approved' || submission.status === 'rejected') {
          challengesWithReviews.add(submission.challenge._id || submission.challenge);
        }
      });
      
      setStats({
        totalChallenges: companyChallenges.length,
        totalSubmissions: allSubmissions.length,
        pendingReviews: allSubmissions.filter(s => s.status === 'pending' || s.status === 'reviewing').length,
        reviewedChallenges: challengesWithReviews.size,
        recentActivity: allSubmissions.slice(0, 5)
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Redirect if user is not a company
    if (user && user.role !== 'company') {
      navigate('/student');
      return;
    }
    fetchDashboardData();
  }, [fetchDashboardData, user, navigate]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'reviewing': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Company Dashboard - {user?.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your challenges and review student submissions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Challenges</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalChallenges}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingReviews}</p>
                <p className="text-xs text-orange-600">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviewed Challenges</p>
                <p className="text-2xl font-bold text-gray-800">{stats.reviewedChallenges}</p>
                <p className="text-xs text-purple-600">Challenges with reviews</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Submissions</h2>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800">{activity.challenge?.title || 'Challenge submission'}</h3>
                      <p className="text-xs text-gray-600 mt-1">Student: {activity.user?.name || activity.user?.username || 'Unknown student'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.submittedAt && !Number.isNaN(new Date(activity.submittedAt).getTime())
                          ? `Submitted ${new Date(activity.submittedAt).toLocaleString()}`
                          : 'Submission date unavailable'}
                      </p>
                      {activity.viewedAt && (
                        <p className="text-xs text-cyan-700 mt-1">Opened by company</p>
                      )}
                      <div className="flex items-center justify-between gap-3 mt-2">
                        <div className="flex items-center space-x-2">
                          {activity.status && getStatusBadge(activity.status)}
                        </div>
                        <span className="text-xs font-medium text-blue-600">Open submission →</span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500">No recent submissions</p>
                  <p className="text-gray-400 text-sm mt-1">Create challenges to start receiving submissions</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/create-challenge')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Create New Challenge
              </button>
              <button 
                onClick={() => navigate('/manage-challenges')}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                Manage Challenges
              </button>
              <button 
                onClick={() => navigate('/review-submissions')}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
              >
                Review Submissions
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
