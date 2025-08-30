// routes/submissions.js
const express = require("express");
const Submission = require("../models/Submission");
const Challenge = require("../models/Challenge");
const Activity = require("../models/Activity");
const emailService = require("../utils/emailService");
const { authMiddleware } = require("../middleware/authMiddleware");
const { validateSubmission, handleValidationErrors } = require("../utils/validators");

const router = express.Router();

// Submit solution
router.post(
  "/:challengeId",
  authMiddleware,
  ...validateSubmission, // spread array of validators
  handleValidationErrors,
  async (req, res) => {
    try {
      const { challengeId } = req.params;
      const { code } = req.body;

      // Check if challenge exists and is active
      const challenge = await Challenge.findOne({
        _id: challengeId,
        isActive: true,
      });

      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }

      // Check deadline
      if (challenge.deadline && new Date() > challenge.deadline) {
        return res.status(400).json({ error: "Challenge deadline has passed" });
      }

      // Check if user already submitted
      const existingSubmission = await Submission.findOne({
        challenge: challengeId,
        user: req.user._id,
      });

      if (existingSubmission) {
        return res.status(400).json({ error: "You have already submitted a solution for this challenge" });
      }

      // Create submission
      const submission = new Submission({
        challenge: challengeId,
        user: req.user._id,
        code,
      });
      await submission.save();

      // Create activity
      const activity = new Activity({
        user: req.user._id,
        type: "submission",
        title: `Submitted solution for ${challenge.title}`,
        metadata: {
          challengeId: challenge._id,
          submissionId: submission._id,
          company: challenge.company,
        },
      });
      await activity.save();

      // Send confirmation email
      await emailService.sendSubmissionConfirmation(req.user, challenge);

      res.status(201).json({
        message: "Solution submitted successfully",
        submissionId: submission._id,
      });
    } catch (error) {
      console.error("Submission error:", error);
      res.status(500).json({ error: "Failed to submit solution" });
    }
  }
);

// Get user submissions
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const submissions = await Submission.find(filter)
      .populate("challenge", "title company points difficulty")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(filter);

    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Get specific submission
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("challenge", "title company points difficulty")
      .populate("reviewedBy", "name");

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});


// Add this route to submissions.js
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const submission = await Submission.findById(id)
      .populate('challenge', 'createdBy');

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    // Check if the company owns this challenge
    if (submission.challenge.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    submission.status = status;
    submission.reviewedAt = new Date();
    submission.reviewedBy = req.user._id;
    
    await submission.save();

    res.json({ success: true, data: submission });

  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Add this route to submissions.js
router.get('/company', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
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

    res.json({ success: true, data: submissions });

  } catch (error) {
    console.error('Error fetching company submissions:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
