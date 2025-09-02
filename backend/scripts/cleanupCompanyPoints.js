// scripts/cleanupCompanyPoints.js
// Script to remove points from company users and reset their stats

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkup');

// Define a temporary user schema without strict validation
const tempUserSchema = new mongoose.Schema({}, { strict: false });
const TempUser = mongoose.model('TempUser', tempUserSchema, 'users');

async function cleanupCompanyPoints() {
  try {
    console.log('Starting company points cleanup...');
    
    // Find all company users
    const companyUsers = await TempUser.find({ role: 'company' });
    
    console.log(`Found ${companyUsers.length} company users to update`);

    for (let i = 0; i < companyUsers.length; i++) {
      const user = companyUsers[i];
      
      const updateFields = {
        totalPoints: 0,
        challengesCompleted: 0,
        averageScore: 0,
        achievements: []
      };
      
      await TempUser.updateOne(
        { _id: user._id },
        { $set: updateFields }
      );
      
      console.log(`Updated company user ${user._id} (${user.email || user.username}) - reset points and achievements`);
    }
    
    console.log('Company points cleanup completed successfully!');
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the cleanup
cleanupCompanyPoints();
