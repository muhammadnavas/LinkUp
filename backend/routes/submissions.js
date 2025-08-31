// routes/submissions.js
const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/submissions - Submit solution
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const { challengeId, solution, repoLink, codeSubmission } = req.body;

    if (!challengeId || !solution) {
      return res.status(400).json({
        success: false,
        error: 'Challenge ID and solution are required'
      });
    }

    // Get challenge details
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Check if challenge is still active
    if (!challenge.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Challenge is no longer active'
      });
    }

    // Check deadline
    if (new Date() > new Date(challenge.deadline)) {
      return res.status(400).json({
        success: false,
        error: 'Challenge deadline has passed'
      });
    }

    // Check if user already submitted
    const existingSubmission = await Submission.findOne({
      user: user._id,
      challenge: challengeId
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted a solution for this challenge'
      });
    }

    // Create submission
    const submission = new Submission({
      user: user._id,
      challenge: challengeId,
      solution,
      repoLink,
      codeSubmission,
      status: 'pending'
    });

    await submission.save();

    // Update challenge submission count
    await Challenge.findByIdAndUpdate(challengeId, {
      $inc: { submissionCount: 1 }
    });

    res.status(201).json({
      success: true,
      data: submission,
      message: 'Solution submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit solution'
    });
  }
});

// GET /api/submissions - Get user's submissions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    
    const submissions = await Submission.find({ user: user._id })
      .populate('challenge', 'title company difficulty points deadline')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions'
    });
  }
});

// GET /api/submissions/:id - Get specific submission
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'username email')
      .populate('challenge', 'title company difficulty points deadline')
      .populate('reviewedBy', 'username');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check access rights
    const canView = (
      submission.user._id.toString() === user._id.toString() ||
      submission.challenge.companyId?.toString() === user._id.toString() ||
      user.role === 'admin'
    );

    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission'
    });
  }
});

// PUT /api/submissions/:id/review - Review submission (company only)
router.put('/:id/review', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const { status, score, feedback } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate('challenge');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check if user owns the challenge
    if (submission.challenge.companyId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only review submissions for your own challenges'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either approved or rejected'
      });
    }

    // Update submission
    submission.status = status;
    submission.feedback = feedback || '';
    submission.reviewedAt = new Date();
    submission.reviewedBy = user._id;
    
    if (status === 'approved' && score !== undefined) {
      submission.score = Math.max(0, Math.min(100, score));
    }

    await submission.save();

    res.json({
      success: true,
      data: submission,
      message: 'Submission reviewed successfully'
    });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review submission'
    });
  }
});

module.exports = router;