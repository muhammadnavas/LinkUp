// src/pages/ProfilePage.js
import { motion } from 'framer-motion';
import {
    Award,
    Calendar,
    Edit3,
    ExternalLink,
    FileText,
    MapPin,
    Save,
    Star,
    Trophy,
    User,
    X
} from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getChallenges, getUserProfile, getUserSubmissions, updateUserProfile } from '../api';
import { AuthContext } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user: authUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [companyStats, setCompanyStats] = useState({ challengesCreated: 0, submissionsReviewed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    githubProfile: '',
    linkedinProfile: ''
  });

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching profile and submissions data...');
      
      const [profileResponse, submissionsResponse] = await Promise.all([
        getUserProfile(),
        getUserSubmissions()
      ]);
      
      console.log('Profile response:', profileResponse);
      console.log('Submissions response:', submissionsResponse);
      
      const profileData = profileResponse.data || profileResponse;
      const submissionsData = submissionsResponse.data || submissionsResponse;
      
      setProfile(profileData);
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
      
      // If user is a company, fetch their challenges to calculate stats
      if (profileData.role === 'company') {
        try {
          const challengesResponse = await getChallenges();
          if (challengesResponse.success) {
            // Filter challenges created by this company
            const companyChallenges = challengesResponse.data.filter(c => 
              c.companyId && String(c.companyId._id) === String(authUser.id)
            );
            console.log('Company challenges:', companyChallenges);
            
            setCompanyStats({
              challengesCreated: companyChallenges.length,
              submissionsReviewed: profileData.submissionsReviewed || 0
            });
          }
        } catch (challengeError) {
          console.error('Error fetching company challenges:', challengeError);
          // Don't fail the entire page if challenges can't be fetched
          setCompanyStats({
            challengesCreated: 0,
            submissionsReviewed: profileData.submissionsReviewed || 0
          });
        }
      }
      
      // Set edit data
      setEditData({
        username: profileData.username || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        githubProfile: profileData.githubProfile || '',
        linkedinProfile: profileData.linkedinProfile || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError('');
      
      // Clean the data before sending
      const cleanedData = {
        username: editData.username?.trim() || '',
        email: editData.email?.trim() || '',
        bio: editData.bio?.trim() || '',
        location: editData.location?.trim() || '',
        website: editData.website?.trim() || '',
        githubProfile: editData.githubProfile?.trim() || '',
        linkedinProfile: editData.linkedinProfile?.trim() || ''
      };
      
      // Remove empty strings to avoid validation issues
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '') {
          delete cleanedData[key];
        }
      });
      
      console.log('Saving profile with data:', cleanedData);
      
      const response = await updateUserProfile(cleanedData);
      console.log('Profile update response:', response);
      
      const updatedProfile = response.data || response;
      
      setProfile(updatedProfile);
      setIsEditing(false);
      
      console.log('Profile update successful');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setUpdating(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateStats = () => {
    const approved = submissions.filter(s => s.status === 'approved').length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const totalScore = submissions
      .filter(s => s.score !== null && s.score !== undefined)
      .reduce((sum, s) => sum + s.score, 0);
    const avgScore = approved > 0 ? Math.round(totalScore / approved) : 0;
    
    return { approved, pending, avgScore, totalSubmissions: submissions.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                {!isEditing ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {profile?.username || 'User'}
                    </h2>
                    <p className="text-gray-600 mb-2">{profile?.email}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      profile?.role === 'company' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {profile?.role === 'company' ? 'Company' : 'Student'}
                    </span>
                  </>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Username"
                    />
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Email"
                    />
                  </div>
                )}
              </div>

              {/* Company-specific info */}
              {!isEditing && profile?.role === 'company' ? (
                <>
                  {profile?.bio && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">About Company</h4>
                      <p className="text-gray-700 text-sm">{profile.bio}</p>
                    </div>
                  )}
                  <div className="space-y-3 text-sm">
                    {profile?.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {profile.location}
                      </div>
                    )}
                    {profile?.website && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-gray-600" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">Website</a>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {formatDate(profile?.createdAt)}
                    </div>
                  </div>
                </>
              ) : null}

              {/* Student-specific info */}
              {!isEditing && profile?.role !== 'company' ? (
                <>
                  {profile?.bio && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                      <p className="text-gray-700 text-sm">{profile.bio}</p>
                    </div>
                  )}
                  <div className="space-y-3 text-sm">
                    {profile?.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {profile.location}
                      </div>
                    )}
                    {profile?.website && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-gray-600" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">Website</a>
                      </div>
                    )}
                    {profile?.githubProfile && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-gray-600" />
                        <a href={profile.githubProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">GitHub Profile</a>
                      </div>
                    )}
                    {profile?.linkedinProfile && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-gray-600" />
                        <a href={profile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">LinkedIn Profile</a>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {formatDate(profile?.createdAt)}
                    </div>
                  </div>
                </>
              ) : null}

              {isEditing && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder={profile?.role === 'company' ? 'About your company...' : 'Tell us about yourself...'}
                  />
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Location"
                  />
                  <input
                    type="url"
                    value={editData.website}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Website URL"
                  />
                  {profile?.role !== 'company' && (
                    <>
                      <input
                        type="url"
                        value={editData.githubProfile}
                        onChange={(e) => setEditData({ ...editData, githubProfile: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="GitHub Profile URL"
                      />
                      <input
                        type="url"
                        value={editData.linkedinProfile}
                        onChange={(e) => setEditData({ ...editData, linkedinProfile: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="LinkedIn Profile URL"
                      />
                    </>
                  )}
                </form>
              )}

              <div className="mt-6 flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={handleEditToggle}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={updating}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>

            {/* Stats Cards */}
            {profile?.role === 'company' ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{companyStats.challengesCreated}</div>
                  <p className="text-gray-600 text-sm">Challenges Created</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{companyStats.submissionsReviewed}</div>
                  <p className="text-gray-600 text-sm">Submissions Reviewed</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{stats.approved}</div>
                  <p className="text-gray-600 text-sm">Completed</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{stats.avgScore}</div>
                  <p className="text-gray-600 text-sm">Avg Score</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{stats.totalSubmissions}</div>
                  <p className="text-gray-600 text-sm">Total</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{profile?.totalPoints || 0}</div>
                  <p className="text-gray-600 text-sm">Points</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity - Different for Companies vs Students */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {profile?.role === 'company' ? 'Company Activity' : 'Recent Submissions'}
                </h3>
                {profile?.role !== 'company' && (
                  <Link
                    to="/submissions"
                    className="text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium"
                  >
                    View All →
                  </Link>
                )}
              </div>

              {profile?.role === 'company' ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Company Dashboard</h4>
                  <p className="text-gray-600 mb-4">Manage your challenges and review submissions from your company dashboard.</p>
                  <Link
                    to="/company"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h4>
                  <p className="text-gray-600 mb-4">Start solving challenges to see your progress here!</p>
                  <Link
                    to="/challenges"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Browse Challenges
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission, index) => (
                    <motion.div
                      key={submission._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {submission.challenge?.title || 'Unknown Challenge'}
                          </h4>
                          <div className="flex items-center text-gray-500 text-sm space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(submission.submittedAt)}
                            </span>
                            {submission.challenge?.difficulty && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                submission.challenge.difficulty === 'easy' 
                                  ? 'bg-green-100 text-green-600'
                                  : submission.challenge.difficulty === 'medium'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {submission.challenge.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {submission.score !== null && submission.score !== undefined && (
                            <div className="flex items-center text-purple-600">
                              <Star className="w-4 h-4 mr-1" />
                              <span className="font-semibold">{submission.score}</span>
                            </div>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                              submission.status
                            )}`}
                          >
                            {submission.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Achievements - Only for Students */}
            {profile?.role !== 'company' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
                
                {profile?.achievements && profile.achievements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white"
                      >
                        <div className="flex items-center">
                          <Trophy className="w-6 h-6 mr-3" />
                          <div>
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-yellow-100 text-sm">{achievement.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h4>
                    <p className="text-gray-600">Complete challenges to unlock achievements!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Activity Timeline - Different for Companies vs Students */}
            {profile?.role !== 'company' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Activity Timeline</h3>
                
                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.slice(0, 10).map((submission, index) => (
                      <div key={submission._id} className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            Submitted solution for{' '}
                            <span className="font-medium">
                              {submission.challenge?.title || 'Unknown Challenge'}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            submission.status
                          )}`}
                        >
                          {submission.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h4>
                    <p className="text-gray-600">Your challenge activity will appear here.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;