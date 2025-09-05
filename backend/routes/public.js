const express = require('express');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');

const router = express.Router();

// @desc    Get public leaderboard
// @route   GET /api/public/leaderboard
// @access  Public
const getPublicLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'all', limit = 10 } = req.query;
    
    const leaderboard = await User.getLeaderboard(timeframe, parseInt(limit));
    
    // Add rank to each user and filter out sensitive information
    const publicLeaderboard = leaderboard.map((user, index) => ({
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      totalPoints: user.totalPoints,
      challengesCompleted: user.challengesCompleted,
      averageScore: user.averageScore,
      rank: index + 1
    }));

    res.json({
      success: true,
      data: publicLeaderboard,
      timeframe,
      total: publicLeaderboard.length
    });

  } catch (error) {
    console.error('Get public leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching leaderboard'
    });
  }
};

// @desc    Get public statistics
// @route   GET /api/public/stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    // Get counts for different entities
    const [
      totalStudents,
      totalCompanies,
      totalChallenges,
      totalSubmissions,
      completedSubmissions
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'company' }),
      Challenge.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'reviewed' })
    ]);

    // Get top students for additional stats
    const topStudents = await User.getLeaderboard('all', 5);
    
    // Get active companies (companies with challenges)
    const activeChallenges = await Challenge.aggregate([
      {
        $group: {
          _id: '$companyId',
          challengeCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $unwind: '$company'
      },
      {
        $project: {
          _id: '$company._id',
          name: '$company.name',
          companyName: '$company.companyName',
          challengeCount: 1
        }
      },
      {
        $sort: { challengeCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalCompanies,
        totalChallenges,
        totalSubmissions,
        completedSubmissions,
        topStudents: topStudents.slice(0, 3).map((student, index) => ({
          _id: student._id,
          username: student.username,
          name: student.name,
          totalPoints: student.totalPoints,
          challengesCompleted: student.challengesCompleted,
          rank: index + 1
        })),
        activeCompanies: activeChallenges.map((company, index) => ({
          _id: company._id,
          name: company.companyName || company.name,
          challengeCount: company.challengeCount,
          rank: index + 1
        }))
      }
    });

  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching statistics'
    });
  }
};

// Routes
router.get('/leaderboard', getPublicLeaderboard);
router.get('/stats', getPublicStats);

module.exports = router;
