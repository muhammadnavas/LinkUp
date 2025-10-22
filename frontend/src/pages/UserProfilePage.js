// src/pages/UserProfilePage.js
import { motion } from 'framer-motion';
import {
    Award,
    Building2,
    Calendar,
    ExternalLink,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    Star,
    Trophy,
    User as UserIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserProfileById } from '../api';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getUserProfileById(userId);
      const profileData = response.data || response;
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile: ' + error.message);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
                  {profile?.role === 'company' ? (
                    <Building2 className="w-12 h-12 text-white" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {profile?.username || 'User'}
                </h2>
                <p className="text-gray-600 mb-2 flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {profile?.email}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.role === 'company' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {profile?.role === 'company' ? 'Company' : 'Student'}
                </span>
              </div>

              {/* Company Profile Info */}
              {profile?.role === 'company' && (
                <>
                  {profile?.companyName && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        Company Name
                      </h4>
                      <p className="text-gray-700 text-sm">{profile.companyName}</p>
                    </div>
                  )}
                  {profile?.industry && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Industry</h4>
                      <p className="text-gray-700 text-sm">{profile.industry}</p>
                    </div>
                  )}
                  {profile?.bio && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
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
              )}

              {/* Student Profile Info */}
              {profile?.role === 'student' && (
                <>
                  {profile?.university && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Education
                      </h4>
                      <p className="text-gray-700 text-sm">{profile.university}</p>
                      {profile?.major && (
                        <p className="text-gray-600 text-sm">Major: {profile.major}</p>
                      )}
                      {profile?.graduationYear && (
                        <p className="text-gray-600 text-sm">Class of {profile.graduationYear}</p>
                      )}
                    </div>
                  )}
                  {profile?.bio && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                      <p className="text-gray-700 text-sm">{profile.bio}</p>
                    </div>
                  )}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
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
                        <a href={profile.githubProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">GitHub</a>
                      </div>
                    )}
                    {profile?.linkedinProfile && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-gray-600" />
                        <a href={profile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">LinkedIn</a>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {formatDate(profile?.createdAt)}
                    </div>
                  </div>
                </>
              )}
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
                  <div className="text-xl font-bold text-gray-900">{profile?.challengesCreated || 0}</div>
                  <p className="text-gray-600 text-sm">Challenges</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{profile?.submissionsReviewed || 0}</div>
                  <p className="text-gray-600 text-sm">Reviews</p>
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
                  <div className="text-xl font-bold text-gray-900">{profile?.challengesCompleted || 0}</div>
                  <p className="text-gray-600 text-sm">Completed</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{profile?.averageScore || 0}</div>
                  <p className="text-gray-600 text-sm">Avg Score</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{profile?.recentSubmissions?.length || 0}</div>
                  <p className="text-gray-600 text-sm">Submissions</p>
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
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {profile?.role === 'company' ? 'Recent Challenges' : 'Recent Submissions'}
                </h3>
              </div>

              {profile?.role === 'company' ? (
                <>
                  {profile?.recentChallenges && profile.recentChallenges.length > 0 ? (
                    <div className="space-y-4">
                      {profile.recentChallenges.map((challenge, index) => (
                        <motion.div
                          key={challenge._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Link
                                to={`/challenge/${challenge._id}`}
                                className="font-semibold text-gray-900 hover:text-purple-600 transition-colors mb-1"
                              >
                                {challenge.title}
                              </Link>
                              <div className="flex items-center text-gray-500 text-sm space-x-4 mt-2">
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(challenge.createdAt)}
                                </span>
                                {challenge.difficulty && (
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                                    {challenge.difficulty}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No challenges created yet</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {profile?.recentSubmissions && profile.recentSubmissions.length > 0 ? (
                    <div className="space-y-4">
                      {profile.recentSubmissions.map((submission, index) => (
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
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(submission.challenge.difficulty)}`}>
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
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No submissions yet</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Achievements - Only for Students */}
            {profile?.role === 'student' && (
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
                    <p className="text-gray-600">No achievements yet</p>
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

export default UserProfilePage;
