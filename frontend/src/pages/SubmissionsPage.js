// src/pages/SubmissionsPage.js - Corrected version
import { motion } from 'framer-motion';
import { Calendar, Clock, ExternalLink, FileText, Trophy, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getChallenge, getChallengeSubmissions, getUserSubmissions } from '../api';

const SubmissionsPage = () => {
  const { challengeId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchSubmissions = useCallback(async () => {
    try {
      let response;
      if (challengeId) {
        // Fetch submissions for a specific challenge (company view)
        response = await getChallengeSubmissions(challengeId);
      } else {
        // Fetch user's own submissions (student view)
        response = await getUserSubmissions();
      }

      // Handle both response formats
      const submissionsData = response.data || response;
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw new Error('Failed to fetch submissions: ' + error.message);
    }
  }, [challengeId]);

  const fetchChallenge = useCallback(async () => {
    try {
      if (!challengeId) return;

      const response = await getChallenge(challengeId);
      // Handle both response formats
      const challengeData = response.data || response;
      setChallenge(challengeData);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      // Don't throw here - challenge details are optional
      console.warn('Could not fetch challenge details, but continuing...');
    }
  }, [challengeId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch submissions first
      await fetchSubmissions();

      // Only fetch challenge details if challengeId is provided
      if (challengeId) {
        await fetchChallenge();
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [challengeId, fetchSubmissions, fetchChallenge]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSubmissions = submissions.filter((submission) => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {challengeId ? 'Challenge Submissions' : 'My Submissions'}
              </h1>
              {challenge && (
                <div className="flex items-center text-gray-600 mb-4">
                  <FileText className="w-5 h-5 mr-2" />
                  <span className="text-lg">{challenge.title}</span>
                </div>
              )}
            </div>
            {challengeId && (
              <Link
                to={`/challenges/${challengeId}`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Challenge
              </Link>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mt-4">
            {['all', 'pending', 'reviewing', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex-1 py-2 px-3 rounded-md font-medium capitalize transition-colors ${
                  filter === status
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {!challengeId && status === 'pending' ? 'Submitted' : status} (
                {submissions.filter(
                  (s) => status === 'all' || s.status === status
                ).length}
                )
              </button>
            ))}
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

        {/* Submissions List */}
        <div className="space-y-6">
          {filteredSubmissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No submissions found
              </h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? 'No submissions have been made yet.'
                  : `No ${filter} submissions found.`}
              </p>
            </motion.div>
          ) : (
            filteredSubmissions.map((submission, index) => (
              <motion.div
                key={submission._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {submission.user?.name || submission.user?.username || submission.user?.email || 'You'}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(submission.submittedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {submission.score !== undefined && 
                        submission.score !== null &&
                        submission.status === 'approved' && (
                          <div className="flex items-center text-green-600">
                            <Trophy className="w-4 h-4 mr-1" />
                            <span className="font-semibold">
                              {submission.score}/100
                            </span>
                          </div>
                        )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                          submission.status
                        )}`}
                      >
                        {!challengeId && submission.status === 'pending' ? (submission.viewedAt ? 'Viewed by company' : 'Submitted') : submission.status}
                      </span>
                    </div>
                  </div>

                  {/* Challenge Info (for user submissions view) */}
                  {!challengeId && submission.challenge && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-900 mb-1">Challenge</h4>
                      <p className="text-blue-800 font-medium">{submission.challenge.title}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-blue-700 text-sm mt-2">
                        {submission.challenge.company && <span>Company: {submission.challenge.company}</span>}
                        {submission.challenge.difficulty && <span>Difficulty: {submission.challenge.difficulty}</span>}
                        {submission.challenge.points != null && <span className="font-medium">{submission.challenge.points} points</span>}
                      </div>
                    </div>
                  )}

                  {/* Submission Content */}
                  {/* Older submissions stored the GitHub URL in the solution field. */}
                  {submission.solution && !/^https?:\/\//i.test(submission.solution) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Solution</h4>
                      <p className="text-gray-700 whitespace-pre-wrap break-words">{submission.solution}</p>
                    </div>
                  )}

                  {(submission.repoLink || /^https?:\/\//i.test(submission.solution || '')) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">GitHub Repository</h4>
                      <a
                        href={submission.repoLink || submission.solution}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors break-all"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        {submission.repoLink || submission.solution}
                      </a>
                    </div>
                  )}

                  {/* Code Submission */}
                  {submission.codeSubmission && (
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-white mb-2">Code:</h4>
                      <pre className="text-green-400 text-sm overflow-x-auto">
                        <code>{submission.codeSubmission}</code>
                      </pre>
                    </div>
                  )}

                  {/* File Attachments */}
                  {submission.fileAttachments &&
                    submission.fileAttachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Attachments:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {submission.fileAttachments.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              {file.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  {!challengeId && submission.status === 'pending' && (
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                      <p className="text-sm text-gray-600">
                        {submission.viewedAt
                          ? 'The company has opened this submission. Editing is locked.'
                          : 'The company has not opened this submission yet. You can still edit it.'}
                      </p>
                      {!submission.viewedAt && submission.challenge?._id && (
                        <Link
                          to={`/challenge/${submission.challenge._id}`}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Edit Submission
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Feedback */}
                  {submission.feedback && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        Reviewer Feedback:
                      </h4>
                      <p className="text-yellow-800">{submission.feedback}</p>
                      {submission.reviewedAt && (
                        <div className="flex items-center text-yellow-600 text-sm mt-2">
                          <Clock className="w-4 h-4 mr-1" />
                          Reviewed on {formatDate(submission.reviewedAt)}
                        </div>
                      )}
                      {submission.reviewedBy && (
                        <div className="text-yellow-600 text-sm">
                          Reviewed by: {submission.reviewedBy.username || 'Admin'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons for company view */}
                  {challengeId && submission.status === 'pending' && (
                    <div className="flex space-x-3 mt-4 pt-4 border-t">
                      <Link
                        to={`/submissions/${submission._id}/review`}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Review Submission
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Back to Challenges Button */}
        {!challengeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <Link
              to="/challenges"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Browse More Challenges
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;