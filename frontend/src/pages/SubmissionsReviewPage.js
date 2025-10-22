// src/pages/SubmissionsReviewPage.js - Complete implementation
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CheckCircle, Clock, ExternalLink, FileText, Save, Star, User, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getSubmissionForReview, reviewSubmission } from '../api';

const SubmissionsReviewPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: '',
    score: '',
    feedback: ''
  });

  const fetchSubmission = useCallback(async () => {
    try {
      setLoading(true);
      if (!submissionId) {
        setError('No submission ID provided.');
        setSubmission(null);
        return;
      }
      const response = await getSubmissionForReview(submissionId);
      const submissionData = response.data || response;
      if (!submissionData || !submissionData._id) {
        setError('Submission not found or you do not have permission to view it.');
        setSubmission(null);
        return;
      }
      setSubmission(submissionData);
      // Pre-fill existing review data if any
      if (submissionData.status !== 'pending') {
        setReviewData({
          status: submissionData.status,
          score: submissionData.score || '',
          feedback: submissionData.feedback || ''
        });
      }
    } catch (error) {
      setError('Failed to fetch submission details: ' + (error.message || error));
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Check if submission has already been reviewed
    if (submission.status === 'approved' || submission.status === 'rejected') {
      setError('This submission has already been reviewed and cannot be changed.');
      return;
    }
    
    if (!reviewData.status) {
      setError('Please select a review status');
      return;
    }

    if (reviewData.status === 'approved' && (!reviewData.score || reviewData.score < 0 || reviewData.score > 100)) {
      setError('Please provide a valid score (0-100) for approved submissions');
      return;
    }

    try {
      setReviewing(true);
      setError('');

      const reviewPayload = {
        status: reviewData.status,
        feedback: reviewData.feedback,
        ...(reviewData.status === 'approved' && { score: parseInt(reviewData.score) })
      };

      const response = await reviewSubmission(submissionId, reviewPayload);
      const updatedSubmission = response.data || response;
      
      setSubmission(updatedSubmission);
      
      // Navigate back to submissions list after successful review
      setTimeout(() => {
        navigate('/review-submissions');
      }, 1500);
      
    } catch (error) {
      console.error('Error reviewing submission:', error);
      setError('Failed to submit review: ' + error.message);
    } finally {
      setReviewing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!submission && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || "The submission you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Link
            to="/company"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to={`/challenges/${submission.challenge._id}/submissions`}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Review Submission</h1>
                <p className="text-gray-600 mt-1">
                  Challenge: {submission.challenge.title}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                submission.status
              )}`}
            >
              {submission.status}
            </span>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {submission.user?._id ? (
                      <Link 
                        to={`/profile/${submission.user._id}`}
                        className="hover:text-purple-600 transition-colors"
                      >
                        {submission.user?.username || 'Anonymous'}
                      </Link>
                    ) : (
                      submission.user?.username || 'Anonymous'
                    )}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    Submitted on {formatDate(submission.submittedAt)}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Solution</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {submission.solution && submission.solution.match(/^https?:\/\//i) ? (
                  <a
                    href={submission.solution}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors hover:underline break-all"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                    {submission.solution}
                  </a>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {submission.solution}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Repository Link */}
            {submission.repoLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Repository</h3>
                <a
                  href={submission.repoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {submission.repoLink}
                </a>
              </motion.div>
            )}

            {/* Code Submission */}
            {submission.codeSubmission && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Code</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>{submission.codeSubmission}</code>
                  </pre>
                </div>
              </motion.div>
            )}

            {/* File Attachments */}
            {submission.fileAttachments && submission.fileAttachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {submission.fileAttachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {file.name}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Review Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {submission.status === 'approved' || submission.status === 'rejected' 
                  ? 'Review Details' 
                  : 'Review Submission'
                }
              </h3>
              
              {/* Show read-only view for already reviewed submissions */}
              {submission.status === 'approved' || submission.status === 'rejected' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Review Status</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(submission.status)}`}>
                      {submission.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1" />}
                      {submission.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                      {submission.status}
                    </span>
                  </div>
                  
                  {submission.score && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Score</h4>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="text-lg font-bold">{submission.score}/100</span>
                      </div>
                    </div>
                  )}
                  
                  {submission.feedback && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                      <p className="text-gray-700">{submission.feedback}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      to="/review-submissions"
                      className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Submissions
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  {/* Status Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Review Status *
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'reviewing', label: 'Under Review', icon: Clock, color: 'blue' },
                        { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'green' },
                        { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            reviewData.status === option.value
                              ? `border-${option.color}-500 bg-${option.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={option.value}
                            checked={reviewData.status === option.value}
                            onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                            className="sr-only"
                          />
                          <option.icon className={`w-5 h-5 mr-3 ${
                            reviewData.status === option.value ? `text-${option.color}-600` : 'text-gray-400'
                          }`} />
                          <span className={`font-medium ${
                            reviewData.status === option.value ? `text-${option.color}-900` : 'text-gray-700'
                          }`}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Score Input (only for approved) */}
                  {reviewData.status === 'approved' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Score (0-100) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={reviewData.score}
                          onChange={(e) => setReviewData({ ...reviewData, score: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Enter score..."
                          required
                        />
                        <Star className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback {reviewData.status === 'rejected' ? '*' : '(Optional)'}
                    </label>
                    <textarea
                      value={reviewData.feedback}
                      onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder="Provide feedback to the student..."
                      required={reviewData.status === 'rejected'}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={reviewing || !reviewData.status}
                    className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {reviewing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Review...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Previous Review Info */}
              {submission.reviewedAt && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Previous Review</h4>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(submission.reviewedAt)}
                    </div>
                    {submission.reviewedBy && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {submission.reviewedBy.username}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsReviewPage;