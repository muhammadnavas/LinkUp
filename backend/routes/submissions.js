// routes/submissions.js - Corrected version
const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const { protect, authorize } = require('../middleware/authMiddleware');
const { reviewSubmission, getSubmissionForReview, getCompanySubmissions } = require('../controllers/submissions');

// POST /api/submissions - Submit solution
router.post('/', protect, async (req, res) => {
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
      user: user.id,
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
      user: user.id,
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
router.get('/', protect, async (req, res) => {
  try {
    const { user } = req;
    
    const submissions = await Submission.find({ user: user.id })
      .populate('challenge', 'title company difficulty points deadline')
      .populate('reviewedBy', 'username')
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

// GET /api/submissions/company-reviews - Get company submissions for review
router.get('/company-reviews', protect, authorize('company'), getCompanySubmissions);

// GET /api/submissions/:id - Get specific submission
router.get('/:id', protect, async (req, res) => {
  try {
    const { user } = req;
    
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'username email')
      .populate('challenge', 'title company difficulty points deadline companyId')
      .populate('reviewedBy', 'username');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check access rights
    const canView = (
      submission.user._id.toString() === user.id.toString() ||
      submission.challenge.companyId?.toString() === user.id.toString() ||
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

// GET /api/submissions/:id/review - Get submission for review (company only)
router.get('/:id/review', protect, authorize('company'), getSubmissionForReview);

// PUT /api/submissions/:id/review - Review submission (company only)
router.put('/:id/review', protect, authorize('company'), reviewSubmission);

module.exports = router;