// controllers/leaderboardController.js (Separate controller for leaderboard)
const User = require('../models/User');
const Submission = require('../models/Submission');

// @desc    Get leaderboard with various filters
// @route   GET /api/leaderboard
// @access  Private
const getDetailedLeaderboard = async (req, res) => {
  try {
    const { 
      timeframe = 'all', 
      limit = 500, 
      role,
      minChallenges = 0 
    } = req.query;
    
    let dateFilter = {};
    let baseFilter = { 
      isActive: true,
      role: 'student', // Only show students in leaderboard by default
      challengesCompleted: { $gte: parseInt(minChallenges) }
    };

    // Override role filter if explicitly specified (for admin purposes)
    if (role && ['student', 'company'].includes(role)) {
      baseFilter.role = role;
    }
    
    // Add timeframe filter
    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter.lastActiveAt = { $gte: oneWeekAgo };
    } else if (timeframe === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter.lastActiveAt = { $gte: oneMonthAgo };
    }
    
    const users = await User.find({
      ...baseFilter,
      ...dateFilter
    })
    .sort({ totalPoints: -1, challengesCompleted: -1, averageScore: -1 })
    .limit(parseInt(limit))
    .select('-password')
    .lean();

    // Add rank to each user
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Get statistics (only for students)
    const totalParticipants = await User.countDocuments({ isActive: true, role: 'student' });
    const totalChallengesCompleted = await Submission.countDocuments({ 
      status: 'approved',
      user: { $in: await User.find({ role: 'student' }).distinct('_id') }
    });
    
    const avgCommunityScore = users.length > 0 
      ? Math.round(users.reduce((sum, user) => sum + user.averageScore, 0) / users.length)
      : 0;

    res.json({
      success: true,
      data: rankedUsers,
      stats: {
        totalParticipants,
        totalChallengesCompleted,
        avgCommunityScore,
        timeframe,
        filteredCount: rankedUsers.length
      }
    });

  } catch (error) {
    console.error('Get detailed leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching leaderboard'
    });
  }
};

// @desc    Get user's rank in leaderboard
// @route   GET /api/leaderboard/rank/:userId
// @access  Private
const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'all' } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get all students above this user's points (only students should be ranked)
    let dateFilter = {};
    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter.lastActiveAt = { $gte: oneWeekAgo };
    } else if (timeframe === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter.lastActiveAt = { $gte: oneMonthAgo };
    }

    // Only rank among students
    const usersAbove = await User.countDocuments({
      isActive: true,
      role: 'student',
      totalPoints: { $gt: user.totalPoints },
      ...dateFilter
    });

    const rank = usersAbove + 1;

    res.json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        rank,
        totalPoints: user.totalPoints,
        timeframe
      }
    });

  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user rank'
    });
  }
};

// @desc    Update user achievements
// @route   POST /api/leaderboard/achievement
// @access  Private (Admin only)
const addAchievement = async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    
    if (!userId || !title) {
      return res.status(400).json({
        success: false,
        error: 'User ID and achievement title are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if achievement already exists
    const existingAchievement = user.achievements.find(ach => ach.title === title);
    if (existingAchievement) {
      return res.status(400).json({
        success: false,
        error: 'User already has this achievement'
      });
    }

    user.achievements.push({
      title,
      description: description || '',
      earnedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Achievement added successfully',
      achievement: user.achievements[user.achievements.length - 1]
    });

  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding achievement'
    });
  }
};

module.exports = {
  getDetailedLeaderboard,
  getUserRank,
  addAchievement
};
