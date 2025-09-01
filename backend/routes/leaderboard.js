// routes/leaderboard.js (Updated to use your middleware)
const express = require('express');
const {
  getDetailedLeaderboard,
  getUserRank,
  addAchievement
} = require('../controllers/leaderboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/', getDetailedLeaderboard);

// @route   GET /api/leaderboard/rank/:userId
// @desc    Get specific user's rank
// @access  Private
router.get('/rank/:userId', getUserRank);

// @route   POST /api/leaderboard/achievement
// @desc    Add achievement to user (Company only for now)
// @access  Private (Company)
router.post('/achievement', authorize('company'), addAchievement);

module.exports = router;