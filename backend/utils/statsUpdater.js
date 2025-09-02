// utils/statsUpdater.js
const User = require('../models/User');
const Submission = require('../models/Submission');

// Function to update user stats after submission status change
const updateUserStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.updateStats();
    
    // Check for new achievements
    await checkAndAwardAchievements(userId);
    
    return user;
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

// Function to update all user stats (can be run as a cron job)
const updateAllUserStats = async () => {
  try {
    const users = await User.find({ isActive: true });
    
    let updatedCount = 0;
    for (const user of users) {
      try {
        await user.updateStats();
        await checkAndAwardAchievements(user._id);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating stats for user ${user._id}:`, error);
      }
    }
    
    console.log(`Updated stats for ${updatedCount}/${users.length} users`);
    return updatedCount;
  } catch (error) {
    console.error('Error updating all user stats:', error);
    throw error;
  }
};

// Function to calculate and award achievements
const checkAndAwardAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    // Only students should get achievements from coding challenges
    if (user.role !== 'student') {
      return [];
    }

    const submissions = await Submission.find({ 
      user: userId, 
      status: 'approved' 
    }).populate('challenge');

    const newAchievements = [];
    const existingTitles = user.achievements.map(a => a.title);

    // First Challenge Achievement
    if (user.challengesCompleted >= 1 && !existingTitles.includes('First Steps')) {
      newAchievements.push({
        title: 'First Steps',
        description: 'Completed your first challenge'
      });
    }

    // Challenge Milestone Achievements
    const milestones = [
      { count: 5, title: 'Getting Started', desc: 'Completed 5 challenges' },
      { count: 10, title: 'Challenge Crusher', desc: 'Completed 10 challenges' },
      { count: 25, title: 'Code Warrior', desc: 'Completed 25 challenges' },
      { count: 50, title: 'Algorithm Master', desc: 'Completed 50 challenges' },
      { count: 100, title: 'Coding Legend', desc: 'Completed 100 challenges' }
    ];

    milestones.forEach(milestone => {
      if (user.challengesCompleted >= milestone.count && !existingTitles.includes(milestone.title)) {
        newAchievements.push({
          title: milestone.title,
          description: milestone.desc
        });
      }
    });

    // High Average Score Achievement
    if (user.averageScore >= 90 && user.challengesCompleted >= 5 && !existingTitles.includes('Excellence')) {
      newAchievements.push({
        title: 'Excellence',
        description: 'Maintained 90+ average score with 5+ challenges'
      });
    }

    // Perfect Score Achievement
    const perfectScores = submissions.filter(s => s.score === 100).length;
    if (perfectScores >= 3 && !existingTitles.includes('Perfectionist')) {
      newAchievements.push({
        title: 'Perfectionist',
        description: 'Achieved perfect scores on 3+ challenges'
      });
    }

    // Difficulty-based achievements
    const easyCount = submissions.filter(s => s.challenge?.difficulty === 'easy').length;
    const mediumCount = submissions.filter(s => s.challenge?.difficulty === 'medium').length;
    const hardCount = submissions.filter(s => s.challenge?.difficulty === 'hard').length;

    if (easyCount >= 10 && !existingTitles.includes('Easy Rider')) {
      newAchievements.push({
        title: 'Easy Rider',
        description: 'Completed 10 easy challenges'
      });
    }

    if (mediumCount >= 10 && !existingTitles.includes('Balanced Solver')) {
      newAchievements.push({
        title: 'Balanced Solver',
        description: 'Completed 10 medium challenges'
      });
    }

    if (hardCount >= 5 && !existingTitles.includes('Hard Core')) {
      newAchievements.push({
        title: 'Hard Core',
        description: 'Completed 5 hard challenges'
      });
    }

    // Streak achievements (if you have submission dates)
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 7);
    
    if (recentSubmissions.length >= 7 && !existingTitles.includes('Weekly Warrior')) {
      // Check if all 7 submissions are within last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentCount = recentSubmissions.filter(s => 
        new Date(s.submittedAt) >= sevenDaysAgo
      ).length;
      
      if (recentCount >= 7) {
        newAchievements.push({
          title: 'Weekly Warrior',
          description: 'Completed 7 challenges in one week'
        });
      }
    }

    // Points-based achievements
    const pointMilestones = [
      { points: 500, title: 'Point Collector', desc: 'Earned 500 points' },
      { points: 1000, title: 'Rising Star', desc: 'Earned 1,000 points' },
      { points: 2500, title: 'Code Master', desc: 'Earned 2,500 points' },
      { points: 5000, title: 'Elite Coder', desc: 'Earned 5,000 points' },
      { points: 10000, title: 'Legendary', desc: 'Earned 10,000 points' }
    ];

    pointMilestones.forEach(milestone => {
      if (user.totalPoints >= milestone.points && !existingTitles.includes(milestone.title)) {
        newAchievements.push({
          title: milestone.title,
          description: milestone.desc
        });
      }
    });

    // Add new achievements to user
    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements.map(ach => ({
        ...ach,
        earnedAt: new Date()
      })));
      await user.save();
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Function to recalculate leaderboard positions
const recalculateLeaderboard = async () => {
  try {
    // Update all user stats first
    await updateAllUserStats();
    
    // Get current leaderboard
    const users = await User.find({ isActive: true })
      .sort({ totalPoints: -1, challengesCompleted: -1, averageScore: -1 })
      .select('_id username totalPoints challengesCompleted averageScore');
    
    console.log('Leaderboard recalculated. Top 10:');
    users.slice(0, 10).forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - ${user.totalPoints} points`);
    });
    
    return users;
  } catch (error) {
    console.error('Error recalculating leaderboard:', error);
    throw error;
  }
};

// Function to get user statistics summary
const getUserStatsSummary = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const submissions = await Submission.find({ user: userId })
      .populate('challenge', 'difficulty');

    const approvedSubmissions = submissions.filter(s => s.status === 'approved');
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

    // Difficulty breakdown
    const difficultyStats = {
      easy: approvedSubmissions.filter(s => s.challenge?.difficulty === 'easy').length,
      medium: approvedSubmissions.filter(s => s.challenge?.difficulty === 'medium').length,
      hard: approvedSubmissions.filter(s => s.challenge?.difficulty === 'hard').length
    };

    // Score distribution
    const scores = approvedSubmissions.map(s => s.score).filter(s => s !== null);
    const scoreStats = {
      highest: scores.length > 0 ? Math.max(...scores) : 0,
      lowest: scores.length > 0 ? Math.min(...scores) : 0,
      average: user.averageScore,
      perfectScores: scores.filter(s => s === 100).length
    };

    // Recent activity
    const lastSubmission = submissions.length > 0 
      ? submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
      : null;

    return {
      user: {
        id: user._id,
        username: user.username,
        totalPoints: user.totalPoints,
        challengesCompleted: user.challengesCompleted,
        averageScore: user.averageScore,
        achievements: user.achievements
      },
      submissions: {
        total: submissions.length,
        approved: approvedSubmissions.length,
        pending: pendingSubmissions.length,
        rejected: rejectedSubmissions.length
      },
      difficulty: difficultyStats,
      scores: scoreStats,
      lastActivity: lastSubmission ? lastSubmission.submittedAt : user.createdAt
    };
  } catch (error) {
    console.error('Error getting user stats summary:', error);
    throw error;
  }
};

module.exports = {
  updateUserStats,
  updateAllUserStats,
  checkAndAwardAchievements,
  recalculateLeaderboard,
  getUserStatsSummary
};