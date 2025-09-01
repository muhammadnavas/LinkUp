// scripts/initializeLeaderboardFields.js
// Migration script to initialize leaderboard fields for existing users

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkup');

// Define a temporary user schema without strict validation
const tempUserSchema = new mongoose.Schema({}, { strict: false });
const TempUser = mongoose.model('TempUser', tempUserSchema, 'users');

async function initializeLeaderboardFields() {
  try {
    console.log('Starting leaderboard fields initialization...');
    
    // Find all users that might be missing leaderboard fields
    const users = await TempUser.find({});
    
    console.log(`Found ${users.length} users to update`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      const updateFields = {};
      
      // Initialize missing fields with default values
      if (user.totalPoints === undefined) updateFields.totalPoints = 0;
      if (user.challengesCompleted === undefined) updateFields.challengesCompleted = 0;
      if (user.averageScore === undefined) updateFields.averageScore = 0;
      if (user.achievements === undefined) updateFields.achievements = [];
      if (user.challengesCreated === undefined) updateFields.challengesCreated = 0;
      if (user.submissionsReviewed === undefined) updateFields.submissionsReviewed = 0;
      if (user.companyPoints === undefined) updateFields.companyPoints = 0;
      if (user.totalUsers === undefined) updateFields.totalUsers = 0;
      if (user.location === undefined) updateFields.location = '';
      if (user.githubProfile === undefined) updateFields.githubProfile = '';
      if (user.linkedinProfile === undefined) updateFields.linkedinProfile = '';
      if (user.lastActiveAt === undefined) updateFields.lastActiveAt = user.createdAt || new Date();
      
      // Only update if there are fields to update
      if (Object.keys(updateFields).length > 0) {
        await TempUser.updateOne(
          { _id: user._id },
          { $set: updateFields }
        );
        
        console.log(`Updated user ${user._id} (${user.email || user.name}) with fields:`, Object.keys(updateFields));
      } else {
        console.log(`User ${user._id} already has all required fields`);
      }
    }
    
    console.log('Leaderboard fields initialization completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the migration
initializeLeaderboardFields();
