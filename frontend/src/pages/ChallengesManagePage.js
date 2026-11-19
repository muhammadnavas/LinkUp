import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChallenges } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function ChallengesManagePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const challengesRes = await getChallenges();
      
      if (challengesRes.success) {
        // Filter challenges created by this company
        const companyChallenges = challengesRes.data.filter(c => 
          c.companyId && String(c.companyId._id) === String(user.id)
        );
        setChallenges(companyChallenges);
      } else {
        setError(challengesRes.message || 'Failed to fetch challenges');
      }
    } catch (error) {
      console.error('Fetch challenges error:', error);
      setError('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your challenges...</p>
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
            onClick={fetchChallenges}
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Challenges</h1>
            <p className="text-gray-600">Manage and track your coding challenges</p>
          </div>
          <button
            onClick={() => navigate('/create-challenge')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Create New Challenge
          </button>
        </div>

        {challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {challenge.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {challenge.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Posted: {new Date(challenge.createdAt).toLocaleDateString()}</span>
                  <span>{challenge.submissionCount || 0} submissions</span>
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {challenge.points} points
                  </span>
                  <span className="text-gray-600">
                    Due: {new Date(challenge.deadline).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/challenge/${challenge._id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/edit-challenge/${challenge._id}`)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/submissions?challenge=${challenge._id}`)}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium"
                  >
                    Submissions
                  </button>
                </div>

                {challenge.tags && challenge.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {challenge.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {challenge.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{challenge.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges yet</h3>
            <p className="text-gray-500 mb-6">Start by creating your first coding challenge</p>
            <button
              onClick={() => navigate('/create-challenge')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Create Your First Challenge
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
