// backend/routes/submissions.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// Get all submissions for a challenge
router.get('/challenge/:challengeId', async (req, res) => {
  try {
    const submissions = await Submission.find({ challengeId: req.params.challengeId })
      .populate('userId', 'username email')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get submissions by user
router.get('/user/:userId', async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.params.userId })
      .populate('challengeId', 'title description')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending submissions for review
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find({ status: 'pending' })
      .populate('userId', 'username email')
      .populate('challengeId', 'title description')
      .sort({ submittedAt: 1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Review submission
router.put('/:id/review',authMiddleware, async (req, res) => {
  try {
    const { status, feedback, score } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        feedback, 
        score,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'username email')
     .populate('challengeId', 'title description');
    
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;