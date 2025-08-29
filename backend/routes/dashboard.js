// routes/dashboard.js
const express = require('express');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const Activity = require('../models/Activity');

const { authMiddleware } = require('../middleware/authMiddleware'); // Correct import

const router = express.Router();

// Get dashboard stats
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user submissions
    const userSubmissions = await Submission.find({ user: userId });
    const reviewedSubmissions = userSubmissions.filter(s => s.status === 'reviewed');

    // Calculate average score
    const averageScore = reviewedSubmissions.length > 0
      ? reviewedSubmissions.reduce((acc, s) => acc + s.score, 0) / reviewedSubmissions.length
      : 0;

    // Get recent activities
    const recentActivity = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get total challenges count
    const totalChallenges = await Challenge.countDocuments({ isActive: true });

    // Calculate rank (simplified)
    const allUsers = await User.find({ role: 'student' }).select('stats');
    const userRank = allUsers
      .sort((a, b) => b.stats.totalPoints - a.stats.totalPoints)
      .findIndex(u => u._id.toString() === userId.toString()) + 1;

    const stats = {
      totalChallenges,
      completedChallenges: reviewedSubmissions.length,
      averageScore: Math.round(averageScore),
      rank: userRank,
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        type: activity.type,
        title: activity.title,
        date: activity.createdAt.toISOString().split('T')[0],
        score: activity.metadata?.score,
        company: activity.metadata?.company
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get performance analytics
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get submissions over time
    const submissions = await Submission.find({ user: userId })
      .populate('challenge', 'title points')
      .sort({ createdAt: 1 });

    const performanceData = submissions.map((submission, index) => ({
      submission: index + 1,
      score: submission.score || 0,
      date: submission.createdAt.toISOString().split('T')[0],
      challengeTitle: submission.challenge?.title,
      points: submission.challenge?.points
    }));

    // Calculate skill progression
    const skillBreakdown = {};
    const challengesWithSubmissions = await Challenge.find({
      _id: { $in: submissions.map(s => s.challenge) }
    });

    challengesWithSubmissions.forEach(challenge => {
      challenge.tags.forEach(tag => {
        if (!skillBreakdown[tag]) {
          skillBreakdown[tag] = { attempts: 0, totalScore: 0, averageScore: 0 };
        }
        const submission = submissions.find(s => s.challenge.toString() === challenge._id.toString());
        if (submission && submission.score) {
          skillBreakdown[tag].attempts++;
          skillBreakdown[tag].totalScore += submission.score;
          skillBreakdown[tag].averageScore = skillBreakdown[tag].totalScore / skillBreakdown[tag].attempts;
        }
      });
    });

    res.json({
      performanceData,
      skillBreakdown: Object.entries(skillBreakdown).map(([skill, data]) => ({
        skill,
        ...data,
        averageScore: Math.round(data.averageScore)
      }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
