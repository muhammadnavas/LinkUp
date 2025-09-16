import { motion } from 'framer-motion';
import { Calendar, Clock, ExternalLink, FileText, Star, User } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanySubmissions, reviewSubmission } from '../api';

const CompanySubmissionsPage = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSubmissions: 0
  });

  const fetchSubmissions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const status = activeTab === 'all' ? 'all' : activeTab;
      const response = await getCompanySubmissions(status, page, 20);
      
      if (response.success) {
        setSubmissions(response.data || []);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalSubmissions: 0
        });
      } else {
        setError(response.error || 'Failed to fetch submissions');
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions: ' + error.message);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleQuickReview = async (submissionId, status, score = null, feedback = '') => {
    try {
      const reviewData = { status, feedback };
      if (status === 'approved' && score !== null) {
        reviewData.score = score;
      }
      
      const result = await reviewSubmission(submissionId, reviewData);
      
      if (result.success) {
        // Refresh the submissions list
        fetchSubmissions(pagination.currentPage);
      } else {
        setError(result.error || 'Failed to review submission');
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      setError('Failed to review submission: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'reviewing': 'bg-blue-100 text-blue-800 border-blue-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusCount = (status) => {
    if (status === 'all') return submissions.length;
    return submissions.filter(s => s.status === status).length;
  };

  const filteredSubmissions = activeTab === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Submissions</h1>
          <p className="text-gray-600">
            Review and evaluate submissions from students for your challenges
          </p>
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: pagination.totalSubmissions },
              { key: 'pending', label: 'Pending', count: getStatusCount('pending') },
              { key: 'reviewing', label: 'In Review', count: getStatusCount('reviewing') },
              { key: 'approved', label: 'Approved', count: getStatusCount('approved') },
              { key: 'rejected', label: 'Rejected', count: getStatusCount('rejected') }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Submissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredSubmissions.length > 0 ? (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div key={submission._id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {submission.challenge?.title || 'Challenge Submission'}
                        </h3>
                        {getStatusBadge(submission.status)}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{submission.user?.username || 'Unknown Student'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>
                        {submission.score && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4" />
                            <span className="font-medium">{submission.score}/100</span>
                          </div>
                        )}
                      </div>

                      {submission.notes && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Student Notes:</span> {submission.notes}
                          </p>
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Your Feedback:</span> {submission.feedback}
                          </p>
                        </div>
                      )}

                      {submission.repoLink && (
                        <div className="mb-4">
                          <a
                            href={submission.repoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View Repository</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        if (submission && submission._id) {
                          navigate(`/submissions/${submission._id}/review`);
                        } else {
                          alert('Submission ID missing. Cannot review this submission.');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                    >
                      <FileText className="w-4 h-4 inline mr-1" />
                      Detailed Review
                    </button>
                    
                    {submission.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleQuickReview(submission._id, 'reviewing')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition text-sm font-medium"
                        >
                          <Clock className="w-4 h-4 inline mr-1" />
                          Start Review
                        </button>
                        <button
                          onClick={() => handleQuickReview(submission._id, 'approved', 85, 'Good solution!')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium"
                        >
                          Quick Approve
                        </button>
                      </>
                    )}
                    
                    {submission.status === 'reviewing' && (
                      <>
                        <button
                          onClick={() => handleQuickReview(submission._id, 'approved', 85, 'Good work!')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleQuickReview(submission._id, 'rejected', null, 'Needs revision')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'all' ? 'No submissions yet' : `No ${activeTab} submissions`}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'all' 
                  ? 'When students submit solutions to your challenges, they\'ll appear here for review'
                  : `No submissions with ${activeTab} status found`
                }
              </p>
              {activeTab === 'all' && (
                <button
                  onClick={() => navigate('/manage-challenges')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  View My Challenges
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchSubmissions(page)}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompanySubmissionsPage;
