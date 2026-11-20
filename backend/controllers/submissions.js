const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Review a submission (for companies)
// @route   PUT /api/submissions/:id/review
// @access  Private (Company only)
const reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, score, feedback } = req.body;
    const { user } = req;

    // Validate input
    if (!status || !['reviewing', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status (reviewing, approved or rejected) is required'
      });
    }

    if (status === 'approved') {
      if (score === undefined || score === null || score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          error: 'Score between 0-100 is required for approved submissions'
        });
      }
      // Ensure score is a number
      const parsedScore = parseInt(score);
      if (isNaN(parsedScore)) {
        return res.status(400).json({
          success: false,
          error: 'Score must be a valid number'
        });
      }
    }

    // Find the submission
    const submission = await Submission.findById(id)
      .populate('user', 'username email name totalPoints challengesCompleted')
      .populate('challenge', 'title company companyId points difficulty');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check if the user owns the challenge (company authorization)
    if (submission.challenge.companyId.toString() !== user.id.toString() && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You can only review submissions for your own challenges'
      });
    }

    // Check if already reviewed
    if (submission.status === 'approved' || submission.status === 'rejected') {
      return res.status(400).json({
        success: false,
        error: 'This submission has already been reviewed'
      });
    }

    // Update submission
    submission.status = status;
    submission.score = status === 'approved' ? parseInt(score) : null;
    submission.feedback = feedback || '';
    submission.reviewedBy = user.id;
    submission.reviewedAt = status === 'reviewing' ? null : new Date();

    await submission.save();

    console.log(`Submission ${submission._id} updated: Status=${status}, Score=${submission.score}`);


    // Update user stats if approved
    if (status === 'approved') {
      let studentUser = await User.findById(submission.user._id);
      if (studentUser) {
        // Update all user stats by recalculating from all approved submissions
        await studentUser.updateStats();
        
        // Reload to get the updated values
        studentUser = await User.findById(studentUser._id);
        
        // Points earned for this specific submission is just the score (0-100)
        const pointsEarned = score;
        
        console.log(`Review approved: Score ${score}/100 for "${submission.challenge.title}"`);
        console.log(`Points earned this submission: ${pointsEarned} points`);
        console.log(`Student total points: ${studentUser.totalPoints}, Challenges completed: ${studentUser.challengesCompleted}`);
        
        // Create activity record with actual points earned
        try {
          const activity = new Activity({
            user: studentUser._id,
            action: `Solution approved for "${submission.challenge.title}" - Earned ${pointsEarned} points with score ${score}/100`,
            target: 'Challenge'
          });
          await activity.save();
        } catch (activityError) {
          console.error('Error creating activity:', activityError);
          // Don't fail the whole request if activity creation fails
        }
      }
    } else if (status === 'rejected') {
      // Create activity for rejection
      try {
        const activity = new Activity({
          user: submission.user._id,
          action: `Solution rejected for "${submission.challenge.title}" - ${feedback || 'Needs improvement'}`,
          target: 'Challenge'
        });
        await activity.save();
      } catch (activityError) {
        console.error('Error creating activity:', activityError);
      }
    }

    // Update company stats
    try {
      const companyUser = await User.findById(user.id);
      if (companyUser && status !== 'reviewing') {
        companyUser.submissionsReviewed = (companyUser.submissionsReviewed || 0) + 1;
        if (status === 'approved') {
          companyUser.companyPoints = (companyUser.companyPoints || 0) + 10; // Company gets points for reviewing
        }
        await companyUser.save();
      }
    } catch (companyStatsError) {
      console.error('Error updating company stats:', companyStatsError);
    }

    // Return the updated submission with populated data
    const updatedSubmission = await Submission.findById(id)
      .populate('user', 'username email name')
      .populate('challenge', 'title company points difficulty')
      .populate('reviewedBy', 'username name');

    res.json({
      success: true,
      message: `Submission ${status} successfully`,
      data: updatedSubmission
    });

  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while reviewing submission'
    });
  }
};

// @desc    Get submission details for review
// @route   GET /api/submissions/:id/review
// @access  Private (Company only)
const getSubmissionForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const submission = await Submission.findById(id)
      .populate('user', 'username email name university major graduationYear')
      .populate('challenge', 'title description company companyId points difficulty requirements examples')
      .populate('reviewedBy', 'username name');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check authorization
    if (submission.challenge.companyId?.toString() !== user.id.toString() && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You can only view submissions for your own challenges'
      });
    }

    // The first authorized company view permanently locks student edits.
    if (!submission.viewedAt) {
      await Submission.updateOne(
        { _id: submission._id, viewedAt: null },
        { $set: { viewedAt: new Date(), viewedBy: user.id } }
      );
    }

    const viewedSubmission = await Submission.findById(submission._id)
      .populate('user', 'username email name university major graduationYear')
      .populate('challenge', 'title description company companyId points difficulty requirements examples')
      .populate('reviewedBy', 'username name')
      .populate('viewedBy', 'username name');

    res.json({
      success: true,
      data: viewedSubmission
    });

  } catch (error) {
    console.error('Get submission for review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching submission'
    });
  }
};

// @desc    Get all submissions for a company to review
// @route   GET /api/submissions/company-reviews
// @access  Private (Company only)
const getCompanySubmissions = async (req, res) => {
  try {
    const { user } = req;
    const { status = 'all', page = 1, limit = 20 } = req.query;

    // Get challenges created by this company
    const challenges = await Challenge.find({ companyId: user.id });
    const challengeIds = challenges.map(c => c._id);

    if (challengeIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalSubmissions: 0
        }
      });
    }

    // Build filter
    let filter = { challenge: { $in: challengeIds } };
    if (status !== 'all') {
      filter.status = status;
    }

    // Get submissions with pagination
    const submissions = await Submission.find(filter)
      .populate('user', 'username email name university major')
      .populate('challenge', 'title company points difficulty')
      .populate('reviewedBy', 'username name')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments(filter);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSubmissions: total
      }
    });

  } catch (error) {
    console.error('Get company submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching submissions'
    });
  }
};

module.exports = {
  reviewSubmission,
  getSubmissionForReview,
  getCompanySubmissions
};