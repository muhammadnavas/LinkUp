// routes/challenges.js
const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/authMiddleware');

// GET /api/challenges - Get all active challenges
router.get('/', async (req, res) => {
  try {
    const { difficulty, company, page = 1, limit = 10 } = req.query;
    
    // Only return challenges that are active and whose deadline is still in the future.
    const filter = { isActive: true, deadline: { $gt: new Date() } };
    
    if (difficulty) filter.difficulty = difficulty;
    if (company) filter.company = new RegExp(company, 'i');
    
    const challenges = await Challenge.find(filter)
      .populate('companyId', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Challenge.countDocuments(filter);

    res.json({
      success: true,
      data: challenges,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalChallenges: total
      }
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenges'
    });
  }
});

// GET /api/challenges/:id - Get specific challenge
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('companyId', 'username email');
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenge'
    });
  }
});

// POST /api/challenges - Create new challenge (company only)
router.post('/', protect, async (req, res) => {
  try {
    const { user } = req;
    
    if (user.role !== 'company') {
      return res.status(403).json({
        success: false,
        error: 'Only companies can create challenges'
      });
    }

    const {
      title,
      description,
      difficulty,
      points,
      tags,
      examples,
      deadline,
      requirements,
      submissionFormat,
      maxSubmissions
    } = req.body;

    // Validation
    if (!title || !description || !difficulty || !points || !deadline) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if deadline is in the future
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Deadline must be in the future'
      });
    }

    const challenge = new Challenge({
      title,
      description,
      company: user.companyName || user.name, // Use name as fallback
      companyId: user.id,
      difficulty,
      points,
      tags: tags || [],
      examples: examples || [],
      deadline,
      requirements,
      submissionFormat: submissionFormat || 'github',
      maxSubmissions: maxSubmissions || 1
    });

    await challenge.save();

    res.status(201).json({
      success: true,
      data: challenge,
      message: 'Challenge created successfully'
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create challenge'
    });
  }
});

// PUT /api/challenges/:id - Update challenge (company only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { user } = req;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    if (challenge.companyId.toString() !== user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own challenges'
      });
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedChallenge,
      message: 'Challenge updated successfully'
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update challenge'
    });
  }
});

// DELETE /api/challenges/:id - Delete challenge (company only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { user } = req;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    if (challenge.companyId.toString() !== user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own challenges'
      });
    }

    await Challenge.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete challenge'
    });
  }
});

// GET /api/challenges/:id/submissions - Get submissions for a challenge
// GET /api/challenges/:id/submissions - Get submissions for a challenge (company only)
router.get('/:id/submissions', protect, async (req, res) => {
  try {
    const { user } = req;
    const challengeId = req.params.id;

    // Get challenge details first
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Check if user owns the challenge or is admin
    const canView = (
      challenge.companyId?.toString() === user.id.toString() ||
      user.role === 'admin'
    );

    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'You can only view submissions for your own challenges'
      });
    }

    // Get submissions for this challenge
    const submissions = await Submission.find({ challenge: challengeId })
      .populate('user', 'username email role')
      .populate('reviewedBy', 'username')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: submissions,
      challenge: {
        _id: challenge._id,
        title: challenge.title,
        company: challenge.company,
        difficulty: challenge.difficulty,
        points: challenge.points,
        deadline: challenge.deadline
      }
    });
  } catch (error) {
    console.error('Error fetching challenge submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenge submissions'
    });
  }
});

module.exports = router;

