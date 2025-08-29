const express = require("express");
const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");
const { authMiddleware } = require("../middleware/authMiddleware");
const { validateSubmission, handleValidationErrors } = require("../utils/validators");

const router = express.Router();

// Get all challenges
router.get("/", authMiddleware, async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json({ success: true, challenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
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
      const { code } = req.body;

      const challenge = await Challenge.findById(challengeId);
      if (!challenge) {
        return res.status(404).json({ success: false, error: "Challenge not found" });
      }

      const submission = new Submission({
        user: req.user._id,
        challenge: challengeId,
        code,
        createdAt: new Date(),
      });

      await submission.save();
      res.json({ success: true, submission });
    } catch (error) {
      console.error("Error submitting solution:", error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

module.exports = router;
