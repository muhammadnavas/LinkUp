import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChallenges } from '../api';

export default function ChallengesPage() {
  const navigate = useNavigate();
  
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: '',
    company: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const challengesRes = await getChallenges();
      
      if (challengesRes.success) {
        const challengesData = challengesRes.data || challengesRes;
        setChallenges(challengesData);
        
        // Extract unique companies for filter dropdown
        const uniqueCompanies = [...new Set(challengesData.map(c => c.company).filter(Boolean))];
        setCompanies(uniqueCompanies);
      } else {
        setError('Failed to load challenges');
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...challenges];
    
    if (filters.difficulty && filters.difficulty !== '') {
      filtered = filtered.filter(challenge => challenge.difficulty === filters.difficulty);
    }
    
    if (filters.company && filters.company !== '') {
      filtered = filtered.filter(challenge => challenge.company === filters.company);
    }
    
    setFilteredChallenges(filtered);
  }, [challenges, filters]);

  useEffect(() => {
    // Apply filters whenever challenges or filters change
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleChallengeClick = (challengeId) => {
    navigate(`/challenge/${challengeId}`);
  };

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
          <p className="mt-4 text-gray-600">Loading challenges...</p>
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Challenges</h1>
            <p className="text-gray-600">Discover and solve coding challenges from top companies</p>
          </div>
          
          {/* Filters */}
          <div className="flex space-x-4">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map((company, index) => (
                <option key={index} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredChallenges.length} of {challenges.length} challenges
            {(filters.difficulty || filters.company) && (
              <button
                onClick={() => setFilters({ difficulty: '', company: '' })}
                className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>

        {/* Challenges Grid */}
        <div className="grid gap-6">
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge) => (
              <div key={challenge._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{challenge.title}</h3>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Company:</span> {challenge.company}
                    </p>
                    <p className="text-gray-700 line-clamp-2">{challenge.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {challenge.points} points
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📅 Due: {new Date(challenge.deadline).toLocaleDateString()}</span>
                    {challenge.submissionCount && (
                      <span>👥 {challenge.submissionCount} submissions</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleChallengeClick(challenge._id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Start Challenge
                  </button>
                </div>
                
                {challenge.tags && challenge.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {challenge.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {challenges.length === 0 ? 'No Challenges Available' : 'No Challenges Match Your Filters'}
              </h3>
              <p className="text-gray-600">
                {challenges.length === 0 
                  ? 'Check back later for new coding challenges!' 
                  : 'Try adjusting your filters to see more challenges.'
                }
              </p>
              {filteredChallenges.length === 0 && challenges.length > 0 && (
                <button
                  onClick={() => setFilters({ difficulty: '', company: '' })}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
