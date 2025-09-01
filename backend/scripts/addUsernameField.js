// scripts/addUsernameField.js
// Migration script to add username field to existing users

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkup');

// Define a temporary user schema without strict validation
const tempUserSchema = new mongoose.Schema({}, { strict: false });
const TempUser = mongoose.model('TempUser', tempUserSchema, 'users');

async function addUsernames() {
  try {
    console.log('Starting username migration...');
    
    // Find all users without username field
    const usersWithoutUsername = await TempUser.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' }
      ]
    });

    console.log(`Found ${usersWithoutUsername.length} users without usernames`);

    for (let i = 0; i < usersWithoutUsername.length; i++) {
      const user = usersWithoutUsername[i];
      
      // Generate username from email or name
      let username = '';
      if (user.email) {
        username = user.email.split('@')[0];
      } else if (user.name) {
        username = user.name.toLowerCase().replace(/\s+/g, '');
      } else {
        username = `user${Date.now()}${i}`;
      }
      
      // Ensure username is unique
      let uniqueUsername = username;
      let counter = 1;
      while (await TempUser.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }
      
      // Update the user
      await TempUser.updateOne(
        { _id: user._id },
        { $set: { username: uniqueUsername } }
      );
      
      console.log(`Updated user ${user._id} with username: ${uniqueUsername}`);
    }
    
    console.log('Username migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the migration
addUsernames();
