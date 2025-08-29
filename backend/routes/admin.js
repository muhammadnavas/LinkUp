// routes/admin.js
const express = require('express');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const Activity = require('../models/Activity');
const emailService = require('../utils/emailService');

const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const requireAdmin = requireRole('admin');

const router = express.Router();

// Get all submissions for review
router.get('/submissions', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ status })
      .populate('user', 'name email')
      .populate('challenge', 'title company points difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments({ status });

    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Review submission
router.put('/submissions/:id/review', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { score, feedback } = req.body;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Valid score (0-100) is required' });
    }

    const submission = await Submission.findById(req.params.id)
      .populate('user')
      .populate('challenge');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Update submission
    submission.status = 'reviewed';
    submission.score = score;
    submission.feedback = feedback;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();

    await submission.save();

    // Update user stats
    const user = await User.findById(submission.user._id);
    const userSubmissions = await Submission.find({
      user: user._id,
      status: 'reviewed'
    }).populate('challenge');

    const totalScore = userSubmissions.reduce((acc, s) => acc + s.score, 0);
    const totalPoints = userSubmissions.reduce((acc, s) =>
      acc + (s.challenge.points * (s.score / 100)), 0);

    user.stats.completedChallenges = userSubmissions.length;
    user.stats.averageScore = Math.round(totalScore / userSubmissions.length);
    user.stats.totalPoints = Math.round(totalPoints);

    await user.save();

    // Create activity
    const activity = new Activity({
      user: submission.user._id,
      type: 'review',
      title: `${submission.challenge.title} Reviewed`,
      metadata: {
        challengeId: submission.challenge._id,
        submissionId: submission._id,
        score: score
      }
    });

    await activity.save();

    // Send notification email
    await emailService.sendReviewNotification(submission.user, submission.challenge, submission);

    res.json({
      message: 'Submission reviewed successfully',
      submission
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

// Get platform analytics
router.get('/analytics', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    switch(timeRange) {
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      case '90d': startDate.setDate(endDate.getDate() - 90); break;
      default: startDate.setDate(endDate.getDate() - 30);
    }

    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalChallenges = await Challenge.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const activeUsers = await Submission.distinct('user', {
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const users = await User.find({ role: 'student' });
    const avgCompletionRate = users.reduce((acc, u) =>
      acc + (u.stats.completedChallenges / totalChallenges), 0) / totalUsers * 100;

    const submissionsByDay = await Submission.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const challengeStats = await Submission.aggregate([
      { $group: { _id: "$challenge", submissions: { $sum: 1 }, averageScore: { $avg: "$score" } } },
      { $lookup: { from: "challenges", localField: "_id", foreignField: "_id", as: "challenge" } },
      { $unwind: "$challenge" },
      { $project: { challengeId: "$_id", title: "$challenge.title", company: "$challenge.company", submissions: 1, averageScore: { $round: ["$averageScore", 1] } } },
      { $sort: { submissions: -1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalChallenges,
        totalSubmissions,
        activeUsers: activeUsers.length,
        averageCompletionRate: Math.round(avgCompletionRate)
      },
      submissionTrends: submissionsByDay.map(item => ({ date: item._id, submissions: item.count })),
      challengePopularity: challengeStats
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get user management data
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = { role: 'student' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ 'stats.totalPoints': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
