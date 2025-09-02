// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true,
//     maxLength: [100, 'Name cannot exceed 100 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minLength: [6, 'Password must be at least 6 characters'],
//     select: false // Don't include password in queries by default
//   },
//   role: {
//     type: String,
//     required: [true, 'Role is required'],
//     enum: ['student', 'company'],
//     lowercase: true
//   },
  
//   // Student-specific fields
//   university: {
//     type: String,
//     required: function() {
//       return this.role === 'student';
//     },
//     trim: true
//   },
//   major: {
//     type: String,
//     required: function() {
//       return this.role === 'student';
//     },
//     trim: true
//   },
//   graduationYear: {
//     type: Number,
//     required: function() {
//       return this.role === 'student';
//     },
//     min: [2024, 'Graduation year must be 2024 or later'],
//     max: [2030, 'Graduation year cannot exceed 2030']
//   },
//   skills: [{
//     type: String,
//     trim: true
//   }],
  
//   // Company-specific fields
//   companyName: {
//     type: String,
//     required: function() {
//       return this.role === 'company';
//     },
//     trim: true
//   },
//   industry: {
//     type: String,
//     required: function() {
//       return this.role === 'company';
//     },
//     trim: true
//   },
//   website: {
//     type: String,
//     trim: true,
//     match: [/^https?:\/\/.+/, 'Please enter a valid URL']
//   },
//   companySize: {
//     type: String,
//     enum: ['1-10', '11-50', '51-200', '201-500', '500+']
//   },
  
//   // Common fields
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   profilePicture: {
//     type: String,
//     default: null
//   },
//   bio: {
//     type: String,
//     maxLength: [500, 'Bio cannot exceed 500 characters']
//   },
  
//   // Timestamps
//   lastLogin: {
//     type: Date,
//     default: null
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true, // Automatically manage createdAt and updatedAt
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Indexes for better performance
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });
// userSchema.index({ createdAt: -1 });

// // Virtual for full profile based on role
// userSchema.virtual('profile').get(function() {
//   const baseProfile = {
//     id: this._id,
//     name: this.name,
//     email: this.email,
//     role: this.role,
//     isVerified: this.isVerified,
//     profilePicture: this.profilePicture,
//     bio: this.bio,
//     createdAt: this.createdAt
//   };

//   if (this.role === 'student') {
//     return {
//       ...baseProfile,
//       university: this.university,
//       major: this.major,
//       graduationYear: this.graduationYear,
//       skills: this.skills
//     };
//   } else {
//     return {
//       ...baseProfile,
//       companyName: this.companyName,
//       industry: this.industry,
//       website: this.website,
//       companySize: this.companySize
//     };
//   }
// });

// // Pre-save middleware to hash password
// userSchema.pre('save', async function(next) {
//   // Only hash password if it's modified
//   if (!this.isModified('password')) return next();
  
//   try {
//     // Hash password with cost of 12
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Pre-save middleware to update updatedAt
// userSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// // Instance method to compare passwords
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password);
//   } catch (error) {
//     throw error;
//   }
// };

// // Instance method to get public profile
// userSchema.methods.getPublicProfile = function() {
//   return this.profile;
// };

// // Instance method to update last login
// userSchema.methods.updateLastLogin = async function() {
//   this.lastLogin = new Date();
//   return this.save();
// };

// // Static method to find by email
// userSchema.statics.findByEmail = function(email) {
//   return this.findOne({ email: email.toLowerCase() });
// };

// // Static method to get users by role
// userSchema.statics.findByRole = function(role) {
//   return this.find({ role, isActive: true });
// };

// const User = mongoose.model('User', userSchema);

// module.exports = User;

// models/User.js (Updated to add leaderboard fields)
// models/User.js (Updated to add leaderboard fields)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['student', 'company'],
    lowercase: true
  },
  
  // Student-specific fields
  university: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    trim: true
  },
  major: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    trim: true
  },
  graduationYear: {
    type: Number,
    required: function() {
      return this.role === 'student';
    },
    min: [2024, 'Graduation year must be 2024 or later'],
    max: [2030, 'Graduation year cannot exceed 2030']
  },
  skills: [{
    type: String,
    trim: true
  }],
  
  // Company-specific fields
  companyName: {
    type: String,
    required: function() {
      return this.role === 'company';
    },
    trim: true
  },
  industry: {
    type: String,
    required: function() {
      return this.role === 'company';
    },
    trim: true
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+']
  },
  
  // Profile fields for frontend compatibility
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  githubProfile: {
    type: String,
    default: ''
  },
  linkedinProfile: {
    type: String,
    default: ''
  },
  
  // Gamification and leaderboard fields
  totalPoints: {
    type: Number,
    default: 0
  },
  challengesCompleted: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  achievements: [{
    title: String,
    description: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  
  // Company specific leaderboard fields
  challengesCreated: {
    type: Number,
    default: 0
  },
  submissionsReviewed: {
    type: Number,
    default: 0
  },
  companyPoints: {
    type: Number,
    default: 0
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  
  // Common fields
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and leaderboard
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ totalPoints: -1, challengesCompleted: -1 });
userSchema.index({ role: 1, totalPoints: -1 });
userSchema.index({ createdAt: -1 });

// Virtual for full profile based on role
userSchema.virtual('profile').get(function() {
  const baseProfile = {
    id: this._id,
    _id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    role: this.role,
    isVerified: this.isVerified,
    profilePicture: this.profilePicture,
    bio: this.bio,
    location: this.location,
    website: this.website,
    githubProfile: this.githubProfile,
    linkedinProfile: this.linkedinProfile,
    totalPoints: this.totalPoints,
    challengesCompleted: this.challengesCompleted,
    averageScore: this.averageScore,
    achievements: this.achievements,
    createdAt: this.createdAt,
    lastActiveAt: this.lastActiveAt
  };

  if (this.role === 'student') {
    return {
      ...baseProfile,
      university: this.university,
      major: this.major,
      graduationYear: this.graduationYear,
      skills: this.skills
    };
  } else {
    return {
      ...baseProfile,
      companyName: this.companyName,
      industry: this.industry,
      companySize: this.companySize,
      challengesCreated: this.challengesCreated,
      submissionsReviewed: this.submissionsReviewed,
      companyPoints: this.companyPoints,
      totalUsers: this.totalUsers
    };
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isModified() && !this.isNew) {
    this.lastActiveAt = Date.now();
  }
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  return this.profile;
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  return await this.constructor.findByIdAndUpdate(
    this._id, 
    { 
      lastLogin: new Date(),
      lastActiveAt: new Date() 
    },
    { new: true }
  );
};

// Method to update user stats based on submissions
userSchema.methods.updateStats = async function () {
  // Only students should earn points from submissions
  if (this.role !== 'student') {
    return this.save();
  }

  const Submission = require('./Submission');
  const submissions = await Submission.find({ user: this._id, status: 'approved' });

  this.challengesCompleted = submissions.length;
  this.totalPoints = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
  this.averageScore = submissions.length
    ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length)
    : 0;

  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username });
};

// Static method to get users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = async function(timeframe = 'all', limit = 100) {
  let dateFilter = {};
  
  if (timeframe === 'weekly') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    dateFilter.lastActiveAt = { $gte: oneWeekAgo };
  } else if (timeframe === 'monthly') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    dateFilter.lastActiveAt = { $gte: oneMonthAgo };
  }
  
  return this.find({
    isActive: true,
    totalPoints: { $gt: 0 },
    ...dateFilter
  })
  .sort({ totalPoints: -1, challengesCompleted: -1, averageScore: -1 })
  .limit(limit)
  .select('-password')
  .lean();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
