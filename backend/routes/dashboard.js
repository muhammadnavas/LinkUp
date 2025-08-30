// routes/dashboard.js
const express = require('express');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get dashboard stats for students
router.get('/student-stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get all challenges
    const totalChallenges = await Challenge.countDocuments({ isActive: true });

    // Get user's submissions
    const userSubmissions = await Submission.find({ user: req.user._id })
      .populate('challenge', 'title company points difficulty')
      .sort({ submittedAt: -1 });

    // Calculate stats
    const completedSubmissions = userSubmissions.filter(s => 
      s.status === 'accepted' || s.status === 'rejected'
    );

    const pendingSubmissions = userSubmissions.filter(s => 
      s.status === 'pending' || s.status === 'reviewing'
    );

    const scoresArray = userSubmissions
      .filter(s => s.score !== null && s.score !== undefined)
      .map(s => s.score);

    const averageScore = scoresArray.length > 0 
      ? Math.round(scoresArray.reduce((acc, score) => acc + score, 0) / scoresArray.length)
      : 0;

    // Get user rank (simplified - you might want to implement more sophisticated ranking)
    const allUsers = await User.find({ role: 'student' });
    const userRank = Math.floor(Math.random() * allUsers.length) + 1; // Placeholder

    // Format recent activity
    const recentActivity = userSubmissions.slice(0, 5).map(submission => ({
      id: submission._id,
      type: 'submission',
      title: `Submitted solution`,
      challengeTitle: submission.challenge?.title,
      company: submission.challenge?.company,
      date: submission.submittedAt,
      score: submission.score,
      status: submission.status
    }));

    res.json({
      success: true,
      data: {
        totalChallenges,
        completedChallenges: completedSubmissions.length,
        pendingChallenges: pendingSubmissions.length,
        averageScore,
        rank: userRank,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get dashboard stats for companies
router.get('/company-stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'recruiter') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get challenges created by this company
    const companyChallenges = await Challenge.find({ createdBy: req.user._id });
    const challengeIds = companyChallenges.map(c => c._id);

    // Get submissions for company's challenges
    const submissions = await Submission.find({ challenge: { $in: challengeIds } })
      .populate('user', 'name email')
      .populate('challenge', 'title points difficulty')
      .sort({ submittedAt: -1 });

    // Calculate stats
    const pendingSubmissions = submissions.filter(s => 
      s.status === 'pending' || s.status === 'reviewing'
    );

    const reviewedSubmissions = submissions.filter(s => 
      s.status === 'accepted' || s.status === 'rejected'
    );

    // Format recent activity
    const recentActivity = submissions.slice(0, 5).map(submission => ({
      id: submission._id,
      type: 'submission',
      title: `New submission received`,
      challengeTitle: submission.challenge?.title,
      userName: submission.user?.name,
      date: submission.submittedAt,
      status: submission.status
    }));

    res.json({
      success: true,
      data: {
        totalChallenges: companyChallenges.length,
        totalSubmissions: submissions.length,
        pendingReviews: pendingSubmissions.length,
        completedReviews: reviewedSubmissions.length,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all submissions for a user (students only)
router.get('/submissions', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const submissions = await Submission.find({ user: req.user._id })
      .populate('challenge', 'title company points difficulty deadline')
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: submissions });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;