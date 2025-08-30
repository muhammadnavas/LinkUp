const express = require("express");
const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");
const { authMiddleware } = require("../middleware/authMiddleware");
const { validateSubmission, handleValidationErrors } = require("../utils/validators");

const router = express.Router();

// Get all challenges
router.get("/", authMiddleware, async (req, res) => {
  try {
    const challenges = await Challenge.find({ isActive: true })
      .select('title company description difficulty points deadline timeLimit tags')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: challenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get specific challenge by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const challenge = await Challenge.findById(id)
      .populate('createdBy', 'name email');
    
    if (!challenge) {
      return res.status(404).json({ success: false, error: "Challenge not found" });
    }

    if (!challenge.isActive) {
      return res.status(403).json({ success: false, error: "Challenge is no longer active" });
    }

    res.json({ success: true, data: challenge });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: "Invalid challenge ID format" });
    }
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Submit solution to a challenge
router.post(
  "/:challengeId/submit",
  authMiddleware,
  validateSubmission,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { challengeId } = req.params;
      const { solution } = req.body; // Changed from 'code' to 'solution' to match frontend

      const challenge = await Challenge.findById(challengeId);
      if (!challenge) {
        return res.status(404).json({ success: false, error: "Challenge not found" });
      }

      if (!challenge.isActive) {
        return res.status(403).json({ success: false, error: "Challenge is no longer active" });
      }

      // Check if deadline has passed
      if (new Date() > new Date(challenge.deadline)) {
        return res.status(403).json({ success: false, error: "Challenge deadline has passed" });
      }

      // Check if user has already submitted for this challenge
      const existingSubmission = await Submission.findOne({
        user: req.user._id,
        challenge: challengeId
      });

      if (existingSubmission) {
        return res.status(409).json({ 
          success: false, 
          error: "You have already submitted a solution for this challenge" 
        });
      }

      const submission = new Submission({
        user: req.user._id,
        challenge: challengeId,
        code: solution, // Store solution in code field
        submittedAt: new Date(),
        status: 'pending'
      });

      await submission.save();
      res.json({ success: true, data: submission });
    } catch (error) {
      console.error("Error submitting solution:", error);
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, error: "Invalid challenge ID format" });
      }
      res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

// Get user's submissions for a specific challenge
router.get("/:challengeId/submissions", authMiddleware, async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    const submissions = await Submission.find({
      user: req.user._id,
      challenge: challengeId
    }).populate('challenge', 'title company');

    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;